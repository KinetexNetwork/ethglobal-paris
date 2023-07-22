// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IProofVerifier {
    function verifyHashEventProof(bytes32 sig, bytes32 hash, uint256 chain, bytes calldata proof) external view;
}
