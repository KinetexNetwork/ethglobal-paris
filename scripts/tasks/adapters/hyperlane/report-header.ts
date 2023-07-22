import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { beginTask } from '../../../utils/format';
import { operation } from '../../../utils/operation';
import { attachContract } from '../../../utils/attach';
import { HyperlaneHeaderReporter } from '../../../../typechain-types';

type Args = {
  headerReporter: string;
  blockNumber: number;
  dry: boolean;
  nonce?: string;
};

export const hyperlaneReportHeader = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  await operation({
    title: 'Report block header from HyperlaneHeaderReporter',
    env,
    mode: args.dry ? 'dry-run' : 'run',
    transaction: async () => {
      const headerReporter = await attachContract<HyperlaneHeaderReporter>({
        contractName: 'HyperlaneHeaderReporter',
        contractAddress: args.headerReporter,
        env,
      });

      const value = await headerReporter.callStatic.estimateGasCosts();
      const data = headerReporter.interface.encodeFunctionData(
        "reportHeader",
        [ args.blockNumber ]
      );
      return { data, to: headerReporter.address, value };
    },
    nonce: args.nonce,
  });
};
