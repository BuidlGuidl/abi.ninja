import { mainnet } from "wagmi";
import { useAbiNinjaState, useGlobalState } from "~~/services/store/store";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const appChains = useGlobalState(state => state.appChains);
  const mainChainId = useAbiNinjaState(state => state.mainChainId);
  const mainNetwork = appChains.chains.find(network => network.id === mainChainId);

  return {
    targetNetwork: mainNetwork || mainnet,
  };
}
