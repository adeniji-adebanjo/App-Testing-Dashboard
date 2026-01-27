"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestCaseTable from "@/components/testing/TestCaseTable";
import { TestCase } from "@/types/test-case";
import { useTestCases, useUpdateTestCases } from "@/hooks/useTestData";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Filter } from "lucide-react";
import { useMemo } from "react";

// Default test cases for CBP if none exist
const defaultTestCases: TestCase[] = [
  // Authentication
  {
    id: "ft-1",
    testCaseId: "AUTH-001",
    module: "Authentication",
    scenario: "Valid login - Analyst role",
    expectedResult: "User logs in successfully",
    status: "pending",
    actualResult: "",
    comments: "",
  },
  {
    id: "ft-2",
    testCaseId: "AUTH-002",
    module: "Authentication",
    scenario: "Invalid credentials",
    expectedResult: "Error message displayed",
    status: "pending",
    actualResult: "",
    comments: "",
  },
  // Search
  {
    id: "ft-3",
    testCaseId: "SEARCH-001",
    module: "Search",
    scenario: "Search by BVN",
    expectedResult: "Customer details displayed",
    status: "pending",
    actualResult: "",
    comments: "",
  },
  {
    id: "ft-4",
    testCaseId: "SEARCH-002",
    module: "Search",
    scenario: "Search with no results",
    expectedResult: "No results found message",
    status: "pending",
    actualResult: "",
    comments: "",
  },
  // Duplicate
  {
    id: "ft-5",
    testCaseId: "DUP-001",
    module: "Duplicate Prevention",
    scenario: "Request same customer same day",
    expectedResult: "System blocks request",
    status: "pending",
    actualResult: "",
    comments: "",
  },
  // API
  {
    id: "ft-6",
    testCaseId: "API-001",
    module: "API Integration",
    scenario: "First Central - Fetch report",
    expectedResult: "Report retrieved successfully",
    status: "pending",
    actualResult: "",
    comments: "",
  },
];

export default function FunctionalTestingPage() {
  const { projectId } = useParams();
  const id = projectId as string;

  const { data: allTestCases, isLoading } = useTestCases(id);
  const updateMutation = useUpdateTestCases(id);

  const testCases = useMemo(() => {
    if (allTestCases && allTestCases.length > 0) return allTestCases;
    return defaultTestCases.map((tc) => ({ ...tc, projectId: id }));
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
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const modules = [
    "Authentication",
    "Search",
    "Duplicate Prevention",
    "API Integration",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Functional Testing
          </h1>
          <p className="mt-2 text-gray-500">
            Validate project features and business requirements
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-primary h-5 w-5" />
              <CardTitle className="text-lg">Testing Matrix</CardTitle>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200 text-xs font-medium text-gray-500">
              <Filter size={12} />
              Filter by Module
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100/50 p-1 h-auto gap-1">
              <TabsTrigger
                value="auth"
                className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Authentication
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Search
              </TabsTrigger>
              <TabsTrigger
                value="duplicate"
                className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Duplicate
              </TabsTrigger>
              <TabsTrigger
                value="api"
                className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                API Integration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="auth" className="mt-6">
              <TestCaseTable
                testCases={filterByModule("Authentication")}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <TestCaseTable
                testCases={filterByModule("Search")}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="duplicate" className="mt-6">
              <TestCaseTable
                testCases={filterByModule("Duplicate Prevention")}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="api" className="mt-6">
              <TestCaseTable
                testCases={filterByModule("API Integration")}
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
