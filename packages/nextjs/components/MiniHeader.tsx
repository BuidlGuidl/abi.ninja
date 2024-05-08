import Image from "next/image";
import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export const MiniHeader = () => {
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
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
