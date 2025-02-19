import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "DMON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet BlockVision",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});
