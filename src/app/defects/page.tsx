"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DefectTracker from "@/components/testing/DefectTracker";

export default function DefectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Defect Tracking</h1>
        <p className="mt-2 text-gray-600">
          Log and manage bugs discovered during testing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Defect Log</CardTitle>
        </CardHeader>
        <CardContent>
          <DefectTracker />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Severity Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                CRITICAL
              </div>
              <p className="text-sm text-gray-700">
                System crash, data loss, security breach
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                HIGH
              </div>
              <p className="text-sm text-gray-700">
                Major functionality broken, no workaround
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                MEDIUM
              </div>
              <p className="text-sm text-gray-700">
                Feature partially broken, workaround exists
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                LOW
              </div>
              <p className="text-sm text-gray-700">
                Minor cosmetic issue, minimal impact
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
