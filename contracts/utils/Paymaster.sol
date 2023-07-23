// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";

// TODO: implement Paymaster logic for task resolvers

abstract contract Paymaster is IERC1271 {
    function isValidSignature(bytes32, bytes memory) external pure returns (bytes4) {
        revert("not implemented");
    }

    function deposit() public payable {
        revert("not implemented");
    }
}
