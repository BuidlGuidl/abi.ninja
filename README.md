# ABI Ninja

Interact with smart contracts on any EVM chain. ABI Ninja provides an intuitive frontend for contracts from most popular EVM networks, currently supporting:

- **Verified contracts**. Fetches contract ABIs and source code directly using [Etherscan's API v2 endpoints](https://docs.etherscan.io/etherscan-v2/getting-started/v2-quickstart).
- **Unverified contracts**. Two different options are available:
  - Decompile using [`heimdall-rs`](https://github.com/Jon-Becker/heimdall-rs) (experimental).
  - Provide the ABI and the contract address.
- **Proxy contracts**. Autodetects most popular proxy patterns, and allows to read and write as proxy.

ABI Ninja (v2) is built with 🏗 [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2).

|                                                     Homepage                                                      |                                                   Unverified Contract Options                                                   |
| :---------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------: |
| ![ABINinja - Index](https://github.com/BuidlGuidl/abi.ninja/assets/55535804/3b7e0f12-1423-4835-bda3-2e12d65b4f15) | ![ABINinja - Unverified Contract](https://github.com/BuidlGuidl/abi.ninja/assets/55535804/d30d76a3-35d0-4b3f-8633-c8e531999be6) |

### Features included:

- **Customize your chains.** We provide a default list of chains (Mainnets + Testnets), but you can add or remove networks from a large selection using the "Other Chains" option in the network dropdown.
- **Add custom chains.** If you can't find a network using the "Other Chains" option, you can manually add custom chains by entering the network details.
- **Use it on localhost!** Run ABI Ninja on chain ID 31337 (localhost) to debug your local contracts.
- **ENS resolution on address inputs.** Automatically resolves ENS names (Mainnet).
- **Shareable URLs with dynamic unfurling.** Share an ABI Ninja contract URL, and it will unfurl with the contract name, network icon and address.
- **Transaction results display.** View detailed transaction results directly in the interface after executing contract calls, making debugging and monitoring easier.

- **Friendly UI even for the most complex data structures:**

  ![ABINinja - Contract UI](https://github.com/BuidlGuidl/abi.ninja/assets/55535804/7b3ec72b-c70b-4357-9f76-d10cb673530c)

# 🏄‍♂️ Development Quick Start

Before you begin, you need to install the following tools:

- [Node (>= v22.17.1)](https://nodejs.org/en/download/)
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

# 🧪 Testing

ABI Ninja uses Cypress for end-to-end testing. Our test suite covers user flows and ensures the application works correctly across different networks and contract types. The test suite will automatically run on pull requests.

## Running Tests

To run the Cypress tests:

1. Ensure your development server is running:

```
yarn start
```

2. In a new terminal window, run the Cypress tests:

```
yarn cypress:open
```

This will open the Cypress Test Runner, where you can run individual tests or the entire suite.

3. For headless testing, use:

```
yarn cypress:run
```

## Test Coverage

Our tests cover the following key areas:

- Loading and interacting with verified contracts on various networks
- Handling unverified contracts and manual ABI input
- Detecting and interacting with proxy contracts
- Network switching and custom network addition

## Writing New Tests

When adding new features or modifying existing ones, please update or add corresponding tests. Test files are located in the `cypress/e2e` directory.

For more information on writing Cypress tests, refer to the Cypress Documentation.

## Contributing to ABI Ninja

We welcome contributions to ABI Ninja!

Please see [CONTRIBUTING.MD](https://github.com/BuidlGuidl/abi.ninja/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to ABI Ninja.
