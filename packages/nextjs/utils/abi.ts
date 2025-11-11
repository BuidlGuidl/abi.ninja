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

export const fetchFunctionSignatureFrom4Bytes = async (
  hexSignature: string | string[],
): Promise<string[] | Record<string, string[]>> => {
  try {
    const isBatch = Array.isArray(hexSignature);
    const signatures = isBatch ? hexSignature : [hexSignature];

    if (signatures.length === 0) {
      return isBatch ? {} : [];
    }

    // Use Sourcify's 4bytes API with comma-delimited list for batch, single value for single
    const commaDelimitedHashes = signatures.join(",");
    const response = await fetch(
      `https://api.4byte.sourcify.dev/signature-database/v1/lookup?function=${encodeURIComponent(
        commaDelimitedHashes,
      )}&filter=true`,
    );

    if (!response.ok) {
      throw new Error(`4bytes API returned status ${response.status}`);
    }

    const data = await response.json();

    // Sourcify API returns {ok: true, result: {function: {[hash]: [...]}, event: {...}}}
    // Function results can be null (no matches) or an array of signatures
    if (isBatch) {
      const results: Record<string, string[]> = {};
      // Initialize all results to empty arrays
      for (const hexSig of signatures) {
        results[hexSig] = [];
      }
      // Populate results from API response
      if (data?.ok && data.result?.function) {
        for (const hexSig of signatures) {
          const sigs = data.result.function[hexSig];
          // Returns null for no matches (openchain.xyz compatible), or array of {name, filtered, hasVerifiedContract}
          if (Array.isArray(sigs)) {
            results[hexSig] = sigs.map((sig: any) => sig.name);
          }
        }
      }
      return results;
    } else {
      // Single signature lookup
      if (data?.ok && data.result?.function && data.result.function[hexSignature as string]) {
        const sigs = data.result.function[hexSignature as string];
        // Returns null for no matches (openchain.xyz compatible), or array of {name, filtered, hasVerifiedContract}
        if (Array.isArray(sigs)) {
          return sigs.map((sig: any) => sig.name);
        }
      }
      return [];
    }
  } catch (error) {
    console.error("Error fetching function signature from 4bytes:", error);
    return Array.isArray(hexSignature) ? {} : [];
  }
};

export const fetchEventSignatureFrom4Bytes = async (
  hexSignature: string | string[],
): Promise<string[] | Record<string, string[]>> => {
  try {
    const isBatch = Array.isArray(hexSignature);
    const signatures = isBatch ? hexSignature : [hexSignature];

    if (signatures.length === 0) {
      return isBatch ? {} : [];
    }

    // Use Sourcify's 4bytes API with comma-delimited list for batch, single value for single
    const commaDelimitedHashes = signatures.join(",");
    const response = await fetch(
      `https://api.4byte.sourcify.dev/signature-database/v1/lookup?event=${encodeURIComponent(
        commaDelimitedHashes,
      )}&filter=true`,
    );

    if (!response.ok) {
      throw new Error(`4bytes API returned status ${response.status}`);
    }

    const data = await response.json();

    // Sourcify API returns {ok: true, result: {function: {...}, event: {[hash]: [...]}}}
    // Event results are always arrays (empty array for no matches)
    if (isBatch) {
      const results: Record<string, string[]> = {};
      // Initialize all results to empty arrays
      for (const hexSig of signatures) {
        results[hexSig] = [];
      }
      // Populate results from API response
      if (data?.ok && data.result?.event) {
        for (const hexSig of signatures) {
          const sigs = data.result.event[hexSig];
          if (Array.isArray(sigs)) {
            results[hexSig] = sigs.map((sig: any) => sig.name);
          }
        }
      }
      return results;
    } else {
      // Single signature lookup
      if (data?.ok && data.result?.event && data.result.event[hexSignature as string]) {
        const sigs = data.result.event[hexSignature as string];
        if (Array.isArray(sigs)) {
          return sigs.map((sig: any) => sig.name);
        }
      }
      return [];
    }
  } catch (error) {
    console.error("Error fetching event signature from 4bytes:", error);
    return Array.isArray(hexSignature) ? {} : [];
  }
};

export const enhanceAbiWith4Bytes = async (abi: Abi): Promise<Abi> => {
  const enhancedAbi = [...abi];

  // Collect all function selectors and their indices for batch lookup
  const functionSelectors: Array<{ index: number; selector: string; item: any }> = [];
  const seenFunctionSelectors = new Set<string>();

  // Collect all event hashes and their indices for batch lookup
  const eventHashes: Array<{ index: number; hash: string; item: any }> = [];
  const seenEventHashes = new Set<string>();

  for (let i = 0; i < enhancedAbi.length; i++) {
    const item = enhancedAbi[i];

    if (item.type === "function") {
      try {
        let selector: string | null = null;

        // Check if this is an "Unresolved_<selector>" function from Heimdall
        // Format: "Unresolved_11cc9195" where "11cc9195" is the selector without 0x (8 hex chars = 4 bytes)
        if (item.name && item.name.startsWith("Unresolved_")) {
          const selectorMatch = item.name.match(/^Unresolved_([0-9a-fA-F]{8})$/);
          if (selectorMatch && selectorMatch[1]) {
            // Add 0x prefix to make it a valid hex selector
            selector = `0x${selectorMatch[1]}`;
          }
        }

        // If not an Unresolved function, calculate selector from signature
        if (!selector && item.name && item.inputs) {
          const currentSignature = `${item.name}(${item.inputs.map((input: any) => input.type).join(",")})`;
          selector = toFunctionSelector(currentSignature);
        }

        if (selector) {
          if (!seenFunctionSelectors.has(selector)) {
            seenFunctionSelectors.add(selector);
          }
          functionSelectors.push({ index: i, selector, item });
        }
      } catch (error) {
        // If selector calculation fails, skip this function
      }
    } else if (item.type === "event") {
      try {
        let hash: string | null = null;

        // Check if this is an "Unresolved_<hash>" event from Heimdall
        // Format: "Unresolved_<64-char-hex>" where the hash is the keccak256 hash without 0x (64 hex chars = 32 bytes)
        if (item.name && item.name.startsWith("Unresolved_")) {
          const hashMatch = item.name.match(/^Unresolved_([0-9a-fA-F]{64})$/);
          if (hashMatch && hashMatch[1]) {
            // Add 0x prefix to make it a valid hex hash
            hash = `0x${hashMatch[1]}`;
          }
        }

        // If not an Unresolved event, we could calculate hash from signature
        // For now, only handle Unresolved events
        if (hash) {
          if (!seenEventHashes.has(hash)) {
            seenEventHashes.add(hash);
          }
          eventHashes.push({ index: i, hash, item });
        }
      } catch (error) {
        // If hash extraction fails, skip this event
      }
    }
  }

  // Batch lookup all function signatures in a single API call
  if (functionSelectors.length > 0) {
    try {
      const selectors = Array.from(seenFunctionSelectors);
      const batchResults = (await fetchFunctionSignatureFrom4Bytes(selectors)) as Record<string, string[]>;

      // Process results and update ABI items
      for (const { index, selector, item } of functionSelectors) {
        const signatures = batchResults[selector] || [];

        if (signatures.length > 0) {
          // Use the first (most common) signature
          const matchedSignature = signatures[0];
          const match = matchedSignature.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);

          // Always update if:
          // 1. We found a match AND it's different from current name, OR
          // 2. Current name is an "Unresolved_*" function (from Heimdall decompilation)
          const isUnresolved = item.name && item.name.startsWith("Unresolved_");
          if (match && match[1] && (match[1] !== item.name || isUnresolved)) {
            // Parse the matched signature to potentially update inputs too
            const paramMatch = matchedSignature.match(/\(([^)]*)\)/);
            if (paramMatch) {
              // Update function name with better name from 4bytes
              enhancedAbi[index] = {
                ...item,
                name: match[1],
              };
            }
          }
        }
      }
    } catch (error) {
      // If batch lookup fails, keep original ABI items
      console.error("Error in batch 4bytes function lookup:", error);
    }
  }

  // Batch lookup all event signatures in a single API call
  if (eventHashes.length > 0) {
    try {
      const hashes = Array.from(seenEventHashes);
      const batchResults = (await fetchEventSignatureFrom4Bytes(hashes)) as Record<string, string[]>;

      // Process results and update ABI items
      for (const { index, hash, item } of eventHashes) {
        const signatures = batchResults[hash] || [];

        if (signatures.length > 0) {
          // Use the first (most common) signature
          const matchedSignature = signatures[0];
          const match = matchedSignature.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);

          // Always update if:
          // 1. We found a match AND it's different from current name, OR
          // 2. Current name is an "Unresolved_*" event (from Heimdall decompilation)
          const isUnresolved = item.name && item.name.startsWith("Unresolved_");
          if (match && match[1] && (match[1] !== item.name || isUnresolved)) {
            // Update event name with better name from 4bytes
            enhancedAbi[index] = {
              ...item,
              name: match[1],
            };
          }
        }
      }
    } catch (error) {
      // If batch lookup fails, keep original ABI items
      console.error("Error in batch 4bytes event lookup:", error);
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
