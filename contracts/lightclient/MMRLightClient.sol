// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ShoyuBashi} from "../../hashi/packages/evm/contracts/ownable/ShoyuBashi.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {MerkleMountainRange} from "./lib/MerkleMountainRange.sol";
import {IZkVerifier} from "./interfaces/IZkVerifier.sol";

contract MMRLightClient {
    using MerkleMountainRange for MerkleMountainRange.MMR;
    using MerkleProof for bytes32[];

    error BlockNumberOutOfRange();
    error InvalidMMRProof();
    error InvalidBlockHeader();

    uint32 public constant BLOCK_BATCH_SIZE = 1024;
    uint32 public constant BLOCK_BATCH_DEPTH = 10;

    MerkleMountainRange.MMR public historicalMMR;
    IZkVerifier public immutable zkVerifier;
    ShoyuBashi public immutable shoyuBashi;

    uint32 public immutable CHAIN_ID;
    uint32 public immutable INIT_BLOCK;

    uint32 public head;

    constructor(address shoyuBashi_, address zkVerifier_, uint32 chainId_, uint32 initBlock_) {
        shoyuBashi = ShoyuBashi(shoyuBashi_);
        zkVerifier = IZkVerifier(zkVerifier_);

        require(initBlock_ % BLOCK_BATCH_SIZE == 0, "invalid checkpoint block");

        CHAIN_ID = chainId_;
        INIT_BLOCK = initBlock_;
        head = initBlock_;
    }

    function verifyBlockHeader(
        uint32 blockNumber_,
        bytes calldata blockHeader_,
        bytes32[] calldata mmrProof_,
        bytes32 batchRoot_,
        bytes32[] calldata batchProof_
    ) public view returns (bytes32 blockHash) {
        if (head < blockNumber_) revert BlockNumberOutOfRange();

        if (!historicalMMR.verify((blockNumber_ - INIT_BLOCK) / BLOCK_BATCH_SIZE, batchRoot_, mmrProof_))
            revert InvalidMMRProof();

        blockHash = keccak256(blockHeader_);

        if (!batchProof_.verify(batchRoot_, blockHash)) revert InvalidBlockHeader();
    }

    function updateCheckpoint(bytes calldata zkProof_, bytes32 root_) public {
        bytes32 prevCPBlockHash = shoyuBashi.getThresholdHash(CHAIN_ID, head);
        bytes32 curCPBlockHash = shoyuBashi.getThresholdHash(CHAIN_ID, head + BLOCK_BATCH_SIZE);

        zkVerifier.verify(abi.encode(zkProof_, prevCPBlockHash, curCPBlockHash, root_));

        MerkleMountainRange.MMR memory mmr = historicalMMR.clone();
        uint32 peaksChanged = mmr.appendSingle(root_);
        historicalMMR.copyFrom(mmr, peaksChanged);

        head = head + BLOCK_BATCH_SIZE;
    }

    function updateCheckpoints(bytes calldata zkProof_, bytes32[] memory roots_) public {
        bytes32 prevCPBlockHash = shoyuBashi.getThresholdHash(CHAIN_ID, head);
        bytes32 curCPBlockHash = shoyuBashi.getThresholdHash(CHAIN_ID, head + BLOCK_BATCH_SIZE * roots_.length);

        zkVerifier.verify(abi.encode(zkProof_, prevCPBlockHash, curCPBlockHash, roots_));

        MerkleMountainRange.MMR memory mmr = historicalMMR.clone();
        uint32 peaksChanged = mmr.append(roots_);
        historicalMMR.copyFrom(mmr, peaksChanged);

        head = head + BLOCK_BATCH_SIZE * uint32(roots_.length);
    }
}
