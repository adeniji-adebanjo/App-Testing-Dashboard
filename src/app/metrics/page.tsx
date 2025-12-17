"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricsDashboard from "@/components/testing/MetricsDashboard";

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Success Metrics</h1>
        <p className="mt-2 text-gray-600">
          Track and validate key success metrics against targets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Success Metrics Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricsDashboard />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metric Evaluation Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">
              Reduction in Duplicate Spooling
            </h4>
            <p className="text-sm text-gray-600">
              Compare the number of duplicate requests before and after
              implementation. Calculate the percentage reduction. Target: ≥90%
              reduction.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">
              API-Based Spooling Transition
            </h4>
            <p className="text-sm text-gray-600">
              Measure the percentage of reports pulled via API vs manual
              methods. Target: 100% API-based once integration is complete.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">User Satisfaction</h4>
            <p className="text-sm text-gray-600">
              Conduct user surveys with underwriting and operations teams.
              Target: ≥80% positive satisfaction rating.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">
              Report Retrieval Time
            </h4>
            <p className="text-sm text-gray-600">
              Measure the average time from request initiation to report
              availability. Target: `&lt;` 2 seconds for API-based requests.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
