// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Shadow Ledger - Privacy-preserving bill recording system
/// @author FHEVM Shadow Ledger
/// @notice A bill recording dApp with encrypted amounts and aggregation statistics
contract ShadowLedger is ZamaEthereumConfig {
    /// @notice Bill record structure
    struct BillRecord {
        euint64 amount;           // Encrypted amount
        string category;           // Category (plaintext metadata)
        string description;        // Description (plaintext metadata)
        uint256 timestamp;         // Timestamp
        address creator;           // Creator address
        bool exists;               // Existence flag
    }

    /// @notice Mapping from user address to bill index to bill record
    mapping(address => mapping(uint256 => BillRecord)) private _bills;
    
    /// @notice Mapping from user address to bill count
    mapping(address => uint256) private _billCounts;
    
    /// @notice Mapping from user address to total amount (encrypted)
    mapping(address => euint64) private _totalAmounts;
    
    /// @notice Mapping from user address to category to total amount (encrypted)
    mapping(address => mapping(string => euint64)) private _categoryTotals;
    
    /// @notice Mapping from user address to month index to total amount (encrypted)
    /// @dev Month index = timestamp / 2629746 (approximate month in seconds)
    mapping(address => mapping(uint256 => euint64)) private _monthlyTotals;

    /// @notice Event emitted when a bill is created
    event BillCreated(
        address indexed user,
        uint256 indexed index,
        string category,
        uint256 timestamp
    );

    /// @notice Creates a new bill record with encrypted amount
    /// @param amount The encrypted amount (externalEuint64)
    /// @param inputProof The input proof for the encrypted amount
    /// @param category The bill category (plaintext)
    /// @param description The bill description (plaintext)
    function createBill(
        externalEuint64 amount,
        bytes calldata inputProof,
        string memory category,
        string memory description
    ) external {
        euint64 encryptedAmount = FHE.fromExternal(amount, inputProof);
        
        uint256 index = _billCounts[msg.sender]++;
        uint256 timestamp = block.timestamp;
        
        _bills[msg.sender][index] = BillRecord({
            amount: encryptedAmount,
            category: category,
            description: description,
            timestamp: timestamp,
            creator: msg.sender,
            exists: true
        });
        
        // Update aggregation statistics
        _totalAmounts[msg.sender] = FHE.add(_totalAmounts[msg.sender], encryptedAmount);
        
        // Update category total
        _categoryTotals[msg.sender][category] = FHE.add(
            _categoryTotals[msg.sender][category],
            encryptedAmount
        );
        
        // Update monthly total (approximate: timestamp / 2629746 = month index)
        uint256 monthIndex = timestamp / 2629746;
        _monthlyTotals[msg.sender][monthIndex] = FHE.add(
            _monthlyTotals[msg.sender][monthIndex],
            encryptedAmount
        );
        
        // Authorize decryption for the user
        FHE.allowThis(encryptedAmount);
        FHE.allow(encryptedAmount, msg.sender);
        FHE.allowThis(_totalAmounts[msg.sender]);
        FHE.allow(_totalAmounts[msg.sender], msg.sender);
        FHE.allowThis(_categoryTotals[msg.sender][category]);
        FHE.allow(_categoryTotals[msg.sender][category], msg.sender);
        FHE.allowThis(_monthlyTotals[msg.sender][monthIndex]);
        FHE.allow(_monthlyTotals[msg.sender][monthIndex], msg.sender);
        
        emit BillCreated(msg.sender, index, category, timestamp);
    }

    /// @notice Returns the bill count for a user
    /// @param user The user address
    /// @return The number of bills for the user
    function getBillCount(address user) external view returns (uint256) {
        return _billCounts[user];
    }

    /// @notice Returns the encrypted amount of a specific bill
    /// @param user The user address
    /// @param index The bill index
    /// @return The encrypted amount (euint64 handle)
    function getBill(address user, uint256 index) external view returns (euint64) {
        require(_bills[user][index].exists, "Bill does not exist");
        return _bills[user][index].amount;
    }

    /// @notice Returns the metadata of a specific bill (without amount)
    /// @param user The user address
    /// @param index The bill index
    /// @return category The bill category
    /// @return description The bill description
    /// @return timestamp The bill timestamp
    function getBillMeta(address user, uint256 index) external view returns (
        string memory category,
        string memory description,
        uint256 timestamp
    ) {
        BillRecord memory bill = _bills[user][index];
        require(bill.exists, "Bill does not exist");
        return (bill.category, bill.description, bill.timestamp);
    }

    /// @notice Returns the total encrypted amount for a user
    /// @param user The user address
    /// @return The encrypted total amount (euint64 handle)
    function getTotalAmount(address user) external view returns (euint64) {
        return _totalAmounts[user];
    }

    /// @notice Returns the total encrypted amount for a category
    /// @param user The user address
    /// @param category The category name
    /// @return The encrypted total amount for the category (euint64 handle)
    function getTotalAmountByCategory(address user, string memory category) external view returns (euint64) {
        return _categoryTotals[user][category];
    }

    /// @notice Returns the total encrypted amount for a specific month
    /// @param user The user address
    /// @param monthIndex The month index (timestamp / 2629746)
    /// @return The encrypted total amount for the month (euint64 handle)
    function getTotalAmountByMonth(address user, uint256 monthIndex) external view returns (euint64) {
        return _monthlyTotals[user][monthIndex];
    }

    /// @notice Helper function to calculate month index from timestamp
    /// @param timestamp The timestamp
    /// @return The month index
    function getMonthIndex(uint256 timestamp) external pure returns (uint256) {
        return timestamp / 2629746;
    }
}



