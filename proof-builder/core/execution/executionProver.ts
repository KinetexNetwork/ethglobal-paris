import { ExtendedRpcBlock } from '../../types/ethereum.js';
import { Nullable } from '../../types/helpers.js';
import { SupportedNetworks } from '../../types/networks.js';
import { ensureLeading0x, hexValue } from '../../utils/hex.js';
import { Prover } from '../prover.js';
import { RLP } from '@ethereumjs/rlp';
import ejsUtil from 'ethereumjs-util';
import { getHeader, getRLPArray } from '../../utils/blocks.js';
import { keccak256, solidityKeccak256 } from 'ethers/lib/utils.js';
// import { parseBlockExtraData } from '@celo/utils/lib/istanbul.js';
import { newKit } from '@celo/contractkit';
import {
    celoHeaderFromBlock,
    parseBlockExtraData
} from '../../utils/chains/celo.js';
import { istanbulFilteredHeader } from '../../utils/block/celoBlock.js';

export class ExecutionProver<T extends SupportedNetworks> extends Prover<T> {
    blockNumber: Nullable<string>;
    blockData: ExtendedRpcBlock;

    constructor(
        network: T,
        blockNumber: Nullable<string>,
        txIndex: Nullable<string>
    ) {
        if (!blockNumber || !txIndex) {
            throw new Error('Please specify blockNumber and txIndex');
        }

        super(network, blockNumber, txIndex);

        this.blockNumber = blockNumber;

        const { block } = this.readData(blockNumber);

        this.blockData = block;
    }

    get blockType() {
        return typeof this.blockHeader;
    }

    get rawBlock() {
        return this.blockData;
    }

    async tryCeloKit() {
        console.warn('!this is a debug function, use createBlockHash!');

        if (!this.blockNumber) {
            throw new Error('Receipt Trie has not been generated');
        }

        const ourHeader: any = getHeader(this.blockData, this.network, false);
        const filteredHeader = istanbulFilteredHeader(ourHeader, true);

        const kit = newKit('https://forno.celo.org');
        const block = await kit.connection.getBlock(this.blockNumber);
        const header = celoHeaderFromBlock(block);
        const hasher = await kit._web3Contracts.getElection();
        const blockHash = await hasher.methods.hashHeader(header).call();

        // const whatsInFilteredExtra = parseBlockExtraData(
        //     '0xd983010700846765746889676f312e31372e3133856c696e7578000000000000f88dc0c080b8414efb2a976eb3a62c208bf0da1a6ce5a495a0754cea5822a76ebba93de70dd5fc05665b14c280298c4da003be9ad724ec511e7b12ed7a4ea12c1291cc240295f601c3808080f8418e3fffffffffffffffffffffffffffb0ab2bd5d63975870db3209c20c96b93c7ed78642adb964a507906fb6ee2e7851744938ae28a3732f7fce805bcf31a010080'
        // );
        // const whatsInFilteredExtra2 = parseBlockExtraData(filteredHeader.extra);
        // // console.log({ whatsInFilteredExtra, whatsInFilteredExtra2 });

        const gethRLP =
            '0xf9025ba065c11097bf16ab28ffad0f301bc68e4cddfe71674818c1ec840558ed97406cd8944737f30dc688f3195843da53d04828c96f74b6eaa0b007d38f0552c2dc34e1c36127159dab29afa6634cf37ee6a45f94259ce99860a085c8353a46c406d19e5b15b73413a63e88285d3663b263bb54e4698595eecdaba0d58dc9f053f31226f1b001a28b5799e4a2003b7c2aafe15a40e7b73c1254188eb9010010800001008200080200240000805000000840080100400002000802800000100000080010000040000080002000000c4884000000000000200100000024784000400010000200024808400800000200000108010406001808000000001000000004080802040000004040400000880101080400000800004011041200300010000c0014c8000020604000000100100a00100000280000c008010000009080004600008040000204000800010000200000060490000000010400000004000000001010020100181228000000002040000008020c000210008000001040006000101904000000000080008402041000400a0041200000640008214000084420008401365936832aca0f8464b1a34eb8afd983010700846765746889676f312e31372e3133856c696e7578000000000000f88dc0c080b8414efb2a976eb3a62c208bf0da1a6ce5a495a0754cea5822a76ebba93de70dd5fc05665b14c280298c4da003be9ad724ec511e7b12ed7a4ea12c1291cc240295f601c3808080f8418e3fffffffffffffffffffffffffffb0ab2bd5d63975870db3209c20c96b93c7ed78642adb964a507906fb6ee2e7851744938ae28a3732f7fce805bcf31a010080';

        const beforeIstanbulFIlterRLP = hexValue(
            RLP.encode(Object.values(ourHeader))
        );
        const ourRLP = hexValue(RLP.encode(Object.values(filteredHeader)));

        const beforeIstanbulFIlterDecode = RLP.decode(
            beforeIstanbulFIlterRLP
            //@ts-ignore
        ).map((el) => hexValue(el));
        //@ts-ignore
        const gethDecode = RLP.decode(gethRLP).map((el) => hexValue(el));
        //@ts-ignore
        const ourDecode = RLP.decode(ourRLP).map((el) => hexValue(el));

        console.log({
            // beforeIstanbulFIlterRLP,
            gethRLP,
            ourRLP,
            // beforeIstanbulFIlterDecode,
            // gethDecode,
            // ourDecode,
            // blockHash,
            ourHash: keccak256(ourRLP),
            gethHash: keccak256(gethRLP),
            rpcHash: this.getBlockHash()
        });
    }

    rlpEncodedHeader = () => {
        if (this.network === SupportedNetworks.CELO) {
            const header: any = getHeader(this.blockData, this.network, false);
            const filteredHeader = istanbulFilteredHeader(header, true);
            return hexValue(RLP.encode(Object.values(filteredHeader)));
        }

        const gethArray = getRLPArray(this.blockData, this.network, false);
        const encoded = hexValue(RLP.encode(gethArray));

        return encoded;
    };

    createBlockHash = () => {
        return keccak256(this.rlpEncodedHeader());
    };

    getBlockHash() {
        return this.blockData.hash;
    }

    getCeloExtraData() {
        if (this.network !== SupportedNetworks.CELO) {
            throw new Error('getCeloExtraData is a Celo-specific function');
        }

        return parseBlockExtraData(this.blockData.extraData);
    }

    async testBlockHash() {
        const calculatedHash = this.createBlockHash();
        const rpcHash = this.getBlockHash();

        if (calculatedHash !== rpcHash) {
            console.log({ calculatedHash, rpcHash });
            throw new Error(
                'testBlockHash: Calculated hash is different from RPC hash'
            );
        }

        console.log('testBlockHash: OK');
    }

    getReceiptsRoot({ fromTrie = true }: { fromTrie: boolean }) {
        if (fromTrie && this.receiptsTrie) {
            return hexValue(this.receiptsTrie.root());
        }

        return this.blockData.receiptsRoot;
    }

    testReceiptRoots() {
        if (!this.receiptsTrie) {
            throw new Error('Receipt Trie has not been generated');
        }

        if (
            hexValue(this.receiptsTrie.root()) !== this.blockData.receiptsRoot
        ) {
            console.log({
                receiptsRoot: hexValue(this.receiptsTrie.root()),
                rpcRoot: this.blockData.receiptsRoot
            });
            throw new Error(
                'testReceiptRoots: Receipts Trie root is different from RPC data'
            );
        }

        console.log('testReceiptRoots: OK');
    }

    static build(
        network: SupportedNetworks,
        blockNumber: Nullable<string>,
        txIndex: Nullable<string>
    ) {
        const args: [Nullable<string>, Nullable<string>] = [
            blockNumber,
            txIndex
        ];

        switch (network) {
            case SupportedNetworks.CELO:
                return new ExecutionProver(SupportedNetworks.CELO, ...args);

            case SupportedNetworks.GNOSIS:
                return new ExecutionProver(SupportedNetworks.GNOSIS, ...args);

            case SupportedNetworks.ZKSYNC:
                return new ExecutionProver(SupportedNetworks.ZKSYNC, ...args);

            case SupportedNetworks.POLYGON:
                return new ExecutionProver(SupportedNetworks.POLYGON, ...args);

            case SupportedNetworks['POLYGON-ZK']:
                return new ExecutionProver(
                    SupportedNetworks['POLYGON-ZK'],
                    ...args
                );

            case SupportedNetworks.ARBITRUM:
                return new ExecutionProver(SupportedNetworks.ARBITRUM, ...args);

            case SupportedNetworks.OPTIMISM:
                return new ExecutionProver(SupportedNetworks.OPTIMISM, ...args);

            case SupportedNetworks.AVALANCHE:
                return new ExecutionProver(
                    SupportedNetworks.AVALANCHE,
                    ...args
                );

            case SupportedNetworks.BNB:
                return new ExecutionProver(SupportedNetworks.BNB, ...args);

            case SupportedNetworks.GOERLI:
                return new ExecutionProver(SupportedNetworks.GOERLI, ...args);

            case SupportedNetworks.CHIADO:
                return new ExecutionProver(SupportedNetworks.CHIADO, ...args);

            case SupportedNetworks.FANTOM:
                return new ExecutionProver(SupportedNetworks.FANTOM, ...args);

            case SupportedNetworks.LINEA:
                return new ExecutionProver(SupportedNetworks.LINEA, ...args);

            default:
                return new ExecutionProver(SupportedNetworks.MAINNET, ...args);
        }
    }
}
