import { useReducer } from "react";
import { ContractReadMethods } from "./ContractReadMethods";
import { ContractVariables } from "./ContractVariables";
import { ContractWriteMethods } from "./ContractWriteMethods";
import { Abi } from "viem";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

type ContractUIProps = {
  className?: string;
  deployedContractData: { address: string; abi: Abi };
};

const mainNetworks = getTargetNetworks();

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ className = "", deployedContractData }: ContractUIProps) => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const mainChainId = useAbiNinjaState(state => state.mainChainId);
  const mainNetwork = mainNetworks.find(network => network.id === mainChainId);
  const networkColor = useNetworkColor(mainNetwork);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0 ${className}`}>
      <div className="col-span-5 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-white border shadow-xl rounded-2xl px-6 lg:px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <span className="font-bold">Contract Data</span>
                <Address address={deployedContractData.address} />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">Balance:</span>
                  <Balance address={deployedContractData.address} className="h-1.5 min-h-[0.375rem] px-0" />
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
              deployedContractData={deployedContractData}
            />
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
          <div className="z-10">
            <div className="bg-white rounded-2xl shadow-xl border flex flex-col mt-10 relative">
              <div className="h-[5rem] w-[5.5rem] bg-secondary absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm font-bold">Read</p>
                </div>
              </div>
              <div className="divide-y divide-base-300 p-5">
                <ContractReadMethods deployedContractData={deployedContractData} />
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
                  deployedContractData={deployedContractData}
                  onChange={triggerRefreshDisplayVariables}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
