import { NextRequest, NextResponse } from "next/server";
import {
  readProjectData,
  writeProjectData,
  isServerStoreEnabled,
  SERVER_KEYS,
} from "@/lib/serverStore";
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
  const token = process.env.INGEST_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Ingestion disabled: INGEST_API_TOKEN not configured" },
      { status: 503 },
    );
  }
  if (request.headers.get("x-api-token") !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
  if (!projectId || !Array.isArray(results) || results.length === 0) {
    return NextResponse.json(
      { error: "projectId and a non-empty results array are required" },
      { status: 400 },
    );
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
    caseKey: r.caseKey || r.testCaseId || `case-${i}`,
    testCaseId: r.testCaseId || `TC-${i + 1}`,
    module: r.module || "Automation",
    scenario: r.scenario || r.testCaseId || `Case ${i + 1}`,
    status: VALID_STATUS.includes(r.status as TestStatus)
      ? (r.status as TestStatus)
      : "pending",
  }));

  const stats = computeRunStats(runResults);
  const nowIso = new Date().toISOString();
  const run: TestRun = {
    id: crypto.randomUUID(),
    projectId,
    name: name || `CI ${type} run`,
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
    const write = await writeProjectData(projectId, SERVER_KEYS.TEST_RUNS, [
      run,
      ...existing,
    ]);
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
    return NextResponse.json(
      { error: "Ingestion failed", details: String(error) },
      { status: 500 },
    );
  }
}
