import { getNetwork } from './utils/network.js';
import { getAppArgs } from './utils/app.js';
import dotenv from 'dotenv';
import { SelectProof } from './types/app.js';
import { ExecutionProver } from './core/execution/executionProver.js';

(async () => {
    dotenv.config();

    const {
        network: networkArg,
        tx,
        block
    } = getAppArgs();

    const network = getNetwork(networkArg);

    console.log('🔪 execution mode selected');

    const prover = ExecutionProver.build(network, block, tx);

    const rlpEncodedHeader = prover.rlpEncodedHeader();
    const receiptProof = await prover.receiptProof();

    console.log({
        rlpEncodedHeader,
        receiptProof
    });

    return;
})();
