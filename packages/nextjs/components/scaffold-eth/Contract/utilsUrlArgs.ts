import type { AugmentedAbiFunction } from "./ContractUI";
import { getFunctionInputKey } from "./utilsContract";

export type ContractFormSnapshot = {
  form: Record<string, any>;
  txValue?: string;
};

export type ContractFormSnapshotRegistry = Record<string, ContractFormSnapshot>;

// plain module-level registry: snapshots are only read on share-button click,
// so they don't need store reactivity (a store write per keystroke re-renders subscribers)
const formSnapshots: ContractFormSnapshotRegistry = {};

export const setFormSnapshot = (uid: string, snapshot: ContractFormSnapshot): void => {
  formSnapshots[uid] = snapshot;
};

export const removeFormSnapshot = (uid: string): void => {
  delete formSnapshots[uid];
};

export const getFormSnapshots = (): ContractFormSnapshotRegistry => formSnapshots;

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
      if (method.stateMutability !== "payable" || !/^(\d+|0x[0-9a-fA-F]+)$/.test(value)) {
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

// true for "", and for JSON structures whose leaves are all empty strings
// (untouched tuples serialize to e.g. {"a":""}, which would pollute share links)
const isEmptyValue = (value: string): boolean => {
  if (value === "") return true;
  if (!value.startsWith("{") && !value.startsWith("[")) return false;

  try {
    const isEmptyDeep = (node: unknown): boolean => {
      if (node === "" || node === null) return true;
      if (typeof node === "string") return isEmptyValue(node);
      if (typeof node === "object") return Object.values(node).every(isEmptyDeep);
      return false;
    };
    return isEmptyDeep(JSON.parse(value));
  } catch {
    return false;
  }
};

export const buildShareQuery = (
  selectedMethods: AugmentedAbiFunction[],
  snapshot: ContractFormSnapshotRegistry,
): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("methods", selectedMethods.map(method => method.uid).join(","));

  selectedMethods.forEach(method => {
    const methodSnapshot = snapshot[method.uid];
    if (!methodSnapshot) return;

    method.inputs.forEach((input, inputIndex) => {
      const key = getFunctionInputKey(method.name, input, inputIndex);
      const value = methodSnapshot.form[key];
      if (value === undefined || isEmptyValue(String(value))) return;
      searchParams.set(`args.${method.uid}.${inputIndex}`, String(value));
    });

    if (method.stateMutability === "payable" && methodSnapshot.txValue) {
      searchParams.set(`args.${method.uid}.value`, methodSnapshot.txValue);
    }
  });

  return searchParams.toString();
};
