// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import {IMessageRecipient} from "@hyperlane-xyz/core/contracts/interfaces/IMessageRecipient.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";
import {OracleAdapter} from "../../../hashi/packages/evm/contracts/adapters/OracleAdapter.sol";

struct HyperlaneAdapterDomainParams {
    uint32 domain;
    address mailbox;
    address headerReporter;
}

contract HyperlaneAdapter is OracleAdapter, IMessageRecipient {
    using TypeCasts for bytes32;

    mapping(uint32 => address) public domainToHeaderReporter;
    mapping(uint32 => address) public domainToMailbox;

    constructor(HyperlaneAdapterDomainParams[] memory domainsParams_) {
        for (uint256 i = 0; i < domainsParams_.length; i++) {
            domainToMailbox[domainsParams_[i].domain] = domainsParams_[i].mailbox;
            domainToHeaderReporter[domainsParams_[i].domain] = domainsParams_[i].headerReporter;
        }
    }

    function handle(uint32 _origin, bytes32 _sender, bytes calldata _message) external {
        require(msg.sender == domainToMailbox[_origin], "HA: invalid mailbox");
        require(domainToHeaderReporter[_origin] != address(0), "HA: invalid domain");
        require(_sender.bytes32ToAddress() == domainToHeaderReporter[_origin], "HA: invalid sender");

        (uint256 blockNumber, bytes32 newBlockHeader) = abi.decode(_message, (uint256, bytes32));
        _storeHash(uint256(_origin), blockNumber, newBlockHeader);
    }
}
