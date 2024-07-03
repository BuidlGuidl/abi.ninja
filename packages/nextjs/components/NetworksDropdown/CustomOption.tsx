import Image from "next/image";
import { Options, isChainStored } from "./utils";
import { OptionProps, components } from "react-select";
import { EyeIcon, PlusIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const { Option } = components;

export const getIconComponent = (iconName: string | undefined) => {
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

type CustomOptionProps = OptionProps<Options, false, { label: string; options: Options[] }> & {
  onDelete: (chain: Options) => void;
};
export const CustomOption = (props: CustomOptionProps) => {
  const { data } = props;
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onDelete(data);
  };

  return (
    <Option {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {typeof data.icon === "string" ? getIconComponent(data.icon) : data.icon}
          {data.label}
        </div>

        {isChainStored(data) && (
          <div
            className="h-4 w-4 text-red-500 cursor-pointer font-bold flex items-center justify-center"
            onClick={handleDelete}
          >
            ✕
          </div>
        )}
      </div>
    </Option>
  );
};
