import { expect, test } from "@playwright/test";

test("home introduces FORMA as a digital atelier", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FORM IS");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A VERB.");
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main-content");
  await expect(page.getByRole("link", { name: /enter the atelier/i })).toHaveAttribute("href", "/playground");
  await expect(page.locator("canvas").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /good ideas/i })).toBeVisible();
});

test("live study controls recompose the generative sculpture", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("SEED / 04137")).toBeVisible();
  await page.getByRole("button", { name: /recompose/i }).click();
  await expect(page.getByText("SEED / 04138")).toBeVisible();
  const energy = page.getByRole("slider", { name: "Energy" });
  await energy.focus();
  await energy.press("ArrowRight");
  await expect(page.getByText("1.05×")).toBeVisible();
});

test("reduced motion keeps the atelier readable and interactive", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /three ways/i })).toBeVisible();
  await page.getByRole("button", { name: /recompose/i }).click();
  await expect(page.getByText("SEED / 04138")).toBeVisible();
});

test("atelier remains within required responsive widths", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  }
});
