// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IInterchainQueryRouter} from "@hyperlane-xyz/core/contracts/interfaces/middleware/IInterchainQueryRouter.sol";
import {IInterchainGasPaymaster} from "@hyperlane-xyz/core/contracts/interfaces/IInterchainGasPaymaster.sol";
import {OracleAdapter} from "../../../hashi/packages/evm/contracts/adapters/OracleAdapter.sol";
import {IHeaderReporter} from "../../interfaces/IHeaderReporter.sol";
import {CallLib} from "@hyperlane-xyz/core/contracts/libs/Call.sol";

contract HyperlaneQueryAdapter is OracleAdapter {
    error HeaderAlreadyStored();
    error InvalidDomain();

    uint256 private constant XCALL_GAS_UNITS = 100_000;

    IInterchainQueryRouter public immutable iqsRouter;
    IInterchainGasPaymaster public immutable igp;

    mapping(uint32 => address) public domainToHeaderReporter;

    constructor(address iqsRouter_, address igp_, uint32[] memory domains_, address[] memory headerReporters_) {
        iqsRouter = IInterchainQueryRouter(iqsRouter_);
        igp = IInterchainGasPaymaster(igp_);
        require(domains_.length == headerReporters_.length, "HQA: invalid inputs");
        for (uint256 i = 0; i < domains_.length; i++) {
            domainToHeaderReporter[domains_[i]] = headerReporters_[i];
        }
    }

    modifier onlyCallback() {
        require(msg.sender == address(iqsRouter), "HQA: invalid caller");
        _;
    }

    function requestHeader(uint32 origin_, uint256 blockNumber_) external payable returns (bytes32 messageId) {
        if (hashes[origin_][blockNumber_] != 0) revert HeaderAlreadyStored();
        if (domainToHeaderReporter[origin_] == address(0)) revert InvalidDomain();

        IHeaderReporter headerReporter = IHeaderReporter(domainToHeaderReporter[origin_]);

        messageId = IInterchainQueryRouter(iqsRouter).query(
            origin_,
            address(headerReporter),
            abi.encodeCall(headerReporter.getBlockHeader, (blockNumber_)),
            abi.encodePacked(this.storeHash.selector, origin_, blockNumber_)
        );

        igp.payForGas{value: msg.value}(messageId, origin_, XCALL_GAS_UNITS, msg.sender);
    }

    function storeHash(uint32 origin_, uint256 blockNumber_, bytes32 blockHeader_) external onlyCallback {
        _storeHash(uint256(origin_), blockNumber_, blockHeader_);
    }
}
