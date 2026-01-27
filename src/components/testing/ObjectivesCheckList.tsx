"use client";

import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useObjectives, useUpdateObjectives } from "@/hooks/useTestData";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ShieldCheck, ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { TestObjective } from "@/types/test-case";

export default function ObjectivesCheckList() {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const { data: savedObjectives, isLoading } = useObjectives(projectId);
  const updateObjectives = useUpdateObjectives(projectId);

  // Local state to manage toggling before mutation
  const [objectives, setObjectives] = useState<TestObjective[]>([]);

  // Sync local state when data loads or project changes
  useEffect(() => {
    if (savedObjectives && savedObjectives.length > 0) {
      setObjectives(savedObjectives);
    } else if (currentProject) {
      // Use project seed data if no saved data exists
      setObjectives(currentProject.objectives || []);
    }
  }, [savedObjectives, currentProject]);

  const toggleObjective = (id: string) => {
    const updated = objectives.map((obj) =>
      obj.id === id ? { ...obj, completed: !obj.completed } : obj,
    );
    setObjectives(updated);
    updateObjectives.mutate(updated);
  };

  const objectivesList = objectives.filter((o) => !o.id.startsWith("q"));
  const gates = objectives.filter((o) => o.id.startsWith("q"));

  const completedCount = objectivesList.filter((o) => o.completed).length;
  const gatesCompletedCount = gates.filter((g) => g.completed).length;

  if (isLoading && !objectives.length) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="border-none shadow-sm bg-white/50">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm group overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ClipboardCheck size={20} className="text-primary" />
            Primary Objectives
          </CardTitle>
          <span className="text-xs font-bold text-gray-400">
            {completedCount}/{objectivesList.length}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {objectivesList.map((objective) => (
              <div
                key={objective.id}
                className="flex items-start space-x-3 group/item"
              >
                <Checkbox
                  id={objective.id}
                  checked={objective.completed}
                  onCheckedChange={() => toggleObjective(objective.id)}
                  className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={objective.id}
                  className={`text-sm leading-relaxed cursor-pointer transition-colors ${
                    objective.completed
                      ? "text-gray-400 line-through font-medium"
                      : "text-gray-700 font-semibold group-hover/item:text-gray-900"
                  }`}
                >
                  {objective.description}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm group overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500/20 group-hover:bg-green-500 transition-colors" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck size={20} className="text-green-600" />
            Quality Gates
          </CardTitle>
          <span className="text-xs font-bold text-gray-400">
            {gatesCompletedCount}/{gates.length}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gates.map((gate) => (
              <div
                key={gate.id}
                className="flex items-start space-x-3 group/item"
              >
                <Checkbox
                  id={gate.id}
                  checked={gate.completed}
                  onCheckedChange={() => toggleObjective(gate.id)}
                  className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label
                  htmlFor={gate.id}
                  className={`text-sm leading-relaxed cursor-pointer transition-colors ${
                    gate.completed
                      ? "text-gray-400 line-through font-medium"
                      : "text-gray-700 font-semibold group-hover/item:text-gray-900"
                  }`}
                >
                  {gate.description}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
