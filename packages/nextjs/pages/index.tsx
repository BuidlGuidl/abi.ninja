import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Address, isAddress } from "viem";
import { usePublicClient } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { MiniFooter } from "~~/components/MiniFooter";
import { NetworksDropdown } from "~~/components/NetworksDropdown";
import { AddressInput, InputBase } from "~~/components/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { fetchContractABIFromAnyABI, fetchContractABIFromEtherscan, parseAndCorrectJSON } from "~~/utils/abi";
import { getTargetNetworks, notification } from "~~/utils/scaffold-eth";

enum TabName {
  verifiedContract,
  addressAbi,
}

enum AbiInputMethod {
  Manual,
  Heimdall,
}

const tabValues = Object.values(TabName) as TabName[];

const networks = getTargetNetworks();

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState(TabName.verifiedContract);
  const [network, setNetwork] = useState(networks[1].id.toString());
  const [verifiedContractAddress, setVerifiedContractAddress] = useState<Address>("");
  const [localAbiContractAddress, setLocalAbiContractAddress] = useState("");
  const [localContractAbi, setLocalContractAbi] = useState("");
  const [isFetchingAbi, setIsFetchingAbi] = useState(false);
  const [abiInputMethod, setAbiInputMethod] = useState(AbiInputMethod.Manual);

  const publicClient = usePublicClient({
    chainId: parseInt(network),
  });

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
        const abi = await fetchContractABIFromAnyABI(verifiedContractAddress, parseInt(network));
        if (!abi) throw new Error("Got empty or undefined ABI from AnyABI");
        setContractAbi(abi);
        setIsAbiAvailable(true);
      } catch (error) {
        console.error("Error fetching ABI from AnyABI: ", error);
        console.log("Trying to fetch ABI from Etherscan...");
        try {
          const abiString = await fetchContractABIFromEtherscan(verifiedContractAddress, parseInt(network));
          const abi = JSON.parse(abiString);
          setContractAbi(abi);
          setIsAbiAvailable(true);
        } catch (etherscanError: any) {
          setIsAbiAvailable(false);
          console.error("Error fetching ABI from Etherscan: ", etherscanError);

          const bytecode = await publicClient.getBytecode({
            address: verifiedContractAddress,
          });
          const isContract = Boolean(bytecode) && bytecode !== "0x";

          if (isContract) {
            notification.error(
              "The contract is not verified on Etherscan. Please provide ABI manually or decompile ABI(experimental)",
              {
                duration: 10000,
                position: "bottom-left",
              },
            );
            setLocalAbiContractAddress(verifiedContractAddress);
            setActiveTab(TabName.addressAbi);
          } else {
            notification.error("Address is not a contract, are you sure you are on the correct chain?");
          }
        }
      } finally {
        setIsFetchingAbi(false);
      }
    };

    if (isAddress(verifiedContractAddress)) {
      if (network === "31337") {
        notification.error("To interact with Localhost contracts, please use Address + ABI tab");
        return;
      }
      fetchContractAbi();
    } else {
      setIsAbiAvailable(false);
    }
  }, [verifiedContractAddress, network, setContractAbi]);

  useEffect(() => {
    if (router.pathname === "/") {
      setContractAbi([]);
    }
  }, [router.pathname, setContractAbi]);

  const handleLoadContract = () => {
    if (isAbiAvailable) {
      router.push(`/${verifiedContractAddress}/${network}`);
    } else if (localContractAbi.length > 0) {
      try {
        setContractAbi(parseAndCorrectJSON(localContractAbi));
      } catch (error) {
        notification.error("Invalid ABI format. Please ensure it is a valid JSON.");
        return;
      }
      setAbiContractAddress(localAbiContractAddress);
      router.push(`/${localAbiContractAddress}/${network}`);
    } else {
      fetchAbiFromHeimdall(localAbiContractAddress);
    }
  };

  const fetchAbiFromHeimdall = async (contractAddress: string) => {
    setIsFetchingAbi(true);
    try {
      const response = await fetch(`https://heimdall-api-cool-frog-2068.fly.dev/${network}/${contractAddress}`);
      const abi = await response.json();
      setContractAbi(abi);
      setIsAbiAvailable(true);
      setAbiContractAddress(contractAddress);
      router.push(`/${contractAddress}/${network}`);
    } catch (error) {
      console.error("Error fetching ABI from Heimdall: ", error);
      notification.error("Failed to fetch ABI from Heimdall. Please try again or enter ABI manually.");
      setIsAbiAvailable(false);
    } finally {
      setIsFetchingAbi(false);
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
            <div className="mt-4">
              <NetworksDropdown onChange={option => setNetwork(option ? option.value.toString() : "")} />
            </div>
            {activeTab === TabName.addressAbi && (
              <div
                className="text-sm link link-primary my-2"
                onClick={() => {
                  setActiveTab(TabName.verifiedContract);
                  setVerifiedContractAddress("");
                }}
              >
                ← go back
              </div>
            )}
            {/* placeholder to match height @todo make this better, bad practice! */}
            {activeTab === TabName.verifiedContract && <div className="text-sm text-white my-2">‎</div>}
            <div className="relative min-h-[150px] overflow-hidden w-[375px]">
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
                          placeholder="Contract address"
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
                      <div className="flex w-full flex-col gap-3">
                        {/* Tab navigation */}
                        <div className="flex w-full border-b">
                          <div
                            role="tab"
                            className={`inline-block px-4 py-2 text-xs whitespace-nowrap font-medium text-center w-1/2 cursor-pointer ${
                              abiInputMethod === AbiInputMethod.Manual
                                ? "border-b-2 border-purple-500 text-purple-500"
                                : "border-b-2 border-transparent text-gray-500 hover:text-purple-700"
                            }`}
                            onClick={() => setAbiInputMethod(AbiInputMethod.Manual)}
                          >
                            Input ABI Manually
                          </div>
                          <div
                            role="tab"
                            className={`inline-block px-4 py-2 text-xs font-medium text-center w-1/2 cursor-pointer ${
                              abiInputMethod === AbiInputMethod.Heimdall
                                ? "border-b-2 border-purple-500 text-purple-500"
                                : "border-b-2 border-transparent text-gray-500 hover:text-purple-700"
                            }`}
                            onClick={() => setAbiInputMethod(AbiInputMethod.Heimdall)}
                          >
                            Decompile ABI
                          </div>
                        </div>

                        {/* Content based on active tab */}
                        {abiInputMethod === AbiInputMethod.Manual ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <AddressInput
                              placeholder="Contract address"
                              value={localAbiContractAddress}
                              onChange={setLocalAbiContractAddress}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {activeTab !== TabName.verifiedContract && abiInputMethod === AbiInputMethod.Heimdall && (
                <div className="text-xs mt-24 text-center">
                  Warning: this feature is experimental. You may lose funds if you interact with contracts using this
                  feature.
                </div>
              )}
            </div>

            <button
              className="btn btn-primary px-8 text-base border-2 hover:bg-white hover:text-primary"
              onClick={handleLoadContract}
              disabled={
                (activeTab === TabName.verifiedContract && (!isAbiAvailable || !verifiedContractAddress)) ||
                (activeTab === TabName.addressAbi &&
                  abiInputMethod === AbiInputMethod.Manual &&
                  (!localContractAbi || localContractAbi.length === 0)) ||
                (activeTab === TabName.addressAbi &&
                  abiInputMethod === AbiInputMethod.Heimdall &&
                  !isAddress(localAbiContractAddress))
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
