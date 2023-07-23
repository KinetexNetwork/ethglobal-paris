import axios from 'axios';
import { SupportedNetworks } from '../../types/networks.js';
import { buildEndpoint } from '../../utils/network.js';
import { Nullable } from '../../types/helpers.js';
import { Fetcher } from '../fetcher.js';
import { writeFile } from 'fs/promises';
import { getReceiptsMethod } from '../../utils/receipts.js';
import {
    getExecutionOutputPath,
    sameDataTypeProviders
} from '../../utils/fetcher.js';
import { ExtendedRpcBlock, BaseReceipt } from '../../types/ethereum.js';

export class ExecutionFetcher extends Fetcher {
    network: SupportedNetworks;
    blockNumber: Nullable<string>;
    blockData: Nullable<ExtendedRpcBlock>;

    constructor(
        network: SupportedNetworks,
        blockNumber: Nullable<string>,
        encoded: boolean = false
    ) {
        super(network, encoded);
        this.network = network;
        this.blockNumber = blockNumber;
    }

    async getBlock() {
        if (!this.blockNumber) {
            throw new Error('Block number not provided');
        }

        const { provider } = buildEndpoint(this.network);

        const txBool =
            this.network === SupportedNetworks.CELO
                ? [false, 'false']
                : [true, 'true'];

        const params = [
            '0x' + parseInt(this.blockNumber, 10).toString(16).toUpperCase(),
            sameDataTypeProviders.includes(provider) ? txBool[0] : txBool[1]
        ];

        const block = await this.runCall(() =>
            this.callEthMethod('eth_getBlockByNumber', params, this.network)
        );

        this.blockData = block;

        return block;
    }

    async getBlockByHash(hash: string, withRaw: boolean = false) {
        const { provider } = buildEndpoint(this.network);

        const txBool =
            this.network === SupportedNetworks.CELO
                ? [false, 'false']
                : [true, 'true'];

        const params = [
            hash,
            sameDataTypeProviders.includes(provider) ? txBool[0] : txBool[1]
        ];

        console.log({ params });

        const block = await this.runCall(() =>
            this.callEthMethod('eth_getBlockByHash', params, this.network)
        );

        this.blockData = block;

        return block;
    }

    async getHeadBlockNumber() {
        return this.runCall(() =>
            this.callEthMethod('eth_blockNumber', [], this.network)
        );
    }

    /*
     * eth_getBlockReceipts is not supported
     * by many networks and providers.
     * fallback to getReceiptsForTx
     */
    async getReceipts() {
        if (!this.blockNumber) {
            throw new Error('Block number not provided');
        }

        const params = [
            '0x' + parseInt(this.blockNumber, 10).toString(16).toUpperCase()
        ];

        return this.runCall(() =>
            this.callEthMethod(
                getReceiptsMethod(this.network),
                params,
                this.network
            )
        );
    }

    /*
     * debug_getRawReceipts is not supported
     * by many networks and providers.
     * fallback to getReceiptsForTx
     */
    async getRawReceipts() {
        if (!this.blockNumber) {
            throw new Error('Block number not provided');
        }

        const params = [
            '0x' + parseInt(this.blockNumber, 10).toString(16).toUpperCase()
        ];

        return this.runCall(() =>
            this.callEthMethod('debug_getRawReceipts', params, this.network)
        );
    }

    /*
     * quicknode addon
     */
    async getQnReceipts() {
        if (!this.blockNumber) {
            throw new Error('Block number not provided');
        }

        const params = [
            '0x' + parseInt(this.blockNumber, 10).toString(16).toUpperCase()
        ];

        console.log({ params });

        return this.runCall(() =>
            this.callEthMethod('qn_getReceipts', params, this.network)
        );
    }

    /*
     * of the currently supported methods, this
     * is only needed for Celo blockchain
     */
    async getBlockReceipt() {
        if (!this.blockNumber || !this.blockData) {
            throw new Error('Fetch the block first');
        }

        const params = [this.blockData.hash];

        console.log({ params });

        return this.runCall(() =>
            this.callEthMethod('eth_getBlockReceipt', params, this.network)
        );
    }

    /*
     * this method is supported
     * by most networks and providers.
     * however, it can consume a lot of
     * api credits (1 for each receipt)
     */
    async getReceiptsForTxs() {
        if (!this.blockNumber || !this.blockData) {
            throw new Error('Please fetch block data first');
        }

        if (!this.blockData.transactions) {
            throw new Error(
                'Unknown block data. Please edit the code accordingly'
            );
        }

        const receipts: BaseReceipt[] = [];
        let ctr = 0;
        const len = this.blockData.transactions.length;

        for (const tx of this.blockData.transactions) {
            const txHash = typeof tx === 'string' ? tx : tx.hash;
            console.log(`Fetching receipt ${ctr + 1} of ${len}`);
            const params = [txHash];

            const receipt = await this.runCall(() =>
                this.callEthMethod(
                    'eth_getTransactionReceipt',
                    params,
                    this.network
                )
            );

            receipts.push(receipt);
            ctr++;
        }

        if (this.network === SupportedNetworks.CELO) {
            const params = [this.blockData.hash];

            const coreContractCallReceipt = await this.getBlockReceipt();
            console.log({ coreContractCallReceipt });

            coreContractCallReceipt && receipts.push(coreContractCallReceipt);
        }

        return receipts;
    }

    async saveBlockByHash(hash: string) {
        const block = await this.getBlockByHash(hash);
        console.log({ block });

        await writeFile(
            //@ts-ignore
            getExecutionOutputPath(this.network, 0, `block-hash-${hash}`),
            JSON.stringify(block, null, 4)
        );
    }

    async saveRawReceipts() {
        console.log('⚙️ fetching the receipts... ');
        const receipts = await this.getRawReceipts();
        console.log({ receipts });
        await writeFile(
            getExecutionOutputPath(
                this.network,
                //@ts-ignore
                this.blockNumber,
                'raw-receipts'
            ),
            JSON.stringify(receipts, null, 4)
        );
    }

    async saveQnReceipts() {
        console.log('⚙️ fetching the receipts... ');
        const receipts = await this.getQnReceipts();
        console.log({ receipts });
        await writeFile(
            getExecutionOutputPath(
                this.network,
                //@ts-ignore
                this.blockNumber,
                'qn-receipts'
            ),
            JSON.stringify(receipts, null, 4)
        );
    }

    async saveData() {
        if (!this.blockNumber) {
            throw new Error('Block number not set');
        }

        console.log('⚙️ fetching the block... ');
        const block = await this.getBlock();

        if (!block) {
            throw new Error('Block does not exist');
        }

        await writeFile(
            //@ts-ignore
            getExecutionOutputPath(this.network, this.blockNumber, 'block'),
            JSON.stringify(block, null, 4)
        );

        console.log('⚙️ fetching the receipts... ');
        const receipts = await this.getReceiptsForTxs();
        console.log({ receipts });
        await writeFile(
            //@ts-ignore
            getExecutionOutputPath(this.network, this.blockNumber, 'receipts'),
            JSON.stringify(receipts, null, 4)
        );
    }

    changeNetwork(network: SupportedNetworks) {
        this.network = network;
    }

    changeBlockNumber(blockNumber: string) {
        this.blockNumber = blockNumber;
    }
}
