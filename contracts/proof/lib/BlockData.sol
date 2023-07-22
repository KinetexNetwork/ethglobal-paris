// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {RLPReader} from "solidity-rlp/contracts/RLPReader.sol";

library BlockData {
    using RLPReader for RLPReader.RLPItem;

    enum BlockStruct {
        ParentHash,
        Sha3Uncles,
        Coinbase,
        Root,
        TxHash,
        ReceiptHash,
        Bloom,
        Difficulty,
        Number,
        GasLimit,
        GasUsed,
        Time,
        Extra,
        MixDigest,
        Nonce
    }

    error InvalidBlockHeaderRLP();
    error InvalidBlockHeaderLength(uint256 length);

    function rlpDecode(bytes calldata blockHeader) public pure returns (RLPReader.RLPItem[] memory blockHeaderContent) {
        RLPReader.RLPItem memory blockHeaderRLP = RLPReader.toRlpItem(blockHeader);
        if (!blockHeaderRLP.isList()) revert InvalidBlockHeaderRLP();
        blockHeaderContent = blockHeaderRLP.toList();
        if (blockHeaderContent.length < 15) revert InvalidBlockHeaderLength(blockHeaderContent.length);
    }

    function blockHash(bytes calldata blockHeader) public pure returns (bytes32) {
        return keccak256(blockHeader);
    }

    function blockNumber(RLPReader.RLPItem[] memory blockHeaderContent) public pure returns (uint256) {
        return uint256(blockHeaderContent[uint(BlockStruct.Number)].toUint());
    }

    function timestamp(RLPReader.RLPItem[] memory blockHeaderContent) public pure returns (uint256) {
        return uint256(blockHeaderContent[uint(BlockStruct.Time)].toUint());
    }

    function parentBlockHash(RLPReader.RLPItem[] memory blockHeaderContent) public pure returns (bytes32) {
        return bytes32(blockHeaderContent[uint(BlockStruct.ParentHash)].toUint());
    }

    function stateRoot(RLPReader.RLPItem[] memory blockHeaderContent) public pure returns (bytes32) {
        return bytes32(blockHeaderContent[uint(BlockStruct.Root)].toUint());
    }

    function txRoot(RLPReader.RLPItem[] memory blockHeaderContent) public pure returns (bytes32) {
        return bytes32(blockHeaderContent[uint(BlockStruct.TxHash)].toUint());
    }

    function receiptsRoot(RLPReader.RLPItem[] memory blockHeaderContent) public pure returns (bytes32) {
        return bytes32(blockHeaderContent[uint(BlockStruct.ReceiptHash)].toUint());
    }
}
