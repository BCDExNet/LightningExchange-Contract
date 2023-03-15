// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC20 is ERC20, Ownable {
    constructor() ERC20("mock token", "MKT") {
    }

    function mint(address account, uint256 amount) external onlyOwner {
        super._mint(account, amount);
    }
}
