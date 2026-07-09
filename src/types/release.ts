import { TestRun } from "./test-run";
import { Defect } from "./test-case";

// Rosabon QA Framework §24 (Release Readiness) & §20 (UAT sign-off).
// A Release bundles the mandatory release checklist, its gating test runs and
// stakeholder sign-offs. No release should be signed off until every checklist
// item passes.

export type ReleaseStatus =
  | "planned"
  | "in-testing"
  | "signed-off"
  | "released"
  | "rolled-back";

export interface ReleaseChecklistItem {
  key: string; // stable identifier
  label: string;
  done: boolean; // for manual items; for auto items this is recomputed
  auto: boolean; // auto items are computed from live data (read-only)
  note?: string;
}

export interface ReleaseSignOff {
  id: string;
  role: string;
  name: string;
  date?: string; // ISO when signed
}

export interface Release {
  id: string;
  projectId: string;
  version: string; // e.g. "2.4.0"
  targetDate?: string; // ISO
  status: ReleaseStatus;
  checklist: ReleaseChecklistItem[];
  signOffs: ReleaseSignOff[];
  linkedRunIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const RELEASE_STATUS_LABELS: Record<ReleaseStatus, string> = {
  planned: "Planned",
  "in-testing": "In Testing",
  "signed-off": "Signed Off",
  released: "Released",
  "rolled-back": "Rolled Back",
};

// The §24 Mandatory Release Checklist. `auto` items are computed from test runs
// and defects; the rest are attested manually by QA/management.
export function defaultChecklist(): ReleaseChecklistItem[] {
  return [
    { key: "smoke", label: "Smoke tests passed", done: false, auto: true },
    {
      key: "critical-defects",
      label: "Critical defects resolved",
      done: false,
      auto: true,
    },
    {
      key: "regression",
      label: "Regression testing completed",
      done: false,
      auto: true,
    },
    {
      key: "wallet",
      label: "Wallet transactions validated",
      done: false,
      auto: false,
    },
    {
      key: "investment",
      label: "Investment calculations verified",
      done: false,
      auto: false,
    },
    {
      key: "api",
      label: "API responses validated",
      done: false,
      auto: false,
    },
    { key: "uat", label: "UAT sign-off completed", done: false, auto: true },
    {
      key: "approval",
      label: "Release approval granted",
      done: false,
      auto: false,
    },
  ];
}

// Compute the auto checklist flags from a project's test runs and defects.
export function evaluateAutoChecklist(
  runs: TestRun[],
  defects: Defect[],
): Record<string, boolean> {
  const completed = runs.filter((r) => r.status === "completed");
  return {
    smoke: completed.some(
      (r) => r.type === "smoke" && r.total > 0 && r.failed === 0,
    ),
    regression: completed.some((r) => r.type === "regression"),
    uat: completed.some((r) => r.type === "uat" && r.failed === 0),
    "critical-defects": !defects.some(
      (d) =>
        d.severity === "critical" &&
        (d.status === "open" || d.status === "in-progress"),
    ),
  };
}

// Merge computed auto flags onto a checklist, returning the effective checklist.
export function resolveChecklist(
  checklist: ReleaseChecklistItem[],
  auto: Record<string, boolean>,
): ReleaseChecklistItem[] {
  return checklist.map((item) =>
    item.auto ? { ...item, done: !!auto[item.key] } : item,
  );
}

export function isReleaseReady(checklist: ReleaseChecklistItem[]): boolean {
  return checklist.length > 0 && checklist.every((i) => i.done);
}
