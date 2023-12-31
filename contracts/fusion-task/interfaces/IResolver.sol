// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IResolver {
    function resolveOrders(address resolver, bytes calldata tokensAndAmounts, bytes calldata data) external;
}
