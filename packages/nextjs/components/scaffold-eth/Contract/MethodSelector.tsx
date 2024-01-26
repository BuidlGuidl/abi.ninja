import { useState } from "react";
import { AbiFunction } from "abitype";
import { Abi } from "viem";
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface MethodSelectorProps {
  readMethodsWithInputsAndWriteMethods: AbiFunction[];
  abi: Abi;
  onMethodSelect: (selectedMethods: string) => void;
  removeMethod: (methodName: string) => void;
}

export const MethodSelector = ({
  readMethodsWithInputsAndWriteMethods,
  abi,
  onMethodSelect,
  removeMethod,
}: MethodSelectorProps) => {
  const [isReadCollapsed, setIsReadCollapsed] = useState(false);
  const [isWriteCollapsed, setIsWriteCollapsed] = useState(false);

  const readMethods = readMethodsWithInputsAndWriteMethods.filter(
    (method): method is AbiFunction => method.stateMutability === "view" || method.stateMutability === "pure",
  );

  const writeMethods = readMethodsWithInputsAndWriteMethods.filter(
    (method): method is AbiFunction => method.stateMutability === "view" || method.stateMutability === "pure",
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
        <h3
          className="font-semibold text-lg flex items-center cursor-pointer"
          onClick={() => setIsReadCollapsed(!isReadCollapsed)}
        >
          <span>
            {isReadCollapsed ? (
              <ChevronRightIcon className="h-4 w-4 mr-2" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 mr-2" />
            )}
          </span>{" "}
          Read
        </h3>
        {!isReadCollapsed && (
          <div className="flex flex-col items-start gap-1 pb-4">
            {readMethods.map((method, index) => (
              <div key={index} className="flex items-center gap-2 w-full pr-4">
                <button
                  className={`btn btn-sm btn-ghost font-normal pr-1 w-full justify-between ${
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
        )}
      </div>
      <div>
        <h3
          className="font-semibold text-lg flex items-center cursor-pointer"
          onClick={() => setIsWriteCollapsed(!isWriteCollapsed)}
        >
          <span>
            {isWriteCollapsed ? (
              <ChevronRightIcon className="h-4 w-4 mr-2" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 mr-2" />
            )}
          </span>{" "}
          Write
        </h3>
        {!isWriteCollapsed && (
          <div className="flex flex-col items-start gap-1">
            {writeMethods.map((method, index) => (
              <div key={index} className="flex items-center gap-2 w-full pr-4">
                <button
                  className={`btn btn-sm btn-ghost font-normal pr-1 w-full justify-between ${
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
        )}
      </div>
    </div>
  );
};
