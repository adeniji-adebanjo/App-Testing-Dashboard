import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Rosabon QA Framework §23 - server-side data access for the automation API.
// The app persists each project's data as JSON blobs in the `test_data` table
// keyed by `${projectId}_${storageKey}`. These helpers let server routes (CI
// ingestion, webhooks, release-readiness gate) read/write those same blobs
// without the browser-only cloudStorage layer.
//
// Prefers SUPABASE_SERVICE_ROLE_KEY (bypasses RLS for trusted server calls);
// falls back to the anon key. Set the service-role key in the deploy env for
// reliable server writes.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Storage keys mirror STORAGE_KEYS in lib/cloudStorage.ts.
export const SERVER_KEYS = {
  TEST_RUNS: "credit_bureau_test_runs",
  RELEASES: "credit_bureau_releases",
  DEFECTS: "credit_bureau_defects",
  AUDIT_LOG: "credit_bureau_audit_log",
  MONITORING_EVENTS: "credit_bureau_monitoring_events",
} as const;

let client: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export function isServerStoreEnabled(): boolean {
  return !!getServerSupabase();
}

function dataType(projectId: string, storageKey: string): string {
  return `${projectId}_${storageKey}`;
}

// Read the most recent blob for a project's data type.
export async function readProjectData<T>(
  projectId: string,
  storageKey: string,
  fallback: T,
): Promise<T> {
  const sb = getServerSupabase();
  if (!sb) return fallback;
  const { data, error } = await sb
    .from("test_data")
    .select("data")
    .eq("data_type", dataType(projectId, storageKey))
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return fallback;
  return (data.data as T) ?? fallback;
}

// Write a blob for a project's data type, updating the most recent record if one
// exists (preserving its owner), otherwise inserting a new one owned by the
// project's owner.
export async function writeProjectData<T>(
  projectId: string,
  storageKey: string,
  value: T,
): Promise<{ ok: boolean; error?: string }> {
  const sb = getServerSupabase();
  if (!sb) return { ok: false, error: "Server store not configured" };

  const dt = dataType(projectId, storageKey);
  const nowIso = new Date().toISOString();

  const { data: existing } = await sb
    .from("test_data")
    .select("id, user_id")
    .eq("data_type", dt)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    const { error } = await sb
      .from("test_data")
      .update({ data: value, updated_at: nowIso })
      .eq("id", existing.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // No existing record — resolve the project owner for the user_id FK.
  const { data: project } = await sb
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .limit(1)
    .single();

  const payload: Record<string, unknown> = {
    data_type: dt,
    data: value,
    updated_at: nowIso,
  };
  if (project?.user_id) payload.user_id = project.user_id;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      projectId,
    )
  ) {
    payload.project_id = projectId;
  }

  const { error } = await sb.from("test_data").insert([payload]);
  return error ? { ok: false, error: error.message } : { ok: true };
}
