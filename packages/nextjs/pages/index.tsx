import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { HeartIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState("verifiedContract");
  const [network, setNetwork] = useState("mainnet");
  const [verifiedContractAddress, setVerifiedContractAddress] = useState("");
  // const [abiContractAddress, setAbiContractAddress] = useState("");
  // const [contractAbi, setContractAbi] = useState("");

  const [isAbiAvailable, setIsAbiAvailable] = useState(false);

  const router = useRouter();

  const fetchContractABI = async () => {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${verifiedContractAddress}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "1") {
        console.log("Contract ABI:", data.result);
        setIsAbiAvailable(true);
      } else {
        console.error("Error fetching ABI:", data.result);
        setIsAbiAvailable(false);
      }
    } catch (error) {
      console.error("Error fetching ABI:", error);
      setIsAbiAvailable(false);
    }
  };

  useEffect(() => {
    if (verifiedContractAddress) {
      fetchContractABI();
      console.log("fetching contract abi inside useeffect...");
    }
  }, [verifiedContractAddress]);

  const loadAddressAndAbi = useCallback(() => {
    console.log("Loading Address + ABI");
  }, []);

  const loadVerifiedContract = useCallback(async () => {
    try {
      await fetchContractABI();
      router.push(`/${verifiedContractAddress}/${network}`);
    } catch (error) {
      console.error("Error in loading verified contract:", error);
    }
  }, [verifiedContractAddress, network]);

  const handleLoadContract = () => {
    if (activeTab === "verifiedContract") {
      loadVerifiedContract();
    } else if (activeTab === "addressAbi") {
      loadAddressAndAbi();
    }
  };

  return (
    <>
      <MetaHeader />
      <div className="flex flex-grow items-center justify-center bg-base-100">
        <div className="flex h-screen w-full flex-col items-center justify-center rounded-2xl bg-white p-2 lg:h-[650px] lg:w-[450px] lg:justify-between lg:shadow-xl">
          <div className="mt-10 flex w-7/12 flex-col items-center justify-center lg:w-10/12">
            <Image src="/logo_inv.svg" alt="logo" width={128} height={128} className="mb-4" />
            <h2 className="mb-0 text-5xl font-bold">ABI Ninja</h2>
            <p className="">Interact with any contract on Ethereum</p>
            <div className="my-4">
              <select
                className="select select-sm w-36 max-w-xs bg-slate-50"
                value={network}
                onChange={e => setNetwork(e.target.value)}
              >
                <option value="localhost">Localhost</option>
                <option value="mainnet">Mainnet</option>
                <option value="optimism">Optimism</option>
              </select>
            </div>

            <div role="tablist" className="flex w-full border-b">
              <a
                role="tab"
                className={`inline-block px-4 py-2 text-sm w-full font-medium text-center border-b-2 hover:cursor-pointer${
                  activeTab === "verifiedContract"
                    ? "border-purple-500 "
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("verifiedContract")}
              >
                Verified Contract
              </a>
              <a
                role="tab"
                className={`inline-block px-4 py-2 text-sm w-full font-medium text-center border-b-2 hover:cursor-pointer${
                  activeTab === "addressAbi"
                    ? "border-purple-500 "
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("addressAbi")}
              >
                Address + ABI
              </a>
            </div>

            <div className="min-h-[150px] w-full">
              {activeTab === "verifiedContract" && (
                <div className="my-4">
                  <input
                    type="text"
                    placeholder="Verified contract address"
                    className="input h-9 w-full bg-slate-100"
                    onChange={e => setVerifiedContractAddress(e.target.value)}
                  />
                  <div className="flex flex-col text-sm">
                    <div className="mb-2 mt-4 text-center font-semibold">Quick Access</div>
                    <div className="flex justify-around">
                      <Link
                        href="/placeholder"
                        passHref
                        className="link w-1/3 text-center text-purple-700 no-underline"
                      >
                        DAI
                      </Link>
                      <Link
                        href="/placeholder"
                        passHref
                        className="link w-1/3 text-center text-purple-700 no-underline"
                      >
                        Gitcoin
                      </Link>
                      <Link
                        href="/placeholder"
                        passHref
                        className="link w-1/3 text-center text-purple-700 no-underline"
                      >
                        Opensea
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "addressAbi" && (
                <div className="my-4 flex w-full flex-col gap-3">
                  <input type="text" placeholder="Contract address" className="input h-9 w-full bg-slate-100" />
                  <input placeholder="Contract ABI(json format)" className="input h-9 w-full bg-slate-100" />
                </div>
              )}
            </div>

            <button className="btn btn-primary w-1/2" onClick={handleLoadContract} disabled={!isAbiAvailable}>
              Load Contract
            </button>
          </div>
          <div className="mt-10">
            <ul className="menu menu-horizontal w-full">
              <div className="flex w-full items-center justify-center gap-2 text-xs">
                <div className="text-center">
                  <a href="https://github.com/scaffold-eth/se-2" target="_blank" rel="noreferrer" className="link">
                    Fork me
                  </a>
                </div>
                <span>·</span>
                <div className="flex items-center justify-center gap-2">
                  <p className="m-0 text-center">
                    Built with <HeartIcon className="inline-block h-4 w-4" /> at
                  </p>
                  <a
                    className="flex items-center justify-center gap-1"
                    href="https://buidlguidl.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <BuidlGuidlLogo className="h-5 w-3 pb-1" />
                    <span className="link">BuidlGuidl</span>
                  </a>
                </div>
                <span>·</span>
                <div className="text-center">
                  <a
                    href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA"
                    target="_blank"
                    rel="noreferrer"
                    className="link"
                  >
                    Support
                  </a>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
