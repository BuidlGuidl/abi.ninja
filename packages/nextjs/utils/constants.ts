// The abi.ninja engine: the resolution ladder (Etherscan → Sourcify → proxy →
// heimdall decompile → 4byte) + provenance, behind one endpoint. The frontend talks
// to it via @portdeveloper/abi-ninja-sdk instead of resolving client-side.
export const ABI_NINJA_API_URL = "https://abi-ninja-engine.fly.dev";

// Legacy direct-heimdall URL — retained only for the cypress decompile spec; the app
// no longer calls heimdall directly (the engine ladder does, server-side).
export const HEIMDALL_API_URL = "https://heimdall-api-v2.fly.dev";
