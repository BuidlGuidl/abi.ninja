import { ReadOnlyFunctionForm } from "./ReadOnlyFunctionForm";
import { Abi, AbiFunction } from "abitype";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Contract, ContractName, GenericContract, InheritedFunctions } from "~~/utils/scaffold-eth/contract";

export const ContractReadMethods = ({
  deployedContractData,
  removeMethod,
}: {
  deployedContractData: Contract<ContractName>;
  removeMethod: (methodName: string) => void;
}) => {
  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = (
    ((deployedContractData.abi || []) as Abi).filter(part => part.type === "function") as (AbiFunction & {
      uid: string;
    })[]
  )
    .filter(fn => {
      const isQueryableWithParams =
        (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length > 0;
      return isQueryableWithParams;
    })
    .map(fn => {
      return {
        fn,
        inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
      };
    })
    .sort((a, b) => (b.inheritedFrom ? b.inheritedFrom.localeCompare(a.inheritedFrom) : 1));

  if (!functionsToDisplay.length) {
    return (
      <div className="py-5">
        <span className="font-light text-gray-500 my-5">Please select read methods from the sidebar.</span>
      </div>
    );
  }

  return (
    <>
      {functionsToDisplay.map(({ fn, inheritedFrom }) => (
        <div key={fn.uid} className="relative mb-4 pt-5">
          <ReadOnlyFunctionForm
            abi={deployedContractData.abi as Abi}
            contractAddress={deployedContractData.address}
            abiFunction={fn}
            inheritedFrom={inheritedFrom}
          />
          <button
            onClick={() => removeMethod(fn.uid)}
            className="absolute top-0 right-0 btn btn-ghost btn-xs mt-[21px]"
            aria-label="Remove method"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ))}
    </>
  );
};
