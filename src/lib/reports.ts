import { TestCase, Defect, RiskLevel } from "@/types/test-case";
import { TestRun } from "@/types/test-run";
import { Release, resolveChecklist, evaluateAutoChecklist } from "@/types/release";
import { Requirement } from "@/types/requirement";
import { ReportType } from "@/types/report";

// Rosabon QA Framework §25 - report generators. Each produces an audit-ready
// text report from live project data.

export interface ReportData {
  projectName: string;
  shortCode: string;
  testCases: TestCase[];
  defects: Defect[];
  requirements: Requirement[];
  runs: TestRun[];
  releases: Release[];
}

const RISK_ORDER: RiskLevel[] = ["critical", "high", "medium", "low"];
// Risk weights used for the risk-weighted coverage score.
const RISK_WEIGHT: Record<RiskLevel, number> = {
  critical: 8,
  high: 4,
  medium: 2,
  low: 1,
};

function header(title: string, data: ReportData): string {
  return `${data.projectName.toUpperCase()} — ${title}
Generated: ${new Date().toLocaleString()}
Project Code: ${data.shortCode}
${"=".repeat(52)}
`;
}

function pct(n: number, d: number): string {
  return d > 0 ? `${Math.round((n / d) * 100)}%` : "0%";
}

function pad(label: string, width = 26): string {
  return label.length >= width ? label : label + " ".repeat(width - label.length);
}

// 1. Test Execution Report
function testExecutionReport(data: ReportData): string {
  const tc = data.testCases;
  const passed = tc.filter((t) => t.status === "pass").length;
  const failed = tc.filter((t) => t.status === "fail").length;
  const pending = tc.filter((t) => t.status === "pending").length;
  const blocked = tc.filter((t) => t.status === "blocked").length;

  const modules = [...new Set(tc.map((t) => t.module))];
  const moduleLines = modules
    .map((m) => {
      const cases = tc.filter((t) => t.module === m);
      const p = cases.filter((c) => c.status === "pass").length;
      return `  ${pad(m)} ${p}/${cases.length} pass (${pct(p, cases.length)})`;
    })
    .join("\n");

  const riskLines = RISK_ORDER.map((r) => {
    const cases = tc.filter((t) => t.riskLevel === r);
    if (cases.length === 0) return null;
    const p = cases.filter((c) => c.status === "pass").length;
    return `  ${pad(r.toUpperCase())} ${p}/${cases.length} pass (${pct(p, cases.length)})`;
  })
    .filter(Boolean)
    .join("\n");

  return `${header("Test Execution Report", data)}
OVERALL
-------
Total Test Cases: ${tc.length}
Passed:  ${passed}
Failed:  ${failed}
Pending: ${pending}
Blocked: ${blocked}
Pass Rate: ${pct(passed, tc.length)}

BY MODULE
---------
${moduleLines || "  (no modules)"}

BY RISK LEVEL
-------------
${riskLines || "  (no risk classification set)"}
`;
}

// 2. Defect Report
function defectReport(data: ReportData): string {
  const df = data.defects;
  const bySeverity = RISK_ORDER.map(
    (s) => `  ${pad(s.toUpperCase())} ${df.filter((d) => d.severity === s).length}`,
  ).join("\n");

  const statuses = ["open", "in-progress", "resolved", "closed"];
  const byStatus = statuses
    .map((s) => `  ${pad(s)} ${df.filter((d) => d.status === s).length}`)
    .join("\n");

  const openCritical = df.filter(
    (d) =>
      d.severity === "critical" &&
      (d.status === "open" || d.status === "in-progress"),
  ).length;

  // Mean resolution time (days) for defects with a resolution date.
  const resolved = df.filter((d) => d.resolutionDate && d.createdAt);
  const avgDays =
    resolved.length > 0
      ? (
          resolved.reduce((sum, d) => {
            const ms =
              new Date(d.resolutionDate as Date).getTime() -
              new Date(d.createdAt).getTime();
            return sum + ms / (1000 * 60 * 60 * 24);
          }, 0) / resolved.length
        ).toFixed(1)
      : "—";

  return `${header("Defect Report", data)}
SUMMARY
-------
Total Defects: ${df.length}
Open Critical: ${openCritical}${openCritical > 0 ? "  ⚠ RELEASE BLOCKER" : ""}
Mean Resolution Time: ${avgDays} days

BY SEVERITY
-----------
${bySeverity}

BY STATUS
---------
${byStatus}
`;
}

// 3. Regression Report
function regressionReport(data: ReportData): string {
  const regs = data.runs
    .filter((r) => r.type === "regression" && r.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.completedAt || b.startedAt).getTime() -
        new Date(a.completedAt || a.startedAt).getTime(),
    );

  if (regs.length === 0) {
    return `${header("Regression Report", data)}
No completed regression runs yet. Start a regression run from the Test Runs
page to populate this report.
`;
  }

  const latest = regs[0];
  const previous = regs[1];
  let comparison = "  (no previous regression run to compare against)";
  let newlyFailing = "";

  if (previous) {
    const delta = latest.passRate - previous.passRate;
    comparison = `  Previous: ${previous.passRate}% (${previous.name})
  Latest:   ${latest.passRate}% (${latest.name})
  Change:   ${delta >= 0 ? "+" : ""}${delta}%`;

    const prevMap = new Map(previous.results.map((r) => [r.caseKey, r.status]));
    const regressions = latest.results.filter(
      (r) => r.status === "fail" && prevMap.get(r.caseKey) === "pass",
    );
    if (regressions.length > 0) {
      newlyFailing = `

NEWLY FAILING (regressions)
---------------------------
${regressions.map((r) => `  ${pad(r.testCaseId, 12)} ${r.scenario}`).join("\n")}`;
    }
  }

  return `${header("Regression Report", data)}
LATEST REGRESSION CYCLE
-----------------------
Name: ${latest.name}
Environment: ${latest.environment}
Result: ${latest.passed}/${latest.total} pass (${latest.passRate}%), ${latest.failed} failed

TREND
-----
${comparison}${newlyFailing}
`;
}

// 4. Release Readiness Report
function releaseReadinessReport(data: ReportData): string {
  const releases = [...data.releases].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (releases.length === 0) {
    return `${header("Release Readiness Report", data)}
No releases planned yet. Create a release from the Release Readiness page.
`;
  }
  const auto = evaluateAutoChecklist(data.runs, data.defects);
  const rel = releases[0];
  const checklist = resolveChecklist(rel.checklist, auto);
  const done = checklist.filter((i) => i.done).length;
  const ready = checklist.every((i) => i.done);

  const checklistLines = checklist
    .map((i) => `  [${i.done ? "x" : " "}] ${i.label}${i.auto ? "  (auto)" : ""}`)
    .join("\n");
  const signOffLines =
    rel.signOffs.length > 0
      ? rel.signOffs
          .map((s) => `  ✓ ${pad(s.name, 20)} ${s.role}`)
          .join("\n")
      : "  (none)";

  return `${header("Release Readiness Report", data)}
RELEASE ${rel.version} — ${rel.status.toUpperCase()}
${"-".repeat(40)}
Readiness: ${done}/${checklist.length} checks complete — ${ready ? "READY ✅" : "NOT READY ⛔"}

MANDATORY CHECKLIST (§24)
-------------------------
${checklistLines}

SIGN-OFFS (§20)
---------------
${signOffLines}
`;
}

// 5. Risk Assessment Report
function riskAssessmentReport(data: ReportData): string {
  const tc = data.testCases;

  const riskLines = RISK_ORDER.map((r) => {
    const cases = tc.filter((t) => t.riskLevel === r);
    const p = cases.filter((c) => c.status === "pass").length;
    return `  ${pad(r.toUpperCase())} ${cases.length} cases, ${pct(p, cases.length)} pass`;
  }).join("\n");

  // Risk-weighted coverage score: weight each case's pass by its risk weight.
  let weightSum = 0;
  let weightedPass = 0;
  tc.forEach((t) => {
    const w = t.riskLevel ? RISK_WEIGHT[t.riskLevel] : 1;
    weightSum += w;
    if (t.status === "pass") weightedPass += w;
  });
  const weightedScore =
    weightSum > 0 ? Math.round((weightedPass / weightSum) * 100) : 0;

  // Critical modules that are not fully passing (highest attention).
  const criticalCases = tc.filter((t) => t.riskLevel === "critical");
  const criticalModules = [...new Set(criticalCases.map((c) => c.module))];
  const atRisk = criticalModules
    .map((m) => {
      const cases = criticalCases.filter((c) => c.module === m);
      const p = cases.filter((c) => c.status === "pass").length;
      return { m, p, total: cases.length };
    })
    .filter((x) => x.p < x.total);

  const atRiskLines =
    atRisk.length > 0
      ? atRisk
          .map((x) => `  ⚠ ${pad(x.m)} ${x.p}/${x.total} pass (${pct(x.p, x.total)})`)
          .join("\n")
      : "  ✅ All critical modules fully passing";

  // Requirement coverage.
  const totalReq = data.requirements.length;
  const covered = data.requirements.filter((req) =>
    tc.some((t) => t.requirementIds?.includes(req.id)),
  ).length;

  return `${header("Risk Assessment Report", data)}
RISK-WEIGHTED COVERAGE SCORE: ${weightedScore}%
(critical failures penalised most heavily)

PASS RATE BY RISK LEVEL
-----------------------
${riskLines}

CRITICAL MODULES NEEDING ATTENTION
----------------------------------
${atRiskLines}

REQUIREMENT COVERAGE (§28)
--------------------------
  ${covered}/${totalReq} requirements covered (${pct(covered, totalReq)})
`;
}

export function generateReport(type: ReportType, data: ReportData): string {
  switch (type) {
    case "test-execution":
      return testExecutionReport(data);
    case "defect":
      return defectReport(data);
    case "regression":
      return regressionReport(data);
    case "release-readiness":
      return releaseReadinessReport(data);
    case "risk-assessment":
      return riskAssessmentReport(data);
    default:
      return "Unknown report type";
  }
}
