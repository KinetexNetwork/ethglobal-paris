// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IHeaderReporter} from "../interfaces/IHeaderReporter.sol";
import {ArbSys} from "../interfaces/ArbSys.sol";

abstract contract HeaderReporter is IHeaderReporter {
    uint256 private constant ARBITRUM_CHAINID = 42161;
    uint256 private constant ARBITRUM_GOERLI_CHAINID = 421613;

    function getBlockHeader(uint256 blockNumber) public view returns (bytes32 blockHeader) {
        uint256 chainId = getChainId();

        if (chainId == ARBITRUM_CHAINID || chainId == ARBITRUM_GOERLI_CHAINID) {
            blockHeader = ArbSys(address(100)).arbBlockHash(blockNumber);
        } else {
            blockHeader = blockhash(blockNumber);
        }

        if (blockHeader == 0) revert HeaderOutOfRange(address(this), blockNumber);
    }

    function getChainId() private view returns (uint256 chainId) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            chainId := chainid()
        }
    }
}
