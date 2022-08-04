import React from "react";
import { Contract } from "../components";
import { Button } from "antd";

function ContractUI({ customContract, signer, provider, blockExplorer, selectedNetwork, reset }) {
  return (
    <div className="contract-container">
      <div className="center">
        <div className="logo">
          <img src="/logo_inv.svg" alt="logo" />
        </div>
        <Button danger onClick={reset} style={{ marginBottom: 10 }}>
          Reset
        </Button>
        <h2>
          You are connected on: <span style={{ color: selectedNetwork.color }}>{selectedNetwork.name}</span>
        </h2>
      </div>
      <Contract customContract={customContract} signer={signer} provider={provider} blockExplorer={blockExplorer} />
    </div>
  );
}

export default ContractUI;
