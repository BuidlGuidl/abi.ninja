import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { Abi, isAddress } from "viem";
import * as chains from "viem/chains";
import { usePublicClient } from "wagmi";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { MiniHeader } from "~~/components/MiniHeader";
import { ContractUI } from "~~/components/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { fetchContractABIFromAnyABI, fetchContractABIFromEtherscan } from "~~/utils/abi";
import { detectProxyTarget } from "~~/utils/abi-ninja/proxyContracts";

interface ParsedQueryContractDetailsPage extends ParsedUrlQuery {
  contractAddress: string;
  network: string;
}

type ContractData = {
  abi: Abi;
  address: string;
};

type ServerSideProps = {
  addressFromUrl: string | null;
  chainIdFromUrl: number | null;
};

export const getServerSideProps: GetServerSideProps = async context => {
  // Assume that 'contractAddress' and 'network' cannot be arrays.
  const contractAddress = context.params?.contractAddress as string | undefined;
  const network = context.params?.network as string | undefined;

  const formattedAddress = contractAddress ? contractAddress : null;
  const formattedChainId = network ? parseInt(network, 10) : null;

  return {
    props: {
      addressFromUrl: formattedAddress,
      chainIdFromUrl: formattedChainId,
    },
  };
};

const ContractDetailPage = ({ addressFromUrl, chainIdFromUrl }: ServerSideProps) => {
  const router = useRouter();
  const { contractAddress, network } = router.query as ParsedQueryContractDetailsPage;
  const [contractData, setContractData] = useState<ContractData>({ abi: [], address: contractAddress });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contractName = contractData.address;
  const {
    contractAbi: storedAbi,
    setMainChainId,
    chainId,
    setImplementationAddress,
  } = useAbiNinjaState(state => ({
    contractAbi: state.contractAbi,
    setMainChainId: state.setMainChainId,
    chainId: state.mainChainId,
    setImplementationAddress: state.setImplementationAddress,
  }));

  const publicClient = usePublicClient({
    chainId: parseInt(network),
  });

  const getNetworkName = (chainId: number) => {
    const chain = Object.values(chains).find(chain => chain.id === chainId);
    return chain ? chain.name : "Unknown Network";
  };

  useEffect(() => {
    if (network) {
      let normalizedNetwork = network.toLowerCase();
      if (normalizedNetwork === "ethereum" || normalizedNetwork === "mainnet") {
        normalizedNetwork = "homestead"; // chain.network for mainnet in viem/chains
      }

      const chain = Object.values(chains).find(chain => chain.network === normalizedNetwork);

      let parsedNetworkId = 1;
      if (chain) {
        parsedNetworkId = chain.id;
      } else {
        parsedNetworkId = parseInt(network);
      }

      setMainChainId(parsedNetworkId);

      const fetchContractAbi = async () => {
        setIsLoading(true);

        if (storedAbi && storedAbi.length > 0) {
          setContractData({ abi: storedAbi, address: contractAddress });
          setError(null);
          setIsLoading(false);
          return;
        }

        const localStorageAbiStr =
          localStorage.getItem(`contractData_${parsedNetworkId}_${contractAddress}`) || undefined;
        const localStorageAbi = localStorageAbiStr ? JSON.parse(localStorageAbiStr) : null;

        if (localStorageAbi) {
          setContractData({ abi: localStorageAbi, address: contractAddress });
          setError(null);
          setIsLoading(false);
          return;
        }

        try {
          const implementationAddress = await detectProxyTarget(contractAddress, publicClient);

          if (implementationAddress) {
            setImplementationAddress(implementationAddress);
          }
          const abi = await fetchContractABIFromAnyABI(implementationAddress || contractAddress, parsedNetworkId);
          if (!abi) throw new Error("Got empty or undefined ABI from AnyABI");
          setContractData({ abi, address: contractAddress });
          setError(null);
        } catch (error: any) {
          console.error("Error fetching ABI from AnyABI: ", error);
          console.log("Trying to fetch ABI from Etherscan...");
          try {
            const abiString = await fetchContractABIFromEtherscan(contractAddress, parsedNetworkId);
            const parsedAbi = JSON.parse(abiString);
            setContractData({ abi: parsedAbi, address: contractAddress });
            setError(null);
          } catch (etherscanError: any) {
            console.error("Error fetching ABI from Etherscan: ", etherscanError);
            setError(etherscanError.message || "Error occurred while fetching ABI");
          }
        } finally {
          setIsLoading(false);
        }
      };

      if (contractAddress && network) {
        if (isAddress(contractAddress)) {
          fetchContractAbi();
        } else {
          setIsLoading(false);
          setError("Please enter a valid address");
        }
      }
    }
  }, [contractAddress, network, storedAbi, setMainChainId, setImplementationAddress, publicClient]);

  return (
    <>
      <MetaHeader address={addressFromUrl} network={chainIdFromUrl} />
      <div className="bg-base-100 h-screen flex flex-col">
        <MiniHeader />
        <div className="flex flex-col gap-y-6 lg:gap-y-8 flex-grow h-full overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center h-full mt-14">
              <span className="loading loading-spinner text-primary h-14 w-14"></span>
            </div>
          ) : contractData.abi?.length > 0 ? (
            <ContractUI key={contractName} initialContractData={contractData} />
          ) : (
            <div className="bg-white border shadow-xl rounded-2xl px-6 lg:px-8 m-4">
              <ExclamationTriangleIcon className="text-red-500 mt-4 h-8 w-8" />
              <h2 className="text-2xl pt-2 flex items-end">{error}</h2>
              <p className="break-all">
                There was an error loading the contract <strong>{contractAddress}</strong> on{" "}
                <strong>{getNetworkName(chainId)}</strong>.
              </p>
              <p className="pb-2">Make sure the data is correct and you are connected to the right network.</p>

              <button className="btn btn-primary text-center p-2 text-base border-2 mb-4">
                <Link href="/">Go back to homepage</Link>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContractDetailPage;
