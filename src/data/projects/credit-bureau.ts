import { Project } from "@/types/project";
import { TestObjective, TestEnvironment } from "@/types/test-case";

export const CREDIT_BUREAU_PROJECT_ID = "credit-bureau-portal";

export const creditBureauProject: Project = {
  id: CREDIT_BUREAU_PROJECT_ID,
  name: "Credit Bureau Portal",
  shortCode: "CBP",
  description:
    "A comprehensive web application for managing and analyzing credit bureau reports. Enables credit underwriters, analysts, and operations teams to efficiently process and evaluate credit information.",
  techStack: [
    "Next.js",
    "TypeScript",
    "PostgreSQL",
    "MongoDB",
    "Node.js",
    "Django",
  ],
  targetUsers: [
    "Credit Underwriters",
    "Credit Analysts",
    "Operations Team",
    "Sales Team Leads",
  ],
  documentVersion: "1.0",
  status: "active",
  phase: "testing",
  color: "#3B82F6", // Blue
  icon: "credit-card",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date(),
};

// Default test objectives for Credit Bureau Portal
export const creditBureauObjectives: TestObjective[] = [
  {
    id: "obj-1",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    description: "Validate user authentication and authorization flows",
    completed: false,
  },
  {
    id: "obj-2",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    description: "Test credit report retrieval and display accuracy",
    completed: false,
  },
  {
    id: "obj-3",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    description: "Verify data integrity across all modules",
    completed: false,
  },
  {
    id: "obj-4",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    description: "Validate role-based access controls",
    completed: false,
  },
  {
    id: "obj-5",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    description: "Test integration with credit bureau APIs",
    completed: false,
  },
  {
    id: "obj-6",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    description: "Verify report generation and export functionality",
    completed: false,
  },
  {
    id: "obj-7",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    description: "Test performance under expected load conditions",
    completed: false,
  },
  {
    id: "obj-8",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    description:
      "Validate mobile responsiveness and cross-browser compatibility",
    completed: false,
  },
];

// Default test environments for Credit Bureau Portal
export const creditBureauEnvironments: TestEnvironment[] = [
  {
    id: "env-1",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    component: "Application Server",
    details: "Node.js v18+, Next.js 14",
    status: "ready",
  },
  {
    id: "env-2",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    component: "Database Server",
    details: "PostgreSQL 15 / MongoDB 6.0",
    status: "ready",
  },
  {
    id: "env-3",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    component: "Test Data",
    details: "Sample credit reports and user accounts",
    status: "pending",
  },
  {
    id: "env-4",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    component: "Credit Bureau API",
    details: "Sandbox environment for API testing",
    status: "pending",
  },
  {
    id: "env-5",
    projectId: CREDIT_BUREAU_PROJECT_ID,
    component: "Browser Testing",
    details: "Chrome, Firefox, Safari, Edge",
    status: "ready",
  },
];
