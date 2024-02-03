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
    ((deployedContractData.abi || []) as Abi).filter(part => part.type === "function") as AbiFunction[]
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
    return <span className="font-light text-gray-500">Please select read methods from the sidebar.</span>;
  }

  return (
    <>
      {functionsToDisplay.map(({ fn, inheritedFrom }) => (
        <div key={fn.name} className="relative mb-4">
          <ReadOnlyFunctionForm
            abi={deployedContractData.abi as Abi}
            contractAddress={deployedContractData.address}
            abiFunction={fn}
            inheritedFrom={inheritedFrom}
          />
          <button onClick={() => removeMethod(fn.name)} className="absolute top-1 right-0 btn btn-ghost btn-xs">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </>
  );
};
