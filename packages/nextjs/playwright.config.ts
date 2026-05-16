import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for ABI Ninja end-to-end tests.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  // Tests share global state (network selection, custom chains in localStorage,
  // RPC rate limits) so we run them serially.
  fullyParallel: false,
  workers: 1,

  // Fail the build on CI if test.only is left in the source.
  forbidOnly: !!process.env.CI,
  // Retry flaky tests caused by external RPC / Etherscan / Heimdall services.
  retries: process.env.CI ? 2 : 0,

  // 60s per test – external RPCs and the Heimdall decompiler can be slow.
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },

  reporter: process.env.CI ? [["html"], ["github"]] : [["html"], ["list"]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
