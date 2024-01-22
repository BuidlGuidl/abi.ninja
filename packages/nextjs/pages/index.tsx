import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Address, isAddress } from "viem";
import { usePublicClient } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { MiniFooter } from "~~/components/MiniFooter";
import { AddressInput, InputBase } from "~~/components/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { fetchContractABIFromAnyABI, fetchContractABIFromEtherscan, parseAndCorrectJSON } from "~~/utils/abi";
import { getTargetNetworks, notification } from "~~/utils/scaffold-eth";

const QUICK_ACCESS_ITEMS = [
  { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", name: "DAI" },
  { address: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f", name: "Gitcoin" },
  { address: "0x00000000006c3852cbef3e08e8df289169ede581", name: "Opensea" },
];

enum TabName {
  verifiedContract,
  addressAbi,
}

const tabValues = Object.values(TabName) as TabName[];

const networks = getTargetNetworks();

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState(TabName.verifiedContract);
  const [network, setNetwork] = useState(networks[1].id.toString());
  const [verifiedContractAddress, setVerifiedContractAddress] = useState<Address>("");
  const [verifiedContractInput, setVerifiedContractInput] = useState("");
  const [localAbiContractAddress, setLocalAbiContractAddress] = useState("");
  const [localContractAbi, setLocalContractAbi] = useState("");
  const [isFetchingAbi, setIsFetchingAbi] = useState(false);
  const [isCheckingContractAddress, setIsCheckingContractAddress] = useState(false);
  const [isContract, setIsContract] = useState(false);

  const publicClient = usePublicClient({
    chainId: parseInt(network),
  });

  const { setContractAbi, setAbiContractAddress } = useAbiNinjaState(state => ({
    setContractAbi: state.setContractAbi,
    setAbiContractAddress: state.setAbiContractAddress,
  }));

  const [isAbiAvailable, setIsAbiAvailable] = useState(false);

  const router = useRouter();

  const navigateToContract = (contractAddress: Address, netId: string) => {
    router.push(`/${contractAddress}/${netId}`);
  };

  const handleQuickAccess = async (address: Address, name: string) => {
    const abiFetched = await fetchAndStoreContractAbi(address, network);
    if (abiFetched) {
      navigateToContract(address, network);
    } else {
      notification.error(`Failed to load ABI for ${name}`);
    }
  };

  const fetchAndStoreContractAbi = async (contractAddress: Address, netId: string) => {
    setIsFetchingAbi(true);
    try {
      const parsedNetId = parseInt(netId);
      const abi = await fetchContractABIFromAnyABI(contractAddress, parsedNetId);
      if (abi) {
        setContractAbi(abi);
        setIsAbiAvailable(true);
      } else {
        const abiString = await fetchContractABIFromEtherscan(contractAddress, parsedNetId);
        const parsedAbi = JSON.parse(abiString);
        setContractAbi(parsedAbi);
        setIsAbiAvailable(true);
      }
      return true;
    } catch (e: unknown) {
      setIsAbiAvailable(false);
      if (e instanceof Error) {
        notification.error(e.message || "Error occurred while fetching ABI");
      } else {
        notification.error("An unknown error occurred while fetching ABI");
      }
      return false;
    } finally {
      setIsFetchingAbi(false);
    }
  };

  useEffect(() => {
    const checkContract = async () => {
      if (!isAddress(localAbiContractAddress)) {
        setIsContract(false);
        return;
      }

      setIsCheckingContractAddress(true);
      try {
        const bytecode = await publicClient.getBytecode({
          address: localAbiContractAddress,
        });
        const isContract = Boolean(bytecode) && bytecode !== "0x";
        setIsContract(isContract);

        if (!isContract) {
          notification.error("Address is not a contract");
        }
      } catch (e) {
        notification.error("Error while checking for contract address");
        setIsContract(false);
      } finally {
        setIsCheckingContractAddress(false);
      }
    };

    checkContract();
  }, [localAbiContractAddress, publicClient]);

  useEffect(() => {
    if (router.pathname === "/") {
      setContractAbi([]);
    }
  }, [router.pathname, setContractAbi]);

  const handleLoadContract = () => {
    if (activeTab === TabName.verifiedContract && isAbiAvailable) {
      router.push(`/${verifiedContractAddress}/${network}`);
    } else if (activeTab === TabName.addressAbi && isContract) {
      try {
        setContractAbi(parseAndCorrectJSON(localContractAbi));
        setAbiContractAddress(localAbiContractAddress);
        router.push(`/${localAbiContractAddress}/${network}`);
      } catch (error) {
        notification.error("Invalid ABI format. Please ensure it is a valid JSON.");
      }
    }
  };

  const handleVerifiedContractInput = async (input: string) => {
    setVerifiedContractInput(input);
    if (isAddress(input)) {
      setVerifiedContractAddress(input);
      await fetchAndStoreContractAbi(input, network);
    } else {
      setVerifiedContractAddress("");
      setIsAbiAvailable(false);
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
                          value={verifiedContractInput}
                          placeholder="Verified contract address"
                          onChange={handleVerifiedContractInput}
                        />
                        <div className="flex flex-col text-sm">
                          <div className="mb-2 mt-4 text-center font-semibold">Quick Access</div>
                          <div className="flex justify-around">
                            {QUICK_ACCESS_ITEMS.map(item => (
                              <button
                                key={item.address}
                                className="link w-1/3 text-center text-purple-700 no-underline"
                                onClick={() => handleQuickAccess(item.address, item.name)}
                              >
                                {item.name}
                              </button>
                            ))}
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
              {isFetchingAbi || isCheckingContractAddress ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Load Contract"
              )}
            </button>
          </div>
          <MiniFooter />
        </div>
      </div>
    </>
  );
};

export default Home;
