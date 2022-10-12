import { Button, Card, Checkbox, Col, Collapse, Modal, Row, Skeleton } from "antd";
import { useContractExistsAtAddress, useContractLoader } from "eth-hooks";
import React, { useEffect, useMemo, useState } from "react";
import Address from "../Address";
import Balance from "../Balance";
import DisplayVariable from "./DisplayVariable";
import FunctionForm from "./FunctionForm";
import { ArrowLeftOutlined, SettingOutlined } from "@ant-design/icons";
import ContractNavigation from "./ContractNavigation";
import { useHistory } from "react-router-dom";

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
const { Panel } = Collapse;

export default function Contract({
  customContract,
  gasPrice,
  signer,
  provider,
  mainnetProvider,
  name,
  show,
  price,
  blockExplorer,
  chainId,
  contractConfig,
  selectedNetwork,
  web3Modal,
  logoutOfWeb3Modal,
  loadWeb3Modal,
  reset,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const contracts = useContractLoader(provider, contractConfig, chainId);
  const history = useHistory();
  const [contractName, setContractName] = useState("");

  let contract;
  if (!customContract) {
    contract = contracts ? contracts[name] : "";
  } else {
    contract = customContract;
  }

  const address = contract ? contract.address : "";
  const contractIsDeployed = useContractExistsAtAddress(provider, address);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [contractIsDeployed]);

  useEffect(async () => {
    if (!contract.name) {
      return;
    }
    const name = await contract.name();
    setContractName(name);
  }, []);
  useEffect(() => {
    const rawQueryParams = history.location.search;
    const queryParams = new URLSearchParams(rawQueryParams);
    const rawFunctions = queryParams.get("functions");

    if (rawFunctions) {
      const parsedFunctions = rawFunctions.split(",");
      setSeletectedContractMethods(parsedFunctions);
    }
    // Omitting the history dependency in purpose. Only want to run this on init.
    // eslint-disable-next-line
  }, []);

  // Handle method selection on modal
  const handleMethodChange = method => {
    // Init with existing search.
    const queryParams = new URLSearchParams(history?.location?.search);

    let newSelected = [...seletectedContractMethods];
    if (!newSelected.includes(method)) {
      newSelected.push(method);
    } else {
      newSelected = newSelected.filter(val => val != method);
    }
    if (newSelected) {
      queryParams.set("functions", newSelected);
    }
    history.push({ search: queryParams.toString() });
    setSeletectedContractMethods(newSelected);
  };

  const displayedContractFunctions = useMemo(() => {
    const results = contract
      ? Object.entries(contract.interface.functions).filter(
          fn => fn[1]["type"] === "function" && !(show && show.indexOf(fn[1]["name"]) < 0),
        )
      : [];
    return results;
  }, [contract, show]);

  const allMethodsNamesRead = [];
  const allMethodsNamesSend = [];
  displayedContractFunctions.forEach(contractFuncInfo => {
    const contractFunc =
      contractFuncInfo[1].stateMutability === "view" || contractFuncInfo[1].stateMutability === "pure"
        ? contract[contractFuncInfo[0]]
        : contract.connect(signer)[contractFuncInfo[0]];

    if (typeof contractFunc === "function") {
      if (!isQueryable(contractFuncInfo[1])) {
        if (contractFuncInfo[1].stateMutability === "view" || contractFuncInfo[1].stateMutability === "pure") {
          allMethodsNamesRead.push(contractFuncInfo[1].name);
        } else {
          allMethodsNamesSend.push(contractFuncInfo[1].name);
        }
      }
    }
  });

  const [seletectedContractMethods, setSeletectedContractMethods] = useState([]);

  const [refreshRequired, triggerRefresh] = useState(false);

  const contractVariablesDisplay = [];
  const contractMethodsDisplayRead = [];
  const contractMethodsDisplaySend = [];
  displayedContractFunctions.forEach(contractFuncInfo => {
    const contractFunc =
      contractFuncInfo[1].stateMutability === "view" || contractFuncInfo[1].stateMutability === "pure"
        ? contract[contractFuncInfo[0]]
        : contract.connect(signer)[contractFuncInfo[0]];

    if (typeof contractFunc === "function") {
      if (isQueryable(contractFuncInfo[1])) {
        // If there are no inputs, just display return value
        contractVariablesDisplay.push(
          <DisplayVariable
            key={contractFuncInfo[1].name}
            contractFunction={contractFunc}
            functionInfo={contractFuncInfo[1]}
            refreshRequired={refreshRequired}
            triggerRefresh={triggerRefresh}
            blockExplorer={blockExplorer}
          />,
        );
      } else {
        if (seletectedContractMethods.includes(contractFuncInfo[1].name)) {
          if (contractFuncInfo[1].stateMutability === "view" || contractFuncInfo[1].stateMutability === "pure") {
            contractMethodsDisplayRead.push(
              <FunctionForm
                key={"FF" + contractFuncInfo[0]}
                contractFunction={contractFunc}
                functionInfo={contractFuncInfo[1]}
                provider={provider}
                mainnetProvider={mainnetProvider}
                gasPrice={gasPrice}
                triggerRefresh={triggerRefresh}
                loadWeb3Modal={loadWeb3Modal}
                signer={signer}
              />,
            );
          } else {
            contractMethodsDisplaySend.push(
              <FunctionForm
                key={"FF" + contractFuncInfo[0]}
                contractFunction={contractFunc}
                functionInfo={contractFuncInfo[1]}
                provider={provider}
                mainnetProvider={mainnetProvider}
                gasPrice={gasPrice}
                triggerRefresh={triggerRefresh}
                loadWeb3Modal={loadWeb3Modal}
                signer={signer}
              />,
            );
          }
        }
      }
    }
    return null;
  });

  return (
    <div className="contract-component">
      <Row className="contract-component-row">
        <Col xs={0} md={4} className="contract-navigation">
          <ContractNavigation
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            contractName={contractName}
            contractAddress={address}
            seletectedContractMethods={seletectedContractMethods}
            handleMethodChange={handleMethodChange}
            contractMethodsRead={allMethodsNamesRead}
            contractMethodsSend={allMethodsNamesSend}
            contractIsDeployed={contractIsDeployed}
            loadWeb3Modal={loadWeb3Modal}
            web3Modal={web3Modal}
          />
        </Col>
        <Col xs={24} md={20} className="contract-column contract-main">
          <Collapse bordered={false} defaultActiveKey={["1"]} className="contract-info">
            <Panel header="Contract Info" key="1">
              <div className="address-row">
                <Address value={address} blockExplorer={blockExplorer} fontSize={18} />
                <Balance address={address} provider={provider} price={price} fontSize={18} />
              </div>

              {contractIsDeployed ? contractVariablesDisplay : <Skeleton active />}
            </Panel>
          </Collapse>

          {/* <Modal
            className="method-selection"
            title="Visible functions"
            visible={isModalVisible}
            onOk={() => setIsModalVisible(false)}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            <p>
              <strong>Select the contract functions you want to be visible.</strong>
            </p>
            <p>They will be appended to the URL so you can share it.</p>
            <div style={{ display: "flex", gap: "10px", marginBottom: 10 }}>
              <Button onClick={() => setSeletectedContractMethods(allMethodsNames)}>Select all</Button>
              <Button onClick={() => setSeletectedContractMethods([])}>Remove all</Button>
            </div>
            <Checkbox.Group options={allMethodsNames} value={seletectedContractMethods} onChange={handleMethodChange} />
          </Modal> */}
          {contractMethodsDisplayRead.length > 0 && (
            <div className="functions-container">
              <h3>READ</h3>
              <div className="function-container">
                {contractIsDeployed ? contractMethodsDisplayRead : <Skeleton active />}
              </div>
            </div>
          )}
          {contractMethodsDisplaySend.length > 0 && (
            <div className="functions-container">
              <h3>SEND</h3>
              <div className="function-container">
                {contractIsDeployed ? contractMethodsDisplaySend : <Skeleton active />}
              </div>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}
