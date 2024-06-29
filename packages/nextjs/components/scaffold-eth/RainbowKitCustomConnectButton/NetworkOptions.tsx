import { useDarkMode } from "usehooks-ts";
import { useSwitchNetwork } from "wagmi";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { useAbiNinjaState, useGlobalState } from "~~/services/store/store";

type NetworkOptionsProps = {
  hidden?: boolean;
};

export const NetworkOptions = ({ hidden = false }: NetworkOptionsProps) => {
  const { isDarkMode } = useDarkMode();
  const { switchNetwork } = useSwitchNetwork();
  const mainChainId = useAbiNinjaState(state => state.mainChainId);
  const appChains = useGlobalState(state => state.appChains);

  const allowedNetworks = appChains.chains;

  return (
    <>
      {allowedNetworks
        .filter(allowedNetwork => allowedNetwork.id === mainChainId)
        .map(allowedNetwork => (
          <li key={allowedNetwork.id} className={hidden ? "hidden" : ""}>
            <button
              className="menu-item btn-sm !rounded-xl flex gap-3 py-3 whitespace-nowrap"
              type="button"
              onClick={() => {
                switchNetwork?.(allowedNetwork.id);
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
                  {allowedNetwork.name}
                </span>
              </span>
            </button>
          </li>
        ))}
    </>
  );
};
