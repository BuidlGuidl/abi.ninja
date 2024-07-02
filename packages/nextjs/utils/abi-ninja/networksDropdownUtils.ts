import { ReactNode } from "react";
import { Chain } from "viem";

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

export const filterChains = (
  chains: Record<string, Chain>,
  networkIds: Set<number>,
  existingChainIds: Set<number>,
): Chain[] => {
  return Object.values(chains).filter(chain => !networkIds.has(chain.id) && !existingChainIds.has(chain.id));
};

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

export const getStoredCustomChains = (): Chain[] => {
  if (typeof window !== "undefined") {
    const storedCustomChains = localStorage.getItem("storedCustomChains");
    return storedCustomChains ? JSON.parse(storedCustomChains) : [];
  }
  return [];
};

export const getStoredOtherChains = (): Options[] => {
  if (typeof window !== "undefined") {
    const storedOtherChains = localStorage.getItem("storedOtherChains");
    return storedOtherChains ? JSON.parse(storedOtherChains) : [];
  }
  return [];
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
    testnet: formData.get("isTestnet") === "on",
  } as const satisfies Chain;

  return chain;
};
