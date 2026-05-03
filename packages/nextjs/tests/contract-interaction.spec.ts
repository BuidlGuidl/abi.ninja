import victionAbi from "./fixtures/viction-abi.json";
import {
  addCustomChain,
  importAbiFromHome,
  interactWithReadMethod,
  loadContract,
  selectNetwork,
  wakeUpHeimdall,
} from "./helpers";
import { expect, test } from "@playwright/test";

const HEIMDALL_API_URL = process.env.NEXT_PUBLIC_HEIMDALL_URL ?? "https://heimdall-api-v2.fly.dev";

test.describe("Contract Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads the DAI contract on Ethereum and reads balanceOf", async ({ page }) => {
    await loadContract(page, "0x6B175474E89094C44Da98b954EedeAC495271d0F");

    await expect(page).toHaveURL(/\/0x6B175474E89094C44Da98b954EedeAC495271d0F\/1/);
    // The contract page renders a loading spinner while the ABI is being fetched.
    await expect(page.locator(".loading-spinner")).toHaveCount(0, { timeout: 30_000 });

    await interactWithReadMethod(page, "balanceOf", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
  });

  test("loads a proxy contract on Base and reads through to the implementation", async ({ page }) => {
    await selectNetwork(page, "Base");
    await loadContract(page, "0xca808b3eada02d53073e129b25f74b31d8647ae0");

    await expect(page).toHaveURL(/\/0xca808b3eada02d53073e129b25f74b31d8647ae0\/8453/);
    await expect(page.getByText("Implementation Address")).toBeVisible({ timeout: 30_000 });

    await interactWithReadMethod(page, "balanceOf", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  });

  test("decompiles an unverified contract on Sepolia and adds a write method", async ({ page }) => {
    await wakeUpHeimdall(page, HEIMDALL_API_URL);
    await selectNetwork(page, "Sepolia");

    const addressInput = page.getByPlaceholder("Contract address");
    await addressInput.fill("0x759c0e9d7858566df8ab751026bedce462ff42df");

    // The "Decompile (beta)" CTA appears once the unverified-contract panel
    // slides in. It is initially disabled until heimdall finishes warming up.
    const decompileButton = page.getByRole("button", { name: /Decompile \(beta\)/ }).first();
    await expect(decompileButton).toBeVisible({ timeout: 30_000 });
    await expect(decompileButton).toBeEnabled({ timeout: 60_000 });
    await decompileButton.click();

    await expect(page).toHaveURL(/\/0x759c0e9d7858566df8ab751026bedce462ff42df\/11155111/, { timeout: 90_000 });
    await page.getByRole("button", { name: "changeOwner", exact: true }).first().click();
  });

  test("interacts with a contract on BNB Smart Chain via the Other chains modal", async ({ page }) => {
    await selectNetwork(page, "Other chains");

    const otherChainsModal = page.locator("#see-other-chains-modal");
    await expect(otherChainsModal).toBeVisible();

    await otherChainsModal.getByText("BNB Smart Chain", { exact: true }).first().click();
    await expect(otherChainsModal).toBeHidden();
    await expect(page.locator("#react-select-container")).toContainText("BNB Smart Chain");

    await loadContract(page, "0x2170ed0880ac9a755fd29b2688956bd959f933f8");

    await expect(page).toHaveURL(/\/0x2170ed0880ac9a755fd29b2688956bd959f933f8\/56/);
    await expect(page.locator(".loading-spinner")).toHaveCount(0, { timeout: 30_000 });

    await interactWithReadMethod(page, "balanceOf", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  });

  test("adds Viction as a custom chain and interacts via a manually imported ABI", async ({ page }) => {
    await selectNetwork(page, "Add custom chain");

    await addCustomChain(page, {
      id: "88",
      name: "Viction",
      nativeCurrencyName: "VIC",
      nativeCurrencySymbol: "VIC",
      nativeCurrencyDecimals: "18",
      rpcUrl: "https://rpc.viction.xyz",
      blockExplorer: "https://tomoscan.io/",
    });

    await expect(page.locator("#react-select-container")).toContainText("Viction");

    await page.getByPlaceholder("Contract address").fill("0x381B31409e4D220919B2cFF012ED94d70135A59e");

    // The address is unverified on Viction so the unverified-contract panel
    // slides in with the manual-import textarea.
    await importAbiFromHome(page, JSON.stringify(victionAbi));

    await expect(page).toHaveURL(/\/0x381B31409e4D220919B2cFF012ED94d70135A59e\/88/);
    await expect(page.locator(".loading-spinner")).toHaveCount(0, { timeout: 30_000 });

    await interactWithReadMethod(page, "balanceOf", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  });
});
