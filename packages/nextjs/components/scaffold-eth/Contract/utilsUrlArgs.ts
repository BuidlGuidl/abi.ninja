import type { AugmentedAbiFunction } from "./ContractUI";

export type ParsedUrlArgs = {
  argValues: Record<string, Record<number, string>>;
  txValues: Record<string, string>;
  impliedUids: string[];
  unmatched: string[];
};

export const parseUrlArgs = (search: string, methods: AugmentedAbiFunction[]): ParsedUrlArgs => {
  const argValues: ParsedUrlArgs["argValues"] = {};
  const txValues: ParsedUrlArgs["txValues"] = {};
  const impliedUids = new Set<string>();
  const unmatched: string[] = [];
  const methodsByUid = new Map(methods.map(method => [method.uid, method]));

  let searchParams: URLSearchParams;
  try {
    searchParams = new URLSearchParams(search);
  } catch {
    return { argValues, txValues, impliedUids: [], unmatched };
  }

  searchParams.forEach((value, paramName) => {
    if (!paramName.startsWith("args.")) return;

    const argumentPath = paramName.slice("args.".length);
    const suffixSeparator = argumentPath.lastIndexOf(".");
    if (suffixSeparator <= 0) {
      unmatched.push(paramName);
      return;
    }

    const uid = argumentPath.slice(0, suffixSeparator);
    const suffix = argumentPath.slice(suffixSeparator + 1);
    const method = methodsByUid.get(uid);
    if (!method) {
      unmatched.push(paramName);
      return;
    }

    impliedUids.add(uid);

    if (suffix === "value") {
      if (method.stateMutability !== "payable" || !/^\d+$/.test(value)) {
        unmatched.push(paramName);
        return;
      }
      txValues[uid] = value;
      return;
    }

    if (!/^\d+$/.test(suffix)) {
      unmatched.push(paramName);
      return;
    }

    const inputIndex = Number(suffix);
    if (!Number.isSafeInteger(inputIndex) || inputIndex >= method.inputs.length) {
      unmatched.push(paramName);
      return;
    }

    argValues[uid] ??= {};
    argValues[uid][inputIndex] = value;
  });

  return { argValues, txValues, impliedUids: [...impliedUids], unmatched };
};
