# Overview

Swap Core (https://github.com/Light-Ecosystem/swap-core) is an Ethereum-based decentralized trading protocol for automated liquidity provision between cryptocurrencies. The protocol allows users to trade directly with smart contracts without the need for a centralized exchange.

Based on Uniswap V2, the following features have been extended:

- Adjusted the proportion of transaction fees attributable to the community to 50%
- Support Whitelist to manage tradable assets, obtain access qualifications through voting by the community, and avoid non-performing assets from entering the trading market;
- Support fee dynamic adjustment, the community to control the transaction fee;
- Support trading pairs containing stHOPE to claim LT rewards;

At the same time, the Development Environment and deployment scripts have been upgraded and improved.

The integrated testing environment can refer to Swap Periphery (https://github.com/Light-Ecosystem/swap-periphery).

The code was audited by two audit firms, SlowMist and CertiK, and the audit report can be found at:

# Testing and Development

## Dependencies

Make sure you have the following tools installed:

1. [Node.js](https://github.com/nodejs/release#release-schedule)
2. [Yarn](https://github.com/yarnpkg/yarn)
3. Git

## Setup

Open the end point and type the following command to clone the repository.In the root directory of the repository, run the following command to install the project dependencies.Compilation of smart contracts.

```Bash
git clone https://github.com/Light-Ecosystem/swap-core.git
cd swap-core

yarn install

yarn compile
```

### Running the Tests

To make sure everything works, run the test case:

```Bash
yarn test
```

# Audits and Security

Light DAO contracts have been audited by  SlowMist and Certic. These audit reports are made available on the [Audit](https://github.com/Light-Ecosystem/light-dao/tree/main/audit).

There is also an active [bug bounty](https://static.hope.money/bug-bounty.html) for issues which can lead to substantial loss of money, critical bugs such as a broken live-ness condition, or irreversible loss of funds.

## Community

If you have any questions about this project, or wish to engage with us:

- [Websites](https://hope.money/)
- [Medium](https://hope-ecosystem.medium.com/)
- [Twitter](https://twitter.com/hope_ecosystem)
- [Discord](https://discord.com/invite/hope-ecosystem)

## License

This project is licensed under the [GNU License](LICENSE) license.