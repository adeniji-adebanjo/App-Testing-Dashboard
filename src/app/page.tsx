"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Shield, BarChart3 } from "lucide-react";
import { loadProjects } from "@/lib/projectStorage";
import { Project } from "@/types/project";

export default function PublicProjectsIndexPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const allProjects = await loadProjects();
        // Only show active projects
        setProjects(allProjects.filter((p) => p.status === "active"));
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6">
        <div className="max-w-5xl mx-auto py-8 sm:py-12 text-center">
          <Badge
            variant="outline"
            className="mb-4 text-[9px] sm:text-[10px] uppercase font-black gap-1.5 bg-green-50 text-green-700 border-green-200 px-2.5 py-1"
          >
            <Shield size={12} className="sm:w-3 sm:h-3" />
            Public QA Portal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter leading-tight">
            Quality Assurance summaries
          </h1>
          <p className="text-gray-500 mt-3 max-w-sm mx-auto text-sm sm:text-base leading-relaxed font-medium">
            Review live quality benchmarks and testing status for active
            projects.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {projects.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white/50 rounded-3xl border border-dashed border-gray-200">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">
              No Active Reports
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Check back later for updated project statuses.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/public/projects/${project.id}`}
                className="block group"
              >
                <Card className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 h-full overflow-hidden bg-white/70 backdrop-blur-sm group-hover:-translate-y-1">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start sm:items-center gap-4">
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black shrink-0 text-xl shadow-xl shadow-current/20"
                        style={{
                          backgroundColor: project.color || "#6366F1",
                        }}
                      >
                        {project.shortCode?.slice(0, 2) || "PR"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-black text-gray-900 group-hover:text-primary transition-colors truncate text-base sm:text-lg">
                            {project.name}
                          </h3>
                          <ExternalLink
                            size={14}
                            className="text-gray-400 group-hover:text-primary transition-colors shrink-0"
                          />
                        </div>
                        <Badge
                          variant="outline"
                          className="mt-1.5 text-[9px] uppercase font-black tracking-[0.1em] border-gray-100 bg-gray-50/50"
                        >
                          {project.phase}
                        </Badge>
                        {project.description && (
                          <p className="text-xs text-gray-500 mt-2.5 line-clamp-2 leading-relaxed font-medium">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-16 border-t border-gray-100 mt-16 pb-8">
          <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-widest">
            Powered by Adebanjo Adeniji
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gray-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] inline-flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              <ExternalLink size={12} />
              QA Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
