import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import * as chains from "@wagmi/core/chains";
import { useTheme } from "next-themes";
import Select, { MultiValue, SingleValue, components } from "react-select";
import { defineChain } from "viem";
import { EyeIcon, PlusIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { getTargetNetworks, notification } from "~~/utils/scaffold-eth";

type Options = {
  value: number | string;
  label: string;
  icon?: string | ReactNode;
  rpcUrl?: string;
};

type GroupedOptions = Record<
  "mainnet" | "testnet" | "custom",
  {
    label: string;
    options: Options[];
  }
>;

const getIconComponent = (iconName: string | undefined) => {
  switch (iconName) {
    case "EyeIcon":
      return <EyeIcon className="h-6 w-6 mr-2 text-gray-500" />;
    case "PlusIcon":
      return <PlusIcon className="h-6 w-6 mr-2 text-gray-500" />;
    case "PuzzlePieceIcon":
      return <PuzzlePieceIcon className="h-6 w-6 mr-2 text-gray-500" />;
    default:
      return <Image src={iconName || "/mainnet.svg"} alt="default icon" width={24} height={24} className="mr-2" />;
  }
};

const networks = getTargetNetworks();
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
    custom: { label: "custom", options: [] },
  },
);

groupedOptions.mainnet.options.push({
  value: "see-all",
  label: "See All Chains",
  icon: "EyeIcon",
});

groupedOptions.mainnet.options.push({
  value: "add-custom-chain",
  label: "Add Custom Chain",
  icon: "PlusIcon",
});

const allChains = Object.values(chains).map(chain => ({
  value: chain.id,
  label: chain.name,
  icon: "",
}));

const { Option } = components;

const CustomOption = (props: any) => {
  const { selectProps, data } = props;
  const { optionDelete } = selectProps;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    optionDelete(data);
  };

  return (
    <Option {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {typeof props.data.icon === "string" ? getIconComponent(props.data.icon) : props.data.icon}
          {props.data.label}
        </div>
        {props.data.rpcUrl && (
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

export const NetworksDropdown = ({ onChange }: { onChange: (option: Options | null) => void }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<SingleValue<Options>>(groupedOptions.mainnet.options[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customChains, setCustomChains] = useState<Options[]>([]);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedChains = localStorage.getItem("customChains");
      if (storedChains) {
        setCustomChains(JSON.parse(storedChains));
      }
    }
  }, []);

  useEffect(() => {
    customChains.forEach(chain => {
      defineChain({
        id: chain.value as number,
        name: chain.label,
        //@ts-ignore : weird error here, ignoring for now
        rpcUrls: {
          default: { http: [chain.rpcUrl as string] },
        },
      });
    });
  }, [customChains]);

  const handleSelectChange = (newValue: SingleValue<Options> | MultiValue<Options>) => {
    const selected = newValue as SingleValue<Options>;
    if (selected?.value === "see-all") {
      (document.getElementById("see-all-modal") as HTMLDialogElement)?.showModal();
    } else if (selected?.value === "add-custom-chain") {
      (document.getElementById("add-custom-chain-modal") as HTMLDialogElement)?.showModal();
    } else {
      setSelectedOption(selected);
      onChange(selected);
    }
  };

  const handleAddCustomChain = (newChain: any) => {
    const existingChain =
      allChains.find(chain => chain.value === newChain.id) || customChains.find(chain => chain.value === newChain.id);

    if (existingChain) {
      notification.error(`This chain already exists with the name: ${existingChain.label}`);
      return;
    }

    const chain = defineChain(newChain);
    const chainOption: Options = {
      value: chain.id,
      label: chain.name,
      icon: "PuzzlePieceIcon",
      rpcUrl: chain.rpcUrl,
    };
    const updatedChains = [...customChains, chainOption];
    setCustomChains(updatedChains);
    if (typeof window !== "undefined") {
      localStorage.setItem("customChains", JSON.stringify(updatedChains));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newChain = {
      id: parseInt(formData.get("id") as string),
      name: formData.get("name") as string,
      rpcUrl: formData.get("rpcUrl") as string,
    };
    handleAddCustomChain(newChain);
    e.currentTarget.reset();
    (document.getElementById("add-custom-chain-modal") as HTMLDialogElement)?.close();
  };

  const handleDeleteCustomChain = (chain: Options) => {
    const updatedChains = customChains.filter(c => c.value !== chain.value);
    setCustomChains(updatedChains);
    if (typeof window !== "undefined") {
      localStorage.setItem("customChains", JSON.stringify(updatedChains));
    }
  };

  const filteredChains = [...allChains, ...customChains].filter(chain =>
    chain.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const combinedOptions = {
    ...groupedOptions,
    custom: {
      label: "custom",
      options: customChains,
    },
  };

  if (!mounted) return null;

  return (
    <>
      <Select
        value={selectedOption}
        instanceId="network-select"
        options={Object.values(combinedOptions)}
        onChange={handleSelectChange}
        components={{ Option: CustomOption }}
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
        //@ts-ignore @todo : fix this
        optionDelete={handleDeleteCustomChain}
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

      <dialog id="add-custom-chain-modal" className="modal">
        <form method="dialog" className="modal-box p-12 bg-base-200" onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">Add Custom Chain</h3>
            <div className="modal-action mt-0">
              <button
                type="button"
                className="btn btn-error"
                onClick={() => (document.getElementById("add-custom-chain-modal") as HTMLDialogElement)?.close()}
              >
                Close
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
              <span className="label-text">RPC URL</span>
            </label>
            <input type="text" name="rpcUrl" className="input input-bordered bg-neutral" required />
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
