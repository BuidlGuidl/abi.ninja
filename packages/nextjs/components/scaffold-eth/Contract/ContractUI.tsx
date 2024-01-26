import { useEffect, useReducer, useState } from "react";
import router from "next/router";
import { ContractReadMethods } from "./ContractReadMethods";
import { ContractVariables } from "./ContractVariables";
import { ContractWriteMethods } from "./ContractWriteMethods";
import { AbiFunction } from "abitype";
import { Abi } from "viem";
import { HeartIcon } from "@heroicons/react/24/outline";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
import { Address, Balance, MethodSelector } from "~~/components/scaffold-eth";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

type ContractUIProps = {
  className?: string;
  initialContractData: { address: string; abi: Abi };
};

const mainNetworks = getTargetNetworks();

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ className = "", initialContractData }: ContractUIProps) => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const mainChainId = useAbiNinjaState(state => state.mainChainId);
  const mainNetwork = mainNetworks.find(network => network.id === mainChainId);
  const networkColor = useNetworkColor(mainNetwork);

  const updateUrlWithSelectedMethods = (selectedMethods: string[]) => {
    const currentQuery = new URLSearchParams(window.location.search);
    if (selectedMethods.length > 0) {
      currentQuery.set("methods", selectedMethods.join(","));
    } else {
      currentQuery.delete("methods");
    }
    const newPath = `/${initialContractData.address}/${mainChainId}`;

    router.push({ pathname: newPath, query: currentQuery.toString() }, undefined, { shallow: true });
  };

  // include all functions with inputs
  const methodsWithInputs = initialContractData.abi.filter(
    (method): method is AbiFunction =>
      method.type === "function" &&
      "inputs" in method &&
      (method.inputs.length > 0 || method.stateMutability === "payable"),
  );

  // include non-payable functions with no inputs
  const [abi, setAbi] = useState<AbiFunction[]>([]);

  const handleMethodSelect = (methodName: string) => {
    const methodToAdd = initialContractData.abi.find(
      method => method.type === "function" && "name" in method && method.name === methodName,
    ) as AbiFunction | undefined; // Cast it to AbiFunction | undefined

    if (methodToAdd && !abi.some(method => method.name === methodName)) {
      const updatedAbi = [...abi, methodToAdd];
      setAbi(updatedAbi);
      updateUrlWithSelectedMethods(updatedAbi.map(m => m.name));
    }
  };

  const removeMethod = (methodName: string) => {
    const updatedAbi = abi.filter(fn => fn.name !== methodName);
    setAbi(updatedAbi);
    updateUrlWithSelectedMethods(updatedAbi.map(m => m.name));
  };

  useEffect(() => {
    const selectedMethodNames = (router.query.methods as string)?.split(",") || [];
    const selectedMethods = initialContractData.abi.filter(
      method => method.type === "function" && "name" in method && selectedMethodNames.includes(method.name),
    ) as AbiFunction[]; // Cast it to AbiFunction[]
    setAbi(selectedMethods);
  }, [initialContractData.abi]);

  return (
    <div className="drawer sm:drawer-open h-full">
      <input id="sidebar" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side h-full z-50">
        <label htmlFor="sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-6 pr-0 bg-white h-full justify-between">
          <MethodSelector
            methodsWithInputs={methodsWithInputs}
            abi={abi}
            onMethodSelect={handleMethodSelect}
            removeMethod={removeMethod}
          />
          <div className="flex justify-center items-center gap-1 text-xs w-full pr-6">
            <div className="mb-1">
              <a href="https://github.com/scaffold-eth/se-2" target="_blank" rel="noreferrer" className="link">
                Fork me
              </a>
            </div>
            <span>·</span>
            <div className="flex justify-center items-center gap-2">
              <p className="m-0 text-center">
                Built with <HeartIcon className="inline-block h-4 w-4" /> at
              </p>
              <a
                className="flex justify-center items-center gap-1"
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
              >
                <BuidlGuidlLogo className="w-3 h-5 pb-1" />
                <span className="link">BuidlGuidl</span>
              </a>
            </div>
            <span>·</span>
            <div className="text-center">
              <a href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" target="_blank" rel="noreferrer" className="link">
                Support
              </a>
            </div>
          </div>
        </ul>
      </div>
      <div className="drawer-content flex flex-col items-center justify-center overflow-auto">
        <div className={`grid grid-cols-1 lg:grid-cols-6 w-full my-0 ${className} h-full flex-grow`}>
          <div className="col-span-6 grid grid-cols-1 gap-8 laptop:grid-cols-6 lg:gap-10 px-2 md:px-10 py-10 mx-4">
            <div className="col-span-3 flex flex-col gap-6">
              <div className="z-10">
                <div className="bg-white rounded-2xl shadow-xl border flex flex-col mt-10 relative">
                  <div className="h-[5rem] w-[5.5rem] bg-secondary absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
                    <div className="flex items-center justify-center space-x-2">
                      <p className="my-0 text-sm font-bold">Read</p>
                    </div>
                  </div>
                  <div className="divide-y divide-base-300 p-5">
                    <ContractReadMethods
                      deployedContractData={{ address: initialContractData.address, abi }}
                      removeMethod={removeMethod}
                    />
                  </div>
                </div>
              </div>
              <div className="z-10">
                <div className="bg-white rounded-2xl shadow-xl border flex flex-col mt-10 relative">
                  <div className="h-[5rem] w-[5.5rem] bg-secondary absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
                    <div className="flex items-center justify-center space-x-2">
                      <p className="my-0 text-sm font-bold">Write</p>
                    </div>
                  </div>
                  <div className="divide-y divide-base-300 p-5">
                    <ContractWriteMethods
                      deployedContractData={{ address: initialContractData.address, abi }}
                      onChange={triggerRefreshDisplayVariables}
                      removeMethod={removeMethod}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-3 flex flex-col mt-10">
              <div className="bg-white border shadow-xl rounded-2xl px-6 lg:px-8 mb-6 space-y-1 py-4">
                <div className="flex">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">Contract Data</span>
                    <Address address={initialContractData.address} />
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">Balance:</span>
                      <Balance address={initialContractData.address} className="h-1.5 min-h-[0.375rem] px-0" />
                    </div>
                  </div>
                </div>
                {mainNetwork && (
                  <p className="my-0 text-sm">
                    <span className="font-bold">Network</span>:{" "}
                    <span style={{ color: networkColor }}>{mainNetwork.name}</span>
                  </p>
                )}
              </div>
              <div className="bg-white shadow-xl rounded-2xl px-6 lg:px-8 py-4">
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
