// Reference Playwright reporter that forwards results to the Testing Dashboard.
//
// This file is a COPY-PASTE REFERENCE meant to live in your *system-under-test*
// repo (the fintech web app), not in the dashboard itself. It has no dependency
// beyond @playwright/test so it drops in cleanly. It maps each spec back to a
// dashboard TestCase via a tag (e.g. `@WALT-001`) and POSTs one TestRun cycle
// to the ingest endpoint when the run finishes.
//
// Wire it up in playwright.config.ts:
//
//   reporter: [
//     ["list"],
//     ["./dashboard-reporter.ts", {
//       ingestUrl: process.env.DASHBOARD_INGEST_URL, // .../api/projects/<projectId>/test-runs/ingest
//       token: process.env.DASHBOARD_INGEST_TOKEN,
//       runName: `CI #${process.env.GITHUB_RUN_NUMBER ?? "local"}`,
//       runType: "regression",
//       environment: "staging",
//     }],
//   ],
//
// Tag a spec so its result maps to a dashboard case:
//   test("wallet interest accrues", { tag: "@WALT-001" }, async ({ page }) => { ... });

import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from "@playwright/test/reporter";

type DashboardStatus = "pass" | "fail" | "pending" | "blocked";

interface ResultRow {
  testCaseId: string;
  status: DashboardStatus;
  module?: string;
  scenario?: string;
  notes?: string;
}

export interface DashboardReporterOptions {
  /** Full ingest URL incl. project id. Falls back to DASHBOARD_INGEST_URL. */
  ingestUrl?: string;
  /** Shared secret. Falls back to DASHBOARD_INGEST_TOKEN. */
  token?: string;
  runName?: string;
  runType?: "smoke" | "regression" | "full" | "uat";
  environment?: "dev" | "staging" | "production";
}

// Playwright outcome -> dashboard TestStatus.
function mapStatus(status: TestResult["status"]): DashboardStatus {
  switch (status) {
    case "passed":
      return "pass";
    case "failed":
    case "timedOut":
      return "fail";
    case "skipped":
      return "pending";
    case "interrupted":
    default:
      return "blocked";
  }
}

const CASE_ID_RE = /^@?([A-Za-z]+-\d+)$/;

// Pull the dashboard case id from the spec's tags (preferred) or its title.
function extractCaseId(test: TestCase): string | null {
  for (const tag of test.tags ?? []) {
    const m = CASE_ID_RE.exec(tag);
    if (m) return m[1];
  }
  const inTitle = /@([A-Za-z]+-\d+)/.exec(test.title);
  return inTitle ? inTitle[1] : null;
}

export default class DashboardReporter implements Reporter {
  private readonly options: DashboardReporterOptions;
  private readonly rows: ResultRow[] = [];
  private readonly skipped: string[] = [];

  constructor(options: DashboardReporterOptions = {}) {
    this.options = options;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const caseId = extractCaseId(test);
    if (!caseId) {
      // Untagged spec — not linked to a dashboard case; ignore it.
      this.skipped.push(test.titlePath().join(" › "));
      return;
    }

    // suite path: [file, describe?, ...] — use the nearest describe as module.
    const titlePath = test.titlePath();
    const module = titlePath.length > 2 ? titlePath[titlePath.length - 2] : "";

    this.rows.push({
      testCaseId: caseId,
      status: mapStatus(result.status),
      module,
      scenario: test.title.replace(/@[A-Za-z]+-\d+/g, "").trim(),
      notes:
        result.status === "failed" || result.status === "timedOut"
          ? result.error?.message?.slice(0, 500)
          : undefined,
    });
  }

  async onEnd(result: FullResult): Promise<void> {
    const ingestUrl = this.options.ingestUrl ?? process.env.DASHBOARD_INGEST_URL;
    const token = this.options.token ?? process.env.DASHBOARD_INGEST_TOKEN;

    if (this.skipped.length > 0) {
      console.warn(
        `[dashboard-reporter] ${this.skipped.length} spec(s) had no @CASE-ID tag and were not reported.`,
      );
    }

    if (!ingestUrl || !token) {
      console.warn(
        "[dashboard-reporter] DASHBOARD_INGEST_URL / DASHBOARD_INGEST_TOKEN not set — skipping upload.",
      );
      return;
    }
    if (this.rows.length === 0) {
      console.warn("[dashboard-reporter] No tagged results to upload.");
      return;
    }

    const payload = {
      name: this.options.runName ?? `Playwright run (${result.status})`,
      type: this.options.runType ?? "regression",
      environment: this.options.environment ?? "staging",
      results: this.rows,
    };

    try {
      const res = await fetch(ingestUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ingest-token": token,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(
          `[dashboard-reporter] Upload failed (${res.status}): ${await res.text()}`,
        );
        return;
      }

      const summary = await res.json();
      console.log(
        `[dashboard-reporter] Reported ${this.rows.length} results — run ${summary.runId} (${summary.passRate}% pass).`,
      );
    } catch (err) {
      console.error("[dashboard-reporter] Upload error:", err);
    }
  }
}
