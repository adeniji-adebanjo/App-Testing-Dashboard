"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DefectTracker from "@/components/testing/DefectTracker";
import { AlertCircle, ShieldAlert } from "lucide-react";

export default function ProjectDefectsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Defect Tracking
        </h1>
        <p className="mt-2 text-gray-500">
          Monitor and resolve project-specific bugs and issues
        </p>
      </div>

      <DefectTracker />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-600">
              <AlertCircle size={16} className="text-primary" />
              Prioritization Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-red-500 h-2 w-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <div>
                  <p className="text-xs font-bold text-gray-900 uppercase">
                    Critical
                  </p>
                  <p className="text-xs text-gray-500">
                    Blockers that halt testing or affect core security/data.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-orange-500 h-2 w-2 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                <div>
                  <p className="text-xs font-bold text-gray-900 uppercase">
                    High
                  </p>
                  <p className="text-xs text-gray-500">
                    Major features broken with no easy workaround.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-600">
              <ShieldAlert size={16} className="text-green-600" />
              Resolution Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">
                  1
                </div>
                Identify and log defect with clear steps
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">
                  2
                </div>
                Assign to developer and mark In-Progress
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">
                  3
                </div>
                Verify fix in staging and move to Resolved
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
