// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IBHRManager {
    event HeaderReported(uint256 blockNumber);

    error HeaderOutOfRange(uint256 blockNumber);

    event CheckpointReported(uint256 blockNumber);

    error NoRecentCheckpointBlock();

    error NotRecentBlock(uint256 blockNumber);

    function syncLastCheckpoint() external;

    function syncBlockHeader(uint256 blockNum_) external;
}
