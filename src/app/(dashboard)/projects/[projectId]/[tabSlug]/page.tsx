"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import TestCaseTable from "@/components/testing/TestCaseTable";
import { TestCase } from "@/types/test-case";

import {
  useTestCases,
  useUpdateTestCases,
  useProjectTabs,
} from "@/hooks/useTestData";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function DynamicTestTabPage() {
  const { projectId, tabSlug } = useParams();
  const id = projectId as string;
  const slug = tabSlug as string;

  const { data: tabs, isLoading: isLoadingTabs } = useProjectTabs(id);
  const { data: allTestCases, isLoading: isLoadingTests } = useTestCases(id);
  const updateMutation = useUpdateTestCases(id);

  // Find current tab info
  const currentTab = useMemo(() => {
    return tabs?.find((t) => t.slug === slug);
  }, [tabs, slug]);

  // Filter test cases for this tab
  // Strategy: Match module name exactly to tab name
  const filteredTestCases = useMemo(() => {
    if (!allTestCases || !currentTab) return [];

    return allTestCases.filter((tc) => {
      // Direct match
      if (tc.module === currentTab.name) return true;
      // Case insensitive match
      if (tc.module?.toLowerCase() === currentTab.name.toLowerCase())
        return true;
      // Slug match (if module was stored as slug usually not but possible)
      if (tc.module === currentTab.slug) return true;

      return false;
    });
  }, [allTestCases, currentTab]);

  const handleUpdate = (updatedInModule: TestCase[]) => {
    if (!allTestCases) return;

    const updatedAll = allTestCases.map((tc) => {
      const match = updatedInModule.find((utc) => utc.id === tc.id);
      return match || tc;
    });
    updateMutation.mutate(updatedAll);
  };

  if (isLoadingTabs || isLoadingTests) {
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

  if (!currentTab) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Tab Not Found</h3>
            <div className="text-sm text-red-700 mt-1">
              The requested testing tab &quot;{slug}&quot; does not exist in
              this project.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {currentTab.name}
          </h1>
          <p className="mt-2 text-gray-500">
            {currentTab.description || `Test cases for ${currentTab.name}`}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-primary h-5 w-5" />
              <CardTitle className="text-lg">Test Cases</CardTitle>
            </div>
            <div className="text-sm text-gray-500">
              {filteredTestCases.length} Cases
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredTestCases.length > 0 ? (
            <TestCaseTable
              testCases={filteredTestCases}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No test cases found
              </h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                There are no test cases associated with the module{" "}
                <strong>&quot;{currentTab.name}&quot;</strong>. Upload a PRD to
                generate them or add them manually.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
