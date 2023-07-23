// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ZetaReceiver, ZetaConnector, ZetaInterfaces} from "./ZetaInterfaces.sol";
import {OracleAdapter} from "../../../hashi/packages/evm/contracts/adapters/OracleAdapter.sol";

struct ZetaAdapterDomainParams {
    uint256 domain;
    address headerReporter;
}

contract ZetaAdapter is OracleAdapter, ZetaReceiver {
    ZetaConnector public immutable connector;
    mapping(uint256 => address) public domainToHeaderReporter;

    event ZetaMessageReverted(address sender, uint256 domain, bytes message);

    constructor(address _connector, ZetaAdapterDomainParams[] memory _domainsParams) {
        connector = ZetaConnector(_connector);
        for (uint256 i = 0; i < _domainsParams.length; i++) {
            domainToHeaderReporter[_domainsParams[i].domain] = _domainsParams[i].headerReporter;
        }
    }

    modifier onlyConnector() {
        require(msg.sender == address(connector), "HA: invalid caller");
        _;
    }

    modifier validateDomain(uint256 _origin) {
        require(domainToHeaderReporter[_origin] != address(0), "HA: invalid domain");
        _;
    }

    modifier onlyHeaderReporter(uint256 _origin, address _sender) {
        require(_sender == domainToHeaderReporter[_origin], "HA: invalid sender");
        _;
    }

    function onZetaMessage(
        ZetaInterfaces.ZetaMessage calldata zetaMessage
    )
        external
        override
        onlyConnector
        validateDomain(zetaMessage.sourceChainId)
        onlyHeaderReporter(zetaMessage.sourceChainId, abi.decode(zetaMessage.zetaTxSenderAddress, (address)))
    {
        (uint256 blockNumber, bytes32 newBlockHeader) = abi.decode(zetaMessage.message, (uint256, bytes32));
        _storeHash(zetaMessage.sourceChainId, blockNumber, newBlockHeader);
    }

    function onZetaRevert(
        ZetaInterfaces.ZetaRevert calldata zetaRevert
    )
        external
        override
        onlyConnector
        validateDomain(zetaRevert.sourceChainId)
        onlyHeaderReporter(zetaRevert.sourceChainId, zetaRevert.zetaTxSenderAddress)
    {
        emit ZetaMessageReverted(zetaRevert.zetaTxSenderAddress, zetaRevert.sourceChainId, zetaRevert.message);
    }
}
