import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as wagmiChains from "@wagmi/core/chains";
import { useTheme } from "next-themes";
import Select, { MultiValue, OptionProps, SingleValue, components } from "react-select";
import { Chain } from "viem";
import { EyeIcon, PlusIcon, WrenchScrewdriverIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";
import {
  GroupedOptions,
  Options,
  chainToOption,
  filterChains,
  formDataToChain,
  getStoredCustomChains,
  getStoredOtherChains,
  mapChainsToOptions,
} from "~~/utils/abi-ninja/networksDropdownUtils";
import { getPopularTargetNetworks } from "~~/utils/scaffold-eth";

type Chains = Record<string, Chain>;

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
      testnet: network.testnet,
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

const excludeChainKeys = ["lineaTestnet", "x1Testnet"]; // duplicate chains in viem chains

const unfilteredChains: Chains = wagmiChains as Chains;

const filteredChains = Object.keys(unfilteredChains)
  .filter(key => !excludeChainKeys.includes(key))
  .reduce((obj: Chains, key) => {
    obj[key] = unfilteredChains[key];
    return obj;
  }, {} as Chains);

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
    addCustomChain: state.addChain,
  }));

  const searchInputRef = useRef<HTMLInputElement>(null);
  const seeOtherChainsModalRef = useRef<HTMLDialogElement>(null);
  const customChainModalRef = useRef<HTMLDialogElement>(null);

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
        addCustomChain(chain);
      }
    });

    const storedOtherChains = getStoredOtherChains();
    storedOtherChains.forEach(chain => {
      const groupName = chain.testnet ? "testnet" : "mainnet";
      if (!groupedOptions[groupName].options.some(option => option.value === chain.value)) {
        groupedOptions[groupName].options.push(chain);
      }
    });
  }, [addCustomChain]);

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
      if (!seeOtherChainsModalRef.current || !searchInputRef.current) return;
      seeOtherChainsModalRef.current.showModal();
      searchInputRef.current.focus();
    } else if (selected?.value === "custom-chains") {
      if (!customChainModalRef.current) return;
      customChainModalRef.current.showModal();
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
    if (seeOtherChainsModalRef.current) {
      seeOtherChainsModalRef.current.close();
    }
  };

  const handleSubmitCustomChain = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const chain = formDataToChain(formData);

    const storedCustomChains = [...getStoredCustomChains(), chain];
    localStorage.setItem("storedCustomChains", JSON.stringify(storedCustomChains));

    addCustomChain(chain);

    const option = chainToOption(chain);
    setSelectedOption(option);
    onChange(option);

    if (customChainModalRef.current) {
      customChainModalRef.current.close();
    }
  };

  const handleSeeOtherChainsModalClose = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      setSearchTerm("");
    }
    if (seeOtherChainsModalRef.current) {
      seeOtherChainsModalRef.current.close();
    }
  };

  const handleCloseCustomChainModalRef = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChainModalRef.current) {
      customChainModalRef.current.close();
    }
  };

  const existingChainIds = new Set(
    Object.values(groupedOptions)
      .flatMap(group => group.options.map(option => option.value))
      .filter(value => typeof value === "number") as number[],
  );

  const filteredChainsForModal = filterChains(filteredChains, networkIds, existingChainIds);

  const modalChains = mapChainsToOptions(filteredChainsForModal).filter(chain =>
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
        id="see-all-modal"
        className="modal"
        ref={seeOtherChainsModalRef}
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
        ref={customChainModalRef}
        onClose={handleCloseCustomChainModalRef}
      >
        <form method="dialog" className="modal-box p-12 bg-base-200" onSubmit={handleSubmitCustomChain}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">Add Custom Chain</h3>
            <div className="modal-action mt-0">
              <button className="hover:text-error" onClick={handleCloseCustomChainModalRef}>
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
