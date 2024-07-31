describe("Contract Interaction", () => {
  before(() => {
    cy.wakeUpHeimdall();
  });

  it("should load DAI contract and interact with its balanceOf method", () => {
    cy.visit("http://localhost:3000");
    cy.loadContract("0x6B175474E89094C44Da98b954EedeAC495271d0F");
    cy.url().should("include", "/0x6B175474E89094C44Da98b954EedeAC495271d0F/1");
    cy.interactWithMethod("balanceOf", "0x6B175474E89094C44Da98b954EedeAC495271d0F");
  });

  it("should load proxy contract on Base and interact with its balanceOf method", () => {
    cy.visit("http://localhost:3000");
    cy.selectNetwork("Base");
    cy.loadContract("0xca808b3eada02d53073e129b25f74b31d8647ae0");
    cy.url().should("include", "/0xca808b3eada02d53073e129b25f74b31d8647ae0/8453");
    cy.contains("Implementation Address").should("be.visible");
    cy.wait(1000); // wait for: the method card to re-render
    cy.interactWithMethod("balanceOf", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  });

  it("should load unverified contract on Sepolia and ADD changeOwner write method to the UI", () => {
    cy.visit("http://localhost:3000");
    cy.selectNetwork("Sepolia");
    cy.get('input[placeholder="Contract address"]').type("0x759c0e9d7858566df8ab751026bedce462ff42df");
    cy.get("button:visible").contains("Decompile (beta)", { timeout: 10000 }).click({ force: true });
    cy.wait(2000);
    cy.url().should("include", "/0x759c0e9d7858566df8ab751026bedce462ff42df/11155111");
    cy.contains("changeOwner").click();
  });

  it("should load a contract on BNB Smart Chain and interact with its balanceOf method", () => {
    cy.visit("http://localhost:3000");
    cy.selectNetwork("Other chains");
    cy.get("#see-other-chains-modal").should("be.visible");
    cy.contains("BNB Smart Chain").click();
    cy.get(".modal-content").should("not.exist");
    cy.get("#react-select-container").should("contain", "BNB Smart Chain");
    cy.loadContract("0x2170ed0880ac9a755fd29b2688956bd959f933f8");
    cy.url().should("include", "/0x2170ed0880ac9a755fd29b2688956bd959f933f8/56");
    cy.get(".loading-spinner", { timeout: 10000 }).should("not.exist");
    cy.interactWithMethod("balanceOf", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  });

  it("should add Parex as a custom chain and interact with a contract by submitting an ABI manually", () => {
    cy.visit("http://localhost:3000");
    cy.addCustomChain({
      id: "322202",
      name: "Parex",
      nativeCurrencyName: "PAREX",
      nativeCurrencySymbol: "PAREX",
      nativeCurrencyDecimals: "18",
      rpcUrl: "https://mainnet-rpc.parex.network",
      blockExplorer: "https://scan.parex.network/",
    });
    cy.get("#react-select-container").should("contain", "Parex");
    cy.get('input[placeholder="Contract address"]').type("0x6058518142C6AD506530F5A62dCc58050bf6fC28");
    cy.fixture("parex_abi").then(parexContractABI => {
      cy.importABI(JSON.stringify(parexContractABI));
    });
    cy.url().should("include", "/0x6058518142C6AD506530F5A62dCc58050bf6fC28/322202");
    cy.get(".loading-spinner", { timeout: 10000 }).should("not.exist");
    cy.interactWithMethod("getUserBalance", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  });
});
