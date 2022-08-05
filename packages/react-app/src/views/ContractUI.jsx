import React, { useEffect } from "react";
import { Contract } from "../components";

function ContractUI({ customContract, signer, provider, blockExplorer, selectedNetwork, reset }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contract-container">
      <Contract
        customContract={customContract}
        signer={signer}
        provider={provider}
        blockExplorer={blockExplorer}
        selectedNetwork={selectedNetwork}
        reset={reset}
      />
    </div>
  );
}

export default ContractUI;
