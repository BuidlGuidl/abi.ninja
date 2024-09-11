import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import { UsePublicClientReturnType } from "wagmi";
import { fetchContractABIFromEtherscan } from "~~/utils/abi";

type FetchContractAbiParams = {
  contractAddress: string;
  chainId: number;
  publicClient: UsePublicClientReturnType;
  disabled?: boolean;
};

const useFetchContractAbi = ({ contractAddress, chainId, disabled = false }: FetchContractAbiParams) => {
  const [implementationAddress, setImplementationAddress] = useState<string | null>(null);

  const fetchAbi = async () => {
    if (!isAddress(contractAddress)) {
      throw new Error("Invalid contract address");
    }

    const addressToUse: string = contractAddress;
    try {
      const { abi, implementation } = await fetchContractABIFromEtherscan(addressToUse, chainId);

      if (!abi) throw new Error("Got empty or undefined ABI from Etherscan");

      if (implementation && implementation !== "0x0000000000000000000000000000000000000000") {
        setImplementationAddress(implementation);
      }

      return { abi, address: addressToUse };
    } catch (error) {
      console.error("Error fetching ABI from Etherscan: ", error);
      throw error;
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
