"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Bug,
  Target,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { GlobalStats, getGlobalStats } from "@/lib/aggregateStats";
import { cn } from "@/lib/utils";

export default function ExecutiveDashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadStats = async () => {
      try {
        const globalStats = await getGlobalStats();
        setStats(globalStats);
      } catch (error) {
        console.error("Failed to load global stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-xs font-bold">
              Executive View
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Global QA Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Cross-project metrics and KPI overview
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" className="cursor-pointer">
              Project Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Overall Pass Rate"
          value={`${stats.overallPassRate}%`}
          icon={<Target className="w-5 h-5" />}
          trend={stats.overallPassRate >= 80 ? "positive" : "negative"}
          subtitle={`${stats.totalPassed} of ${stats.totalTestCases} tests`}
        />
        <KPICard
          title="Active Projects"
          value={stats.activeProjects.toString()}
          icon={<Sparkles className="w-5 h-5" />}
          subtitle={`${stats.totalProjects} total projects`}
        />
        <KPICard
          title="Open Defects"
          value={stats.totalDefectsOpen.toString()}
          icon={<Bug className="w-5 h-5" />}
          trend={stats.totalDefectsOpen === 0 ? "positive" : "warning"}
          subtitle={`${stats.totalDefectsClosed} resolved`}
        />
        <KPICard
          title="Test Coverage"
          value={stats.totalTestCases.toString()}
          icon={<BarChart3 className="w-5 h-5" />}
          subtitle="Total test cases"
        />
      </div>

      {/* Test Status Breakdown */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Test Execution Summary
          </CardTitle>
          <CardDescription>
            Aggregate status across all projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusBlock
              label="Passed"
              value={stats.totalPassed}
              color="bg-green-500"
              icon={<CheckCircle2 className="w-4 h-4" />}
            />
            <StatusBlock
              label="Failed"
              value={stats.totalFailed}
              color="bg-red-500"
              icon={<XCircle className="w-4 h-4" />}
            />
            <StatusBlock
              label="Pending"
              value={stats.totalPending}
              color="bg-amber-500"
              icon={<Clock className="w-4 h-4" />}
            />
            <StatusBlock
              label="Blocked"
              value={stats.totalBlocked}
              color="bg-gray-500"
              icon={<AlertTriangle className="w-4 h-4" />}
            />
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
              {stats.totalTestCases > 0 && (
                <>
                  <div
                    className="bg-green-500 transition-all"
                    style={{
                      width: `${(stats.totalPassed / stats.totalTestCases) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-red-500 transition-all"
                    style={{
                      width: `${(stats.totalFailed / stats.totalTestCases) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-amber-500 transition-all"
                    style={{
                      width: `${(stats.totalPending / stats.totalTestCases) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-gray-400 transition-all"
                    style={{
                      width: `${(stats.totalBlocked / stats.totalTestCases) * 100}%`,
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Health Cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Project Health Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.projectBreakdown.map(({ project, stats: projectStats }) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block"
            >
              <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: project.color || "#6366F1" }}
                      >
                        {project.shortCode?.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {projectStats.totalTestCases} tests
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Pass Rate</span>
                        <span
                          className={cn(
                            "font-bold",
                            projectStats.passRate >= 80
                              ? "text-green-600"
                              : projectStats.passRate >= 60
                                ? "text-amber-600"
                                : "text-red-600",
                          )}
                        >
                          {projectStats.passRate}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            projectStats.passRate >= 80
                              ? "bg-green-500"
                              : projectStats.passRate >= 60
                                ? "bg-amber-500"
                                : "bg-red-500",
                          )}
                          style={{ width: `${projectStats.passRate}%` }}
                        />
                      </div>
                    </div>

                    {projectStats.defectsOpen > 0 && (
                      <Badge
                        variant="outline"
                        className="text-red-600 border-red-200 bg-red-50"
                      >
                        <Bug className="w-3 h-3 mr-1" />
                        {projectStats.defectsOpen}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  trend,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "positive" | "negative" | "warning";
  subtitle?: string;
}) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "p-2 rounded-lg",
              trend === "positive"
                ? "bg-green-100 text-green-600"
                : trend === "negative"
                  ? "bg-red-100 text-red-600"
                  : trend === "warning"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-primary/10 text-primary",
            )}
          >
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-black text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBlock({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
      <div className={cn("p-2 rounded-lg text-white", color)}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
