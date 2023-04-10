// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./LightningSwapBase.sol";

contract LightningSwap is LightningSwapBase {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using SafeERC20 for IERC20;

    function deposit(address token, uint256 amount, address beneficiary, bytes32 secretHash, uint256 deadline, string memory invoice) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        depositInternal(token, amount, beneficiary, secretHash, deadline, invoice);
    }

    function transferOut(address token, address account, uint256 amount) internal override {
        IERC20(token).safeTransfer(account, amount);
    }
}
