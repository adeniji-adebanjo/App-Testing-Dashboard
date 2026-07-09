"use client";

import TestRunsManager from "@/components/testing/TestRunsManager";

export default function ProjectTestRunsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Test Runs
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Execute regression, smoke and UAT cycles and track pass rate over time
          (§9, §11)
        </p>
      </div>

      <TestRunsManager />
    </div>
  );
}
