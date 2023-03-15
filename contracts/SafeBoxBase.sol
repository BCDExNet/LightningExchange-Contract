// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract SafeBoxBase {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    mapping(address => EnumerableSet.Bytes32Set) internal depositors;
    mapping(address => EnumerableSet.Bytes32Set) internal withdrawers;

    event DepositCreated(bytes32 indexed secretHash, address indexed depositor, address indexed beneficiary, address token, uint256 amount, uint256 deadline, string invoice);
    event Withdrawn(bytes32 indexed secretHash, address indexed withdrawer, address token, uint256 amount);
    event Refunded(bytes32 indexed secretHash, address indexed refundee, address token, uint256 amount);


    function sha256Hash(bytes memory secret) public pure returns (bytes32) {
        bytes32 secretHash = sha256(abi.encodePacked(secret));
        return secretHash;
    }

    function getDepositorHashLength(address depositor) external view returns (uint256) {
        return depositors[depositor].length();
    }

    function getDepositorHashs(address depositor) external view returns (bytes32[] memory) {
        return depositors[depositor].values();
    }

    function getDepositorHashByIndex(address depositor, uint256 index) external view returns (bytes32) {
        return depositors[depositor].at(index);
    }

    function getWithdrawerHashLength(address withdrawer) external view returns (uint256) {
        return withdrawers[withdrawer].length();
    }

    function getWithdrawerHashs(address withdrawer) external view returns (bytes32[] memory) {
        return withdrawers[withdrawer].values();
    }

    function getWithdrawerHashByIndex(address withdrawer, uint256 index) external view returns (bytes32) {
        return withdrawers[withdrawer].at(index);
    }
}
