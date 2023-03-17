# LightningExchange-Contract

This is a simple, yet powerful, Truffle-based smart contract project. It demonstrates the ease of creating, deploying, and managing smart contracts on the Ethereum network using the Truffle Suite. This README will guide you through the installation, compilation, and deployment process.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Compilation](#compilation)
- [Deployment](#deployment)
  - [By mnemonic file](#By-mnemonic-file)
  - [By dashboard](#By-dashboard)
- [License](#license)

## Requirements

Ensure you have the following installed on your system:

- Node.js v10+ (https://nodejs.org/)
- Truffle Suite (https://www.trufflesuite.com/)
- Ganache (optional, for local development) (https://www.trufflesuite.com/ganache)

## Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/BCDExNet/LightningExchange-Contract.git
```

Navigate to the project directory:

```bash
cd LightningExchange-Contract
```

Install the required dependencies:

```bash
npm install
```

## Compilation

Compile the smart contracts:

```bash
truffle compile
```

This will generate the contract artifacts in the `build/contracts` directory.

## Deployment

### By mnemonic file

1. Create a file named '.secret', save your mnemonic in the file.
2. Configure you network in 'truffle-config.js'.

Update the `truffle-config.js` file to configure the networks you want to deploy to. For example:

```javascript
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
      network_id: 3,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  // Other configurations...
};
```

3. To deploy the smart contracts, choose a network and run the following command:

```bash
truffle migrate --network <network-name>
```

For example, to deploy on the development network:

```bash
truffle migrate --network development
```

### By dashboard

1. Create an empty file named '.secret' or comment the code read mnemonic in 'truffle-config.js'.
2. To start a Truffle Dashboard, you need to run the truffle dashboard command in a separate terminal window.

```bash
truffle dashboard [--port <number>] [--host <string>] [--verbose]
```

By default, the command above starts a dashboard at http://localhost:24012 and opens the dashboard in a new tab in your default browser.

3. Connect your wallet by MetaMask.
4. To deploy the smart contracts, choose the network dashboard:

```bash
truffle migrate --network dashboard
```

For more information on using Truffle Dashboard, refer to the official documentation (https://trufflesuite.com/docs/truffle/how-to/use-the-truffle-dashboard/).

## Contracts

| Blockchain | CrossChainSwap | CrossChainSwapNative |
|---------------------------------|---------------------------------|---------------------------------|
| BSC | 0x3b37A2d1E22ce6574F4De4db78A3931Fc6659B9e | 0x4a653cAb18E612F8a880D07f0968E2343A4B170C |


## License

This project is licensed under the terms of the MIT License.

