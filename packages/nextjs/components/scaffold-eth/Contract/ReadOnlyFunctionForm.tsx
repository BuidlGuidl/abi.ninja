"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type ReadOnlyFunctionFormProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  inheritedFrom?: string;
  abi: Abi;
  initialArgs?: Record<number, string>;
};

export const ReadOnlyFunctionForm = ({
  contractAddress,
  abiFunction,
  inheritedFrom,
  abi,
  initialArgs,
}: ReadOnlyFunctionFormProps) => {
  const mainChainId = useGlobalState(state => state.targetNetwork.id);
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction, initialArgs));
  const [result, setResult] = useState<unknown>();
  const autoReadTriggeredRef = useRef(false);

  const { isFetching, refetch, error } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    args: getParsedContractFunctionArgs(form),
    chainId: mainChainId,
    query: {
      enabled: false,
      retry: false,
    },
  });

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error);
      notification.error(parsedError);
    }
  }, [error]);

  const handleRead = useCallback(async () => {
    const { data } = await refetch();
    setResult(data);
  }, [refetch]);

  const hasCompleteInitialArgs =
    Object.keys(initialArgs ?? {}).length === abiFunction.inputs.length &&
    abiFunction.inputs.every(
      (input, inputIndex) =>
        input.type !== "tuple" &&
        !input.type.startsWith("tuple[") &&
        initialArgs?.[inputIndex] !== undefined &&
        initialArgs[inputIndex] !== "",
    );

  useEffect(() => {
    if (autoReadTriggeredRef.current || !hasCompleteInitialArgs) return;

    autoReadTriggeredRef.current = true;
    void handleRead();
  }, [handleRead, hasCompleteInitialArgs]);

  const transformedFunction = transformAbiFunction(abiFunction);
  const inputElements = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <p className="font-medium my-0 break-words">
        {abiFunction.name}
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </p>
      {inputElements}
      <div className="flex flex-col md:flex-row justify-between gap-2 flex-wrap">
        <div className="flex-grow w-full md:max-w-[80%]">
          {result !== null && result !== undefined && (
            <div className="bg-secondary rounded-3xl text-sm px-4 py-1.5 break-words overflow-auto">
              <p className="font-bold m-0 mb-1">Result:</p>
              <pre className="whitespace-pre-wrap break-words">{displayTxResult(result, "sm")}</pre>
            </div>
          )}
        </div>
        <button className="btn btn-secondary btn-sm self-end md:self-start" onClick={handleRead} disabled={isFetching}>
          {isFetching && <span className="loading loading-spinner loading-xs"></span>}
          Read 📡
        </button>
      </div>
    </div>
  );
};
