"use client";

import { useProject } from "@/context/ProjectContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projectId } = useParams();
  const { setCurrentProjectById, isLoading: contextLoading } = useProject();
  const [loadState, setLoadState] = useState<
    "loading" | "success" | "not-found"
  >("loading");
  const router = useRouter();
  const loadAttemptedRef = useRef(false);

  useEffect(() => {
    // Reset state when projectId changes
    if (projectId && typeof projectId === "string") {
      // Prevent duplicate load attempts for the same projectId
      if (loadAttemptedRef.current) return;
      loadAttemptedRef.current = true;

      const load = async () => {
        try {
          const success = await setCurrentProjectById(projectId);
          if (success) {
            setLoadState("success");
          } else {
            setLoadState("not-found");
          }
        } catch (error) {
          console.error("Error loading project:", error);
          setLoadState("not-found");
        }
      };
      load();
    }

    // Reset ref when projectId changes
    return () => {
      loadAttemptedRef.current = false;
    };
  }, [projectId, setCurrentProjectById]);

  // Redirect to home if project not found (after loading completes)
  useEffect(() => {
    if (loadState === "not-found" && !contextLoading) {
      router.push("/dashboard");
    }
  }, [loadState, contextLoading, router]);

  if (loadState === "loading" || contextLoading) {
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
      <ErrorBoundaryWrapper context="project content">
        {children}
      </ErrorBoundaryWrapper>
    </div>
  );
}
