import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { Address, Chain, createPublicClient, http } from "viem";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const contractAbi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

const networks = getTargetNetworks();
const baseUrl = process.env.VERCEL_URL ? "https://abi.ninja" : `http://localhost:${process.env.PORT || 3000}`;

// Caching maps
const contractNameCache = new Map<string, string>();
const networkCache = new Map<number, { name: string; icon: string | null }>();

const findChainById = (chainId: number): Chain => {
  const chainEntries = Object.entries(chains as Record<string, Chain>);

  for (const [, chain] of chainEntries) {
    if (chain.id === chainId) {
      return chain;
    }
  }

  throw new Error(`No chain found with ID ${chainId}`);
};

const createPublicClientByChainId = (chainId: number) => {
  const chain = findChainById(chainId);
  const alchemyBaseURL = chain.rpcUrls?.alchemy?.http[0];
  const alchemyURL = alchemyBaseURL ? `${alchemyBaseURL}/${scaffoldConfig.alchemyApiKey}` : undefined;

  return createPublicClient({
    chain: chain,
    transport: http(alchemyURL),
  });
};

const getNetworkData = (networkId: number) => {
  if (networkCache.has(networkId)) {
    return networkCache.get(networkId);
  }

  const network = networks.find(n => n.id === networkId);
  const data = {
    name: network ? network.name : "Unknown Network",
    icon: network && network.icon ? baseUrl + network.icon : null,
  };
  networkCache.set(networkId, data);
  return data;
};

const getContractName = async (contractAddress: Address, networkId: number) => {
  const cacheKey = `${networkId}-${contractAddress}`;
  if (contractNameCache.has(cacheKey)) {
    return contractNameCache.get(cacheKey);
  }

  try {
    const publicClient = createPublicClientByChainId(networkId);

    const data = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "name",
    });
    contractNameCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error reading contract:", error);
    return ""; // Return empty string for errors
  }
};

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const contractAddress = searchParams.get("contractAddress");
  const networkId = searchParams.get("network") || "1";

  if (!contractAddress) {
    return new Response("Missing 'contractAddress' query parameter", { status: 400 });
  }

  const { name: networkName, icon: networkIcon } = getNetworkData(+networkId);
  const contractName = await getContractName(contractAddress, +networkId);

  return new ImageResponse(
    (
      <div tw="flex w-full h-full bg-white">
        <div tw="flex flex-col w-2/5 justify-center items-center">
          <div tw="text-xl font-bold">{contractName || "Unnamed Contract"}</div>
          <div tw="text-lg">{networkName}</div>
          {networkIcon && <img src={networkIcon} alt={`${networkName} icon`} />}
        </div>
        <div tw="flex-1 flex justify-center items-center bg-gray-100">
          <div tw="text-gray-500">Your custom content here</div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 400,
    }
  );
}
