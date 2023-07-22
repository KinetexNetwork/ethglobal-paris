// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import {IInterchainGasPaymaster} from "@hyperlane-xyz/core/contracts/interfaces/IInterchainGasPaymaster.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";
import {HeaderReporter} from "../HeaderReporter.sol";

contract HyperlaneHeaderReporter is HeaderReporter {
    using TypeCasts for address;

    uint256 private constant XCALL_GAS_UNITS = 100_000;

    IMailbox public immutable outbox;
    IInterchainGasPaymaster public immutable igp;
    uint32 public immutable destinationDomain;
    address public immutable target;

    constructor(address _outbox, address _igp, uint32 _destinationDomain, address _target) {
        outbox = IMailbox(_outbox);
        igp = IInterchainGasPaymaster(_igp);
        destinationDomain = _destinationDomain;
        target = _target;
    }

    function reportHeader(uint256 blockNumber) external payable returns (bytes32 transferId) {
        bytes32 _blockHeader = getBlockHeader(blockNumber);
        bytes memory _callData = abi.encode(blockNumber, _blockHeader);

        transferId = outbox.dispatch(destinationDomain, target.addressToBytes32(), _callData);
        igp.payForGas{value: msg.value}(transferId, destinationDomain, XCALL_GAS_UNITS, msg.sender);

        emit HeaderReported(blockNumber, _blockHeader);
    }

    function estimateGasCosts() public view returns (uint256 value) {
        value = igp.quoteGasPayment(destinationDomain, XCALL_GAS_UNITS);
    }
}
