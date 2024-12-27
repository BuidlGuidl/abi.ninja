// @ts-check
import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ABI Ninja/);
});

test("can load one of the quick access contracts", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await page.getByRole("link", { name: "DAI" }).click();

  await expect(page.getByRole("link", { name: "0x6B1...1d0F" })).toBeVisible();
});
