import { ReactNode } from "react";
import * as wagmiChains from "@wagmi/core/chains";
import { Chain } from "viem";
import { getPopularTargetNetworks } from "~~/utils/scaffold-eth";

export type Options = {
  value: number | string;
  label: string;
  icon?: string | ReactNode;
  testnet?: boolean;
};

export type GroupedOptions = Record<
  "mainnet" | "testnet" | "localhost" | "other" | "custom",
  {
    label: string;
    options: Options[];
  }
>;

export const networks = getPopularTargetNetworks();

export const initialGroupedOptions = networks.reduce<GroupedOptions>(
  (groups, network) => {
    if (network.id === 31337) {
      groups.localhost.options.push({
        value: network.id,
        label: "31337 - Localhost",
        icon: "localhost",
      });
      return groups;
    }

    const groupName = network.testnet ? "testnet" : "mainnet";

    groups[groupName].options.push({
      value: network.id,
      label: network.name,
      icon: network.icon,
      testnet: network.testnet,
    });

    return groups;
  },
  {
    mainnet: { label: "mainnet", options: [] },
    testnet: { label: "testnet", options: [] },
    localhost: { label: "localhost", options: [] },
    other: {
      label: "other",
      options: [
        {
          value: "other-chains",
          label: "Other chains",
          icon: "EyeIcon",
        },
      ],
    },
    custom: {
      label: "custom",
      options: [
        {
          value: "custom-chains",
          label: "Add custom chain",
          icon: "PlusIcon",
        },
      ],
    },
  },
);

export const networkIds = new Set(networks.map(network => network.id));

export const filterChains = (
  chains: Record<string, Chain>,
  networkIds: Set<number>,
  existingChainIds: Set<number>,
): Chain[] => {
  return Object.values(chains).filter(chain => !networkIds.has(chain.id) && !existingChainIds.has(chain.id));
};

const excludeChainKeys = ["lineaTestnet", "x1Testnet"]; // duplicate chains in viem chains

type Chains = Record<string, Chain>;

const unfilteredChains: Chains = wagmiChains as Chains;

export const filteredChains = Object.keys(unfilteredChains)
  .filter(key => !excludeChainKeys.includes(key))
  .reduce((obj: Chains, key) => {
    obj[key] = unfilteredChains[key];
    return obj;
  }, {} as Chains);

export const mapChainsToOptions = (chains: Chain[]): Options[] => {
  return chains.map(chain => ({
    value: chain.id,
    label: chain.name,
    icon: "",
    testnet: (chain as any).testnet || false,
  }));
};

export const chainToOption = (chain: Chain): Options => ({
  value: chain.id,
  label: chain.name,
  testnet: chain.testnet,
  icon: "",
});

const STORED_CHAINS_STORAGE_KEY = "storedChains";

export const getStoredChainsFromLocalStorage = (): Chain[] => {
  if (typeof window !== "undefined") {
    const storedChains = localStorage.getItem(STORED_CHAINS_STORAGE_KEY);
    return storedChains ? JSON.parse(storedChains) : [];
  }
  return [];
};

export const storeChainInLocalStorage = (chain: Chain) => {
  if (typeof window !== "undefined") {
    const chains = [...getStoredChainsFromLocalStorage(), chain];
    localStorage.setItem(STORED_CHAINS_STORAGE_KEY, JSON.stringify(chains));
  }
};

export const removeChainFromLocalStorage = (chainId: number) => {
  if (typeof window !== "undefined") {
    const chains = getStoredChainsFromLocalStorage().filter(chain => chain.id !== chainId);
    localStorage.setItem(STORED_CHAINS_STORAGE_KEY, JSON.stringify(chains));
  }
};

export const formDataToChain = (formData: FormData): Chain => {
  const chain = {
    id: Number(formData.get("id")),
    name: formData.get("name") as string,
    nativeCurrency: {
      name: formData.get("nativeCurrencyName") as string,
      symbol: formData.get("nativeCurrencySymbol") as string,
      decimals: Number(formData.get("nativeCurrencyDecimals")),
    },
    rpcUrls: {
      public: { http: [formData.get("rpcUrl") as string] },
      default: { http: [formData.get("rpcUrl") as string] },
    },
    testnet: formData.get("testnet") === "on",
  } as const satisfies Chain;

  return chain;
};

export const isChainStored = (option: Options): boolean => {
  const storedChains = getStoredChainsFromLocalStorage();
  return storedChains.some(storedChain => storedChain.id === option.value);
};
