import React, { useEffect, useState } from "react";
import { Contract } from "../components";
import useBodyClass from "../hooks/useBodyClass";
import { Link, useHistory, useParams } from "react-router-dom";
import { loadContractEtherscan } from "../helpers/loadContractEtherscan";
import { Card, message, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { NETWORKS } from "../constants";

function ContractUI({
  customContract,
  signer,
  localProvider,
  provider,
  blockExplorer,
  selectedNetwork,
  mainnetProvider,
  setLoadedContract,
  setSelectedNetwork,
}) {
  useBodyClass(`path-contract`);
  const [hasError, setHasError] = useState(false);
  let { contractAddress, network } = useParams();
  const activeNetwork = NETWORKS[network] ?? NETWORKS.mainnet;
  const history = useHistory();

  useEffect(() => {
    if (hasError) return;

    const loadContractFromUrl = async () => {
      let contract;
      try {
        const providerOrSigner = signer ?? localProvider;
        contract = await loadContractEtherscan(contractAddress, activeNetwork, providerOrSigner);
      } catch (e) {
        message.error(e.message);
        setHasError(true);
        return;
      }

      setHasError(false);
      setLoadedContract(contract);
    };

    if (network && !NETWORKS[network]) {
      message.error(`${network} is not a valid network`);
      setHasError(true);
      return;
    }

    if (!signer && !localProvider) return;
    if (selectedNetwork.name !== activeNetwork.name) {
      setSelectedNetwork(activeNetwork.name);
      return;
    }

    if (customContract) {
      window.scrollTo(0, 0);
    } else {
      loadContractFromUrl();
    }
    // eslint-disable-next-line
  }, [
    contractAddress,
    customContract,
    network,
    signer,
    setLoadedContract,
    activeNetwork,
    setSelectedNetwork,
    localProvider,
    // ToDo. This won't work
    // selectedNetwork.name,
  ]);

  const reset = () => {
    history.push("/");
  };

  if (hasError) {
    return (
      <Card className="contract-load-error" size="large">
        <p>
          There was an error loading the contract <strong>{contractAddress}</strong> on{" "}
          <strong>{network ?? activeNetwork.name}</strong>.
        </p>
        <p> Make sure the data is correct and the contract is verified.</p>

        <Link to="/">
          <ArrowLeftOutlined /> Go back to homepage
        </Link>
      </Card>
    );
  }

  if (!customContract) {
    return (
      <div className="center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="contract-container">
      <Contract
        customContract={customContract}
        signer={signer}
        provider={provider}
        mainnetProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        selectedNetwork={activeNetwork}
        reset={reset}
      />
    </div>
  );
}

export default ContractUI;
