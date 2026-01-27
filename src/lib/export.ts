import {
  TestCase,
  Defect,
  SuccessMetric,
  TestObjective,
} from "@/types/test-case";

// Export as JSON
export const exportAsJSON = (data: any, fileName?: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName || "testing-data"}-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as CSV (for test cases)
export const exportTestCasesAsCSV = (testCases: TestCase[]): void => {
  if (!testCases || testCases.length === 0) {
    alert("No test cases to export");
    return;
  }

  const headers = [
    "Test ID",
    "Module",
    "Scenario",
    "Expected Result",
    "Actual Result",
    "Status",
    "Comments",
  ];
  const rows = testCases.map((tc) => [
    tc.testCaseId,
    tc.module,
    tc.scenario,
    tc.expectedResult,
    tc.actualResult || "",
    tc.status,
    tc.comments || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `test-cases-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export defects as CSV
export const exportDefectsAsCSV = (defects: Defect[]): void => {
  if (!defects || defects.length === 0) {
    alert("No defects to export");
    return;
  }

  const headers = [
    "Bug ID",
    "Severity",
    "Module",
    "Description",
    "Steps to Reproduce",
    "Status",
    "Assigned To",
  ];
  const rows = defects.map((d) => [
    d.bugId,
    d.severity,
    d.module,
    d.description,
    d.stepsToReproduce || "",
    d.status,
    d.assignedTo || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `defects-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate summary report string
export const generateSummaryReport = (
  testCases: TestCase[] = [],
  defects: Defect[] = [],
  metrics: SuccessMetric[] = [],
  objectives: TestObjective[] = [],
  projectName: string = "CREDIT BUREAU TESTING",
): string => {
  const passedTests = testCases.filter((tc) => tc.status === "pass").length;
  const failedTests = testCases.filter((tc) => tc.status === "fail").length;
  const pendingTests = testCases.filter((tc) => tc.status === "pending").length;
  const blockedTests = testCases.filter((tc) => tc.status === "blocked").length;

  const criticalDefects = defects.filter(
    (d) => d.severity === "critical",
  ).length;
  const highDefects = defects.filter((d) => d.severity === "high").length;
  const openDefects = defects.filter((d) => d.status === "open").length;

  const completedObjectives = objectives.filter((o) => o.completed).length;
  const passRate =
    testCases.length > 0
      ? ((passedTests / testCases.length) * 100).toFixed(1)
      : "0";

  return `
${projectName.toUpperCase()} SUMMARY REPORT
Generated: ${new Date().toLocaleString()}
====================================

TEST EXECUTION SUMMARY
----------------------
Total Test Cases: ${testCases.length}
Passed: ${passedTests}
Failed: ${failedTests}
Pending: ${pendingTests}
Blocked: ${blockedTests}
Pass Rate: ${passRate}%

DEFECT SUMMARY
--------------
Total Defects: ${defects.length}
Critical: ${criticalDefects}
High Priority: ${highDefects}
Open Defects: ${openDefects}

OBJECTIVES PROGRESS
-------------------
Completed: ${completedObjectives}/${objectives.length}
Progress: ${
    objectives.length > 0
      ? ((completedObjectives / objectives.length) * 100).toFixed(1)
      : "0"
  }%

SUCCESS METRICS
---------------
${metrics.map((m) => `${m.metric}: ${m.status.toUpperCase()}`).join("\n") || "No metrics defined"}
`;
};

// Export summary report as text file
export const exportSummaryReport = (
  reportText: string,
  projectName: string = "testing",
): void => {
  const blob = new Blob([reportText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName.toLowerCase()}-summary-${
    new Date().toISOString().split("T")[0]
  }.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Print report
export const printReport = (): void => {
  window.print();
};
