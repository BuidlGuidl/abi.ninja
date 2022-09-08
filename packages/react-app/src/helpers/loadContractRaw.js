import { ethers } from "ethers";
const validateAbi = abi => Array.isArray(abi) && abi.length > 0;
const validateAddress = address => ethers.utils.isAddress(address);

export const loadContractRaw = async (address, contractAbi, selectedNetwork, userSignerOrProvider) => {
  if (!validateAddress(address)) {
    throw new Error("Invalid Contract Address");
  }

  const provider = userSignerOrProvider.provider ?? userSignerOrProvider;
  const bytecode = await provider.getCode(address);
  if (bytecode === "0x") {
    throw new Error(`There is no Contract Deployed at that address on ${selectedNetwork.name}`);
  }

  try {
    if (!validateAbi(JSON.parse(contractAbi))) {
      throw new Error("Invalid Contract ABI");
    }
  } catch (e) {
    // JSON parse error
    throw new Error("Invalid Contract ABI");
  }

  return new ethers.Contract(address, contractAbi, userSignerOrProvider);
};
