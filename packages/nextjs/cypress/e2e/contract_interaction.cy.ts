const PAREX_CONTRACT_ABI = `[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_stakingToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
      }
    ],
    "name": "HourlyDistribution",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "stakeId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "StakeCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "stakeId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "StakeRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "_owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "stakeOwners",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "durationsInDays",
        "type": "uint256[]"
      }
    ],
    "name": "batchCreateStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "stakeOwner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "durationInDays",
        "type": "uint256"
      }
    ],
    "name": "createStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_start",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_finish",
        "type": "uint256"
      }
    ],
    "name": "distributeHourlyRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserStakes",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getvalidatorTotalFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isStaker",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "removeExpiredStakes",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "currentDay",
        "type": "uint256"
      }
    ],
    "name": "removeExpiredStakesOld",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardListgetLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "rewardLists",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sendValidatorReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "specialRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_specialRate",
        "type": "uint256"
      }
    ],
    "name": "specialRateChange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "specialRateView",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "stakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "stakesByEndDay",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakingToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalStakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userBalances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userStakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_validatorAddress",
        "type": "address"
      }
    ],
    "name": "validatorAdd",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "validatorFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "validatorList",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "validatorListCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_validatorAddress",
        "type": "address"
      }
    ],
    "name": "validatorRemove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "validatorTotalFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      }
    ],
    "name": "validatorsetFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;

describe("Contract Interaction", () => {
  it("should load DAI contract and interact with its balanceOf method", () => {
    cy.visit("http://localhost:3000");
    cy.get('input[placeholder="Contract address"]').type("0x6B175474E89094C44Da98b954EedeAC495271d0F");
    cy.get("button").contains("Load contract").click();
    cy.url().should("include", "/0x6B175474E89094C44Da98b954EedeAC495271d0F/1");
    cy.contains("balanceOf").click();
    cy.get('input[placeholder="address"]').type("0x6B175474E89094C44Da98b954EedeAC495271d0F");
    cy.get("button").contains("Read 📡").click();
    cy.contains("Result:", { timeout: 10000 }).should("be.visible");
  });

  it("should load proxy contract on Base and interact with its balanceOf method", () => {
    cy.visit("http://localhost:3000");
    cy.get("#react-select-container").click();
    cy.get('[role="option"]').contains("Base").click();
    cy.get('input[placeholder="Contract address"]').type("0xca808b3eada02d53073e129b25f74b31d8647ae0");
    cy.get("button").contains("Load contract").click();
    cy.url().should("include", "/0xca808b3eada02d53073e129b25f74b31d8647ae0/8453");
    cy.contains("Implementation Address").should("be.visible");
    cy.contains("balanceOf").click();
    cy.get('input[placeholder="address"]').type("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"); // vitalik.eth
    cy.get("button").contains("Read 📡").click();
    cy.contains("Result:", { timeout: 10000 }).should("be.visible");
  });

  it("should load unverified contract on Sepolia and ADD changeOwner write method to the UI", () => {
    cy.visit("http://localhost:3000");
    cy.get("#react-select-container").click();
    cy.get('[role="option"]').contains("Sepolia").click();
    cy.get('input[placeholder="Contract address"]').type("0x759c0e9d7858566df8ab751026bedce462ff42df");
    cy.get("button:visible").contains("Decompile (beta)", { timeout: 10000 }).click({ force: true });
    cy.url().should("include", "/0x759c0e9d7858566df8ab751026bedce462ff42df/11155111");
    cy.contains("changeOwner").click();
  });

  it("should load proxy contract on Base and interact with its balanceOf method", () => {
    cy.visit("http://localhost:3000");
    cy.get("#react-select-container").click();
    cy.get('[role="option"]').contains("Base").click();
    cy.get('input[placeholder="Contract address"]').type("0xca808b3eada02d53073e129b25f74b31d8647ae0");
    cy.get("button").contains("Load contract").click();
    cy.url().should("include", "/0xca808b3eada02d53073e129b25f74b31d8647ae0/8453");
    cy.contains("Implementation Address").should("be.visible");
    cy.contains("balanceOf").click();
    cy.get('input[placeholder="address"]').type("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"); // vitalik.eth
    cy.get("button").contains("Read 📡").click();
    cy.contains("Result:", { timeout: 10000 }).should("be.visible");
  });

  it("should load proxy contract on BNB Smart Chain and interact with its balanceOf method", () => {
    cy.visit("http://localhost:3000");
    cy.get("#react-select-container").click();
    cy.get('[role="option"]').contains("Other chains").click();
    cy.get("#see-other-chains-modal").should("be.visible");
    cy.contains("BNB Smart Chain").click();
    cy.get(".modal-content").should("not.exist");
    cy.get("#react-select-container").should("contain", "BNB Smart Chain");
    cy.get('input[placeholder="Contract address"]').type("0x2170ed0880ac9a755fd29b2688956bd959f933f8");
    cy.get("button").contains("Load contract").click();
    cy.url().should("include", "/0x2170ed0880ac9a755fd29b2688956bd959f933f8/56");
    cy.get(".loading-spinner", { timeout: 10000 }).should("not.exist");
    cy.contains("balanceOf").click();
    cy.get('input[placeholder="address"]').type("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
    cy.get("button").contains("Read 📡").click();
    cy.contains("Result:", { timeout: 10000 }).should("be.visible");
  });

  it("should add Parex as a custom chain and interact with a verified contract", () => {
    cy.visit("http://localhost:3000");
    cy.get("#react-select-container").click();
    cy.get('[role="option"]').contains("Add custom chain").click();
    cy.get("#add-custom-chain-modal").should("be.visible");
    cy.get('input[name="id"]').type("322202");
    cy.get('input[name="name"]').type("Parex");
    cy.get('input[name="nativeCurrencyName"]').type("PAREX");
    cy.get('input[name="nativeCurrencySymbol"]').type("PAREX");
    cy.get('input[name="nativeCurrencyDecimals"]').type("18");
    cy.get('input[name="rpcUrl"]').type("https://mainnet-rpc.parex.network");
    cy.get('input[name="blockExplorer"]').type("https://scan.parex.network/");
    cy.get("button").contains("Add Chain").click();
    cy.get("#react-select-container").should("contain", "Parex");
    cy.get('input[placeholder="Contract address"]').type("0x6058518142C6AD506530F5A62dCc58050bf6fC28");
    cy.get('textarea[placeholder="Paste contract ABI in JSON format here"]').should("be.visible");
    cy.get('textarea[placeholder="Paste contract ABI in JSON format here"]')
      .invoke("val", PAREX_CONTRACT_ABI)
      .first()
      .type(" ", { force: true });
    cy.get("button").contains("Import ABI").click({ force: true });
    cy.url().should("include", "/0x6058518142C6AD506530F5A62dCc58050bf6fC28/322202");
    cy.get(".loading-spinner", { timeout: 10000 }).should("not.exist");
    cy.contains("getUserBalance").click();
    cy.get('input[placeholder="address"]').type("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
    cy.get("button").contains("Read 📡").click();
    cy.contains("Result:", { timeout: 10000 }).should("be.visible");
  });
  // Add more test cases for other contracts as needed
});
