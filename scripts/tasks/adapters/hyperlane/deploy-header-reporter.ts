import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getDeployContractData } from '../../../utils/deploy';
import { beginTask } from '../../../utils/format';
import { operation } from '../../../utils/operation';
import { HYPERLANE_DEFAULT_ISM_GAS_PAYMASTER, HYPERLANE_MAILBOX, MAINNET_DOMAIN, TESTNET_DOMAIN } from './constants';

type Args = {
  targetDomain: keyof (MAINNET_DOMAIN | TESTNET_DOMAIN);
  targetAdapter: string,
  dry: boolean;
  nonce?: string;
};

export const hyperlaneHeaderReporterDeploy = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  const chainId: number = (await env.ethers.provider.getNetwork()).chainId;
  if (!Object.values(MAINNET_DOMAIN).includes(chainId) && !Object.values(TESTNET_DOMAIN).includes(chainId)) {
    throw new Error('Current network is not supported (chainId: ' + chainId + ')');
  }
  const domain: MAINNET_DOMAIN | TESTNET_DOMAIN = chainId;

  let targetDomain: MAINNET_DOMAIN | TESTNET_DOMAIN;

    if (Object.keys(MAINNET_DOMAIN).includes(args.targetDomain)) {
        targetDomain = MAINNET_DOMAIN[args.targetDomain as keyof typeof MAINNET_DOMAIN];
    } else if (Object.keys(TESTNET_DOMAIN).includes(args.targetDomain)) {
        targetDomain = TESTNET_DOMAIN[args.targetDomain as keyof typeof TESTNET_DOMAIN];
    } else {
        throw new Error('Invalid domain: ' + args.targetDomain);
    }

  await operation({
    title: 'Deploy HyperlaneHeaderReporter',
    env,
    mode: args.dry ? 'dry-run' : 'run',
    transaction: async () => {
      const data = await getDeployContractData({
        contractName: 'HyperlaneHeaderReporter',
        constructorParams: [ 
            HYPERLANE_MAILBOX[domain],
            HYPERLANE_DEFAULT_ISM_GAS_PAYMASTER[domain],
            targetDomain,
            args.targetAdapter
         ],
        env,
      });
      return { data };
    },
    nonce: args.nonce,
  });
};
