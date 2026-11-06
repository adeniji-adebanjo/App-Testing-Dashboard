import { NextRequest, NextResponse } from "next/server";
import {
  readProjectData,
  isServerStoreEnabled,
  SERVER_KEYS,
} from "@/lib/serverStore";
import { requireApiToken } from "@/lib/apiAuth";
import { TestRun } from "@/types/test-run";
import { Defect } from "@/types/test-case";
import {
  Release,
  evaluateAutoChecklist,
  resolveChecklist,
  isReleaseReady,
} from "@/types/release";

// Rosabon QA Framework §24 - release-readiness gate for CI/CD (G11).
// A pipeline calls this before deploy; if `ready` is false it should block.
//
// GET /api/release-readiness?projectId=<id>&version=<optional>
// Auth: send header `x-api-token: <INGEST_API_TOKEN>`. Disabled (503) when the
// token is not configured.

export async function GET(request: NextRequest) {
  const denied = requireApiToken(request, process.env.INGEST_API_TOKEN);
  if (denied) return denied;
  if (!isServerStoreEnabled()) {
    return NextResponse.json(
      { error: "Server store not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const version = searchParams.get("version");
  if (!projectId) {
    return NextResponse.json(
      { error: "projectId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const [releases, runs, defects] = await Promise.all([
      readProjectData<Release[]>(projectId, SERVER_KEYS.RELEASES, []),
      readProjectData<TestRun[]>(projectId, SERVER_KEYS.TEST_RUNS, []),
      readProjectData<Defect[]>(projectId, SERVER_KEYS.DEFECTS, []),
    ]);

    if (releases.length === 0) {
      return NextResponse.json(
        { error: "No releases found for this project" },
        { status: 404 },
      );
    }

    const sorted = [...releases].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const release = version
      ? sorted.find((r) => r.version === version)
      : sorted[0];

    if (!release) {
      return NextResponse.json(
        { error: `Release ${version} not found` },
        { status: 404 },
      );
    }

    const auto = evaluateAutoChecklist(runs, defects);
    const checklist = resolveChecklist(release.checklist, auto);
    const ready = isReleaseReady(checklist);
    const blockers = checklist.filter((i) => !i.done).map((i) => i.label);

    return NextResponse.json({
      projectId,
      version: release.version,
      status: release.status,
      ready,
      done: checklist.filter((i) => i.done).length,
      total: checklist.length,
      blockers,
      signOffs: release.signOffs.length,
      checklist: checklist.map((i) => ({
        label: i.label,
        done: i.done,
        auto: i.auto,
      })),
    });
  } catch (error) {
    console.error("Failed to evaluate readiness", error);
    return NextResponse.json(
      { error: "Failed to evaluate readiness" },
      { status: 500 },
    );
  }
}
