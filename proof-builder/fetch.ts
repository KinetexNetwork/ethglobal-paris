import { getNetwork } from './utils/network.js';
import { getAppArgs } from './utils/app.js';
import dotenv from 'dotenv';
import { ExecutionFetcher } from './core/execution/executionFetcher.js';

(async () => {
    dotenv.config();

    const { network: networkArg, block, encoded } = getAppArgs();

    const network = getNetwork(networkArg);

    console.log('🔪 execution mode selected');
    const fetcher = new ExecutionFetcher(network, block, encoded);

    // await fetcher.saveQnReceipts();
    await fetcher.saveData();
    // await fetcher.saveBlockByHash(
    //     '0x2e14ef428293e41c5f81a108b5d36f892b2bee3e34aec4223474c4a31618ea69'
    // );
    return;
})();
