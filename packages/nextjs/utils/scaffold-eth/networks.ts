import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

type ChainAttributes = {
  // color | [lightThemeColor, darkThemeColor]
  color: string | [string, string];
  // Used to fetch price by providing mainnet token address
  // for networks having native currency other than ETH
  nativeCurrencyTokenAddress?: string;
  etherscanEndpoint?: string;
  etherscanApiKey?: string;
  icon?: string;
  groupSelector?: string;
};

export type ChainWithAttributes = chains.Chain & Partial<ChainAttributes>;

const MAINNET_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";
const OPTIMISM_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_OPTIMISM_ETHERSCAN_API_KEY || "";
const POLYGON_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_POLYGON_ETHERSCAN_API_KEY || "";
const ARBITRUM_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ARBITRUM_ETHERSCAN_API_KEY || "";
const ZKSYNC_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ZKSYNC_ETHERSCAN_API_KEY || "";
const BASE_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_BASE_ETHERSCAN_API_KEY || "";
const SCROLL_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_SCROLL_ETHERSCAN_API_KEY || "";

export const NETWORKS_EXTRA_DATA: Record<string, ChainAttributes> = {
  [chains.hardhat.id]: {
    color: "#b8af0c",
    icon: "hardhat.png",
    groupSelector: "Local",
  },
  [chains.mainnet.id]: {
    color: "#ff8b9e",
    etherscanEndpoint: "https://api.etherscan.io",
    etherscanApiKey: MAINNET_ETHERSCAN_API_KEY,
    icon: "mainnet.svg",
    groupSelector: "Mainnets",
  },
  [chains.sepolia.id]: {
    color: ["#5f4bb6", "#87ff65"],
    etherscanEndpoint: "https://api-sepolia.etherscan.io",
    etherscanApiKey: MAINNET_ETHERSCAN_API_KEY,
    icon: "sepolia.svg",
    groupSelector: "Testnets",
  },
  [chains.goerli.id]: {
    color: "#0975F6",
    etherscanEndpoint: "https://api-goerli.etherscan.io",
    etherscanApiKey: MAINNET_ETHERSCAN_API_KEY,
    icon: "goerli.svg",
    groupSelector: "Testnets",
  },
  [chains.gnosis.id]: {
    color: "#48a9a6",
    etherscanEndpoint: "https://api.gnosisscan.io",
    etherscanApiKey: MAINNET_ETHERSCAN_API_KEY,
    icon: "gnosis.svg",
    groupSelector: "Mainnets",
  },
  [chains.polygon.id]: {
    color: "#2bbdf7",
    nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    etherscanEndpoint: "https://api.polygonscan.com",
    etherscanApiKey: POLYGON_ETHERSCAN_API_KEY,
    icon: "polygon.svg",
    groupSelector: "Mainnets",
  },
  [chains.polygonMumbai.id]: {
    color: "#92D9FA",
    nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    etherscanEndpoint: "https://api-testnet.polygonscan.com",
    etherscanApiKey: POLYGON_ETHERSCAN_API_KEY,
    icon: "polygonMumbai.svg",
    groupSelector: "Testnets",
  },
  [chains.optimismGoerli.id]: {
    color: "#f01a37",
    etherscanEndpoint: "https://api-goerli-optimistic.etherscan.io",
    etherscanApiKey: OPTIMISM_ETHERSCAN_API_KEY,
    icon: "optimismGoerli.svg",
    groupSelector: "Testnets",
  },
  [chains.optimism.id]: {
    color: "#f01a37",
    etherscanEndpoint: "https://api-optimistic.etherscan.io",
    etherscanApiKey: OPTIMISM_ETHERSCAN_API_KEY,
    icon: "optimism.svg",
    groupSelector: "Mainnets",
  },
  [chains.arbitrumGoerli.id]: {
    color: "#28a0f0",
    icon: "arbitrumGoerli.jpg",
    groupSelector: "Testnets",
  },
  [chains.arbitrum.id]: {
    color: "#28a0f0",
    etherscanEndpoint: "https://api.arbiscan.io",
    etherscanApiKey: ARBITRUM_ETHERSCAN_API_KEY,
    icon: "arbitrum.jpg",
    groupSelector: "Mainnets",
  },
  [chains.zkSync.id]: {
    color: "#5f4bb6",
    etherscanEndpoint: "https://block-explorer-api.mainnet.zksync.io",
    etherscanApiKey: ZKSYNC_ETHERSCAN_API_KEY,
    icon: "zkSync.jpg",
    groupSelector: "Mainnets",
  },
  [chains.zkSyncTestnet.id]: {
    color: "#5f4bb6",
    etherscanEndpoint: "https://block-explorer-api.testnets.zksync.dev",
    etherscanApiKey: ZKSYNC_ETHERSCAN_API_KEY,
    icon: "zkSyncTestnet.jpg",
    groupSelector: "Testnets",
  },
  [chains.base.id]: {
    color: "#1450EE",
    etherscanEndpoint: "https://api-sepolia.basescan.org",
    etherscanApiKey: BASE_ETHERSCAN_API_KEY,
    icon: "base.jpg",
    groupSelector: "Mainnets",
  },
  [chains.baseSepolia.id]: {
    color: "#1450EE",
    etherscanApiKey: BASE_ETHERSCAN_API_KEY,
    icon: "baseSepolia.jpg",
    groupSelector: "Testnets",
  },
  [chains.scroll.id]: {
    color: "#fbebd4",
    etherscanEndpoint: "https://api.scrollscan.com",
    etherscanApiKey: SCROLL_ETHERSCAN_API_KEY,
    icon: "scroll.jpg",
    groupSelector: "Mainnets",
  },
  [chains.scrollSepolia.id]: {
    color: "#fbebd4",
    etherscanEndpoint: "https://api-sepolia.scrollscan.com",
    etherscanApiKey: SCROLL_ETHERSCAN_API_KEY,
    icon: "scrollSepolia.jpg",
    groupSelector: "Testnets",
  },
};

/**
 * Gives the block explorer transaction URL.
 * Returns empty string if the network is a local chain
 */
export function getBlockExplorerTxLink(chainId: number, txnHash: string) {
  const chainNames = Object.keys(chains);

  const targetChainArr = chainNames.filter(chainName => {
    const wagmiChain = chains[chainName as keyof typeof chains];
    return wagmiChain.id === chainId;
  });

  if (targetChainArr.length === 0) {
    return "";
  }

  const targetChain = targetChainArr[0] as keyof typeof chains;
  // @ts-expect-error : ignoring error since `blockExplorers` key may or may not be present on some chains
  const blockExplorerTxURL = chains[targetChain]?.blockExplorers?.default?.url;

  if (!blockExplorerTxURL) {
    return "";
  }

  return `${blockExplorerTxURL}/tx/${txnHash}`;
}

/**
 * Gives the block explorer URL for a given address.
 * Defaults to Etherscan if no (wagmi) block explorer is configured for the network.
 */
export function getBlockExplorerAddressLink(network: chains.Chain, address: string) {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;
  if (network.id === chains.hardhat.id) {
    return `/blockexplorer/address/${address}`;
  }

  if (!blockExplorerBaseURL) {
    return `https://etherscan.io/address/${address}`;
  }

  return `${blockExplorerBaseURL}/address/${address}`;
}

/**
 * @returns targetNetworks array containing networks configured in scaffold.config including extra network metadata
 */
export function getTargetNetworks(): ChainWithAttributes[] {
  return scaffoldConfig.targetNetworks.map(targetNetwork => ({
    ...targetNetwork,
    ...NETWORKS_EXTRA_DATA[targetNetwork.id],
  }));
}
