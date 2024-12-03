import { useEffect, useRef, useState } from "react";
import {
  Options,
  chainToOption,
  filterChains,
  filteredChains,
  getStoredChainsFromLocalStorage,
  initialGroupedOptions,
  mapChainsToOptions,
  networkIds,
  removeChainFromLocalStorage,
  storeChainInLocalStorage,
} from "./utils";
import { useTheme } from "next-themes";
import Select, { MultiValue, SingleValue } from "react-select";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { AddCustomChainModal, CustomOption, OtherChainsModal } from "~~/components/NetworksDropdown";
import { useGlobalState } from "~~/services/store/store";

export const NetworksDropdown = ({ onChange }: { onChange: (options: any) => any }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const [groupedOptionsState, setGroupedOptionsState] = useState(initialGroupedOptions);
  const [selectedOption, setSelectedOption] = useState<SingleValue<Options>>(initialGroupedOptions.mainnet.options[0]);

  const { addCustomChain, removeChain, resetTargetNetwork, setTargetNetwork, chains } = useGlobalState(state => ({
    addCustomChain: state.addChain,
    removeChain: state.removeChain,
    resetTargetNetwork: () => state.setTargetNetwork(mainnet),
    setTargetNetwork: state.setTargetNetwork,
    chains: state.chains,
  }));

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
      if (seeOtherChainsModalRef.current) {
        seeOtherChainsModalRef.current.showModal();
      }
    } else if (selected?.value === "custom-chains") {
      if (customChainModalRef.current) {
        customChainModalRef.current.showModal();
      }
    } else {
      setSelectedOption(selected);
      if (selected) {
        const chain = Object.values(chains).find(chain => chain.id === selected.value);
        setTargetNetwork(chain as Chain);
      }
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

  const handleDeleteCustomChain = (option: Options) => {
    const chainId = +option.value;

    removeChain(chainId);
    removeChainFromLocalStorage(chainId);
    resetTargetNetwork();

    const newGroupedOptions = { ...groupedOptionsState };
    const groupName = option.testnet ? "testnet" : "mainnet";
    newGroupedOptions[groupName].options = newGroupedOptions[groupName].options.filter(
      chain => chain.value !== option.value,
    );

    setGroupedOptionsState(newGroupedOptions);

    if (selectedOption?.value === option.value) {
      const mainnet = newGroupedOptions.mainnet.options[0];
      setSelectedOption(mainnet);
      onChange(mainnet);
    }
  };

  const existingChainIds = new Set(
    Object.values(groupedOptionsState)
      .flatMap(group => group.options.map(option => option.value))
      .filter(value => typeof value === "number") as number[],
  );

  const filteredChainsForModal = filterChains(filteredChains, networkIds, existingChainIds);

  const modalChains = mapChainsToOptions(filteredChainsForModal);

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
      <OtherChainsModal
        ref={seeOtherChainsModalRef}
        modalChains={modalChains}
        onSelect={handleSelectOtherChainInModal}
      />
      <AddCustomChainModal
        ref={customChainModalRef}
        groupedOptionsState={groupedOptionsState}
        setGroupedOptionsState={setGroupedOptionsState}
        setSelectedOption={setSelectedOption}
        onChange={onChange}
      />
    </>
  );
};
