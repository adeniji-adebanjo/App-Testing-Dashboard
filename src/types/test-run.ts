import { TestStatus, RiskLevel, EnvironmentType } from "./test-case";

// Rosabon QA Framework §9, §11 - Test execution cycles.
// A TestRun introduces the *time* dimension: it snapshots the project's test
// cases at a point in time and records their result for that cycle, enabling
// regression history, trend metrics and release gating.

export type TestRunType = "smoke" | "regression" | "full" | "uat";
export type TestRunStatus = "in-progress" | "completed";

export interface TestRunResult {
  caseKey: string; // stable id of the source test case at snapshot time
  testCaseId: string; // human id, e.g. "WALT-001"
  module: string;
  scenario: string;
  riskLevel?: RiskLevel;
  status: TestStatus;
  notes?: string;
}

export interface TestRun {
  id: string;
  projectId: string;
  name: string; // e.g. "Release 2.4 Regression"
  type: TestRunType;
  environment: EnvironmentType;
  status: TestRunStatus;
  startedAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
  results: TestRunResult[];
  // Snapshot stats computed on save
  total: number;
  passed: number;
  failed: number;
  pending: number;
  blocked: number;
  passRate: number;
}

export const TEST_RUN_TYPES: { value: TestRunType; label: string }[] = [
  { value: "smoke", label: "Smoke" },
  { value: "regression", label: "Regression" },
  { value: "full", label: "Full" },
  { value: "uat", label: "UAT" },
];

// Compute snapshot stats for a set of results.
export function computeRunStats(results: TestRunResult[]): {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  blocked: number;
  passRate: number;
} {
  const total = results.length;
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const pending = results.filter((r) => r.status === "pending").length;
  const blocked = results.filter((r) => r.status === "blocked").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  return { total, passed, failed, pending, blocked, passRate };
}
