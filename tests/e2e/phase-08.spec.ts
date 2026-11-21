import { expect, test } from "@playwright/test";

test("Playground exposes a real interactive generative field", async ({ page }) => {
  await page.goto("/playground");

  await expect(page.getByRole("heading", { name: /enter the unknown/i })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByText("SEED / 027")).toBeVisible();\n  const stage = page.getByRole("group", { name: /interactive displacement field/i });\n  await stage.focus();\n  await stage.press("ArrowRight");\n  await expect(page.getByText("FIELD DISPLACED")).toBeVisible();

  await page.getByRole("button", { name: /recompose/i }).click();
  await expect(page.getByText("SEED / 028")).toBeVisible();
  await expect(page.getByText("NEW COMPOSITION")).toBeVisible();

  const density = page.getByRole("slider").nth(0);
  await density.focus();
  await density.press("ArrowRight");
  await expect(page.getByText("68", { exact: true })).toBeVisible();
});

test("Motion Lab parameters change the motion study and can be paused", async ({ page }) => {
  await page.goto("/motion-lab");

  await expect(page.getByRole("heading", { name: /give it feeling/i })).toBeVisible();
  const pulse = page.getByRole("button", { name: /pulse/i });
  await pulse.click();
  await expect(pulse).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /pause/i }).click();
  await expect(page.getByText("PAUSED")).toBeVisible();

  await page.getByRole("button", { name: /reset parameters/i }).click();
  await expect(page.getByRole("button", { name: /orbit/i })).toHaveAttribute("aria-pressed", "true");
});

test("Phase 08 experiences remain usable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/motion-lab");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const shift = page.getByRole("button", { name: /shift/i });
  await shift.click();
  await expect(shift).toHaveAttribute("aria-pressed", "true");
});

test("Home feature territories open the real Phase 08 routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /enter experiment/i }).first().click();
  await expect(page).toHaveURL(/\/playground$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "MOTION LAB" }).click();
  await expect(page).toHaveURL(/\/motion-lab$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
