import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { beginTask } from '../../utils/format';
import { operation } from '../../utils/operation';

type Args = void;

export const deployerInfo = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  await operation({
    title: 'Deployer info',
    env,
    mode: 'read',
    transaction: async () => {
      // Just print deployer info without transaction estimate/sent
      return undefined;
    },
  });
};
