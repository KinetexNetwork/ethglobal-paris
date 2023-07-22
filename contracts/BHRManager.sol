// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBHRManager} from "./interfaces/IBHRManager.sol";
import {IHeaderReporter} from "./interfaces/IHeaderReporter.sol";
import {BHRWhitelist} from "./BHRWhitelist.sol";

contract BHRManager is IBHRManager, BHRWhitelist {
    using EnumerableSet for EnumerableSet.AddressSet;

    uint32 public immutable BLOCK_BATCH_SIZE;

    constructor(uint32 blockBatchSize_) {
        BLOCK_BATCH_SIZE = blockBatchSize_;
    }

    function syncLastCheckpoint() external {
        uint256 lastBlockNumber = block.number - 1;

        uint x = (lastBlockNumber % BLOCK_BATCH_SIZE) - (BLOCK_BATCH_SIZE - 256);
        if (x < 0 || x >= 256) revert NoRecentCheckpointBlock();

        uint256 checkpointBlockNumber = lastBlockNumber - (lastBlockNumber % BLOCK_BATCH_SIZE);

        _reportHeader(checkpointBlockNumber);
    }

    function syncBlockHeader(uint256 blockNumber_) external {
        if (blockNumber_ >= block.number) revert NotRecentBlock(blockNumber_);
        if (block.number - blockNumber_ > 256) revert NotRecentBlock(blockNumber_);

        _reportHeader(blockNumber_);
    }

    function _reportHeader(uint256 blockNum_) internal {
        for (uint256 i = 0; i < _headerReporters.length(); i++) {
            IHeaderReporter(_headerReporters.at(i)).reportHeader(blockNum_);
        }

        emit HeaderReported(blockNum_);
    }
}
