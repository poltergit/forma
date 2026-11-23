import { expect, test } from "@playwright/test";

test("Playground exposes a real interactive generative field", async ({ page }) => {
  await page.goto("/playground");

  await expect(page.getByRole("heading", { name: /enter the unknown/i })).toBeVisible();
  await expect(page.locator('canvas, [class*="staticFallback"]').first()).toBeVisible();
  await expect(page.getByText("SEED / 027")).toBeVisible();
  const stage = page.getByRole("group", { name: /interactive displacement field/i });
  await stage.focus();
  await stage.press("ArrowRight");
  await expect(page.getByText("FIELD DISPLACED")).toBeVisible();

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

  const timeline = page.getByRole("slider", { name: /motion timeline position/i });
  await timeline.focus();
  await timeline.press("Home");
  const motionObject = page.locator('[data-motion="pulse"]').locator("div").first();
  const startTransform = await motionObject.evaluate((node) => getComputedStyle(node).transform);
  for (let step = 0; step < 25; step += 1) await timeline.press("ArrowRight");
  await expect(page.getByText("25%")).toBeVisible();
  await expect(page.getByText("PAUSED")).toBeVisible();
  await expect.poll(() => motionObject.evaluate((node) => getComputedStyle(node).transform)).not.toBe(startTransform);
  await expect(page.getByText(/forma\.motion-recipe/)).toBeVisible();

  await page.getByRole("button", { name: /impact \/ 02/i }).click();
  await expect(page.getByRole("button", { name: /pulse/i })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /reset parameters/i }).click();
  await expect(page.getByRole("button", { name: /orbit/i })).toHaveAttribute("aria-pressed", "true");
});

test("Phase 08 experiences remain usable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/motion-lab");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("STATIC / REDUCED MOTION")).toBeVisible();
  await expect(page.getByRole("slider", { name: /motion timeline position/i })).toBeHidden();
  const shift = page.getByRole("button", { name: /shift/i });
  await shift.click();
  await expect(shift).toHaveAttribute("aria-pressed", "true");
});

test("Home feature territories open the real Phase 08 routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /enter playground/i }).click();
  await expect(page).toHaveURL(/\/playground$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "MOTION LAB" }).click();
  await expect(page).toHaveURL(/\/motion-lab$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("Playground and Motion Lab fit the required responsive widths", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/playground", "/motion-lab"]) {
      await page.goto(route);
      await expect(page.getByRole("link", { name: "PLAYGROUND" })).toBeVisible();
      await expect(page.getByRole("link", { name: "MOTION LAB" })).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
    }
  }
});

test("Playground filters studies and opens the matching direct anchor", async ({ page }) => {
  await page.goto("/playground");

  await page.getByRole("button", { name: "TYPE", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Elastic matter", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Displacement field", exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: /open study/i }).click();
  await expect(page).toHaveURL(/\/playground#elastic-type$/);
  await expect(page.locator("#elastic-type").getByRole("heading", { level: 2 })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/playground$/);
});

test("Elastic Matter controls change the typographic study", async ({ page }) => {
  await page.goto("/playground#elastic-type");
  const tension = page.locator("#elastic-type input[type=range]").nth(0);
  await tension.focus();
  for (let step = 0; step < 14; step += 1) await tension.press("ArrowRight");
  await expect(page.locator("#elastic-type output").first()).toHaveText("90%");
  const invert = page.locator("#elastic-type button").first();
  await invert.click();
  await expect(invert).toHaveAttribute("aria-pressed", "true");
});

test("Home exposes a selectable orbit and live orbital controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('canvas, [class*="staticFallback"]').first()).toBeVisible();

  const formSpecimen = page.locator("button[aria-pressed]").filter({ hasText: "Form" }).first();
  await formSpecimen.click();
  await expect(formSpecimen).toHaveAttribute("aria-pressed", "true");

  const speed = page.getByRole("slider", { name: /orbit speed/i });
  await speed.focus();
  await speed.press("ArrowRight");
  await expect(page.getByText("1.05×")).toBeVisible();

  await page.getByRole("button", { name: /generate new form/i }).click();
  await expect(page.getByText("SEED / 04138")).toBeVisible();
});

test("Playground empty filter state offers a reset", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: "SPACE", exact: true }).click();
  await expect(page.getByText(/no studies in this material yet/i)).toBeVisible();
  const reset = page.getByRole("button", { name: /reset index/i });
  await expect(reset).toBeEnabled();
  await reset.click();
  await expect(page.getByRole("heading", { name: "Displacement field", exact: true })).toBeVisible();
});
