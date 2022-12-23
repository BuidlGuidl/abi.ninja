import { loadContractRaw } from "./loadContractRaw";
import { loadContractEtherscan } from "./loadContractEtherscan";
import { NETWORKS } from "../constants";

export const loadContractFromUrl = async (
  address,
  urlNetworkName,
  setSelectedNetwork,
  userSigner,
  localProvider,
  rawQueryParams,
) => {
  const network = urlNetworkName ? NETWORKS[urlNetworkName] : NETWORKS.mainnet;

  if (!network) {
    throw new Error(`${urlNetworkName} is not a valid network`);
  }

  if (!userSigner && !localProvider) {
    return;
  }

  // Different scenarios when loading a contract from URL:
  // 1. Wallet not connected (using provider)
  //   1.1 Need to set the network with setSelectedNetwork.
  //   1.2 Load contract
  if (!userSigner && localProvider._network.chainId !== network.chainId) {
    setSelectedNetwork(network);
    return;
  }

  // 2. Wallet connected
  //   2.1 In the wrong network
  //     2.1.1 Use provider until they switch vs Make the user switch before loading
  //   2.2 In the right network
  //     2.2.1 Load contract.
  if (userSigner && userSigner.provider?._network.chainId !== network.chainId) {
    // Wallet connected in the wrong network.
    throw new Error(`Switch your wallet to ${network.name}`);
  }

  // 3. Wallet not connected & Provider not initialized yet
  //   3.1 Return.

  let contract;
  try {
    const providerOrSigner = userSigner ?? localProvider;

    // Check if ABI
    const queryParams = new URLSearchParams(rawQueryParams);
    const abiUrl = queryParams.get("abi");
    if (abiUrl) {
      contract = await loadContractRaw(address, decodeURIComponent(abiUrl), network, providerOrSigner);
    } else {
      contract = await loadContractEtherscan(address, network, providerOrSigner);
    }
  } catch (e) {
    throw new Error(e.message);
  }

  return contract;
};
