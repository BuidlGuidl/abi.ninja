import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchContractABIFromAnyABI, fetchContractABIFromEtherscan } from "~~/utils/abi";
import { detectProxyTarget } from "~~/utils/abi-ninja/proxyContracts";

const ANYABI_TIMEOUT = 3000;

const useFetchContractAbi = (contractAddress: string, parsedNetworkId: number, publicClient: any) => {
  const [implementationAddress, setImplementationAddress] = useState<string | null>(null);

  const fetchAbi = async () => {
    try {
      const implAddress = await detectProxyTarget(contractAddress, publicClient);
      if (implAddress) {
        setImplementationAddress(implAddress);
      }

      const addressToUse = implAddress || contractAddress;

      // Create a promise that resolves after ANYABI_TIMEOUT
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AnyABI request timed out")), ANYABI_TIMEOUT);
      });

      // Race between the AnyABI fetch and the timeout
      const abi = await Promise.race([fetchContractABIFromAnyABI(addressToUse, parsedNetworkId), timeoutPromise]);

      if (!abi) throw new Error("Got empty or undefined ABI from AnyABI");

      return { abi, address: contractAddress };
    } catch (error) {
      console.error("Error or timeout fetching ABI from AnyABI: ", error);
      console.log("Falling back to Etherscan...");

      const abiString = await fetchContractABIFromEtherscan(contractAddress, parsedNetworkId);
      const parsedAbi = JSON.parse(abiString);
      return { abi: parsedAbi, address: contractAddress };
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["contractAbi", { contractAddress, chainId: parsedNetworkId }],
    queryFn: fetchAbi,
  });

  return {
    contractData: data,
    error,
    isLoading,
    implementationAddress,
  };
};

export default useFetchContractAbi;
