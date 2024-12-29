// @ts-check
import { VICTION_ABI } from "./viction_contract_abi";
import { expect, test } from "@playwright/test";

test.describe("ABI Ninja", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test.describe("Quick Access Contracts", () => {
    test("should load DAI contract and read balanceOf successfully", async ({ page }) => {
      await page.getByRole("link", { name: "DAI" }).click();
      await page.getByRole("button", { name: "balanceOf" }).click();

      // Copy the full address using the copy button
      await page
        .locator("div")
        .filter({ hasText: /^0x6B1\.\.\.1d0F$/ })
        .locator("svg")
        .click();

      await page.getByPlaceholder("address").fill("0x6B175474E89094C44Da98b954EedeAC495271d0F");
      await page.getByRole("button", { name: "Read 📡" }).click();
      await expect(page.locator("pre")).not.toHaveText("0");
    });
  });

  test.describe("Cross-chain Contract Interactions", () => {
    test("should interact with proxy contract on Base chain", async ({ page }) => {
      // Switch to Base network
      await page
        .locator("div")
        .filter({ hasText: /^Ethereum$/ })
        .nth(1)
        .click();
      await page.getByRole("option", { name: "Base", exact: true }).click();

      // Load and interact with contract
      await page.getByPlaceholder("Contract address").fill("0xca808b3eada02d53073e129b25f74b31d8647ae0");
      await page.getByRole("button", { name: "Load contract" }).click();
      await page.getByRole("button", { name: "balanceOf", exact: true }).click();
      await page.getByPlaceholder("address").fill("0xca808b3eada02d53073e129b25f74b31d8647ae0");
      await page.getByRole("button", { name: "Read 📡" }).click();
      await expect(page.locator("pre")).toContainText("0");
    });

    test("should load an unverified contract on Sepolia and decompile successfully using heimdall backend", async ({
      page,
    }) => {
      // Switch to Sepolia network
      await page
        .locator("div")
        .filter({ hasText: /^Ethereum$/ })
        .nth(1)
        .click();
      await page.getByRole("option", { name: "Sepolia", exact: true }).click();
      await page.getByPlaceholder("Contract address").fill("0x759c0e9d7858566df8ab751026bedce462ff42df");

      // Handle decompilation process
      const decompileButton = page.getByRole("button", { name: "Decompile (beta)" }).last();
      await decompileButton.waitFor({ timeout: 30000 }); // 30 second timeout
      await page.getByText("Decompiling contract...").last().waitFor();
      await page.getByText("Decompiling contract...").last().waitFor({ state: "hidden" });

      await decompileButton.click();
      await expect(page.getByRole("button", { name: "changeOwner" })).toBeVisible();
    });

    test("should interact with a verified contract on BNB Smart Chain", async ({ page }) => {
      // Switch to BNB Smart Chain
      await page
        .locator("div")
        .filter({ hasText: /^Ethereum$/ })
        .nth(1)
        .click();
      await page.getByText("Other chains").click();
      await page.getByText("Chain Id: 56BNB Smart Chain").click();

      // Load and interact with contract
      await page.getByPlaceholder("Contract address").fill("0x2170ed0880ac9a755fd29b2688956bd959f933f8");
      await page.getByRole("button", { name: "Load contract" }).click();
      await page.getByRole("button", { name: "balanceOf" }).click();
      await page.getByPlaceholder("address").fill("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
      await page.getByRole("button", { name: "Read 📡" }).click();
      await expect(page.locator("pre")).not.toHaveText("0");
    });

    test("should add custom Viction chain and interact with contract using manual ABI", async ({ page }) => {
      // Add Viction as custom chain
      await page
        .locator("div")
        .filter({ hasText: /^Ethereum$/ })
        .nth(2)
        .click();
      await page.getByRole("option", { name: "Add custom chain" }).click();

      // Fill chain details
      await page.locator('input[name="id"]').fill("88");
      await page.locator('input[name="name"]').fill("Viction");
      await page.locator('input[name="nativeCurrencyName"]').fill("VIC");
      await page.locator('input[name="nativeCurrencySymbol"]').fill("VIC");
      await page.locator('input[name="nativeCurrencyDecimals"]').fill("18");
      await page.locator('input[name="rpcUrl"]').fill("https://rpc.viction.xyz");
      await page.locator('input[name="blockExplorer"]').fill("https://tomoscan.io/");
      await page.getByRole("button", { name: "Add Chain" }).click();

      // Load contract and verify address display
      await page.getByPlaceholder("Contract address").fill("0x381B31409e4D220919B2cFF012ED94d70135A59e");
      await expect(page.getByText("0x381B31409e4D220919B2cFF012ED94d70135A59e").nth(2)).toBeVisible();

      // Import ABI and interact with contract
      await page.getByPlaceholder("Paste contract ABI in JSON").nth(2).fill(JSON.stringify(VICTION_ABI));
      await page.getByRole("button", { name: "Import ABI" }).nth(2).click();
      await page.getByRole("button", { name: "balanceOf" }).click();
      await page.getByPlaceholder("address").fill("0x6B175474E89094C44Da98b954EedeAC495271d0F");
      await page.getByRole("button", { name: "Read 📡" }).click();
      await expect(page.locator("pre")).toHaveText("0");
    });
  });
});
