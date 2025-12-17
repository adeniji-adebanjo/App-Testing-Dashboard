export type TestStatus = "pass" | "fail" | "pending" | "blocked";

export interface TestCase {
  id: string;
  testCaseId: string;
  module: string;
  scenario: string;
  steps?: string;
  expectedResult: string;
  actualResult: string;
  status: TestStatus;
  comments: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestModule {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
}

export interface TestEnvironment {
  component: string;
  details: string;
  status: "ready" | "pending";
}

export interface TestObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface Defect {
  id: string;
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
  metric: string;
  target: string;
  actualResult: string;
  status: "met" | "not-met" | "pending";
}

export interface SignOff {
  role: string;
  name: string;
  signature: string;
  date: Date | null;
}
