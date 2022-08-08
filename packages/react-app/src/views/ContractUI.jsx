import React, { useEffect } from "react";
import { Contract } from "../components";

function ContractUI({ customContract, signer, provider, blockExplorer, selectedNetwork, reset, mainnetProvider }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contract-container">
      <Contract
        customContract={customContract}
        signer={signer}
        provider={provider}
        mainnetProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        selectedNetwork={selectedNetwork}
        reset={reset}
      />
    </div>
  );
}

export default ContractUI;
