export const RPC_POLL_TIME = 30000;

// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = process.env.REACT_APP_INFURA_KEY ?? "460f40a260564ac4a4f4b3fffb032dad";

const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
const OPTIMISTIC_ETHERSCAN_API_KEY = process.env.OPTIMISTIC_ETHERSCAN_API_KEY;
const POLYGONSCAN_API_KEY = process.env.REACT_APP_POLYGONSCAN_API_KEY;

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

export const ALCHEMY_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

export const NETWORKS = {
  localhost: {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://127.0.0.1:8545/",
  },
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
    blockExplorer: "https://gnosisscan.io/",
    rpcUrl: "https://rpc.gnosis.gateway.fm",
    etherscanEndpoint: "https://api.gnosisscan.io",
    apiKey: ETHERSCAN_API_KEY,
  },
  bsc: {
    name: "bsc",
    color: "#F0B90B",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorer: "https://bscscan.com/",
    etherscanEndpoint: "https://api.bscscan.com",
    apiKey: ETHERSCAN_API_KEY,
  },
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};
