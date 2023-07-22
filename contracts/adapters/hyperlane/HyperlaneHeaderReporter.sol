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

    constructor(address outbox_, address igp_, uint32 destinationDomain_, address target_) {
        outbox = IMailbox(outbox_);
        igp = IInterchainGasPaymaster(igp_);
        destinationDomain = destinationDomain_;
        target = target_;
    }

    function reportHeader(uint256 blockNumber_) external payable returns (bytes32 transferId) {
        bytes32 blockHeader = getBlockHeader(blockNumber_);
        bytes memory callData = abi.encode(blockNumber_, blockHeader);

        transferId = outbox.dispatch(destinationDomain, target.addressToBytes32(), callData);
        igp.payForGas{value: msg.value}(transferId, destinationDomain, XCALL_GAS_UNITS, msg.sender);

        emit HeaderReported(blockNumber_, blockHeader);
    }

    function estimateGasCosts() public view returns (uint256 value) {
        value = igp.quoteGasPayment(destinationDomain, XCALL_GAS_UNITS);
    }
}
