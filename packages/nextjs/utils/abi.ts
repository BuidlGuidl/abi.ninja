import { isZeroAddress } from "./scaffold-eth/common";
import { Abi, Address, Chain, isAddress, toFunctionSelector } from "viem";

export const fetchContractABIFromSourcify = async (contractAddress: Address, chainId: number) => {
  try {
    // Sourcify API endpoint for fetching contract metadata
    // First try with fields parameter to get ABI directly
    let sourcifyUrl = `https://sourcify.dev/server/v2/contract/${chainId}/${contractAddress}?fields=abi`;
    let response = await fetch(sourcifyUrl);

    // If that doesn't work, try without fields parameter to get full metadata
    if (!response.ok || response.status === 404) {
      sourcifyUrl = `https://sourcify.dev/server/v2/contract/${chainId}/${contractAddress}`;
      response = await fetch(sourcifyUrl);
    }

    if (!response.ok) {
      throw new Error(`Sourcify API returned status ${response.status}`);
    }

    const data = await response.json();

    // Check if contract is verified
    // API v2 returns: match/creationMatch/runtimeMatch can be "match", "exact_match", or null
    // For backward compatibility, also check old format: status can be "perfect" or "partial"
    const isVerified =
      data.match === "match" ||
      data.match === "exact_match" ||
      data.creationMatch === "match" ||
      data.creationMatch === "exact_match" ||
      data.runtimeMatch === "match" ||
      data.runtimeMatch === "exact_match" ||
      data.status === "perfect" ||
      data.status === "partial";

    if (!data || !isVerified) {
      const statusInfo = data?.match || data?.creationMatch || data?.runtimeMatch || data?.status || "missing";
      throw new Error(`Contract not verified on Sourcify (status: ${statusInfo})`);
    }

    // Extract ABI from the response
    let abi: Abi | null = null;
    let implementation: Address | null = null;

    // First, check if ABI is directly in the response (API v2 format)
    if (data.abi && Array.isArray(data.abi)) {
      abi = data.abi;
    } else if (data.abi && typeof data.abi === "string") {
      // If ABI is a string, try to parse it
      try {
        abi = JSON.parse(data.abi);
      } catch (e) {
        // If parsing fails, continue to other methods
      }
    }

    // Extract implementation address from proxyResolution if available
    if (data.proxyResolution?.isProxy && data.proxyResolution?.implementations?.length > 0) {
      const firstImplementation = data.proxyResolution.implementations[0];
      if (firstImplementation?.address && isAddress(firstImplementation.address)) {
        implementation = firstImplementation.address as Address;
      }
    }

    // If not found, look in compilation.stdJsonOutput (API v2 format)
    if (!abi && data.compilation?.stdJsonOutput?.contracts) {
      const contracts = data.compilation.stdJsonOutput.contracts;
      // Try to find ABI in any contract
      for (const contractGroup of Object.values(contracts) as any[]) {
        for (const contract of Object.values(contractGroup) as any[]) {
          if (contract.abi && Array.isArray(contract.abi)) {
            abi = contract.abi;
            break;
          }
        }
        if (abi) break;
      }
    }

    // Fallback: look in metadata if available
    if (!abi && data.metadata) {
      try {
        const metadata = typeof data.metadata === "string" ? JSON.parse(data.metadata) : data.metadata;

        if (metadata.output?.abi && Array.isArray(metadata.output.abi)) {
          abi = metadata.output.abi;
        }
      } catch (parseError) {
        console.error("Error parsing Sourcify metadata:", parseError);
      }
    }

    if (!abi || !Array.isArray(abi) || abi.length === 0) {
      throw new Error("No ABI found in Sourcify response");
    }

    return {
      abi,
      implementation,
    };
  } catch (error) {
    console.error("Error fetching ABI from Sourcify:", error);
    throw error;
  }
};

export const fetchFunctionSignatureFrom4Bytes = async (hexSignature: string): Promise<string[]> => {
  try {
    // Use Sourcify's 4bytes API
    const response = await fetch(
      `https://api.4byte.sourcify.dev/signature-database/v1/lookup?function=${hexSignature}&filter=true`,
    );

    if (!response.ok) {
      throw new Error(`4bytes API returned status ${response.status}`);
    }

    const data = await response.json();

    // Sourcify API returns {ok: true, result: {function: {[hash]: [...]}, event: {...}}}
    // Function results can be null (no matches) or an array of signatures
    if (data?.ok && data.result?.function && data.result.function[hexSignature]) {
      const signatures = data.result.function[hexSignature];
      // Returns null for no matches (openchain.xyz compatible), or array of {name, filtered, hasVerifiedContract}
      if (Array.isArray(signatures)) {
        return signatures.map((sig: any) => sig.name);
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching function signature from 4bytes:", error);
    return [];
  }
};

export const fetchEventSignatureFrom4Bytes = async (hexSignature: string): Promise<string[]> => {
  try {
    // Use Sourcify's 4bytes API
    const response = await fetch(
      `https://api.4byte.sourcify.dev/signature-database/v1/lookup?event=${hexSignature}&filter=true`,
    );

    if (!response.ok) {
      throw new Error(`4bytes API returned status ${response.status}`);
    }

    const data = await response.json();

    // Sourcify API returns {ok: true, result: {function: {...}, event: {[hash]: [...]}}}
    // Event results are always arrays (empty array for no matches)
    if (data?.ok && data.result?.event && data.result.event[hexSignature]) {
      const signatures = data.result.event[hexSignature];
      if (Array.isArray(signatures)) {
        return signatures.map((sig: any) => sig.name);
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching event signature from 4bytes:", error);
    return [];
  }
};

export const enhanceAbiWith4Bytes = async (abi: Abi): Promise<Abi> => {
  const enhancedAbi = [...abi];

  // Process each function in the ABI
  for (let i = 0; i < enhancedAbi.length; i++) {
    const item = enhancedAbi[i];

    if (item.type === "function" && item.name && item.inputs) {
      try {
        // Calculate the function selector from the current signature
        const currentSignature = `${item.name}(${item.inputs.map((input: any) => input.type).join(",")})`;
        const selector = toFunctionSelector(currentSignature);

        // Look up in 4bytes directory to get better function names
        const signatures = await fetchFunctionSignatureFrom4Bytes(selector);

        if (signatures.length > 0) {
          // Use the first (most common) signature
          const matchedSignature = signatures[0];
          const match = matchedSignature.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);

          if (match && match[1] && match[1] !== item.name) {
            // Only update if we found a better name
            // Parse the matched signature to potentially update inputs too
            const paramMatch = matchedSignature.match(/\(([^)]*)\)/);
            if (paramMatch) {
              // Update function name with better name from 4bytes
              enhancedAbi[i] = {
                ...item,
                name: match[1],
              };
            }
          }
        }
      } catch (error) {
        // If lookup fails, keep original ABI item
      }
    }
  }

  return enhancedAbi;
};

export const fetchContractABIFromEtherscan = async (verifiedContractAddress: Address, chainId: number) => {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_V2_API_KEY;

  // First call to get source code and check for implementation
  const sourceCodeUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${verifiedContractAddress}&apikey=${apiKey}`;

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
    const abiUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getabi&address=${implementation}&apikey=${apiKey}`;
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

export const getNetworkName = (chains: Chain[], chainId: number) => {
  const chain = chains.find(chain => chain.id === chainId);
  return chain ? chain.name : "Unknown Network";
};
