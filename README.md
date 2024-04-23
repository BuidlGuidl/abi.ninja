# ABI Ninja

Interact with any contract on Ethereum. ABI Ninja provides an intuitive frontend for contracts from most popular EVM networks, currently supporting:

- **Verified contracts**. Pulls the code from [AnyABI](https://anyabi.xyz/) and [Etherscan API](https://docs.etherscan.io/) as a fallback option.
- **Unverified contracts**. Two different options are available:
  - Decompile using [`heimdall-rs`](https://github.com/Jon-Becker/heimdall-rs) (experimental).
  - Provide the ABI and the contract address.
- **Proxy contracts**. Autodetects most popular proxy patterns, and allows to read and write as proxy.

ABI Ninja (v2) is built with 🏗 [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2).

|                                                     Homepage                                                      |                                                   Unverified Contract Options                                                   |
| :---------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------: |
| ![ABINinja - Index](https://github.com/BuidlGuidl/abi.ninja/assets/55535804/3b7e0f12-1423-4835-bda3-2e12d65b4f15) | ![ABINinja - Unverified Contract](https://github.com/BuidlGuidl/abi.ninja/assets/55535804/d30d76a3-35d0-4b3f-8633-c8e531999be6) |

Friendly UI even for the most complex data structures:

![ABINinja - Contract UI](https://github.com/BuidlGuidl/abi.ninja/assets/55535804/7b3ec72b-c70b-4357-9f76-d10cb673530c)

# 🏄‍♂️ Development Quick Start

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

1. Clone this repo & install dependencies

```
git clone https://github.com/BuidlGuidl/abi.ninja.git
cd abi.ninja
yarn install
```

2. Start the frontend

```
yarn start
```

Visit your local instance of ABI Ninja at: `http://localhost:3000`.

## Contributing to ABI Ninja

We welcome contributions to ABI Ninja!

Please see [CONTRIBUTING.MD](https://github.com/BuidlGuidl/abi.ninja/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to ABI Ninja.
