import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { Abi, Address, isAddress } from "viem";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { MiniHeader } from "~~/components/MiniHeader";
import { formDataToChain, storeChainInLocalStorage } from "~~/components/NetworksDropdown/utils";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { ContractUI } from "~~/components/scaffold-eth";
import { useAbiNinjaState, useGlobalState } from "~~/services/store/store";
import { AbiData, fetchDataFromGetAbi2000, parseAndCorrectJSON } from "~~/utils/abi";
import { notification } from "~~/utils/scaffold-eth";

interface ParsedQueryContractDetailsPage extends ParsedUrlQuery {
  contractAddress: Address;
  network: string;
}

type ContractData = {
  abi: Abi;
  address: Address;
};

type ServerSideProps = {
  addressFromUrl: Address | null;
  chainIdFromUrl: number | null;
};

export const getServerSideProps: GetServerSideProps = async context => {
  // Assume that 'contractAddress' and 'network' cannot be arrays.
  const contractAddress = context.params?.contractAddress as Address | undefined;
  const network = context.params?.network as string | undefined;

  const formattedAddress = contractAddress && isAddress(contractAddress) ? contractAddress : null;
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
  const [localContractAbi, setLocalContractAbi] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contractName = contractData.address;
  const { chainId, setImplementationAddress, contractAbi } = useAbiNinjaState(state => ({
    chainId: state.mainChainId,
    setImplementationAddress: state.setImplementationAddress,
    contractAbi: state.contractAbi,
  }));

  const { addChain, chains } = useGlobalState(state => ({
    addChain: state.addChain,
    chains: state.chains,
  }));

  const getNetworkName = (chainId: number) => {
    const chain = Object.values(chains).find(chain => chain.id === chainId);
    return chain ? chain.name : "Unknown Network";
  };

  useEffect(() => {
    if (contractAbi.length > 0) {
      setContractData({ abi: contractAbi, address: contractAddress });
    }

    if (network) {
      const fetchContractAbi = async () => {
        if (contractAbi.length > 0) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          const abiData: AbiData = await fetchDataFromGetAbi2000(contractAddress, parseInt(network));

          const implementationAddress = abiData.implementation || null;
          if (implementationAddress) {
            setImplementationAddress(implementationAddress);
          }

          if (abiData.isDecompiled) {
            return;
          }

          setContractData({ abi: JSON.parse(abiData.abi), address: contractAddress });
          setError(null);
        } catch (error: any) {
          setError("There was an error loading the contract. Please try again.");
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
  }, [contractAddress, network, setImplementationAddress, contractAbi]);

  const handleUserProvidedAbi = () => {
    try {
      const parsedAbi = parseAndCorrectJSON(localContractAbi);
      setContractData({ abi: parsedAbi, address: contractAddress });
      notification.success("ABI successfully loaded.");
    } catch (error) {
      notification.error("Invalid ABI format. Please ensure it is a valid JSON.");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const chain = formDataToChain(formData);

    addChain(chain);
    e.currentTarget.reset();
    handleUserProvidedAbi();

    storeChainInLocalStorage(chain);
    notification.success("Custom chain successfully loaded.");
  };

  const handleDecompile = async () => {
    const abiData: AbiData = await fetchDataFromGetAbi2000(contractAddress, parseInt(network));

    const implementationAddress = abiData.implementation || null;
    if (implementationAddress) {
      setImplementationAddress(implementationAddress);
    }

    setContractData({ abi: JSON.parse(abiData.abi), address: contractAddress });

    console.log("decompile");
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
            <div className="bg-base-200 flex flex-col border shadow-xl rounded-2xl px-6 lg:px-8 m-4 overflow-auto">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="text-red-500 mt-4 h-20 w-20 pr-4" />
                <div>
                  <h2 className="text-2xl pt-2 flex items-end">{error}</h2>
                  <p className="break-all">
                    There was an error loading the contract <strong>{contractAddress}</strong> on{" "}
                    <strong>{getNetworkName(chainId)}</strong>.
                  </p>
                  <p className="pb-2">
                    Make sure the data is correct and you are connected to the right network. Or add the chain/ABI
                    below.
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-12">
                {chains.some(chain => chain.id === chainId) ? (
                  <div className="w-1/2">
                    <form
                      className="bg-base-200"
                      onSubmit={e => {
                        e.preventDefault();
                        handleUserProvidedAbi();
                      }}
                    >
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
                    <div>
                      <h3 className="font-bold text-xl">Or, Decompile</h3>
                      <div className="modal-action mt-6">
                        <button type="button" className="btn btn-primary" onClick={handleDecompile}>
                          Decompile
                        </button>
                      </div>
                    </div>
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
                          <span className="label-text">Native Currency Name</span>
                        </label>
                        <input
                          type="text"
                          name="nativeCurrencyName"
                          className="input input-bordered bg-neutral"
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Native Currency Symbol</span>
                        </label>
                        <input
                          type="text"
                          name="nativeCurrencySymbol"
                          className="input input-bordered bg-neutral"
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Native Currency Decimals</span>
                        </label>
                        <input
                          type="number"
                          name="nativeCurrencyDecimals"
                          className="input input-bordered bg-neutral"
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">RPC URL</span>
                        </label>
                        <input type="text" name="rpcUrl" className="input input-bordered bg-neutral" required />
                      </div>
                      <div className="form-control flex-row mt-4 items-center gap-4">
                        <label className="label">
                          <span className="label-text">Is Testnet?</span>
                        </label>
                        <input type="checkbox" name="testnet" className="checkbox" />
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
                          required
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
