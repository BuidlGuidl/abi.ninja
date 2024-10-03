import { NETWORKS_EXTRA_DATA } from "./scaffold-eth";
import { isZeroAddress } from "./scaffold-eth/common";
import { Address } from "viem";
import * as chains from "viem/chains";

const findChainById = (chainId: number): chains.Chain => {
  const chainEntries = Object.entries(chains as Record<string, chains.Chain>);

  for (const [, chain] of chainEntries) {
    if (chain.id === chainId) {
      return chain;
    }
  }

  throw new Error(`No chain found with ID ${chainId}`);
};

const getEtherscanApiKey = (chainId: number): string => {
  const networkData = NETWORKS_EXTRA_DATA[chainId];

  if (!networkData || !networkData.etherscanApiKey) {
    console.warn(`No API key found for chain ID ${chainId}`);
    return "";
  }

  return networkData.etherscanApiKey;
};

export const fetchContractABIFromEtherscan = async (verifiedContractAddress: Address, chainId: number) => {
  const chain = findChainById(chainId);

  if (!chain || !chain.blockExplorers?.default?.apiUrl) {
    throw new Error(`ChainId ${chainId} not found in supported networks or missing block explorer API URL`);
  }

  const apiKey = getEtherscanApiKey(chainId);
  const apiKeyUrlParam = apiKey.trim().length > 0 ? `&apikey=${apiKey}` : "";

  // First call to get source code and check for implementation
  const sourceCodeUrl = `${chain.blockExplorers.default.apiUrl}?module=contract&action=getsourcecode&address=${verifiedContractAddress}${apiKeyUrlParam}`;

  const sourceCodeResponse = await fetch(sourceCodeUrl);
  const sourceCodeData = await sourceCodeResponse.json();

  if (sourceCodeData.status !== "1" || !sourceCodeData.result || sourceCodeData.result.length === 0) {
    console.error("Error fetching source code from Etherscan:", sourceCodeData);
    throw new Error("Failed to fetch source code from Etherscan");
  }

  const contractData = sourceCodeData.result[0];
  const implementation = contractData.Implementation || null;

  // If there's an implementation address, make a second call to get its ABI
  if (implementation && !isZeroAddress(implementation)) {
    const abiUrl = `${chain.blockExplorers.default.apiUrl}?module=contract&action=getabi&address=${implementation}${apiKeyUrlParam}`;
    const abiResponse = await fetch(abiUrl);
    const abiData = await abiResponse.json();

    if (abiData.status === "1" && abiData.result) {
      return {
        abi: JSON.parse(abiData.result),
        implementation,
      };
    } else {
      console.error("Error fetching ABI for implementation from Etherscan:", abiData);
      throw new Error("Failed to fetch ABI for implementation from Etherscan");
    }
  }

  // If no implementation or failed to get implementation ABI, return original contract ABI
  return {
    abi: JSON.parse(contractData.ABI),
    implementation,
  };
};

export function parseAndCorrectJSON(input: string): any {
  // Add double quotes around keys
  let correctedJSON = input.replace(/(\w+)(?=\s*:)/g, '"$1"');

  // Remove trailing commas
  correctedJSON = correctedJSON.replace(/,(?=\s*[}\]])/g, "");

  try {
    return JSON.parse(correctedJSON);
  } catch (error) {
    console.error("Failed to parse JSON", error);
    throw new Error("Failed to parse JSON");
  }
}
