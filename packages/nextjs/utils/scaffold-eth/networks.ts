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
};

export type ChainWithAttributes = chains.Chain & Partial<ChainAttributes>;

/* const x = {
  mainnet: {
    name: "mainnet",
    color: "#ff8b9e",
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://etherscan.io/",
    etherscanEndpoint: "https://api.etherscan.io",
    apiKey: ETHERSCAN_API_KEY,
  },
  goerli: {
    name: "goerli",
    color: "#0975F6",
    chainId: 5,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`,
    etherscanEndpoint: "https://api-goerli.etherscan.io",
    apiKey: ETHERSCAN_API_KEY,
  },
  sepolia: {
    name: "sepolia",
    color: "#87ff65",
    chainId: 11155111,
    faucet: "https://faucet.sepolia.dev/",
    blockExplorer: "https://sepolia.etherscan.io/",
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_ID}`,
    etherscanEndpoint: "https://api-sepolia.etherscan.io",
    apiKey: ETHERSCAN_API_KEY,
  },
  polygon: {
    name: "polygon",
    color: "#2bbdf7",
    chainId: 137,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://polygon-rpc.com/",
    blockExplorer: "https://polygonscan.com/",
    etherscanEndpoint: "https://api.polygonscan.com",
    apiKey: POLYGONSCAN_API_KEY,
  },
  mumbai: {
    name: "mumbai",
    color: "#92D9FA",
    chainId: 80001,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    faucet: "https://faucet.polygon.technology/",
    blockExplorer: "https://mumbai.polygonscan.com/",
    etherscanEndpoint: "https://api-testnet.polygonscan.com",
    apiKey: POLYGONSCAN_API_KEY,
  },
  goerliOptimism: {
    name: "goerliOptimism",
    color: "#f01a37",
    chainId: 420,
    blockExplorer: "https://goerli-optimism.etherscan.io/",
    rpcUrl: `https://goerli.optimism.io`,
    gasPrice: 0,
    etherscanEndpoint: "https://api-goerli-optimism.etherscan.io",
    apiKey: ETHERSCAN_API_KEY,
  },
  optimism: {
    name: "optimism",
    color: "#f01a37",
    chainId: 10,
    blockExplorer: "https://optimistic.etherscan.io/",
    rpcUrl: `https://mainnet.optimism.io`,
    etherscanEndpoint: "https://api-optimistic.etherscan.io",
    apiKey: OPTIMISTIC_ETHERSCAN_API_KEY,
  },
  rinkebyArbitrum: {
    name: "rinkebyArbitrum",
    color: "#28a0f0",
    chainId: 421611,
    blockExplorer: "https://testnet.arbiscan.io/",
    rpcUrl: "https://rinkeby.arbitrum.io/rpc",
    etherscanEndpoint: "https://api-testnet.arbiscan.io",
    apiKey: ETHERSCAN_API_KEY,
  },
  arbitrum: {
    name: "arbitrum",
    color: "#28a0f0",
    chainId: 42161,
    blockExplorer: "https://arbiscan.io/",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    etherscanEndpoint: "https://api.arbiscan.io",
    apiKey: ETHERSCAN_API_KEY,
  },
  gnosisChain: {
    name: "gnosisChain",
    color: "#0d8e74",
    chainId: 100,
    price: 1,
    blockExplorer: "ttps://gnosisscan.io/",
    rpcUrl: "https://rpc.gnosis.gateway.fm",
    etherscanEndpoint: "https://api.gnosisscan.io",
    apiKey: ETHERSCAN_API_KEY,
  },

} */

const MAIN_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

export const NETWORKS_EXTRA_DATA: Record<string, ChainAttributes> = {
  [chains.hardhat.id]: {
    color: "#b8af0c",
  },
  [chains.mainnet.id]: {
    color: "#ff8b9e",
    etherscanEndpoint: "https://api.etherscan.io",
    etherscanApiKey: MAIN_ETHERSCAN_API_KEY,
  },
  [chains.sepolia.id]: {
    color: ["#5f4bb6", "#87ff65"],
    etherscanEndpoint: "https://api-sepolia.etherscan.io",
    etherscanApiKey: MAIN_ETHERSCAN_API_KEY,
  },
  [chains.goerli.id]: {
    color: "#0975F6",
    etherscanEndpoint: "https://api-goerli.etherscan.io",
    etherscanApiKey: MAIN_ETHERSCAN_API_KEY,
  },
  [chains.gnosis.id]: {
    color: "#48a9a6",
  },
  [chains.polygon.id]: {
    color: "#2bbdf7",
    nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  [chains.polygonMumbai.id]: {
    color: "#92D9FA",
    nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  [chains.optimismGoerli.id]: {
    color: "#f01a37",
  },
  [chains.optimism.id]: {
    color: "#f01a37",
  },
  [chains.arbitrumGoerli.id]: {
    color: "#28a0f0",
  },
  [chains.arbitrum.id]: {
    color: "#28a0f0",
  },
  [chains.fantom.id]: {
    color: "#1969ff",
  },
  [chains.fantomTestnet.id]: {
    color: "#1969ff",
  },
  [chains.scrollSepolia.id]: {
    color: "#fbebd4",
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
