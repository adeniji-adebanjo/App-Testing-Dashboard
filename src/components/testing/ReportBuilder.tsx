"use client";

import { useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import {
  useTestCases,
  useDefects,
  useRequirements,
  useTestRuns,
  useReleases,
  useReportSnapshots,
  useUpdateReportSnapshots,
  useMonitoringEvents,
} from "@/hooks/useTestData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import { generateReport, ReportData } from "@/lib/reports";
import { REPORT_TYPES, ReportType, ReportSnapshot } from "@/types/report";
import { exportSummaryReport } from "@/lib/export";
import {
  FileBarChart,
  Download,
  Printer,
  UploadCloud,
  History,
  Eye,
} from "lucide-react";

export default function ReportBuilder() {
  const { projectId } = useParams();
  const id = projectId as string;
  const { currentProject } = useProject();
  const { user } = useAuth();
  const { can } = useRole();

  const { data: testCases, isLoading: l1 } = useTestCases(id);
  const { data: defects, isLoading: l2 } = useDefects(id);
  const { data: requirements, isLoading: l3 } = useRequirements(id);
  const { data: runs, isLoading: l4 } = useTestRuns(id);
  const { data: releases, isLoading: l5 } = useReleases(id);
  const { data: monitoringEvents } = useMonitoringEvents(id);
  const { data: snapshots } = useReportSnapshots(id);
  const updateSnapshots = useUpdateReportSnapshots(id);

  const [type, setType] = useState<ReportType>("test-execution");
  const [viewing, setViewing] = useState<ReportSnapshot | null>(null);

  const isLoading = l1 || l2 || l3 || l4 || l5;

  const reportData: ReportData = useMemo(
    () => ({
      projectName: currentProject?.name || "Project",
      shortCode: currentProject?.shortCode || "",
      testCases: testCases || [],
      defects: defects || [],
      requirements: requirements || [],
      runs: runs || [],
      releases: releases || [],
      monitoringEvents: monitoringEvents || [],
    }),
    [
      currentProject,
      testCases,
      defects,
      requirements,
      runs,
      releases,
      monitoringEvents,
    ],
  );

  const liveContent = useMemo(
    () => generateReport(type, reportData),
    [type, reportData],
  );

  const activeType = REPORT_TYPES.find((t) => t.value === type)!;
  const content = viewing ? viewing.content : liveContent;

  const snapshotsForType = useMemo(
    () =>
      [...(snapshots || [])]
        .filter((s) => s.type === type)
        .sort((a, b) => b.version - a.version),
    [snapshots, type],
  );

  const publish = useCallback(() => {
    const version =
      (snapshots || []).filter((s) => s.type === type).length + 1;
    const snap: ReportSnapshot = {
      id: crypto.randomUUID(),
      projectId: id,
      type,
      title: `${activeType.label} v${version}`,
      content: liveContent,
      version,
      publishedBy: user?.email || "anonymous",
      publishedAt: new Date().toISOString(),
    };
    updateSnapshots.mutate([snap, ...(snapshots || [])]);
    setViewing(null);
  }, [snapshots, type, id, activeType, liveContent, user, updateSnapshots]);

  const download = useCallback(() => {
    exportSummaryReport(
      content,
      `${currentProject?.shortCode || "report"}-${type}`,
    );
  }, [content, currentProject, type]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-gray-50 py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-primary" />
          Framework Reports (§25)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-3">
          {/* Report type selector */}
          <div className="lg:col-span-1 border-r border-gray-50 p-4 space-y-2">
            {REPORT_TYPES.map((rt) => (
              <button
                key={rt.value}
                onClick={() => {
                  setType(rt.value);
                  setViewing(null);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all",
                  type === rt.value
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-bold",
                    type === rt.value ? "text-primary" : "text-gray-800",
                  )}
                >
                  {rt.label}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  {rt.description}
                </p>
              </button>
            ))}

            {/* Published history */}
            {snapshotsForType.length > 0 && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                  <History className="h-3 w-3" /> Published versions
                </p>
                <div className="space-y-1">
                  {snapshotsForType.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setViewing(s)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors",
                        viewing?.id === s.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-gray-50 text-gray-600",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3 w-3" /> v{s.version}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(new Date(s.publishedAt))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview + actions */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-50 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {activeType.label}
                </span>
                {viewing ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-gray-500"
                  >
                    Published v{viewing.version}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 border-emerald-100"
                  >
                    Live
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {viewing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewing(null)}
                    className="text-xs"
                  >
                    Back to live
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={download}
                  className="gap-1.5 text-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                {!viewing && can("report:publish") && (
                  <Button
                    size="sm"
                    onClick={publish}
                    className="gap-1.5 text-xs"
                    title="Publish an immutable, versioned snapshot"
                  >
                    <UploadCloud className="h-3.5 w-3.5" /> Publish
                  </Button>
                )}
              </div>
            </div>
            <pre className="p-6 text-[11px] font-mono text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/30 overflow-auto max-h-140 flex-1">
              {content}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
