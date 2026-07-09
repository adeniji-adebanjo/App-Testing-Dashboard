import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = "claude-opus-4-8";

export async function POST(request: NextRequest) {
  try {
    const { content, projectId, fileName } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 },
      );
    }

    // AI analysis requires an Anthropic API key
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        {
          success: false,
          error:
            "AI analysis is not configured. Set ANTHROPIC_API_KEY in the environment.",
        },
        { status: 500 },
      );
    }

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

    // Call the Anthropic Messages API (raw HTTP — the SDK is unavailable in
    // this environment; Node's global fetch is used instead).
    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error("Anthropic API error:", apiResponse.status, errText);
      return NextResponse.json(
        {
          success: false,
          error: `AI analysis failed (HTTP ${apiResponse.status}).`,
        },
        { status: 502 },
      );
    }

    const message = await apiResponse.json();

    // Safety classifiers may decline the request (HTTP 200, stop_reason "refusal")
    if (message.stop_reason === "refusal") {
      return NextResponse.json(
        {
          success: false,
          error: "AI analysis was declined by safety filters.",
        },
        { status: 422 },
      );
    }

    // Concatenate the text content blocks from the response
    const text: string = Array.isArray(message.content)
      ? message.content
          .filter((b: { type: string }) => b.type === "text")
          .map((b: { text: string }) => b.text)
          .join("")
      : "";

    console.log("Anthropic API response received, parsing...");

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
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text.substring(0, 500));
      return NextResponse.json(
        {
          success: false,
          error: "AI analysis returned an unparseable response.",
        },
        { status: 502 },
      );
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
      {
        success: false,
        error: "Failed to analyze PRD",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
