"use client";

import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";

export default function Header() {
  const handleSave = () => {
    // Implement save functionality with local storage
    alert("Data saved successfully!");
  };

  const handleExport = () => {
    // Implement export functionality
    alert("Export functionality - to be implemented");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Credit Bureau Report Management
        </h2>
        <p className="text-sm text-gray-500">Testing Objectives & Plan</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={handleSave} variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Save Progress
        </Button>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
    </header>
  );
}
