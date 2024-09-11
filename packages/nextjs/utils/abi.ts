import { NETWORKS_EXTRA_DATA } from "./scaffold-eth";

export const fetchContractABIFromEtherscan = async (verifiedContractAddress: string, chainId: number) => {
  const chain = NETWORKS_EXTRA_DATA[chainId];

  if (!chain || !chain.etherscanEndpoint)
    throw new Error(`ChainId ${chainId} not found in supported etherscan networks`);

  const apiKey = chain.etherscanApiKey ?? "";
  const apiKeyUrlParam = apiKey.trim().length > 0 ? `&apikey=${apiKey}` : "";

  // First call to get source code and check for implementation
  const sourceCodeUrl = `${chain.etherscanEndpoint}/api?module=contract&action=getsourcecode&address=${verifiedContractAddress}${apiKeyUrlParam}`;

  const sourceCodeResponse = await fetch(sourceCodeUrl);
  const sourceCodeData = await sourceCodeResponse.json();

  if (sourceCodeData.status !== "1" || !sourceCodeData.result || sourceCodeData.result.length === 0) {
    console.error("Error fetching source code from Etherscan:", sourceCodeData);
    throw new Error("Failed to fetch source code from Etherscan");
  }

  const contractData = sourceCodeData.result[0];
  const implementation = contractData.Implementation || null;

  // If there's an implementation address, make a second call to get its ABI
  if (implementation && implementation !== "0x0000000000000000000000000000000000000000") {
    const abiUrl = `${chain.etherscanEndpoint}/api?module=contract&action=getabi&address=${implementation}${apiKeyUrlParam}`;
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
