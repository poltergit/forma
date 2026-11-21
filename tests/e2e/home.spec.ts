import { expect, test } from "@playwright/test";

test("home page exposes the primary heading and skip navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
    "href",
    "#main-content",
  );
});

test("hero form can be recomposed with an accessible control", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("ORIGIN")).toBeVisible();
  await page.getByRole("button", { name: /recompose/i }).click();
  await expect(page.getByText("DISPLACE")).toBeVisible();
});

test("reduced-motion keeps the experience readable and interactive", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /different tools/i })).toBeVisible();
  await page.getByRole("button", { name: /recompose/i }).click();
  await expect(page.getByText("DISPLACE")).toBeVisible();
});
