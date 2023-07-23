// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {TaskResolverWhitelist} from "./TaskResolverWhitelist.sol";
import {IResolver} from "./interfaces/IResolver.sol";
import {AddressLib, Address} from "./lib/AddressLib.sol";
import {Decoder} from "./lib/Decoder.sol";

abstract contract TaskAuction is IResolver, TaskResolverWhitelist {
    error OnlySettlement();

    using Decoder for bytes;
    using SafeERC20 for IERC20;
    using AddressLib for Address;

    address private immutable _settlement;

    constructor(address settlement) TaskResolverWhitelist() {
        _settlement = settlement;
    }

    function resolveOrders(
        address resolver,
        bytes calldata tokensAndAmounts,
        bytes calldata data
    ) external onlyTaskResolver {
        if (msg.sender != _settlement) revert OnlySettlement();

        _resolveTask(data);

        Decoder.TokensAndAmountsData[] calldata items = tokensAndAmounts.decodeTokensAndAmounts();
        for (uint256 i = 0; i < items.length; i++) {
            IERC20(items[i].token.get()).transferFrom(resolver, msg.sender, items[i].amount);
        }
    }

    function _resolveTask(bytes calldata data) internal virtual;

    function withdrawToken(IERC20 token) external {
        require(msg.sender == owner(), "caller is not owner");
        token.safeTransfer(msg.sender, token.balanceOf(address(this)));
    }

    function withdrawETH(address payable to_) external payable {
        require(msg.sender == owner(), "caller is not owner");
        to_.transfer(address(this).balance);
    }
}
