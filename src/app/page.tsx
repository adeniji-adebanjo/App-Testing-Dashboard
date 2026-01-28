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
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <Badge
            variant="outline"
            className="mb-4 text-xs gap-1 bg-green-50 text-green-700 border-green-200"
          >
            <Shield size={12} />
            Public Reports
          </Badge>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            QA Testing Portal
          </h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            View read-only quality assurance summaries for active projects
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">
              No Public Projects
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              There are no active projects available for public viewing.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/public/projects/${project.id}`}
                className="block group"
              >
                <Card className="border-none shadow-md hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                        style={{
                          backgroundColor: project.color || "#6366F1",
                        }}
                      >
                        {project.shortCode?.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                          {project.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="mt-1 text-[10px] uppercase"
                        >
                          {project.phase}
                        </Badge>
                        {project.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink
                        size={16}
                        className="text-gray-300 group-hover:text-primary transition-colors shrink-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-12 border-t border-gray-200 mt-12">
          <p className="text-sm text-gray-400">
            Powered by TestPortal • {new Date().getFullYear()}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
          >
            <ExternalLink size={12} />
            Access Full Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
