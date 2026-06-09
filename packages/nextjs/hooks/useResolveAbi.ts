import { useMemo } from "react";
import { AbiNinja, type Provenance } from "@portdeveloper/abi-ninja-sdk";
import { useQuery } from "@tanstack/react-query";
import { Abi, Address, isAddress } from "viem";
import { ABI_NINJA_API_URL } from "~~/utils/constants";

/**
 * Resolve a contract's ABI through the abi.ninja engine (one call runs the whole
 * ladder: Etherscan → Sourcify → proxy → heimdall decompile → 4byte). Replaces the
 * old client-side `useFetchContractAbi` (Etherscan-only) + `useHeimdall` (manual
 * decompile) split: unverified contracts now resolve automatically, and we get
 * `provenance` (so the UI can flag a decompiled ABI) and the proxy implementation
 * address for free.
 */
const ninja = new AbiNinja({ baseUrl: ABI_NINJA_API_URL });

// Chains the engine resolves with its own reliable, server-side RPC (SPEC §6). For
// these, do NOT forward the browser's RPC URL — frontend keys (Alchemy, etc.) are
// commonly origin/IP-restricted and fail from the engine's server IP. Only pass an
// rpcUrl for chains the engine has no default for (e.g. user-added custom chains).
const ENGINE_NATIVE_CHAINS = new Set([1, 8453, 10, 42161, 137]);

type UseResolveAbiParams = {
  contractAddress: string;
  chainId: number;
  /** Optional RPC override — needed for custom/unknown chains the engine has no default for. */
  rpcUrl?: string;
  disabled?: boolean;
};

export const useResolveAbi = ({ contractAddress, chainId, rpcUrl, disabled = false }: UseResolveAbiParams) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["resolveAbi", { contractAddress, chainId }],
    queryFn: async () => {
      if (!isAddress(contractAddress)) throw new Error("Invalid contract address");
      const opts = rpcUrl && !ENGINE_NATIVE_CHAINS.has(chainId) ? { rpcUrl } : undefined;
      return ninja.resolveAbi(chainId, contractAddress as Address, opts);
    },
    // Local chains (31337) still use the manual paste-ABI flow, matching prior behaviour.
    enabled: !disabled && isAddress(contractAddress) && chainId !== 31337,
    retry: false,
  });

  // Memoize derived values so their references are stable across renders. The old
  // useFetchContractAbi returned react-query's `data` directly (stable); returning a
  // fresh `{ abi, address }` object each render makes every effect that depends on
  // `contractData` re-run, which caused a "Maximum update depth exceeded" loop.
  const contractData = useMemo(
    () => (data ? { abi: data.abi as Abi, address: contractAddress as Address } : undefined),
    [data, contractAddress],
  );

  return {
    contractData,
    provenance: data?.provenance as Provenance | undefined,
    implementationAddress: (data?.proxy?.resolved_implementation ?? null) as Address | null,
    isLoading,
    error,
  };
};

export default useResolveAbi;
