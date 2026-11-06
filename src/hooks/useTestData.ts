"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loadTestCases,
  saveTestCases,
  loadDefects,
  saveDefects,
  loadObjectives,
  saveObjectives,
  loadEnvironments,
  saveEnvironments,
  loadMetrics,
  saveMetrics,
  loadSignOffs,
  saveSignOffs,
  loadProjectTabs,
  saveProjectTabs,
  loadFunctionalModules,
  saveFunctionalModules,
  loadFunctionalModuleTemplates,
  saveFunctionalModuleTemplates,
  loadNonFunctionalModules,
  saveNonFunctionalModules,
  loadNonFunctionalModuleTemplates,
  saveNonFunctionalModuleTemplates,
  loadTestRuns,
  saveTestRuns,
  loadAuditLog,
  loadRequirements,
  saveRequirements,
  loadReleases,
  saveReleases,
  loadReportSnapshots,
  saveReportSnapshots,
  loadMonitoringEvents,
} from "@/lib/cloudStorage";
import { ProjectTab } from "@/types/project";
import { TestRun } from "@/types/test-run";
import { Requirement } from "@/types/requirement";
import { Release } from "@/types/release";
import { ReportSnapshot } from "@/types/report";
import {
  FunctionalModule,
  FunctionalModuleTemplate,
} from "@/types/functional-module";
import {
  TestCase,
  Defect,
  TestObjective,
  TestEnvironment,
  SuccessMetric,
  SignOff,
} from "@/types/test-case";
import { useToast } from "@/components/ui/toast";

// Shared save mutation. cloudStorage save* functions resolve to false (rather
// than throwing) when the cloud write fails, so that is turned into an error
// here. On failure the attempted data is kept in the query cache - it is
// already in localStorage - instead of refetching, which would overwrite the
// user's change with the stale cloud copy.
function useSaveMutation<T>(
  queryKey: readonly unknown[],
  save: (data: T) => Promise<boolean>,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: T) => {
      if (!(await save(data))) {
        throw new Error("Cloud save failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (_error, data) => {
      queryClient.setQueryData(queryKey, data);
      toast({
        variant: "error",
        title: "Not saved to the cloud",
        description:
          "Your change is stored on this device only. Check your connection or sign in again, then retry.",
      });
    },
  });
}

// --- Test Cases ---

export function useTestCases(projectId: string) {
  return useQuery({
    queryKey: ["testCases", projectId],
    queryFn: () => loadTestCases(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateTestCases(projectId: string) {
  return useSaveMutation(["testCases", projectId], (testCases: TestCase[]) =>
    saveTestCases(testCases, projectId),
  );
}

// --- Defects ---

export function useDefects(projectId: string) {
  return useQuery({
    queryKey: ["defects", projectId],
    queryFn: () => loadDefects(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateDefects(projectId: string) {
  return useSaveMutation(["defects", projectId], (defects: Defect[]) =>
    saveDefects(defects, projectId),
  );
}

// --- Objectives ---

export function useObjectives(projectId: string) {
  return useQuery({
    queryKey: ["objectives", projectId],
    queryFn: () => loadObjectives(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateObjectives(projectId: string) {
  return useSaveMutation(["objectives", projectId], (objectives: TestObjective[]) =>
    saveObjectives(objectives, projectId),
  );
}

// --- Environments ---

export function useEnvironments(projectId: string) {
  return useQuery({
    queryKey: ["environments", projectId],
    queryFn: () => loadEnvironments(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateEnvironments(projectId: string) {
  return useSaveMutation(["environments", projectId], (environments: TestEnvironment[]) =>
    saveEnvironments(environments, projectId),
  );
}

// --- Metrics ---

export function useMetrics(projectId: string) {
  return useQuery({
    queryKey: ["metrics", projectId],
    queryFn: () => loadMetrics(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateMetrics(projectId: string) {
  return useSaveMutation(["metrics", projectId], (metrics: SuccessMetric[]) =>
    saveMetrics(metrics, projectId),
  );
}

// --- Sign Offs ---

export function useSignOffs(projectId: string) {
  return useQuery({
    queryKey: ["signOffs", projectId],
    queryFn: () => loadSignOffs(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateSignOffs(projectId: string) {
  return useSaveMutation(["signOffs", projectId], (signOffs: SignOff[]) =>
    saveSignOffs(signOffs, projectId),
  );
}

// --- Project Tabs ---

export function useProjectTabs(projectId: string) {
  return useQuery({
    queryKey: ["projectTabs", projectId],
    queryFn: () => loadProjectTabs(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateProjectTabs(projectId: string) {
  return useSaveMutation(["projectTabs", projectId], (tabs: ProjectTab[]) =>
    saveProjectTabs(tabs, projectId),
  );
}

// --- Functional Modules ---

export function useFunctionalModules(projectId: string) {
  return useQuery({
    queryKey: ["functionalModules", projectId],
    queryFn: () => loadFunctionalModules(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateFunctionalModules(projectId: string) {
  return useSaveMutation(["functionalModules", projectId], (modules: FunctionalModule[]) =>
    saveFunctionalModules(modules, projectId),
  );
}

// --- Functional Module Templates ---

export function useFunctionalModuleTemplates(projectId: string) {
  return useQuery({
    queryKey: ["functionalModuleTemplates", projectId],
    queryFn: () => loadFunctionalModuleTemplates(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateFunctionalModuleTemplates(projectId: string) {
  return useSaveMutation(["functionalModuleTemplates", projectId], (templates: FunctionalModuleTemplate[]) =>
    saveFunctionalModuleTemplates(templates, projectId),
  );
}

// --- Non-Functional Modules ---

export function useNonFunctionalModules(projectId: string) {
  return useQuery({
    queryKey: ["nonFunctionalModules", projectId],
    queryFn: () => loadNonFunctionalModules(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateNonFunctionalModules(projectId: string) {
  return useSaveMutation(["nonFunctionalModules", projectId], (modules: FunctionalModule[]) =>
    saveNonFunctionalModules(modules, projectId),
  );
}

// --- Test Runs ---

export function useTestRuns(projectId: string) {
  return useQuery({
    queryKey: ["testRuns", projectId],
    queryFn: () => loadTestRuns(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateTestRuns(projectId: string) {
  return useSaveMutation(["testRuns", projectId], (runs: TestRun[]) =>
    saveTestRuns(runs, projectId),
  );
}

// --- Requirements ---

export function useRequirements(projectId: string) {
  return useQuery({
    queryKey: ["requirements", projectId],
    queryFn: () => loadRequirements(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateRequirements(projectId: string) {
  return useSaveMutation(["requirements", projectId], (requirements: Requirement[]) =>
    saveRequirements(requirements, projectId),
  );
}

// --- Releases ---

export function useReleases(projectId: string) {
  return useQuery({
    queryKey: ["releases", projectId],
    queryFn: () => loadReleases(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateReleases(projectId: string) {
  return useSaveMutation(["releases", projectId], (releases: Release[]) =>
    saveReleases(releases, projectId),
  );
}

// --- Report Snapshots ---

export function useReportSnapshots(projectId: string) {
  return useQuery({
    queryKey: ["reportSnapshots", projectId],
    queryFn: () => loadReportSnapshots(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateReportSnapshots(projectId: string) {
  return useSaveMutation(["reportSnapshots", projectId], (snapshots: ReportSnapshot[]) =>
    saveReportSnapshots(snapshots, projectId),
  );
}

// --- Monitoring Events ---

export function useMonitoringEvents(projectId: string) {
  return useQuery({
    queryKey: ["monitoringEvents", projectId],
    queryFn: () => loadMonitoringEvents(projectId),
    enabled: !!projectId,
  });
}

// --- Audit Log ---

export function useAuditLog(projectId: string) {
  return useQuery({
    queryKey: ["auditLog", projectId],
    queryFn: () => loadAuditLog(projectId),
    enabled: !!projectId,
  });
}

// --- Non-Functional Module Templates ---

export function useNonFunctionalModuleTemplates(projectId: string) {
  return useQuery({
    queryKey: ["nonFunctionalModuleTemplates", projectId],
    queryFn: () => loadNonFunctionalModuleTemplates(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateNonFunctionalModuleTemplates(projectId: string) {
  return useSaveMutation(["nonFunctionalModuleTemplates", projectId], (templates: FunctionalModuleTemplate[]) =>
    saveNonFunctionalModuleTemplates(templates, projectId),
  );
}
