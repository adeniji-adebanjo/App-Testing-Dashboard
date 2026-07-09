// Central export for all project seed data

export {
  CREDIT_BUREAU_PROJECT_ID,
  creditBureauProject,
  creditBureauObjectives,
  creditBureauEnvironments,
} from "./credit-bureau";

export {
  WEALTH_MANAGEMENT_PROJECT_ID,
  wealthManagementProject,
  wealthManagementObjectives,
  wealthManagementEnvironments,
} from "./wealth-management";

export {
  ROSABON_PROJECT_ID,
  rosabonProject,
  rosabonObjectives,
  rosabonEnvironments,
  ROSABON_RISK_MATRIX,
  ROSABON_FUNCTIONAL_MODULES,
  ROSABON_NON_FUNCTIONAL_MODULES,
} from "./rosabon";

import { Project } from "@/types/project";
import { creditBureauProject } from "./credit-bureau";
import { wealthManagementProject } from "./wealth-management";
import { rosabonProject } from "./rosabon";

// All available projects
export const DEFAULT_PROJECTS: Project[] = [
  creditBureauProject,
  wealthManagementProject,
  rosabonProject,
];

// Get project by ID
export const getProjectById = (projectId: string): Project | undefined => {
  return DEFAULT_PROJECTS.find((p) => p.id === projectId);
};

// Get project by short code
export const getProjectByCode = (shortCode: string): Project | undefined => {
  return DEFAULT_PROJECTS.find(
    (p) => p.shortCode.toLowerCase() === shortCode.toLowerCase(),
  );
};
