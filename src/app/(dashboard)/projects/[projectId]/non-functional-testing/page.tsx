"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestCaseTable from "@/components/testing/TestCaseTable";
import { TestCase } from "@/types/test-case";
import { useTestCases, useUpdateTestCases } from "@/hooks/useTestData";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Gauge } from "lucide-react";
import { useMemo } from "react";

// Default test cases for CBP non-functional
const defaultNonFunctionalCases: TestCase[] = [
  // Performance
  {
    id: "nft-1",
    testCaseId: "PERF-001",
    module: "Performance",
    scenario: "Response time < 2s",
    expectedResult: "System responds within threshold",
    status: "pending",
    actualResult: "",
    comments: "",
  },
  {
    id: "nft-2",
    testCaseId: "PERF-002",
    module: "Performance",
    scenario: "Concurrent users load test",
    expectedResult: "System stays stable with 100 concurrent users",
    status: "pending",
    actualResult: "",
    comments: "",
  },
  // Security
  {
    id: "nft-3",
    testCaseId: "SEC-001",
    module: "Security",
    scenario: "SQL Injection protection",
    expectedResult: "Sanitization prevents injection",
    status: "pending",
    actualResult: "",
    comments: "",
  },
  // Usability
  {
    id: "nft-4",
    testCaseId: "USA-001",
    module: "Usability",
    scenario: "Mobile responsiveness",
    expectedResult: "Layout adapts to different screens",
    status: "pending",
    actualResult: "",
    comments: "",
  },
];

export default function NonFunctionalTestingPage() {
  const { projectId } = useParams();
  const id = projectId as string;

  const { data: allTestCases, isLoading } = useTestCases(id);
  const updateMutation = useUpdateTestCases(id);

  const testCases = useMemo(() => {
    if (allTestCases && allTestCases.length > 0) return allTestCases;
    return defaultNonFunctionalCases.map((tc) => ({ ...tc, projectId: id }));
  }, [allTestCases, id]);

  const filterByModule = (moduleName: string) => {
    return testCases.filter((tc) => tc.module === moduleName);
  };

  const handleUpdate = (updatedInModule: TestCase[]) => {
    const updatedAll = testCases.map((tc) => {
      const match = updatedInModule.find((utc) => utc.id === tc.id);
      return match || tc;
    });
    updateMutation.mutate(updatedAll);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Non-Functional Testing
        </h1>
        <p className="mt-2 text-gray-500">
          Assess performance, security, and usability benchmarks
        </p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
          <div className="flex items-center gap-2">
            <Gauge className="text-primary h-5 w-5" />
            <CardTitle className="text-lg">
              Security & Performance Metrics
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100/50 p-1 h-auto gap-1">
              <TabsTrigger
                value="performance"
                className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="usability"
                className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Usability
              </TabsTrigger>
              <TabsTrigger
                value="compatibility"
                className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Compatibility
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-6">
              <TestCaseTable
                testCases={filterByModule("Performance")}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <TestCaseTable
                testCases={filterByModule("Security")}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="usability" className="mt-6">
              <TestCaseTable
                testCases={filterByModule("Usability")}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="compatibility" className="mt-6">
              <TestCaseTable
                testCases={filterByModule("Compatibility")}
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
