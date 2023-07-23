import {
    KECCAK256_NULL,
    KECCAK256_RLP_ARRAY,
    toBuffer,
    bigIntToBuffer
} from '@ethereumjs/util';
import { EthereumHeaderType } from '../../types/block/ethereumBlock.js';
import { ExtendedRpcBlock } from '../../types/ethereum.js';
import { addOptional } from '../blocks.js';
import { handleRLPNumber } from '../rlp.js';
import { hexValue } from '../hex.js';

export const prepareEthereumHeader = (
    block: ExtendedRpcBlock,
    /*
     *   please avoid asBuffer for the time being
     */
    asBuffer: boolean = false
): EthereumHeaderType<Buffer> | EthereumHeaderType<string> => {
    if (asBuffer) {
        return {
            parentHash: toBuffer(block.parentHash),
            uncleHash: toBuffer(block.sha3Uncles) || KECCAK256_RLP_ARRAY,
            coinbase: toBuffer(block.miner),
            root: toBuffer(block.stateRoot) || KECCAK256_NULL,
            txHash: toBuffer(block.transactionsRoot) || KECCAK256_NULL,
            receiptHash:
                toBuffer(block.receiptsRoot) ||
                toBuffer(block.receiptRoot) ||
                KECCAK256_NULL,
            bloom: toBuffer(block.logsBloom),
            difficulty: bigIntToBuffer(BigInt(block.difficulty)),
            number: bigIntToBuffer(BigInt(block.number)),
            gasLimit: bigIntToBuffer(BigInt(block.gasLimit)),
            gasUsed: bigIntToBuffer(BigInt(block.gasUsed)),
            time: bigIntToBuffer(BigInt(block.timestamp)),
            extra: toBuffer(block.extraData),
            mixDigest: toBuffer(block.mixHash),
            nonce: toBuffer(block.nonce),
            ...addOptional(
                'baseFee',
                () => bigIntToBuffer(BigInt(block.baseFeePerGas)),
                () => block.baseFeePerGas
            ),
            ...addOptional(
                'withdrawalsHash',
                () => toBuffer(block.withdrawalsRoot),
                () => block.withdrawalsRoot
            ),
            ...addOptional(
                'excessDataGas',
                () => toBuffer(block.excessDataGas),
                () => block.excessDataGas
            ),
            ...addOptional(
                'dataGasUsed',
                () => toBuffer(block.dataGasUsed),
                () => block.dataGasUsed
            )
        };
    }

    return {
        parentHash: block.parentHash,
        uncleHash: block.uncleHash || hexValue(KECCAK256_RLP_ARRAY),
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
        ),
        ...addOptional('withdrawalsRoot', () => block.withdrawalsRoot),
        ...addOptional('excessDataGas', () => block.excessDataGas),
        ...addOptional('dataGasUsed', () => block.dataGasUsed)
    };
};
