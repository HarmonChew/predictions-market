// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PredictionMarket} from "./PredictionMarket.sol";

/**
 * @title MarketFactory
 * @notice Factory contract for creating and tracking prediction markets
 * @dev Allows anyone to create markets and provides discovery functionality
 */
contract MarketFactory {
    // Array of all created markets
    address[] public allMarkets;
    
    // Mapping from creator to their markets
    mapping(address => address[]) public marketsByCreator;
    
    // Events
    event MarketCreated(
        address indexed marketAddress,
        address indexed creator,
        string question,
        uint256 resolutionTime,
        uint256 timestamp
    );
    
    /**
     * @notice Create a new prediction market
     * @param question The question being predicted
     * @param description Additional context
     * @param resolutionTime Unix timestamp when market can be resolved
     * @return marketAddress The address of the newly created market
     */
    function createMarket(
        string memory question,
        string memory description,
        uint256 resolutionTime
    ) external returns (address marketAddress) {
        // Deploy new market contract with msg.sender as creator
        PredictionMarket market = new PredictionMarket(
            msg.sender,
            question,
            description,
            resolutionTime
        );
        
        marketAddress = address(market);
        
        // Track the market
        allMarkets.push(marketAddress);
        marketsByCreator[msg.sender].push(marketAddress);
        
        emit MarketCreated(
            marketAddress,
            msg.sender,
            question,
            resolutionTime,
            block.timestamp
        );
        
        return marketAddress;
    }
    
    /**
     * @notice Get total number of markets created
     */
    function getMarketCount() external view returns (uint256) {
        return allMarkets.length;
    }
    
    /**
     * @notice Get all markets (paginated)
     * @param start Starting index
     * @param limit Number of markets to return
     */
    function getMarkets(uint256 start, uint256 limit) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 total = allMarkets.length;
        if (start >= total) {
            return new address[](0);
        }
        
        uint256 end = start + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 size = end - start;
        address[] memory markets = new address[](size);
        
        for (uint256 i = 0; i < size; i++) {
            markets[i] = allMarkets[start + i];
        }
        
        return markets;
    }
    
    /**
     * @notice Get markets created by a specific address
     */
    function getMarketsByCreator(address creator) 
        external 
        view 
        returns (address[] memory) 
    {
        return marketsByCreator[creator];
    }
    
    /**
     * @notice Get the latest N markets
     */
    function getLatestMarkets(uint256 count) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 total = allMarkets.length;
        if (total == 0) {
            return new address[](0);
        }
        
        uint256 size = count > total ? total : count;
        address[] memory markets = new address[](size);
        
        for (uint256 i = 0; i < size; i++) {
            markets[i] = allMarkets[total - 1 - i];
        }
        
        return markets;
    }
}