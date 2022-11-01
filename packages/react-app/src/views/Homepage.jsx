import React, { useState } from "react";
import { AddressInput } from "../components";
import { Button, message, Tabs } from "antd";
import { NETWORKS } from "../constants";
import { Link, useHistory } from "react-router-dom";
import useBodyClass from "../hooks/useBodyClass";
import { loadContractEtherscan } from "../helpers/loadContractEtherscan";
import { loadContractRaw } from "../helpers/loadContractRaw";
import { NetworkSelector } from "../components/Core/networkSelector";
import { MainInput } from "../components/Core/mainInput";
import { AbiFooter } from "../components/Core/footer";

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
    name: "Opensea",
    address: "0x00000000006c3852cbef3e08e8df289169ede581",
  },
];

function Homepage({
  userSigner,
  mainnetProvider,
  selectedNetwork,
  onUpdateNetwork,
  setLoadedContract,
  localProvider,
  selectedChainId,
}) {
  const [verifiedContractAddress, setVerifiedContractAddress] = useState("");
  const [abiContractAddress, setAbiContractAddress] = useState("");
  const [contractAbi, setContractAbi] = useState("");
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const history = useHistory();

  useBodyClass(`path-index`);

  const loadVerifiedContract = async (address = null) => {
    const queryContractAddress = address ?? verifiedContractAddress;

    let contract;
    try {
      const providerOrSigner = userSigner ?? localProvider;
      contract = await loadContractEtherscan(queryContractAddress, selectedNetwork, providerOrSigner);
    } catch (e) {
      message.error(e.message);
      return;
    }

    setLoadedContract(contract);
    return contract.address;
  };

  const loadContractAbi = async () => {
    let contract;
    try {
      const providerOrSigner = userSigner ?? localProvider;
      contract = await loadContractRaw(abiContractAddress, contractAbi, selectedNetwork, providerOrSigner);
    } catch (e) {
      message.error(e.message);
      return;
    }

    setLoadedContract(contract);
    return contract.address;
  };

  const loadContract = async (type, address = null) => {
    if (selectedChainId && selectedNetwork.chainId !== selectedChainId) {
      message.error(`Please switch your wallet to ${selectedNetwork.name}.`);
      return;
    }

    setIsLoadingContract(true);

    let contractAddress;
    switch (type) {
      case "abi":
        contractAddress = await loadContractAbi();
        break;
      case "verified":
        if (address) {
          contractAddress = await loadVerifiedContract(address);
        } else {
          contractAddress = await loadVerifiedContract();
        }
        break;
      default:
        console.error("wrong type", type);
    }

    setIsLoadingContract(false);

    if (contractAddress) {
      if (type === "abi") {
        const queryParams = new URLSearchParams();
        const minifiedAbi = contractAbi.replace(/\s+/g, "");
        queryParams.append("abi", encodeURIComponent(minifiedAbi));

        history.push(`/${contractAddress}/${selectedNetwork.name}?${queryParams.toString()}`);
      } else {
        history.push(`/${contractAddress}/${selectedNetwork.name}`);
      }
    }
  };

  return (
    <div className="index-container">
      <div className="search-container">
        <div className="search-content">
          <img src="/logo_inv.svg" alt="logo" />
          <h1>ABI</h1>
          <h2>Ninja</h2>
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            onUpdateNetwork={val => onUpdateNetwork(val)}
            networks={NETWORKS}
          />
          <Tabs
            className="search-tabs"
            defaultActiveKey="0"
            centered
            animated={{ inkBar: true, tabPane: true }}
            onChange={activeKey => {
              setActiveTab(activeKey);
              console.log(activeKey);
            }}
          >
            <Tabs.TabPane tab="Verified Contract Address" key="0">
              <AddressInput
                value={verifiedContractAddress}
                placeholder={`Verified contract address on ${selectedNetwork.name}`}
                ensProvider={mainnetProvider}
                size="large"
                className="address-input"
                onChange={setVerifiedContractAddress}
              />
              <div className="contract-link-container">
                {selectedNetwork.name == "mainnet" && quickAccessContracts.map(item => (
                  <Link key={item.name} to={`/${item.address}/${selectedNetwork.name}`} className="contract-link">
                    {item.name}
                  </Link>
                ))}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Address + ABI" key="1">
              <AddressInput
                value={abiContractAddress}
                placeholder={`Contract address on ${selectedNetwork.name}`}
                ensProvider={mainnetProvider}
                size="large"
                onChange={setAbiContractAddress}
                className="address-input"
              />
              <MainInput
                value={contractAbi}
                placeholder="Contract ABI (json format)"
                onChange={e => {
                  setContractAbi(e.target.value);
                }}
              />
            </Tabs.TabPane>
          </Tabs>
          <Button
            type="primary"
            className="primary"
            size="large"
            onClick={activeTab === 0 ? () => loadContract("verified") : () => loadContract("abi")}
            block
          >
            {isLoadingContract ? "Loading..." : "Load Contract"}
          </Button>
        </div>
        <AbiFooter></AbiFooter>
      </div>
    </div>
  );
}

export default Homepage;
