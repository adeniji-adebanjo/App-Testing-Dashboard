"use client";

import { useProject } from "@/context/ProjectContext";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useTestCases,
  useDefects,
  useMetrics,
  useObjectives,
} from "@/hooks/useTestData";
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  Printer,
  Download,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  exportAsJSON,
  exportTestCasesAsCSV,
  exportDefectsAsCSV,
  exportSummaryReport,
  printReport,
} from "@/lib/export";

export default function ProjectReportsPage() {
  const { projectId } = useParams();
  const id = projectId as string;
  const { currentProject } = useProject();

  const { data: testCases, isLoading: testsLoading } = useTestCases(id);
  const { data: defects, isLoading: defectsLoading } = useDefects(id);
  const { data: metrics, isLoading: metricsLoading } = useMetrics(id);
  const { data: objectives, isLoading: objectivesLoading } = useObjectives(id);

  const isLoading =
    testsLoading || defectsLoading || metricsLoading || objectivesLoading;

  const stats = useMemo(() => {
    const tc = testCases || [];
    const df = defects || [];
    return {
      totalTests: tc.length,
      passed: tc.filter((t) => t.status === "pass").length,
      failed: tc.filter((t) => t.status === "fail").length,
      pending: tc.filter((t) => t.status === "pending").length,
      defects: df.length,
      criticalDefects: df.filter((d) => d.severity === "critical").length,
    };
  }, [testCases, defects]);

  const summaryText = useMemo(() => {
    if (!currentProject) return "";
    const tc = testCases || [];
    const df = defects || [];
    const mt = metrics || [];
    const ob = objectives || [];

    const passRate =
      tc.length > 0 ? ((stats.passed / tc.length) * 100).toFixed(1) : "0";

    return `${currentProject.name.toUpperCase()} TESTING SUMMARY
Generated: ${new Date().toLocaleString()}
Project Code: ${currentProject.shortCode}
Phase: ${currentProject.phase.toUpperCase()}
=======================================

TEST EXECUTION
--------------
Total Tests: ${tc.length}
Passed: ${stats.passed}
Failed: ${stats.failed}
Pending: ${stats.pending}
Pass Rate: ${passRate}%

DEFECTS
-------
Total Defects: ${df.length}
Critical: ${stats.criticalDefects}
Open: ${df.filter((d) => d.status === "open").length}

GOALS & METRICS
---------------
Objectives Completed: ${ob.filter((o) => o.completed).length}/${ob.length}
Success Metrics: ${mt.length} defined
`;
  }, [currentProject, testCases, defects, metrics, objectives, stats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Reports & Insights
          </h1>
          <p className="mt-2 text-gray-500">
            Generate audit-ready reports and export project data
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="gap-2"
        >
          <Printer size={16} />
          Print Overview
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Tests" value={stats.totalTests} />
        <StatCard label="Passed" value={stats.passed} color="text-green-600" />
        <StatCard label="Failed" value={stats.failed} color="text-red-600" />
        <StatCard
          label="Pending"
          value={stats.pending}
          color="text-amber-500"
        />
        <StatCard label="Defects" value={stats.defects} />
        <StatCard
          label="Critical"
          value={stats.criticalDefects}
          color="text-red-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg">Export Data</CardTitle>
              <CardDescription>Select format to download</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <ExportButton
                icon={<FileText className="text-blue-500" />}
                title="Summary Report"
                format="TXT"
                onClick={() =>
                  exportSummaryReport(summaryText, currentProject?.name)
                }
              />
              <ExportButton
                icon={<FileSpreadsheet className="text-green-600" />}
                title="Test Matrix"
                format="CSV"
                onClick={() => exportTestCasesAsCSV(testCases || [])}
              />
              <ExportButton
                icon={<FileSpreadsheet className="text-orange-500" />}
                title="Defect Log"
                format="CSV"
                onClick={() => exportDefectsAsCSV(defects || [])}
              />
              <ExportButton
                icon={<FileJson className="text-purple-500" />}
                title="Full Database"
                format="JSON"
                onClick={() =>
                  exportAsJSON(
                    { testCases, defects, metrics, objectives },
                    currentProject?.shortCode,
                  )
                }
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                Audit Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 leading-relaxed">
                These reports are generated in real-time and comply with
                standard QA auditing requirements. Ensure all "Fail" results
                have corresponding defects logged before final submission.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <CardTitle className="text-lg">Live Summary Preview</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                Real-time
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-8 text-xs font-mono text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/30 overflow-auto max-h-[600px]">
                {summaryText}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card className="border-none shadow-sm bg-white/50">
      <CardContent className="p-4">
        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
          {label}
        </p>
        <p className={cn("text-2xl font-black", color)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function ExportButton({
  icon,
  title,
  format,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  format: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
          {icon}
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-[10px] text-gray-400 font-medium">
            Format: {format}
          </p>
        </div>
      </div>
      <Download
        size={16}
        className="text-gray-300 group-hover:text-primary transition-colors"
      />
    </button>
  );
}
