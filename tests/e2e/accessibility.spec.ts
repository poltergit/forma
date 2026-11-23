import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("foundation home has no WCAG 2.2 A/AA automated violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("home layout does not introduce horizontal page overflow", async ({ page }) => {
  await page.goto("/");

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));

    expect(
      dimensions.documentWidth,
      `Unexpected horizontal overflow at viewport width ${width}px`,
    ).toBeLessThanOrEqual(dimensions.viewportWidth);
  }
});
