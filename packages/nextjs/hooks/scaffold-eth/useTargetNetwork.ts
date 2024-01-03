import { mainnet } from "wagmi";
import { useAbiNinjaState } from "~~/services/store/store";
import { ChainWithAttributes, getTargetNetworks } from "~~/utils/scaffold-eth";

const mainNetworks = getTargetNetworks();
export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const mainChainId = useAbiNinjaState(state => state.mainChainId);
  const mainNetwork = mainNetworks.find(network => network.id === mainChainId);

  return {
    targetNetwork: mainNetwork || mainnet,
  };
}
