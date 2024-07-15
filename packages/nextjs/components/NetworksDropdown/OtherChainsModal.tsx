import { forwardRef, useRef, useState } from "react";
import { Options } from "./utils";
import { XMarkIcon } from "@heroicons/react/24/outline";

type OtherChainsModalProps = {
  modalChains: Options[];
  onSelect: (option: Options) => void;
};

export const OtherChainsModal = forwardRef<HTMLDialogElement, OtherChainsModalProps>(
  ({ modalChains, onSelect }, ref) => {
    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredChains = modalChains.filter(chain =>
      `${chain.label} ${chain.value}`.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <dialog id="see-other-chains-modal" className="modal" ref={ref}>
        <div className="flex flex-col modal-box justify-center px-12 h-3/4 sm:w-1/2 max-w-5xl bg-base-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">All Chains</h3>
            <form method="dialog">
              <div className="modal-action mt-0">
                <button className="hover:text-error">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </form>
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
                onClick={() => onSelect(option)}
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
    );
  },
);

OtherChainsModal.displayName = "OtherChainsModal";
