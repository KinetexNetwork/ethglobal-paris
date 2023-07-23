// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ZetaConnector, ZetaTokenConsumer, ZetaInterfaces} from "./ZetaInterfaces.sol";
import {HeaderReporter} from "../HeaderReporter.sol";

contract ZetaHeaderReporter is HeaderReporter {
    ZetaConnector public immutable connector;
    ZetaTokenConsumer public immutable zetaConsumer;
    IERC20 public immutable zetaToken;
    uint256 public immutable destinationDomain;
    address public immutable target;

    constructor(
        address _connector,
        address _zetaConsumer,
        address _zetaToken,
        uint256 _destinationDomain,
        address _target
    ) {
        connector = ZetaConnector(_connector);
        zetaConsumer = ZetaTokenConsumer(_zetaConsumer);
        zetaToken = IERC20(_zetaToken);
        destinationDomain = _destinationDomain;
        target = _target;
    }

    function reportHeader(uint256 blockNumber) external payable returns (bytes32) {
        bytes32 _blockHeader = getBlockHeader(blockNumber);
        bytes memory _callData = abi.encode(blockNumber, _blockHeader);

        uint256 crossChainGas = 2 * (10 ** 18);
        uint256 zetaValueAndGas = zetaConsumer.getZetaFromEth{value: msg.value}(address(this), crossChainGas);
        zetaToken.approve(address(connector), zetaValueAndGas);

        // solhint-disable-next-line no-check-send-result
        connector.send(
            ZetaInterfaces.SendInput({
                destinationChainId: destinationDomain,
                destinationAddress: abi.encode(target),
                destinationGasLimit: 300000,
                message: _callData,
                zetaValueAndGas: zetaValueAndGas,
                zetaParams: abi.encode("")
            })
        );
    }
}
