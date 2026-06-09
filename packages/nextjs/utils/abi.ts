import { Chain } from "viem";

// NOTE: ABI resolution (Etherscan/Sourcify/proxy/heimdall/4byte) now lives in the
// abi.ninja engine and is consumed via `useResolveAbi` (@portdeveloper/abi-ninja-sdk). The old
// client-side `fetchContractABIFromEtherscan` was removed in that refactor.

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

export const getNetworkName = (chains: Chain[], chainId: number) => {
  const chain = chains.find(chain => chain.id === chainId);
  return chain ? chain.name : "Unknown Network";
};
