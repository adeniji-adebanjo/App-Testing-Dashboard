// Generic Testing Module Types
// Used for both Functional Testing and Non-Functional Testing modules

import { RiskLevel } from "./test-case";

export type TestModuleType = "functional" | "non-functional";

export interface TestingModule {
  id: string;
  projectId: string;
  moduleType: TestModuleType; // Distinguish between functional and non-functional
  name: string; // Display name (e.g. "Authentication", "Performance")
  slug: string; // URL-safe slug (e.g. "auth", "performance")
  description?: string;
  icon?: string; // Icon identifier
  order: number; // Sort order
  isDefault: boolean; // Whether this is a system default or custom
  riskLevel?: RiskLevel; // Rosabon QA Framework §7 risk classification
  businessImpact?: string; // e.g. "Direct financial movement"
  createdAt: Date;
  updatedAt: Date;
}

export interface TestingModuleTemplate {
  id: string;
  moduleId: string; // Reference to TestingModule
  projectId: string;
  testCaseIdPrefix: string; // e.g., "AUTH", "PERF", "SEC"
  defaultScenarios: DefaultTestScenario[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DefaultTestScenario {
  id: string;
  testCaseId: string; // e.g., "AUTH-001"
  scenario: string;
  expectedResult: string;
  steps?: string;
  order: number;
}

// Backward compatibility aliases
export type FunctionalModule = TestingModule;
export type FunctionalModuleTemplate = TestingModuleTemplate;

// Input type for creating/editing modules
export interface TestingModuleInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
  riskLevel?: RiskLevel;
  businessImpact?: string;
  testCaseIdPrefix: string;
  defaultScenarios: Omit<DefaultTestScenario, "id">[];
}

export type FunctionalModuleInput = TestingModuleInput;

// Default FUNCTIONAL modules that come with the system
export const DEFAULT_FUNCTIONAL_MODULES: Omit<
  TestingModuleInput,
  "testCaseIdPrefix" | "defaultScenarios"
>[] = [
  {
    name: "Authentication",
    slug: "auth",
    description: "Login and access control testing",
    icon: "lock",
    riskLevel: "critical",
    businessImpact: "Security and account access",
  },
  {
    name: "Search",
    slug: "search",
    description: "Search functionality testing",
    icon: "search",
    riskLevel: "medium",
    businessImpact: "User productivity",
  },
  {
    name: "Duplicate Prevention",
    slug: "duplicate",
    description: "Duplicate detection and prevention testing",
    icon: "copy",
    riskLevel: "high",
    businessImpact: "Transaction integrity",
  },
  {
    name: "API Integration",
    slug: "api",
    description: "External API integration testing",
    icon: "api",
    riskLevel: "high",
    businessImpact: "Service communication",
  },
];

// Default NON-FUNCTIONAL modules that come with the system
export const DEFAULT_NON_FUNCTIONAL_MODULES: Omit<
  TestingModuleInput,
  "testCaseIdPrefix" | "defaultScenarios"
>[] = [
  {
    name: "Performance",
    slug: "performance",
    description: "Response time and load testing",
    icon: "gauge",
    riskLevel: "high",
    businessImpact: "Reliability and availability",
  },
  {
    name: "Security",
    slug: "security",
    description: "Security vulnerability and penetration testing",
    icon: "shield",
    riskLevel: "critical",
    businessImpact: "Data protection and fraud prevention",
  },
  {
    name: "Usability",
    slug: "usability",
    description: "User experience and accessibility testing",
    icon: "user",
    riskLevel: "low",
    businessImpact: "Customer experience",
  },
  {
    name: "Compatibility",
    slug: "compatibility",
    description: "Cross-browser and device compatibility testing",
    icon: "monitor",
    riskLevel: "medium",
    businessImpact: "Device reach",
  },
];

// Default test scenarios for functional modules
export const DEFAULT_FUNCTIONAL_SCENARIOS: Record<
  string,
  Omit<DefaultTestScenario, "id">[]
> = {
  auth: [
    {
      testCaseId: "AUTH-001",
      scenario: "Valid login - Standard user",
      expectedResult: "User logs in successfully",
      order: 0,
    },
    {
      testCaseId: "AUTH-002",
      scenario: "Invalid credentials",
      expectedResult: "Error message displayed",
      order: 1,
    },
  ],
  search: [
    {
      testCaseId: "SEARCH-001",
      scenario: "Search by primary identifier",
      expectedResult: "Results displayed correctly",
      order: 0,
    },
    {
      testCaseId: "SEARCH-002",
      scenario: "Search with no results",
      expectedResult: "No results found message",
      order: 1,
    },
  ],
  duplicate: [
    {
      testCaseId: "DUP-001",
      scenario: "Request duplicate within time period",
      expectedResult: "System blocks request",
      order: 0,
    },
  ],
  api: [
    {
      testCaseId: "API-001",
      scenario: "Fetch external data",
      expectedResult: "Data retrieved successfully",
      order: 0,
    },
  ],
};

// Default test scenarios for non-functional modules
export const DEFAULT_NON_FUNCTIONAL_SCENARIOS: Record<
  string,
  Omit<DefaultTestScenario, "id">[]
> = {
  performance: [
    {
      testCaseId: "PERF-001",
      scenario: "Response time < 2s",
      expectedResult: "System responds within threshold",
      order: 0,
    },
    {
      testCaseId: "PERF-002",
      scenario: "Concurrent users load test",
      expectedResult: "System stays stable with 100 concurrent users",
      order: 1,
    },
  ],
  security: [
    {
      testCaseId: "SEC-001",
      scenario: "SQL Injection protection",
      expectedResult: "Sanitization prevents injection",
      order: 0,
    },
    {
      testCaseId: "SEC-002",
      scenario: "XSS protection",
      expectedResult: "Scripts are properly escaped",
      order: 1,
    },
  ],
  usability: [
    {
      testCaseId: "USA-001",
      scenario: "Mobile responsiveness",
      expectedResult: "Layout adapts to different screens",
      order: 0,
    },
    {
      testCaseId: "USA-002",
      scenario: "Keyboard navigation",
      expectedResult: "All features accessible via keyboard",
      order: 1,
    },
  ],
  compatibility: [
    {
      testCaseId: "COMP-001",
      scenario: "Chrome browser compatibility",
      expectedResult: "All features work correctly",
      order: 0,
    },
    {
      testCaseId: "COMP-002",
      scenario: "Firefox browser compatibility",
      expectedResult: "All features work correctly",
      order: 1,
    },
  ],
};
