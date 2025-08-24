import { Options, isChainStored } from "./utils";
import { NetworkIcon } from "@web3icons/react";
import { OptionProps, components } from "react-select";
import { EyeIcon, PlusIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const { Option } = components;
const OptionComponent = Option as any;

export const getIconComponent = (data: Options) => {
  switch (data.icon) {
    case "EyeIcon":
      return <EyeIcon className="h-6 w-6 mr-2 text-gray-500" />;
    case "localhost":
      return <WrenchScrewdriverIcon className="h-6 w-6 mr-2 text-gray-500" />;
    case "PlusIcon":
      return <PlusIcon className="h-6 w-6 mr-2 text-gray-500" />;
    default:
      return <NetworkIcon chainId={data.value} variant="branded" size={24} fallback={"/mainnet.svg"} />;
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
    <OptionComponent {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIconComponent(data)}
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
    </OptionComponent>
  );
};
