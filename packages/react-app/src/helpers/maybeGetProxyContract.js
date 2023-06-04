import { ethers } from "ethers";
import { loadContractEtherscan } from "./loadContractEtherscan";

const proxyTypeSlotLocationMap = {
  "EIP-1967": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
  "Open Zeppelin": "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3",
};

export const supportedProxies = () => {
  return Object.keys(proxyTypeSlotLocationMap);
};

export const maybeGetProxyContract = async (contractAddress, type, network, userSigner) => {
  const slot = await userSigner.getStorageAt(contractAddress, proxyTypeSlotLocationMap[type]);

  let contract = null;

  if (slot !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
    // convert to a 20 byte hex string, for a valid address
    const implementationContractAddress = ethers.utils.hexStripZeros(slot);
    let proxyContract = await loadContractEtherscan(implementationContractAddress, network, userSigner);
    contract = new ethers.Contract(contractAddress, proxyContract.interface, userSigner);
    contract.isProxy = true;
    contract.proxyType = type;
    contract.proxyImplementationAddress = implementationContractAddress;
  }

  return contract;
};
