import { Abi } from "viem";

type AbiFunction = Extract<Abi[number], { type: "function" }>;

type AbiFallback = Extract<Abi[number], { type: "fallback" }>;

type SelectableAbiType = AbiFunction | AbiFallback;

interface MethodSelectorProps {
  abi: SelectableAbiType[];
  onMethodSelect: (selectedMethods: string) => void;
}

export const MethodSelector = ({ abi, onMethodSelect }: MethodSelectorProps) => {
  const readMethods = abi.filter(
    (method): method is AbiFunction => method.type === "function" && method.stateMutability === "view",
  );

  const writeMethods = abi.filter(
    (method): method is AbiFunction => method.type === "function" && method.stateMutability !== "view",
  );

  return (
    <>
      <div>
        <h3 className="font-semibold">Read</h3>
        <div className="flex flex-col items-start">
          {readMethods.map((method, index) => (
            <button key={index} className="btn btn-xs btn-ghost" onClick={() => onMethodSelect(method.name)}>
              {method.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold">Write</h3>
        <div className="flex flex-col items-start">
          {writeMethods.map((method, index) => (
            <button key={index} className="btn btn-xs btn-ghost" onClick={() => onMethodSelect(method.name)}>
              {method.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
