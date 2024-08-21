import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import { UsePublicClientReturnType } from "wagmi";
import { fetchContractABIFromAnyABI, fetchContractABIFromEtherscan } from "~~/utils/abi";
import { detectProxyTarget } from "~~/utils/abi-ninja/proxyContracts";

const ANYABI_TIMEOUT = 3000;

type FetchContractAbiParams = {
  contractAddress: string;
  chainId: number;
  publicClient: UsePublicClientReturnType;
  disabled?: boolean;
};

const useFetchContractAbi = ({ contractAddress, chainId, publicClient, disabled = false }: FetchContractAbiParams) => {
  const [implementationAddress, setImplementationAddress] = useState<string | null>(null);

  const fetchAbi = async () => {
    if (!isAddress(contractAddress)) {
      throw new Error("Invalid contract address");
    }

    let addressToUse: string = contractAddress;
    try {
      const implAddress = await detectProxyTarget(contractAddress, publicClient);
      if (implAddress) {
        setImplementationAddress(implAddress);
      }

      addressToUse = implAddress || contractAddress;

      // Create a promise that resolves after ANYABI_TIMEOUT
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AnyABI request timed out")), ANYABI_TIMEOUT);
      });

      // Race between the AnyABI fetch and the timeout
      const abi = await Promise.race([fetchContractABIFromAnyABI(addressToUse, chainId), timeoutPromise]);

      if (!abi) throw new Error("Got empty or undefined ABI from AnyABI");

      return { abi, address: addressToUse };
    } catch (error) {
      console.error("Error or timeout fetching ABI from AnyABI: ", error);
      console.log("Falling back to Etherscan...");

      const abiString = await fetchContractABIFromEtherscan(addressToUse, chainId);
      const parsedAbi = JSON.parse(abiString);

      return { abi: parsedAbi, address: contractAddress };
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["contractAbi", { contractAddress, chainId: chainId }],
    queryFn: fetchAbi,
    enabled: !disabled && isAddress(contractAddress) && chainId !== 31337,
    retry: false,
  });

  return {
    contractData: data,
    error,
    isLoading,
    implementationAddress,
  };
};

export default useFetchContractAbi;
