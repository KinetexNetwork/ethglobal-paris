import { RLP } from '@ethereumjs/rlp';
import {
    bigIntToBuffer,
    bufArrToArr,
    intToBuffer,
    toBuffer
} from '@ethereumjs/util';
import { BaseReceipt, PreparedReceipt } from '../types/ethereum.js';
import { SupportedNetworks } from '../types/networks.js';

/**
 * Returns the encoded tx receipt.
 */
export function encodeReceipt(receipt: PreparedReceipt, txType: number) {
    const encoded = Buffer.from(
        RLP.encode(
            bufArrToArr([
                receipt.stateRoot ?? receipt.status,
                receipt.cumulativeBlockGasUsed,
                receipt.bitvector,
                receipt.logs
            ])
        )
    );

    // Warning: this is ArbitrumLegacyTX.
    // This should be checked against other networks
    // network === Arbitrum condition added
    if (txType === 0 || txType === 120) {
        return encoded;
    }

    // Serialize receipt according to EIP-2718:
    // `typed-receipt = tx-type || receipt-data`
    return Buffer.concat([intToBuffer(txType), encoded]);
}

export const getNullishBuffer = (v: string | number) => {
    if (typeof v === 'string') {
        const bi = BigInt(v);
        return bi === 0n ? toBuffer(null) : bigIntToBuffer(bi);
    }

    return v === 0 ? toBuffer(null) : intToBuffer(v);
};

const getCumulativeGasUsed = (
    value: string | number,
    network: SupportedNetworks
) => {
    switch (network) {
        case SupportedNetworks.ARBITRUM:
            return getNullishBuffer(value);

        case SupportedNetworks.CELO:
            return getNullishBuffer(value);

        default:
            return typeof value === 'string'
                ? bigIntToBuffer(BigInt(value))
                : intToBuffer(value);
    }
};

/**
 * Encodes the fields of the receipt.
 */
export const prepareReceipt = (
    receipt: BaseReceipt,
    network: SupportedNetworks
) => {
    const statusPrepared =
        typeof receipt.status === 'string'
            ? parseInt(receipt.status, 16)
            : receipt.status;

    const cumulativeBlockGasUsed = getCumulativeGasUsed(
        receipt.cumulativeGasUsed,
        network
    );

    const bitvector = Buffer.from(receipt.logsBloom.slice(2), 'hex');

    const status = statusPrepared === 0 ? Buffer.from([]) : intToBuffer(1);

    const logs = receipt.logs.map((log) =>
        // type Log = [address: Buffer, topics: Buffer[], data: Buffer]
        bufArrToArr([
            Buffer.from(log.address.slice(2), 'hex'), // address
            log.topics.map((topic) => Buffer.from(topic.slice(2), 'hex')), // topics
            Buffer.from(log.data.slice(2), 'hex') // data
        ])
    );

    // Define the receipt format based on Ethereum's implementation
    return {
        status,
        cumulativeBlockGasUsed,
        bitvector,
        logs
    };
};

enum GetBlockReceipts {
    ETH = 'eth_getBlockReceipts',
    PARITY = 'parity_getBlockReceipts',
    RAW = 'debug_getRawReceipts'
}

/**
 * Returns the Eth call to get block receipts.
 */
export const getReceiptsMethod = (
    network: SupportedNetworks
): GetBlockReceipts => {
    switch (network) {
        case SupportedNetworks.GOERLI:
            return GetBlockReceipts.ETH;

        case SupportedNetworks.GNOSIS:
            return GetBlockReceipts.PARITY;

        case SupportedNetworks.MAINNET:
            return GetBlockReceipts.ETH;

        case SupportedNetworks.ARBITRUM:
            return GetBlockReceipts.RAW;

        case SupportedNetworks.OPTIMISM:
            return GetBlockReceipts.RAW;

        default:
            return GetBlockReceipts.RAW;
    }
};
