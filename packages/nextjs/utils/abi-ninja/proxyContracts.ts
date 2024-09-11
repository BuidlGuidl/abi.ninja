import { Address } from "viem";
import { UsePublicClientReturnType } from "wagmi";

const EIP_1967_LOGIC_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as const;
const EIP_1967_BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50" as const;
const OPEN_ZEPPELIN_IMPLEMENTATION_SLOT = "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3" as const;
const EIP_1822_LOGIC_SLOT = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7" as const;
const EIP_1167_BEACON_METHODS = [
  "0x5c60da1b00000000000000000000000000000000000000000000000000000000",
  "0xda52571600000000000000000000000000000000000000000000000000000000",
] as const;
const EIP_897_INTERFACE = ["0x5c60da1b00000000000000000000000000000000000000000000000000000000"] as const;
const GNOSIS_SAFE_PROXY_INTERFACE = ["0xa619486e00000000000000000000000000000000000000000000000000000000"] as const;
const COMPTROLLER_PROXY_INTERFACE = ["0xbb82aa5e00000000000000000000000000000000000000000000000000000000"] as const;

const readAddress = (value: string | undefined): Address => {
  if (typeof value !== "string" || value === "0x") {
    throw new Error(`Invalid address value: ${value}`);
  }
  const address = value.length === 66 ? "0x" + value.slice(-40) : value;
  const zeroAddress = "0x" + "0".repeat(40);
  if (address === zeroAddress) {
    throw new Error("Empty address");
  }
  return address as Address;
};

const EIP_1167_BYTECODE_PREFIX = "0x363d3d373d3d3d363d";
const EIP_1167_BYTECODE_SUFFIX = "57fd5bf3";

export const parse1167Bytecode = (bytecode: unknown): Address => {
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
  return `0x${addressFromBytecode.padStart(40, "0")}` as Address;
};

export const detectProxyTarget = async (proxyAddress: Address, client: UsePublicClientReturnType) => {
  if (!client) {
    console.error("No client provided");
    return;
  }
  const detectUsingBytecode = async () => {
    const bytecode = await client.getBytecode({ address: proxyAddress });
    return parse1167Bytecode(bytecode);
  };

  const detectUsingEIP1967LogicSlot = async () => {
    const logicAddress = await client.getStorageAt({ address: proxyAddress, slot: EIP_1967_LOGIC_SLOT });
    return readAddress(logicAddress);
  };

  const detectUsingEIP1967BeaconSlot = async () => {
    const beaconAddress = await client.getStorageAt({ address: proxyAddress, slot: EIP_1967_BEACON_SLOT });
    const resolvedBeaconAddress = readAddress(beaconAddress);
    for (const method of EIP_1167_BEACON_METHODS) {
      try {
        const data = await client.call({ data: method as `0x${string}`, to: resolvedBeaconAddress });
        return readAddress(data.data);
      } catch {
        // Ignore individual beacon method call failures
      }
    }
    throw new Error("Beacon method calls failed");
  };

  const detectUsingOpenZeppelinSlot = async () => {
    const implementationAddr = await client.getStorageAt({
      address: proxyAddress,
      slot: OPEN_ZEPPELIN_IMPLEMENTATION_SLOT,
    });
    const resolvedAddress = readAddress(implementationAddr);
    if (resolvedAddress === "0x" + "0".repeat(40)) {
      throw new Error("Zero address in OpenZeppelin implementation slot");
    }
    return resolvedAddress;
  };

  const detectionMethods = [
    detectUsingBytecode,
    detectUsingEIP1967LogicSlot,
    detectUsingEIP1967BeaconSlot,
    detectUsingOpenZeppelinSlot,
  ];

  try {
    return await Promise.any(detectionMethods.map(method => method()));
  } catch (primaryError) {
    const detectUsingEIP1822LogicSlot = async () => {
      const logicAddress = await client.getStorageAt({ address: proxyAddress, slot: EIP_1822_LOGIC_SLOT });
      return readAddress(logicAddress);
    };

    const detectUsingInterfaceCalls = async (data: `0x${string}`) => {
      const { data: resultData } = await client.call({ data, to: proxyAddress });
      return readAddress(resultData);
    };

    const nextDetectionMethods = [
      detectUsingEIP1822LogicSlot,
      () => detectUsingInterfaceCalls(EIP_897_INTERFACE[0]),
      () => detectUsingInterfaceCalls(GNOSIS_SAFE_PROXY_INTERFACE[0]),
      () => detectUsingInterfaceCalls(COMPTROLLER_PROXY_INTERFACE[0]),
    ];

    try {
      return await Promise.any(nextDetectionMethods.map(method => method()));
    } catch (finalError) {
      console.error("All detection methods failed:", finalError);
      return null;
    }
  }
};
