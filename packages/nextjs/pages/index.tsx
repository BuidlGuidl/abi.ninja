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
import detectProxyTarget from "~~/utils/abi.ninja/proxyContracts";
import { getTargetNetworks, notification } from "~~/utils/scaffold-eth";

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
  const [localAbiContractAddress, setLocalAbiContractAddress] = useState("");
  const [localContractAbi, setLocalContractAbi] = useState("");
  const [isFetchingAbi, setIsFetchingAbi] = useState(false);
  const [isCheckingContractAddress, setIsCheckingContractAddress] = useState(false);
  const [isContract, setIsContract] = useState(false);

  const publicClient = usePublicClient({
    chainId: parseInt(network),
  });

  const { setContractAbi, setAbiContractAddress, setImplementationAddress } = useAbiNinjaState(state => ({
    setContractAbi: state.setContractAbi,
    setAbiContractAddress: state.setAbiContractAddress,
    setImplementationAddress: state.setImplementationAddress,
  }));

  const [isAbiAvailable, setIsAbiAvailable] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchContractAbi = async () => {
      setIsFetchingAbi(true);
      try {
        const implementationAddress = await detectProxyTarget(verifiedContractAddress);
        if (implementationAddress) {
          setImplementationAddress(implementationAddress);
        }
        const abi = await fetchContractABIFromAnyABI(
          implementationAddress || verifiedContractAddress,
          parseInt(network),
        );
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
          notification.error(etherscanError.message || "Error occurred while fetching ABI");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedContractAddress, network, setContractAbi]);

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
    if (activeTab === TabName.verifiedContract) {
      router.push(`/${verifiedContractAddress}/${network}`);
    } else if (activeTab === TabName.addressAbi) {
      try {
        setContractAbi(parseAndCorrectJSON(localContractAbi));
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
              <NetworksDropdown onChange={option => setNetwork(option ? option.value.toString() : "")} />
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
                (activeTab === TabName.verifiedContract && (!isAbiAvailable || !verifiedContractAddress)) ||
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
