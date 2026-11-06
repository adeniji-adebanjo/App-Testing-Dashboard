import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  validateIngestPayload,
  toTestRun,
  projectDataType,
  isUuid,
  MAX_STORED_RUNS,
} from "@/lib/ingest";
import { requireApiToken } from "@/lib/apiAuth";
import { TestRun } from "@/types/test-run";

// Service-role writes + crypto.randomUUID require the Node runtime (not edge).
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// POST /api/projects/:projectId/test-runs/ingest
//
// Accepts an IngestPayload from an external test runner, appends it as a new
// TestRun cycle for the project, and returns the run's summary stats. Auth is a
// shared secret in the `x-ingest-token` header (compared against INGEST_TOKEN in
// constant time). projectId must be the UUID of an existing project.
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { projectId } = await ctx.params;

  // --- 1. Auth -------------------------------------------------------------
  const denied = requireApiToken(req, process.env.INGEST_TOKEN, "x-ingest-token");
  if (denied) return denied;

  if (!isUuid(projectId)) {
    return NextResponse.json({ error: "Invalid projectId." }, { status: 400 });
  }

  // --- 2. Parse + validate -------------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateIngestPayload(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Validation failed.", details: validation.errors },
      { status: 400 },
    );
  }

  // --- 3. Build the TestRun ------------------------------------------------
  const now = new Date().toISOString();
  const run: TestRun = toTestRun(
    validation.value,
    projectId,
    validation.value.runId ?? crypto.randomUUID(),
    now,
  );

  // --- 4. Persist (append to the project's test_data runs blob) ------------
  let admin;
  try {
    admin = supabaseAdmin();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage not configured." },
      { status: 500 },
    );
  }

  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    console.error("Ingest: project lookup failed", projectError);
    return NextResponse.json({ error: "Storage error." }, { status: 502 });
  }
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const dataType = projectDataType(projectId);

  const { data: existing, error: readError } = await admin
    .from("test_data")
    .select("id, user_id, data")
    .eq("data_type", dataType)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) {
    console.error("Ingest: failed to read existing runs", readError);
    return NextResponse.json(
      { error: "Failed to read existing runs." },
      { status: 502 },
    );
  }

  const existingRuns: TestRun[] = Array.isArray(existing?.data)
    ? (existing!.data as TestRun[])
    : [];
  // Newest first; capped so the runs blob doesn't grow without bound.
  const nextRuns = [run, ...existingRuns].slice(0, MAX_STORED_RUNS);

  if (existing) {
    // Update the existing runs row in place, preserving its user_id.
    const { error: updateError } = await admin
      .from("test_data")
      .update({ data: nextRuns, updated_at: now })
      .eq("id", existing.id);

    if (updateError) {
      console.error("Ingest: failed to save run", updateError);
      return NextResponse.json(
        { error: "Failed to save run." },
        { status: 502 },
      );
    }
  } else {
    // No runs row yet. test_data.user_id references a real user, so attribute
    // the row to the project's owner (or an explicit INGEST_USER_ID override).
    const userId = process.env.INGEST_USER_ID || project.user_id;

    const { error: insertError } = await admin.from("test_data").insert([
      {
        user_id: userId,
        project_id: projectId,
        data_type: dataType,
        data: nextRuns,
        updated_at: now,
      },
    ]);

    if (insertError) {
      console.error("Ingest: failed to create runs", insertError);
      return NextResponse.json(
        { error: "Failed to create runs." },
        { status: 502 },
      );
    }
  }

  // --- 5. Done -------------------------------------------------------------
  return NextResponse.json(
    {
      runId: run.id,
      total: run.total,
      passed: run.passed,
      failed: run.failed,
      pending: run.pending,
      blocked: run.blocked,
      passRate: run.passRate,
    },
    { status: 201 },
  );
}
