import { NextRequest, NextResponse } from "next/server";
import {
  readProjectData,
  writeProjectData,
  isServerStoreEnabled,
  SERVER_KEYS,
} from "@/lib/serverStore";
import { MonitoringEvent, MonitoringEventType } from "@/types/monitoring";

// Rosabon QA Framework §15, §25 - production monitoring webhook (G12).
// Accepts crash/incident events from Sentry / Firebase Crashlytics (or any
// monitor) and records them so crash frequency and production incidents surface
// in QA reports.
//
// Auth: header `x-api-token: <MONITORING_WEBHOOK_TOKEN or INGEST_API_TOKEN>`.
// Body: { projectId, source?, type?, title?, level?, count? }

const VALID_TYPES: MonitoringEventType[] = ["crash", "incident", "error"];
// Cap stored events to avoid unbounded blob growth.
const MAX_EVENTS = 500;

export async function POST(request: NextRequest) {
  const token =
    process.env.MONITORING_WEBHOOK_TOKEN || process.env.INGEST_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Monitoring webhook disabled: no token configured" },
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
    source?: string;
    type?: string;
    title?: string;
    level?: string;
    count?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId } = body;
  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 },
    );
  }

  const event: MonitoringEvent = {
    id: crypto.randomUUID(),
    projectId,
    source: body.source || "unknown",
    type: VALID_TYPES.includes(body.type as MonitoringEventType)
      ? (body.type as MonitoringEventType)
      : "error",
    title: body.title || "Untitled event",
    level: body.level,
    count: typeof body.count === "number" ? body.count : 1,
    at: new Date().toISOString(),
  };

  try {
    const existing = await readProjectData<MonitoringEvent[]>(
      projectId,
      SERVER_KEYS.MONITORING_EVENTS,
      [],
    );
    const next = [event, ...existing].slice(0, MAX_EVENTS);
    const write = await writeProjectData(
      projectId,
      SERVER_KEYS.MONITORING_EVENTS,
      next,
    );
    if (!write.ok) {
      return NextResponse.json(
        { error: write.error || "Failed to persist event" },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record event", details: String(error) },
      { status: 500 },
    );
  }
}
