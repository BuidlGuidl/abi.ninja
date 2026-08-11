// Regression test for https://github.com/BuidlGuidl/abi.ninja/discussions/201:
// opening an unverified contract by direct URL should auto-fall-back to the
// decompiled ABI instead of stranding the user on the error screen.
// Etherscan and Heimdall are stubbed so the test is deterministic and does not
// inherit the decompile backend's cold-start flakiness.
import { HEIMDALL_API_URL } from "~~/utils/constants";

const UNVERIFIED_ADDRESS = "0x2b3a50c13db0813af58e574c49c75a5249cfdfde";

describe("Unverified contract via direct URL", () => {
  it("auto-falls back to the decompiled ABI instead of showing the error screen", () => {
    cy.intercept("GET", "https://api.etherscan.io/v2/api**", {
      statusCode: 200,
      body: { status: "0", message: "NOTOK", result: "Contract source code not verified" },
    }).as("etherscan");

    // Match by hostname: the rpc_url query param contains slashes, which URL globs don't cross.
    cy.intercept(
      { method: "GET", hostname: new URL(HEIMDALL_API_URL).hostname },
      {
        statusCode: 200,
        body: [{ type: "function", name: "Unresolved_00000000", inputs: [], outputs: [], stateMutability: "payable" }],
      },
    ).as("heimdall");

    cy.visit(`http://localhost:3000/${UNVERIFIED_ADDRESS}/1`);
    cy.wait("@heimdall");

    cy.contains("Unresolved_00000000", { timeout: 20000 }).should("be.visible");
    cy.contains("There was an error loading the contract").should("not.exist");
  });
});
