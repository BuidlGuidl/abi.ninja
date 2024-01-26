import { WriteOnlyFunctionForm } from "./WriteOnlyFunctionForm";
import { Abi, AbiFunction } from "abitype";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Contract, ContractName, GenericContract, InheritedFunctions } from "~~/utils/scaffold-eth/contract";

export const ContractWriteMethods = ({
  onChange,
  deployedContractData,
  removeMethod,
}: {
  onChange: () => void;
  deployedContractData: Contract<ContractName>;
  removeMethod: (methodName: string) => void;
}) => {
  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = (
    (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
  )
    .filter(fn => {
      const isWriteableFunction = fn.stateMutability !== "view" && fn.stateMutability !== "pure";
      return isWriteableFunction;
    })
    .map(fn => {
      return {
        fn,
        inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
      };
    })
    .sort((a, b) => (b.inheritedFrom ? b.inheritedFrom.localeCompare(a.inheritedFrom) : 1));

  if (!functionsToDisplay.length) {
    return <>Please add a write method.</>;
  }

  console.log("functionsToDisplay", functionsToDisplay);

  return (
    <>
      {functionsToDisplay.map(({ fn, inheritedFrom }, idx) => (
        <div key={`${fn.name}-${idx}`} className="relative mb-4">
          <WriteOnlyFunctionForm
            abi={deployedContractData.abi as Abi}
            abiFunction={fn}
            onChange={onChange}
            contractAddress={deployedContractData.address}
            inheritedFrom={inheritedFrom}
          />
          <button
            onClick={() => removeMethod(fn.name)}
            className="absolute top-0 right-0 p-1 rounded-full text-sm focus:outline-none text-gray-500 hover:text-gray-700"
            aria-label="Remove method"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ))}
    </>
  );
};
