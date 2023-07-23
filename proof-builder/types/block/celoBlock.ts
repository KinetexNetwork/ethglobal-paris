import { Nullable } from '../helpers';
import { HeaderBaseType } from './ethereumBlock';

export interface CeloHeader
    extends HeaderBaseType<
        string | bigint | null | undefined | IstanbulExtra | Error
    > {
    parentHash: string;
    uncleHash?: string | null;
    coinbase: string;
    root: string;
    txHash: string;
    receiptHash: string;
    bloom: string;
    difficulty?: bigint | null;
    number: bigint | null;
    gasLimit?: bigint;
    gasUsed: bigint;
    time: bigint;
    extra: string;
    mixDigest?: string;
    nonce?: string;
    baseFee?: bigint | null;
    extraValue?: IstanbulExtra;
    extraError?: Error;
}

export type CeloHeaderType<T> = { [K in keyof CeloHeader]: T };

export interface IstanbulExtra {
    addedValidators: string[];
    addedValidatorsPublicKeys: string[];
    removedValidators: bigint | null;
    seal: string;
    aggregatedSeal: Nullable<IstanbulAggregatedSeal>;
    parentAggregatedSeal: IstanbulAggregatedSeal;
}

export interface IstanbulAggregatedSeal {
    bitmap?: bigint | null;
    signature?: string | null;
    round?: bigint | null;
}
