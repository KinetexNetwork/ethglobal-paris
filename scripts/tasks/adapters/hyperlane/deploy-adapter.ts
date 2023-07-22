import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getDeployContractData } from '../../../utils/deploy';
import { beginTask } from '../../../utils/format';
import { operation } from '../../../utils/operation';
import { HYPERLANE_MAILBOX, HyperlaneAdapterDomainParams, MAINNET_DOMAIN, TESTNET_DOMAIN } from './constants';

type Args = {
  domains: string;
  headerReporters: string;
  dry: boolean;
  nonce?: string;
};

export const hyperlaneAdapterDeploy = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  const domains: string[] = args.domains.split(',');
  const headerReporters: string[] = args.headerReporters.split(',');

  if (domains.length != headerReporters.length) {
    throw new Error('Invalid inputs: `domains` and `headerReporters` length should be the same');
  }

  const hyperlaneAdapterDomainParams : HyperlaneAdapterDomainParams[]  = domains.map(
        (d, i) => {
            let domain;

            if (Object.keys(MAINNET_DOMAIN).includes(d)) {
                domain = MAINNET_DOMAIN[d as keyof typeof MAINNET_DOMAIN];
            } else if (Object.keys(TESTNET_DOMAIN).includes(d)) {
                domain = TESTNET_DOMAIN[d as keyof typeof TESTNET_DOMAIN];
            } else {
                throw new Error('Invalid domain: ' + d);
            }
            
            return {
                domain,
                mailbox: HYPERLANE_MAILBOX[domain],
                headerReporter: headerReporters[i]
            }
        }
    );

  await operation({
    title: 'Deploy HyperlaneAdapter',
    env,
    mode: args.dry ? 'dry-run' : 'run',
    transaction: async () => {
      const data = await getDeployContractData({
        contractName: 'HyperlaneAdapter',
        constructorParams: [ hyperlaneAdapterDomainParams ],
        env,
      });
      return { data };
    },
    nonce: args.nonce,
  });
};
