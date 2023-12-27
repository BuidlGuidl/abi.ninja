import { mainnet } from "wagmi";
import { useAbiNinjaState } from "~~/services/store/store";
import { getNetworksWithEtherscaApi } from "~~/utils/abi";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

const mainNetworks = getNetworksWithEtherscaApi();
export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const mainChainId = useAbiNinjaState(state => state.mainChainId);
  const mainNetwork = mainNetworks.find(network => network.id === mainChainId);

  return {
    targetNetwork: mainNetwork || mainnet,
  };
}
