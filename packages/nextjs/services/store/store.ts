import create from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  nativeCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  contractAbi: string;
  setContractAbi: (newAbi: string) => void;
};

type AbiNinjaState = {
  mainChainId: number;
  setMainChainId: (newMainChainId: number) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
  contractAbi: "", // default value for contract ABI
  setContractAbi: (newAbi: string): void => set({ contractAbi: newAbi }),
}));

export const useAbiNinjaState = create<AbiNinjaState>(set => ({
  mainChainId: 1,
  setMainChainId: (newValue: number): void => set(() => ({ mainChainId: newValue })),
}));
