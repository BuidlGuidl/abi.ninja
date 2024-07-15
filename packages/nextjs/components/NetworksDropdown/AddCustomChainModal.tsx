import { forwardRef } from "react";
import {
  GroupedOptions,
  chainToOption,
  formDataToChain,
  getStoredChainsFromLocalStorage,
  storeChainInLocalStorage,
} from "./utils";
import { Options } from "./utils";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

type AddCustomChainModalProps = {
  groupedOptionsState: GroupedOptions;
  setGroupedOptionsState: React.Dispatch<React.SetStateAction<GroupedOptions>>;
  setSelectedOption: React.Dispatch<React.SetStateAction<Options | null>>;
  onChange: (option: Options | null) => void;
};

export const AddCustomChainModal = forwardRef<HTMLDialogElement, AddCustomChainModalProps>(
  ({ groupedOptionsState, setGroupedOptionsState, setSelectedOption, onChange }, ref) => {
    const { addCustomChain } = useGlobalState(state => ({
      addCustomChain: state.addChain,
    }));

    const handleSubmitCustomChain = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const chain = formDataToChain(formData);

      const storedChains = getStoredChainsFromLocalStorage();

      if (storedChains.find(c => c.id === chain.id)) {
        handleCloseModal();
        e.currentTarget.reset();
        notification.error("This chain is already added!");
        return;
      }

      storeChainInLocalStorage(chain);
      addCustomChain(chain);

      const newGroupedOptions = { ...groupedOptionsState };
      const groupName = chain.testnet ? "testnet" : "mainnet";
      const newOption = chainToOption(chain);
      newGroupedOptions[groupName].options.push(newOption);

      setGroupedOptionsState(newGroupedOptions);

      e.currentTarget.reset();

      setSelectedOption(newOption);
      onChange(newOption);

      handleCloseModal();
    };

    const handleCloseModal = () => {
      if (ref && "current" in ref && ref.current) {
        ref.current.close();
      }
    };

    return (
      <dialog id="add-custom-chain-modal" className="modal" ref={ref}>
        <form method="dialog" className="modal-box p-12 bg-base-200" onSubmit={handleSubmitCustomChain}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">Add Custom Chain</h3>
            <div className="modal-action mt-0">
              <button className="hover:text-error" type="button" onClick={handleCloseModal}>
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
    );
  },
);

AddCustomChainModal.displayName = "AddCustomChainModal";
