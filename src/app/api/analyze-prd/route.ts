import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { content, projectId, fileName } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 },
      );
    }

    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.log(
        "No GOOGLE_GENERATIVE_AI_API_KEY configured, using mock data",
      );
      // Return mock data if no API key
      return NextResponse.json({
        success: true,
        usedMock: true,
        tabs: generateMockTabs(projectId),
        testCases: generateMockTestCases(projectId),
        objectives: generateMockObjectives(projectId),
        analysis:
          "Mock analysis: API key not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file for real AI processing.",
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt for test cases, objectives, AND tabs
    const prompt = `You are a QA Test Architecture Generator. Analyze the following Product Requirements Document (PRD) and extract:

1. TESTING TABS - Identify the main testing categories needed for this project. Suggest 3-6 relevant tabs such as:
   - Functional Testing, API Testing, Security Testing, Performance Testing, Integration Testing, UI/UX Testing, etc.
   Each tab should have:
   - name: string (display name)
   - slug: string (URL-friendly lowercase with hyphens)
   - description: string (brief description of what this tab tests)
   - icon: string (one of: "clipboard-list", "shield", "activity", "database", "globe", "lock", "zap", "users")

2. TEST CASES - For each requirement or feature, generate test cases with:
   - testCaseId: string (format: TC-XXX)
   - scenario: string (the test case title)
   - module: string (should match one of the tab names above)
   - steps: string (numbered steps, one per line)
   - expectedResult: string
   - priority: "high" | "medium" | "low"

3. OBJECTIVES/SUCCESS METRICS - Extract key project objectives with:
   - id: string (format: OBJ-XXX)
   - title: string (objective name)
   - description: string (what this objective aims to achieve)
   - targetValue: number (target percentage or count)
   - currentValue: number (start at 0)
   - unit: string (e.g., "%", "count", "hours")
   - category: "quality" | "performance" | "coverage" | "efficiency"

Return the output as a JSON object with three arrays:
{
  "tabs": [...],
  "testCases": [...],
  "objectives": [...]
}

PRD Content:
${content.substring(0, 15000)}

Return ONLY valid JSON, no markdown formatting or explanation.`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini API response received, parsing...");

    // Parse the JSON response
    let parsedData: {
      tabs?: unknown[];
      testCases?: unknown[];
      objectives?: unknown[];
    } = {};
    try {
      // Try to extract JSON object from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        // Try to find just the arrays
        const testCasesMatch = text.match(/\[[\s\S]*?\]/);
        if (testCasesMatch) {
          parsedData = {
            tabs: [],
            testCases: JSON.parse(testCasesMatch[0]),
            objectives: [],
          };
        } else {
          throw new Error("No JSON found in response");
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.log("Raw response:", text.substring(0, 500));
      // Return mock data if parsing fails
      return NextResponse.json({
        success: true,
        usedMock: true,
        tabs: generateMockTabs(projectId),
        testCases: generateMockTestCases(projectId),
        objectives: generateMockObjectives(projectId),
        analysis:
          "AI analysis completed but response parsing failed. Using sample data.",
      });
    }

    // Format tabs to match our schema
    const tabs = (
      Array.isArray(parsedData.tabs) ? parsedData.tabs : []
    ) as Record<string, unknown>[];
    const formattedTabs = tabs.map((tab, index) => ({
      id: `tab-${Date.now()}-${index}`,
      projectId: projectId,
      name: (tab.name as string) || `Tab ${index + 1}`,
      slug: (tab.slug as string) || `tab-${index + 1}`,
      description: (tab.description as string) || "",
      icon: (tab.icon as string) || "clipboard-list",
      order: index,
      isDefault: false,
      aiGenerated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Format test cases to match our schema
    const testCases = (
      Array.isArray(parsedData.testCases) ? parsedData.testCases : []
    ) as Record<string, unknown>[];
    const formattedTestCases = testCases.map((tc, index) => ({
      id: `tc-${Date.now()}-${index}`,
      testCaseId:
        (tc.testCaseId as string) || `TC-${String(index + 1).padStart(3, "0")}`,
      projectId: projectId,
      scenario:
        (tc.scenario as string) || (tc.title as string) || "Untitled Test Case",
      module: (tc.module as string) || "General",
      steps: (tc.steps as string) || "",
      expectedResult: (tc.expectedResult as string) || "",
      actualResult: "",
      status: "pending" as const,
      comments: `Generated from PRD: ${fileName || "uploaded document"}`,
    }));

    // Format objectives to match our schema
    const objectives = (
      Array.isArray(parsedData.objectives) ? parsedData.objectives : []
    ) as Record<string, unknown>[];
    const formattedObjectives = objectives.map((obj, index) => ({
      id: `obj-${Date.now()}-${index}`,
      projectId: projectId,
      title: (obj.title as string) || `Objective ${index + 1}`,
      description: (obj.description as string) || "",
      targetValue: Number(obj.targetValue) || 100,
      currentValue: Number(obj.currentValue) || 0,
      unit: (obj.unit as string) || "%",
      category: (obj.category as string) || "quality",
    }));

    console.log(
      `AI analysis complete: ${formattedTabs.length} tabs, ${formattedTestCases.length} test cases, ${formattedObjectives.length} objectives`,
    );

    return NextResponse.json({
      success: true,
      usedMock: false,
      tabs: formattedTabs,
      testCases: formattedTestCases,
      objectives: formattedObjectives,
      analysis: `AI analysis complete. Generated ${formattedTabs.length} testing tabs, ${formattedTestCases.length} test cases, and ${formattedObjectives.length} objectives from the PRD.`,
    });
  } catch (error) {
    console.error("PRD analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze PRD", details: String(error) },
      { status: 500 },
    );
  }
}

// Mock tabs generator for demo mode
function generateMockTabs(projectId: string) {
  return [
    {
      id: `tab-${Date.now()}-1`,
      projectId: projectId,
      name: "Functional Testing",
      slug: "functional-testing",
      description: "Test core business functionality and user workflows",
      icon: "clipboard-list",
      order: 0,
      isDefault: true,
      aiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `tab-${Date.now()}-2`,
      projectId: projectId,
      name: "API Testing",
      slug: "api-testing",
      description: "Validate API endpoints, responses, and integrations",
      icon: "database",
      order: 1,
      isDefault: false,
      aiGenerated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `tab-${Date.now()}-3`,
      projectId: projectId,
      name: "Security Testing",
      slug: "security-testing",
      description: "Test authentication, authorization, and data protection",
      icon: "shield",
      order: 2,
      isDefault: false,
      aiGenerated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `tab-${Date.now()}-4`,
      projectId: projectId,
      name: "Performance Testing",
      slug: "performance-testing",
      description: "Measure response times, load capacity, and scalability",
      icon: "activity",
      order: 3,
      isDefault: false,
      aiGenerated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

// Mock test case generator for demo mode
function generateMockTestCases(projectId: string) {
  return [
    {
      id: `tc-${Date.now()}-1`,
      testCaseId: "TC-001",
      projectId: projectId,
      scenario: "User Authentication - Login Flow",
      module: "Authentication",
      steps: [
        "1. Navigate to login page",
        "2. Enter valid email address",
        "3. Enter valid password",
        "4. Click 'Sign In' button",
      ].join("\n"),
      expectedResult: "User is authenticated and redirected to dashboard",
      actualResult: "",
      status: "pending" as const,
      comments: "Generated from PRD analysis (mock)",
    },
    {
      id: `tc-${Date.now()}-2`,
      testCaseId: "TC-002",
      projectId: projectId,
      scenario: "Data Validation - Required Fields",
      module: "Forms",
      steps: [
        "1. Navigate to data entry form",
        "2. Leave required fields empty",
        "3. Click 'Submit' button",
      ].join("\n"),
      expectedResult:
        "Form shows validation errors for required fields, submission is blocked",
      actualResult: "",
      status: "pending" as const,
      comments: "Generated from PRD analysis (mock)",
    },
    {
      id: `tc-${Date.now()}-3`,
      testCaseId: "TC-003",
      projectId: projectId,
      scenario: "Report Generation - PDF Export",
      module: "Reports",
      steps: [
        "1. Navigate to reports section",
        "2. Select date range",
        "3. Click 'Generate PDF' button",
        "4. Wait for download prompt",
      ].join("\n"),
      expectedResult:
        "PDF file downloads with correct data matching selected criteria",
      actualResult: "",
      status: "pending" as const,
      comments: "Generated from PRD analysis (mock)",
    },
  ];
}

// Mock objectives generator for demo mode
function generateMockObjectives(projectId: string) {
  return [
    {
      id: `obj-${Date.now()}-1`,
      projectId: projectId,
      title: "Test Coverage Target",
      description:
        "Achieve comprehensive test coverage across all critical modules",
      targetValue: 95,
      currentValue: 0,
      unit: "%",
      category: "coverage",
    },
    {
      id: `obj-${Date.now()}-2`,
      projectId: projectId,
      title: "Defect Resolution Rate",
      description: "Resolve critical and high priority defects within SLA",
      targetValue: 90,
      currentValue: 0,
      unit: "%",
      category: "quality",
    },
    {
      id: `obj-${Date.now()}-3`,
      projectId: projectId,
      title: "Regression Test Pass Rate",
      description: "Maintain high pass rate for regression test suites",
      targetValue: 98,
      currentValue: 0,
      unit: "%",
      category: "quality",
    },
    {
      id: `obj-${Date.now()}-4`,
      projectId: projectId,
      title: "Test Execution Efficiency",
      description: "Complete test cycles within planned timeframes",
      targetValue: 100,
      currentValue: 0,
      unit: "%",
      category: "efficiency",
    },
  ];
}
