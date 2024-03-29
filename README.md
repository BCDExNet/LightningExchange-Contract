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

| Blockchain | LightningSwap | LightningSwapNative |
|---------------------------------|---------------------------------|---------------------------------|
| BSC | 0xd1a9559D4D54Ae11ad5ceBa1b309484502f4575d | 0x316a4B704cbb793d16b7DF228805F49beeb040c5 |
| ARBI | 0xB5a90265631efECF6e4B4F23C23f4B7367839D63 | 0xeDF9AE3Dfa601ec70085ed7c898D0553b6450F08 |
| ESC | 0xcCfC09e473911820639e5DD3c71987fD0597eec0 | 0x23DafbC321dEEEcd3Efdf3fA7593C8d33dcbac11 |
| KCC | 0x3fa4Fbb9e59A0fe2F633ce00660b7Fa5Eb548c64 | 0xCe5fbC259b9909A776ae60bCC2a92D6c7F70b2C3 |
| REI | 0x9AB67c40c5A6E45b363e6bC33fF2645a12A585e1 | 0xD1dd77Ec76Bc2Ba9Ab987B8719d0B2527d741ecC |
| IOTEX | 0x10d0B5104EAd7D02edfae38dea77474627e0Ea57 | 0xeA24c4b9FF56d0867530F3401262CE84aBc11F7d |
| HECO | 0x8D749aAA1C940a96142F544698E14Cc7375Ccce1 | 0xF2ab663f62821038357Aa770dB30Dbdf5855B63E |


## License

This project is licensed under the terms of the MIT License.

