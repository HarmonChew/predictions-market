pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../src/MarketFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MarketFactory
        MarketFactory factory = new MarketFactory();
        console.log("MarketFactory deployed at:", address(factory));
        
        // Optionally create a sample market for testing
        uint256 resolutionTime = block.timestamp + 7 days;
        address sampleMarket = factory.createMarket(
            "Will ETH reach $5000 by end of 2025?",
            "Market resolves YES if ETH hits $5000 USD on any major exchange before Jan 1, 2026",
            resolutionTime
        );
        console.log("Sample market created at:", sampleMarket);
        
        vm.stopBroadcast();
        
        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("Factory:", address(factory));
        console.log("Sample Market:", sampleMarket);
        console.log("Resolution Time:", resolutionTime);
        console.log("\nSave these addresses for your frontend!");
    }
}