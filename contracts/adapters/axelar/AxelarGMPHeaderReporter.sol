// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {AddressToString} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/utils/AddressString.sol";
import {HeaderReporter} from "../HeaderReporter.sol";

contract AxelarGMPHeaderReporter is HeaderReporter {
    using AddressToString for address;

    IAxelarGateway public immutable gateway;
    IAxelarGasService public immutable gasService;
    string public destinationDomain;
    address public target;

    constructor(address gateway_, address gasReceiver_, string memory _destinationDomain, address _target) {
        gateway = IAxelarGateway(gateway_);
        gasService = IAxelarGasService(gasReceiver_);
        destinationDomain = _destinationDomain;
        target = _target;
    }

    function reportHeader(uint256 blockNumber) external payable returns (bytes32) {
        bytes32 _blockHeader = getBlockHeader(blockNumber);
        bytes memory _callData = abi.encode(blockNumber, _blockHeader);

        gasService.payNativeGasForContractCall{value: msg.value}(
            address(this),
            destinationDomain,
            target.toString(),
            _callData,
            msg.sender
        );

        gateway.callContract(destinationDomain, target.toString(), _callData);

        emit HeaderReported(blockNumber, _blockHeader);
    }
}
