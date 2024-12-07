import { useTheme } from "next-themes";
import { useSwitchChain } from "wagmi";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

type NetworkOptionsProps = {
  hidden?: boolean;
};

export const NetworkOptions = ({ hidden = false }: NetworkOptionsProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { switchChain } = useSwitchChain();
  const {
    chains,
    targetNetwork: { id: mainChainId },
  } = useGlobalState(state => ({
    chains: state.chains,
    targetNetwork: state.targetNetwork,
  }));

  const filteredChains = chains.filter(allowedNetwork => allowedNetwork.id === mainChainId);
  // if chainId is 31337 we render one element, since viem chains have 3 chains with same chainId.
  const networksToRender = mainChainId === 31337 ? [filteredChains[0]] : filteredChains;

  return (
    <>
      {networksToRender.map(allowedNetwork => (
        <li key={`${allowedNetwork.id}-${allowedNetwork.name}`} className={hidden ? "hidden" : ""}>
          <button
            className="menu-item btn-sm !rounded-xl flex gap-3 py-3 whitespace-nowrap"
            type="button"
            onClick={() => {
              switchChain?.({ chainId: allowedNetwork.id });
            }}
          >
            <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <span>
              Switch to{" "}
              <span
                style={{
                  color: getNetworkColor(allowedNetwork, isDarkMode),
                }}
              >
                {allowedNetwork.id === 31337 ? "Localhost" : allowedNetwork.name}
              </span>
            </span>
          </button>
        </li>
      ))}
    </>
  );
};
