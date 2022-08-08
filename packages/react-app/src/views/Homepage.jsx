import React, { useState } from "react";
import { AddressInput } from "../components";
import { ethers } from "ethers";
import { Button, message, Select, Input, Collapse } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NETWORKS } from "../constants";
import { init as etherscanInit } from "etherscan-api";
import { ContractUI } from "./index";
import { useHistory, useLocation } from "react-router-dom";
import useBodyClass from "../hooks/useBodyClass";

const { Panel } = Collapse;

const validateAbi = abi => Array.isArray(abi) && abi.length > 0;
const validateAddress = address => ethers.utils.isAddress(address);

const ETHERSCAN_API = process.env.REACT_APP_ETHERSCAN_API;

function Homepage({ localProvider, userSigner, mainnetProvider, targetNetwork, onUpdateNetwork }) {
  const [loadedContract, setLoadedContract] = useState({});
  const [etherscanUrl, setEtherscanUrl] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contractAbi, setContractAbi] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(targetNetwork);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const history = useHistory();
  const location = useLocation();

  // ToDo. Handle this in a better way (react-router)
  const currentHash = location.hash.replace("#", "");
  if (!loadedContract.address && currentHash.length > 0) {
    history.push("/");
  }

  const appClass = loadedContract.address ? currentHash : "index";
  useBodyClass(`path-${appClass}`);

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

    if (selectedNetwork.name !== network) {
      message.error(`You need to switch to ${network}`);
      return;
    }

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
    history.push({ hash: "#contract" });
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
    history.push({ hash: "#contract" });
  };

  const loadContract = async () => {
    setIsLoadingContract(true);
    if (etherscanUrl) {
      await loadedContractEtherscan();
    } else {
      await loadContractRaw();
    }
    setIsLoadingContract(false);
  };

  const reset = () => {
    setLoadedContract({});
    setContractAddress("");
    setContractAbi("");
    setEtherscanUrl("");
    history.push({ hash: "" });
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

  if (loadedContract.address) {
    return (
      <ContractUI
        customContract={loadedContract}
        signer={userSigner}
        provider={localProvider}
        mainnetProvider={mainnetProvider}
        blockExplorer={selectedNetwork.blockExplorer}
        selectedNetwork={selectedNetwork}
        reset={reset}
      />
    );
  }

  return (
    <div className="index-container">
      <div className="logo">
        <img src="/logo_inv.svg" alt="logo" />
      </div>
      <div className="center">
        <p>{networkSelect}</p>
      </div>

      <Collapse defaultActiveKey={["1"]} className="abi-ninja-options" accordion>
        <Panel header="Address + ABI" key="1">
          <div className="form-item">
            <label style={{ fontSize: 18 }}>Contract Address:</label>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              size="large"
              value={contractAddress}
              onChange={setContractAddress}
            />
          </div>
          <div className="form-item">
            <label style={{ fontSize: 18 }}>Contract ABI (json format):</label>
            <TextArea
              style={{ height: 120 }}
              value={contractAbi}
              size="large"
              onChange={e => {
                setContractAbi(e.target.value);
              }}
            />
          </div>
          <div className="options-actions">
            <Button type="primary" size="large" onClick={loadContract} loading={isLoadingContract}>
              Load Contract
            </Button>
          </div>
        </Panel>
        <Panel header="Etherscan URL" key="2">
          <div className="form-item">
            <label style={{ fontSize: 18 }}>Verified Etherscan Contract URL:</label>
            <Input
              value={etherscanUrl}
              size="large"
              onChange={e => {
                setEtherscanUrl(e.target.value);
              }}
            />
          </div>
          <div className="options-actions">
            <Button type="primary" size="large" onClick={loadContract} loading={isLoadingContract}>
              Load Contract
            </Button>
          </div>
        </Panel>
      </Collapse>
    </div>
  );
}

export default Homepage;
