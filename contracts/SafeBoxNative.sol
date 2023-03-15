// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./SafeBoxBase.sol";

contract SafeBoxNative is SafeBoxBase {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct Deposit {
        address depositor;
        address beneficiary;
        uint256 amount;
        bytes32 secretHash;
        uint256 deadline;
        string invoice;
        bool withdrawn;
    }

    mapping(bytes32 => Deposit) private deposits;

    function deposit(address beneficiary, bytes32 secretHash, uint256 deadline, string memory invoice) external payable {
        uint256 amount = msg.value;
        require(amount > 0, "Invalid deposit value");

        require(deposits[secretHash].depositor == address(0), "Deposit already exists");

        deposits[secretHash] = Deposit({
            depositor: msg.sender,
            beneficiary: beneficiary,
            amount: amount,
            secretHash: secretHash,
            deadline: deadline,
            invoice: invoice,
            withdrawn: false
        });

        depositors[msg.sender].add(secretHash);
        withdrawers[beneficiary].add(secretHash);

        emit DepositCreated(secretHash, msg.sender, beneficiary, address(0), amount, deadline, invoice);
    }

    function withdraw(bytes memory secret) external {
        bytes32 secretHash = sha256Hash(secret);
        Deposit memory depositItem = deposits[secretHash];

        require(depositItem.beneficiary == msg.sender, "Invalid beneficiary");
        require(depositItem.deadline >= block.timestamp, "Deposit has expired");
        require(!depositItem.withdrawn, "Deposit has already been withdrawn");

        deposits[secretHash].withdrawn = true;
        withdrawers[msg.sender].remove(secretHash);
        depositors[depositItem.depositor].remove(secretHash);
        payable(depositItem.beneficiary).transfer(depositItem.amount);

        emit Withdrawn(secretHash, msg.sender, address(0), depositItem.amount);
    }

    function delegateWithdraw(bytes memory secret, address account) external {
        bytes32 secretHash = sha256Hash(secret);
        Deposit memory depositItem = deposits[secretHash];

        require(depositItem.beneficiary == account, "Invalid beneficiary");
        require(depositItem.deadline >= block.timestamp, "Deposit has expired");
        require(!depositItem.withdrawn, "Deposit has already been withdrawn");

        deposits[secretHash].withdrawn = true;
        withdrawers[account].remove(secretHash);
        depositors[depositItem.depositor].remove(secretHash);
        payable(depositItem.beneficiary).transfer(depositItem.amount);

        emit Withdrawn(secretHash, account, address(0), depositItem.amount);
    }

    function refund(bytes32 secretHash) external {
        Deposit memory depositItem = deposits[secretHash];

        require(depositItem.depositor == msg.sender && depositItem.deadline < block.timestamp, "Invalid refund requester");
        require(!depositItem.withdrawn, "Deposit has already been withdrawn");

        deposits[secretHash].withdrawn = true;
        withdrawers[depositItem.beneficiary].remove(secretHash);
        depositors[msg.sender].remove(secretHash);
        payable(depositItem.depositor).transfer(depositItem.amount);

        emit Refunded(secretHash, msg.sender, address(0), depositItem.amount);
    }


    function delegateRefund(bytes32 secretHash, address depositor) external {
        Deposit memory depositItem = deposits[secretHash];

        require(depositItem.depositor == depositor && depositItem.deadline < block.timestamp, "Invalid refund requester");
        require(!depositItem.withdrawn, "Deposit has already been withdrawn");

        deposits[secretHash].withdrawn = true;
        withdrawers[depositItem.beneficiary].remove(secretHash);
        depositors[depositor].remove(secretHash);
        payable(depositItem.depositor).transfer(depositItem.amount);

        emit Refunded(secretHash, depositor, address(0), depositItem.amount);
    }

    function getDeposit(bytes32 secretHash) external view returns (address depositor, address beneficiary, uint256 amount, uint256 deadline, bool withdrawn) {
        Deposit memory depositItem = deposits[secretHash];

        require(depositItem.depositor != address(0), "Deposit does not exist");

        return (depositItem.depositor, depositItem.beneficiary, depositItem.amount, depositItem.deadline, depositItem.withdrawn);
    }

}
