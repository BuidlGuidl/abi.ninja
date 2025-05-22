import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

type ContractCreationInfo = {
  blockNumber: string;
  txHash: string;
};

type UseFetchContractCreationInfoParams = {
  contractAddress: Address;
  chainId: number;
};

const useFetchContractCreationInfo = ({ contractAddress, chainId }: UseFetchContractCreationInfoParams) => {
  const fetchContractCreation = async (): Promise<ContractCreationInfo> => {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_V2_API_KEY;
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${apiKey}`,
    );
    const data = await response.json();

    if (data.status !== "1" || !data.result || data.result.length === 0) {
      throw new Error("Failed to fetch contract creation data");
    }

    const creationInfo = data.result[0];
    return {
      blockNumber: creationInfo.blockNumber,
      txHash: creationInfo.txHash,
    };
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["contractCreationInfo", { contractAddress, chainId }],
    queryFn: fetchContractCreation,
    enabled: Boolean(contractAddress) && chainId !== 31337,
    retry: false,
  });

  return {
    contractCreationInfo: data,
    error,
    isLoading,
  };
};

export default useFetchContractCreationInfo;
