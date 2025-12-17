"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Printer,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  exportAsJSON,
  exportTestCasesAsCSV,
  exportDefectsAsCSV,
  exportSummaryReport,
  printReport,
  generateSummaryReport,
} from "@/lib/export";
import { exportAllData } from "@/lib/storage";

export default function ReportsPage() {
  const [summary, setSummary] = useState("");
  const [stats, setStats] = useState({
    totalTests: 0,
    passed: 0,
    failed: 0,
    pending: 0,
    defects: 0,
    criticalDefects: 0,
  });

  useEffect(() => {
    // Generate summary report
    const report = generateSummaryReport();
    setSummary(report);

    // Calculate stats
    const data = exportAllData();
    const testCases = data.testCases || [];
    const defects = data.defects || [];

    setStats({
      totalTests: testCases.length,
      passed: testCases.filter((tc) => tc.status === "pass").length,
      failed: testCases.filter((tc) => tc.status === "fail").length,
      pending: testCases.filter((tc) => tc.status === "pending").length,
      defects: defects.length,
      criticalDefects: defects.filter((d) => d.severity === "critical").length,
    });
  }, []);

  const exportOptions = [
    {
      title: "Summary Report",
      description: "Text file with testing overview and statistics",
      icon: FileText,
      action: exportSummaryReport,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Test Cases (CSV)",
      description: "Spreadsheet with all test cases and results",
      icon: FileSpreadsheet,
      action: exportTestCasesAsCSV,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Defects (CSV)",
      description: "Spreadsheet with all logged defects",
      icon: FileSpreadsheet,
      action: exportDefectsAsCSV,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "All Data (JSON)",
      description: "Complete data export in JSON format",
      icon: FileJson,
      action: exportAsJSON,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
        <p className="mt-2 text-gray-600">
          Generate and export testing reports in various formats
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Tests</div>
            <div className="mt-2 text-2xl font-bold">{stats.totalTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Passed</div>
            <div className="mt-2 text-2xl font-bold text-green-600">
              {stats.passed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Failed</div>
            <div className="mt-2 text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="mt-2 text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Defects</div>
            <div className="mt-2 text-2xl font-bold">{stats.defects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Critical</div>
            <div className="mt-2 text-2xl font-bold text-red-600">
              {stats.criticalDefects}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Download testing data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {exportOptions.map((option) => (
              <div
                key={option.title}
                className="flex items-start gap-4 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
              >
                <div className={`rounded-lg p-3 ${option.bgColor}`}>
                  <option.icon className={`h-6 w-6 ${option.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{option.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {option.description}
                  </p>
                  <Button
                    onClick={option.action}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Testing Summary</CardTitle>
              <CardDescription>
                Quick overview of testing progress
              </CardDescription>
            </div>
            <Button onClick={printReport} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm font-mono">
            {summary}
          </pre>
        </CardContent>
      </Card>

      {/* Report Generation Info */}
      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Report Date</p>
              <p className="text-sm text-gray-600">
                Reports include the generation date and time for tracking
                purposes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Real-time Data</p>
              <p className="text-sm text-gray-600">
                All exports use the latest data from your testing session
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium">Data Validation</p>
              <p className="text-sm text-gray-600">
                Ensure all test cases and defects are properly documented before
                exporting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
