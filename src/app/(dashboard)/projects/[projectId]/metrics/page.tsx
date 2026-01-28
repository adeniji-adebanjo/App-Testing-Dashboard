"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricsDashboard from "@/components/testing/MetricsDashboard";
import { Info, Target } from "lucide-react";

export default function ProjectMetricsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Success Metrics
        </h1>
        <p className="mt-2 text-gray-500">
          Track KPIs and business objectives validation status
        </p>
      </div>

      <MetricsDashboard />

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Info size={16} className="text-blue-500" />
            Evaluation Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Target size={14} className="text-primary" />
                Data-Driven Validation
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                All metrics must be backed by quantitative data from production
                logs, user surveys, or system performance monitoring tools.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Target size={14} className="text-primary" />
                Stakeholder Review
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Final status updates (Met/Not Met) require sign-off from the
                respective department leads and project sponsors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
