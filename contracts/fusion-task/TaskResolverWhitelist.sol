// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract TaskResolverWhitelist is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    event ResolverAdded(address resolver);
    event ResolverRemoved(address resolver);

    EnumerableSet.AddressSet internal _resolvers;

    modifier onlyTaskResolver() {
        require(_resolvers.contains(msg.sender), "TA: not whitelisted resolver");
        _;
    }

    function getWhitelistedResolvers() external view returns (address[] memory) {
        return _resolvers.values();
    }

    function isResolverWhitelisted(address resolver_) external view returns (bool) {
        return _resolvers.contains(resolver_);
    }

    function addResolverToWhitelist(address resolver_) external onlyOwner {
        require(_resolvers.add(resolver_), "TA: resolver already included");
        emit ResolverAdded(resolver_);
    }

    function removeResolverFromWhitelist(address resolver_) external onlyOwner {
        require(_resolvers.remove(resolver_), "TA: resolver already excluded");
        emit ResolverRemoved(resolver_);
    }
}
