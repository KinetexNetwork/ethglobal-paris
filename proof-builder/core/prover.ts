import { RLP } from '@ethereumjs/rlp';
import { encodeReceipt, prepareReceipt } from '../utils/receipts.js';
import { buffArrToHex, hexValue } from '../utils/hex.js';
import { Trie } from '@ethereumjs/trie';
import { SupportedNetworks } from '../types/networks.js';
import { readFileSync } from 'fs';
import { BaseReceipt } from '../types/ethereum.js';
import { Nullable } from '../types/helpers.js';
import { BlockHeader } from '../types/block/block.js';
import { keccak256 } from 'ethers/lib/utils.js';

export class Prover<T extends SupportedNetworks> {
    network: T;
    indexer: string;
    txIndex: string;
    txReceipts: BaseReceipt[];

    receiptsTrie: Nullable<Trie>;

    blockHeader: Nullable<BlockHeader<T>>;

    constructor(network: T, indexer: string, txIndex: string) {
        this.network = network;
        this.indexer = indexer;
        this.txIndex = txIndex;

        const { receipts } = this.readData(indexer);
        this.txReceipts = receipts;
    }

    readData(indexer: string) {
        const getPath = (component: string) =>
            `./output/${this.network}-${indexer}-${component}.json`;

        const getComponent = (component: string) =>
            JSON.parse(readFileSync(getPath(component)).toString());

        return {
            receipts: getComponent('receipts'),
            block: getComponent('block')
        };
    }

    /* Proves that a receipt is part of receiptsRoot */
    async receiptProof(asHex = true) {
        if (!this.txIndex) {
            throw new Error('tx index not provided');
        }

        const txsSorted = this.txReceipts.sort(
            (prev, curr) =>
                parseInt(prev.transactionIndex, 16) -
                parseInt(curr.transactionIndex, 16)
        );

        const trie = await Trie.create({
            useRootPersistence: false
        });

        const encodedReceipts = [];

        for (let i = 0; i < txsSorted.length; i++) {
            const tx = txsSorted[i];
            const encodedReceipt = encodeReceipt(
                //@ts-ignore
                prepareReceipt(tx, this.network),
                parseInt(tx.type, 16)
            );

            encodedReceipts.push(hexValue(encodedReceipt));

            // use transaction index as the key for inserting into the trie
            await trie.put(RLP.encode(i) as Buffer, encodedReceipt as Buffer);
        }

        this.receiptsTrie = trie;

        // Key should be the transaction index you want to prove
        const key = RLP.encode(parseInt(this.txIndex, 16));
        const proof = await trie.createProof(key as Buffer);

        return asHex ? buffArrToHex(proof) : proof;
    }
}
