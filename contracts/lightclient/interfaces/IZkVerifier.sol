// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IZkVerifier {
    function verify(bytes calldata zkProof) external;
}
