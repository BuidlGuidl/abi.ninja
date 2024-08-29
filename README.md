# ABI Ninja

Interact with any contract on any EVM chain. ABI Ninja provides an intuitive frontend for contracts from most popular EVM networks, currently supporting:

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

# 🧪 Testing

ABI Ninja uses Cypress for end-to-end testing. Our test suite covers user flows and ensures the application works correctly across different networks and contract types. The test suite will automatically run on pull requests.

## Setting Up Cypress Environment

Before running the tests, you need to set up your Cypress environment:

1. Copy the example environment file:
  
```
cp cypress.env.example.json cypress.env.json
```

2. Edit `cypress.env.json` and fill in heimdall_url


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
