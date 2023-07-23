// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library UintArray {
    function sum(uint[] memory x) internal pure returns (uint s) {
        for (uint i; i < x.length; i++) {
            s += x[i];
        }
    }
}
