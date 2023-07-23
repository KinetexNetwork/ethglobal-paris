// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {UintArray} from "./lib/UintArray.sol";
import {IBHRManager} from "./interfaces/IBHRManager.sol";
import {IHeaderReporter} from "./interfaces/IHeaderReporter.sol";
import {BHRWhitelist} from "./BHRWhitelist.sol";
import {GasSwapper} from "./utils/GasSwapper.sol";
import {Paymaster} from "./utils/Paymaster.sol";
import {TaskAuction} from "./fusion-task/TaskAuction.sol";
import {TaskValidator} from "./fusion-task/TaskValidator.sol";

contract BHRManager is IBHRManager, BHRWhitelist, GasSwapper, Paymaster, TaskAuction, TaskValidator {
    using EnumerableSet for EnumerableSet.AddressSet;
    using UintArray for uint256[];

    uint32 public immutable BLOCK_BATCH_SIZE;
    uint256 public lastCheckpoint;
    uint256 public lastBlockHeader;

    constructor(uint32 blockBatchSize_, address settlement_) TaskAuction(settlement_) {
        BLOCK_BATCH_SIZE = blockBatchSize_;
    }

    function _syncLastCheckpoint(uint256[] memory gasCosts_) internal onlyTaskResolver {
        require(gasCosts_.length == _headerReporters.length(), "BHRM: invalid gas cost values");
        require(address(this).balance >= gasCosts_.sum(), "BHRM: insufficient gas");

        uint256 checkpoint = _currentCheckpoint();
        _reportHeader(checkpoint, gasCosts_);
        lastCheckpoint = checkpoint;
    }

    function _reportHeader(uint256 blockNum_, uint256[] memory gasCosts_) internal {
        for (uint256 i = 0; i < _headerReporters.length(); i++) {
            IHeaderReporter(_headerReporters.at(i)).reportHeader{value: gasCosts_[i]}(blockNum_);
        }

        lastBlockHeader = blockNum_;
        emit HeaderReported(blockNum_);
    }

    function _resolveTask(bytes calldata data) internal override {
        (uint256 blockNumber, uint256[] memory gasCosts, GasSwapParams memory gasSwapParams) = abi.decode(
            data,
            (uint256, uint256[], GasSwapParams)
        );

        _swapTokenForGas(gasSwapParams);

        if (blockNumber > 0) {
            _reportHeader(blockNumber, gasCosts);
        } else {
            _syncLastCheckpoint(gasCosts);
        }
    }

    function _preValidate(address maker_, bytes memory blockNumData_) internal view override {
        require(maker_ == address(this), "BHRM: invalid maker");

        uint256 blockNumber = abi.decode(blockNumData_, (uint256));

        if (blockNumber > 0) {
            // custom block
            if (blockNumber >= block.number) revert NotRecentBlock(blockNumber);
            if (block.number - blockNumber > 256) revert NotRecentBlock(blockNumber);
            if (lastBlockHeader >= blockNumber) revert BlockAlreadyReported(blockNumber);
        } else {
            // checkpoint
            uint256 lastBlockNumber = block.number - 1;

            uint x = (lastBlockNumber % BLOCK_BATCH_SIZE) - (BLOCK_BATCH_SIZE - 256);
            if (x < 0 || x >= 256) revert NoRecentCheckpointBlock();

            uint256 currentCheckpoint = _currentCheckpoint();

            if (lastCheckpoint >= currentCheckpoint) revert BlockAlreadyReported(currentCheckpoint);
        }
    }

    function _postValidate(bytes memory blockNumData_) internal view override {
        uint256 blockNumber = abi.decode(blockNumData_, (uint256));

        if (blockNumber > 0) {
            // custom block
            require(blockNumber == lastBlockHeader, "BHRM: block header update failed");
        } else {
            // checkpoint
            require(_currentCheckpoint() == lastCheckpoint, "BHRM: checkpoint update failed");
        }
    }

    function _currentCheckpoint() internal view returns (uint256 checkpointBlockNumber) {
        uint256 lastBlockNumber = block.number - 1;
        checkpointBlockNumber = lastBlockNumber - (lastBlockNumber % BLOCK_BATCH_SIZE);
    }
}
