import { ensureLeading0x, hexValue } from '../hex.js';
import ejsUtil from 'ethereumjs-util';
import {
    toBuffer,
    bigIntToBuffer,
    bufferToBigInt,
    toChecksumAddress
} from '@ethereumjs/util';
import { Input, RLP } from '@ethereumjs/rlp';
import {
    IstanbulAggregatedSeal,
    IstanbulExtra
} from '../../types/block/celoBlock.js';

function celoHeaderArray(block: any) {
    if (!block.nonce) {
        // Before Gingerbread fork
        return [
            block.parentHash,
            block.miner,
            block.stateRoot,
            block.transactionsRoot,
            block.receiptsRoot,
            block.logsBloom,
            block.number,
            block.gasUsed,
            block.timestamp,
            block.extraData
        ];
    }
    return [
        block.parentHash,
        block.sha3Uncles,
        block.miner,
        block.stateRoot,
        block.transactionsRoot,
        block.receiptsRoot,
        block.logsBloom,
        BigInt(block.difficulty),
        block.number,
        block.gasLimit,
        block.gasUsed,
        block.timestamp,
        block.extraData,
        block.mixHash,
        block.nonce,
        block.baseFee
    ];
}

export function celoHeaderFromBlock(block: any) {
    return ensureLeading0x(
        (ejsUtil as any).rlp.encode(celoHeaderArray(block)).toString('hex')
    );
}

// This file contains utilities that help with istanbul-specific block information.
// See https://github.com/celo-org/celo-blockchain/blob/master/core/types/istanbul.go

export const ISTANBUL_EXTRA_VANITY_BYTES = 32;

function sealFromBuffers(data: Buffer[]): IstanbulAggregatedSeal {
    return {
        bitmap: bufferToBigInt(data[0]),
        signature: '0x' + Buffer.from(data[1]).toString('hex'),
        round: bufferToBigInt(data[2])
    };
}

function sealToBuffers(data: IstanbulAggregatedSeal): Buffer[] {
    return [
        data.bitmap && data.bitmap !== 0n
            ? bigIntToBuffer(data.bitmap)
            : toBuffer(null),
        toBuffer(data.signature),
        data.round && data.round !== 0n
            ? bigIntToBuffer(data.round)
            : toBuffer(null)
    ];
}

export const getOnlyIstanbulVanity = (
    data: string,
    prefixed: boolean = true
) => {
    const buffer = Buffer.from(data.replace(/^0x/, ''), 'hex');
    const returns = buffer
        .slice(0, ISTANBUL_EXTRA_VANITY_BYTES)
        .toString('hex');
    return prefixed ? '0x' + returns : returns;
};

export const getAllButIstanbulVanity = (data: string) => {
    const buffer = Buffer.from(data.replace(/^0x/, ''), 'hex');

    return '0x' + buffer.slice(ISTANBUL_EXTRA_VANITY_BYTES).toString('hex');
};

// Parse RLP encoded block extra data into an IstanbulExtra object.
export function parseBlockExtraData(data: string): IstanbulExtra {
    const allButVanity = getAllButIstanbulVanity(data);
    // console.log({ allButVanity });

    const decode: any = RLP.decode(allButVanity);

    // console.log(
    //     hexValue(
    //         RLP.encode([
    //             decode[0],
    //             decode[1],
    //             decode[2],
    //             decode[3],
    //             decode[4],
    //             []
    //         ])
    //     )
    // );
    // console.log('parentAggregatedSeal:');
    // console.log({
    //     originalUint: decode[5],
    //     originalBuffer: decode[5].map((el: any) => Buffer.from(el))
    // });

    return {
        addedValidators: decode[0].map((addr: Uint8Array) =>
            toChecksumAddress(Buffer.from(addr).toString('hex'))
        ),
        addedValidatorsPublicKeys: decode[1].map(
            (key: Uint8Array) => '0x' + Buffer.from(key).toString('hex')
        ),
        removedValidators: BigInt(decode[2]),
        seal: '0x' + Buffer.from(decode[3]).toString('hex'),
        aggregatedSeal: sealFromBuffers(decode[4]),
        parentAggregatedSeal: sealFromBuffers(decode[5])
    };
}

export function encodeBlockExtraData(extra: IstanbulExtra): string {
    // console.log({
    //     nriginal: sealToBuffers(extra.aggregatedSeal!),
    //     nriginalEncoded: hexValue(
    //         RLP.encode(sealToBuffers(extra.aggregatedSeal!))
    //     )
    // });

    const rlpArray: Input = [
        extra.addedValidators.map((validator) => toBuffer(validator)),

        extra.addedValidatorsPublicKeys.map((validator) => toBuffer(validator)),

        extra.removedValidators && extra.removedValidators !== 0n
            ? bigIntToBuffer(extra.removedValidators)
            : toBuffer(null),

        toBuffer(extra.seal),

        extra.aggregatedSeal
            ? sealToBuffers(extra.aggregatedSeal)
            : toBuffer(extra.aggregatedSeal),

        sealToBuffers(extra.parentAggregatedSeal)
    ];

    return hexValue(RLP.encode(rlpArray));
}
