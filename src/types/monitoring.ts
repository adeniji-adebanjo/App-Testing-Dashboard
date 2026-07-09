// Rosabon QA Framework §15, §25 - production monitoring signals.
// Crash/incident events ingested from Sentry / Firebase Crashlytics feed the
// crash-frequency and production-incident metrics.
export type MonitoringEventType = "crash" | "incident" | "error";

export interface MonitoringEvent {
  id: string;
  projectId: string;
  source: string; // "sentry" | "crashlytics" | custom
  type: MonitoringEventType;
  title: string;
  level?: string; // severity/level from the source
  count?: number; // occurrences represented by this event
  at: string; // ISO timestamp
}
