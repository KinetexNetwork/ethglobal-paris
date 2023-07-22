import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getDeployContractData } from '../../../utils/deploy';
import { beginTask } from '../../../utils/format';
import { operation } from '../../../utils/operation';
import { HYPERLANE_DEFAULT_ISM_GAS_PAYMASTER, HYPERLANE_QUERY_ROUTER, MAINNET_DOMAIN, TESTNET_DOMAIN } from './constants';

type Args = {
  domains: string;
  headerReporters: string;
  dry: boolean;
  nonce?: string;
};

export const hyperlaneQueryAdapterDeploy = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  const _domains: string[] = args.domains.split(',');
  const headerReporters: string[] = args.headerReporters.split(',');

  if (_domains.length != headerReporters.length) {
    throw new Error('Invalid inputs: `domains` and `headerReporters` length should be the same');
  }

  const domains = _domains.map(d => {
    if (Object.keys(MAINNET_DOMAIN).includes(d)) {
        return MAINNET_DOMAIN[d as keyof typeof MAINNET_DOMAIN];
    } else if (Object.keys(TESTNET_DOMAIN).includes(d)) {
        return TESTNET_DOMAIN[d as keyof typeof TESTNET_DOMAIN];
    } else {
        throw new Error('Invalid domain: ' + d);
    }
  });

  const chainId: number = (await env.ethers.provider.getNetwork()).chainId;
  if (!Object.values(MAINNET_DOMAIN).includes(chainId) && !Object.values(TESTNET_DOMAIN).includes(chainId)) {
    throw new Error('Current network is not supported (chainId: ' + chainId + ')');
  }
  const domain: MAINNET_DOMAIN | TESTNET_DOMAIN = chainId;

  await operation({
    title: 'Deploy HyperlaneQueryAdapter',
    env,
    mode: args.dry ? 'dry-run' : 'run',
    transaction: async () => {
      const data = await getDeployContractData({
        contractName: 'HyperlaneQueryAdapter',
        constructorParams: [ 
            HYPERLANE_QUERY_ROUTER[domain],
            HYPERLANE_DEFAULT_ISM_GAS_PAYMASTER[domain],
            domains,
            headerReporters
         ],
        env,
      });
      return { data };
    },
    nonce: args.nonce,
  });
};
