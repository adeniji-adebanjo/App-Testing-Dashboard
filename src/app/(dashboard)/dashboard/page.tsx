"use client";

import { useProject } from "@/context/ProjectContext";
import ProjectCard from "@/components/project/ProjectCard";
import ProjectListItem from "@/components/project/ProjectListItem";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProjectWithStats } from "@/types/project";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProjectHubPage() {
  const { projects, isLoading, getProjectWithStats } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectWithStats, setProjectWithStats] = useState<ProjectWithStats[]>(
    [],
  );
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load stats for all projects
  useMemo(() => {
    const loadAllStats = async () => {
      setIsStatsLoading(true);
      try {
        const results = await Promise.all(
          projects.map((p) => getProjectWithStats(p.id)),
        );
        setProjectWithStats(
          results.filter((r): r is ProjectWithStats => r !== null),
        );
      } catch (err) {
        console.error("Error loading project stats:", err);
      } finally {
        setIsStatsLoading(false);
      }
    };

    if (projects.length > 0) {
      loadAllStats();
    } else if (!isLoading) {
      setIsStatsLoading(false);
    }
  }, [projects, getProjectWithStats, isLoading]);

  const filteredProjects = projectWithStats.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Project Hub
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl">
            Central management for all testing dashboards. Monitor progress,
            manage test cases, and track defects across your portfolio.
          </p>
        </div>
        <Button
          asChild
          className="w-full md:w-auto shadow-lg shadow-primary/20 hover:shadow-xl transition-all gap-2 py-6 cursor-pointer"
        >
          <Link href="/new-project">
            <Plus size={18} />
            Create New Project
          </Link>
        </Button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            className="pl-10 bg-gray-50/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-gray-600 bg-white"
          >
            <Filter size={14} />
            Filter
          </Button>
          <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block" />
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-7 w-7 p-0 transition-all",
                viewMode === "grid"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              <LayoutGrid size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-7 w-7 p-0 transition-all",
                viewMode === "list"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              <List size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Container */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-4",
        )}
      >
        {isLoading || isStatsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl overflow-hidden border border-gray-100 bg-white p-6 space-y-4",
                viewMode === "grid"
                  ? "h-[380px]"
                  : "h-[100px] flex items-center justify-between gap-6 space-y-0 py-0",
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              {viewMode === "grid" && (
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-1.5 w-full" />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              )}
              <div className={viewMode === "grid" ? "pt-6" : "shrink-0"}>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) =>
            viewMode === "grid" ? (
              <ProjectCard key={project.id} project={project} />
            ) : (
              <ProjectListItem key={project.id} project={project} />
            ),
          )
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No projects found
            </h3>
            <p className="text-gray-500 mt-1 max-w-xs mx-auto">
              We couldn&apos;t find any projects matching your search criteria.
              Try a different keyword.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Newsletter or Info Section */}
      <div className="mt-12 bg-linear-to-br from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-none text-[10px] font-bold uppercase tracking-wider">
            Coming Soon: PRD Auto-Checklist
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Accelerate your testing setup with AI
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg leading-relaxed">
            Upload your Product Requirement Documents (PRD) and let our
            intelligent engine generate comprehensive test cases and checklists
            automatically.
          </p>
          <Button variant="default" className="shadow-lg shadow-primary/30">
            Join the Waitlist
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-30" />
      </div>
    </div>
  );
}
