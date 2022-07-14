import React, { useState } from "react";
import { AddressInput, Contract } from "../components";
import { ethers } from "ethers";
import { Button, Space, message, Select, Divider, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NETWORKS } from "../constants";

import { init as etherscanInit } from "etherscan-api";

const validateAbi = abi => Array.isArray(abi) && abi.length > 0;
const validateAddress = address => ethers.utils.isAddress(address);

const ETHERSCAN_API = process.env.REACT_APP_ETHERSCAN_API;

function ContractUI({ localProvider, userSigner, mainnetProvider, targetNetwork, onUpdateNetwork }) {
  const [loadedContract, setLoadedContract] = useState({});
  const [etherscanUrl, setEtherscanUrl] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contractAbi, setContractAbi] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(targetNetwork);

  const loadedContractEtherscan = async () => {
    let contractUrlObject;
    try {
      contractUrlObject = new URL(etherscanUrl);
    } catch (e) {
      message.error("Invalid URL");
      return;
    }
    let network = contractUrlObject.host.split(".")[0];
    if (network === "etherscan") {
      // No subdomain.
      network = "mainnet";
    }

    setSelectedNetwork(NETWORKS[network]);
    onUpdateNetwork(network);

    const contractAddress = contractUrlObject.pathname.replace("/address/", "");
    const etherscanClient = etherscanInit(ETHERSCAN_API, network === "mainnet" ? "" : network, 10000);

    let response;
    try {
      response = await etherscanClient.contract.getabi(contractAddress);
    } catch (e) {
      message.error(`From Etherscan API: ${e}`);
      return;
    }
    console.log("contractAbi", response);

    if (response.status !== "1") {
      message.error("Can't fetch data from Etherscan. Ensure the contract is verified.");
      return;
    }

    const contractAbi = response.result;

    // ToDo. Need to fix this. User Signer might be pointing the previous selected network.
    const contract = new ethers.Contract(contractAddress, contractAbi, userSigner);
    setLoadedContract(contract);
  };

  const loadContractRaw = async () => {
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
    setLoadedContract(contract);
  };

  const loadContract = () => {
    if (etherscanUrl) {
      loadedContractEtherscan();
    } else {
      loadContractRaw();
    }
  };

  const reset = () => {
    setLoadedContract({});
    setContractAddress("");
    setContractAbi("");
    setEtherscanUrl("");
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
      {loadedContract.address ? (
        <>
          <Button danger onClick={reset} style={{ marginBottom: 10 }}>
            Reset
          </Button>
          <h2>
            You are connected on: <span style={{ color: selectedNetwork.color }}>{selectedNetwork.name}</span>
          </h2>
          <Contract
            customContract={loadedContract}
            signer={userSigner}
            provider={localProvider}
            blockExplorer={selectedNetwork.blockExplorer}
          />
        </>
      ) : (
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
          </Space>
        </div>
      )}
    </div>
  );
}

export default ContractUI;
