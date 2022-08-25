import React, { useState } from "react";
import { AddressInput } from "../components";
import { ethers } from "ethers";
import { Button, message, Select, Collapse } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NETWORKS } from "../constants";
import { useHistory } from "react-router-dom";
import useBodyClass from "../hooks/useBodyClass";
import { loadContractEtherscan } from "../helpers/loadContractEtherscan";

const { Panel } = Collapse;

const validateAbi = abi => Array.isArray(abi) && abi.length > 0;
const validateAddress = address => ethers.utils.isAddress(address);

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

function Homepage({ userSigner, mainnetProvider, targetNetwork, onUpdateNetwork, setLoadedContract, localProvider }) {
  const [verifiedContractAddress, setVerifiedContractAddress] = useState("");
  const [abiContractAddress, setAbiContractAddress] = useState("");
  const [contractAbi, setContractAbi] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(targetNetwork);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
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
    return abiContractAddress;
  };

  const loadContract = async (address = null) => {
    setIsLoadingContract(true);

    let contractAddress;
    if (address) {
      contractAddress = await loadVerifiedContract(address);
    } else if (verifiedContractAddress) {
      contractAddress = await loadVerifiedContract();
    } else {
      contractAddress = await loadContractRaw();
    }
    setIsLoadingContract(false);

    if (contractAddress) {
      history.push(`/${contractAddress}/${selectedNetwork.name}`);
    }
  };

  const networkSelect = (
    <Select
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
          <span style={{ color: network.color }}>{name}</span>
        </Select.Option>
      ))}
    </Select>
  );

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
            <AddressInput
              value={verifiedContractAddress}
              placeholder={`Verified contract address on ${selectedNetwork.name}`}
              ensProvider={mainnetProvider}
              size="large"
              onChange={setVerifiedContractAddress}
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
              value={abiContractAddress}
              placeholder={`Contract address on ${selectedNetwork.name}`}
              ensProvider={mainnetProvider}
              size="large"
              onChange={setAbiContractAddress}
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
