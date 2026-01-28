"use client";

import { useProject } from "@/context/ProjectContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projectId } = useParams();
  const { setCurrentProjectById, currentProject, isLoading } = useProject();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (projectId && typeof projectId === "string") {
      const load = async () => {
        const success = await setCurrentProjectById(projectId);
        if (!success && !isLoading) {
          // If project not found, redirect to hub
          router.push("/");
        }
        setIsLoaded(true);
      };
      load();
    }
  }, [projectId, setCurrentProjectById, isLoading, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Breadcrumbs />
      {children}
    </div>
  );
}
