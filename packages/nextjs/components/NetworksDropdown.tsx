import { ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as chains from "@wagmi/core/chains";
import { useTheme } from "next-themes";
import Select, { MultiValue, OptionProps, SingleValue, components } from "react-select";
import { Chain } from "viem";
import { EyeIcon, PlusIcon, WrenchScrewdriverIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";
import { getPopularTargetNetworks } from "~~/utils/scaffold-eth";

type Options = {
  value: number | string;
  label: string;
  icon?: string | ReactNode;
  testnet?: boolean;
};

type GroupedOptions = Record<
  "mainnet" | "testnet" | "localhost" | "other" | "custom",
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
    case "PlusIcon":
      return <PlusIcon className="h-6 w-6 mr-2 text-gray-500" />;
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
    custom: {
      label: "custom",
      options: [
        {
          value: "custom-chains",
          label: "Add custom chain",
          icon: "PlusIcon",
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

const chainToOption = (chain: Chain): Options => ({
  value: chain.id,
  label: chain.name,
  icon: "",
});

export const getStoredCustomChains = (): Chain[] => {
  if (typeof window !== "undefined") {
    const storedCustomChains = localStorage.getItem("storedCustomChains");
    return storedCustomChains ? JSON.parse(storedCustomChains) : [];
  }
  return [];
};

export const getStoredOtherChains = (): Options[] => {
  if (typeof window !== "undefined") {
    const storedOtherChains = localStorage.getItem("storedOtherChains");
    return storedOtherChains ? JSON.parse(storedOtherChains) : [];
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

  const { addCustomChain } = useGlobalState(state => ({
    addCustomChain: state.addCustomChain,
  }));

  const searchInputRef = useRef<HTMLInputElement>(null);
  const seeOtherChainsModal = useRef<HTMLDialogElement>(null);
  const customChainModal = useRef<HTMLDialogElement>(null);

  const isDarkMode = resolvedTheme === "dark";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedCustomChains = getStoredCustomChains();
    storedCustomChains.forEach(chain => {
      const groupName = chain.testnet ? "testnet" : "mainnet";
      if (!groupedOptions[groupName].options.some(option => option.value === chain.id)) {
        const option = chainToOption(chain);
        groupedOptions[groupName].options.push(option);
      }
      addCustomChain(chain);
    });

    const storedOtherChains = getStoredOtherChains();
    storedOtherChains.forEach(chain => {
      const groupName = chain.testnet ? "testnet" : "mainnet";
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
      if (!seeOtherChainsModal.current || !searchInputRef.current) return;
      seeOtherChainsModal.current.showModal();
      searchInputRef.current.focus();
    }
    if (selected?.value === "custom-chains") {
      if (!customChainModal.current) return;
      customChainModal.current.showModal();
    } else {
      setSelectedOption(selected);
      onChange(selected);
    }
  };

  const handleSelectOtherChain = (option: Options) => {
    const groupName = option.testnet ? "testnet" : "mainnet";
    if (!groupedOptions[groupName].options.some(chain => chain.value === option.value)) {
      groupedOptions[groupName].options.push(option);
    }
    const storedOtherChains = [...getStoredOtherChains(), option];
    localStorage.setItem("storedOtherChains", JSON.stringify(storedOtherChains));

    setSelectedOption(option);
    onChange(option);
    if (seeOtherChainsModal.current) {
      seeOtherChainsModal.current.close();
    }
  };

  const handleSubmitCustomChain = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const chain = {
      id: Number(formData.get("id")),
      name: formData.get("name") as string,
      network: formData.get("name") as string,
      nativeCurrency: {
        name: formData.get("nativeCurrencyName") as string,
        symbol: formData.get("nativeCurrencySymbol") as string,
        decimals: Number(formData.get("nativeCurrencyDecimals")),
      },
      rpcUrls: {
        public: { http: [formData.get("rpcUrl") as string] },
        default: { http: [formData.get("rpcUrl") as string] },
      },
      testnet: formData.get("isTestnet") === "on",
    } as const satisfies Chain;

    const storedCustomChains = [...getStoredCustomChains(), chain];
    localStorage.setItem("storedCustomChains", JSON.stringify(storedCustomChains));

    addCustomChain(chain);

    const option = {
      value: chain.id,
      label: chain.name,
      rpcUrl: chain.rpcUrls.public.http[0],
      icon: "",
      isTestnet: chain.testnet,
    };
    setSelectedOption(option);
    onChange(option);

    if (customChainModal.current) {
      customChainModal.current.close();
    }
  };

  const handleSeeOtherChainsModalClose = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      setSearchTerm("");
    }
    if (seeOtherChainsModal.current) {
      seeOtherChainsModal.current.close();
    }
  };

  const handleCloseCustomChainModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChainModal.current) {
      customChainModal.current.close();
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
      <dialog
        id="see-other-chains-modal"
        className="modal"
        ref={seeOtherChainsModal}
        onClose={handleSeeOtherChainsModalClose}
      >
        <div className="flex flex-col modal-box justify-center px-12 h-3/4 sm:w-1/2 max-w-5xl bg-base-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">All Chains</h3>
            <div className="modal-action mt-0">
              <button className="hover:text-error" onClick={handleSeeOtherChainsModalClose}>
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
                onClick={() => handleSelectOtherChain(option)}
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

      <dialog
        id="add-custom-chain-modal"
        className="modal"
        ref={customChainModal}
        onClose={handleCloseCustomChainModal}
      >
        <form method="dialog" className="modal-box p-12 bg-base-200" onSubmit={handleSubmitCustomChain}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">Add Custom Chain</h3>
            <div className="modal-action mt-0">
              <button className="hover:text-error" onClick={handleCloseCustomChainModal}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Chain ID</span>
            </label>
            <input type="number" name="id" className="input input-bordered bg-neutral" required />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input type="text" name="name" className="input input-bordered bg-neutral" required />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Native Currency Name</span>
            </label>
            <input type="text" name="nativeCurrencyName" className="input input-bordered bg-neutral" required />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Native Currency Symbol</span>
            </label>
            <input type="text" name="nativeCurrencySymbol" className="input input-bordered bg-neutral" required />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Native Currency Decimals</span>
            </label>
            <input type="number" name="nativeCurrencyDecimals" className="input input-bordered bg-neutral" required />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">RPC URL</span>
            </label>
            <input type="text" name="rpcUrl" className="input input-bordered bg-neutral" required />
          </div>
          <div className="form-control flex-row mt-4 items-center gap-4">
            <label className="label">
              <span className="label-text">Testnet?</span>
            </label>
            <input type="checkbox" name="isTestnet" className="checkbox checkbox-primary" />
          </div>
          <div className="modal-action mt-6">
            <button type="submit" className="btn btn-primary">
              Add Chain
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};
