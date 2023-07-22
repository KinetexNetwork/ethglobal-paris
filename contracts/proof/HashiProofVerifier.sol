// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ShoyuBashi} from "../../hashi/packages/evm/contracts/ownable/ShoyuBashi.sol";
import {ProofVerifier, ProofChainConfig, HashEventProof} from "./ProofVerifier.sol";
import {BlockData} from "./lib/BlockData.sol";
import {RLPReader} from "solidity-rlp/contracts/RLPReader.sol";
import {EventLib} from "./lib/EventLib.sol";

contract HashiProofVerifier is ProofVerifier {
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
        (bytes memory blockHeader, HashEventProof memory eventProof) = abi.decode(proof_, (bytes, HashEventProof));

        // Decode & verify block
        RLPReader.RLPItem[] memory blockHeaderRlp = blockHeader.rlpDecode();
        uint256 blockNumber = blockHeaderRlp.blockNumber();
        bytes32 receiptsRoot = blockHeaderRlp.receiptsRoot();

        _verifyBlock(chain_, uint32(blockNumber), blockHeader);
        _verifyEvent(chain_, receiptsRoot, sig_, hash_, eventProof);
    }

    function _verifyBlock(uint256 chain_, uint32 blockNumber_, bytes memory blockHeader_) internal view {
        // Verify block
        require(
            ShoyuBashi(lightClients[chain_]).getThresholdHash(chain_, blockNumber_) == keccak256(blockHeader_),
            "HPV: invalid block"
        );
    }
}
