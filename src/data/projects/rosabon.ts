import { Project } from "@/types/project";
import {
  TestObjective,
  TestEnvironment,
  RiskLevel,
} from "@/types/test-case";
import { TestingModuleInput } from "@/types/functional-module";

export const ROSABON_PROJECT_ID = "rosabon-app";

// Canonical Rosabon App project per the QA & Testing Framework Strategy (§4-5).
export const rosabonProject: Project = {
  id: ROSABON_PROJECT_ID,
  name: "Rosabon App",
  shortCode: "RSB",
  description:
    "Rosabon's fintech mobile application: a digital financial ecosystem covering wealth management, investment products (RWIN, REAP, RTN), wallet operations and an upcoming loan module. Governed by the Rosabon QA & Testing Framework Strategy.",
  projectType: "mobile",
  techStack: ["React Native", "Node.js", "PostgreSQL", "Redis", "AWS"],
  targetUsers: [
    "Retail Investors",
    "Wallet Users",
    "Wealth Management Clients",
    "Operations Staff",
  ],
  documentVersion: "1.0",
  status: "active",
  phase: "testing",
  color: "#7C3AED", // Rosabon purple
  icon: "wallet",
  createdAt: new Date("2026-05-26"),
  updatedAt: new Date(),
};

// QA objectives derived from the framework (§6, §31).
export const rosabonObjectives: TestObjective[] = [
  {
    id: "rsb-obj-1",
    projectId: ROSABON_PROJECT_ID,
    description: "Validate wallet transaction integrity (no loss, no duplicates, accurate balances)",
    completed: false,
  },
  {
    id: "rsb-obj-2",
    projectId: ROSABON_PROJECT_ID,
    description: "Verify investment returns, interest, ROI and maturity computations",
    completed: false,
  },
  {
    id: "rsb-obj-3",
    projectId: ROSABON_PROJECT_ID,
    description: "Test RWIN, REAP and RTN product enrollment, funding and withdrawal flows",
    completed: false,
  },
  {
    id: "rsb-obj-4",
    projectId: ROSABON_PROJECT_ID,
    description: "Validate authentication, OTP, session handling and role-based access (§13)",
    completed: false,
  },
  {
    id: "rsb-obj-5",
    projectId: ROSABON_PROJECT_ID,
    description: "Confirm transaction history accuracy and traceability",
    completed: false,
  },
  {
    id: "rsb-obj-6",
    projectId: ROSABON_PROJECT_ID,
    description: "Test API integrations (wallet, investment, auth, notification) for data consistency (§12)",
    completed: false,
  },
  {
    id: "rsb-obj-7",
    projectId: ROSABON_PROJECT_ID,
    description: "Measure performance under concurrent wallet funding and login spikes (§14)",
    completed: false,
  },
  {
    id: "rsb-obj-8",
    projectId: ROSABON_PROJECT_ID,
    description: "Validate mobile stability across Android/iOS devices and network conditions (§15)",
    completed: false,
  },
  {
    id: "rsb-obj-9",
    projectId: ROSABON_PROJECT_ID,
    description: "Prepare proactive QA coverage for the upcoming Loan module (§19)",
    completed: false,
  },
  {
    id: "rsb-obj-10",
    projectId: ROSABON_PROJECT_ID,
    description: "Complete UAT sign-off and release-readiness checklist before production (§20, §24)",
    completed: false,
  },
];

// Environment Management strategy (§21) - typed Dev / Staging-UAT / Production.
export const rosabonEnvironments: TestEnvironment[] = [
  {
    id: "rsb-env-1",
    projectId: ROSABON_PROJECT_ID,
    component: "Development",
    details: "Active development and early testing",
    status: "ready",
    type: "dev",
  },
  {
    id: "rsb-env-2",
    projectId: ROSABON_PROJECT_ID,
    component: "Staging / UAT",
    details: "Release validation and business acceptance testing",
    status: "pending",
    type: "staging",
  },
  {
    id: "rsb-env-3",
    projectId: ROSABON_PROJECT_ID,
    component: "Production",
    details: "Live customer-facing environment",
    status: "pending",
    type: "production",
  },
  {
    id: "rsb-env-4",
    projectId: ROSABON_PROJECT_ID,
    component: "Mobile Devices",
    details: "Android 11+ and iOS 15+ across screen sizes",
    status: "pending",
    type: "staging",
  },
  {
    id: "rsb-env-5",
    projectId: ROSABON_PROJECT_ID,
    component: "Payment Gateway (Sandbox)",
    details: "Paystack / Flutterwave sandbox for wallet funding",
    status: "pending",
    type: "staging",
  },
];

// -----------------------------------------------------------------------------
// Rosabon QA Framework §7 - Risk Classification Matrix.
// Single source of truth mapping business modules to risk level + impact.
// Consumed when seeding Rosabon testing modules so the highest-risk systems
// receive the highest testing priority.
// -----------------------------------------------------------------------------
export interface RiskMatrixEntry {
  module: string;
  riskLevel: RiskLevel;
  businessImpact: string;
}

export const ROSABON_RISK_MATRIX: RiskMatrixEntry[] = [
  { module: "Wallet Transactions", riskLevel: "critical", businessImpact: "Direct financial movement" },
  { module: "Authentication", riskLevel: "critical", businessImpact: "Security and account access" },
  { module: "Investment Returns", riskLevel: "critical", businessImpact: "Financial accuracy" },
  { module: "Loan Calculations", riskLevel: "critical", businessImpact: "Financial and legal impact" },
  { module: "API Integrations", riskLevel: "high", businessImpact: "Service communication" },
  { module: "Transaction History", riskLevel: "high", businessImpact: "Customer trust" },
  { module: "Notifications", riskLevel: "medium", businessImpact: "Customer communication" },
  { module: "Profile Management", riskLevel: "medium", businessImpact: "User management" },
  { module: "UI Styling", riskLevel: "low", businessImpact: "Cosmetic impact" },
];

// Functional testing module catalog for the Rosabon App, mapped to the core
// business modules (§5) and risk matrix (§7). Used as the seed when the Rosabon
// project's functional modules are first configured.
export const ROSABON_FUNCTIONAL_MODULES: Omit<
  TestingModuleInput,
  "defaultScenarios"
>[] = [
  {
    name: "Authentication",
    slug: "auth",
    description: "Login, OTP, session handling and access control",
    icon: "lock",
    riskLevel: "critical",
    businessImpact: "Security and account access",
    testCaseIdPrefix: "AUTH",
  },
  {
    name: "Wallet System",
    slug: "wallet",
    description: "Funding, debit/credit, balance sync, transfers and duplicate prevention (§16)",
    icon: "database",
    riskLevel: "critical",
    businessImpact: "Direct financial movement",
    testCaseIdPrefix: "WALT",
  },
  {
    name: "Wealth Management",
    slug: "wealth",
    description: "Investment onboarding, funding, maturity and portfolio calculations (§17)",
    icon: "code",
    riskLevel: "critical",
    businessImpact: "Financial accuracy",
    testCaseIdPrefix: "WMGT",
  },
  {
    name: "RWIN",
    slug: "rwin",
    description: "RWIN enrollment, funding, return calculations and withdrawals (§18)",
    icon: "code",
    riskLevel: "critical",
    businessImpact: "Financial accuracy",
    testCaseIdPrefix: "RWIN",
  },
  {
    name: "REAP",
    slug: "reap",
    description: "REAP investment creation, portfolio visibility and maturity handling (§18)",
    icon: "code",
    riskLevel: "critical",
    businessImpact: "Financial accuracy",
    testCaseIdPrefix: "REAP",
  },
  {
    name: "RTN",
    slug: "rtn",
    description: "RTN product logic, financial computations and wallet interaction (§18)",
    icon: "code",
    riskLevel: "critical",
    businessImpact: "Financial accuracy",
    testCaseIdPrefix: "RTN",
  },
  {
    name: "Loan Management",
    slug: "loan",
    description: "Loan application, eligibility, underwriting and repayment (upcoming, §19)",
    icon: "code",
    riskLevel: "critical",
    businessImpact: "Financial and legal impact",
    testCaseIdPrefix: "LOAN",
  },
  {
    name: "Transaction History",
    slug: "transactions",
    description: "Transaction logging, traceability and history accuracy",
    icon: "search",
    riskLevel: "high",
    businessImpact: "Customer trust",
    testCaseIdPrefix: "TXN",
  },
  {
    name: "API Integration",
    slug: "api",
    description: "Wallet, investment, auth and notification API validation (§12)",
    icon: "api",
    riskLevel: "high",
    businessImpact: "Service communication",
    testCaseIdPrefix: "API",
  },
  {
    name: "Notifications",
    slug: "notifications",
    description: "Email, SMS and push notification handling",
    icon: "user",
    riskLevel: "medium",
    businessImpact: "Customer communication",
    testCaseIdPrefix: "NOTIF",
  },
  {
    name: "Profile Management",
    slug: "profile",
    description: "User profile and account management",
    icon: "user",
    riskLevel: "medium",
    businessImpact: "User management",
    testCaseIdPrefix: "PROF",
  },
];

// Non-functional testing module catalog for the Rosabon App (§13-15).
export const ROSABON_NON_FUNCTIONAL_MODULES: Omit<
  TestingModuleInput,
  "defaultScenarios"
>[] = [
  {
    name: "Security",
    slug: "security",
    description: "Auth, OTP, RBAC, secure transmission and OWASP checks (§13)",
    icon: "shield",
    riskLevel: "critical",
    businessImpact: "Data protection and fraud prevention",
    testCaseIdPrefix: "SEC",
  },
  {
    name: "Performance",
    slug: "performance",
    description: "Concurrent funding, transaction and login load testing (§14)",
    icon: "gauge",
    riskLevel: "high",
    businessImpact: "Reliability and availability",
    testCaseIdPrefix: "PERF",
  },
  {
    name: "Mobile Compatibility",
    slug: "compatibility",
    description: "Android/iOS devices, screen sizes and network conditions (§15)",
    icon: "monitor",
    riskLevel: "medium",
    businessImpact: "Device reach",
    testCaseIdPrefix: "COMP",
  },
  {
    name: "Usability",
    slug: "usability",
    description: "User experience and accessibility",
    icon: "user",
    riskLevel: "low",
    businessImpact: "Customer experience",
    testCaseIdPrefix: "USA",
  },
];
