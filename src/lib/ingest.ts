// Automation ingest contract.
//
// This is the single source of truth for the boundary between an external test
// runner (Playwright web E2E, Appium/mobile, etc.) and the dashboard's storage.
// A runner's reporter POSTs an `IngestPayload`; this module validates it and
// turns it into a `TestRun` (see src/types/test-run.ts) that the existing UI
// already knows how to render.
//
// Kept free of any client-only imports so it is safe to use inside a Next.js
// route handler (server runtime).

import { TestStatus, RiskLevel, EnvironmentType } from "@/types/test-case";
import {
  TestRun,
  TestRunType,
  TestRunResult,
  TEST_RUN_TYPES,
  computeRunStats,
} from "@/types/test-run";

// MUST match STORAGE_KEYS.TEST_RUNS in src/lib/cloudStorage.ts.
// Duplicated here (rather than imported) because cloudStorage.ts pulls in
// client-only sync-status helpers that must not load in a server route.
export const TEST_RUNS_STORAGE_KEY = "credit_bureau_test_runs";

// Storage rows are keyed by `${projectId}_${storageKey}` (getProjectKey()).
export function projectDataType(projectId: string): string {
  return `${projectId}_${TEST_RUNS_STORAGE_KEY}`;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

// Accepts both the dashboard's own TestStatus values and raw runner outcomes
// (Playwright: passed/failed/timedOut/skipped/interrupted; WebdriverIO/Appium:
// passed/failed/skipped/pending), so a reporter can forward status untouched.
const STATUS_MAP: Record<string, TestStatus> = {
  pass: "pass",
  passed: "pass",
  fail: "fail",
  failed: "fail",
  timedout: "fail",
  error: "fail",
  broken: "fail",
  pending: "pending",
  skipped: "pending",
  skip: "pending",
  blocked: "blocked",
  interrupted: "blocked",
};

export function normalizeStatus(raw: string): TestStatus {
  return STATUS_MAP[String(raw).trim().toLowerCase()] ?? "pending";
}

const VALID_ENVIRONMENTS: EnvironmentType[] = ["dev", "staging", "production"];
const VALID_RISK_LEVELS: RiskLevel[] = ["critical", "high", "medium", "low"];

export interface IngestResultInput {
  testCaseId: string; // human id, must match TestCase.testCaseId e.g. "WALT-001"
  status: string; // TestStatus or a raw runner outcome (normalized on ingest)
  module?: string;
  scenario?: string;
  notes?: string;
  caseKey?: string; // stable id of the source case, if the runner knows it
  riskLevel?: RiskLevel;
}

export interface IngestPayload {
  results: IngestResultInput[];
  name?: string; // e.g. "Release 2.4 Regression (CI #412)"
  type?: TestRunType; // smoke | regression | full | uat
  environment?: EnvironmentType;
  startedAt?: string; // ISO timestamp; defaults to now
  runId?: string; // let the runner supply a stable id (e.g. CI run id)
}

// Bounds on untrusted input. Every run is appended to a single JSON blob, so an
// unbounded payload would bloat every subsequent read of the project's runs.
export const MAX_RESULTS = 5000;
export const MAX_STORED_RUNS = 200;
const MAX_ID_LENGTH = 200;
const MAX_TEXT_LENGTH = 2000;

function checkOptionalString(
  value: unknown,
  field: string,
  max: number,
  errors: string[],
): void {
  if (value === undefined) return;
  if (typeof value !== "string") {
    errors.push(`${field} must be a string.`);
  } else if (value.length > max) {
    errors.push(`${field} must be at most ${max} characters.`);
  }
}

export type ValidationResult =
  | { ok: true; value: IngestPayload }
  | { ok: false; errors: string[] };

export function validateIngestPayload(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: ["Body must be a JSON object."] };
  }

  const b = body as Record<string, unknown>;

  if (!Array.isArray(b.results)) {
    errors.push("`results` must be an array.");
  } else if (b.results.length === 0) {
    errors.push("`results` must contain at least one result.");
  } else if (b.results.length > MAX_RESULTS) {
    errors.push(`\`results\` must contain at most ${MAX_RESULTS} results.`);
  } else {
    b.results.forEach((r, i) => {
      if (errors.length >= 50) return; // don't echo thousands of errors back
      if (typeof r !== "object" || r === null) {
        errors.push(`results[${i}] must be an object.`);
        return;
      }
      const row = r as Record<string, unknown>;
      if (typeof row.testCaseId !== "string" || row.testCaseId.trim() === "") {
        errors.push(`results[${i}].testCaseId is required (non-empty string).`);
      } else if (row.testCaseId.length > MAX_ID_LENGTH) {
        errors.push(
          `results[${i}].testCaseId must be at most ${MAX_ID_LENGTH} characters.`,
        );
      }
      if (typeof row.status !== "string" || row.status.trim() === "") {
        errors.push(`results[${i}].status is required (non-empty string).`);
      }
      checkOptionalString(row.caseKey, `results[${i}].caseKey`, MAX_ID_LENGTH, errors);
      checkOptionalString(row.module, `results[${i}].module`, MAX_TEXT_LENGTH, errors);
      checkOptionalString(row.scenario, `results[${i}].scenario`, MAX_TEXT_LENGTH, errors);
      checkOptionalString(row.notes, `results[${i}].notes`, MAX_TEXT_LENGTH, errors);
      if (
        row.riskLevel !== undefined &&
        !VALID_RISK_LEVELS.includes(row.riskLevel as RiskLevel)
      ) {
        errors.push(
          `results[${i}].riskLevel must be one of ${VALID_RISK_LEVELS.join(", ")}.`,
        );
      }
    });
  }

  if (
    b.type !== undefined &&
    !TEST_RUN_TYPES.some((t) => t.value === b.type)
  ) {
    errors.push(
      `\`type\` must be one of ${TEST_RUN_TYPES.map((t) => t.value).join(", ")}.`,
    );
  }

  if (
    b.environment !== undefined &&
    !VALID_ENVIRONMENTS.includes(b.environment as EnvironmentType)
  ) {
    errors.push(
      `\`environment\` must be one of ${VALID_ENVIRONMENTS.join(", ")}.`,
    );
  }

  checkOptionalString(b.name, "`name`", MAX_TEXT_LENGTH, errors);
  checkOptionalString(b.runId, "`runId`", MAX_ID_LENGTH, errors);
  checkOptionalString(b.startedAt, "`startedAt`", MAX_ID_LENGTH, errors);
  if (typeof b.startedAt === "string" && isNaN(Date.parse(b.startedAt))) {
    errors.push("`startedAt` must be an ISO timestamp.");
  }

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, value: b as unknown as IngestPayload };
}

// Turn a validated payload into a persisted TestRun. `id` and `now` are passed
// in so this stays a pure function (the caller supplies crypto.randomUUID()).
export function toTestRun(
  payload: IngestPayload,
  projectId: string,
  id: string,
  now: string,
): TestRun {
  const results: TestRunResult[] = payload.results.map((r) => ({
    caseKey: r.caseKey ?? r.testCaseId,
    testCaseId: r.testCaseId,
    module: r.module ?? "",
    scenario: r.scenario ?? "",
    riskLevel: r.riskLevel,
    status: normalizeStatus(r.status),
    notes: r.notes,
  }));

  const stats = computeRunStats(results);

  return {
    id,
    projectId,
    name: payload.name ?? "Automated run",
    type: payload.type ?? "regression",
    environment: payload.environment ?? "staging",
    status: "completed",
    startedAt: payload.startedAt ?? now,
    completedAt: now,
    results,
    ...stats,
  };
}
