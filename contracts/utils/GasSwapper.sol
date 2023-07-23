// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract GasSwapper {
    using SafeERC20 for IERC20;

    struct GasSwapParams {
        address gasToken;
        uint256 gasTokenAmount;
        address gasSwapper;
        bytes gasSwapCalldata;
    }

    error GasSwapFailed(bytes reason);

    function _swapTokenForGas(GasSwapParams memory gasSwapParams_) internal {
        IERC20(gasSwapParams_.gasToken).forceApprove(gasSwapParams_.gasSwapper, gasSwapParams_.gasTokenAmount);
        (bool result, bytes memory reason) = gasSwapParams_.gasSwapper.call(gasSwapParams_.gasSwapCalldata);
        if (!result) revert GasSwapFailed(reason);
    }
}
