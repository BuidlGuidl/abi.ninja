import { Col, Collapse, Row, Skeleton } from "antd";
import { useContractExistsAtAddress } from "eth-hooks";
import React, { useEffect, useMemo, useState } from "react";
import Address from "../Address";
import Balance from "../Balance";
import DisplayVariable from "./DisplayVariable";
import FunctionForm from "./FunctionForm";
import ContractNavigation from "./ContractNavigation";
import { useHistory } from "react-router-dom";
import { MenuOutlined, CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
const { Panel } = Collapse;

export default function Contract({
  customContract,
  gasPrice,
  signer,
  provider,
  mainnetProvider,
  show,
  price,
  blockExplorer,
  loadWeb3Modal,
}) {
  const history = useHistory();
  const [contractName, setContractName] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const address = customContract ? customContract.address : "";
  const contractIsDeployed = useContractExistsAtAddress(provider, address);
  const [seletectedContractMethods, setSeletectedContractMethods] = useState([]);

  const [refreshRequired, triggerRefresh] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [contractIsDeployed]);

  useEffect(() => {
    const fetchContractName = async () => {
      let name = "Contract";
      if (!customContract.name) {
        return;
      }
      name = await customContract.name();
      setContractName(name);
    };

    fetchContractName();
  }, [customContract]);

  useEffect(() => {
    const rawQueryParams = history.location.search;
    const queryParams = new URLSearchParams(rawQueryParams);
    const rawFunctions = queryParams.get("functions");

    if (rawFunctions) {
      const parsedFunctions = rawFunctions.split(",");
      setSeletectedContractMethods(parsedFunctions);
    }
  }, [history.location.search]);

  const handleMethodChange = method => {
    let newSelected = [...seletectedContractMethods];
    console.log(seletectedContractMethods);
    if (!newSelected.includes(method)) {
      newSelected.push(method);
    } else {
      newSelected = newSelected.filter(val => val !== method);
    }

    setSeletectedContractMethods(newSelected);
  };

  useEffect(() => {
    if (seletectedContractMethods.length > 0) {
      const queryParams = new URLSearchParams(history?.location?.search);
      queryParams.set("functions", seletectedContractMethods);
      history.push({ search: queryParams.toString() });
    } else {
      history.push({ search: "" });
    }
  }, [seletectedContractMethods, history]);

  const displayedContractFunctions = useMemo(() => {
    const results = customContract
      ? Object.entries(customContract.interface.functions).filter(
          fn => fn[1]["type"] === "function" && !(show && show.indexOf(fn[1]["name"]) < 0),
        )
      : [];
    return results;
  }, [customContract, show]);

  const allMethodsNamesRead = [];
  const allMethodsNamesSend = [];
  displayedContractFunctions.forEach(contractFuncInfo => {
    const contractFunc =
      contractFuncInfo[1].stateMutability === "view" || contractFuncInfo[1].stateMutability === "pure"
        ? customContract[contractFuncInfo[0]]
        : customContract.connect(signer)[contractFuncInfo[0]];

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

  const contractVariablesDisplay = [];
  const contractMethodsDisplayRead = [];
  const contractMethodsDisplaySend = [];
  displayedContractFunctions.forEach(contractFuncInfo => {
    const contractFunc =
      contractFuncInfo[1].stateMutability === "view" || contractFuncInfo[1].stateMutability === "pure"
        ? customContract[contractFuncInfo[0]]
        : customContract.connect(signer)[contractFuncInfo[0]];

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
                handleMethodChange={handleMethodChange}
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
                handleMethodChange={handleMethodChange}
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
        <Col xs={0} sm={0} md={8} lg={6} xxl={4} className={`contract-navigation ${openMenu ? "open" : ""}`}>
          <CloseOutlined className="menu-button-close" onClick={() => setOpenMenu(false)} />
          <ContractNavigation
            contractName={contractName}
            contractAddress={address}
            blockExplorer={blockExplorer}
            seletectedContractMethods={seletectedContractMethods}
            handleMethodChange={handleMethodChange}
            contractMethodsRead={allMethodsNamesRead}
            contractMethodsSend={allMethodsNamesSend}
            contractIsDeployed={contractIsDeployed}
          />
        </Col>
        <Col xs={0} sm={0} md={8} lg={6} xl={6} xxl={4} className={`info-navigation ${openInfo ? "open" : ""}`}>
          <CloseOutlined className="info-button-close" onClick={() => setOpenInfo(false)} />
          <h2>Contract Info</h2>
          <div className="address-row">
            <Address value={address} blockExplorer={blockExplorer} fontSize={18} />
            <Balance address={address} provider={provider} price={price} fontSize={18} />
          </div>

          {contractIsDeployed ? contractVariablesDisplay : <Skeleton active />}
        </Col>
        <Col xs={24} sm={24} md={16} lg={18} xl={18}  xxl={20} className="contract-column contract-main">
          <Row className="secondary-header">
            {!openMenu && <MenuOutlined className="menu-button" onClick={() => setOpenMenu(true)} />}
            {!openInfo && <InfoCircleOutlined className="info-button" onClick={() => setOpenInfo(true)} />}
          </Row>
          {!contractMethodsDisplayRead.length && !contractMethodsDisplaySend.length && (
            <p className="no-methods-placeholder">Add methods from the sidebar....</p>
          )}
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
