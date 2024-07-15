import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useAbiNinjaState, useGlobalState } from "~~/services/store/store";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";
import { NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";

/**
 * Retrieves the connected wallet's network from scaffold.config or defaults to the 0th network in the list if the wallet is not connected.
 */
export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const { chain } = useAccount();
  const targetNetwork = useGlobalState(state => state.targetNetwork);
  const setTargetNetwork = useGlobalState(state => state.setTargetNetwork);
  const chains = useGlobalState(state => state.chains);
  const mainChainId = useAbiNinjaState(state => state.mainChainId);

  useEffect(() => {
    const newSelectedNetwork = chains.find(network => network.id === chain?.id || network.id === mainChainId);
    if (newSelectedNetwork && newSelectedNetwork.id !== targetNetwork.id) {
      setTargetNetwork(newSelectedNetwork);
    }
  }, [chain?.id, setTargetNetwork, targetNetwork.id, chains, mainChainId]);

  return useMemo(
    () => ({
      targetNetwork: {
        ...targetNetwork,
        ...NETWORKS_EXTRA_DATA[targetNetwork.id],
      },
    }),
    [targetNetwork],
  );
}
