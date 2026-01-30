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
  ProjectTab,
} from "@/lib/cloudStorage";
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
