import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { Abi, isAddress } from "viem";
import * as chains from "viem/chains";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Footer } from "~~/components/Footer";
import { MiniHeader } from "~~/components/MiniHeader";
import { Spinner } from "~~/components/assets/Spinner";
import { ContractUI } from "~~/components/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { fetchContractABIFromEtherscan } from "~~/utils/abi";

interface ParsedQueryContractDetailsPage extends ParsedUrlQuery {
  contractAddress: string;
  network: string;
}

type ContractData = {
  abi: Abi;
  address: string;
};

const ContractDetailPage = () => {
  const router = useRouter();
  const { contractAddress, network } = router.query as ParsedQueryContractDetailsPage;
  const [contractData, setContractData] = useState<ContractData>({ abi: [], address: contractAddress });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contractName = contractData.address;
  const setMainChainId = useAbiNinjaState(state => state.setMainChainId);

  const getNetworkName = (chainId: string) => {
    const chain = Object.values(chains).find(chain => chain.id === parseInt(chainId));
    return chain ? chain.name : "Unknown Network";
  };

  useEffect(() => {
    if (network) {
      setMainChainId(parseInt(network));
    }
  }, [network, setMainChainId]);

  useEffect(() => {
    const fetchContractAbi = async () => {
      try {
        const abi = await fetchContractABIFromEtherscan(contractAddress, parseInt(network));
        setContractData({ abi: JSON.parse(abi), address: contractAddress });
        setError(null);
        setIsLoading(false);
      } catch (e: any) {
        setError(e.message);
        setIsLoading(false);
      }
    };

    if (isAddress(contractAddress)) {
      fetchContractAbi();
    }
  }, [contractAddress, network]);

  return (
    <div className="bg-base-100 min-h-screen">
      <MiniHeader />
      <div className="flex flex-col gap-y-6 lg:gap-y-8 justify-center items-center">
        {isLoading ? (
          <Spinner />
        ) : contractData.abi?.length > 0 ? (
          <ContractUI key={contractName} deployedContractData={contractData} />
        ) : (
          <div className="bg-white border shadow-xl rounded-2xl px-6 lg:px-8 m-4">
            <ExclamationTriangleIcon className="text-red-500 mt-4 h-8 w-8" />
            <h2 className="text-2xl pt-2 flex items-end">{error}</h2>
            <p className="break-all">
              There was an error loading the contract <strong>{contractAddress}</strong> on{" "}
              <strong>{getNetworkName(network)}</strong>.
            </p>
            <p className="pb-2">Make sure the data is correct and you are connected to the right network.</p>

            <button className="btn btn-primary text-center p-2 text-base border-2 mb-4">
              <Link href="/">
                <a>Go back to homepage</a>
              </Link>
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ContractDetailPage;
