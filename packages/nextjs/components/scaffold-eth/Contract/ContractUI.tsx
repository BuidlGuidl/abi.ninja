import { useEffect, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/router";
import { ContractReadMethods } from "./ContractReadMethods";
import { ContractVariables } from "./ContractVariables";
import { ContractWriteMethods } from "./ContractWriteMethods";
import { AbiFunction } from "abitype";
import { Abi, Address as AddressType } from "viem";
import { useContractRead } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { MiniFooter } from "~~/components/MiniFooter";
import { Address, Balance, MethodSelector } from "~~/components/scaffold-eth";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import useFetchContractCreationInfo from "~~/hooks/useFetchContractCreationInfo";
import { useGlobalState } from "~~/services/store/store";
import { getBlockExplorerTxLink, getTargetNetworks } from "~~/utils/scaffold-eth";

type ContractUIProps = {
  className?: string;
  initialContractData: { address: AddressType; abi: Abi };
};

export interface AugmentedAbiFunction extends AbiFunction {
  uid: string;
}

const augmentMethodsWithUid = (methods: AbiFunction[]): AugmentedAbiFunction[] => {
  // Group methods by their name to identify overloaded functions
  const methodsByName: Record<string, AbiFunction[]> = {};
  methods.forEach(method => {
    if (!methodsByName[method.name]) {
      methodsByName[method.name] = [];
    }
    methodsByName[method.name].push(method);
  });

  // Process each method, adding UID with index only for overloaded functions
  const augmentedMethods: AugmentedAbiFunction[] = [];
  Object.entries(methodsByName).forEach(([, group]) => {
    if (group.length > 1) {
      // overloaded methods
      group.forEach((method, index) => {
        augmentedMethods.push({
          ...method,
          uid: `${method.name}_${index}`,
        });
      });
    } else {
      // regular methods
      augmentedMethods.push({
        ...group[0],
        uid: group[0].name,
      });
    }
  });

  return augmentedMethods;
};

const mainNetworks = getTargetNetworks();

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ className = "", initialContractData }: ContractUIProps) => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const { implementationAddress, chainId } = useGlobalState(state => ({
    chainId: state.targetNetwork.id,
    implementationAddress: state.implementationAddress,
  }));
  const mainNetwork = mainNetworks.find(network => network.id === chainId);
  const networkColor = useNetworkColor(mainNetwork);
  const router = useRouter();
  const { network } = router.query as { network?: string };

  const { contractCreationInfo, isLoading: isContractCreationLoading } = useFetchContractCreationInfo({
    contractAddress: initialContractData.address,
    chainId,
  });

  const updateUrlWithSelectedMethods = (selectedMethods: string[]) => {
    const currentQuery = new URLSearchParams(window.location.search);
    if (selectedMethods.length > 0) {
      currentQuery.set("methods", selectedMethods.join(","));
    } else {
      currentQuery.delete("methods");
    }
    const newPath = `/${initialContractData.address}/${network}`;

    router.push({ pathname: newPath, query: currentQuery.toString() }, undefined, { shallow: true });
  };

  const readMethodsWithInputsAndWriteMethods = useMemo(() => {
    return augmentMethodsWithUid(
      initialContractData.abi.filter((method): method is AbiFunction => {
        if (method.type !== "function") return false;
        if (method.stateMutability === "view" || method.stateMutability === "pure") {
          return method.inputs.length > 0;
        } else {
          return true;
        }
      }),
    );
  }, [initialContractData.abi]);

  // local abi state for for dispalying selected methods
  const [abi, setAbi] = useState<AugmentedAbiFunction[]>([]);

  const handleMethodSelect = (uid: string) => {
    const methodToAdd = readMethodsWithInputsAndWriteMethods.find(method => method.uid === uid);

    if (methodToAdd && !abi.some(method => method.uid === uid)) {
      const updatedAbi = [...abi, methodToAdd];
      setAbi(updatedAbi);
      updateUrlWithSelectedMethods(updatedAbi.map(m => m.uid));
    }
  };

  const removeMethod = (uid: string) => {
    const updatedAbi = abi.filter(method => method.uid !== uid);

    setAbi(updatedAbi);
    updateUrlWithSelectedMethods(updatedAbi.map(m => m.uid));
  };

  useEffect(() => {
    const selectedMethodNames = (router.query.methods as string)?.split(",") || [];
    const selectedMethods = readMethodsWithInputsAndWriteMethods.filter(method =>
      selectedMethodNames.includes(method.uid),
    );
    setAbi(selectedMethods as AugmentedAbiFunction[]);
  }, [router.query.methods, readMethodsWithInputsAndWriteMethods]);

  const { data: contractNameData, isLoading: isContractNameLoading } = useContractRead({
    address: initialContractData.address,
    abi: initialContractData.abi,
    chainId: chainId,
    functionName: "name",
  });

  const displayContractName = useMemo(() => {
    if (isContractNameLoading) return "Loading...";
    if (contractNameData && typeof contractNameData === "string") {
      return contractNameData;
    }
    // Default to "Contract" for errors or any other cases
    return "Contract";
  }, [isContractNameLoading, contractNameData]);

  return (
    <div className="drawer sm:drawer-open h-full">
      <input id="sidebar" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side h-full z-50 sm:z-10">
        <label htmlFor="sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-6 pr-6 pb-3 bg-base-200 h-full justify-between flex-nowrap">
          <MethodSelector
            readMethodsWithInputsAndWriteMethods={readMethodsWithInputsAndWriteMethods}
            abi={abi}
            onMethodSelect={handleMethodSelect}
            removeMethod={removeMethod}
          />
          <MiniFooter />
        </ul>
      </div>
      <div className="drawer-content flex flex-col items-center justify-center overflow-auto">
        <div className={`grid grid-cols-1 lg:grid-cols-6 w-full my-0 ${className} h-full flex-grow`}>
          <div className="col-span-6 grid grid-cols-1 gap-6 laptop:grid-cols-[repeat(13,_minmax(0,_1fr))] px-6 py-10">
            <div className="laptop:col-span-8 flex flex-col gap-6">
              <div className="z-10">
                <div className="bg-base-200 rounded-2xl shadow-xl flex flex-col mt-10 relative">
                  <div className="h-[5rem] w-[5.5rem] bg-secondary absolute self-start rounded-[22px] -top-[38px] -left-[0px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
                    <div className="flex items-center justify-center space-x-2">
                      <p className="my-0 text-sm font-bold">Read</p>
                    </div>
                  </div>
                  <div className="divide-y divide-base-300 px-5">
                    <ContractReadMethods
                      deployedContractData={{ address: initialContractData.address, abi }}
                      removeMethod={removeMethod}
                    />
                  </div>
                </div>
              </div>
              <div className="z-10">
                <div className="bg-base-200 rounded-2xl shadow-xl flex flex-col mt-10 relative">
                  <div className="h-[5rem] w-[5.5rem] bg-secondary absolute self-start rounded-[22px] -top-[38px] -left-[0px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
                    <div className="flex items-center justify-center space-x-2">
                      <p className="my-0 text-sm font-bold">Write</p>
                    </div>
                  </div>
                  <div className="divide-y divide-base-300 px-5">
                    <ContractWriteMethods
                      deployedContractData={{ address: initialContractData.address, abi }}
                      onChange={triggerRefreshDisplayVariables}
                      removeMethod={removeMethod}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="laptop:col-span-5 flex flex-col mt-10">
              <div className="bg-base-200 shadow-xl rounded-2xl px-6 mb-6 space-y-1 py-4">
                <div className="flex">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold pb-2">Contract Overview</span>
                    <div className="flex pb-1">
                      <span className="font-medium text-base mr-4"> {displayContractName} </span>
                      <Address address={initialContractData.address} />
                    </div>
                    {implementationAddress && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-base mr-4 text-green-600">Implementation Address</span>
                        <Address address={implementationAddress} />
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">Balance:</span>
                      <Balance address={initialContractData.address} className="h-1.5 min-h-[0.375rem] px-0" />
                    </div>
                  </div>
                </div>
                {mainNetwork && (
                  <p className="my-0 text-sm">
                    <span className="font-bold">Network</span>:{" "}
                    <span style={{ color: networkColor }}>
                      {mainNetwork.id == 31337 ? "Localhost" : mainNetwork.name}
                    </span>
                  </p>
                )}
                {!isContractCreationLoading && contractCreationInfo && (
                  <div className="my-0 text-sm flex items-center gap-2">
                    <span className="font-bold">Created at:</span>
                    {isContractCreationLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      contractCreationInfo && (
                        <>
                          <span>Block {contractCreationInfo.blockNumber}</span>
                          <a
                            href={getBlockExplorerTxLink(chainId, contractCreationInfo.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link no-underline"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        </>
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="bg-base-200 shadow-xl rounded-2xl px-6 py-4">
                <span className="block font-bold pb-3">Contract Data</span>
                <ContractVariables
                  refreshDisplayVariables={refreshDisplayVariables}
                  deployedContractData={initialContractData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
