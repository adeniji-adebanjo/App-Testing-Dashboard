export type ProjectStatus = "active" | "completed" | "on-hold" | "archived";
export type ProjectPhase =
  | "planning"
  | "development"
  | "testing"
  | "uat"
  | "completed";

export type ProjectType = "web" | "mobile";

import { TestObjective, TestEnvironment } from "./test-case";

export interface Project {
  id: string;
  name: string;
  shortCode: string; // e.g., "CBP", "WMA"
  description: string;
  projectType: ProjectType;
  techStack: string[];
  targetUsers: string[];
  documentVersion: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  color: string; // Theme color for the project (hex or tailwind color)
  icon?: string; // Optional icon identifier
  objectives?: TestObjective[];
  environments?: TestEnvironment[];
  customTabs?: ProjectTab[]; // Custom navigation tabs for this project
  createdAt: Date;
  updatedAt: Date;
}

// Define customizable tabs for each project
export interface ProjectTab {
  id: string;
  projectId: string;
  name: string; // Display name (e.g., "API Testing", "Security Testing")
  slug: string; // URL slug (e.g., "api-testing", "security-testing")
  description?: string;
  icon?: string; // Icon identifier (e.g., "shield", "api", "database")
  order: number; // Sort order for navigation
  isDefault: boolean; // Whether this is a default tab or custom
  aiGenerated: boolean; // Whether content was AI-generated
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
  projectType: ProjectType;
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
  projectType?: ProjectType;
  techStack?: string[];
  targetUsers?: string[];
  status?: ProjectStatus;
  phase?: ProjectPhase;
  color?: string;
  icon?: string;
  documentVersion?: string;
}
