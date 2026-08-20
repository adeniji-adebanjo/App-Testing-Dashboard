import { test, expect } from "@playwright/test";

test.describe("Project Creation Flow", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    const EXECUTIVE_EMAIL = "aeben.adebanjo@gmail.com";

    // Mock Supabase Auth
    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "mock-user-id",
          email: EXECUTIVE_EMAIL,
          user_metadata: { is_executive: true },
        }),
      });
    });

    // Mock Supabase REST API
    await page.route("**/rest/v1/**", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      } else if (method === "POST") {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            ...body,
            id: "next-project-id-" + Date.now(),
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("should complete the 4-step wizard and redirect to project workspace", async ({
    page,
  }) => {
    const projectName = `AutoTest_${Date.now()}`;
    const shortCode = `AT${Math.floor(Math.random() * 100)}`;

    await page.goto("/new-project");

    // Step 1: Basics
    await page
      .getByPlaceholder("e.g. Rosabon Wealth Management App")
      .fill(projectName);
    await page.getByPlaceholder("e.g. WMA").fill(shortCode);
    await page.getByRole("button", { name: /Web App/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();

    // Step 2: Tech Stack
    await page
      .getByPlaceholder("Type technology and press Enter...")
      .fill("Playwright");
    await page.keyboard.press("Enter");
    await page
      .getByPlaceholder("Type technology and press Enter...")
      .fill("Next.js");
    await page.getByRole("button", { name: /Add/i }).click();
    await expect(page.getByText("Playwright ×")).toBeVisible();
    await page.getByRole("button", { name: /Continue/i }).click();

    // Step 3: Target Users
    await page.getByRole("button", { name: /\+ Admin/i }).click();
    await page.getByRole("button", { name: /\+ Developer/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();

    // Step 4: Customize (Color Selection)
    // Select the "Teal" color
    await page
      .locator('button[style*="background-color: rgb(20, 184, 166)"]')
      .click();

    // Final Create
    await page.getByRole("button", { name: /Create Project/i }).click();

    // Validation: Redirect & URL
    await expect(page).toHaveURL(new RegExp(`/projects/.*`));
    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();
  });
});
