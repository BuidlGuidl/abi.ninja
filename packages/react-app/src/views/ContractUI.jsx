import React, { useState } from "react";
import { AddressInput, Contract } from "../components";
import { ethers } from "ethers";
import { Button, Space, message, Select, Divider, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NETWORKS } from "../constants";

const validateAbi = abi => Array.isArray(abi) && abi.length > 0;
const validateAddress = address => ethers.utils.isAddress(address);

function ContractUI({ localProvider, userSigner, mainnetProvider, targetNetwork, onUpdateNetwork }) {
  const [loadedContract, setLoadedContract] = useState({});
  const [etherscanUrl, setEtherscanUrl] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contractAbi, setContractAbi] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(targetNetwork);

  const loadContract = async () => {
    if (!validateAddress(contractAddress)) {
      message.error("Invalid Contract Address");
      return;
    }

    const bytecode = await userSigner.provider.getCode(contractAddress);
    if (bytecode === "0x") {
      message.error(`There is no Contract Deployed at that address on ${selectedNetwork.name}`);
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

  const networkSelect = (
    <Select
      size="large"
      defaultValue={selectedNetwork.name}
      style={{ textAlign: "left", width: 170, fontSize: 30 }}
      onChange={value => {
        if (selectedNetwork.chainId !== NETWORKS[value].chainId) {
          setSelectedNetwork(NETWORKS[value]);
          onUpdateNetwork(value);
        }
      }}
    >
      {Object.entries(NETWORKS).map(([name, network]) => (
        <Select.Option key={name} value={name}>
          <span style={{ color: network.color, fontSize: 24 }}>{name}</span>
        </Select.Option>
      ))}
    </Select>
  );

  return (
    <div style={{ margin: "30px 0" }}>
      <div style={{ margin: "0 auto", maxWidth: 600 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <h2>You are connected on: {networkSelect}</h2>
          <div style={{ textAlign: "left" }}>
            <strong style={{ fontSize: 18 }}>Contract Address:</strong>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="Contract Address"
              size="large"
              value={contractAddress}
              onChange={setContractAddress}
            />
          </div>
          <div style={{ textAlign: "left" }}>
            <strong style={{ fontSize: 18 }}>Contract ABI (json format):</strong>
            <TextArea
              placeholder="Contract ABI (json format)"
              style={{ height: 120 }}
              value={contractAbi}
              size="large"
              onChange={e => {
                setContractAbi(e.target.value);
              }}
            />
          </div>
          <Divider>OR</Divider>
          <div style={{ textAlign: "left" }}>
            <strong style={{ fontSize: 18 }}>Verified Etherscan Contract URL:</strong>
            <Input
              placeholder="Verified Etherscan Contract URL"
              value={etherscanUrl}
              size="large"
              onChange={e => {
                setEtherscanUrl(e.target.value);
              }}
            />
          </div>
          <Divider />
          <Button type="primary" size="large" onClick={loadContract}>
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
