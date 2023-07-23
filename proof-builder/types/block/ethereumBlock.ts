export interface HeaderBase {
    parentHash?: string;
    uncleHash?: string;
    coinbase?: string;
    root?: string;
    txHash?: string;
    receiptHash?: string;
    bloom?: string;
    difficulty?: bigint | null;
    number?: bigint | null;
    gasLimit?: number;
    gasUsed?: number;
    time?: number;
    extra?: string;
    mixDigest?: string;
    nonce?: string;
    baseFee?: bigint | null;
    withdrawalsHash?: string | null;
    excessDataGas?: number | null;
    dataGasUsed?: number | null;
}

export type HeaderBaseType<T> = { [K in keyof HeaderBase]: T };

export interface EthereumHeader extends HeaderBase {
    parentHash: string;
    uncleHash: string;
    coinbase: string;
    root: string;
    txHash: string;
    receiptHash: string;
    bloom: string;
    difficulty: bigint | null;
    number: bigint | null;
    gasLimit: number;
    gasUsed: number;
    time: number;
    extra: string;
    mixDigest?: string;
    nonce: string;
    baseFee?: bigint | null;
    withdrawalsHash?: string | null;
    excessDataGas?: number | null;
    dataGasUsed?: number | null;
}

export type EthereumHeaderType<T> = { [K in keyof EthereumHeader]: T };
