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

const quickAccessContracts = [
  {
    name: "DAI",
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  },
  {
    name: "Gitcoin",
    address: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
  },
  {
    name: "Opensea Seaport",
    address: "0x00000000006c3852cbef3e08e8df289169ede581",
  },
];

function Homepage({ localProvider, userSigner, mainnetProvider, targetNetwork, onUpdateNetwork }) {
  const [loadedContract, setLoadedContract] = useState({});
  const [verifiedContractAddress, setVerifiedContractAddress] = useState("");
  const [abiContractAddress, setAbiContractAddress] = useState("");
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

  const loadedContractEtherscan = async (address = null) => {
    const queryContractAddress = address ?? verifiedContractAddress;
    if (!ethers.utils.isAddress(queryContractAddress)) {
      message.error("Invalid Contract Address");
      return;
    }
    const etherscanClient = etherscanInit(ETHERSCAN_API, selectedNetwork.name, 10000);

    let response;
    try {
      response = await etherscanClient.contract.getabi(queryContractAddress);
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
    const contract = new ethers.Contract(queryContractAddress, contractAbi, userSigner);
    setLoadedContract(contract);
    history.push({ hash: "#contract" });
  };

  const loadContractRaw = async () => {
    if (!validateAddress(abiContractAddress)) {
      message.error("Invalid Contract Address");
      return;
    }

    const bytecode = await userSigner.provider.getCode(abiContractAddress);
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

    const contract = new ethers.Contract(abiContractAddress, contractAbi, userSigner);
    setLoadedContract(contract);
    history.push({ hash: "#contract" });
  };

  const loadContract = async (address = null) => {
    setIsLoadingContract(true);

    if (address) {
      await loadedContractEtherscan(address);
    } else if (verifiedContractAddress) {
      await loadedContractEtherscan();
    } else {
      await loadContractRaw();
    }
    setIsLoadingContract(false);
  };

  const reset = () => {
    setLoadedContract({});
    setAbiContractAddress("");
    setContractAbi("");
    setVerifiedContractAddress("");
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
      <div className="lead-text">
        <p>Interact with any contract on Ethereum.</p>
      </div>
      <div className="network-selector center">
        <p>{networkSelect}</p>
      </div>

      <Collapse defaultActiveKey={["1"]} className="abi-ninja-options" accordion>
        <Panel header="Verified Contract Address" key="1">
          <div className="form-item">
            <Input
              value={verifiedContractAddress}
              placeholder={`Verified contract address on ${selectedNetwork.name}`}
              size="large"
              onChange={e => {
                setVerifiedContractAddress(e.target.value);
              }}
            />
          </div>
          <div className="options-actions">
            <Button type="primary" size="large" onClick={() => loadContract()} loading={isLoadingContract} block>
              Load Contract
            </Button>
          </div>
        </Panel>
        <Panel header="Address + ABI" key="2">
          <div className="form-item">
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              size="large"
              value={abiContractAddress}
              onChange={setAbiContractAddress}
              placeholder={`Contract address on ${selectedNetwork.name}`}
            />
          </div>
          <div className="form-item">
            <TextArea
              style={{ height: 120 }}
              value={contractAbi}
              size="large"
              placeholder="Contract ABI (json format)"
              onChange={e => {
                setContractAbi(e.target.value);
              }}
            />
          </div>
          <div className="options-actions">
            <Button type="primary" size="large" onClick={() => loadContract()} loading={isLoadingContract} block>
              Load Contract
            </Button>
          </div>
        </Panel>
      </Collapse>
      {selectedNetwork.chainId === 1 && (
        <div className="quick-access">
          <h3>Quick Access</h3>
          <ul>
            {quickAccessContracts.map(item => {
              return <li onClick={() => loadContract(item.address)}>{item.name}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Homepage;
