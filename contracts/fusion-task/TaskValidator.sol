// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {PreInteractionNotificationReceiver, PostInteractionNotificationReceiver} from "./interfaces/NotificationReceiver.sol";

abstract contract TaskValidator is PreInteractionNotificationReceiver, PostInteractionNotificationReceiver {
    function fillOrderPreInteraction(
        bytes32,
        address maker,
        address,
        uint256,
        uint256,
        uint256,
        bytes memory data_
    ) external {
        _preValidate(maker, data_);
    }

    function fillOrderPostInteraction(
        bytes32,
        address,
        address,
        uint256,
        uint256,
        uint256,
        bytes memory data_
    ) external {
        _postValidate(data_);
    }

    function _preValidate(address maker, bytes memory data_) internal virtual;

    function _postValidate(bytes memory data_) internal virtual;
}
