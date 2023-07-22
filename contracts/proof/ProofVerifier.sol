// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {MMRLightClient} from "../lightclient/MMRLightClient.sol";
import {IProofVerifier} from "./interfaces/IProofVerifier.sol";
import {BlockData} from "./lib/BlockData.sol";
import {BlockData} from "./lib/BlockData.sol";
import {RLPReader} from "solidity-rlp/contracts/RLPReader.sol";
import {EventLib} from "./lib/EventLib.sol";

struct ProofChainConfig {
    uint256 chain;
    address lightClient;
    address broadcaster;
}

struct HashEventProof {
    bytes[] receiptProof;
    bytes txIndexRLPEncoded;
    uint256 logIndex;
}

abstract contract ProofVerifier is IProofVerifier {
    mapping(uint256 => address) public lightClients;
    mapping(uint256 => address) public broadcasters;

    uint256 private constant HASH_TOPIC_INDEX = 1; // Topic #0 is hash of event signature

    constructor(ProofChainConfig[] memory proofChainConfigs_) {
        for (uint256 i = 0; i < proofChainConfigs_.length; i++) {
            ProofChainConfig memory config = proofChainConfigs_[i];
            lightClients[config.chain] = config.lightClient;
            broadcasters[config.chain] = config.broadcaster;
        }
    }

    modifier validateLightClient(uint256 chain_) {
        require(lightClients[chain_] != address(0), "HPV: no light client");
        _;
    }

    modifier validateBroadcaster(uint256 chain_) {
        require(broadcasters[chain_] != address(0), "HPV: no broadcaster");
        _;
    }

    function verifyHashEventProof(
        bytes32 sig_,
        bytes32 hash_,
        uint256 chain_,
        bytes calldata proof_
    ) external view virtual;

    function _verifyEvent(
        uint256 chain_,
        bytes32 receiptsRoot_,
        bytes32 sig_,
        bytes32 hash_,
        HashEventProof memory eventProof
    ) internal view {
        // Verify broadcaster set
        address broadcaster = broadcasters[chain_];
        require(broadcaster != address(0), "HPV: no broadcaster");

        // Verify hash topic
        bytes32 eventHash = EventLib.getEventTopic(
            eventProof.receiptProof,
            receiptsRoot_,
            eventProof.txIndexRLPEncoded,
            eventProof.logIndex,
            broadcasters[chain_],
            sig_,
            HASH_TOPIC_INDEX
        );
        require(eventHash == hash_, "HPV: invalid event hash");
    }
}
