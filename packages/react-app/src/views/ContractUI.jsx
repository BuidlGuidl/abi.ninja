import React from "react";
import { Contract } from "../components";
import { Button } from "antd";

function ContractUI({ customContract, signer, provider, blockExplorer, selectedNetwork, reset }) {
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
