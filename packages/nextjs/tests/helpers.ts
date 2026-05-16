import { type Page, expect } from "@playwright/test";

/**
 * Click a network from the react-select dropdown by typing its label.
 * Mirrors the helper that existed in the Cypress suite.
 */
export async function selectNetwork(page: Page, networkName: string) {
  const dropdown = page.locator("#react-select-container");
  await dropdown.click();
  // react-select renders its search input inside the container once opened.
  const input = dropdown.locator("input").first();
  await input.fill(networkName);
  await input.press("Enter");
}

/**
 * Type a contract address into the Contract address input and press
 * the "Load contract" button on the homepage.
 */
export async function loadContract(page: Page, address: string) {
  await page.getByPlaceholder("Contract address").fill(address);
  const loadButton = page.getByRole("button", { name: /^Load contract$/ });
  await expect(loadButton).toBeEnabled({ timeout: 30_000 });
  await loadButton.click();
}

/**
 * Open a read-only contract method, fill in the first address argument,
 * and press the "Read" button. Asserts that a "Result:" block appears.
 */
export async function interactWithReadMethod(page: Page, methodName: string, addressArg: string) {
  // The sidebar lists methods as ghost buttons; pick the visible one
  // matching the method name exactly.
  const methodButton = page.getByRole("button", { name: methodName, exact: true }).first();
  await methodButton.click();
  await page.getByPlaceholder("address").first().fill(addressArg);
  await page.getByRole("button", { name: /Read/ }).first().click();
  await expect(page.getByText("Result:")).toBeVisible();
}

/**
 * Submit the Add custom chain modal with the provided chain details.
 */
export async function addCustomChain(
  page: Page,
  chain: {
    id: string;
    name: string;
    nativeCurrencyName: string;
    nativeCurrencySymbol: string;
    nativeCurrencyDecimals: string;
    rpcUrl: string;
    blockExplorer?: string;
  },
) {
  const modal = page.locator("#add-custom-chain-modal");
  await expect(modal).toBeVisible();

  await modal.locator('input[name="id"]').fill(chain.id);
  await modal.locator('input[name="name"]').fill(chain.name);
  await modal.locator('input[name="nativeCurrencyName"]').fill(chain.nativeCurrencyName);
  await modal.locator('input[name="nativeCurrencySymbol"]').fill(chain.nativeCurrencySymbol);
  await modal.locator('input[name="nativeCurrencyDecimals"]').fill(chain.nativeCurrencyDecimals);
  await modal.locator('input[name="rpcUrl"]').fill(chain.rpcUrl);
  if (chain.blockExplorer) {
    await modal.locator('input[name="blockExplorer"]').fill(chain.blockExplorer);
  }

  await modal.getByRole("button", { name: "Add Chain" }).click();
  await expect(modal).toBeHidden();
}

/**
 * Paste an ABI string into the homepage textarea and click "Import ABI".
 */
export async function importAbiFromHome(page: Page, abi: string) {
  const textarea = page.getByPlaceholder("Paste contract ABI in JSON format here");
  await expect(textarea).toBeVisible();
  await textarea.fill(abi);
  await page.getByRole("button", { name: "Import ABI" }).click();
}

/**
 * Heimdall (the on-the-fly decompiler service) is hosted on fly.io and may
 * cold-start. We hit the endpoint up-front so the first decompilation request
 * issued from the UI does not time out.
 */
export async function wakeUpHeimdall(page: Page, heimdallApiUrl: string) {
  const contractAddress = "0x759c0e9d7858566df8ab751026bedce462ff42df";
  const rpcUrl = "1rpc.io/sepolia";

  try {
    const response = await page.request.get(`${heimdallApiUrl}/${contractAddress}?rpc_url=${rpcUrl}`, {
      timeout: 60_000,
      failOnStatusCode: false,
    });
    console.log(`Heimdall wake-up call status: ${response.status()}`);
  } catch (error) {
    console.warn("Heimdall wake-up call failed (continuing anyway):", error);
  }
}
