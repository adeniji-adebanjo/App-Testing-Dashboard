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

// --- Test Cases ---

export function useTestCases(projectId: string) {
  return useQuery({
    queryKey: ["testCases", projectId],
    queryFn: () => loadTestCases(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateTestCases(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testCases: TestCase[]) => saveTestCases(testCases, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testCases", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (defects: Defect[]) => saveDefects(defects, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defects", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (objectives: TestObjective[]) =>
      saveObjectives(objectives, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (environments: TestEnvironment[]) =>
      saveEnvironments(environments, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (metrics: SuccessMetric[]) => saveMetrics(metrics, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (signOffs: SignOff[]) => saveSignOffs(signOffs, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signOffs", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tabs: ProjectTab[]) => saveProjectTabs(tabs, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTabs", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (modules: FunctionalModule[]) =>
      saveFunctionalModules(modules, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["functionalModules", projectId],
      });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templates: FunctionalModuleTemplate[]) =>
      saveFunctionalModuleTemplates(templates, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["functionalModuleTemplates", projectId],
      });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (modules: FunctionalModule[]) =>
      saveNonFunctionalModules(modules, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["nonFunctionalModules", projectId],
      });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runs: TestRun[]) => saveTestRuns(runs, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testRuns", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requirements: Requirement[]) =>
      saveRequirements(requirements, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requirements", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (releases: Release[]) => saveReleases(releases, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["releases", projectId] });
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (snapshots: ReportSnapshot[]) =>
      saveReportSnapshots(snapshots, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reportSnapshots", projectId],
      });
    },
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templates: FunctionalModuleTemplate[]) =>
      saveNonFunctionalModuleTemplates(templates, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["nonFunctionalModuleTemplates", projectId],
      });
    },
  });
}
