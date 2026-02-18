"use client";

import {
  useNonFunctionalModules,
  useUpdateNonFunctionalModules,
  useNonFunctionalModuleTemplates,
  useUpdateNonFunctionalModuleTemplates,
  useTestCases,
  useUpdateTestCases,
  useDefects,
  useUpdateDefects,
} from "@/hooks/useTestData";
import TestingModulesManager from "./TestingModulesManager";
import {
  FunctionalModule,
  FunctionalModuleTemplate,
} from "@/types/functional-module";

interface NonFunctionalModulesManagerProps {
  projectId: string;
}

export default function NonFunctionalModulesManager({
  projectId,
}: NonFunctionalModulesManagerProps) {
  const { data: modules, isLoading: modulesLoading } =
    useNonFunctionalModules(projectId);
  const { data: templates, isLoading: templatesLoading } =
    useNonFunctionalModuleTemplates(projectId);
  const updateModulesMutation = useUpdateNonFunctionalModules(projectId);
  const updateTemplatesMutation =
    useUpdateNonFunctionalModuleTemplates(projectId);

  const { data: testCases } = useTestCases(projectId);
  const { data: defects } = useDefects(projectId);
  const updateTestCasesMutation = useUpdateTestCases(projectId);
  const updateDefectsMutation = useUpdateDefects(projectId);

  const handleSaveModules = async (newModules: FunctionalModule[]) => {
    // Check if any module names have changed to propagate to test cases/defects
    const nameMap: Record<string, string> = {};
    let namesChanged = false;

    newModules.forEach((newMod) => {
      const oldMod = modules?.find((m) => m.id === newMod.id);
      if (oldMod && oldMod.name !== newMod.name) {
        nameMap[oldMod.name] = newMod.name;
        namesChanged = true;
      }
    });

    if (namesChanged) {
      console.log(
        "Module names changed (non-functional), propagating updates...",
      );

      // 1. Update Test Cases
      if (testCases && testCases.length > 0) {
        const updatedTestCases = testCases.map((tc) => {
          if (nameMap[tc.module]) {
            return { ...tc, module: nameMap[tc.module] };
          }
          return tc;
        });

        const hasTestCaseChanges = updatedTestCases.some(
          (tc, idx) => tc.module !== testCases[idx].module,
        );

        if (hasTestCaseChanges) {
          await updateTestCasesMutation.mutateAsync(updatedTestCases);
        }
      }

      // 2. Update Defects
      if (defects && defects.length > 0) {
        const updatedDefects = defects.map((d) => {
          if (nameMap[d.module]) {
            return { ...d, module: nameMap[d.module] };
          }
          return d;
        });

        const hasDefectChanges = updatedDefects.some(
          (d, idx) => d.module !== defects[idx].module,
        );

        if (hasDefectChanges) {
          await updateDefectsMutation.mutateAsync(updatedDefects);
        }
      }
    }

    await updateModulesMutation.mutateAsync(newModules);
  };

  const handleSaveTemplates = async (templates: FunctionalModuleTemplate[]) => {
    await updateTemplatesMutation.mutateAsync(templates);
  };

  return (
    <TestingModulesManager
      projectId={projectId}
      moduleType="non-functional"
      modules={modules}
      templates={templates}
      isLoading={modulesLoading || templatesLoading}
      onSaveModules={handleSaveModules}
      onSaveTemplates={handleSaveTemplates}
      isSaving={
        updateModulesMutation.isPending || updateTemplatesMutation.isPending
      }
    />
  );
}
