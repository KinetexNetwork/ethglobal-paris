// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {MMRLightClient} from "../lightclient/MMRLightClient.sol";
import {ProofVerifier, ProofChainConfig, HashEventProof} from "./ProofVerifier.sol";
import {BlockData} from "./lib/BlockData.sol";
import {RLPReader} from "solidity-rlp/contracts/RLPReader.sol";
import {EventLib} from "./lib/EventLib.sol";

struct BlockProof {
    bytes blockHeader;
    bytes32[] mmrProof;
    bytes32 batchRoot;
    bytes32[] batchProof;
}

contract MMRProofVerifier is ProofVerifier {
    using BlockData for RLPReader.RLPItem[];
    using BlockData for bytes;

    // solhint-disable-next-line no-empty-blocks
    constructor(ProofChainConfig[] memory proofChainConfigs_) ProofVerifier(proofChainConfigs_) {}

    function verifyHashEventProof(
        bytes32 sig_,
        bytes32 hash_,
        uint256 chain_,
        bytes calldata proof_
    ) external view override validateLightClient(chain_) validateBroadcaster(chain_) {
        // Decode proof data
        (BlockProof memory blockProof, HashEventProof memory eventProof) = abi.decode(
            proof_,
            (BlockProof, HashEventProof)
        );

        // Decode & verify block
        RLPReader.RLPItem[] memory blockHeaderRlp = blockProof.blockHeader.rlpDecode();
        uint256 blockNumber = blockHeaderRlp.blockNumber();
        bytes32 receiptsRoot = blockHeaderRlp.receiptsRoot();

        _verifyBlock(chain_, uint32(blockNumber), blockProof);
        _verifyEvent(chain_, receiptsRoot, sig_, hash_, eventProof);
    }

    function _verifyBlock(uint256 chain_, uint32 blockNumber_, BlockProof memory blockProof_) internal view {
        // Verify block
        MMRLightClient(lightClients[chain_]).verifyBlockHeader(
            blockNumber_,
            blockProof_.blockHeader,
            blockProof_.mmrProof,
            blockProof_.batchRoot,
            blockProof_.batchProof
        );
    }
}
