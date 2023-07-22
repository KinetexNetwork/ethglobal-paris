import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { beginTask } from '../../../utils/format';
import { operation } from '../../../utils/operation';
import { attachContract } from '../../../utils/attach';
import { HyperlaneQueryAdapter } from '../../../../typechain-types';
import { MAINNET_DOMAIN, TESTNET_DOMAIN } from './constants';

type Args = {
  queryAdapter: string;
  domain: string;
  blockNumber: number;
  dry: boolean;
  nonce?: string;
};

export const hyperlaneQueryHeader = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  let domain: MAINNET_DOMAIN | TESTNET_DOMAIN;

  if (Object.keys(MAINNET_DOMAIN).includes(args.domain)) {
    domain = MAINNET_DOMAIN[args.domain as keyof typeof MAINNET_DOMAIN];
  } else if (Object.keys(TESTNET_DOMAIN).includes(args.domain)) {
    domain = TESTNET_DOMAIN[args.domain as keyof typeof TESTNET_DOMAIN];
  } else {
    throw new Error('Invalid domain: ' + args.domain);
  }

  await operation({
    title: 'Query block header from HyperlaneQueryAdapter',
    env,
    mode: args.dry ? 'dry-run' : 'run',
    transaction: async () => {
      const queryAdapter = await attachContract<HyperlaneQueryAdapter>({
        contractName: 'HyperlaneQueryAdapter',
        contractAddress: args.queryAdapter,
        env,
      });

      const feeData = await env.ethers.provider.getFeeData();
      const value = feeData.maxFeePerGas?.mul(300_000);

      const data = queryAdapter.interface.encodeFunctionData(
        "requestHeader",
        [ domain, args.blockNumber ]
      );
      return { data, to: queryAdapter.address, value };
    },
    nonce: args.nonce,
  });
};
