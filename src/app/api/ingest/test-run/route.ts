import { NextRequest, NextResponse } from "next/server";
import {
  readProjectData,
  writeProjectData,
  isServerStoreEnabled,
  projectExists,
  SERVER_KEYS,
} from "@/lib/serverStore";
import { requireApiToken } from "@/lib/apiAuth";
import { MAX_RESULTS, MAX_STORED_RUNS } from "@/lib/ingest";
import {
  TestRun,
  TestRunResult,
  TestRunType,
  computeRunStats,
} from "@/types/test-run";
import { TestStatus, EnvironmentType } from "@/types/test-case";
import { AuditEntry } from "@/types/audit";

// Rosabon QA Framework §23 - CI/CD test result ingestion (G11).
// Accepts automated results (Playwright / Maestro / Postman / GitHub Actions)
// and records them as a completed TestRun so automated cycles feed the same
// history, trends and release gate as manual runs.
//
// Auth: send header `x-api-token: <INGEST_API_TOKEN>`.
// Body: { projectId, name?, type?, environment?, results: [{ testCaseId, status, module?, scenario? }] }

const VALID_STATUS: TestStatus[] = ["pass", "fail", "pending", "blocked"];
const VALID_TYPE: TestRunType[] = ["smoke", "regression", "full", "uat"];
const VALID_ENV: EnvironmentType[] = ["dev", "staging", "production"];

interface IncomingResult {
  testCaseId?: string;
  caseKey?: string;
  module?: string;
  scenario?: string;
  status?: string;
}

export async function POST(request: NextRequest) {
  const denied = requireApiToken(request, process.env.INGEST_API_TOKEN);
  if (denied) return denied;
  if (!isServerStoreEnabled()) {
    return NextResponse.json(
      { error: "Server store not configured" },
      { status: 503 },
    );
  }

  let body: {
    projectId?: string;
    name?: string;
    type?: string;
    environment?: string;
    results?: IncomingResult[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId, name, results } = body;
  if (
    typeof projectId !== "string" ||
    !Array.isArray(results) ||
    results.length === 0
  ) {
    return NextResponse.json(
      { error: "projectId and a non-empty results array are required" },
      { status: 400 },
    );
  }
  if (results.length > MAX_RESULTS) {
    return NextResponse.json(
      { error: `results must contain at most ${MAX_RESULTS} entries` },
      { status: 400 },
    );
  }
  if (!(await projectExists(projectId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const type: TestRunType = VALID_TYPE.includes(body.type as TestRunType)
    ? (body.type as TestRunType)
    : "regression";
  const environment: EnvironmentType = VALID_ENV.includes(
    body.environment as EnvironmentType,
  )
    ? (body.environment as EnvironmentType)
    : "staging";

  const runResults: TestRunResult[] = results.map((r, i) => ({
    caseKey: text(r.caseKey) || text(r.testCaseId) || `case-${i}`,
    testCaseId: text(r.testCaseId) || `TC-${i + 1}`,
    module: text(r.module) || "Automation",
    scenario: text(r.scenario) || text(r.testCaseId) || `Case ${i + 1}`,
    status: VALID_STATUS.includes(r.status as TestStatus)
      ? (r.status as TestStatus)
      : "pending",
  }));

  const stats = computeRunStats(runResults);
  const nowIso = new Date().toISOString();
  const run: TestRun = {
    id: crypto.randomUUID(),
    projectId,
    name: text(name) || `CI ${type} run`,
    type,
    environment,
    status: "completed",
    startedAt: nowIso,
    completedAt: nowIso,
    results: runResults,
    ...stats,
  };

  try {
    const existing = await readProjectData<TestRun[]>(
      projectId,
      SERVER_KEYS.TEST_RUNS,
      [],
    );
    const write = await writeProjectData(
      projectId,
      SERVER_KEYS.TEST_RUNS,
      [run, ...existing].slice(0, MAX_STORED_RUNS),
    );
    if (!write.ok) {
      return NextResponse.json(
        { error: write.error || "Failed to persist run" },
        { status: 500 },
      );
    }

    // Append an audit entry (best-effort).
    const audit = await readProjectData<AuditEntry[]>(
      projectId,
      SERVER_KEYS.AUDIT_LOG,
      [],
    );
    await writeProjectData(projectId, SERVER_KEYS.AUDIT_LOG, [
      {
        id: crypto.randomUUID(),
        projectId,
        actor: "ci-automation",
        action: "test-run.ingested",
        entity: "TestRun",
        entityId: run.id,
        summary: `Ingested ${type} run "${run.name}" — ${stats.passRate}% pass (${stats.passed}/${stats.total})`,
        at: nowIso,
      },
      ...audit,
    ]);

    return NextResponse.json({
      success: true,
      runId: run.id,
      passRate: stats.passRate,
      total: stats.total,
      passed: stats.passed,
      failed: stats.failed,
    });
  } catch (error) {
    console.error("Ingestion failed", error);
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}

// Coerce untrusted input to a bounded string ("" when absent or not a string).
function text(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 2000) : "";
}
