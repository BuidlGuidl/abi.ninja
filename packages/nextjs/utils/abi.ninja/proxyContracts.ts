type BlockTag = number | "earliest" | "latest" | "pending";

interface RequestArguments {
  method: string;
  params: unknown[];
}

type EIP1193ProviderRequestFunc = (args: RequestArguments) => Promise<unknown>;

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

const detectProxyTarget = async (
  proxyAddress: string,
  jsonRpcRequest: EIP1193ProviderRequestFunc,
  blockTag: BlockTag = "latest",
): Promise<string | null> => {
  const strategies = [
    async () => {
      // EIP-1167 Minimal Proxy Contract
      const code: any = await jsonRpcRequest({
        method: "eth_getCode",
        params: [proxyAddress, blockTag],
      });
      return parse1167Bytecode(code);
    },
    async () => {
      // EIP-1967 Logic Slot
      const logicAddress = await jsonRpcRequest({
        method: "eth_getStorageAt",
        params: [proxyAddress, EIP_1967_LOGIC_SLOT, blockTag],
      });
      return readAddress(logicAddress);
    },
    async () => {
      // EIP-1967 Beacon Slot
      const beaconAddress = await jsonRpcRequest({
        method: "eth_getStorageAt",
        params: [proxyAddress, EIP_1967_BEACON_SLOT, blockTag],
      }).then(readAddress);
      for (const method of EIP_1167_BEACON_METHODS) {
        try {
          const result = await jsonRpcRequest({
            method: "eth_call",
            params: [{ to: beaconAddress, data: method }, blockTag],
          });
          return readAddress(result);
        } catch (error) {
          // Ignore errors and try the next method
        }
      }
      throw new Error("Beacon address resolution failed");
    },
    async () => {
      // OpenZeppelin Implementation Slot
      const implementationAddress = await jsonRpcRequest({
        method: "eth_getStorageAt",
        params: [proxyAddress, OPEN_ZEPPELIN_IMPLEMENTATION_SLOT, blockTag],
      });
      return readAddress(implementationAddress);
    },
    async () => {
      // EIP-1822 Logic Slot
      const uupsAddress = await jsonRpcRequest({
        method: "eth_getStorageAt",
        params: [proxyAddress, EIP_1822_LOGIC_SLOT, blockTag],
      });
      return readAddress(uupsAddress);
    },
    async () => {
      // EIP-897 DelegateProxy Pattern
      const delegateProxyAddress = await jsonRpcRequest({
        method: "eth_call",
        params: [{ to: proxyAddress, data: EIP_897_INTERFACE[0] }, blockTag],
      });
      return readAddress(delegateProxyAddress);
    },
    async () => {
      // Gnosis Safe Proxy Pattern
      const masterCopyAddress = await jsonRpcRequest({
        method: "eth_call",
        params: [{ to: proxyAddress, data: GNOSIS_SAFE_PROXY_INTERFACE[0] }, blockTag],
      });
      return readAddress(masterCopyAddress);
    },
    async () => {
      // Comptroller Proxy Pattern
      const comptrollerImplAddress = await jsonRpcRequest({
        method: "eth_call",
        params: [{ to: proxyAddress, data: COMPTROLLER_PROXY_INTERFACE[0] }, blockTag],
      });
      return readAddress(comptrollerImplAddress);
    },
  ];

  for (const strategy of strategies) {
    try {
      const result = await strategy();
      if (result) return result; // Return the first successful result
    } catch (error) {
      // Log error or handle it as needed
      console.error(error);
    }
  }

  return null; // Return null if all strategies fail
};

export default detectProxyTarget;
