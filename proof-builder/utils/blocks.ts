import { JsonRpcBlock } from '@ethereumjs/block';
import { Providers, SupportedNetworks } from '../types/networks.js';
import { ExtendedRpcBlock } from '../types/ethereum.js';
import { prepareEthereumHeader } from './block/ethereumBlock.js';
import { prepareCeloHeader } from './block/celoBlock.js';

export const addOptional = (
    key: string,
    accessor: () => any,
    /*  in case your acessor is wrapped in a
        formatter that handles the error
        such as toBuffer from @ethereumjs/util
    */
    strictAccessor?: () => any
) => {
    if (strictAccessor) {
        try {
            return !!strictAccessor() ? { [key]: accessor() } : {};
        } catch (error) {
            return {};
        }
    }

    try {
        return !!accessor() ? { [key]: accessor() } : {};
    } catch (error) {
        return {};
    }
};

const getTransactions = (
    blockData: ExtendedRpcBlock,
    provider: Providers = Providers.ONFINALITY,
    onlyHashes: boolean = false
) => {
    switch (provider) {
        case Providers.ONFINALITY:
            return onlyHashes
                ? //@ts-ignore
                  blockData.transactions.map((tx) => tx.hash)
                : //@ts-ignore
                  blockData.transactions.filter(
                      //@ts-ignore
                      (tx) => tx.type.toLowerCase() !== '0x7e'
                  );

        case Providers.QUICKNODE:
            return blockData.transactions;
    }
};

export const unifiedBlockToRpc = (
    blockData: ExtendedRpcBlock,
    provider: Providers = Providers.ONFINALITY,
    onlyHashes: boolean = false
): JsonRpcBlock => ({
    number: blockData.number,
    hash: blockData.hash,
    parentHash: blockData.parentHash,
    nonce: blockData.nonce,
    sha3Uncles: blockData.sha3Uncles,
    logsBloom: blockData.logsBloom,
    transactionsRoot: blockData.transactionsRoot,
    stateRoot: blockData.stateRoot,
    receiptsRoot: blockData.receiptsRoot,
    miner: blockData.miner,
    difficulty: blockData.difficulty,
    totalDifficulty: blockData.totalDifficulty,
    extraData: blockData.extraData,
    size: blockData.size,
    gasLimit: blockData.gasLimit,
    gasUsed: blockData.gasUsed,
    timestamp: blockData.timestamp,
    uncles: blockData.uncles,
    transactions: getTransactions(blockData, provider, onlyHashes)
});

export const getHeader = (
    block: ExtendedRpcBlock,
    network: SupportedNetworks,
    asBuffer: boolean = false
) => {
    switch (network) {
        case SupportedNetworks.MAINNET:
            return prepareEthereumHeader(block, asBuffer);

        case SupportedNetworks.CELO:
            return prepareCeloHeader(block, asBuffer);

        default:
            return prepareEthereumHeader(block, asBuffer);
    }
};

export const getRLPArray = (
    block: ExtendedRpcBlock,
    network: SupportedNetworks,
    asBuffer: boolean = false
) => Object.values(getHeader(block, network, asBuffer));
