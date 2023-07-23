// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Address} from "./AddressLib.sol";

library Decoder {
    struct TokensAndAmountsData {
        Address token;
        uint256 amount;
    }

    function decodeTokensAndAmounts(bytes calldata cd) internal pure returns (TokensAndAmountsData[] calldata decoded) {
        assembly {
            decoded.offset := cd.offset
            decoded.length := div(cd.length, 0x40)
        }
    }
}
