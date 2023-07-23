// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface ArbSys {
    function arbBlockNumber() external view returns (uint256);

    function arbBlockHash(uint256 blockNumber) external view returns (bytes32);
}
