// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {HeaderReporter} from "../HeaderReporter.sol";

contract CCIPHeaderReporter is HeaderReporter {
    IRouterClient public immutable router;
    LinkTokenInterface public immutable linkToken;
    uint64 public immutable destinationChainSelector;
    address public immutable target;

    constructor(address _router, address _linkToken, uint64 _destinationChainSelector, address _target) {
        router = IRouterClient(_router);
        linkToken = LinkTokenInterface(_linkToken);
        destinationChainSelector = _destinationChainSelector;
        target = _target;
    }

    function reportHeader(uint256 _blockNumber) external payable returns (bytes32 messageId) {
        messageId = _reportHeader(_blockNumber, address(0));
    }

    function reportHeaderPayLINK(uint256 _blockNumber) public payable returns (bytes32 messageId) {
        messageId = _reportHeader(_blockNumber, address(linkToken));
    }

    function estimateGasCosts() public view returns (uint256 value) {
        value = router.getFee(destinationChainSelector, _buildCCIPMessage(block.number, address(0)));
    }

    function estimateGasCostsLINK() public view returns (uint256 value) {
        value = router.getFee(destinationChainSelector, _buildCCIPMessage(block.number, address(linkToken)));
    }

    function _reportHeader(uint256 _blockNumber, address _feeTokenAddress) internal returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(_blockNumber, _feeTokenAddress);

        if (_feeTokenAddress != address(0)) {
            uint256 fees = router.getFee(destinationChainSelector, _message);
            linkToken.transferFrom(msg.sender, address(this), fees);
            linkToken.approve(address(router), fees);
        }

        messageId = router.ccipSend{value: msg.value}(destinationChainSelector, _message);
    }

    function _buildCCIPMessage(
        uint256 _blockNumber,
        address _feeTokenAddress
    ) internal view returns (Client.EVM2AnyMessage memory _message) {
        bytes32 _blockHeader = getBlockHeader(_blockNumber);
        bytes memory _callData = abi.encode(_blockNumber, _blockHeader);

        _message = Client.EVM2AnyMessage({
            receiver: abi.encode(target),
            data: _callData,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})),
            feeToken: _feeTokenAddress
        });
    }
}
