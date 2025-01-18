import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, Cog6ToothIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { removeAbiFromLocalStorage } from "~~/utils/abi";

export const MiniHeader = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { savedAbiData, setSavedAbiData, contractAddress } = useGlobalState(state => ({
    savedAbiData: state.savedAbiData,
    setSavedAbiData: state.setSavedAbiData,
    contractAddress: state.abiContractAddress,
  }));

  const handleRemoveSavedAbi = () => {
    removeAbiFromLocalStorage(contractAddress);
    setSavedAbiData(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="sticky lg:static top-0 navbar bg-base-200 border-b border-secondary min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <label htmlFor="sidebar" className="btn btn-ghost drawer-button sm:hidden ml-2">
          <Bars3Icon className="h-1/2" />
        </label>
        <Link href="/" passHref className="flex items-center gap-2 sm:ml-4 mr-6 shrink-0">
          <div className="flex items-center">
            <Image alt="Abi Ninja logo" src="/logo_inv.svg" width={50} height={50} />
            <span className="hidden sm:flex ml-2">
              <strong>ABI</strong> <span>Ninja</span>
            </span>
          </div>
        </Link>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <button
          className="mr-4 hover:transition-all hover:scale-110"
          onClick={() => {
            const modal = document.getElementById("configuration-modal") as HTMLDialogElement;
            modal?.showModal();
          }}
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </button>
        <dialog id="configuration-modal" className="modal">
          <div className="modal-box max-w-2xl bg-base-200 p-0">
            <div className="flex justify-between items-center p-4 border-b border-base-300">
              <h3 className="font-bold text-xl">Configuration</h3>
              <form method="dialog">
                <button className="btn btn-ghost btn-sm hover:bg-error/20 hover:text-error rounded-lg">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </form>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Local Storage</h2>
                <div className="space-y-3 text-base-content/80">
                  <p>
                    🥷abi.ninja saves the ABI to the browser&apos;s local storage when you search for a contract for the
                    first time. If you have an abi saved for the current contract, you will be able to remove it by
                    clicking the button below.
                  </p>
                  <p>If you&apos;re interacting with a verified contract. This setting does not matter.</p>
                  <p>If you&apos;re not sure what this is, you can safely ignore this.</p>
                </div>
              </div>

              {showSuccess && (
                <div className="alert alert-success">
                  <span>ABI removed successfully! Please reload the page to see the changes.</span>
                </div>
              )}

              {savedAbiData && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleRemoveSavedAbi}
                    className="btn btn-error gap-2 hover:btn-error/80"
                    title="Remove saved ABI"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove saved ABI
                  </button>
                </div>
              )}
            </div>
          </div>
        </dialog>
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
