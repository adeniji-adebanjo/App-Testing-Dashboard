"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Save, CheckCircle2 } from "lucide-react";
import { getLastUpdated } from "@/lib/storage";
import { exportSummaryReport } from "@/lib/export";
import { formatDate } from "@/lib/utils";

export default function Header() {
  const [lastSaved, setLastSaved] = useState<string>("");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const last = getLastUpdated();
    if (last) {
      setLastSaved(new Date(last).toLocaleTimeString());
    }
  }, []);

  const handleSave = () => {
    // Data is automatically saved via localStorage in each component
    // This just provides user feedback
    const now = new Date().toLocaleTimeString();
    setLastSaved(now);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleExport = () => {
    exportSummaryReport();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Credit Bureau Report Management
        </h2>
        <p className="text-sm text-gray-500">
          Testing Objectives & Plan
          {lastSaved && <span className="ml-2">• Last saved: {lastSaved}</span>}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={handleSave} variant="outline" className="gap-2">
          {showSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Progress
            </>
          )}
        </Button>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
    </header>
  );
}
