export type TestStatus = "pass" | "fail" | "pending" | "blocked";

// Rosabon QA Framework §7 - Risk Classification.
// Drives risk-based test prioritization across the app.
export type RiskLevel = "critical" | "high" | "medium" | "low";

// Rosabon QA Framework §10-15 - Testing disciplines.
// Lets a single test case be tagged with the discipline it belongs to
// (functional, regression, API, security, performance, mobile, UAT).
export type TestDiscipline =
  | "functional"
  | "regression"
  | "api"
  | "security"
  | "performance"
  | "mobile"
  | "uat";

// Rosabon QA Framework §21 - Environment Management.
export type EnvironmentType = "dev" | "staging" | "production";

// Rosabon QA Framework §2.1, §16-18 - Financial accuracy validation.
// The fintech crown jewel: lets a test case assert a numeric expected vs actual
// amount with an acceptable rounding tolerance for wallet, investment and loan
// calculations (interest, ROI, maturity, balances, fees, penalties).
export type FinancialCalcType =
  | "interest"
  | "roi"
  | "maturity"
  | "balance"
  | "fee"
  | "penalty";

export interface FinancialAssertion {
  calcType?: FinancialCalcType;
  currency?: string; // ISO code, defaults to NGN
  expectedAmount?: number;
  actualAmount?: number;
  tolerance?: number; // acceptable absolute delta (rounding), defaults to 0
}

export interface TestCase {
  id: string;
  projectId?: string; // Optional for backward compatibility
  testCaseId: string;
  module: string;
  scenario: string;
  steps?: string;
  expectedResult: string;
  actualResult: string;
  status: TestStatus;
  comments: string;
  riskLevel?: RiskLevel; // Inherited from module, overridable per case (§7)
  businessImpact?: string; // e.g. "Direct financial movement"
  testType?: TestDiscipline; // Discipline this case belongs to (§10-15)
  financial?: FinancialAssertion; // Numeric financial-accuracy assertion (§2.1)
  requirementIds?: string[]; // Linked requirements for traceability (§26, §28)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestModule {
  id: string;
  projectId?: string; // Optional for backward compatibility
  name: string;
  description: string;
  testCases: TestCase[];
}

export interface TestEnvironment {
  id?: string; // Added for consistency
  projectId?: string; // Added for multi-project support
  component: string;
  details: string;
  status: "ready" | "pending";
  type?: EnvironmentType; // Dev / Staging-UAT / Production classification (§21)
}

export interface TestObjective {
  id: string;
  projectId?: string; // Added for multi-project support
  description: string;
  completed: boolean;
}

export interface Defect {
  id: string;
  projectId?: string; // Optional for backward compatibility
  bugId: string;
  severity: "critical" | "high" | "medium" | "low";
  module: string;
  description: string;
  stepsToReproduce: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedTo: string;
  resolutionDate?: Date;
  createdAt: Date;
}

export interface SuccessMetric {
  id: string;
  projectId?: string; // Added for multi-project support
  metric: string;
  target: string;
  actualResult: string;
  status: "met" | "not-met" | "pending";
}

export interface SignOff {
  id?: string; // Added for consistency
  projectId?: string; // Added for multi-project support
  role: string;
  name: string;
  signature: string;
  date: Date | null;
}
