import { ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as chains from "@wagmi/core/chains";
import { useTheme } from "next-themes";
import Select, { MultiValue, OptionProps, SingleValue, components } from "react-select";
import { Chain } from "viem";
import { EyeIcon, WrenchScrewdriverIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getPopularTargetNetworks } from "~~/utils/scaffold-eth";

type Options = {
  value: number | string;
  label: string;
  icon?: string | ReactNode;
  isTestnet?: boolean;
};

type GroupedOptions = Record<
  "mainnet" | "testnet" | "localhost" | "other",
  {
    label: string;
    options: Options[];
  }
>;

const getIconComponent = (iconName: string | undefined) => {
  switch (iconName) {
    case "EyeIcon":
      return <EyeIcon className="h-6 w-6 mr-2 text-gray-500" />;
    case "localhost":
      return <WrenchScrewdriverIcon className="h-6 w-6 mr-2 text-gray-500" />;
    default:
      return <Image src={iconName || "/mainnet.svg"} alt="default icon" width={24} height={24} className="mr-2" />;
  }
};

const networks = getPopularTargetNetworks();
const groupedOptions = networks.reduce<GroupedOptions>(
  (groups, network) => {
    if (network.id === 31337) {
      groups.localhost.options.push({
        value: network.id,
        label: "31337 - Localhost",
        icon: getIconComponent("localhost"),
      });
      return groups;
    }

    const groupName = network.testnet ? "testnet" : "mainnet";

    groups[groupName].options.push({
      value: network.id,
      label: network.name,
      icon: network.icon,
      isTestnet: network.testnet,
    });

    return groups;
  },
  {
    mainnet: { label: "mainnet", options: [] },
    testnet: { label: "testnet", options: [] },
    localhost: { label: "localhost", options: [] },
    other: {
      label: "other",
      options: [
        {
          value: "other-chains",
          label: "Other chains",
          icon: "EyeIcon",
        },
      ],
    },
  },
);

const filterChains = (
  chains: Record<string, Chain>,
  networkIds: Set<number>,
  existingChainIds: Set<number>,
): Chain[] => {
  return Object.values(chains).filter(chain => !networkIds.has(chain.id) && !existingChainIds.has(chain.id));
};

const mapChainsToOptions = (chains: Chain[]): Options[] => {
  return chains.map(chain => ({
    value: chain.id,
    label: chain.name,
    icon: "",
    isTestnet: (chain as any).testnet || false,
  }));
};

const getStoredChains = (): Options[] => {
  if (typeof window !== "undefined") {
    const storedChains = localStorage.getItem("customChains");
    return storedChains ? JSON.parse(storedChains) : [];
  }
  return [];
};

const networkIds = new Set(networks.map(network => network.id));

const { Option } = components;
const IconOption = (props: OptionProps<Options>) => (
  <Option {...props}>
    <div className="flex items-center">
      {typeof props.data.icon === "string" ? getIconComponent(props.data.icon) : props.data.icon}
      {props.data.label}
    </div>
  </Option>
);

export const NetworksDropdown = ({ onChange }: { onChange: (options: any) => any }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<SingleValue<Options>>(groupedOptions.mainnet.options[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const seeAllModalRef = useRef<HTMLDialogElement>(null);

  const isDarkMode = resolvedTheme === "dark";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const customChains = getStoredChains();
    customChains.forEach((chain: Options) => {
      const groupName = chain.isTestnet ? "testnet" : "mainnet";
      if (!groupedOptions[groupName].options.some(option => option.value === chain.value)) {
        groupedOptions[groupName].options.push(chain);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 640px)");
      setIsMobile(mediaQuery.matches);

      const handleResize = () => setIsMobile(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleResize);
      return () => mediaQuery.removeEventListener("change", handleResize);
    }
  }, []);

  const handleSelectChange = (newValue: SingleValue<Options> | MultiValue<Options>) => {
    const selected = newValue as SingleValue<Options>;
    if (selected?.value === "other-chains") {
      if (!seeAllModalRef.current || !searchInputRef.current) return;
      seeAllModalRef.current.showModal();
      searchInputRef.current.focus();
    } else {
      setSelectedOption(selected);
      onChange(selected);
    }
  };

  const handleChainSelect = (option: Options) => {
    const groupName = option.isTestnet ? "testnet" : "mainnet";
    if (!groupedOptions[groupName].options.some(chain => chain.value === option.value)) {
      groupedOptions[groupName].options.push(option);
    }
    const customChains = [...getStoredChains(), option];
    localStorage.setItem("customChains", JSON.stringify(customChains));
    setSelectedOption(option);
    onChange(option);
    if (seeAllModalRef.current) {
      seeAllModalRef.current.close();
    }
  };

  const handleModalClose = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      setSearchTerm("");
    }
    if (seeAllModalRef.current) {
      seeAllModalRef.current.close();
    }
  };

  const existingChainIds = new Set(
    Object.values(groupedOptions)
      .flatMap(group => group.options.map(option => option.value))
      .filter(value => typeof value === "number") as number[],
  );

  const filteredChains = filterChains(chains, networkIds, existingChainIds);

  const modalChains = mapChainsToOptions(filteredChains).filter(chain =>
    `${chain.label} ${chain.value}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!mounted) return <div className="skeleton bg-neutral max-w-xs w-44 relative h-[38px]" />;

  return (
    <>
      <Select
        value={selectedOption}
        defaultValue={groupedOptions["mainnet"].options[0]}
        instanceId="network-select"
        options={Object.values(groupedOptions)}
        onChange={handleSelectChange}
        components={{ Option: IconOption }}
        isSearchable={!isMobile}
        className="max-w-xs relative text-sm w-44"
        theme={theme => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: isDarkMode ? "#401574" : "#efeaff",
            primary50: isDarkMode ? "#551d98" : "#c1aeff",
            primary: isDarkMode ? "#BA8DE8" : "#551d98",
            neutral0: isDarkMode ? "#130C25" : theme.colors.neutral0,
            neutral80: isDarkMode ? "#ffffff" : theme.colors.neutral80,
          },
        })}
        styles={{
          menuList: provided => ({ ...provided, maxHeight: 280, overflow: "auto" }),
          control: provided => ({ ...provided, borderRadius: 12 }),
          indicatorSeparator: provided => ({ ...provided, display: "none" }),
          menu: provided => ({
            ...provided,
            border: `1px solid ${isDarkMode ? "#555555" : "#a3a3a3"}`,
          }),
        }}
      />
      <dialog id="see-all-modal" className="modal" ref={seeAllModalRef} onClose={handleModalClose}>
        <div className="flex flex-col modal-box justify-center px-12 h-3/4 sm:w-1/2 max-w-5xl bg-base-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">All Chains</h3>
            <div className="modal-action mt-0">
              <button className="hover:text-error" onClick={handleModalClose}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search chains..."
            className="input input-bordered w-full mb-4 bg-neutral"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            ref={searchInputRef}
          />

          <div className="flex flex-wrap content-start justify-center gap-4 overflow-y-auto h-5/6 p-2">
            {modalChains.map(option => (
              <div
                key={`${option.label}-${option.value}`}
                className="card shadow-md bg-base-100 cursor-pointer h-28 w-60 text-center"
                onClick={() => handleChainSelect(option)}
              >
                <div className="card-body flex flex-col justify-center items-center p-4">
                  <span className="text-sm font-semibold">Chain Id: {option.value}</span>
                  <span className="text-sm">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
};
