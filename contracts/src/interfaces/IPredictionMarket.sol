// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPredictionMarket
 * @notice Interface for the PredictionMarket contract
 * @dev Useful for frontend integration and future contract interactions
 */
interface IPredictionMarket {
    // Enums
    enum MarketState { Active, Resolved, Cancelled }
    enum Outcome { Unresolved, Yes, No, Invalid }
    
    // Events
    event SharesPurchased(address indexed buyer, bool isYes, uint256 amount);
    event MarketResolved(Outcome outcome, uint256 timestamp);
    event MarketCancelled(uint256 timestamp);
    event Claimed(address indexed user, uint256 amount);
    
    // Errors
    error MarketNotActive();
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error OnlyCreator();
    error ResolutionTimeTooEarly();
    error InvalidAmount();
    error NothingToClaim();
    error TransferFailed();
    
    // View functions
    function question() external view returns (string memory);
    function description() external view returns (string memory);
    function creator() external view returns (address);
    function resolutionTime() external view returns (uint256);
    function createdAt() external view returns (uint256);
    function state() external view returns (MarketState);
    function outcome() external view returns (Outcome);
    function yesShares(address user) external view returns (uint256);
    function noShares(address user) external view returns (uint256);
    function totalYesShares() external view returns (uint256);
    function totalNoShares() external view returns (uint256);
    function getYesProbability() external view returns (uint256);
    function getUserPosition(address user) external view returns (uint256 yes, uint256 no);
    function getTotalPool() external view returns (uint256);
    
    // State-changing functions
    function buyShares(bool isYes) external payable;
    function resolve(Outcome _outcome) external;
    function cancel() external;
    function claim() external;
}