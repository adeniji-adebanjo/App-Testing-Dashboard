"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Bug,
  Target,
  Monitor,
  Smartphone,
  FileText,
} from "lucide-react";
import { loadProjects, getProjectStats } from "@/lib/projectStorage";
import { Project, ProjectStats } from "@/types/project";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PublicProjectSummaryPage() {
  const { projectId } = useParams();
  const id = projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const foundProject = await loadProjects().then((projects) =>
          projects.find((p) => p.id === id),
        );

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Project Info */}
      <div className="text-center max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1 bg-gray-50 border-gray-100"
          >
            {project.phase}
          </Badge>
          <Badge
            variant="outline"
            className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1 bg-primary/5 text-primary border-none flex items-center gap-1.5"
          >
            {project.projectType === "mobile" ? (
              <Smartphone size={10} strokeWidth={3} />
            ) : (
              <Monitor size={10} strokeWidth={3} />
            )}
            {project.projectType === "mobile" ? "Mobile App" : "Web Portal"}
          </Badge>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter leading-tight">
          {project.name}
        </h2>
        {project.description && (
          <p className="text-gray-500 mt-3 text-sm sm:text-base leading-relaxed font-medium">
            {project.description}
          </p>
        )}
      </div>

      {/* Primary Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 px-2 sm:px-0">
        <StatCard
          label="Pass Rate"
          value={`${stats.passRate}%`}
          icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
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
          icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="blue"
        />
        <StatCard
          label="Open Defects"
          value={stats.defectsOpen.toString()}
          icon={<Bug className="w-4 h-4 sm:w-5 sm:h-5" />}
          color={stats.defectsOpen === 0 ? "green" : "red"}
        />
        <StatCard
          label="Resolved"
          value={stats.defectsClosed.toString()}
          icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="green"
        />
      </div>

      {/* Test Execution Breakdown */}
      <Card className="border-none shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm mx-2 sm:mx-0">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 sm:px-8 py-5">
          <CardTitle className="text-lg sm:text-xl font-black">
            Execution Status
          </CardTitle>
          <CardDescription className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">
            Current Performance Benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8 mt-2">
            <StatusBlock
              label="Passed"
              value={stats.passed}
              total={stats.totalTestCases}
              color="bg-green-500"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            />
            <StatusBlock
              label="Failed"
              value={stats.failed}
              total={stats.totalTestCases}
              color="bg-red-500"
              icon={<XCircle className="w-3.5 h-3.5" />}
            />
            <StatusBlock
              label="Pending"
              value={stats.pending}
              total={stats.totalTestCases}
              color="bg-amber-500"
              icon={<Clock className="w-3.5 h-3.5" />}
            />
            <StatusBlock
              label="Blocked"
              value={stats.blocked}
              total={stats.totalTestCases}
              color="bg-gray-500"
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-3 bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400">
              <span>Overall Stability</span>
              <span className="text-gray-900">
                {stats.passed + stats.failed} of {stats.totalTestCases} executed
              </span>
            </div>
            <div className="flex h-3 sm:h-4 rounded-full overflow-hidden bg-white border border-gray-100 shadow-inner">
              {stats.totalTestCases > 0 && (
                <>
                  <div
                    className="bg-green-500 transition-all duration-1000"
                    style={{
                      width: `${(stats.passed / stats.totalTestCases) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-red-500 transition-all duration-1000"
                    style={{
                      width: `${(stats.failed / stats.totalTestCases) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-1000"
                    style={{
                      width: `${(stats.pending / stats.totalTestCases) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-gray-400 transition-all duration-1000"
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

      {/* Detailed Analysis Button */}
      <div className="flex justify-center px-2 sm:px-0">
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto gap-3 py-6 shadow-lg shadow-primary/20 hover:shadow-xl transition-all font-black uppercase tracking-wider"
        >
          <Link href={`/public/projects/${id}/analysis`}>
            <FileText size={18} />
            View Detailed Analysis
          </Link>
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center pt-12 border-t border-gray-100 pb-12 mb-8 mx-2 sm:mx-0">
        <p className="text-[10px] sm:text-xs text-gray-400 mb-5 font-bold uppercase tracking-widest">
          Public QA Record • {new Date().toLocaleDateString()}
        </p>
        <Link
          href="/public"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all"
        >
          <Target size={14} />
          View All Projects
        </Link>
      </div>
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
    green: "bg-green-50 text-green-600 border border-green-100",
    red: "bg-red-50 text-red-600 border border-red-100",
    amber: "bg-amber-50 text-amber-600 border border-amber-100",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
  };

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white/80">
      <CardContent className="p-4 sm:p-5">
        <div
          className={cn("p-1.5 sm:p-2 rounded-lg w-fit", colorClasses[color])}
        >
          {icon}
        </div>
        <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2.5 sm:mt-3 tracking-tighter">
          {value}
        </p>
        <p className="text-[9px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
          {label}
        </p>
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
    <div className="p-3 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-transform hover:scale-[1.02] duration-300">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className={cn("p-1.5 rounded-lg text-white shadow-sm", color)}>
          {icon}
        </div>
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400">
          {label}
        </span>
      </div>
      <p className="text-xl sm:text-3xl font-black text-gray-900 leading-none">
        {value}
      </p>
      <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold mt-1.5 sm:mt-2">
        {percentage}% of total
      </p>
    </div>
  );
}
