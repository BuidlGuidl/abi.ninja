/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to wake up the heimdall-rs backend.
     * @example cy.wakeUpHeimdall()
     */
    wakeUpHeimdall(): Chainable<void>;

    /**
     * Custom command to load a contract by address.
     * @example cy.loadContract('0x1234...')
     */
    loadContract(address: string, timeToWait: number): Chainable<void>;

    /**
     * Custom command to select a network from the dropdown.
     * @example cy.selectNetwork('Ethereum')
     */
    selectNetwork(networkName: string): Chainable<void>;

    /**
     * Custom command to interact with a specific contract method.
     * @example cy.interactWithMethod('balanceOf', '0x1234...')
     */
    interactWithMethod(methodName: string, inputValue: string): Chainable<void>;

    /**
     * Custom command to add a custom chain.
     * @example cy.addCustomChain({ id: '1', name: 'MyChain', ... })
     */
    addCustomChain(chainDetails: {
      id: string;
      name: string;
      nativeCurrencyName: string;
      nativeCurrencySymbol: string;
      nativeCurrencyDecimals: string;
      rpcUrl: string;
      blockExplorer: string;
    }): Chainable<void>;

    /**
     * Custom command to import a custom ABI.
     * @example cy.importABI('[ ... ]')
     */
    importABI(abi: string): Chainable<void>;
  }
}
