import { supabase, isSupabaseEnabled } from "./supabase";
import { Project, ProjectStats } from "@/types/project";
import {
  TestCase,
  Defect,
  TestObjective,
  TestEnvironment,
} from "@/types/test-case";

// Revocable read-only share links. A link is /share/:projectId?t=<token>; the
// token lives in projects.share_token and is checked server-side by
// /api/share/:projectId. Clearing or replacing it invalidates old links.

function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function buildShareUrl(projectId: string, token: string): string {
  const path = `/share/${projectId}?t=${encodeURIComponent(token)}`;
  return typeof window !== "undefined"
    ? `${window.location.origin}${path}`
    : path;
}

// Current token for a project, or null when sharing is off.
export async function getShareToken(projectId: string): Promise<string | null> {
  if (!isSupabaseEnabled()) throw new Error("Sharing requires cloud sync");
  const { data, error } = await supabase!
    .from("projects")
    .select("share_token")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;
  return (data?.share_token as string | null) ?? null;
}

// Creates a new token, replacing (and so revoking) any existing one.
export async function rotateShareToken(projectId: string): Promise<string> {
  if (!isSupabaseEnabled()) throw new Error("Sharing requires cloud sync");
  const token = generateToken();
  const { data, error } = await supabase!
    .from("projects")
    .update({ share_token: token })
    .eq("id", projectId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Project is not synced to the cloud yet");
  return token;
}

export async function revokeShareToken(projectId: string): Promise<void> {
  if (!isSupabaseEnabled()) throw new Error("Sharing requires cloud sync");
  const { error } = await supabase!
    .from("projects")
    .update({ share_token: null })
    .eq("id", projectId);
  if (error) throw error;
}

export interface SharedProjectSnapshot {
  project: Project;
  stats: ProjectStats;
  testCases: TestCase[];
  defects: Defect[];
  objectives: TestObjective[];
  environments: TestEnvironment[];
}

// Guest-side fetch used by the /share pages. Returns null for an invalid,
// revoked or missing link.
export async function fetchSharedProject(
  projectId: string,
  token: string | null,
): Promise<SharedProjectSnapshot | null> {
  if (!token) return null;
  const res = await fetch(
    `/api/share/${encodeURIComponent(projectId)}?t=${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Share request failed (${res.status})`);
  const body = await res.json();
  return {
    ...body,
    project: {
      ...body.project,
      createdAt: new Date(body.project.createdAt),
      updatedAt: new Date(body.project.updatedAt),
    },
  };
}
