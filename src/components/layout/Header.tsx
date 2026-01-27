"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Save, CheckCircle2 } from "lucide-react";
import { getLastUpdated } from "@/lib/storage";
import { exportSummaryReport } from "@/lib/export";

// Helper function to get initial last saved time
function getInitialLastSaved(): string {
  if (typeof window === "undefined") return "";
  const last = getLastUpdated();
  return last ? new Date(last).toLocaleTimeString() : "";
}

export default function Header() {
  // Use lazy initialization instead of useEffect to avoid cascading renders
  const [lastSaved, setLastSaved] = useState<string>(getInitialLastSaved);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    const now = new Date().toLocaleTimeString();
    setLastSaved(now);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleExport = () => {
    // Generate a simple generic summary for the global header export
    const genericSummary = `TESTING PORTAL SUMMARY REPORT
Generated: ${new Date().toLocaleString()}
====================================

This is a quick export from the main portal header.
For detailed project-specific reports, navigate to the project's Reports page.
`;
    exportSummaryReport(genericSummary, "testing-portal");
  };

  return (
    <header className="hidden lg:flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
          Testing Portal
        </h2>
        <p className="hidden text-sm text-gray-500 sm:block">
          QA Dashboard & Test Management
          {lastSaved && <span className="ml-2">• Last saved: {lastSaved}</span>}
        </p>
      </div>
      <div className="flex shrink-0 gap-2 sm:gap-3">
        <Button
          onClick={handleSave}
          variant="outline"
          className="gap-2 cursor-pointer"
          size="sm"
        >
          {showSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="hidden sm:inline">Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Progress</span>
            </>
          )}
        </Button>
        <Button
          onClick={handleExport}
          className="gap-2 cursor-pointer"
          size="sm"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Report</span>
        </Button>
      </div>
    </header>
  );
}
