// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IBHRManager {
    event HeaderReported(uint256 blockNumber);

    error HeaderOutOfRange(uint256 blockNumber);

    event CheckpointReported(uint256 blockNumber);

    error NoRecentCheckpointBlock();

    error NotRecentBlock(uint256 blockNumber);

    error BlockAlreadyReported(uint256 blockNumber);

    // function syncLastCheckpoint(uint256[] calldata gasCosts) external payable;

    // function syncBlockHeader(uint256 blockNum_, uint256[] calldata gasCosts) external payable;
}
