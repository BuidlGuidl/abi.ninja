import { NETWORKS_EXTRA_DATA, getTargetNetworks } from "./scaffold-eth";

export const fetchContractABIFromAnyABI = async (verifiedContractAddress: string, chainId: number) => {
  const chain = getTargetNetworks().find(network => network.id === chainId);

  if (!chain) throw new Error(`ChainId ${chainId} not found in supported networks`);

  const url = `https://anyabi.xyz/api/get-abi/${chainId}/${verifiedContractAddress}`;

  const response = await fetch(url);
  const data = await response.json();
  if (data.abi) {
    return data.abi;
  } else {
    console.error("Could not fetch ABI from AnyABI:", data.error);
    return;
  }
};

export const fetchContractABIFromEtherscan = async (verifiedContractAddress: string, chainId: number) => {
  const chain = NETWORKS_EXTRA_DATA[chainId];

  if (!chain || !chain.etherscanEndpoint)
    throw new Error(`ChainId ${chainId} not found in supported etherscan networks`);

  const apiKey = chain.etherscanApiKey ?? "";
  const apiKeyUrlParam = apiKey.trim().length > 0 ? `&apikey=${apiKey}` : "";
  const url = `${chain.etherscanEndpoint}/api?module=contract&action=getabi&address=${verifiedContractAddress}${apiKeyUrlParam}`;

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
