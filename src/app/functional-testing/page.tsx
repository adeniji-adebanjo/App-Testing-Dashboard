"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestCaseTable from "@/components/testing/TestCaseTable";
import { TestCase } from "@/types/test-case";

const authTestCases: TestCase[] = [
  {
    id: "1",
    testCaseId: "AUTH-001",
    module: "Authentication",
    scenario: "Valid login - Analyst role",
    expectedResult: "User logs in successfully, sees Analyst dashboard",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "2",
    testCaseId: "AUTH-002",
    module: "Authentication",
    scenario: "Valid login - Team Lead role",
    expectedResult: "User logs in successfully, sees Team Lead dashboard",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "3",
    testCaseId: "AUTH-003",
    module: "Authentication",
    scenario: "Valid login - Admin role",
    expectedResult: "User logs in successfully, sees Admin dashboard",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "4",
    testCaseId: "AUTH-004",
    module: "Authentication",
    scenario: "Invalid credentials",
    expectedResult: "Error message displayed, login denied",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "5",
    testCaseId: "AUTH-005",
    module: "Authentication",
    scenario: "Session timeout",
    expectedResult: "User logged out after inactivity period",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "6",
    testCaseId: "AUTH-006",
    module: "Authentication",
    scenario: "Role-based access control",
    expectedResult: "Users only see features allowed for their role",
    actualResult: "",
    status: "pending",
    comments: "",
  },
];

const searchTestCases: TestCase[] = [
  {
    id: "7",
    testCaseId: "SEARCH-001",
    module: "Search",
    scenario: "Search by BVN (valid)",
    expectedResult: "Customer details displayed",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "8",
    testCaseId: "SEARCH-002",
    module: "Search",
    scenario: "Search by phone number (valid)",
    expectedResult: "Customer details displayed",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "9",
    testCaseId: "SEARCH-003",
    module: "Search",
    scenario: "Search by name (valid)",
    expectedResult: "List of matching customers displayed",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "10",
    testCaseId: "SEARCH-004",
    module: "Search",
    scenario: "Search with invalid BVN",
    expectedResult: "Appropriate error message shown",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "11",
    testCaseId: "SEARCH-005",
    module: "Search",
    scenario: "Search with no results",
    expectedResult: "No results found message displayed",
    actualResult: "",
    status: "pending",
    comments: "",
  },
];

const duplicateTestCases: TestCase[] = [
  {
    id: "12",
    testCaseId: "DUP-001",
    module: "Duplicate Prevention",
    scenario: "Request report for same customer same day",
    expectedResult: "System blocks request, shows warning",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "13",
    testCaseId: "DUP-002",
    module: "Duplicate Prevention",
    scenario: "Team Lead override for duplicate",
    expectedResult: "Override successful, report spooled",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "14",
    testCaseId: "DUP-003",
    module: "Duplicate Prevention",
    scenario: "Request report next day for same customer",
    expectedResult: "Request allowed",
    actualResult: "",
    status: "pending",
    comments: "",
  },
];

const apiTestCases: TestCase[] = [
  {
    id: "15",
    testCaseId: "API-001",
    module: "API Integration",
    scenario: "Credit Registry - Fetch personal report",
    expectedResult: "Report retrieved successfully",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "16",
    testCaseId: "API-002",
    module: "API Integration",
    scenario: "Credit Registry - Fetch commercial report",
    expectedResult: "Report retrieved successfully",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "17",
    testCaseId: "API-003",
    module: "API Integration",
    scenario: "First Central - Fetch personal report",
    expectedResult: "Report retrieved successfully",
    actualResult: "",
    status: "pending",
    comments: "",
  },
  {
    id: "18",
    testCaseId: "API-007",
    module: "API Integration",
    scenario: "Report retrieval time",
    expectedResult: "Retrieved in <2 seconds",
    actualResult: "",
    status: "pending",
    comments: "",
  },
];

export default function FunctionalTestingPage() {
  const [authTests, setAuthTests] = useState<TestCase[]>(authTestCases);
  const [searchTests, setSearchTests] = useState<TestCase[]>(searchTestCases);
  const [duplicateTests, setDuplicateTests] =
    useState<TestCase[]>(duplicateTestCases);
  const [apiTests, setApiTests] = useState<TestCase[]>(apiTestCases);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Functional Testing</h1>
        <p className="mt-2 text-gray-600">
          Test all functional requirements and user flows
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="search">Customer Search</TabsTrigger>
              <TabsTrigger value="duplicate">Duplicate Prevention</TabsTrigger>
              <TabsTrigger value="api">API Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="auth" className="mt-6">
              <TestCaseTable
                testCases={authTests}
                onUpdate={(updatedCases) => setAuthTests(updatedCases)}
              />
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <TestCaseTable
                testCases={searchTests}
                onUpdate={(updatedCases) => setSearchTests(updatedCases)}
              />
            </TabsContent>

            <TabsContent value="duplicate" className="mt-6">
              <TestCaseTable
                testCases={duplicateTests}
                onUpdate={(updatedCases) => setDuplicateTests(updatedCases)}
              />
            </TabsContent>

            <TabsContent value="api" className="mt-6">
              <TestCaseTable
                testCases={apiTests}
                onUpdate={(updatedCases) => setApiTests(updatedCases)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
