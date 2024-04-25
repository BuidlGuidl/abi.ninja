import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { Address, Chain, createPublicClient, http } from "viem";
import * as chains from "viem/chains";
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
  return createPublicClient({
    chain: findChainById(chainId),
    transport: http(),
  });
};

const getNetworkName = (networkId: number): string => {
  const network = networks.find(n => n.id === networkId);
  return network ? network.name : "Unknown Network";
};

const getContractName = async (contractAddress: Address, networkId: number) => {
  try {
    const publicClient = createPublicClientByChainId(networkId);

    const data = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "name",
    });
    return data;
  } catch (error) {
    console.error("Error reading contract:", error);
    return ""; // return empty string
  }
};

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (!searchParams.has("contractAddress")) {
    return new Response("Missing 'contractAddress' query parameter", { status: 400 });
  }
  const contractAddress = searchParams.get("contractAddress");
  const networkId = searchParams.get("network") || "1";

  const networkName = getNetworkName(+networkId);

  const contractName = await getContractName(contractAddress as string, +networkId);

  return new ImageResponse(
    (
      <div tw="flex w-full h-full bg-white">
        <div tw="flex flex-col w-2/5 justify-center items-center">
          <div tw="flex mb-5">
            <svg width="334" height="251" viewBox="0 0 257 193" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0.842773 177.082H10.565L14.7589 166.533H33.4409L37.6983 177.082H47.4841L29.3741 132.601H18.8257L0.842773 177.082ZM18.1903 158.018L24.0999 143.213L30.0731 158.018H18.1903Z"
                fill="black"
              />
              <path
                d="M51.542 177.082H73.4012C81.2171 177.082 86.4913 171.68 86.4913 164.436C86.4913 159.671 84.1401 155.858 80.1368 153.634C82.9963 151.791 84.712 148.36 84.712 144.229C84.712 137.684 79.9462 132.601 72.2574 132.601H51.542V177.082ZM60.4382 150.203V140.925H70.923C74.2908 140.925 76.1971 142.768 76.1971 145.373C76.1971 148.36 74.3543 150.203 70.9865 150.203H60.4382ZM60.4382 168.757V158.209H71.4949C75.1169 158.209 77.2138 160.433 77.2138 163.483C77.2138 166.533 75.1169 168.757 71.4949 168.757H60.4382Z"
                fill="black"
              />
              <path d="M91.8776 177.082H100.774V132.601H91.8776V177.082Z" fill="black" />
              <path
                d="M123.236 177.082H129.273L129.4 140.862L154.182 177.082H161.426V132.601H155.389V168.249L130.988 132.601H123.236V177.082Z"
                fill="black"
              />
              <path
                d="M169.643 177.082H175.679V146.453H169.643V177.082ZM172.629 133.363C170.342 133.363 168.562 135.206 168.562 137.43C168.562 139.718 170.342 141.497 172.629 141.497C174.853 141.497 176.633 139.718 176.633 137.43C176.633 135.206 174.853 133.363 172.629 133.363Z"
                fill="black"
              />
              <path
                d="M183.295 177.082H189.331V160.56C189.331 154.651 192.381 150.965 197.211 150.965C201.532 150.965 203.692 153.443 203.692 158.463V177.082H209.729V157.256C209.729 149.948 205.726 145.5 199.054 145.5C194.796 145.5 191.555 147.216 189.331 150.012V146.453H183.295V177.082Z"
                fill="black"
              />
              <path
                d="M205.99 184.199C205.99 189.028 209.739 192.332 214.886 192.332C220.923 192.332 224.608 188.202 224.608 182.356V146.453H218.572V182.61C218.572 185.215 217.237 186.804 214.95 186.804C212.853 186.804 211.518 185.597 211.455 183.309L205.99 184.199ZM221.685 133.363C219.398 133.363 217.618 135.206 217.618 137.43C217.618 139.718 219.398 141.497 221.685 141.497C223.909 141.497 225.689 139.718 225.689 137.43C225.689 135.206 223.909 133.363 221.685 133.363Z"
                fill="black"
              />
              <path
                d="M242.742 158.654C235.053 159.925 231.177 163.038 231.177 168.885C231.177 173.46 234.672 178.035 241.662 178.035C245.792 178.035 248.715 176.129 250.431 173.269V177.082H256.086V156.43C256.086 149.631 251.638 145.437 243.568 145.437C236.578 145.437 230.923 149.694 231.304 157.447L237.023 157.891L236.96 157.002C236.96 153.126 239.438 150.647 243.695 150.647C248.016 150.647 250.367 152.871 250.367 156.112V157.383L242.742 158.654ZM242.806 172.57C239.184 172.57 236.896 170.854 236.896 168.249C236.896 165.39 239.501 164.119 243.632 163.356L250.367 162.276V164.055C250.367 169.139 247.19 172.57 242.806 172.57Z"
                fill="black"
              />
              <ellipse cx="125.617" cy="42.7977" rx="43.6459" ry="39.5338" stroke="#B091FB" stroke-width="5.7944" />
              <path
                d="M81.9707 38.0975C87.5236 35.7015 102.827 28.9492 126.283 28.9492C149.738 28.9492 164.82 35.7015 168.596 38.0975"
                stroke="#B091FB"
                stroke-width="5.7944"
              />
              <path
                d="M85.9096 25.7735C90.9444 23.4391 105.084 17.0948 126.267 17.2651C147.45 17.4354 161.509 23.3711 164.899 25.7732"
                stroke="#B091FB"
                stroke-width="4.10476"
              />
              <path
                d="M95.5388 33.4533C95.5388 39.8132 93.0162 49.7215 103.154 55.0655C113.292 60.4095 114.846 49.6583 126.268 49.6583C137.04 49.6583 138.176 58.0189 148.39 55.0655C155.697 52.9529 156.246 38.9197 155.329 32.8248"
                stroke="#B091FB"
                stroke-width="4.10476"
              />
              <path
                d="M78.1447 7.53263C79.6636 12.4212 82.8915 21.3982 87.7628 21.5589C86.3842 24.2162 84.7892 28.9637 82.4705 34.1542C77.1533 36.3294 65.9858 36.9683 57.9133 35.089C57.4229 33.3938 57.3418 26.3323 56.6338 22.9507C63.2408 26.3944 78.0169 28.374 79.2116 26.1151C79.2116 26.1151 68.6214 16.0888 67.1292 10.3947C67.1292 10.3947 75.9978 9.88098 78.1447 7.53263Z"
                fill="#B091FB"
              />
              <ellipse
                cx="112.956"
                cy="41.1267"
                rx="2.33222"
                ry="2.28708"
                fill="#B091FB"
                stroke="#B091FB"
                stroke-width="2.13331"
              />
              <ellipse
                cx="136.945"
                cy="41.1267"
                rx="2.33222"
                ry="2.28708"
                fill="#B091FB"
                stroke="#B091FB"
                stroke-width="2.13331"
              />
              <path
                d="M98.1364 48.6451C95.1776 45.0501 94.8638 37.5042 95.172 34.2088L80.4954 39.6013C79.879 44.6943 81.9748 55.9587 91.591 67.4628C103.611 81.8429 124.878 84.5391 146.145 77.3491C167.411 70.159 170.185 42.2976 169.261 39.6013C168.521 37.4443 160.391 34.3227 156.384 32.8248C156.384 34.6223 154.565 38.5781 155.305 42.1732C156.23 46.6669 153.868 51.1622 147.395 52.9597C140.923 54.7572 136.073 49.5439 131.45 48.6451C126.827 47.7463 120.788 48.6451 113.238 52.9597C106.402 56.8659 101.835 53.1389 98.1364 48.6451Z"
                fill="#B091FB"
              />
              <path
                d="M157.24 15.7188C151.692 8.52876 140.696 3.78016 131.45 2.88141C111.108 1.08389 100.72 9.04262 95.172 14.4351C89.9007 19.5588 85.1186 27.0187 86.9679 25.2212C88.8172 23.4237 113.802 16.645 125.822 16.645C140.204 16.645 155.083 21.9258 162.788 24.3224C162.48 23.1241 161.679 21.4709 157.24 15.7188Z"
                fill="#B091FB"
              />
              <rect
                x="188.284"
                y="10.4926"
                width="10.0771"
                height="20.5543"
                rx="1.52379"
                transform="rotate(39.5223 188.284 10.4926)"
                fill="#B091FB"
              />
              <rect
                x="171.517"
                y="20.2609"
                width="22.8414"
                height="3.52359"
                rx="0.761897"
                transform="rotate(39.5223 171.517 20.2609)"
                fill="#B091FB"
              />
              <rect
                x="174.229"
                y="26.7572"
                width="11.0603"
                height="23.3793"
                transform="rotate(39.5223 174.229 26.7572)"
                stroke="#B091FB"
                stroke-width="3.04759"
              />
              <path
                d="M68.3263 52.1085L74.1363 104.839C74.2981 106.308 75.5388 107.419 77.0161 107.419H172.359C173.817 107.419 175.048 106.336 175.233 104.89L181.982 52.1045C182.201 50.3918 180.893 48.869 179.167 48.8443C143.452 48.3349 85.8644 48.7825 71.189 48.8773C69.4633 48.8884 68.1373 50.3932 68.3263 52.1085Z"
                fill="#B091FB"
              />
              <circle cx="125.892" cy="78.8388" r="8.9888" fill="white" />
            </svg>
          </div>
        </div>
        <div tw="flex flex-col py-20 justify-center items-center text-[#551d98] w-3/5 bg-purple-100 ">
          <div tw="mb-10 p-3 px-5 rounded-xl text-4xl bg-purple-200">{networkName}</div>
          <div tw="mb-10 p-3 px-5 rounded-xl font-bold text-7xl">{contractName}</div>
          <div tw="flex flex-col w-4/5 justify-center items-center">
            <div
              style={{
                wordBreak: "break-all",
              }}
              tw="flex w-[595px] text-center"
            >
              <div tw="p-2 bg-purple-50 text-5xl rounded-xl">{contractAddress}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
