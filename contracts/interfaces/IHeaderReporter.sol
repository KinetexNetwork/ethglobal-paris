// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IHeaderReporter {
    event HeaderReported(uint256 indexed blockNumber, bytes32 indexed blockHeader);

    error HeaderOutOfRange(address emitter, uint256 blockNumber);

    function getBlockHeader(uint256 blockNumber) external view returns (bytes32);

    function reportHeader(uint256 blockNumber) external payable returns (bytes32 transferId);
}
