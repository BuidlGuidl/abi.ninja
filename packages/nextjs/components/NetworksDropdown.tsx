import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import Select, { OptionProps, components } from "react-select";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

type Options = {
  value: number;
  label: string;
  icon?: string;
};
type GroupedOptions = Record<
  "mainnet" | "testnet" | "localhost",
  {
    label: string;
    options: Options[];
  }
>;

const networks = getTargetNetworks();
const groupedOptions = networks.reduce<GroupedOptions>(
  (groups, network) => {
    // Handle the case for localhost
    if (network.id === 31337) {
      groups.localhost.options.push({
        value: network.id,
        label: network.name,
        icon: network.icon,
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
  },
);

const { Option } = components;
const IconOption = (props: OptionProps<Options>) => (
  <Option {...props}>
    <div className="flex items-center">
      <Image src={props.data.icon || "/mainnet.svg"} alt={props.data.label} width={24} height={24} className="mr-2" />
      {props.data.label}
    </div>
  </Option>
);

export const NetworksDropdown = ({ onChange }: { onChange: (options: any) => any }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();

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

  if (!mounted) return null;
  return (
    <Select
      defaultValue={groupedOptions["mainnet"].options[0]}
      instanceId="network-select"
      options={Object.values(groupedOptions)}
      onChange={onChange}
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
  );
};
