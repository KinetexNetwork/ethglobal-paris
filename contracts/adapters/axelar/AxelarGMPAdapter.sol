// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import {StringToAddress} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/utils/AddressString.sol";
import {OracleAdapter} from "../../../hashi/packages/evm/contracts/adapters/OracleAdapter.sol";

struct AxelarGMPAdapterDomainParams {
    uint256 domain;
    string domainName;
    address headerReporter;
}

contract AxelarGMPAdapter is OracleAdapter, AxelarExecutable {
    using StringToAddress for string;

    mapping(string => uint256) public domainNameToDomainId;
    mapping(uint256 => address) public domainToHeaderReporter;

    constructor(address gateway, AxelarGMPAdapterDomainParams[] memory _domainsParams) AxelarExecutable(gateway) {
        for (uint256 i = 0; i < _domainsParams.length; i++) {
            domainNameToDomainId[_domainsParams[i].domainName] = _domainsParams[i].domain;
            domainToHeaderReporter[_domainsParams[i].domain] = _domainsParams[i].headerReporter;
        }
    }

    function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        uint256 domain = domainNameToDomainId[sourceChain];

        require(domain != 0, "AA: invalid domain");
        require(sourceAddress.toAddress() != address(0), "AA: sender could not be zero");
        require(sourceAddress.toAddress() != domainToHeaderReporter[domain], "AA: invalid sender");

        (uint256 blockNumber, bytes32 newBlockHeader) = abi.decode(payload, (uint256, bytes32));
        _storeHash(domain, blockNumber, newBlockHeader);
    }
}
