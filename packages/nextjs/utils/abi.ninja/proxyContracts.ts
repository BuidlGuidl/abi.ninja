import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const EIP_1967_LOGIC_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const EIP_1967_BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";
const OPEN_ZEPPELIN_IMPLEMENTATION_SLOT = "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3";
const EIP_1822_LOGIC_SLOT = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7";

const EIP_1167_BEACON_METHODS = [
  "0x5c60da1b00000000000000000000000000000000000000000000000000000000",
  "0xda52571600000000000000000000000000000000000000000000000000000000",
];

const EIP_897_INTERFACE = ["0x5c60da1b00000000000000000000000000000000000000000000000000000000"];

const GNOSIS_SAFE_PROXY_INTERFACE = ["0xa619486e00000000000000000000000000000000000000000000000000000000"];

const COMPTROLLER_PROXY_INTERFACE = ["0xbb82aa5e00000000000000000000000000000000000000000000000000000000"];

const readAddress = (value: unknown): string => {
  if (typeof value !== "string" || value === "0x") {
    throw new Error(`Invalid address value: ${value}`);
  }
  const address = value.length === 66 ? "0x" + value.slice(-40) : value;
  const zeroAddress = "0x" + "0".repeat(40);
  if (address === zeroAddress) {
    throw new Error("Empty address");
  }
  return address;
};

const parse1167Bytecode = (bytecode: string): string => {
  const EIP_1167_BYTECODE_PREFIX = "0x363d3d373d3d3d363d";
  const EIP_1167_BYTECODE_SUFFIX = "57fd5bf3";

  if (!bytecode.startsWith(EIP_1167_BYTECODE_PREFIX)) {
    throw new Error("Not an EIP-1167 bytecode");
  }

  // The address is encoded after the prefix and a 'push' opcode that indicates the length of the address.
  // Since EIP-1167 proxy contracts are meant to be minimal, the address should be exactly 20 bytes long,
  // but we will parse it dynamically to accommodate non-standard implementations that might use shorter representations.

  // Find the start index of the address, which is immediately after the prefix and the 'push' opcode.
  const startIndex = EIP_1167_BYTECODE_PREFIX.length + 2; // 2 characters for the push opcode

  // Validate the suffix to ensure it's a correct EIP-1167 bytecode pattern.
  const suffixIndex = bytecode.indexOf(EIP_1167_BYTECODE_SUFFIX, startIndex);
  if (suffixIndex === -1) {
    throw new Error("Not an EIP-1167 bytecode");
  }

  // Extract the address from the bytecode.
  const addressHex = bytecode.substring(startIndex, suffixIndex);

  // Ensure the extracted address is 40 characters long, padding if necessary.
  if (addressHex.length > 40) {
    throw new Error("Invalid EIP-1167 bytecode: Address length exceeds 20 bytes");
  }

  const address = `0x${addressHex.padStart(40, "0")}`;

  return address;
};

const detectProxyTarget = async (proxyAddress: string): Promise<string | null> => {
  const strategies = [
    async () => {
      const bytecode = await publicClient.getBytecode({
        address: proxyAddress,
      });
      return parse1167Bytecode(bytecode as string);
    },
    async () => {
      const data = await publicClient.getStorageAt({
        address: proxyAddress,
        slot: EIP_1967_LOGIC_SLOT,
      });
      return readAddress(data);
    },
    async () => {
      const data = await publicClient.getStorageAt({
        address: proxyAddress,
        slot: EIP_1967_BEACON_SLOT,
      });

      const beaconAdress = readAddress(data);
      for (const method of EIP_1167_BEACON_METHODS) {
        try {
          const result = await publicClient.call({
            data: method as `0x${string}`,
            to: beaconAdress,
          });
          return readAddress(result);
        } catch (error) {
          // Ignore errors and try the next method
        }
      }
      throw new Error("Beacon address resolution failed");
    },
    async () => {
      const data = await publicClient.getStorageAt({
        address: proxyAddress,
        slot: OPEN_ZEPPELIN_IMPLEMENTATION_SLOT,
      });
      return readAddress(data);
    },
    async () => {
      const data = await publicClient.getStorageAt({
        address: proxyAddress,
        slot: EIP_1822_LOGIC_SLOT,
      });
      return readAddress(data);
    },
    async () => {
      const data = await publicClient.call({
        data: EIP_897_INTERFACE[0] as `0x${string}`,
        to: proxyAddress,
      });
      return readAddress(data);
    },
    async () => {
      const data = await publicClient.call({
        data: GNOSIS_SAFE_PROXY_INTERFACE[0] as `0x${string}`,
        to: proxyAddress,
      });
      return readAddress(data);
    },
    async () => {
      const data = await publicClient.call({
        data: COMPTROLLER_PROXY_INTERFACE[0] as `0x${string}`,
        to: proxyAddress,
      });
      return readAddress(data);
    },
  ];

  for (const strategy of strategies) {
    try {
      const result = await strategy();
      if (result) return result;
    } catch (error) {
      console.error(error);
    }
  }

  return null;
};

export default detectProxyTarget;
