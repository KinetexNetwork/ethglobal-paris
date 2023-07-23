import { parseArgs } from 'node:util';
import { AppArgs, SelectProof } from '../types/app.js';

export const getAppArgs = (): AppArgs => {
    const {
        values: {
            network,
            tx,
            proof,
            block,
            encoded
        }
    } = parseArgs({
        options: {
            network: {
                type: 'string',
                short: 'n'
            },
            tx: {
                type: 'string'
            },
            proof: {
                type: 'string'
            },
            block: {
                type: 'string',
                short: 'b'
            },
            encoded: {
                type: 'boolean'
            }
        }
    });

    return {
        network,
        tx,
        proof: proof as SelectProof,
        block,
        encoded: !!encoded
    };
};
