import { Abi } from "viem";
import { XMarkIcon } from "@heroicons/react/24/outline";

type AbiFunction = Extract<Abi[number], { type: "function" }>;

type AbiFallback = Extract<Abi[number], { type: "fallback" }>;

type SelectableAbiType = AbiFunction | AbiFallback;

interface MethodSelectorProps {
  methodsWithInputs: SelectableAbiType[];
  abi: Abi;
  onMethodSelect: (selectedMethods: string) => void;
  removeMethod: (methodName: string) => void;
}

export const MethodSelector = ({ methodsWithInputs, abi, onMethodSelect, removeMethod }: MethodSelectorProps) => {
  const readMethods = methodsWithInputs.filter(
    (method): method is AbiFunction => method.type === "function" && method.stateMutability === "view",
  );

  const writeMethods = methodsWithInputs.filter(
    (method): method is AbiFunction => method.type === "function" && method.stateMutability !== "view",
  );

  const handleMethodSelect = (methodName: string) => {
    onMethodSelect(methodName);
  };

  const isMethodSelected = (methodName: string) => {
    return abi.some(method => "name" in method && method.name === methodName);
  };

  return (
    <div className="space-y-4 overflow-auto h-[80vh]">
      <input id="sidebar" type="checkbox" className="drawer-toggle" />
      <label htmlFor="sidebar" className="cursor-pointer block lg:hidden">
        <XMarkIcon className="h-5 w-5" />
      </label>
      <div>
        <h3 className="font-semibold text-lg">Read</h3>
        <div className="flex flex-col items-start gap-1">
          {readMethods.map((method, index) => (
            <div key={index} className="flex items-center gap-2 w-full pr-4">
              <button
                className={`btn btn-sm btn-ghost pr-1 w-full justify-between ${
                  isMethodSelected(method.name) ? "bg-purple-100 pointer-events-none" : ""
                }`}
                onClick={() => handleMethodSelect(method.name)}
              >
                {method.name}
                {isMethodSelected(method.name) && (
                  <button
                    className="ml-4 text-xs hover:bg-gray-100 rounded-md p-1 pointer-events-auto"
                    onClick={() => removeMethod(method.name)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg">Write</h3>
        <div className="flex flex-col items-start gap-1">
          {writeMethods.map((method, index) => (
            <div key={index} className="flex items-center gap-2 w-full pr-4">
              <button
                className={`btn btn-sm btn-ghost pr-1 w-full justify-between ${
                  isMethodSelected(method.name) ? "bg-purple-100 pointer-events-none" : ""
                }`}
                onClick={() => handleMethodSelect(method.name)}
              >
                {method.name}
                {isMethodSelected(method.name) && (
                  <button
                    className="ml-4 text-xs hover:bg-gray-100 rounded-md p-1 pointer-events-auto"
                    onClick={() => removeMethod(method.name)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
