import React, { useEffect, useState } from "react";
import { AddressInput } from "../components";
import { Button, message, Select, Collapse, Tabs, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NETWORKS } from "../constants";
import { useHistory } from "react-router-dom";
import useBodyClass from "../hooks/useBodyClass";
import { loadContractEtherscan } from "../helpers/loadContractEtherscan";
import { loadContractRaw } from "../helpers/loadContractRaw";
import { GithubFilled, HeartFilled } from "@ant-design/icons";

const { Panel } = Collapse;

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

function Homepage({
  userSigner,
  mainnetProvider,
  targetNetwork,
  onUpdateNetwork,
  setLoadedContract,
  localProvider,
  selectedChainId,
}) {
  const [verifiedContractAddress, setVerifiedContractAddress] = useState("");
  const [abiContractAddress, setAbiContractAddress] = useState("");
  const [contractAbi, setContractAbi] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(targetNetwork);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const history = useHistory();

  useBodyClass(`path-index`);

  useEffect(() => {
    const storedNetwork = sessionStorage.getItem("selectedNetwork");
    if (storedNetwork) {
      setSelectedNetwork(NETWORKS[storedNetwork]);
      onUpdateNetwork(storedNetwork);
    }
    // Dont want to re-run on selected network change.
    // eslint-disable-next-line
  }, [onUpdateNetwork]);

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
          <Select
            value={selectedNetwork.name}
            className="nework-selector"
            onChange={value => {
              if (selectedNetwork.chainId !== NETWORKS[value].chainId) {
                sessionStorage.setItem("selectedNetwork", value);
                setSelectedNetwork(NETWORKS[value]);
                onUpdateNetwork(value);
              }
            }}
          >
            {Object.entries(NETWORKS).map(([name, network]) => (
              <Select.Option key={name} value={name}>
                <span>{`${name[0].toUpperCase()}${name.substring(1, name.length)}`}</span>
              </Select.Option>
            ))}
          </Select>
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
              <Input
                value={contractAbi}
                size="large"
                className="standard-input"
                placeholder="Contract ABI (json format)"
                onChange={e => {
                  setContractAbi(e.target.value);
                }}
              />
            </Tabs.TabPane>
          </Tabs>
          <Button
            type="primary"
            size="large"
            onClick={activeTab == 0 ? () => loadContract("verified") : () => loadContract("abi")}
            block
          >
            {isLoadingContract ? "Loading..." : "Load Contract"}
          </Button>
        </div>
        <div className="footer-items">
          <p>
            <GithubFilled />{" "}
            <a href="https://github.com/carletex/abi.ninja" target="_blank" rel="noreferrer">
              Fork me
            </a>
          </p>
          <p className="separator"> | </p>
          <p>
            Built with <HeartFilled style={{ color: "red" }} /> at 🏰{" "}
            <a href="https://buidlguidl.com/" target="_blank" rel="noreferrer">
              BuidlGuidl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
