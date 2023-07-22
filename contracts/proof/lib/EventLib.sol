// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {RLPReader} from "solidity-rlp/contracts/RLPReader.sol";
import {MerkleTrie} from "@eth-optimism/contracts-bedrock/contracts/libraries/trie/MerkleTrie.sol";

library EventLib {
    using RLPReader for RLPReader.RLPItem;
    using RLPReader for bytes;

    function getEventTopic(
        bytes[] memory proof_,
        bytes32 receiptRoot_,
        bytes memory key_,
        uint256 logIndex_,
        address claimedEmitter_,
        bytes32 eventSignature_,
        uint256 topicIndex_
    ) internal pure returns (bytes32) {
        bytes memory value = MerkleTrie.get(key_, proof_, receiptRoot_);
        bytes1 txTypeOrFirstByte = value[0];

        // Currently, there are three possible transaction types on Ethereum. Receipts either come
        // in the form "TransactionType | ReceiptPayload" or "ReceiptPayload". The currently
        // supported set of transaction types are 0x01 and 0x02. In this case, we must truncate
        // the first byte to access the payload. To detect the other case, we can use the fact
        // that the first byte of a RLP-encoded list will always be greater than 0xc0.
        // Reference 1: https://eips.ethereum.org/EIPS/eip-2718
        // Reference 2: https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp
        uint256 offset;
        if (txTypeOrFirstByte == 0x01 || txTypeOrFirstByte == 0x02) {
            offset = 1;
        } else if (txTypeOrFirstByte >= 0xc0) {
            offset = 0;
        } else {
            revert("EL: unsupported tx type");
        }

        // Truncate the first byte if eneded and get the RLP decoding of the receipt.
        uint256 ptr;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ptr := add(value, 32)
        }
        RLPReader.RLPItem memory valueAsItem = RLPReader.RLPItem({len: value.length - offset, memPtr: ptr + offset});

        // The length of the receipt must be at least four, as the fourth entry contains events
        RLPReader.RLPItem[] memory valueAsList = valueAsItem.toList();
        require(valueAsList.length == 4, "EL: invalid receipt length");

        // Read the logs from the receipts and check that it is not ill-formed
        RLPReader.RLPItem[] memory logs = valueAsList[3].toList();
        require(logIndex_ < logs.length, "EL: log index out of bounds");
        RLPReader.RLPItem[] memory relevantLog = logs[logIndex_].toList();
        require(relevantLog.length == 3, "EL: log incorrect field number");

        // Validate that the correct contract emitted the event
        address contractAddress = relevantLog[0].toAddress();
        require(contractAddress == claimedEmitter_, "EL: invalid emitter");
        RLPReader.RLPItem[] memory topics = relevantLog[1].toList();

        // Validate that the correct event was emitted by checking the event signature
        require(bytes32(topics[0].toUint()) == eventSignature_, "EL: invalid event signature");

        return bytes32(topics[topicIndex_].toBytes());
    }
}
