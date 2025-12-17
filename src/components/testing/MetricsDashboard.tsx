"use client";

import { useState, useEffect } from "react";
import { SuccessMetric } from "@/types/test-case";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusColor } from "@/lib/utils";
import { saveMetrics, loadMetrics } from "@/lib/storage";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const defaultMetrics: SuccessMetric[] = [
  {
    id: "1",
    metric: "Reduction in duplicate daily spooling",
    target: "≥90%",
    actualResult: "",
    status: "pending",
  },
  {
    id: "2",
    metric: "API-based spooling transition",
    target: "100%",
    actualResult: "",
    status: "pending",
  },
  {
    id: "3",
    metric: "User satisfaction",
    target: "≥80%",
    actualResult: "",
    status: "pending",
  },
  {
    id: "4",
    metric: "Report retrieval time",
    target: "<2 seconds",
    actualResult: "",
    status: "pending",
  },
];

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<SuccessMetric[]>(defaultMetrics);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadMetrics();
    if (loaded.length > 0) {
      setMetrics(loaded);
    }
  }, []);

  useEffect(() => {
    if (metrics.some((m) => m.actualResult || m.status !== "pending")) {
      saveMetrics(metrics);
    }
  }, [metrics]);

  const updateMetric = (
    id: string,
    field: keyof SuccessMetric,
    value: string
  ) => {
    setMetrics(
      metrics.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const metStats = {
    total: metrics.length,
    met: metrics.filter((m) => m.status === "met").length,
    notMet: metrics.filter((m) => m.status === "not-met").length,
    pending: metrics.filter((m) => m.status === "pending").length,
  };

  const achievementRate =
    metrics.length > 0
      ? ((metStats.met / metrics.length) * 100).toFixed(0)
      : "0";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Metrics</p>
          <p className="mt-2 text-2xl font-bold">{metStats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Met</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {metStats.met}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Not Met</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {metStats.notMet}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Achievement Rate</p>
          <p className="mt-2 text-2xl font-bold">{achievementRate}%</p>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">
                Success Metric
              </th>
              <th className="p-3 text-left text-sm font-semibold">Target</th>
              <th className="p-3 text-left text-sm font-semibold">
                Actual Result
              </th>
              <th className="p-3 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id} className="border-b hover:bg-muted/50">
                <td className="p-3 text-sm font-medium">{metric.metric}</td>
                <td className="p-3 text-sm">{metric.target}</td>
                <td className="p-3">
                  {editingId === metric.id ? (
                    <Input
                      value={metric.actualResult}
                      onChange={(e) =>
                        updateMetric(metric.id, "actualResult", e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      placeholder="Enter actual result..."
                      className="max-w-xs"
                    />
                  ) : (
                    <span
                      onClick={() => setEditingId(metric.id)}
                      className="cursor-pointer text-sm hover:bg-gray-100 rounded px-2 py-1"
                    >
                      {metric.actualResult || "Click to add..."}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <Select
                    value={metric.status}
                    onValueChange={(value: SuccessMetric["status"]) =>
                      updateMetric(metric.id, "status", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="met">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          Met
                        </div>
                      </SelectItem>
                      <SelectItem value="not-met">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3" />
                          Not Met
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progress Indicator */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Achievement Rate</span>
            <span className="font-semibold">{achievementRate}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-green-500 transition-all"
              style={{ width: `${achievementRate}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              Met: {metStats.met}
            </span>
            <span className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              Not Met: {metStats.notMet}
            </span>
            <span className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              Pending: {metStats.pending}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
