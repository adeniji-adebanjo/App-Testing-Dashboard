"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestCaseTable from "@/components/testing/TestCaseTable";
import { TestCase } from "@/types/test-case";

const performanceTests: TestCase[] = [
  {
    id: "perf-1",
    testCaseId: "PERF-001",
    module: "Performance",
    scenario: "Report retrieval time - Normal load",
    expectedResult: "Retrieved in <2 seconds",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "perf-2",
    testCaseId: "PERF-002",
    module: "Performance",
    scenario: "Page load time - Normal load",
    expectedResult: "Loads in <3 seconds",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "perf-3",
    testCaseId: "PERF-003",
    module: "Performance",
    scenario: "Concurrent user handling - 50 users",
    expectedResult: "No performance degradation",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "perf-4",
    testCaseId: "PERF-004",
    module: "Performance",
    scenario: "Database query optimization",
    expectedResult: "<1 second response time",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "perf-5",
    testCaseId: "PERF-005",
    module: "Performance",
    scenario: "API response time - Peak hours",
    expectedResult: "Consistent performance maintained",
    actualResult: "",
    status: "pending",
    comments: "",
  },
];

const securityTests: TestCase[] = [
  {
    id: "sec-1",
    testCaseId: "SEC-001",
    module: "Security",
    scenario: "OAuth 2.0 authentication",
    expectedResult: "Authentication secure and working",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "sec-2",
    testCaseId: "SEC-002",
    module: "Security",
    scenario: "HTTPS encryption",
    expectedResult: "All traffic encrypted",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "sec-3",
    testCaseId: "SEC-003",
    module: "Security",
    scenario: "API key storage (vaulting)",
    expectedResult: "Keys stored securely in vault",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "sec-4",
    testCaseId: "SEC-004",
    module: "Security",
    scenario: "SQL injection prevention",
    expectedResult: "System protected against SQL injection",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "sec-5",
    testCaseId: "SEC-005",
    module: "Security",
    scenario: "XSS attack prevention",
    expectedResult: "System protected against XSS",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "sec-6",
    testCaseId: "SEC-006",
    module: "Security",
    scenario: "CSRF protection",
    expectedResult: "CSRF tokens properly implemented",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "sec-7",
    testCaseId: "SEC-007",
    module: "Security",
    scenario: "Unauthorized access attempt",
    expectedResult: "Access denied and logged",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "sec-8",
    testCaseId: "SEC-008",
    module: "Security",
    scenario: "Data encryption at rest",
    expectedResult: "Sensitive data encrypted in database",
    actualResult: "",
    status: "pending",
    comments: "",
  },
];

const usabilityTests: TestCase[] = [
  {
    id: "usab-1",
    testCaseId: "USAB-001",
    module: "Usability",
    scenario: "UI intuitiveness",
    expectedResult: "Users can navigate without training",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "usab-2",
    testCaseId: "USAB-002",
    module: "Usability",
    scenario: "Error message clarity",
    expectedResult: "Messages are clear and actionable",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "usab-3",
    testCaseId: "USAB-003",
    module: "Usability",
    scenario: "Mobile responsiveness",
    expectedResult: "UI adapts properly to all screen sizes",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "usab-4",
    testCaseId: "USAB-004",
    module: "Usability",
    scenario: "Accessibility (WCAG)",
    expectedResult: "Meets WCAG 2.1 AA standards",
    actualResult: "",
    status: "pending",
    comments: "",
  },
];

const compatibilityTests: TestCase[] = [
  {
    id: "comp-1",
    testCaseId: "COMP-001",
    module: "Compatibility",
    scenario: "Chrome browser - Desktop",
    expectedResult: "Full functionality on Chrome latest",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "comp-2",
    testCaseId: "COMP-002",
    module: "Compatibility",
    scenario: "Firefox browser - Desktop",
    expectedResult: "Full functionality on Firefox latest",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "comp-3",
    testCaseId: "COMP-003",
    module: "Compatibility",
    scenario: "Safari browser - Desktop",
    expectedResult: "Full functionality on Safari latest",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "comp-4",
    testCaseId: "COMP-004",
    module: "Compatibility",
    scenario: "Edge browser - Desktop",
    expectedResult: "Full functionality on Edge latest",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "comp-5",
    testCaseId: "COMP-005",
    module: "Compatibility",
    scenario: "Chrome Mobile - Android",
    expectedResult: "Full functionality on mobile Chrome",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "comp-6",
    testCaseId: "COMP-006",
    module: "Compatibility",
    scenario: "Safari Mobile - iOS",
    expectedResult: "Full functionality on mobile Safari",
    actualResult: "",
    status: "pending",
    comments: "",
  },
];

export default function NonFunctionalTestingPage() {
  const [perfTests, setPerfTests] = useState<TestCase[]>(performanceTests);
  const [secTests, setSecTests] = useState<TestCase[]>(securityTests);
  const [usabTests, setUsabTests] = useState<TestCase[]>(usabilityTests);
  const [compTests, setCompTests] = useState<TestCase[]>(compatibilityTests);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Non-Functional Testing
        </h1>
        <p className="mt-2 text-gray-600">
          Test performance, security, usability, and compatibility requirements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="usability">Usability</TabsTrigger>
              <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-6">
              <TestCaseTable
                testCases={perfTests}
                onUpdate={(updatedCases) => setPerfTests(updatedCases)}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <TestCaseTable
                testCases={secTests}
                onUpdate={(updatedCases) => setSecTests(updatedCases)}
              />
            </TabsContent>

            <TabsContent value="usability" className="mt-6">
              <TestCaseTable
                testCases={usabTests}
                onUpdate={(updatedCases) => setUsabTests(updatedCases)}
              />
            </TabsContent>

            <TabsContent value="compatibility" className="mt-6">
              <TestCaseTable
                testCases={compTests}
                onUpdate={(updatedCases) => setCompTests(updatedCases)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
