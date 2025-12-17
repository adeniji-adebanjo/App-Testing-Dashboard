"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestEnvironment } from "@/types/test-case";
import { saveEnvironments, loadEnvironments } from "@/lib/storage";

const initialEnvironments: TestEnvironment[] = [
  {
    component: "Frontend Framework",
    details: "Next.js, TypeScript",
    status: "pending",
  },
  {
    component: "Backend Framework",
    details: "Node.js/Django",
    status: "pending",
  },
  { component: "Database", details: "PostgreSQL/MongoDB", status: "pending" },
  { component: "Test Environment URL", details: "", status: "pending" },
  { component: "Staging Environment URL", details: "", status: "pending" },
  { component: "API Endpoints Available", details: "", status: "pending" },
];

export default function TestEnvironmentSetup() {
  const [environments, setEnvironments] =
    useState<TestEnvironment[]>(initialEnvironments);

  useEffect(() => {
    const loaded = loadEnvironments();
    if (loaded.length > 0) {
      setEnvironments(loaded);
    }
  }, []);

  useEffect(() => {
    if (environments.some((e) => e.status === "ready")) {
      saveEnvironments(environments);
    }
  }, [environments]);

  const toggleStatus = (index: number) => {
    setEnvironments((prev) =>
      prev.map((env, i) =>
        i === index
          ? { ...env, status: env.status === "ready" ? "pending" : "ready" }
          : env
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Environment Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                  Component
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                  Details
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {environments.map((env, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 text-sm font-medium text-gray-900">
                    {env.component}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {env.details || "-"}
                  </td>
                  <td className="py-3">
                    <Badge
                      className={
                        env.status === "ready"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {env.status === "ready" ? "✓ Ready" : "⏳ Pending"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(index)}
                    >
                      Toggle
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
