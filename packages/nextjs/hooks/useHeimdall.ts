import { useQuery } from "@tanstack/react-query";
import { Address, isAddress } from "viem";
import { HEIMDALL_API_URL } from "~~/utils/constants";

type UseHeimdallParams = {
  contractAddress?: Address;
  rpcUrl?: string;
  disabled?: boolean;
};

export const useHeimdall = ({ contractAddress, rpcUrl, disabled = false }: UseHeimdallParams) => {
  const fetchFromHeimdall = async () => {
    if (!contractAddress || !isAddress(contractAddress)) {
      throw new Error("Invalid contract address");
    }
    if (!rpcUrl) {
      throw new Error("RPC URL is required");
    }

    const rpcUrlWithoutHttps = rpcUrl.substring(8);
    const response = await fetch(`${HEIMDALL_API_URL}/${contractAddress}?rpc_url=${rpcUrlWithoutHttps}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const abi = await response.json();

    if (!Array.isArray(abi) || abi.length === 0) {
      throw new Error("Failed to fetch ABI from Heimdall");
    }

    return abi;
  };

  const {
    data: abi,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["heimdallAbi", { contractAddress, rpcUrl }],
    queryFn: fetchFromHeimdall,
    enabled: !disabled && Boolean(contractAddress) && Boolean(rpcUrl) && isAddress(contractAddress as Address),
    // Heimdall 500s intermittently on cold decompiles; retry those once, but don't
    // double the wait on deterministic failures (4xx, empty-ABI result).
    retry: (failureCount, error) => failureCount < 1 && /status: 5\d\d/.test(error.message),
  });

  return {
    abi,
    error,
    isLoading,
    refetch,
  };
};
