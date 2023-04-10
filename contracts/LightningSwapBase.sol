// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PriceOracle.sol";

// Custom interface extending IERC20 with the decimals function
interface IERC20WithDecimals is IERC20 {
    function decimals() external view returns (uint8);
}

abstract contract LightningSwapBase is Ownable {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    string public constant VERSION = "0.1.0";

    struct Deposit {
        address depositor;
        address beneficiary;
        address token;
        uint256 amount;
        bytes32 secretHash;
        uint256 deadline;
        string invoice;
        bool withdrawn;
        uint256 btcPrice;
        uint256 tokenPrice;
    }

    mapping(bytes32 => Deposit) private deposits;

    mapping(address => EnumerableSet.Bytes32Set) internal depositors;
    mapping(address => EnumerableSet.Bytes32Set) internal withdrawers;

    address public oracle;

    event DepositCreated(bytes32 indexed secretHash, address indexed depositor, address indexed beneficiary, address token, uint256 amount, uint256 deadline, string invoice);
    event Withdrawn(bytes32 indexed secretHash, address indexed withdrawer, address token, uint256 amount);
    event Refunded(bytes32 indexed secretHash, address indexed refundee, address token, uint256 amount);
    event OracleSet(address indexed oracle);

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

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        emit OracleSet(_oracle);
    }

    function parseInvoice(string memory invoice) public pure returns (string memory network, uint256 amount) {
        bytes memory invoiceBytes = bytes(invoice);
        require(invoiceBytes.length > 4, "Invalid invoice length");

        require(invoiceBytes[0] == 'l' && invoiceBytes[1] == 'n', "Invalid invoice prefix");
        if (invoiceBytes[2] == 'b' && invoiceBytes[3] == 'c') {
            network = "bc";
        } else if (invoiceBytes[2] == 'b' && invoiceBytes[3] == 's') {
            network = "bs";
        } else {
            revert("Invalid network in invoice");
        }

        uint256 index = 4;
        uint256 multiplier = 0;

        while (index < invoiceBytes.length) {
            uint8 charValue = uint8(invoiceBytes[index]);

            if (charValue >= 48 && charValue <= 57) {
                amount *= 10;
                amount += uint256(charValue - 48);
            } else if (charValue == 109 || charValue == 117 || charValue == 110 || charValue == 112) {
                if (charValue == 109) {
                    multiplier = 9;
                } else if (charValue == 117) {
                    multiplier = 6;
                } else if (charValue == 110) {
                    multiplier = 3;
                } else if (charValue == 112) {
                    multiplier = 0;
                }
                break;
            } else {
                revert("Invalid character in amount");
            }

            index++;
        }

        amount *= (10 ** multiplier);
    }

    function calculateBTCtoTokenPrice(
        address tokenAddress,
        uint256 tokenAmount,
        string memory invoice
    ) public view returns (uint256) {
        IERC20WithDecimals token = IERC20WithDecimals(tokenAddress);
        uint256 tokenDecimals = token.decimals();
        (, uint256 amount) = parseInvoice(invoice);

        // Convert token amount and BTC amount to the same precision (18 decimals)
        uint256 adjustedTokenAmount = tokenAmount * (10 ** (18 - tokenDecimals));
        uint256 adjustedBtcAmount = amount * (10 ** 6);

        // Calculate BTC price relative to the token with 8 decimal precision
        uint256 btcPrice = (adjustedTokenAmount * 10 ** 8) / adjustedBtcAmount;

        return btcPrice;
    }

    function calculateBTCtoNativeCoinPrice(
        uint8 coinDecimals,
        uint256 coinAmount,
        string memory invoice
    ) public pure returns (uint256) {
        (, uint256 amount) = parseInvoice(invoice);

        // Convert coin amount and BTC amount to the same precision (18 decimals)
        uint256 adjustedCoinAmount = coinAmount * (10 ** (18 - coinDecimals));
        uint256 adjustedBtcAmount = amount * (10 ** 6);

        // Calculate BTC price relative to the token with 8 decimal precision
        uint256 btcPrice = (adjustedCoinAmount * 10 ** 8) / adjustedBtcAmount;

        return btcPrice;
    }

    function depositInternal(address token, uint256 amount, address beneficiary, bytes32 secretHash, uint256 deadline, string memory invoice) internal {
        require(deposits[secretHash].depositor == address(0), "Deposit already exists");

        uint256 btcPrice = 0;
        uint256 tokenPrice = 0;
        if (oracle != address(0)) {
            btcPrice = PriceOracle(oracle).getBTCPrice();
            tokenPrice = PriceOracle(oracle).getTokenPrice(token);
        }

        deposits[secretHash] = Deposit({
            depositor: msg.sender,
            beneficiary: beneficiary,
            token: token,
            amount: amount,
            secretHash: secretHash,
            deadline: deadline,
            invoice: invoice,
            withdrawn: false,
            btcPrice: btcPrice,
            tokenPrice: tokenPrice
        });

        depositors[msg.sender].add(secretHash);
        withdrawers[beneficiary].add(secretHash);

        emit DepositCreated(secretHash, msg.sender, beneficiary, token, amount, deadline, invoice);
    }

    function transferOut(address token, address account, uint256 amount) internal virtual;

    function withrawInternal(bytes memory secret, address account) internal {
        bytes32 secretHash = sha256(abi.encodePacked(secret));
        Deposit memory depositItem = deposits[secretHash];

        require(depositItem.beneficiary == account, "Invalid beneficiary");
        require(depositItem.deadline >= block.timestamp, "Deposit has expired");
        require(!depositItem.withdrawn, "Deposit has already been withdrawn");

        deposits[secretHash].withdrawn = true;
        withdrawers[account].remove(secretHash);
        depositors[depositItem.depositor].remove(secretHash);

        transferOut(depositItem.token, depositItem.beneficiary, depositItem.amount);

        emit Withdrawn(secretHash, account, depositItem.token, depositItem.amount);
    }

    function withdraw(bytes memory secret) external {
        withrawInternal(secret, msg.sender);
    }

    function delegateWithdraw(bytes memory secret, address account) external {
        withrawInternal(secret, account);
    }

    function refundInternal(bytes32 secretHash, address depositor) internal {
        Deposit memory depositItem = deposits[secretHash];

        require(depositItem.depositor == depositor && depositItem.deadline < block.timestamp, "Invalid refund requester");
        require(!depositItem.withdrawn, "Deposit has already been withdrawn");

        deposits[secretHash].withdrawn = true;
        withdrawers[depositItem.beneficiary].remove(secretHash);
        depositors[msg.sender].remove(secretHash);
        transferOut(depositItem.token, depositItem.depositor, depositItem.amount);

        emit Refunded(secretHash, depositor, depositItem.token, depositItem.amount);
    }

    function refund(bytes32 secretHash) external {
        refundInternal(secretHash, msg.sender);
    }

    function delegateRefund(bytes32 secretHash, address depositor) external {
        refundInternal(secretHash, depositor);
    }

    function getDeposit(bytes32 secretHash) external view returns (address depositor, address beneficiary, address token, uint256 amount, uint256 deadline, bool withdrawn, string memory invoice, uint256 btcPrice, uint256 tokenPrice) {
        Deposit memory depositItem = deposits[secretHash];

        require(depositItem.depositor != address(0), "Deposit does not exist");

        return (depositItem.depositor, depositItem.beneficiary, depositItem.token, depositItem.amount,
            depositItem.deadline, depositItem.withdrawn, depositItem.invoice, depositItem.btcPrice, depositItem.tokenPrice);
    }

}
