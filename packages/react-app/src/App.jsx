import { useUserProviderAndSigner } from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import { Account, Header, Faucet } from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";

import { getRPCPollTime, Web3ModalSetup } from "./helpers";
import { Homepage } from "./views";
import { ContractUI } from "./views";
import { useStaticJsonRPC } from "./hooks";
import { Col, Row } from "antd";
const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.mainnet;

const USE_BURNER_WALLET = process.env.REACT_APP_BURNER_WALLET ?? false;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App() {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const [openMenu, setOpenMenu] = useState(false);
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(initialNetwork);
  // 🔭 block explorer URL
  const blockExplorer = selectedNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : selectedNetwork.rpcUrl,
  ]);

  useEffect(() => {
    const storedNetwork = sessionStorage.getItem("selectedNetwork");
    if (storedNetwork) {
      setSelectedNetwork(NETWORKS[storedNetwork]);
    }
  }, []);

  const mainnetProvider = useStaticJsonRPC(providers);

  const mainnetProviderPollingTime = getRPCPollTime(mainnetProvider);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(selectedNetwork, mainnetProvider, mainnetProviderPollingTime);

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [loadedContract, setLoadedContract] = useState(null);
  const faucetAvailable = localProvider && localProvider.connection && selectedNetwork.name.indexOf("local") !== -1;

  const onNetworkChange = value => {
    sessionStorage.setItem("selectedNetwork", value);
    setSelectedNetwork(NETWORKS[value]);
    // window.location.reload();
  };
  return (
    <Switch>
      <Route exact path="/">
        <Homepage
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          selectedNetwork={selectedNetwork}
          onUpdateNetwork={val => onNetworkChange(val)}
          setLoadedContract={setLoadedContract}
          selectedChainId={selectedChainId}
        />
      </Route>
      <Route exact path="/:urlContractAddress/:urlNetworkName?">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Header openMenu={openMenu} setOpenMenu={setOpenMenu}>
            <div className="account-info" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flex: 1 }}>
                <Account
                  useBurner={USE_BURNER_WALLET}
                  address={address}
                  localProvider={localProvider}
                  userSigner={userSigner}
                  mainnetProvider={mainnetProvider}
                  price={price}
                  web3Modal={web3Modal}
                  loadWeb3Modal={loadWeb3Modal}
                  logoutOfWeb3Modal={logoutOfWeb3Modal}
                  blockExplorer={blockExplorer}
                />
              </div>
            </div>
          </Header>

          <ContractUI
            customContract={loadedContract}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            userSigner={userSigner}
            localProvider={localProvider}
            mainnetProvider={mainnetProvider}
            blockExplorer={selectedNetwork.blockExplorer}
            setLoadedContract={setLoadedContract}
            setSelectedNetwork={setSelectedNetwork}
            loadWeb3Modal={loadWeb3Modal}
            web3Modal={web3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            price={price}
          />
        </div>
        <div
          className="eth-info-faucet"
          style={{
            position: "fixed",
            textAlign: "left",
            bottom: 20,
            padding: 10,
            right: "0px",
          }}
        >
          <Row align="middle" gutter={[4, 4]}>
            <Col span={24}>
              {faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )}
            </Col>
          </Row>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
