"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Bug,
  ArrowLeft,
  Download,
  FileText,
  Monitor,
  Smartphone,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getProject } from "@/lib/projectStorage";
import {
  loadTestCases,
  loadDefects,
  loadObjectives,
  loadEnvironments,
} from "@/lib/cloudStorage";
import { Project } from "@/types/project";
import {
  TestCase,
  Defect,
  TestObjective,
  TestEnvironment,
} from "@/types/test-case";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pass: {
      label: "Passed",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    fail: {
      label: "Failed",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    blocked: {
      label: "Blocked",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
    open: {
      label: "Open",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    resolved: {
      label: "Resolved",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] uppercase font-bold px-2 py-0.5",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  );
}

// Severity badge component
function SeverityBadge({ severity }: { severity: string }) {
  const severityConfig: Record<string, { label: string; className: string }> = {
    critical: {
      label: "Critical",
      className: "bg-purple-100 text-purple-700 border-purple-200",
    },
    high: {
      label: "High",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    medium: {
      label: "Medium",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    low: {
      label: "Low",
      className: "bg-green-100 text-green-700 border-green-200",
    },
  };

  const config = severityConfig[severity] || {
    label: severity,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] uppercase font-bold px-2 py-0.5",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  );
}

// Collapsible section component
function CollapsibleSection({
  title,
  description,
  icon,
  children,
  defaultOpen = true,
  count,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="border-none shadow-lg overflow-hidden">
      <CardHeader
        className="bg-gray-50/80 border-b border-gray-100 cursor-pointer hover:bg-gray-100/80 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-sm text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                {title}
                {count !== undefined && (
                  <Badge variant="secondary" className="text-xs font-bold">
                    {count}
                  </Badge>
                )}
              </CardTitle>
              {description && (
                <CardDescription className="text-xs mt-0.5">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>
      {isOpen && <CardContent className="p-0">{children}</CardContent>}
    </Card>
  );
}

export default function PrivateShareAnalysisPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const id = projectId as string;
  const reportRef = useRef<HTMLDivElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [objectives, setObjectives] = useState<TestObjective[]>([]);
  const [environments, setEnvironments] = useState<TestEnvironment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const foundProject = await getProject(id);

        if (!foundProject) {
          setError("Project not found");
          return;
        }

        setProject(foundProject);

        // Load all test data
        const [testCasesData, defectsData, objectivesData, environmentsData] =
          await Promise.all([
            loadTestCases(id),
            loadDefects(id),
            loadObjectives(id),
            loadEnvironments(id),
          ]);

        setTestCases(testCasesData);
        setDefects(defectsData);
        setObjectives(objectivesData);
        setEnvironments(environmentsData);
      } catch (err) {
        setError("Failed to load project data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Generate PDF report
  const handleExportPDF = async () => {
    if (!project) return;
    setIsExporting(true);

    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(`${project.name} - Test Analysis Report`, pageWidth / 2, 20, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, {
        align: "center",
      });
      doc.text(
        `Phase: ${project.phase} | Status: ${project.status}`,
        pageWidth / 2,
        34,
        {
          align: "center",
        },
      );
      doc.text(`Software Tester/QA: Adebanjo Adeniji`, pageWidth / 2, 40, {
        align: "center",
      });

      let yPos = 50;

      const passed = testCases.filter((tc) => tc.status === "pass").length;
      const failed = testCases.filter((tc) => tc.status === "fail").length;
      const pending = testCases.filter((tc) => tc.status === "pending").length;
      const blocked = testCases.filter((tc) => tc.status === "blocked").length;
      const passRate =
        testCases.length > 0
          ? Math.round((passed / testCases.length) * 100)
          : 0;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Test Cases: ${testCases.length}`, 14, yPos);
      doc.text(`Pass Rate: ${passRate}%`, 80, yPos);
      doc.text(
        `Open Defects: ${defects.filter((d) => d.status === "open" || d.status === "in-progress").length}`,
        140,
        yPos,
      );
      yPos += 6;
      doc.text(
        `Passed: ${passed} | Failed: ${failed} | Pending: ${pending} | Blocked: ${blocked}`,
        14,
        yPos,
      );
      yPos += 15;

      if (testCases.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Test Cases", 14, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [["ID", "Module", "Scenario", "Status", "Expected", "Actual"]],
          body: testCases.map((tc) => [
            tc.testCaseId,
            tc.module,
            tc.scenario.substring(0, 40) +
              (tc.scenario.length > 40 ? "..." : ""),
            tc.status.toUpperCase(),
            tc.expectedResult.substring(0, 30) +
              (tc.expectedResult.length > 30 ? "..." : ""),
            tc.actualResult.substring(0, 30) +
              (tc.actualResult.length > 30 ? "..." : ""),
          ]),
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [99, 102, 241] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        // @ts-expect-error - lastAutoTable is added dynamically by jspdf-autotable
        yPos = doc.lastAutoTable.finalY + 15;
      }

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      if (defects.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Defects & Issues", 14, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [
            [
              "Bug ID",
              "Severity",
              "Module",
              "Description",
              "Status",
              "Assigned To",
            ],
          ],
          body: defects.map((d) => [
            d.bugId,
            d.severity.toUpperCase(),
            d.module,
            d.description.substring(0, 40) +
              (d.description.length > 40 ? "..." : ""),
            d.status.toUpperCase(),
            d.assignedTo || "Unassigned",
          ]),
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [239, 68, 68] },
          alternateRowStyles: { fillColor: [254, 242, 242] },
        });
      }

      doc.save(`${project.shortCode}_Test_Analysis_Report.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-none shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {error || "Project Not Found"}
            </h2>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passed = testCases.filter((tc) => tc.status === "pass").length;
  const failed = testCases.filter((tc) => tc.status === "fail").length;
  const pending = testCases.filter((tc) => tc.status === "pending").length;
  const blocked = testCases.filter((tc) => tc.status === "blocked").length;
  const passRate =
    testCases.length > 0 ? Math.round((passed / testCases.length) * 100) : 0;
  const openDefects = defects.filter(
    (d) => d.status === "open" || d.status === "in-progress",
  ).length;
  const criticalDefects = defects.filter(
    (d) => d.severity === "critical",
  ).length;

  const testCasesByModule = testCases.reduce(
    (acc, tc) => {
      const moduleName = tc.module || "Uncategorized";
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(tc);
      return acc;
    },
    {} as Record<string, TestCase[]>,
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/share/${id}`}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase font-black bg-primary/5 text-primary border-none gap-1"
                  >
                    <Shield size={10} />
                    Private Analysis
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
                  {project.name}
                </h1>
              </div>
            </div>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Download size={16} />
              {isExporting ? "Generating..." : "Export PDF"}
            </Button>
          </div>
        </div>
      </header>

      <main
        className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6"
        ref={reportRef}
      >
        <Card className="border-none shadow-lg overflow-hidden">
          <div
            className="h-2 w-full"
            style={{ backgroundColor: project.color }}
          />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                  style={{ backgroundColor: project.color }}
                >
                  {project.shortCode?.slice(0, 2) || "PR"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase font-black"
                    >
                      {project.phase}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase font-black bg-primary/5 text-primary border-none gap-1"
                    >
                      {project.projectType === "mobile" ? (
                        <Smartphone size={10} />
                      ) : (
                        <Monitor size={10} />
                      )}
                      {project.projectType === "mobile" ? "Mobile" : "Web"}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 max-w-xl">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <p className="text-2xl font-black text-primary">
                    {passRate}%
                  </p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Pass Rate
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <p className="text-2xl font-black text-gray-900">
                    {testCases.length}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Total Tests
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <p className="text-2xl font-black text-red-600">
                    {openDefects}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Open Defects
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-50">
                  <p className="text-2xl font-black text-purple-600">
                    {criticalDefects}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Critical
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <StatCard
            label="Passed"
            value={passed}
            total={testCases.length}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Failed"
            value={failed}
            total={testCases.length}
            icon={<XCircle className="w-5 h-5" />}
            color="red"
          />
          <StatCard
            label="Pending"
            value={pending}
            total={testCases.length}
            icon={<Clock className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            label="Blocked"
            value={blocked}
            total={testCases.length}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="gray"
          />
        </div>

        <CollapsibleSection
          title="Test Cases"
          description="Detailed breakdown of all test cases by module"
          icon={<FileText size={18} />}
          count={testCases.length}
        >
          {Object.keys(testCasesByModule).length > 0 ? (
            <div className="divide-y divide-gray-100">
              {Object.entries(testCasesByModule).map(([moduleName, cases]) => (
                <div key={moduleName} className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="font-bold">
                      {moduleName}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {cases.length} test case{cases.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="w-[100px] text-xs font-bold">
                            ID
                          </TableHead>
                          <TableHead className="text-xs font-bold">
                            Scenario
                          </TableHead>
                          <TableHead className="text-xs font-bold">
                            Expected Result
                          </TableHead>
                          <TableHead className="text-xs font-bold">
                            Actual Result
                          </TableHead>
                          <TableHead className="w-[100px] text-xs font-bold">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cases.map((tc) => (
                          <TableRow key={tc.id} className="hover:bg-gray-50/50">
                            <TableCell className="font-mono text-xs text-gray-600">
                              {tc.testCaseId}
                            </TableCell>
                            <TableCell className="text-sm">
                              <p className="font-medium text-gray-900">
                                {tc.scenario}
                              </p>
                              {tc.steps && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {tc.steps}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 max-w-[200px]">
                              {tc.expectedResult}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 max-w-[200px]">
                              {tc.actualResult || "-"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={tc.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No test cases recorded
              </p>
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Defects & Issues"
          description="All reported bugs and issues for this project"
          icon={<Bug size={18} />}
          count={defects.length}
          defaultOpen={defects.length > 0}
        >
          {defects.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-[100px] text-xs font-bold">
                      Bug ID
                    </TableHead>
                    <TableHead className="w-[90px] text-xs font-bold">
                      Severity
                    </TableHead>
                    <TableHead className="w-[120px] text-xs font-bold">
                      Module
                    </TableHead>
                    <TableHead className="text-xs font-bold">
                      Description
                    </TableHead>
                    <TableHead className="w-[100px] text-xs font-bold">
                      Status
                    </TableHead>
                    <TableHead className="w-[120px] text-xs font-bold">
                      Assigned To
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defects.map((defect) => (
                    <TableRow key={defect.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-mono text-xs text-gray-600">
                        {defect.bugId}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={defect.severity} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {defect.module}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p className="font-medium text-gray-900">
                          {defect.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={defect.status} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {defect.assignedTo || "Unassigned"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bug className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No defects reported</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-gray-100 pb-12 mb-8">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
            Private QA Analysis • {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  icon,
  color,
}: {
  label: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: "green" | "red" | "amber" | "gray";
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const colorClasses = {
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white/80">
      <CardContent className="p-4 sm:p-5 text-center">
        <div
          className={cn("inline-flex p-2 rounded-lg mb-2", colorClasses[color])}
        >
          {icon}
        </div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">
          {label} ({percentage}%)
        </p>
      </CardContent>
    </Card>
  );
}
