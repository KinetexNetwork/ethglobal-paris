export const IstanbulExtraVanity = 32;

import { KECCAK256_NULL, toBuffer, bigIntToBuffer } from '@ethereumjs/util';
import { ExtendedRpcBlock } from '../../types/ethereum.js';
import { addOptional } from '../blocks.js';
import { handleRLPNumber } from '../rlp.js';
import { hexValue } from '../hex.js';
import { CeloHeaderType } from '../../types/block/celoBlock.js';
import {
    encodeBlockExtraData,
    getOnlyIstanbulVanity,
    parseBlockExtraData
} from '../chains/celo.js';

import { parseBlockExtraData as parseBlockExtraDataCeloUtil } from '@celo/utils/lib/istanbul.js';

export const prepareCeloHeader = (
    block: ExtendedRpcBlock,
    asBuffer: boolean = false
): CeloHeaderType<Buffer> | CeloHeaderType<string> => {
    if (asBuffer) {
        if (!block.nonce) {
            // Before Gingerbread fork, aug 18 2023
            return {
                parentHash: toBuffer(block.parentHash),
                coinbase: toBuffer(block.miner),
                root: toBuffer(block.stateRoot) || hexValue(KECCAK256_NULL),
                txHash:
                    toBuffer(block.transactionsRoot) ||
                    hexValue(KECCAK256_NULL),
                receiptHash:
                    toBuffer(block.receiptsRoot) ||
                    toBuffer(block.receiptRoot) ||
                    hexValue(KECCAK256_NULL),
                bloom: toBuffer(block.logsBloom),
                number: bigIntToBuffer(BigInt(block.number)),
                gasUsed: bigIntToBuffer(BigInt(block.gasUsed)),
                time: bigIntToBuffer(BigInt(block.timestamp)),
                extra: toBuffer(block.extraData)
            };
        }
    }

    if (!block.nonce) {
        // Before Gingerbread fork, aug 18 2023

        return {
            parentHash: block.parentHash,
            coinbase: block.miner,
            root: block.stateRoot || hexValue(KECCAK256_NULL),
            txHash: block.transactionsRoot || hexValue(KECCAK256_NULL),
            receiptHash:
                block.receiptsRoot ||
                block.receiptRoot ||
                hexValue(KECCAK256_NULL),
            bloom: block.logsBloom,
            number: handleRLPNumber(block.number),
            gasUsed: handleRLPNumber(block.gasUsed),
            time: handleRLPNumber(block.timestamp),
            extra: block.extraData
        };
    }

    return {
        parentHash: block.parentHash,
        uncleHash: block.sha3Uncles,
        coinbase: block.miner,
        root: block.stateRoot || hexValue(KECCAK256_NULL),
        txHash: block.transactionsRoot || hexValue(KECCAK256_NULL),
        receiptHash:
            block.receiptsRoot || block.receiptRoot || hexValue(KECCAK256_NULL),
        bloom: block.logsBloom,
        difficulty: handleRLPNumber(block.difficulty),
        number: handleRLPNumber(block.number),
        gasLimit: handleRLPNumber(block.gasLimit),
        gasUsed: handleRLPNumber(block.gasUsed),
        time: handleRLPNumber(block.timestamp),
        extra: block.extraData,
        mixDigest: block.mixHash,
        nonce: block.nonce,
        ...addOptional('baseFeePerGas', () =>
            handleRLPNumber(block.baseFeePerGas)
        )
    };
};

export const istanbulFilteredHeader = (
    header: CeloHeaderType<string>,
    keepSeal: true
) => {
    const newHeader = { ...header };

    const istanbulExtra = parseBlockExtraData(header.extra);
    const celoUtilIstanbulExtra = parseBlockExtraData(header.extra);

    if (!keepSeal) {
        istanbulExtra.seal = '';
    }

    istanbulExtra.aggregatedSeal = {
        bitmap: null,
        signature: null,
        round: null
    };

    const payload = encodeBlockExtraData(istanbulExtra);
    const all = getOnlyIstanbulVanity(header.extra) + payload.slice(2);

    newHeader.extra = all;
    return newHeader;
};
