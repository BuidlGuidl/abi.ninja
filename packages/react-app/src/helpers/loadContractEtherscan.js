import { ethers } from "ethers";
import { init as etherscanInit } from "etherscan-api";
import axios from "axios";
import { NETWORKS } from "../constants";
import { maybeGetProxyContract, supportedProxies } from "./maybeGetProxyContract";

export const loadContractEtherscan = async (address, selectedNetwork, userSigner) => {
  if (!ethers.utils.isAddress(address)) {
    throw new Error("Invalid Contract Address");
  }

  if (!NETWORKS[selectedNetwork.name]?.etherscanEndpoint) {
    throw new Error("Invalid Network");
  }

  const timeout = 10000;
  const client = axios.create({
    baseURL: NETWORKS[selectedNetwork.name]?.etherscanEndpoint,
    timeout: timeout,
  });
  const etherscanClient = etherscanInit(NETWORKS[selectedNetwork.name].apiKey, selectedNetwork.name, timeout, client);

  let response;
  try {
    response = await etherscanClient.contract.getabi(address);
  } catch (e) {
    throw new Error(`Etherscan API: ${e}`);
  }

  if (response.status !== "1") {
    throw new Error("Can't fetch data from Etherscan. Ensure the contract is verified.");
  }

  const contractAbi = response.result;
  let contract = new ethers.Contract(address, contractAbi, userSigner);

  const proxies = supportedProxies();

  var proxyContract = null;
  for (let i = 0; i < proxies.length && proxyContract === null; ++i) {
    proxyContract = await maybeGetProxyContract(address, proxies[i], selectedNetwork, userSigner);
  }

  return proxyContract ?? contract;
};
