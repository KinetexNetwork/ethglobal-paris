// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

library BitLength {
    function bitLength(uint32 x) internal pure returns (uint8) {
        require(x > 0, "Input must be greater than zero");
        uint8 length = 0;
        while (x > 0) {
            x >>= 1;
            length++;
        }
        return length;
    }
}
