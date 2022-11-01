import React, { useEffect, useState } from "react";
import { Contract } from "../components";
import useBodyClass from "../hooks/useBodyClass";
import { Link, useHistory, useParams } from "react-router-dom";
import { Card, Spin } from "antd";
import { ArrowLeftOutlined, LoadingOutlined, WarningOutlined } from "@ant-design/icons";
import { NETWORKS } from "../constants";
import { loadContractFromUrl } from "../helpers/loadContractFromUrl";

function ContractUI({
  customContract,
  userSigner,
  localProvider,
  mainnetProvider,
  blockExplorer,
  setLoadedContract,
  setSelectedNetwork,
  loadWeb3Modal,
  web3Modal,
  logoutOfWeb3Modal,
}) {
  useBodyClass(`path-contract`);
  const [error, setError] = useState(null);
  let { urlContractAddress, urlNetworkName } = useParams();
  const history = useHistory();

  useEffect(() => {
    if (customContract && customContract.address === urlContractAddress) {
      // Contract already loaded. Coming from homepage UI.
      window.scrollTo(0, 0);
      return;
    }

    const loadContract = async () => {
      let contract;
      try {
        contract = await loadContractFromUrl(
          urlContractAddress,
          urlNetworkName,
          setSelectedNetwork,
          userSigner,
          localProvider,
          history.location.search,
        );
      } catch (e) {
        setError(e.message);
        return;
      }

      setError(null);
      setLoadedContract(contract);
    };

    loadContract();
  }, [
    urlContractAddress,
    urlNetworkName,
    customContract,
    userSigner,
    setLoadedContract,
    setSelectedNetwork,
    localProvider,
    history,
  ]);

  const reset = () => {
    history.push("/");
  };

  if (error) {
    return (
      <Card className="contract-load-error" size="large">
        <p className="center">
          <WarningOutlined style={{ fontSize: "45px", color: "#ff7474" }} />
        </p>
        <h3 className="center">{error}</h3>
        <p>
          There was an error loading the contract <strong>{urlContractAddress}</strong> on{" "}
          <strong>{urlNetworkName ?? "mainnet"}</strong>.
        </p>
        <p> Make sure the data is correct and you are connected to the right network.</p>

        <Link to="/">
          <ArrowLeftOutlined /> Go back to homepage
        </Link>
      </Card>
    );
  }

  if (!customContract) {
    // Still loading.
    return (
      <div className="contract-loading-spinner center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 35, color: "#551D98" }} spin />} />
      </div>
    );
  }

  return (
    <div className="contract-container">
      <Contract
        customContract={customContract}
        signer={userSigner}
        provider={localProvider}
        mainnetProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        selectedNetwork={NETWORKS[urlNetworkName] ?? NETWORKS.mainnet}
        loadWeb3Modal={loadWeb3Modal}
        web3Modal={web3Modal}
        reset={reset}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
      />
    </div>
  );
}

export default ContractUI;
