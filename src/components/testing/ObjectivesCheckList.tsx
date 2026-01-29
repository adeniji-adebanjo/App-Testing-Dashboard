"use client";

import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useObjectives, useUpdateObjectives } from "@/hooks/useTestData";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ShieldCheck, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { TestObjective } from "@/types/test-case";
import { cn } from "@/lib/utils";

export default function ObjectivesCheckList() {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const { data: savedObjectives, isLoading } = useObjectives(projectId);
  const updateObjectives = useUpdateObjectives(projectId);

  // Local state to manage toggling before mutation (overrides)
  const [localObjectives, setLocalObjectives] = useState<
    TestObjective[] | null
  >(null);

  // Derive the current objectives list
  const objectives =
    localObjectives ??
    (savedObjectives && savedObjectives.length > 0
      ? savedObjectives
      : currentProject?.objectives || []);

  const toggleObjective = (id: string) => {
    const updated = objectives.map((obj) =>
      obj.id === id ? { ...obj, completed: !obj.completed } : obj,
    );
    setLocalObjectives(updated);
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
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm group overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-2">
            <ClipboardCheck size={18} className="text-primary sm:w-5 sm:h-5" />
            <span className="truncate">Objectives</span>
          </CardTitle>
          <span className="text-[10px] sm:text-xs font-black text-gray-400 bg-gray-100/50 px-1.5 py-0.5 rounded">
            {completedCount}/{objectivesList.length}
          </span>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <div className="space-y-3.5">
            {objectivesList.map((objective) => (
              <div
                key={objective.id}
                className="flex items-start space-x-3 group/item p-1 -m-1 rounded-lg transition-colors hover:bg-gray-50/50"
              >
                <Checkbox
                  id={objective.id}
                  checked={objective.completed}
                  onCheckedChange={() => toggleObjective(objective.id)}
                  className="mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={objective.id}
                  className={cn(
                    "text-[13px] sm:text-sm leading-relaxed cursor-pointer transition-colors font-semibold",
                    objective.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-700 group-hover/item:text-gray-900",
                  )}
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-600 sm:w-5 sm:h-5" />
            <span className="truncate">Quality Gates</span>
          </CardTitle>
          <span className="text-[10px] sm:text-xs font-black text-gray-400 bg-gray-100/50 px-1.5 py-0.5 rounded">
            {gatesCompletedCount}/{gates.length}
          </span>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <div className="space-y-3.5">
            {gates.map((gate) => (
              <div
                key={gate.id}
                className="flex items-start space-x-3 group/item p-1 -m-1 rounded-lg transition-colors hover:bg-gray-50/50"
              >
                <Checkbox
                  id={gate.id}
                  checked={gate.completed}
                  onCheckedChange={() => toggleObjective(gate.id)}
                  className="mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label
                  htmlFor={gate.id}
                  className={cn(
                    "text-[13px] sm:text-sm leading-relaxed cursor-pointer transition-colors font-semibold",
                    gate.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-700 group-hover/item:text-gray-900",
                  )}
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
