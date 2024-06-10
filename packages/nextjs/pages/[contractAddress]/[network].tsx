import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { Abi, createPublicClient, defineChain, http, isAddress } from "viem";
import * as chains from "viem/chains";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { MiniHeader } from "~~/components/MiniHeader";
import { Options } from "~~/components/NetworksDropdown";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { ContractUI } from "~~/components/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { fetchContractABIFromAnyABI, fetchContractABIFromEtherscan, parseAndCorrectJSON } from "~~/utils/abi";
import { detectProxyTarget } from "~~/utils/abi-ninja/proxyContracts";
import { notification } from "~~/utils/scaffold-eth";

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
  const [localContractAbi, setLocalContractAbi] = useState("");
  const [customChains, setCustomChains] = useState<Options[]>([]);
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const customChains = JSON.parse(localStorage.getItem("customChains") || "[]");
      setCustomChains(customChains);
    }
  }, []);

  let selectedChain = Object.values(chains).find(chain => chain.id === parseInt(network));
  if (!selectedChain) {
    const customChain = customChains.find((chain: any) => chain.value === chainId);
    if (customChain) {
      // @ts-ignore
      selectedChain = defineChain({
        id: +customChain.value,
        name: customChain.label,
        nativeCurrency: {
          decimals: 18,
          name: customChain.label,
          symbol: customChain.label,
        },
        rpcUrls: {
          default: {
            http: [customChain.rpcUrl as string],
          },
          public: {
            http: [customChain.rpcUrl as string],
          },
        },
        network: customChain.label, // shouldn't be necessary according to docs, but it is
      });
    } else {
      selectedChain = Object.values(chains).find(chain => chain.id === 1);
    }
  }

  const publicClient = createPublicClient({
    chain: selectedChain,
    transport: http(),
  });

  const getNetworkName = (chainId: number) => {
    const predefinedChain = Object.values(chains).find(chain => chain.id === chainId);
    if (predefinedChain) {
      return predefinedChain.name;
    }

    const customChain = customChains.find(chain => chain.value === chainId);
    return customChain ? customChain.label : "Unknown Network";
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

        try {
          // @ts-ignore
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
  }, []);

  const handleUserProvidedAbi = () => {
    try {
      const parsedAbi = parseAndCorrectJSON(localContractAbi);
      setContractData({ abi: parsedAbi, address: contractAddress });
      notification.success("ABI successfully loaded.");
    } catch (error) {
      notification.error("Invalid ABI format. Please ensure it is a valid JSON.");
    }
  };

  const handleAddCustomChain = (newChain: any) => {
    const chainOption = {
      value: newChain.id,
      label: newChain.name,
      icon: "PuzzlePieceIcon",
      rpcUrl: newChain.rpcUrl,
    };
    const updatedChains = [...customChains, chainOption];
    setCustomChains(updatedChains);
    if (typeof window !== "undefined") {
      localStorage.setItem("customChains", JSON.stringify(updatedChains));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newChain = {
      id: parseInt(formData.get("id") as string),
      name: formData.get("name") as string,
      rpcUrl: formData.get("rpcUrl") as string,
    };
    handleAddCustomChain(newChain);
    handleUserProvidedAbi();
    e.currentTarget.reset();
  };

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
            <div className="bg-base-200 flex flex-col border shadow-xl rounded-2xl px-6 lg:px-8 m-4">
              <ExclamationTriangleIcon className="text-red-500 mt-4 h-8 w-8" />
              <h2 className="text-2xl pt-2 flex items-end">{error}</h2>
              <p className="break-all">
                There was an error loading the contract <strong>{contractAddress}</strong> on{" "}
                <strong>{getNetworkName(chainId)}</strong>.
              </p>
              <p className="pb-2">
                Make sure the data is correct and you are connected to the right network. Or add the chain/ABI below.
              </p>
              <div className="flex justify-center gap-12">
                {customChains.some(chain => chain.value === chainId) ? (
                  <div className="w-1/2">
                    <form className="bg-base-200" onSubmit={handleUserProvidedAbi}>
                      <h3 className="font-bold text-xl">Add Custom ABI</h3>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">ABI</span>
                        </label>
                        <textarea
                          className="textarea bg-neutral w-full h-full mb-4 resize-none"
                          placeholder="Paste contract ABI in JSON format here"
                          value={localContractAbi}
                          onChange={e => setLocalContractAbi(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="modal-action mt-6">
                        <button type="submit" className="btn btn-primary">
                          Submit ABI
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="w-1/2">
                    <form className="bg-base-200" onSubmit={handleSubmit}>
                      <h3 className="font-bold text-xl">Add Custom Chain and ABI</h3>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Chain ID</span>
                        </label>
                        <input type="number" name="id" className="input input-bordered bg-neutral" required />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Name</span>
                        </label>
                        <input type="text" name="name" className="input input-bordered bg-neutral" required />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">RPC URL</span>
                        </label>
                        <input type="text" name="rpcUrl" className="input input-bordered bg-neutral" required />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">ABI</span>
                        </label>
                        <textarea
                          className="textarea bg-neutral w-full h-full mb-4 resize-none"
                          placeholder="Paste contract ABI in JSON format here"
                          value={localContractAbi}
                          onChange={e => setLocalContractAbi(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="modal-action mt-6">
                        <button type="submit" className="btn btn-primary">
                          Submit Chain and Import ABI
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <button className="btn btn-ghost text-center self-end p-2 text-base border-2 mb-4">
                <Link href="/">Go back to homepage</Link>
              </button>
            </div>
          )}
        </div>
      </div>
      <SwitchTheme className="fixed bottom-3 right-6 z-50" />
    </>
  );
};

export default ContractDetailPage;
