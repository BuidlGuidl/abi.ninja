import { mainnet } from "wagmi";
import { useAbiNinjaState } from "~~/services/store/store";
import { getNetworksWithEtherscanApi } from "~~/utils/abi";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

const mainNetworks = getNetworksWithEtherscanApi();
export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const mainChainId = useAbiNinjaState(state => state.mainChainId);
  const mainNetwork = mainNetworks.find(network => network.id === mainChainId);

  return {
    targetNetwork: mainNetwork || mainnet,
  };
}
