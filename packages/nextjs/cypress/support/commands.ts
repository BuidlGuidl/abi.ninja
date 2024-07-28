/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add("wakeUpHeimdall", () => {
  const contractAddress = "0x759c0e9d7858566df8ab751026bedce462ff42df";
  const rpcUrl = "1rpc.io/sepolia";

  cy.request({
    method: "GET",
    url: `${Cypress.env("heimdall_url")}/${contractAddress}?rpc_url=${rpcUrl}`,
    failOnStatusCode: false,
    timeout: 30000,
  }).then(response => {
    cy.log(`Decompilation backend wake-up call completed with status: ${response.status}`);
  });
});

Cypress.Commands.add("loadContract", (address: string) => {
  cy.get('input[placeholder="Contract address"]').type(address);
  cy.wait(2000);
  cy.get("button").contains("Load contract").click({ force: true });
});

Cypress.Commands.add("selectNetwork", (networkName: string) => {
  cy.get("#react-select-container").click();
  cy.get('[role="option"]').contains(networkName).click();
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
    cy.get("#react-select-container").click();
    cy.get('[role="option"]').contains("Add custom chain").click();
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
