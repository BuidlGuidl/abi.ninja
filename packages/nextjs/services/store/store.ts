import { Abi, Address } from "viem";
import create from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

type GlobalState = {
  nativeCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
};

type AbiNinjaState = {
  mainChainId: number;
  setMainChainId: (newMainChainId: number) => void;
  contractAbi: Abi;
  setContractAbi: (newAbi: Abi) => void;
  abiContractAddress: Address;
  setAbiContractAddress: (newAbiContractAddress: Address) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
  targetNetwork: scaffoldConfig.targetNetworks[1],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
}));

export const useAbiNinjaState = create<AbiNinjaState>(set => ({
  mainChainId: scaffoldConfig.targetNetworks[1].id,
  setMainChainId: (newValue: number): void => set(() => ({ mainChainId: newValue })),
  contractAbi: [],
  setContractAbi: (newAbi: Abi): void => set({ contractAbi: newAbi }),
  abiContractAddress: "",
  setAbiContractAddress: (newAddress: Address): void => set({ abiContractAddress: newAddress }),
}));
