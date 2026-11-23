import { expect, test } from "@playwright/test";

test("home page exposes the orbital identity and skip navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("MAKE FORM");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("MOVE.");
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
    "href",
    "#main-content",
  );
  await expect(page.locator('canvas, [class*="staticFallback"]').first()).toBeVisible();
});

test("orbital specimens can be selected and recomposed", async ({ page }) => {
  await page.goto("/");
  const typeSpecimen = page.locator("button[aria-pressed]").filter({ hasText: "Type" }).first();
  await typeSpecimen.click();
  await expect(typeSpecimen).toHaveAttribute("aria-pressed", "true");

  await expect(page.getByTestId("orbital-seed")).toHaveText(/SEED \/ 04137/);
  await page.getByRole("button", { name: /recompose/i }).click();
  await expect(page.getByTestId("orbital-seed")).toHaveText(/SEED \/ 04138/);
});

test("reduced-motion keeps the orbital story readable and interactive", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /five forces/i })).toBeVisible();
  const energy = page.getByRole("slider", { name: /energy/i });
  await energy.focus();
  await energy.press("ArrowRight");
  await expect(page.getByText("1.05×")).toBeVisible();
});

test("orbital Home remains within the required responsive widths", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  }
});
