import { test, expect } from "@playwright/test";

test.describe("Dynamic Workspace Features", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    // Navigate to a known test project or the first available one
    await page.goto("/dashboard");

    // Wait for projects to load
    const projectCard = page
      .getByRole("link")
      .filter({ hasText: /View Dashboard/i })
      .first();
    await expect(projectCard).toBeVisible();
    await projectCard.click();
  });

  test("should switch sidebar to Project Navigation and update branding", async ({
    page,
  }) => {
    // Verify Sidebar switches to Project context
    await expect(page.getByText("Project Navigation")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Functional Testing/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Defect Tracking/i }),
    ).toBeVisible();

    // Verify Project title is visible in workspace
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("should handle AI PRD Analysis file upload", async ({ page }) => {
    // Scroll to AI PRD section if needed
    await page.getByText("AI PRD Analysis").scrollIntoViewIfNeeded();

    // Mock/Simulate File Upload
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: /Select File/i }).click();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles({
      name: "test-prd.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(
        "# PRD\n\n- Feature: User Login\n- Requirement: Error handling for wrong passwords.",
      ),
    });

    await page.getByRole("button", { name: /Analyze with AI/i }).click();

    // Verify "Processing" State (Loader)
    await expect(page.getByText(/AI Analyzing PRD/i)).toBeVisible();

    // Verify Results (Wait for transition - generous timeout for "AI" mock)
    await expect(page.getByText(/Analysis Complete/i)).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText(/Suggested Tabs/i)).toBeVisible();
  });

  test("should sync new defects with Live Metrics", async ({ page }) => {
    // Navigate to defects
    await page.getByRole("link", { name: /Defect Tracking/i }).click();

    // Create a new Bug
    await page.getByRole("button", { name: /Report Defect/i }).click();

    const bugId = `BUG-${Date.now()}`;
    await page.getByLabel("Bug ID *").fill(bugId);

    // Select Severity
    await page.locator('button:has-text("Medium")').first().click();
    await page.getByRole("option", { name: /Critical/i }).click();

    await page.getByLabel("Module *").fill("E2E Testing");
    await page
      .getByLabel("Description *")
      .fill("Regression identified by Playwright suite");
    await page.getByRole("button", { name: /Log Defect/i }).click();

    // Verify it appeared in table
    await expect(page.getByText(bugId)).toBeVisible();

    // Navigate back to Overview
    await page.getByRole("link", { name: /Overview/i }).click();

    // Assert "Live Metrics" updated
    const openDefectsCard = page
      .locator('div:has-text("Open Defects")')
      .filter({ has: page.locator("p") })
      .last();
    // We expect the count to be at least 1
    const defectCount = openDefectsCard.locator("p.text-2xl, p.text-3xl");
    await expect(defectCount).not.toHaveText("0");
  });
});
