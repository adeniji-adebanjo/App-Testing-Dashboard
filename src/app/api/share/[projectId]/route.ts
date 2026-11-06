import { NextRequest, NextResponse } from "next/server";
import {
  getServerSupabase,
  readProjectData,
  SERVER_KEYS,
} from "@/lib/serverStore";
import { safeEqual } from "@/lib/apiAuth";
import { isUuid } from "@/lib/ingest";
import { computeProjectStats } from "@/lib/projectStats";
import {
  TestCase,
  Defect,
  TestObjective,
  TestEnvironment,
} from "@/types/test-case";

// Service-role reads + Node crypto require the Node runtime (not edge).
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// GET /api/share/:projectId?t=<share_token>
//
// Read-only snapshot for guests holding a share link. RLS blocks anonymous
// access to the tables, so this route reads with the service role and only
// after the token matches the project's current share_token. Revoking or
// regenerating the token (ShareLinkDialog) invalidates existing links.
export async function GET(request: NextRequest, ctx: RouteContext) {
  const { projectId } = await ctx.params;
  const token = request.nextUrl.searchParams.get("t") ?? "";

  // Same response for every failure so links can't be probed.
  const notFound = () =>
    NextResponse.json(
      { error: "Project not found or link has been disabled" },
      { status: 404 },
    );

  if (!isUuid(projectId) || !token) return notFound();

  const sb = getServerSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "Sharing is not configured on the server" },
      { status: 503 },
    );
  }

  const { data: row, error } = await sb
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    console.error("Share: project lookup failed", error);
    return NextResponse.json({ error: "Storage error" }, { status: 502 });
  }
  if (!row?.share_token || !safeEqual(token, row.share_token)) {
    return notFound();
  }

  const [testCases, defects, objectives, environments] = await Promise.all([
    readProjectData<TestCase[]>(projectId, SERVER_KEYS.TEST_CASES, []),
    readProjectData<Defect[]>(projectId, SERVER_KEYS.DEFECTS, []),
    readProjectData<TestObjective[]>(projectId, SERVER_KEYS.OBJECTIVES, []),
    readProjectData<TestEnvironment[]>(projectId, SERVER_KEYS.ENVIRONMENTS, []),
  ]);

  return NextResponse.json(
    {
      // Explicit field list: never expose user_id or the share token itself.
      project: {
        id: row.id,
        name: row.name,
        shortCode: row.short_code,
        description: row.description,
        projectType: row.project_type || "web",
        techStack: row.tech_stack ?? [],
        targetUsers: row.target_users ?? [],
        documentVersion: row.document_version,
        status: row.status,
        phase: row.phase,
        color: row.color,
        icon: row.icon,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      stats: computeProjectStats(testCases, defects),
      testCases,
      defects,
      objectives,
      environments,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
