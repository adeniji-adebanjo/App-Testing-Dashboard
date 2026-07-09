import { RiskLevel } from "./test-case";

// Rosabon QA Framework §26, §28 - Requirements & traceability.
// A requirement is the unit that test cases trace back to, enabling coverage
// reporting and audit readiness. Requirements can be authored manually or
// derived from a PRD (via the AI analysis endpoint).
export type RequirementSource = "manual" | "prd" | "ai";

export interface Requirement {
  id: string;
  projectId: string;
  refId: string; // human reference, e.g. "REQ-WALLET-01"
  title: string;
  description?: string;
  source: RequirementSource;
  module?: string;
  riskLevel?: RiskLevel;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
