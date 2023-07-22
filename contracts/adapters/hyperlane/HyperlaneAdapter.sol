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

    constructor(HyperlaneAdapterDomainParams[] memory _domainsParams) {
        for (uint256 i = 0; i < _domainsParams.length; i++) {
            domainToMailbox[_domainsParams[i].domain] = _domainsParams[i].mailbox;
            domainToHeaderReporter[_domainsParams[i].domain] = _domainsParams[i].headerReporter;
        }
    }

    modifier onlyMailbox(uint32 _origin) {
        require(msg.sender == domainToMailbox[_origin], "HA: invalid mailbox");
        _;
    }

    modifier validateDomain(uint32 _origin) {
        require(domainToHeaderReporter[_origin] != address(0), "HA: invalid domain");
        _;
    }

    modifier onlyHeaderReporter(uint32 _origin, bytes32 _sender) {
        require(_sender.bytes32ToAddress() == domainToHeaderReporter[_origin], "HA: invalid sender");
        _;
    }

    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external validateDomain(_origin) onlyMailbox(_origin) onlyHeaderReporter(_origin, _sender) {
        (uint256 blockNumber, bytes32 newBlockHeader) = abi.decode(_message, (uint256, bytes32));
        _storeHash(uint256(_origin), blockNumber, newBlockHeader);
    }
}
