import Image from "next/image";
import Link from "next/link";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export const MiniHeader = () => {
  return (
    <div className="sticky lg:static top-0 navbar bg-white border-b border-secondary min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2 mb-10">
      <div className="navbar-start w-auto lg:w-1/2">
        <Link href="/" passHref className="hidden sm:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex items-center">
            <Image alt="Abi Ninja logo" src="/logo.png" width={50} height={50} />
            <span className="ml-2">
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
