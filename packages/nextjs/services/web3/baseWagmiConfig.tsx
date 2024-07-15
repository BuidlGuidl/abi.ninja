import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl, getTargetNetworks } from "~~/utils/scaffold-eth";

const targetNetworks = getTargetNetworks();

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

export const createWagmiClient = ({ chain }: { chain: Chain }) =>
  createClient({
    chain: {
      ...chain,

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

export const baseWagmiConfig = createConfig({
  chains: enabledChains as [Chain, ...Chain[]],
  connectors: wagmiConnectors,
  ssr: true,
  client: createWagmiClient,
});
