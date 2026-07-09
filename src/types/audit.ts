// Rosabon QA Framework §28 - Compliance and Audit Readiness.
// An append-only trail of significant QA events for traceability.
export interface AuditEntry {
  id: string;
  projectId: string;
  actor: string; // user email or "system"
  action: string; // machine key, e.g. "test-run.created"
  entity: string; // e.g. "TestRun"
  entityId: string;
  summary: string; // human-readable description
  at: string; // ISO timestamp
}
