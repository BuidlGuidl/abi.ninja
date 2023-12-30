import { NETWORKS_EXTRA_DATA, getTargetNetworks } from "./scaffold-eth";

export const fetchContractABIFromEtherscan = async (verifiedContractAddress: string, chainId: number) => {
  const chain = NETWORKS_EXTRA_DATA[chainId];

  if (!chain || (chain && !chain.etherscanApiKey) || !chain.etherscanEndpoint)
    throw new Error(`ChainId ${chainId} not found in NETWORKS_EXTRA_DATA`);

  const apiKey = chain.etherscanApiKey;
  const url = `${chain.etherscanEndpoint}/api?module=contract&action=getabi&address=${verifiedContractAddress}&apikey=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "1") {
    return data.result;
  } else {
    console.error("Got non-1 status from Etherscan API", data);
    if (data.result) throw new Error(data.result);
    throw new Error("Got non-1 status from Etherscan API");
  }
};

export const getNetworksWithEtherscanApi = () => {
  return getTargetNetworks().filter(network => network.etherscanApiKey);
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
