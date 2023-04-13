// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./LightningSwapBase.sol";

contract LightningSwapNative is LightningSwapBase {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function deposit(address beneficiary, bytes32 secretHash, uint256 deadline, string memory invoice) external payable {
        uint256 amount = msg.value;
        require(amount > 0, "Invalid deposit value");

        depositInternal(address(0), amount, beneficiary, secretHash, deadline, invoice);
    }

    function transferOut(address token, address account, uint256 amount) internal override {
        token;
        payable(account).transfer(amount);
    }
}
