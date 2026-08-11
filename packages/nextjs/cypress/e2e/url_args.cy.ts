// WXDAI on Gnosis: reads go through the chain's public RPC, so no Alchemy key needed
const WXDAI_ADDRESS = "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d";
const ACCOUNT_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

describe("URL arguments", () => {
  it("seeds a read method and runs it", () => {
    cy.visit(`http://localhost:3000/${WXDAI_ADDRESS}/100?methods=balanceOf&args.balanceOf.0=${ACCOUNT_ADDRESS}`);

    cy.get('input[name^="balanceOf_"]', { timeout: 20000 }).should("have.value", ACCOUNT_ADDRESS);
    cy.contains("Result:", { timeout: 30000 }).should("be.visible");
  });

  it("seeds a write method implied by args params", () => {
    cy.visit(`http://localhost:3000/${WXDAI_ADDRESS}/100?args.transfer.0=${ACCOUNT_ADDRESS}&args.transfer.1=123`);

    cy.get('input[name^="transfer_"]', { timeout: 20000 }).eq(0).should("have.value", ACCOUNT_ADDRESS);
    cy.get('input[name^="transfer_"]').eq(1).should("have.value", "123");
  });

  it("copies the current form values in a share link", () => {
    cy.visit(`http://localhost:3000/${WXDAI_ADDRESS}/100?methods=transfer`, {
      onBeforeLoad(win) {
        if (!win.navigator.clipboard) {
          Object.defineProperty(win.navigator, "clipboard", {
            configurable: true,
            value: { writeText: () => Promise.resolve() },
          });
        }
        cy.stub(win.navigator.clipboard, "writeText").as("clipboardWrite").resolves();
      },
    });

    cy.get('input[name^="transfer_"]', { timeout: 20000 }).eq(0).type(ACCOUNT_ADDRESS);
    cy.get('input[name^="transfer_"]').eq(1).type("456");
    cy.get('button[aria-label="Copy link with values"]').click();

    cy.get("@clipboardWrite")
      .should("have.been.calledOnce")
      .then(writeText => {
        const copiedUrl = (writeText as unknown as { firstCall: { args: [string] } }).firstCall.args[0];
        const searchParams = new URL(copiedUrl).searchParams;
        expect(searchParams.get("methods")).to.equal("transfer");
        expect(searchParams.get("args.transfer.0")).to.equal(ACCOUNT_ADDRESS);
        expect(searchParams.get("args.transfer.1")).to.equal("456");
      });
  });
});
