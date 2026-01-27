"use client";

import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestEnvironment } from "@/types/test-case";
import { useEnvironments, useUpdateEnvironments } from "@/hooks/useTestData";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function TestEnvironmentSetup() {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const { data: savedEnvironments, isLoading } = useEnvironments(projectId);
  const updateEnvironments = useUpdateEnvironments(projectId);

  const [environments, setEnvironments] = useState<TestEnvironment[]>([]);

  useEffect(() => {
    if (savedEnvironments && savedEnvironments.length > 0) {
      setEnvironments(savedEnvironments);
    } else if (currentProject) {
      setEnvironments(currentProject.environments || []);
    }
  }, [savedEnvironments, currentProject]);

  const toggleStatus = (index: number) => {
    const updated: TestEnvironment[] = environments.map((env, i) =>
      i === index
        ? {
            ...env,
            status: (env.status === "ready" ? "pending" : "ready") as
              | "ready"
              | "pending",
          }
        : env,
    );
    setEnvironments(updated);
    updateEnvironments.mutate(updated);
  };

  if (isLoading && !environments.length) {
    return (
      <Card className="border-none shadow-sm bg-white/50">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Server size={20} className="text-blue-500" />
          Test Environment Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Component
                </th>
                <th className="pb-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {environments.map((env, index) => (
                <tr
                  key={index}
                  className="group/row hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">
                        {env.component}
                      </span>
                      <span className="text-xs text-gray-500">
                        {env.details || "No details provided"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge
                      className={
                        env.status === "ready"
                          ? "bg-green-100 text-green-700 hover:bg-green-100 border-none px-2.5"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-50 border-none px-2.5"
                      }
                    >
                      {env.status === "ready" ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Pending</span>
                        </div>
                      )}
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleStatus(index)}
                      className={
                        env.status === "ready"
                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                          : "text-green-600 hover:text-green-700 hover:bg-green-100"
                      }
                    >
                      {env.status === "ready" ? "Reset" : "Mark Ready"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
