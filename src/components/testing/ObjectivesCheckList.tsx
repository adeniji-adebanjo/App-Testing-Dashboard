"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TestObjective } from "@/types/test-case";
import {
  saveObjectives,
  loadObjectives,
  saveQualityGates,
  loadQualityGates,
} from "@/lib/storage";

const initialObjectives: TestObjective[] = [
  {
    id: "1",
    description: "Verify all core features function as per PRD specifications",
    completed: false,
  },
  {
    id: "2",
    description: "Ensure 90% reduction in duplicate daily spooling requests",
    completed: false,
  },
  {
    id: "3",
    description:
      "Validate API integration with Credit Registry and First Central",
    completed: false,
  },
  {
    id: "4",
    description: "Confirm role-based access control works correctly",
    completed: false,
  },
  {
    id: "5",
    description:
      "Verify report retrieval time is <2 seconds for API-based requests",
    completed: false,
  },
  {
    id: "6",
    description: "Ensure cross-browser compatibility",
    completed: false,
  },
  {
    id: "7",
    description: "Validate data integrity and security measures",
    completed: false,
  },
];

const qualityGates: TestObjective[] = [
  {
    id: "q1",
    description: "Zero critical bugs in production",
    completed: false,
  },
  {
    id: "q2",
    description: "All high-priority bugs resolved before release",
    completed: false,
  },
  { id: "q3", description: "80% test coverage achieved", completed: false },
  {
    id: "q4",
    description: "All user acceptance criteria met",
    completed: false,
  },
];

export default function ObjectivesChecklist() {
  const [objectives, setObjectives] =
    useState<TestObjective[]>(initialObjectives);
  const [gates, setGates] = useState<TestObjective[]>(qualityGates);

  useEffect(() => {
    const loadedObjectives = loadObjectives();
    const loadedGates = loadQualityGates();

    if (loadedObjectives.length > 0) {
      setObjectives(loadedObjectives);
    }
    if (loadedGates.length > 0) {
      setGates(loadedGates);
    }
  }, []);

  useEffect(() => {
    if (objectives.some((o) => o.completed)) {
      saveObjectives(objectives);
    }
  }, [objectives]);

  useEffect(() => {
    if (gates.some((g) => g.completed)) {
      saveQualityGates(gates);
    }
  }, [gates]);

  const toggleObjective = (id: string) => {
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === id ? { ...obj, completed: !obj.completed } : obj
      )
    );
  };

  const toggleGate = (id: string) => {
    setGates((prev) =>
      prev.map((gate) =>
        gate.id === id ? { ...gate, completed: !gate.completed } : gate
      )
    );
  };

  const completedCount = objectives.filter((o) => o.completed).length;
  const gatesCompletedCount = gates.filter((g) => g.completed).length;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            Primary Objectives ({completedCount}/{objectives.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {objectives.map((objective) => (
              <div key={objective.id} className="flex items-start space-x-3">
                <Checkbox
                  id={objective.id}
                  checked={objective.completed}
                  onCheckedChange={() => toggleObjective(objective.id)}
                />
                <Label
                  htmlFor={objective.id}
                  className={`text-sm leading-relaxed ${
                    objective.completed
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {objective.description}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Quality Gates ({gatesCompletedCount}/{gates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gates.map((gate) => (
              <div key={gate.id} className="flex items-start space-x-3">
                <Checkbox
                  id={gate.id}
                  checked={gate.completed}
                  onCheckedChange={() => toggleGate(gate.id)}
                />
                <Label
                  htmlFor={gate.id}
                  className={`text-sm leading-relaxed ${
                    gate.completed
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
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
