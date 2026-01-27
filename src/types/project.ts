// src/types/project.ts

export type ProjectStatus = "active" | "completed" | "on-hold" | "archived";
export type ProjectPhase =
  | "planning"
  | "development"
  | "testing"
  | "uat"
  | "completed";

import { TestObjective, TestEnvironment } from "./test-case";

export interface Project {
  id: string;
  name: string;
  shortCode: string; // e.g., "CBP", "WMA"
  description: string;
  techStack: string[];
  targetUsers: string[];
  documentVersion: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  color: string; // Theme color for the project (hex or tailwind color)
  icon?: string; // Optional icon identifier
  objectives?: TestObjective[];
  environments?: TestEnvironment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectStats {
  totalTestCases: number;
  passed: number;
  failed: number;
  pending: number;
  blocked: number;
  defectsOpen: number;
  defectsClosed: number;
  passRate: number;
}

export interface ProjectWithStats extends Project {
  stats: ProjectStats;
}

// For creating a new project
export interface CreateProjectInput {
  name: string;
  shortCode: string;
  description: string;
  techStack: string[];
  targetUsers: string[];
  documentVersion?: string;
  color?: string;
  icon?: string;
}

// For updating an existing project
export interface UpdateProjectInput {
  name?: string;
  shortCode?: string;
  description?: string;
  techStack?: string[];
  targetUsers?: string[];
  documentVersion?: string;
  status?: ProjectStatus;
  phase?: ProjectPhase;
  color?: string;
  icon?: string;
}
