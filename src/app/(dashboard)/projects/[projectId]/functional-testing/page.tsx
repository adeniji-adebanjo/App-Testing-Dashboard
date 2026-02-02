"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TestCaseTable from "@/components/testing/TestCaseTable";
import FunctionalModulesManager from "@/components/testing/FunctionalModulesManager";
import { TestCase } from "@/types/test-case";
import {
  FunctionalModule,
  FunctionalModuleTemplate,
  DefaultTestScenario,
} from "@/types/functional-module";
import {
  useTestCases,
  useUpdateTestCases,
  useFunctionalModules,
  useFunctionalModuleTemplates,
} from "@/hooks/useTestData";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  Filter,
  Settings2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Default modules for fallback
const DEFAULT_MODULES = [
  { name: "Authentication", slug: "auth" },
  { name: "Search", slug: "search" },
  { name: "Duplicate Prevention", slug: "duplicate" },
  { name: "API Integration", slug: "api" },
];

// Default test cases for CBP if none exist (used as fallback when no modules configured)
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

function generateTestCasesFromTemplates(
  modules: FunctionalModule[],
  templates: FunctionalModuleTemplate[],
  projectId: string,
): TestCase[] {
  const testCases: TestCase[] = [];

  modules.forEach((module) => {
    const template = templates.find((t) => t.moduleId === module.id);
    if (template) {
      template.defaultScenarios.forEach((scenario, idx) => {
        testCases.push({
          id: `${module.id}-${scenario.id}`,
          projectId,
          testCaseId: scenario.testCaseId,
          module: module.name,
          scenario: scenario.scenario,
          steps: scenario.steps,
          expectedResult: scenario.expectedResult,
          status: "pending",
          actualResult: "",
          comments: "",
        });
      });
    }
  });

  return testCases;
}

export default function FunctionalTestingPage() {
  const { projectId } = useParams();
  const id = projectId as string;
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: allTestCases, isLoading: testCasesLoading } = useTestCases(id);
  const { data: functionalModules, isLoading: modulesLoading } =
    useFunctionalModules(id);
  const { data: moduleTemplates, isLoading: templatesLoading } =
    useFunctionalModuleTemplates(id);
  const updateMutation = useUpdateTestCases(id);

  const isLoading = testCasesLoading || modulesLoading || templatesLoading;

  // Determine which modules to use
  const activeModules = useMemo(() => {
    if (functionalModules && functionalModules.length > 0) {
      return functionalModules.sort((a, b) => a.order - b.order);
    }
    // Fallback to default modules
    return DEFAULT_MODULES.map((m, idx) => ({
      id: m.slug,
      projectId: id,
      name: m.name,
      slug: m.slug,
      order: idx,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as FunctionalModule[];
  }, [functionalModules, id]);

  // Get test cases, generate from templates if none exist
  const testCases = useMemo(() => {
    if (allTestCases && allTestCases.length > 0) return allTestCases;

    // If we have modules and templates, generate test cases from them
    if (
      functionalModules &&
      functionalModules.length > 0 &&
      moduleTemplates &&
      moduleTemplates.length > 0
    ) {
      return generateTestCasesFromTemplates(
        functionalModules,
        moduleTemplates,
        id,
      );
    }

    // Fallback to hardcoded defaults
    return defaultTestCases.map((tc) => ({ ...tc, projectId: id }));
  }, [allTestCases, functionalModules, moduleTemplates, id]);

  const filterByModule = (moduleName: string) => {
    return testCases.filter((tc) => tc.module === moduleName);
  };

  const handleUpdate = useCallback(
    (updatedInModule: TestCase[]) => {
      const updatedAll = testCases.map((tc) => {
        const match = updatedInModule.find((utc) => utc.id === tc.id);
        return match || tc;
      });
      updateMutation.mutate(updatedAll);
    },
    [testCases, updateMutation],
  );

  // Delete a test case
  const handleDeleteTestCase = useCallback(
    (testCaseId: string) => {
      if (!allTestCases) return;
      const updatedAll = allTestCases.filter((tc) => tc.id !== testCaseId);
      updateMutation.mutate(updatedAll);
    },
    [allTestCases, updateMutation],
  );

  // Add a new test case to a module
  const handleAddTestCase = useCallback(
    (moduleName: string) => {
      const activeModule = activeModules.find((m) => m.name === moduleName);
      const template = moduleTemplates?.find(
        (t) => t.moduleId === activeModule?.id,
      );
      const prefix =
        template?.testCaseIdPrefix || moduleName.slice(0, 4).toUpperCase();
      const existingCount = testCases.filter(
        (tc) => tc.module === moduleName,
      ).length;

      const newTestCase: TestCase = {
        id: crypto.randomUUID(),
        projectId: id,
        testCaseId: `${prefix}-${String(existingCount + 1).padStart(3, "0")}`,
        module: moduleName,
        scenario: "New test scenario",
        expectedResult: "Expected result",
        status: "pending",
        actualResult: "",
        comments: "",
      };

      updateMutation.mutate([...(allTestCases || []), newTestCase]);
    },
    [
      activeModules,
      moduleTemplates,
      testCases,
      id,
      allTestCases,
      updateMutation,
    ],
  );

  // Sync current test cases with template defaults
  const handleSyncWithDefaults = useCallback(() => {
    if (!functionalModules || !moduleTemplates) return;

    const templateTestCases = generateTestCasesFromTemplates(
      functionalModules,
      moduleTemplates,
      id,
    );

    // Only add test cases that don't exist yet (based on testCaseId and module)
    const newCases = templateTestCases.filter(
      (tc) =>
        !allTestCases?.some(
          (existing) =>
            existing.testCaseId === tc.testCaseId &&
            existing.module === tc.module,
        ),
    );

    if (newCases.length > 0) {
      updateMutation.mutate([...(allTestCases || []), ...newCases]);
    }
  }, [functionalModules, moduleTemplates, id, allTestCases, updateMutation]);

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncWithDefaults}
            className="gap-2 text-gray-600 border-gray-200"
            title="Add missing default scenarios from templates"
          >
            <RefreshCw className="h-4 w-4" />
            Sync Defaults
          </Button>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Configure Modules
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Configure Functional Testing Modules
                </DialogTitle>
              </DialogHeader>
              <FunctionalModulesManager projectId={id} />
            </DialogContent>
          </Dialog>
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
          <Tabs
            defaultValue={activeModules[0]?.slug || "auth"}
            className="w-full"
          >
            <TabsList
              className="grid w-full bg-gray-100/50 p-1 h-auto gap-1"
              style={{
                gridTemplateColumns: `repeat(${Math.min(activeModules.length, 4)}, minmax(0, 1fr))`,
              }}
            >
              {activeModules.map((module) => (
                <TabsTrigger
                  key={module.id}
                  value={module.slug}
                  className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
                >
                  {module.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {activeModules.map((module) => (
              <TabsContent key={module.id} value={module.slug} className="mt-6">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">
                      {module.name}
                    </h3>
                    {module.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTestCase(module.name)}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Test Case
                  </Button>
                </div>
                <TestCaseTable
                  testCases={filterByModule(module.name)}
                  onUpdate={handleUpdate}
                  onDelete={handleDeleteTestCase}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
