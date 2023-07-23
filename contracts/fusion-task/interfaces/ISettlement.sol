// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface ISettlement {
    function settleOrders(bytes calldata order) external;
}
