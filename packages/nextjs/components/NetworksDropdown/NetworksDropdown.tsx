import { useEffect, useRef, useState } from "react";
import { CustomOption, getIconComponent } from "./CustomOption";
import {
  GroupedOptions,
  Options,
  chainToOption,
  filterChains,
  formDataToChain,
  getStoredChainsFromLocalStorage,
  mapChainsToOptions,
  removeChainFromLocalStorage,
  storeChainInLocalStorage,
} from "./utils";
import * as wagmiChains from "@wagmi/core/chains";
import { useTheme } from "next-themes";
import Select, { MultiValue, SingleValue } from "react-select";
import { Chain } from "viem";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";
import { getPopularTargetNetworks, notification } from "~~/utils/scaffold-eth";

type Chains = Record<string, Chain>;

const networks = getPopularTargetNetworks();
const initialGroupedOptions = networks.reduce<GroupedOptions>(
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

export const NetworksDropdown = ({ onChange }: { onChange: (options: any) => any }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const [groupedOptionsState, setGroupedOptionsState] = useState(initialGroupedOptions);
  const [selectedOption, setSelectedOption] = useState<SingleValue<Options>>(initialGroupedOptions.mainnet.options[0]);
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

    const updateGroupedOptions = () => {
      const storedChains = getStoredChainsFromLocalStorage();
      const newGroupedOptions = { ...groupedOptionsState };

      storedChains.forEach(chain => {
        const groupName = chain.testnet ? "testnet" : "mainnet";
        if (!newGroupedOptions[groupName].options.some(option => option.value === chain.id)) {
          const option = chainToOption(chain);
          newGroupedOptions[groupName].options.push(option);
          addCustomChain(chain);
        }
      });

      setGroupedOptionsState(newGroupedOptions);
    };

    updateGroupedOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSelectOtherChainInModal = (option: Options) => {
    const groupName = option.testnet ? "testnet" : "mainnet";
    if (!groupedOptionsState[groupName].options.some(chain => chain.value === option.value)) {
      const newGroupedOptions = { ...groupedOptionsState };
      newGroupedOptions[groupName].options.push(option);
      setGroupedOptionsState(newGroupedOptions);
    }

    const chain = Object.values(filteredChains).find(chain => chain.id === option.value);

    storeChainInLocalStorage(chain as Chain);

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

    storeChainInLocalStorage(chain);

    const storedChains = getStoredChainsFromLocalStorage();

    if (storedChains.find(c => c.id === chain.id)) {
      if (customChainModalRef.current) {
        customChainModalRef.current.close();
      }
      e.currentTarget.reset();
      notification.error("This chain is already added!");
      return;
    }

    addCustomChain(chain);

    const newGroupedOptions = { ...groupedOptionsState };
    const groupName = chain.testnet ? "testnet" : "mainnet";
    const newOption = chainToOption(chain);
    newGroupedOptions[groupName].options.push(newOption);

    setGroupedOptionsState(newGroupedOptions);

    e.currentTarget.reset();

    setSelectedOption(newOption);
    onChange(newOption);

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

  const handleDeleteCustomChain = (option: Options) => {
    removeChainFromLocalStorage(+option.value);

    const newGroupedOptions = { ...groupedOptionsState };
    const groupName = option.testnet ? "testnet" : "mainnet";
    newGroupedOptions[groupName].options = newGroupedOptions[groupName].options.filter(
      chain => chain.value !== option.value,
    );

    setGroupedOptionsState(newGroupedOptions);

    if (selectedOption?.value === option.value) {
      setSelectedOption(newGroupedOptions.mainnet.options[0]);
      onChange(newGroupedOptions.mainnet.options[0]);
    }
  };

  const existingChainIds = new Set(
    Object.values(groupedOptionsState)
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
        defaultValue={groupedOptionsState["mainnet"].options[0]}
        instanceId="network-select"
        options={Object.values(groupedOptionsState)}
        onChange={handleSelectChange}
        components={{ Option: props => <CustomOption {...props} onDelete={handleDeleteCustomChain} /> }}
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
                onClick={() => handleSelectOtherChainInModal(option)}
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
            <input type="checkbox" name="testnet" className="checkbox checkbox-primary" />
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
