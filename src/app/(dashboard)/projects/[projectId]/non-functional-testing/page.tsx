"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TestCaseTable from "@/components/testing/TestCaseTable";
import NonFunctionalModulesManager from "@/components/testing/NonFunctionalModulesManager";
import { TestCase } from "@/types/test-case";
import {
  FunctionalModule,
  FunctionalModuleTemplate,
} from "@/types/functional-module";
import {
  useTestCases,
  useUpdateTestCases,
  useNonFunctionalModules,
  useNonFunctionalModuleTemplates,
} from "@/hooks/useTestData";
import { Skeleton } from "@/components/ui/skeleton";
import { Gauge, Settings2, Plus, RefreshCw } from "lucide-react";
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
  { name: "Performance", slug: "performance" },
  { name: "Security", slug: "security" },
  { name: "Usability", slug: "usability" },
  { name: "Compatibility", slug: "compatibility" },
];

// Default test cases for Non-Functional if none exist
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
  // Compatibility
  {
    id: "nft-5",
    testCaseId: "COMP-001",
    module: "Compatibility",
    scenario: "Chrome browser compatibility",
    expectedResult: "All features work correctly",
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
      template.defaultScenarios.forEach((scenario) => {
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

export default function NonFunctionalTestingPage() {
  const { projectId } = useParams();
  const id = projectId as string;
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: allTestCases, isLoading: testCasesLoading } = useTestCases(id);
  const { data: nfModules, isLoading: modulesLoading } =
    useNonFunctionalModules(id);
  const { data: nfTemplates, isLoading: templatesLoading } =
    useNonFunctionalModuleTemplates(id);
  const updateMutation = useUpdateTestCases(id);

  const isLoading = testCasesLoading || modulesLoading || templatesLoading;

  // Determine which modules to use
  const activeModules = useMemo(() => {
    if (nfModules && nfModules.length > 0) {
      return nfModules.sort((a, b) => a.order - b.order);
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
  }, [nfModules, id]);

  // Get test cases, generate from templates if none exist
  const testCases = useMemo(() => {
    // Filter for non-functional test cases only
    const nfTestCases = allTestCases?.filter((tc) =>
      activeModules.some((m) => m.name === tc.module),
    );

    if (nfTestCases && nfTestCases.length > 0) return nfTestCases;

    // If we have modules and templates, generate test cases from them
    if (
      nfModules &&
      nfModules.length > 0 &&
      nfTemplates &&
      nfTemplates.length > 0
    ) {
      return generateTestCasesFromTemplates(nfModules, nfTemplates, id);
    }

    // Fallback to hardcoded defaults
    return defaultNonFunctionalCases.map((tc) => ({ ...tc, projectId: id }));
  }, [allTestCases, nfModules, nfTemplates, id, activeModules]);

  const filterByModule = (moduleName: string) => {
    return testCases.filter((tc) => tc.module === moduleName);
  };

  const handleUpdate = useCallback(
    (updatedInModule: TestCase[]) => {
      // Combine with existing test cases from other modules
      const otherTestCases = (allTestCases || []).filter(
        (tc) => !activeModules.some((m) => m.name === tc.module),
      );
      const currentModuleTestCases = testCases.map((tc) => {
        const match = updatedInModule.find((utc) => utc.id === tc.id);
        return match || tc;
      });
      updateMutation.mutate([...otherTestCases, ...currentModuleTestCases]);
    },
    [allTestCases, activeModules, testCases, updateMutation],
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
      const template = nfTemplates?.find(
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

      // Combine with all test cases
      const otherTestCases = (allTestCases || []).filter(
        (tc) => !activeModules.some((m) => m.name === tc.module),
      );
      updateMutation.mutate([...otherTestCases, ...testCases, newTestCase]);
    },
    [activeModules, nfTemplates, testCases, id, allTestCases, updateMutation],
  );

  // Sync current test cases with template defaults
  const handleSyncWithDefaults = useCallback(() => {
    if (!nfModules || !nfTemplates) return;

    const templateTestCases = generateTestCasesFromTemplates(
      nfModules,
      nfTemplates,
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
  }, [nfModules, nfTemplates, id, allTestCases, updateMutation]);

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Non-Functional Testing
          </h1>
          <p className="mt-2 text-gray-500">
            Assess performance, security, and usability benchmarks
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
                  <Gauge className="h-5 w-5" />
                  Configure Non-Functional Testing Modules
                </DialogTitle>
              </DialogHeader>
              <NonFunctionalModulesManager projectId={id} />
            </DialogContent>
          </Dialog>
        </div>
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
          <Tabs
            defaultValue={activeModules[0]?.slug || "performance"}
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
