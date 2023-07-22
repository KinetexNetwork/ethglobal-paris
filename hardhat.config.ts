import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-solhint';
import 'dotenv/config';
import 'hardhat-contract-sizer';
import './scripts/tasks';

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || '';
const BINANCE_RPC_URL = process.env.BINANCE_RPC_URL || '';
const FANTOM_RPC_URL = process.env.FANTOM_RPC_URL || '';
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || '';
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL || '';
const AVALANCHE_RPC_URL = process.env.AVALANCHE_RPC_URL || '';
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || '';
const GNOSIS_RPC_URL = process.env.GNOSIS_RPC_URL || '';

const ETHEREUM_TEST_RPC_URL = process.env.ETHEREUM_TEST_RPC_URL || '';
const BINANCE_TEST_RPC_URL = process.env.BINANCE_TEST_RPC_URL || '';
const POLYGON_TEST_RPC_URL = process.env.POLYGON_TEST_RPC_URL || '';
const ARBITRUM_TEST_RPC_URL = process.env.ARBITRUM_TEST_RPC_URL || '';
const GNOSIS_TEST_RPC_URL = process.env.GNOSIS_TEST_RPC_URL || '';

const ETHEREUM_EXPLORER_API_KEY = process.env.ETHEREUM_EXPLORER_API_KEY || '';
const BINANCE_EXPLORER_API_KEY = process.env.BINANCE_EXPLORER_API_KEY || '';
const FANTOM_EXPLORER_API_KEY = process.env.FANTOM_EXPLORER_API_KEY || '';
const POLYGON_EXPLORER_API_KEY = process.env.POLYGON_EXPLORER_API_KEY || '';
const OPTIMISM_EXPLORER_API_KEY = process.env.OPTIMISM_EXPLORER_API_KEY || '';
const AVALANCHE_EXPLORER_API_KEY = process.env.AVALANCHE_EXPLORER_API_KEY || '';
const ARBITRUM_EXPLORER_API_KEY = process.env.ARBITRUM_EXPLORER_API_KEY || '';
const GNOSIS_EXPLORER_API_KEY = process.env.GNOSIS_EXPLORER_API_KEY || '';

const EMPTY_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000000';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || EMPTY_PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1_000_000,
      },
    },
  },
  networks: {
    ethereum: {
      url: ETHEREUM_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    binance: {
      url: BINANCE_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    fantom: {
      url: FANTOM_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    optimism: {
      url: OPTIMISM_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    avalanche: {
      url: AVALANCHE_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    arbitrum: {
      url: ARBITRUM_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    gnosis: {
      url: GNOSIS_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    ethereumTest: {
      url: ETHEREUM_TEST_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    binanceTest: {
      url: BINANCE_TEST_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    polygonTest: {
      url: POLYGON_TEST_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    arbitrumTest: {
      url: ARBITRUM_TEST_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    gnosisTest: {
      url: GNOSIS_TEST_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHEREUM_EXPLORER_API_KEY,
      bsc: BINANCE_EXPLORER_API_KEY,
      opera: FANTOM_EXPLORER_API_KEY,
      polygon: POLYGON_EXPLORER_API_KEY,
      optimisticEthereum: OPTIMISM_EXPLORER_API_KEY,
      avalanche: AVALANCHE_EXPLORER_API_KEY,
      arbitrumOne: ARBITRUM_EXPLORER_API_KEY,
      xdai: GNOSIS_EXPLORER_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
  contractSizer: {
    alphaSort: false,
    disambiguatePaths: true,
    runOnCompile: true,
    strict: true,
    only: [],
  },
};

export default config;
