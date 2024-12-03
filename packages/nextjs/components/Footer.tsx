import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Faucet } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const targetNetwork = useGlobalState(state => state.targetNetwork);
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0 fixed bottom-0 right-0 w-full z-40">
      <div>
        <div className="fixed flex justify-end items-center w-full z-10 p-4 bottom-0 right-0 pointer-events-none">
          <div className="flex flex-col items-end md:flex-row md:items-start gap-2 pointer-events-auto">
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal normal-case gap-1">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
