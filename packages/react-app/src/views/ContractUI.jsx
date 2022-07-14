import React, { useState } from "react";
import { AddressInput, Contract } from "../components";
import { ethers } from "ethers";
import { Button, Input, Space, message } from "antd";
import TextArea from "antd/es/input/TextArea";

const validateAbi = abi => Array.isArray(abi) && abi.length > 0;
const validateAddress = address => ethers.utils.isAddress(address);

function ContractUI({ localProvider, userSigner, mainnetProvider, targetNetwork }) {
  const [loadedContract, setLoadedContract] = useState({});
  const [contractAddress, setContractAddress] = useState("");
  const [contractAbi, setContractAbi] = useState("");

  const loadContract = () => {
    if (!validateAddress(contractAddress)) {
      message.error("Invalid Contract Address");
      return;
    }
    try {
      if (!validateAbi(JSON.parse(contractAbi))) {
        message.error("Invalid Contract ABI");
        return;
      }
    } catch (e) {
      // JSON parse error
      message.error("Invalid Contract ABI");
      return;
    }

    const contract = new ethers.Contract(contractAddress, contractAbi, userSigner);

    // ToDo. check if we are connected.
    setLoadedContract(contract);
  };

  const reset = () => {
    setLoadedContract({});
    setContractAddress("");
    setContractAbi("");
  };

  return (
    <div style={{ margin: "30px 0" }}>
      <div style={{ margin: "0 auto", maxWidth: 600 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <h2>
            You are connected on: <strong style={{ color: targetNetwork.color }}>{targetNetwork.name}</strong>
          </h2>
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="Contract Address"
            value={contractAddress}
            onChange={setContractAddress}
          />
          <TextArea
            placeholder="Contract ABI (json format)"
            style={{ height: 120 }}
            value={contractAbi}
            onChange={e => {
              setContractAbi(e.target.value);
            }}
          />
          <Button type="primary" onClick={loadContract}>
            Load Contract
          </Button>
          {loadedContract.address && (
            <Button type="link" danger onClick={reset}>
              Reset
            </Button>
          )}
        </Space>
      </div>

      {loadedContract.address && (
        <Contract
          customContract={loadedContract}
          signer={userSigner}
          provider={localProvider}
          blockExplorer="https://etherscan.io/"
        />
      )}
    </div>
  );
}

export default ContractUI;
