import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  const EXECUTIVE_EMAIL = "aeben.adebanjo@gmail.com";

  // Mock Supabase Auth to bypass real backend calls
  await page.route("**/auth/v1/user*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "mock-user-id",
        email: EXECUTIVE_EMAIL,
        app_metadata: { provider: "email" },
        user_metadata: { is_executive: true },
        aud: "authenticated",
        role: "authenticated",
      }),
    });
  });

  await page.route("**/auth/v1/token*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "mock-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh",
        user: {
          id: "mock-user-id",
          email: EXECUTIVE_EMAIL,
        },
      }),
    });
  });

  // Navigate to login
  await page.goto("/login");

  // Fill in the login form
  await page.getByLabel(/Email/i).fill(EXECUTIVE_EMAIL);

  // Check if password field exists
  const passwordField = page.locator('input[type="password"], #password');
  if ((await passwordField.count()) > 0) {
    await passwordField.fill("mock-password");
  }

  await page.getByRole("button", { name: /Sign In/i }).click();

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(
    page.getByRole("heading", { name: /Project Hub/i }),
  ).toBeVisible();

  // End of setup: Save storage state
  await page.context().storageState({ path: authFile });
});
