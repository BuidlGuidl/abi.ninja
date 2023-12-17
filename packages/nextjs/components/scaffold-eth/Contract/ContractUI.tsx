import { useReducer } from "react";
import { ContractReadMethods } from "./ContractReadMethods";
import { ContractVariables } from "./ContractVariables";
import { ContractWriteMethods } from "./ContractWriteMethods";
import { Spinner } from "~~/components/assets/Spinner";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type ContractUIProps = {
  className?: string;
  deployedContractData?: any; // @todo type this
  isDeployedContractLoading?: boolean;
};

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ className = "", deployedContractData, isDeployedContractLoading }: ContractUIProps) => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const { targetNetwork } = useTargetNetwork();
  const networkColor = useNetworkColor();

  if (isDeployedContractLoading) {
    return (
      <div className="mt-14">
        <Spinner width="50px" height="50px" />
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <p className="mt-14 text-3xl">{`No contract found by the name of "XXX" on chain "${targetNetwork.name}"!`}</p>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0 ${className}`}>
      <div className="col-span-5 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="mb-6 space-y-1 rounded-3xl border border-base-300 bg-base-100 px-6 py-4 shadow-md shadow-secondary lg:px-8">
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
            {targetNetwork && (
              <p className="my-0 text-sm">
                <span className="font-bold">Network</span>:{" "}
                <span style={{ color: networkColor }}>{targetNetwork.name}</span>
              </p>
            )}
          </div>
          <div className="rounded-3xl bg-base-300 px-6 py-4 shadow-lg shadow-base-300 lg:px-8">
            <ContractVariables
              refreshDisplayVariables={refreshDisplayVariables}
              deployedContractData={deployedContractData}
            />
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
          <div className="z-10">
            <div className="relative mt-10 flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-md shadow-secondary">
              <div className="absolute -left-[1px] -top-[38px] -z-10 h-[5rem] w-[5.5rem] self-start rounded-[22px] bg-base-300 py-[0.65rem] shadow-lg shadow-base-300">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Read</p>
                </div>
              </div>
              <div className="divide-y divide-base-300 p-5">
                <ContractReadMethods deployedContractData={deployedContractData} />
              </div>
            </div>
          </div>
          <div className="z-10">
            <div className="relative mt-10 flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-md shadow-secondary">
              <div className="absolute -left-[1px] -top-[38px] -z-10 h-[5rem] w-[5.5rem] self-start rounded-[22px] bg-base-300 py-[0.65rem] shadow-lg shadow-base-300">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Write</p>
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
