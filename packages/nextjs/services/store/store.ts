import { wagmiConnectors } from "../web3/wagmiConnectors";
import { Abi, Address, Chain, createClient, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import create from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl, getTargetNetworks } from "~~/utils/scaffold-eth";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

const targetNetworks = getTargetNetworks();

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

const createWagmiClient = ({ chain }: { chain: Chain }) =>
  createClient({
    chain: {
      id: chain.id,
      name: chain.name,
      nativeCurrency: chain.nativeCurrency,
      rpcUrls: chain.rpcUrls,
    },
    transport: http(getAlchemyHttpUrl(chain.id)),
    ...(chain.id !== (hardhat as Chain).id
      ? {
          pollingInterval: scaffoldConfig.pollingInterval,
        }
      : {}),
  });

export const wagmiConfig = createConfig({
  chains: enabledChains as [Chain, ...Chain[]],
  connectors: wagmiConnectors,
  ssr: true,
  client: createWagmiClient,
});

type GlobalState = {
  nativeCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  wagmiConfig: typeof wagmiConfig;
  setWagmiConfig: (newWagmiConfig: typeof wagmiConfig) => void;
  chains: Chain[];
  addChain: (newChain: Chain) => void;
};

type AbiNinjaState = {
  mainChainId: number;
  setMainChainId: (newMainChainId: number) => void;
  contractAbi: Abi;
  setContractAbi: (newAbi: Abi) => void;
  abiContractAddress: Address;
  setAbiContractAddress: (newAbiContractAddress: Address) => void;
  implementationAddress: Address;
  setImplementationAddress: (newImplementationAddress: Address) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
  targetNetwork: scaffoldConfig.targetNetworks[1],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
  wagmiConfig,
  setWagmiConfig: (newConfig: typeof wagmiConfig): void => set(() => ({ wagmiConfig: newConfig })),
  chains: enabledChains as Chain[],
  addChain: (newChain: Chain): void =>
    set(state => {
      const updatedChains = [...state.chains, newChain];
      const updatedWagmiConfig = createConfig({
        chains: updatedChains as [Chain, ...Chain[]],
        connectors: wagmiConnectors,
        ssr: true,
        client: createWagmiClient,
      });
      return { chains: updatedChains, wagmiConfig: updatedWagmiConfig };
    }),
}));

export const useAbiNinjaState = create<AbiNinjaState>(set => ({
  mainChainId: scaffoldConfig.targetNetworks[0].id,
  setMainChainId: (newValue: number): void => set(() => ({ mainChainId: newValue })),
  contractAbi: [],
  setContractAbi: (newAbi: Abi): void => set({ contractAbi: newAbi }),
  abiContractAddress: "",
  setAbiContractAddress: (newAddress: Address): void => set({ abiContractAddress: newAddress }),
  implementationAddress: "",
  setImplementationAddress: (newAddress: Address): void => set({ implementationAddress: newAddress }),
}));
