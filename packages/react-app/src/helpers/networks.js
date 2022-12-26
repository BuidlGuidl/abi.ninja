import { NETWORKS } from "../constants";

export const getNetworkByChainId = chainId => {
  return Object.keys(NETWORKS).find(network => NETWORKS[network]?.chainId === chainId);
};

export const getNetworkPriceByChainId = chainId => {
  const network = getNetworkByChainId(chainId);

  if (!NETWORKS[network]) return;

  return NETWORKS[network].price;
};
