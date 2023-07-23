// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract BHRWhitelist is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    event HeaderReporterAdded(address headerReporter);
    event HeaderReporterRemoved(address headerReporter);

    EnumerableSet.AddressSet internal _headerReporters;

    function getWhitelistedHeaderReporters() external view returns (address[] memory) {
        return _headerReporters.values();
    }

    function isHeaderReporterWhitelisted(address headerReporter_) external view returns (bool) {
        return _headerReporters.contains(headerReporter_);
    }

    function addHeaderReporterToWhitelist(address headerReporter_) external onlyOwner {
        require(_headerReporters.add(headerReporter_), "BHRW: reporter already included");
        emit HeaderReporterAdded(headerReporter_);
    }

    function removeHeaderReporterFromWhitelist(address headerReporter_) external onlyOwner {
        require(_headerReporters.remove(headerReporter_), "BHRW: reporter already excluded");
        emit HeaderReporterRemoved(headerReporter_);
    }
}
