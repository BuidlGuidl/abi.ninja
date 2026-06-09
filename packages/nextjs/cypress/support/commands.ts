/// <reference types="cypress" />
import { ABI_NINJA_API_URL, HEIMDALL_API_URL } from "~~/utils/constants";

// Warm the resolution engine before a test. It auto-stops when idle (Fly), and a
// cold first request can exceed the "Load contract" button's enable window. Pinging
// /health wakes the machine so resolution returns promptly during the test.
Cypress.Commands.add("wakeUpEngine", () => {
  cy.request({
    method: "GET",
    url: `${ABI_NINJA_API_URL}/health`,
    failOnStatusCode: false,
    timeout: 30000,
  }).then(response => {
    cy.log(`Engine wake-up call completed with status: ${response.status}`);
  });
});

Cypress.Commands.add("wakeUpHeimdall", () => {
  const contractAddress = "0x759c0e9d7858566df8ab751026bedce462ff42df";
  const rpcUrl = "1rpc.io/sepolia";

  cy.request({
    method: "GET",
    url: `${HEIMDALL_API_URL}/${contractAddress}?rpc_url=${rpcUrl}`,
    failOnStatusCode: false,
    timeout: 30000,
  }).then(response => {
    cy.log(`Decompilation backend wake-up call completed with status: ${response.status}`);
  });
});

Cypress.Commands.add("loadContract", (address: string) => {
  cy.get('input[placeholder="Contract address"]').type(address);
  // Resolution is now a network hop to the engine, so the "Load contract" button
  // stays disabled until the ABI resolves. Wait for it to enable (up to 30s) rather
  // than clicking a disabled button.
  cy.contains("button", "Load contract", { timeout: 30000 }).should("not.be.disabled").click();
  cy.wait(2000);
});

Cypress.Commands.add("selectNetwork", (networkName: string) => {
  cy.get("#react-select-container")
    .click()
    .find("input")
    .first()
    .type(networkName, { force: true })
    .type("{enter}", { force: true });
});

Cypress.Commands.add("interactWithMethod", (methodName: string, inputValue: string) => {
  cy.contains(methodName).click();
  cy.get('input[placeholder="address"]').type(inputValue);
  cy.get("button").contains("Read 📡").click();
  cy.get("body").should("contain", "Result:");
});

Cypress.Commands.add(
  "addCustomChain",
  (chainDetails: {
    id: string;
    name: string;
    nativeCurrencyName: string;
    nativeCurrencySymbol: string;
    nativeCurrencyDecimals: string;
    rpcUrl: string;
    blockExplorer: string;
  }) => {
    cy.get("#add-custom-chain-modal").should("be.visible");
    cy.get('input[name="id"]').type(chainDetails.id);
    cy.get('input[name="name"]').type(chainDetails.name);
    cy.get('input[name="nativeCurrencyName"]').type(chainDetails.nativeCurrencyName);
    cy.get('input[name="nativeCurrencySymbol"]').type(chainDetails.nativeCurrencySymbol);
    cy.get('input[name="nativeCurrencyDecimals"]').type(chainDetails.nativeCurrencyDecimals);
    cy.get('input[name="rpcUrl"]').type(chainDetails.rpcUrl);
    cy.get('input[name="blockExplorer"]').type(chainDetails.blockExplorer);
    cy.get("button").contains("Add Chain").click();
  },
);

Cypress.Commands.add("importABI", (abi: string) => {
  cy.get('textarea[placeholder="Paste contract ABI in JSON format here"]').should("be.visible");
  cy.get('textarea[placeholder="Paste contract ABI in JSON format here"]')
    .invoke("val", abi)
    .first()
    .type(" ", { force: true });
  cy.get("button").contains("Import ABI").click({ force: true });
});

export {};
