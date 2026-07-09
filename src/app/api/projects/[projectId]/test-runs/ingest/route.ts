import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  validateIngestPayload,
  toTestRun,
  projectDataType,
  isUuid,
} from "@/lib/ingest";
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
// shared secret in the `x-ingest-token` header (compared against INGEST_TOKEN).
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { projectId } = await ctx.params;

  // --- 1. Auth -------------------------------------------------------------
  const expectedToken = process.env.INGEST_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "Ingest is not configured on the server (INGEST_TOKEN unset)." },
      { status: 500 },
    );
  }
  if (req.headers.get("x-ingest-token") !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

  const dataType = projectDataType(projectId);

  const { data: existing, error: readError } = await admin
    .from("test_data")
    .select("id, user_id, data")
    .eq("data_type", dataType)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) {
    return NextResponse.json(
      { error: "Failed to read existing runs.", details: readError.message },
      { status: 502 },
    );
  }

  const existingRuns: TestRun[] = Array.isArray(existing?.data)
    ? (existing!.data as TestRun[])
    : [];
  const nextRuns = [run, ...existingRuns]; // newest first

  if (existing) {
    // Update the existing runs row in place, preserving its user_id.
    const { error: updateError } = await admin
      .from("test_data")
      .update({ data: nextRuns, updated_at: now })
      .eq("id", existing.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save run.", details: updateError.message },
        { status: 502 },
      );
    }
  } else {
    // No runs row yet. test_data.user_id references a real user, so borrow one
    // from any existing row for this project (all keys are `${projectId}_*`),
    // or fall back to an explicit INGEST_USER_ID.
    const userId = await resolveUserId(admin, projectId);
    if (!userId) {
      return NextResponse.json(
        {
          error:
            "No existing data found for this project to attach the run to. " +
            "Create the project's first data in the app, or set INGEST_USER_ID.",
        },
        { status: 422 },
      );
    }

    const insertRow: Record<string, unknown> = {
      user_id: userId,
      data_type: dataType,
      data: nextRuns,
      updated_at: now,
    };
    if (isUuid(projectId)) insertRow.project_id = projectId;

    const { error: insertError } = await admin
      .from("test_data")
      .insert([insertRow]);

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create runs.", details: insertError.message },
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

async function resolveUserId(
  admin: ReturnType<typeof supabaseAdmin>,
  projectId: string,
): Promise<string | null> {
  const override = process.env.INGEST_USER_ID;
  if (override) return override;

  const { data } = await admin
    .from("test_data")
    .select("user_id")
    .like("data_type", `${projectId}_%`)
    .limit(1)
    .maybeSingle();

  return (data?.user_id as string | undefined) ?? null;
}
