// Rosabon QA Framework §25 - Reporting & Metrics Framework.
// The five named QA report types, plus versioned published snapshots that turn
// the app into a reporting CMS (§26 documentation & audit readiness).

export type ReportType =
  | "test-execution"
  | "defect"
  | "regression"
  | "release-readiness"
  | "risk-assessment";

export interface ReportSnapshot {
  id: string;
  projectId: string;
  type: ReportType;
  title: string;
  content: string; // rendered report text at publish time (immutable)
  version: number; // incrementing per report type
  publishedBy: string;
  publishedAt: string; // ISO
}

export const REPORT_TYPES: {
  value: ReportType;
  label: string;
  description: string;
}[] = [
  {
    value: "test-execution",
    label: "Test Execution Report",
    description: "Pass/fail/blocked breakdown by module and risk level",
  },
  {
    value: "defect",
    label: "Defect Report",
    description: "Defects by severity, status, ageing and resolution time",
  },
  {
    value: "regression",
    label: "Regression Report",
    description: "Latest regression cycle vs the previous one",
  },
  {
    value: "release-readiness",
    label: "Release Readiness Report",
    description: "Mandatory checklist, gating runs and sign-offs per release",
  },
  {
    value: "risk-assessment",
    label: "Risk Assessment Report",
    description: "Risk-weighted coverage; flags untested critical modules",
  },
];
