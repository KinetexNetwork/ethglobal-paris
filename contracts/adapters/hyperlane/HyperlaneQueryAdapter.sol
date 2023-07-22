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

    constructor(address _iqsRouter, address _igp, uint32[] memory _domains, address[] memory _headerReporters) {
        iqsRouter = IInterchainQueryRouter(_iqsRouter);
        igp = IInterchainGasPaymaster(_igp);
        require(_domains.length == _headerReporters.length, "HQA: invalid inputs");
        for (uint256 i = 0; i < _domains.length; i++) {
            domainToHeaderReporter[_domains[i]] = _headerReporters[i];
        }
    }

    modifier onlyCallback() {
        require(msg.sender == address(iqsRouter), "HQA: invalid caller");
        _;
    }

    function requestHeader(uint32 _origin, uint256 _blockNumber) external payable returns (bytes32 messageId) {
        if (hashes[_origin][_blockNumber] != 0) revert HeaderAlreadyStored();
        if (domainToHeaderReporter[_origin] == address(0)) revert InvalidDomain();

        IHeaderReporter _headerReporter = IHeaderReporter(domainToHeaderReporter[_origin]);

        messageId = IInterchainQueryRouter(iqsRouter).query(
            _origin,
            address(_headerReporter),
            abi.encodeCall(_headerReporter.getBlockHeader, (_blockNumber)),
            abi.encodePacked(this.storeHash.selector, _origin, _blockNumber)
        );

        igp.payForGas{value: msg.value}(messageId, _origin, XCALL_GAS_UNITS, msg.sender);
    }

    function storeHash(uint32 _origin, uint256 _blockNumber, bytes32 _blockHeader) external onlyCallback {
        _storeHash(uint256(_origin), _blockNumber, _blockHeader);
    }
}
