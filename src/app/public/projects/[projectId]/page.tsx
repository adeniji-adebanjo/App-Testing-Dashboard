"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Bug,
  Target,
  Shield,
  ExternalLink,
} from "lucide-react";
import { loadProjects, getProjectStats } from "@/lib/projectStorage";
import { Project, ProjectStats } from "@/types/project";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PublicProjectSummaryPage() {
  const { projectId } = useParams();
  const id = projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const projects = await loadProjects();
        const foundProject = projects.find((p) => p.id === id);

        if (!foundProject) {
          setError("Project not found");
          return;
        }

        setProject(foundProject);
        const projectStats = await getProjectStats(id);
        setStats(projectStats);
      } catch (err) {
        setError("Failed to load project data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (error || !project || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-none shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {error || "Project Not Found"}
            </h2>
            <p className="text-gray-500 text-sm">
              The project you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Public Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: project.color || "#6366F1" }}
            >
              {project.shortCode?.slice(0, 2)}
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{project.name}</h1>
              <p className="text-xs text-gray-500">Quality Assurance Summary</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs gap-1 bg-green-50 text-green-700 border-green-200"
          >
            <Shield size={12} />
            Public Report
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Project Info */}
        <div className="text-center max-w-2xl mx-auto">
          <Badge
            variant="outline"
            className="mb-4 text-xs uppercase tracking-wider"
          >
            {project.phase}
          </Badge>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {project.name}
          </h2>
          {project.description && (
            <p className="text-gray-500 mt-3 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Primary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Pass Rate"
            value={`${stats.passRate}%`}
            icon={<Target className="w-5 h-5" />}
            color={
              stats.passRate >= 80
                ? "green"
                : stats.passRate >= 60
                  ? "amber"
                  : "red"
            }
          />
          <StatCard
            label="Total Tests"
            value={stats.totalTestCases.toString()}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Open Defects"
            value={stats.defectsOpen.toString()}
            icon={<Bug className="w-5 h-5" />}
            color={stats.defectsOpen === 0 ? "green" : "red"}
          />
          <StatCard
            label="Resolved"
            value={stats.defectsClosed.toString()}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
          />
        </div>

        {/* Test Execution Breakdown */}
        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-lg">Test Execution Status</CardTitle>
            <CardDescription>
              Current testing progress for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatusBlock
                label="Passed"
                value={stats.passed}
                total={stats.totalTestCases}
                color="bg-green-500"
                icon={<CheckCircle2 className="w-4 h-4" />}
              />
              <StatusBlock
                label="Failed"
                value={stats.failed}
                total={stats.totalTestCases}
                color="bg-red-500"
                icon={<XCircle className="w-4 h-4" />}
              />
              <StatusBlock
                label="Pending"
                value={stats.pending}
                total={stats.totalTestCases}
                color="bg-amber-500"
                icon={<Clock className="w-4 h-4" />}
              />
              <StatusBlock
                label="Blocked"
                value={stats.blocked}
                total={stats.totalTestCases}
                color="bg-gray-500"
                icon={<AlertTriangle className="w-4 h-4" />}
              />
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Overall Progress</span>
                <span>
                  {stats.passed + stats.failed} of {stats.totalTestCases}{" "}
                  executed
                </span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                {stats.totalTestCases > 0 && (
                  <>
                    <div
                      className="bg-green-500 transition-all"
                      style={{
                        width: `${(stats.passed / stats.totalTestCases) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{
                        width: `${(stats.failed / stats.totalTestCases) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-amber-500 transition-all"
                      style={{
                        width: `${(stats.pending / stats.totalTestCases) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-gray-400 transition-all"
                      style={{
                        width: `${(stats.blocked / stats.totalTestCases) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 mb-2">
            Generated by Adebanjo Adeniji • {new Date().toLocaleDateString()}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink size={12} />
            Access Full Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "green" | "red" | "amber" | "blue";
}) {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-5">
        <div className={cn("p-2 rounded-lg w-fit", colorClasses[color])}>
          {icon}
        </div>
        <p className="text-3xl font-black text-gray-900 mt-3">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function StatusBlock({
  label,
  value,
  total,
  color,
  icon,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-md text-white", color)}>{icon}</div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{percentage}% of total</p>
    </div>
  );
}
