import { ethers } from "ethers";
import { init as etherscanInit } from "etherscan-api";

const ETHERSCAN_API = process.env.REACT_APP_ETHERSCAN_API;

export const loadContractEtherscan = async (address, selectedNetwork, userSigner) => {
  if (!ethers.utils.isAddress(address)) {
    throw new Error("Invalid Contract Address");
  }
  const etherscanClient = etherscanInit(ETHERSCAN_API, selectedNetwork.name, 10000);

  let response;
  try {
    response = await etherscanClient.contract.getabi(address);
  } catch (e) {
    throw new Error(`From Etherscan API: ${e}`);
  }

  if (response.status !== "1") {
    throw new Error("Can't fetch data from Etherscan. Ensure the contract is verified.");
  }

  const contractAbi = response.result;

  return new ethers.Contract(address, contractAbi, userSigner);
};
