import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as chains from "@wagmi/core/chains";
import { useTheme } from "next-themes";
import Select, { MultiValue, OptionProps, SingleValue, components } from "react-select";
import { EyeIcon } from "@heroicons/react/24/outline";
import { getPopularTargetNetworks } from "~~/utils/scaffold-eth";

type Options = {
  value: number | string;
  label: string;
  icon?: string;
};
type GroupedOptions = Record<
  "mainnet" | "testnet",
  {
    label: string;
    options: Options[];
  }
>;

const getIconComponent = (iconName: string | undefined) => {
  switch (iconName) {
    case "EyeIcon":
      return <EyeIcon className="h-6 w-6 mr-2 text-gray-500" />;
    default:
      return <Image src={iconName || "/mainnet.svg"} alt="default icon" width={24} height={24} className="mr-2" />;
  }
};

const networks = getPopularTargetNetworks();
const groupedOptions = networks.reduce<GroupedOptions>(
  (groups, network) => {
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
  },
);

groupedOptions.mainnet.options.push({
  value: "see-all",
  label: "See All Chains",
  icon: "EyeIcon",
});

const allChains = Object.values(chains).map(chain => ({
  value: chain.id,
  label: chain.name,
  icon: "",
}));

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

  const isDarkMode = resolvedTheme === "dark";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    if (selected?.value === "see-all") {
      const modal = document.getElementById("see-all-modal") as HTMLDialogElement;
      modal.showModal();
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      setSelectedOption(selected);
      onChange(selected);
    }
  };

  const filteredChains = allChains.filter(chain => chain.label.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!mounted) return null;
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
      <dialog id="see-all-modal" className="modal">
        <div className="flex flex-col modal-box justify-center p-12 h-3/4 w-11/12 max-w-5xl bg-base-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">All Chains</h3>
            <div className="modal-action mt-0">
              <button
                className="btn btn-error"
                onClick={() => (document.getElementById("see-all-modal") as HTMLDialogElement)?.close()}
              >
                Close
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
            {filteredChains.map(option => (
              <div
                key={`${option.label}-${option.value}`}
                className="card shadow-md bg-base-100 cursor-pointer h-28 w-60 text-center"
                onClick={() => {
                  setSelectedOption(option);
                  onChange(option);
                  (document.getElementById("see-all-modal") as HTMLDialogElement)?.close();
                }}
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
