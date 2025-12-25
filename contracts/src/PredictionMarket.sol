// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PredictionMarket
 * @notice A simple binary prediction market - users bet on YES or NO
 * @dev Fixed 1:1 pricing for simplicity. AMM pricing can be added later as improvement
 */
contract PredictionMarket {
    // Market states
    enum MarketState { Active, Resolved, Cancelled }
    
    // Market outcome
    enum Outcome { Unresolved, Yes, No, Invalid }
    
    // Market information
    string public question;
    string public description;
    address public creator;
    uint256 public resolutionTime;
    uint256 public createdAt;
    MarketState public state;
    Outcome public outcome;
    
    // Share tracking (1 share = 1 wei for simplicity)
    mapping(address => uint256) public yesShares;
    mapping(address => uint256) public noShares;
    uint256 public totalYesShares;
    uint256 public totalNoShares;
    
    // Track total pool at resolution for accurate payouts
    uint256 public resolvedPoolSize;
    
    // Events
    event SharesPurchased(address indexed buyer, bool isYes, uint256 amount);
    event MarketResolved(Outcome outcome, uint256 timestamp);
    event MarketCancelled(uint256 timestamp);
    event Claimed(address indexed user, uint256 amount);
    
    // Errors
    error MarketNotActive();
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error MarketAlreadyCancelled();
    error OnlyCreator();
    error ResolutionTimeTooEarly();
    error InvalidAmount();
    error NothingToClaim();
    error TransferFailed();
    
    /**
     * @notice Creates a new prediction market
     * @param _creator The address that will control this market
     * @param _question The question being predicted
     * @param _description Additional context
     * @param _resolutionTime Unix timestamp when market can be resolved
     */
    constructor(
        address _creator,
        string memory _question,
        string memory _description,
        uint256 _resolutionTime
    ) {
        require(_resolutionTime > block.timestamp, "Resolution time must be in future");
        require(_creator != address(0), "Invalid creator address");
        
        question = _question;
        description = _description;
        creator = _creator;
        resolutionTime = _resolutionTime;
        createdAt = block.timestamp;
        state = MarketState.Active;
        outcome = Outcome.Unresolved;
    }
    
    /**
     * @notice Buy YES or NO shares at 1:1 ratio
     * @param isYes True to buy YES shares, false for NO shares
     */
    function buyShares(bool isYes) external payable {
        if (state != MarketState.Active) revert MarketNotActive();
        if (msg.value == 0) revert InvalidAmount();
        
        // Simple 1:1 pricing - 1 wei = 1 share
        uint256 shareAmount = msg.value;
        
        if (isYes) {
            yesShares[msg.sender] += shareAmount;
            totalYesShares += shareAmount;
        } else {
            noShares[msg.sender] += shareAmount;
            totalNoShares += shareAmount;
        }
        
        emit SharesPurchased(msg.sender, isYes, shareAmount);
    }
    
    /**
     * @notice Resolve the market (only creator, after resolution time)
     * @param _outcome The outcome (Yes, No, or Invalid)
     */
    function resolve(Outcome _outcome) external {
        if (msg.sender != creator) revert OnlyCreator();
        if (state == MarketState.Resolved) revert MarketAlreadyResolved();
        if (state == MarketState.Cancelled) revert MarketAlreadyCancelled();
        if (block.timestamp < resolutionTime) revert ResolutionTimeTooEarly();
        if (_outcome == Outcome.Unresolved) revert InvalidAmount();
        
        state = MarketState.Resolved;
        outcome = _outcome;
        resolvedPoolSize = address(this).balance;
        
        emit MarketResolved(_outcome, block.timestamp);
    }
    
    /**
     * @notice Cancel the market and return funds (only creator, only if not resolved)
     */
    function cancel() external {
        if (msg.sender != creator) revert OnlyCreator();
        if (state == MarketState.Resolved) revert MarketAlreadyResolved();
        if (state == MarketState.Cancelled) revert MarketAlreadyCancelled();
        
        state = MarketState.Cancelled;
        
        emit MarketCancelled(block.timestamp);
    }

    function _refundFull(address user) internal returns (uint256 payout) {
        uint256 yes = yesShares[user];
        uint256 no  = noShares[user];

        if (yes > 0) {
            yesShares[user] = 0;
            payout += yes;
        }

        if (no > 0) {
            noShares[user] = 0;
            payout += no;
        }
    }
    
    /**
     * @notice Claim winnings after market is resolved
     */
    function claim() external {
        if (state != MarketState.Resolved && state != MarketState.Cancelled) 
            revert MarketNotResolved();
        
        uint256 payout = 0;
        
        if (state == MarketState.Cancelled) {
            payout = _refundFull(msg.sender);
        } else if (outcome == Outcome.Yes) {
            // YES winners split the entire pool proportionally
            uint256 userShares = yesShares[msg.sender];
            if (userShares > 0 && totalYesShares > 0) {
                payout = (resolvedPoolSize * userShares) / totalYesShares;
                yesShares[msg.sender] = 0;
            }
        } else if (outcome == Outcome.No) {
            // NO winners split the entire pool proportionally
            uint256 userShares = noShares[msg.sender];
            if (userShares > 0 && totalNoShares > 0) {
                payout = (resolvedPoolSize * userShares) / totalNoShares;
                noShares[msg.sender] = 0;
            }
        } else if (outcome == Outcome.Invalid) {
            payout = _refundFull(msg.sender);
        }
        
        if (payout == 0) revert NothingToClaim();
        
        (bool success, ) = msg.sender.call{value: payout}("");
        if (!success) revert TransferFailed();
        
        emit Claimed(msg.sender, payout);
    }
    
    /**
     * @notice Get current probability of YES outcome (0-100)
     * @dev Simple calculation based on share distribution
     */
    function getYesProbability() external view returns (uint256) {
        uint256 totalShares = totalYesShares + totalNoShares;
        if (totalShares == 0) return 50;
        return (totalYesShares * 100) / totalShares;
    }
    
    /**
     * @notice Get user's position
     */
    function getUserPosition(address user) external view returns (uint256 yes, uint256 no) {
        return (yesShares[user], noShares[user]);
    }
    
    /**
     * @notice Get total pool size
     */
    function getTotalPool() external view returns (uint256) {
        return address(this).balance;
    }
}