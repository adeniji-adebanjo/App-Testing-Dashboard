"use client";

import { useState, useEffect, useMemo } from "react";
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
import { cn, getStatusColor } from "@/lib/utils";
import { useMetrics, useUpdateMetrics } from "@/hooks/useTestData";
import { useProject } from "@/context/ProjectContext";
import { CheckCircle2, XCircle, Clock, Target, Edit2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function MetricsDashboard() {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const { data: savedMetrics, isLoading } = useMetrics(projectId);
  const updateMutation = useUpdateMetrics(projectId);

  const [editingId, setEditingId] = useState<string | null>(null);

  const metrics = useMemo(() => {
    if (savedMetrics && savedMetrics.length > 0) return savedMetrics;
    // We don't have explicit metrics in seed data yet, so we'll use a default set
    // In a real app, these would come from the Project definition
    return [
      {
        id: "m1",
        metric: "System Availability",
        target: "99.9%",
        actualResult: "",
        status: "pending",
      },
      {
        id: "m2",
        metric: "Average Response Time",
        target: "< 200ms",
        actualResult: "",
        status: "pending",
      },
      {
        id: "m3",
        metric: "User Adoption Rate",
        target: "80%",
        actualResult: "",
        status: "pending",
      },
    ] as SuccessMetric[];
  }, [savedMetrics]);

  const updateMetric = (
    id: string,
    field: keyof SuccessMetric,
    value: string,
  ) => {
    const updated = metrics.map((m) =>
      m.id === id ? { ...m, [field]: value, projectId } : m,
    );
    updateMutation.mutate(updated);
  };

  const metStats = {
    total: metrics.length,
    met: metrics.filter((m) => m.status === "met").length,
    notMet: metrics.filter((m) => m.status === "not-met").length,
    pending: metrics.filter((m) => m.status === "pending").length,
  };

  const achievementRate =
    metrics.length > 0 ? (metStats.met / metrics.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 shadow-sm p-6 rounded-xl bg-white/50">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <CardStat
          label="Total Metrics"
          value={metStats.total}
          icon={<Target size={16} />}
        />
        <CardStat
          label="Success Rate"
          value={`${achievementRate.toFixed(0)}%`}
          icon={<CheckCircle2 size={16} />}
          color="text-green-600"
        />
        <CardStat
          label="Items Pending"
          value={metStats.pending}
          icon={<Clock size={16} />}
          color="text-amber-500"
        />
        <CardStat
          label="Not Met"
          value={metStats.notMet}
          icon={<XCircle size={16} />}
          color="text-red-500"
        />
      </div>

      {/* Metrics Detail Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-md shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Success Metric
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Target
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Actual Value
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Approval
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {metrics.map((metric) => (
              <tr
                key={metric.id}
                className="group hover:bg-gray-50/30 transition-colors"
              >
                <td className="p-4">
                  <span className="text-sm font-bold text-gray-900">
                    {metric.metric}
                  </span>
                </td>
                <td className="p-4">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs border-gray-100 bg-gray-50/50"
                  >
                    {metric.target}
                  </Badge>
                </td>
                <td className="p-4">
                  {editingId === metric.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={metric.actualResult}
                        onChange={(e) =>
                          updateMetric(
                            metric.id,
                            "actualResult",
                            e.target.value,
                          )
                        }
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setEditingId(null)
                        }
                        autoFocus
                        className="h-8 text-sm focus-visible:ring-primary"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingId(metric.id)}
                      className="group/val flex items-center justify-between cursor-text text-sm font-medium text-gray-600 bg-gray-50/30 hover:bg-gray-100/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                    >
                      <span>{metric.actualResult || "Log Result..."}</span>
                      <Edit2
                        size={12}
                        className="text-gray-300 opacity-0 group-hover/val:opacity-100 transition-opacity"
                      />
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <Select
                    value={metric.status}
                    onValueChange={(value: SuccessMetric["status"]) =>
                      updateMetric(metric.id, "status", value)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "h-8 w-32 border-none shadow-none text-xs font-bold uppercase tracking-tight",
                        metric.status === "met"
                          ? "bg-green-100 text-green-700"
                          : metric.status === "not-met"
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100 text-gray-500",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="met">Met</SelectItem>
                      <SelectItem value="not-met">Not Met</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Roadmap Card */}
      <div className="p-8 rounded-3xl bg-linear-to-br from-gray-900 to-gray-800 text-white shadow-xl shadow-gray-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-xl font-black">Overall Project Performance</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              We've successfully validated {metStats.met} out of{" "}
              {metrics.length} critical success criteria for{" "}
              {currentProject?.name}.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-700"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-primary transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray={`${achievementRate * 2.51}, 251`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-xl">
                {achievementRate.toFixed(0)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                Master Status
              </p>
              <p className="text-lg font-bold">
                {achievementRate >= 80
                  ? "Operational"
                  : achievementRate >= 40
                    ? "Steady Progress"
                    : "Initial Validation"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardStat({
  label,
  value,
  icon,
  color = "text-gray-900",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white/50 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={cn("text-2xl font-black", color)}>{value}</p>
    </div>
  );
}
