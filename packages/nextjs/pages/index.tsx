import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { isAddress } from "viem";
import { MetaHeader } from "~~/components/MetaHeader";
import { MiniFooter } from "~~/components/MiniFooter";
import { AddressInput, InputBase } from "~~/components/scaffold-eth";
import { fetchContractABIFromEtherscan } from "~~/utils/abi-ninja";

enum TabName {
  verifiedContract,
  addressAbi,
}
const tabValues = Object.values(TabName) as TabName[];

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState(TabName.verifiedContract);
  const [network, setNetwork] = useState("mainnet");
  const [verifiedContractAddress, setVerifiedContractAddress] = useState("");
  const [abiContractAddress, setAbiContractAddress] = useState("");
  const [contractAbi, setContractAbi] = useState("");

  const [isAbiAvailable, setIsAbiAvailable] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchContractAbi = async () => {
      try {
        const abi = await fetchContractABIFromEtherscan(verifiedContractAddress);
        console.log("data: ", abi);
        setIsAbiAvailable(true);
      } catch (e) {
        console.error("Error while getting abi: ", e);
        setIsAbiAvailable(false);
      }
    };

    if (isAddress(verifiedContractAddress)) {
      fetchContractAbi();
    }
  }, [verifiedContractAddress]);

  const handleLoadContract = () => {
    if (activeTab === TabName.verifiedContract) {
      router.push(`/${verifiedContractAddress}/${network}`);
    } else {
      console.log("Loading Address + ABI");
    }
  };

  return (
    <>
      <MetaHeader />
      <div className="flex flex-grow items-center justify-center bg-base-100">
        <div className="flex h-screen w-full flex-col items-center justify-center rounded-2xl bg-white p-2 lg:h-[650px] lg:w-[450px] lg:justify-between lg:shadow-xl">
          <div className="mt-10 flex flex-col items-center justify-center lg:w-10/12">
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
                className={`inline-block px-2 py-2 text-sm w-full font-medium text-center border-b-2 hover:cursor-pointer ${
                  activeTab === TabName.verifiedContract
                    ? "border-purple-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(TabName.verifiedContract)}
              >
                Verified Contract
              </a>
              <a
                role="tab"
                className={`inline-block px-4 py-2 text-sm w-full font-medium text-center border-b-2 hover:cursor-pointer ${
                  activeTab === TabName.addressAbi
                    ? "border-purple-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(TabName.addressAbi)}
              >
                Address + ABI
              </a>
            </div>

            <div className="relative min-h-[150px] w-full overflow-hidden">
              <div className="flex">
                {tabValues.map(tabValue => (
                  <div
                    key={tabValue}
                    className={`absolute inset-0 w-full transition-transform duration-300 ease-in-out px-1 ${
                      activeTab === tabValue
                        ? "translate-x-0"
                        : activeTab < tabValue
                        ? "translate-x-full"
                        : "-translate-x-full"
                    }`}
                  >
                    {tabValue === TabName.verifiedContract ? (
                      <div className="my-4">
                        <AddressInput
                          value={verifiedContractAddress}
                          placeholder="Verified contract address"
                          onChange={setVerifiedContractAddress}
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
                    ) : (
                      <div className="my-4 flex w-full flex-col gap-3">
                        <AddressInput
                          placeholder="Contract address"
                          value={abiContractAddress}
                          onChange={setAbiContractAddress}
                        />
                        <InputBase
                          placeholder="Contract ABI (json format)"
                          value={contractAbi}
                          onChange={setContractAbi}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary px-8 text-base border-2 hover:bg-white hover:text-primary"
              onClick={handleLoadContract}
              disabled={!isAbiAvailable || !isAddress(verifiedContractAddress)}
            >
              Load Contract
            </button>
          </div>
          <MiniFooter />
        </div>
      </div>
    </>
  );
};

export default Home;
