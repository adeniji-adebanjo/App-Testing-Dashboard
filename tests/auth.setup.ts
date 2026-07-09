import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to login
  await page.goto("/login");

  // We use the "Quick Demo Access" to bypass real Supabase Auth for this E2E suite
  const demoButton = page.getByRole("button", { name: /Quick Demo Access/i });

  if (await demoButton.isVisible()) {
    await demoButton.click();
  } else {
    // Fallback if demo button isn't immediately visible (e.g. wait for it)
    await page.waitForSelector('button:has-text("Quick Demo Access")');
    await page.click('button:has-text("Quick Demo Access")');
  }

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(
    page.getByRole("heading", { name: /Project Hub/i }),
  ).toBeVisible();

  // End of setup: Save storage state
  await page.context().storageState({ path: authFile });
});
