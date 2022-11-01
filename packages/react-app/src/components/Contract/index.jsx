import { Col, Collapse, Row, Skeleton } from "antd";
import { useContractExistsAtAddress, useContractLoader } from "eth-hooks";
import React, { useEffect, useMemo, useState } from "react";
import Address from "../Address";
import Balance from "../Balance";
import DisplayVariable from "./DisplayVariable";
import FunctionForm from "./FunctionForm";
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
  loadWeb3Modal,
}) {
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

  useEffect(
    () => async () => {
      let name = "Contract";
      if (!contract.name) {
        return;
      }
      name = await contract.name();
      setContractName(name);
    },
    [contract],
  );
  useEffect(() => {
    const rawQueryParams = history.location.search;
    const queryParams = new URLSearchParams(rawQueryParams);
    const rawFunctions = queryParams.get("functions");

    if (rawFunctions) {
      const parsedFunctions = rawFunctions.split(",");
      setSeletectedContractMethods(parsedFunctions);
    }
  }, []);

  const handleMethodChange = method => {
    const queryParams = new URLSearchParams(history?.location?.search);

    let newSelected = [...seletectedContractMethods];
    if (!newSelected.includes(method)) {
      newSelected.push(method);
    } else {
      newSelected = newSelected.filter(val => val !== method);
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
            contractName={contractName}
            contractAddress={address}
            seletectedContractMethods={seletectedContractMethods}
            handleMethodChange={handleMethodChange}
            contractMethodsRead={allMethodsNamesRead}
            contractMethodsSend={allMethodsNamesSend}
            contractIsDeployed={contractIsDeployed}
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
