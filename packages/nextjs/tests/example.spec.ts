// @ts-check
import { expect, test } from "@playwright/test";

const VICTION_ABI = [
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "owners",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "value", type: "uint256" }],
    name: "estimateFee",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "owner", type: "address" }],
    name: "removeOwner",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "issuer",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "transactionId", type: "uint256" }],
    name: "revokeConfirmation",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "minFee",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "burnId", type: "uint256" }],
    name: "getBurn",
    outputs: [
      { name: "_burner", type: "address" },
      { name: "_value", type: "uint256" },
      { name: "_data", type: "bytes" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "isOwner",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "value", type: "uint256" }],
    name: "setMinFee",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    name: "confirmations",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "depositFee", type: "uint256" }],
    name: "setDepositFee",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "pending", type: "bool" },
      { name: "executed", type: "bool" },
    ],
    name: "getTransactionCount",
    outputs: [{ name: "count", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "owner", type: "address" }],
    name: "addOwner",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "burnList",
    outputs: [
      { name: "value", type: "uint256" },
      { name: "burner", type: "address" },
      { name: "data", type: "bytes" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "transactionId", type: "uint256" }],
    name: "isConfirmed",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "transactionId", type: "uint256" }],
    name: "getConfirmationCount",
    outputs: [{ name: "count", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "transactions",
    outputs: [
      { name: "destination", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "executed", type: "bool" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "WITHDRAW_FEE",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getOwners",
    outputs: [{ name: "", type: "address[]" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "from", type: "uint256" },
      { name: "to", type: "uint256" },
      { name: "pending", type: "bool" },
      { name: "executed", type: "bool" },
    ],
    name: "getTransactionIds",
    outputs: [{ name: "_transactionIds", type: "uint256[]" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "transactionId", type: "uint256" }],
    name: "getConfirmations",
    outputs: [{ name: "_confirmations", type: "address[]" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "withdrawFee", type: "uint256" }],
    name: "setWithdrawFee",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "transactionCount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_required", type: "uint256" }],
    name: "changeRequirement",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "transactionId", type: "uint256" }],
    name: "confirmTransaction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferContractIssuer",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "destination", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    name: "submitTransaction",
    outputs: [{ name: "transactionId", type: "uint256" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "MAX_OWNER_COUNT",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "required",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "DEPOSIT_FEE",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "owner", type: "address" },
      { name: "newOwner", type: "address" },
    ],
    name: "replaceOwner",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getBurnCount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "transactionId", type: "uint256" }],
    name: "executeTransaction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    name: "burn",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_owners", type: "address[]" },
      { name: "_required", type: "uint256" },
      { name: "_name", type: "string" },
      { name: "_symbol", type: "string" },
      { name: "_decimals", type: "uint8" },
      { name: "cap", type: "uint256" },
      { name: "minFee", type: "uint256" },
      { name: "depositFee", type: "uint256" },
      { name: "withdrawFee", type: "uint256" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: true, name: "transactionId", type: "uint256" },
    ],
    name: "Confirmation",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: true, name: "transactionId", type: "uint256" },
    ],
    name: "Revocation",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "transactionId", type: "uint256" }],
    name: "Submission",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "transactionId", type: "uint256" }],
    name: "Execution",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "transactionId", type: "uint256" }],
    name: "ExecutionFailure",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "owner", type: "address" }],
    name: "OwnerAddition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "owner", type: "address" }],
    name: "OwnerRemoval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "required", type: "uint256" }],
    name: "RequirementChange",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "burnID", type: "uint256" },
      { indexed: true, name: "burner", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
      { indexed: false, name: "data", type: "bytes" },
    ],
    name: "TokenBurn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "issuer", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Fee",
    type: "event",
  },
];

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

test("should load DAI contract and interact with its balanceOf method", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "DAI" }).click();
  await page.getByRole("button", { name: "balanceOf" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^0x6B1\.\.\.1d0F$/ })
    .locator("svg")
    .click();
  await page.getByPlaceholder("address").fill("0x6B175474E89094C44Da98b954EedeAC495271d0F");
  await page.getByRole("button", { name: "Read 📡" }).click();
  await expect(page.locator("pre")).not.toHaveText("0");
});

test("should load proxy contract on Base and interact with its balanceOf method", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page
    .locator("div")
    .filter({ hasText: /^Ethereum$/ })
    .nth(1)
    .click();
  await page.getByRole("option", { name: "Base", exact: true }).click();
  await page.getByPlaceholder("Contract address").click();
  await page.getByPlaceholder("Contract address").fill("0xca808b3eada02d53073e129b25f74b31d8647ae0");
  await page.getByRole("button", { name: "Load contract" }).click();
  await page.getByRole("button", { name: "balanceOf", exact: true }).click();
  await page.getByPlaceholder("address").fill("0xca808b3eada02d53073e129b25f74b31d8647ae0");
  await page.getByRole("button", { name: "Read 📡" }).click();
  await expect(page.locator("pre")).toContainText("0");
});

test("should load unverified contract on Sepolia and ADD changeOwner write method to the UI", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page
    .locator("div")
    .filter({ hasText: /^Ethereum$/ })
    .nth(1)
    .click();
  await page.getByRole("option", { name: "Sepolia", exact: true }).click();
  await page.getByPlaceholder("Contract address").fill("0x759c0e9d7858566df8ab751026bedce462ff42df");

  // Wait for the loading state to appear and then disappear
  const decompileButton = page.getByRole("button", { name: "Decompile (beta)" }).last();
  await decompileButton.waitFor();
  await page.getByText("Decompiling contract...").last().waitFor();
  await page.getByText("Decompiling contract...").last().waitFor({ state: "hidden" });

  await decompileButton.click();
  await expect(page.getByRole("button", { name: "changeOwner" })).toBeVisible();
});

test("should load a contract on BNB Smart Chain and interact with its balanceOf method", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page
    .locator("div")
    .filter({ hasText: /^Ethereum$/ })
    .nth(1)
    .click();
  await page.getByText("Other chains").click();
  await page.getByText("Chain Id: 56BNB Smart Chain").click();
  await page.getByPlaceholder("Contract address").fill("0x2170ed0880ac9a755fd29b2688956bd959f933f8");
  await page.getByRole("button", { name: "Load contract" }).click();
  await page.getByRole("button", { name: "balanceOf" }).click();
  await page.getByPlaceholder("address").fill("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  await page.getByRole("button", { name: "Read 📡" }).click();
  await expect(page.locator("pre")).not.toHaveText("0");
});

test("should add Viction as a custom chain and interact with a contract by submitting an ABI manually", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");
  await page
    .locator("div")
    .filter({ hasText: /^Ethereum$/ })
    .nth(2)
    .click();
  await page.getByRole("option", { name: "Add custom chain" }).click();
  await page.locator('input[name="id"]').fill("88");
  await page.locator('input[name="name"]').fill("Viction");
  await page.locator('input[name="nativeCurrencyName"]').fill("VIC");
  await page.locator('input[name="nativeCurrencySymbol"]').fill("VIC");
  await page.locator('input[name="nativeCurrencyDecimals"]').fill("18");
  await page.locator('input[name="rpcUrl"]').click();
  await page.locator('input[name="rpcUrl"]').fill("https://rpc.viction.xyz");
  await page.locator('input[name="blockExplorer"]').fill("https://tomoscan.io/");
  await page.getByRole("button", { name: "Add Chain" }).click();
  await page.getByPlaceholder("Contract address").fill("0x381B31409e4D220919B2cFF012ED94d70135A59e");
  await expect(page.getByText("0x381B31409e4D220919B2cFF012ED94d70135A59e").nth(2)).toBeVisible();
  await page.getByPlaceholder("Paste contract ABI in JSON").nth(2).fill(JSON.stringify(VICTION_ABI));
  await page.getByRole("button", { name: "Import ABI" }).nth(2).click();
  await page.getByRole("button", { name: "balanceOf" }).click();
  await page.getByPlaceholder("address").fill("0x6B175474E89094C44Da98b954EedeAC495271d0F");
  await page.getByRole("button", { name: "Read 📡" }).click();
  await expect(page.locator("pre")).toHaveText("0");
});
