import { JsonRpcBlock } from '@ethereumjs/block';
import { NestedBufferArray } from '@ethereumjs/util';

export interface BaseLog {
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    logIndex: string;
    removed: false;
}

export interface BaseReceipt {
    blockHash: string;
    blockNumber: string;
    contractAddress: null | string;
    cumulativeGasUsed: string;
    effectiveGasPrice: string;
    from: string;
    gasUsed: string;
    logs: BaseLog[];
    logsBloom: string;
    status: string;
    to: string;
    transactionHash: string;
    transactionIndex: string;
    type: string;
}

export interface PreparedReceipt {
    stateRoot?: Buffer;
    status: Buffer;
    cumulativeBlockGasUsed: Buffer;
    bitvector: Buffer;
    logs: NestedBufferArray[];
}

export interface BaseTransaction {
    hash: string;
    nonce: string;
    blockHash: string;
    blockNumber: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
    gas: string;
    data: string;
    input: string;
    chainId: string;
    type: string;
    v: string;
    s: string;
    r: string;
    yParity: string;
}

export interface ExtendedRpcBlock extends JsonRpcBlock {
    baseFeePerGas: string;
    difficulty: string;
    extraData: string;
    gasLimit: string;
    gasUsed: string;
    l1BlockNumber?: string;
    logsBloom: string;
    miner: string;
    mixHash: string;
    nonce: string;
    receiptsRoot: string;
    receiptRoot?: string;
    sendCount: string;
    sendRoot: string;
    sha3Uncles: string;
    size: string;
    stateRoot: string;
    timestamp: string;
    totalDifficulty: string;
    /*
     * Depends on the provider:
     * quicknode - string[]
     * onfinality - BaseTransaction[]
     */
    transactions: BaseTransaction[] | string[];
    transactionsRoot: string;
    uncles: string[];
    uncleHash?: string;
    /*
     * Ethereum extra
     */
    dataGasUsed?: string;
}
