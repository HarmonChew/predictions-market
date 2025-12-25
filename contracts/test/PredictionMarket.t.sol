// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";
import {MarketFactory} from "../src/MarketFactory.sol";

contract PredictionMarketTest is Test {
    PredictionMarket public market;
    MarketFactory public factory;
    
    address public creator = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    
    string constant QUESTION = "Will ETH reach $5000 by end of 2024?";
    string constant DESCRIPTION = "Market resolves YES if ETH hits $5000";
    uint256 constant RESOLUTION_TIME = 1735689600; // Jan 1, 2025
    
    function setUp() public {
        // Deploy factory
        factory = new MarketFactory();
        
        // Create market as creator
        vm.prank(creator);
        address marketAddress = factory.createMarket(
            QUESTION,
            DESCRIPTION,
            RESOLUTION_TIME
        );
        market = PredictionMarket(marketAddress);
        
        // Fund test users
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }
    
    // ============ Market Creation Tests ============
    
    function test_MarketCreation() public view {
        assertEq(market.question(), QUESTION);
        assertEq(market.description(), DESCRIPTION);
        assertEq(market.creator(), creator);
        assertEq(market.resolutionTime(), RESOLUTION_TIME);
        assertEq(uint(market.state()), uint(PredictionMarket.MarketState.Active));
    }
    
    function test_FactoryTracksMarkets() public view {
        assertEq(factory.getMarketCount(), 1);
        address[] memory markets = factory.getLatestMarkets(1);
        assertEq(markets[0], address(market));
    }
    
    // ============ Buying Shares Tests ============
    
    function test_BuyYesShares() public {
        vm.prank(user1);
        market.buyShares{value: 1 ether}(true);
        
        (uint256 yesShares, uint256 noShares) = market.getUserPosition(user1);
        assertEq(yesShares, 1 ether);
        assertEq(noShares, 0);
        assertEq(market.totalYesShares(), 1 ether);
    }
    
    function test_BuyNoShares() public {
        vm.prank(user1);
        market.buyShares{value: 2 ether}(false);
        
        (uint256 yesShares, uint256 noShares) = market.getUserPosition(user1);
        assertEq(yesShares, 0);
        assertEq(noShares, 2 ether);
        assertEq(market.totalNoShares(), 2 ether);
    }
    
    function test_MultiplePurchases() public {
        vm.prank(user1);
        market.buyShares{value: 1 ether}(true);
        
        vm.prank(user2);
        market.buyShares{value: 2 ether}(false);
        
        assertEq(market.totalYesShares(), 1 ether);
        assertEq(market.totalNoShares(), 2 ether);
        assertEq(market.getTotalPool(), 3 ether);
    }
    
    function test_RevertBuyWithZeroValue() public {
        vm.prank(user1);
        vm.expectRevert(PredictionMarket.InvalidAmount.selector);
        market.buyShares{value: 0}(true);
    }
    
    // ============ Probability Tests ============
    
    function test_InitialProbability() public view {
        assertEq(market.getYesProbability(), 50);
    }
    
    function test_ProbabilityAfterPurchases() public {
        vm.prank(user1);
        market.buyShares{value: 3 ether}(true);
        
        vm.prank(user2);
        market.buyShares{value: 1 ether}(false);
        
        // 3 YES out of 4 total = 75%
        assertEq(market.getYesProbability(), 75);
    }
    
    // ============ Resolution Tests ============
    
    function test_ResolveYes() public {
        // Fast forward past resolution time
        vm.warp(RESOLUTION_TIME + 1);
        
        vm.prank(creator);
        market.resolve(PredictionMarket.Outcome.Yes);
        
        assertEq(uint(market.state()), uint(PredictionMarket.MarketState.Resolved));
        assertEq(uint(market.outcome()), uint(PredictionMarket.Outcome.Yes));
    }
    
    function test_RevertResolveBeforeTime() public {
        vm.warp(RESOLUTION_TIME - 1);
        
        vm.prank(creator);
        vm.expectRevert(PredictionMarket.ResolutionTimeTooEarly.selector);
        market.resolve(PredictionMarket.Outcome.Yes);
    }
    
    function test_RevertResolveNotCreator() public {
        vm.warp(RESOLUTION_TIME + 1);
        
        vm.prank(user1);
        vm.expectRevert(PredictionMarket.OnlyCreator.selector);
        market.resolve(PredictionMarket.Outcome.Yes);
    }
    
    function test_RevertResolveUnresolved() public {
        vm.warp(RESOLUTION_TIME + 1);
        
        vm.prank(creator);
        vm.expectRevert(PredictionMarket.InvalidAmount.selector);
        market.resolve(PredictionMarket.Outcome.Unresolved);
    }
    
    // ============ Claiming Tests ============
    
    function test_ClaimYesWinner() public {
        // Users buy shares
        vm.prank(user1);
        market.buyShares{value: 1 ether}(true);
        
        vm.prank(user2);
        market.buyShares{value: 1 ether}(false);
        
        // Resolve YES
        vm.warp(RESOLUTION_TIME + 1);
        vm.prank(creator);
        market.resolve(PredictionMarket.Outcome.Yes);
        
        // User1 claims winnings (should get entire pool)
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        market.claim();
        uint256 balanceAfter = user1.balance;
        
        assertEq(balanceAfter - balanceBefore, 2 ether);
    }
    
    function test_ClaimNoWinner() public {
        // Users buy shares
        vm.prank(user1);
        market.buyShares{value: 1 ether}(true);
        
        vm.prank(user2);
        market.buyShares{value: 1 ether}(false);
        
        // Resolve NO
        vm.warp(RESOLUTION_TIME + 1);
        vm.prank(creator);
        market.resolve(PredictionMarket.Outcome.No);
        
        // User2 claims winnings
        uint256 balanceBefore = user2.balance;
        vm.prank(user2);
        market.claim();
        uint256 balanceAfter = user2.balance;
        
        assertEq(balanceAfter - balanceBefore, 2 ether);
    }
    
    function test_ClaimProportionalWinnings() public {
        // Multiple YES buyers
        vm.prank(user1);
        market.buyShares{value: 3 ether}(true);
        
        vm.prank(user2);
        market.buyShares{value: 1 ether}(true);
        
        address user3 = address(4);
        vm.deal(user3, 100 ether);
        vm.prank(user3);
        market.buyShares{value: 4 ether}(false);
        
        // Total pool: 8 ether
        // YES: 4 ether (user1: 3, user2: 1)
        // NO: 4 ether
        
        // Resolve YES
        vm.warp(RESOLUTION_TIME + 1);
        vm.prank(creator);
        market.resolve(PredictionMarket.Outcome.Yes);
        
        // User1 should get 3/4 of pool = 6 ether
        uint256 user1BalanceBefore = user1.balance;
        vm.prank(user1);
        market.claim();
        assertEq(user1.balance - user1BalanceBefore, 6 ether);
        
        // User2 should get 1/4 of pool = 2 ether
        uint256 user2BalanceBefore = user2.balance;
        vm.prank(user2);
        market.claim();
        assertEq(user2.balance - user2BalanceBefore, 2 ether);
    }
    
    function test_ClaimInvalid() public {
        // Users buy shares
        vm.prank(user1);
        market.buyShares{value: 1 ether}(true);
        
        vm.prank(user2);
        market.buyShares{value: 1 ether}(false);
        
        // Resolve INVALID
        vm.warp(RESOLUTION_TIME + 1);
        vm.prank(creator);
        market.resolve(PredictionMarket.Outcome.Invalid);
        
        // Both should get refunded
        uint256 user1BalanceBefore = user1.balance;
        vm.prank(user1);
        market.claim();
        assertEq(user1.balance - user1BalanceBefore, 1 ether);
        
        uint256 user2BalanceBefore = user2.balance;
        vm.prank(user2);
        market.claim();
        assertEq(user2.balance - user2BalanceBefore, 1 ether);
    }
    
    function test_RevertClaimBeforeResolution() public {
        vm.prank(user1);
        market.buyShares{value: 1 ether}(true);
        
        vm.prank(user1);
        vm.expectRevert(PredictionMarket.MarketNotResolved.selector);
        market.claim();
    }
    
    function test_RevertClaimNothingToClaim() public {
        vm.prank(user1);
        market.buyShares{value: 1 ether}(true);
        
        vm.warp(RESOLUTION_TIME + 1);
        vm.prank(creator);
        market.resolve(PredictionMarket.Outcome.No);
        
        // User1 bet YES but NO won
        vm.prank(user1);
        vm.expectRevert(PredictionMarket.NothingToClaim.selector);
        market.claim();
    }
    
    // ============ Cancellation Tests ============
    
    function test_CancelMarket() public {
        vm.prank(creator);
        market.cancel();
        
        assertEq(uint(market.state()), uint(PredictionMarket.MarketState.Cancelled));
    }
    
    function test_ClaimAfterCancel() public {
        vm.prank(user1);
        market.buyShares{value: 1 ether}(true);
        
        vm.prank(user2);
        market.buyShares{value: 2 ether}(false);
        
        vm.prank(creator);
        market.cancel();
        
        // Users should get refunded
        uint256 user1BalanceBefore = user1.balance;
        vm.prank(user1);
        market.claim();
        assertEq(user1.balance - user1BalanceBefore, 1 ether);
        
        uint256 user2BalanceBefore = user2.balance;
        vm.prank(user2);
        market.claim();
        assertEq(user2.balance - user2BalanceBefore, 2 ether);
    }
    
    function test_RevertCancelNotCreator() public {
        vm.prank(user1);
        vm.expectRevert(PredictionMarket.OnlyCreator.selector);
        market.cancel();
    }
    
    function test_RevertBuyAfterCancel() public {
        vm.prank(creator);
        market.cancel();
        
        vm.prank(user1);
        vm.expectRevert(PredictionMarket.MarketNotActive.selector);
        market.buyShares{value: 1 ether}(true);
    }
}