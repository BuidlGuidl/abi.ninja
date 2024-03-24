import { useEffect, useState } from "react";
import Image from "next/image";
import Select, { OptionProps, components } from "react-select";
import { useDarkMode } from "usehooks-ts";
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
  const { isDarkMode } = useDarkMode();

  const lightThemeColors = {
    border: "#551d98",
    hover: "#c1aeff",
    background: "#f4f8ff",
    textColor: "#353535",
  };

  const darkThemeColors = {
    border: "#c1aeff",
    hover: "#503E9D",
    background: "#303030",
    textColor: "#cccccc",
  };

  const themeColors = isDarkMode ? darkThemeColors : lightThemeColors;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 640px)");
      setIsMobile(mediaQuery.matches);

      const handleResize = () => setIsMobile(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleResize);
      return () => mediaQuery.removeEventListener("change", handleResize);
    }
  }, []);

  return (
    <Select
      defaultValue={groupedOptions["mainnet"].options[0]}
      instanceId="network-select"
      options={Object.values(groupedOptions)}
      onChange={onChange}
      components={{ Option: IconOption }}
      isSearchable={!isMobile}
      className="text-sm w-44 max-w-xs relative"
      theme={theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: themeColors.border, // Used for the control's border color
          primary25: themeColors.hover, // Background color for the option when hovered
          neutral0: themeColors.background, // Used for the background color of the control
          neutral80: themeColors.textColor, // Used for the text color
        },
      })}
    />
  );
};
