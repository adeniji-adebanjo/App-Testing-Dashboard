"use client";

import RequirementsManager from "@/components/testing/RequirementsManager";

export default function ProjectRequirementsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Requirements &amp; Traceability
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Map requirements to test cases for coverage and audit readiness (§26,
          §28)
        </p>
      </div>

      <RequirementsManager />
    </div>
  );
}
