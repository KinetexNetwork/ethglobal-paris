// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {OracleAdapter} from "../../../hashi/packages/evm/contracts/adapters/OracleAdapter.sol";

struct CCIPAdapterDomainParams {
    uint256 domain;
    uint64 chainSelector;
    address headerReporter;
}

contract CCIPAdapter is OracleAdapter, CCIPReceiver {
    mapping(uint64 => uint256) public chainSelectorToDomain;
    mapping(uint256 => address) public domainToHeaderReporter;

    constructor(address _router, CCIPAdapterDomainParams[] memory _domainsParams) CCIPReceiver(_router) {
        for (uint256 i = 0; i < _domainsParams.length; i++) {
            chainSelectorToDomain[_domainsParams[i].chainSelector] = _domainsParams[i].domain;
            domainToHeaderReporter[_domainsParams[i].domain] = _domainsParams[i].headerReporter;
        }
    }

    function _ccipReceive(Client.Any2EVMMessage memory _message) internal override {
        uint256 domain = chainSelectorToDomain[_message.sourceChainSelector];
        require(domain != 0, "CA: invalid domain");

        address sender = abi.decode(_message.sender, (address));
        require(sender != address(0), "CA: sender could not be zero");
        require(sender == domainToHeaderReporter[domain], "CA: invalid sender");

        (uint256 blockNumber, bytes32 newBlockHeader) = abi.decode(_message.data, (uint256, bytes32));
        _storeHash(domain, blockNumber, newBlockHeader);
    }
}
