import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Address, createPublicClient, http, isAddress } from "viem";
import * as chains from "viem/chains";
import { MetaHeader } from "~~/components/MetaHeader";
import { MiniFooter } from "~~/components/MiniFooter";
import { AddressInput, InputBase } from "~~/components/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { fetchContractABIFromEtherscan, getNetworksWithEtherscanApi } from "~~/utils/abi";
import { notification } from "~~/utils/scaffold-eth";

export const publicClient = createPublicClient({
  chain: chains.mainnet,
  transport: http(),
});

enum TabName {
  verifiedContract,
  addressAbi,
}

const tabValues = Object.values(TabName) as TabName[];

const networks = getNetworksWithEtherscanApi();

const isContractAddress = async (address: Address) => {
  if (!isAddress(address)) return false;

  const bytecode = await publicClient.getBytecode({
    address,
  });

  return bytecode !== "0x";
};

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState(TabName.verifiedContract);
  const [network, setNetwork] = useState(chains.mainnet.id.toString());
  const [verifiedContractAddress, setVerifiedContractAddress] = useState<Address>("");
  const [localAbiContractAddress, setLocalAbiContractAddress] = useState("");
  const [localContractAbi, setLocalContractAbi] = useState("");
  const [isFetchingAbi, setIsFetchingAbi] = useState(false);
  const [isContract, setIsContract] = useState(false);

  const { setContractAbi, setAbiContractAddress } = useAbiNinjaState(state => ({
    setContractAbi: state.setContractAbi,
    setAbiContractAddress: state.setAbiContractAddress,
  }));

  const [isAbiAvailable, setIsAbiAvailable] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchContractAbi = async () => {
      setIsFetchingAbi(true);
      try {
        const abi = await fetchContractABIFromEtherscan(verifiedContractAddress, parseInt(network));
        console.log("data: ", abi); // @todo remove this
        setIsAbiAvailable(true);
      } catch (e: any) {
        setIsAbiAvailable(false);
        if (e.message) {
          notification.error(e.message);
          return;
        }
        notification.error("Error occured while fetching abi");
      } finally {
        setIsFetchingAbi(false);
      }
    };

    if (isAddress(verifiedContractAddress)) {
      fetchContractAbi();
    }
  }, [verifiedContractAddress, network]);

  useEffect(() => {
    const checkContract = async () => {
      const result = await isContractAddress(localAbiContractAddress);
      console.log("isContract: ", result);
      setIsContract(result);
    };

    checkContract();
  }, [localAbiContractAddress]);

  useEffect(() => {
    if (router.pathname === "/") {
      setContractAbi([]);
    }
  }, [router.pathname, setContractAbi]);

  const handleLoadContract = () => {
    if (activeTab === TabName.verifiedContract) {
      router.push(`/${verifiedContractAddress}/${network}`);
    } else if (activeTab === TabName.addressAbi) {
      try {
        setContractAbi(JSON.parse(localContractAbi));
      } catch (error) {
        notification.error("Invalid ABI format. Please ensure it is a valid JSON.");
        return;
      }
      setAbiContractAddress(localAbiContractAddress);
      router.push(`/${localAbiContractAddress}/${network}`);
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
                {networks.map(network => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
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
                              href="/0x6B175474E89094C44Da98b954EedeAC495271d0F/1"
                              passHref
                              className="link w-1/3 text-center text-purple-700 no-underline"
                            >
                              DAI
                            </Link>
                            <Link
                              href="/0xde30da39c46104798bb5aa3fe8b9e0e1f348163f/1"
                              passHref
                              className="link w-1/3 text-center text-purple-700 no-underline"
                            >
                              Gitcoin
                            </Link>
                            <Link
                              href="/0x00000000006c3852cbef3e08e8df289169ede581/1"
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
                          value={localAbiContractAddress}
                          onChange={setLocalAbiContractAddress}
                        />
                        <InputBase
                          placeholder="Contract ABI (json format)"
                          value={localContractAbi}
                          onChange={setLocalContractAbi}
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
              disabled={
                (activeTab === TabName.verifiedContract && !isAbiAvailable) ||
                (activeTab === TabName.addressAbi &&
                  (!isContract || !localContractAbi || localContractAbi.length === 0))
              }
            >
              {isFetchingAbi ? <span className="loading loading-spinner"></span> : "Load Contract"}
            </button>
          </div>
          <MiniFooter />
        </div>
      </div>
    </>
  );
};

export default Home;
