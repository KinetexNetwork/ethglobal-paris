import { Nullable } from './helpers.js';

export enum SelectProof {
    RECEIPT = 'receiptProof',
    RECEIPTS_ROOT = 'receiptsRootProof',
    ALL = 'all'
}

export interface AppArgs {
    network: Nullable<string>;
    tx: Nullable<string>;
    proof: SelectProof;
    block: Nullable<string>;
    encoded: boolean;
}
