import { PublicClient } from "wagmi";

const EIP_1967_LOGIC_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as const;
const EIP_1967_BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50" as const;
// const OPEN_ZEPPELIN_IMPLEMENTATION_SLOT = "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3";
const EIP_1822_LOGIC_SLOT = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7" as const;
const EIP_1167_BEACON_METHODS = [
  "0x5c60da1b00000000000000000000000000000000000000000000000000000000",
  "0xda52571600000000000000000000000000000000000000000000000000000000",
] as const;
const EIP_897_INTERFACE = ["0x5c60da1b00000000000000000000000000000000000000000000000000000000"] as const;
const GNOSIS_SAFE_PROXY_INTERFACE = ["0xa619486e00000000000000000000000000000000000000000000000000000000"] as const;
const COMPTROLLER_PROXY_INTERFACE = ["0xbb82aa5e00000000000000000000000000000000000000000000000000000000"] as const;

const readAddress = (value: string | undefined) => {
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

const EIP_1167_BYTECODE_PREFIX = "0x363d3d373d3d3d363d";
const EIP_1167_BYTECODE_SUFFIX = "57fd5bf3";

export const parse1167Bytecode = (bytecode: unknown): string => {
  if (typeof bytecode !== "string" || !bytecode.startsWith(EIP_1167_BYTECODE_PREFIX)) {
    throw new Error("Not an EIP-1167 bytecode");
  }

  // detect length of address (20 bytes non-optimized, 0 < N < 20 bytes for vanity addresses)
  const pushNHex = bytecode.substring(EIP_1167_BYTECODE_PREFIX.length, EIP_1167_BYTECODE_PREFIX.length + 2);
  // push1 ... push20 use opcodes 0x60 ... 0x73
  const addressLength = parseInt(pushNHex, 16) - 0x5f;

  if (addressLength < 1 || addressLength > 20) {
    throw new Error("Not an EIP-1167 bytecode");
  }

  const addressFromBytecode = bytecode.substring(
    EIP_1167_BYTECODE_PREFIX.length + 2,
    EIP_1167_BYTECODE_PREFIX.length + 2 + addressLength * 2, // address length is in bytes, 2 hex chars make up 1 byte
  );

  const SUFFIX_OFFSET_FROM_ADDRESS_END = 22;
  if (
    !bytecode
      .substring(EIP_1167_BYTECODE_PREFIX.length + 2 + addressLength * 2 + SUFFIX_OFFSET_FROM_ADDRESS_END)
      .startsWith(EIP_1167_BYTECODE_SUFFIX)
  ) {
    throw new Error("Not an EIP-1167 bytecode");
  }

  // padStart is needed for vanity addresses
  return `0x${addressFromBytecode.padStart(40, "0")}`;
};

export const detectProxyTarget = async (proxyAddress: string, client: PublicClient): Promise<string | null> => {
  try {
    return await Promise.any([
      (async () => {
        const bytecode = await client.getBytecode({ address: proxyAddress });
        return parse1167Bytecode(bytecode);
      })(),
      (async () => {
        const logicAddress = await client.getStorageAt({ address: proxyAddress, slot: EIP_1967_LOGIC_SLOT });
        return readAddress(logicAddress);
      })(),
      (async () => {
        const beaconAddress = await client.getStorageAt({ address: proxyAddress, slot: EIP_1967_BEACON_SLOT });
        const resolvedBeaconAddress = readAddress(beaconAddress);
        for (const method of EIP_1167_BEACON_METHODS) {
          try {
            const data = await client.call({ data: method, to: resolvedBeaconAddress });
            return readAddress(data.data);
          } catch {
            // Ignore
          }
        }
        throw new Error("Beacon method calls failed");
      })(),
    ]);
  } catch (error) {
    try {
      return await Promise.any([
        (async () => {
          const logicAddress = await client.getStorageAt({ address: proxyAddress, slot: EIP_1822_LOGIC_SLOT });
          return readAddress(logicAddress);
        })(),
        (async () => {
          const { data } = await client.call({ data: EIP_897_INTERFACE[0], to: proxyAddress });
          return readAddress(data);
        })(),
        (async () => {
          const { data } = await client.call({
            data: GNOSIS_SAFE_PROXY_INTERFACE[0],
            to: proxyAddress,
          });
          return readAddress(data);
        })(),
        (async () => {
          const { data } = await client.call({
            data: COMPTROLLER_PROXY_INTERFACE[0],
            to: proxyAddress,
          });
          return readAddress(data);
        })(),
      ]);
    } catch (fallbackError) {
      // @todo can't return null?
      return null;
    }
  }
};
