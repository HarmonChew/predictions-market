# Prediction Market dApp

A decentralized prediction market platform built on Ethereum where users can create markets, bet on future outcomes, and earn from accurate predictions.

## 🎯 Features

### Core Functionality
- **Create Markets**: Anyone can create prediction markets with custom questions and resolution dates
- **Buy Shares**: Bet on YES or NO outcomes using ETH
- **Resolve Markets**: Creators resolve markets after the deadline passes
- **Claim Winnings**: Winners receive proportional payouts from the total pool
- **Track Positions**: View all your active and resolved market positions

### User Experience
- **Web3 Onboarding**: Email/social login via Thirdweb InApp Wallets
- **Gas Sponsorship**: Gasless transactions for users (sponsored by creator)
- **Real-time Updates**: Live probability calculations and market stats
- **Toast Notifications**: Clear feedback for all actions
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity 0.8.20**: Smart contract language
- **Foundry**: Development framework, testing, and deployment
- **OpenZeppelin**: Secure contract patterns

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Thirdweb SDK**: Web3 integration and wallet management
- **TailwindCSS**: Styling
- **shadcn/ui**: UI component library
- **Sonner**: Toast notifications

### Deployment
- **Sepolia Testnet**: Ethereum test network
- **Vercel**: Frontend hosting


## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- WSL (if on Windows)
- MetaMask or any Web3 wallet

### 1. Clone the Repository
```bash
git clone https://github.com/HarmonChew/predictions-market.git
cd prediction-market
```

### 2. Deploy Smart Contracts

```bash
cd contracts

# Install Foundry (if not installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create .env file
cp .env.example .env
# Add your PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY

# Get Sepolia testnet ETH
# Visit: https://www.alchemy.com/faucets/ethereum-sepolia

# Deploy to Sepolia
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast --verify

# Save the deployed factory address!
```

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local
# Add:
# NEXT_PUBLIC_THIRDWEB_CLIENT_ID=<from thirdweb.com/dashboard>
# NEXT_PUBLIC_FACTORY_ADDRESS=<from deployment>
# NEXT_PUBLIC_CHAIN_ID=11155111

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### 4. Get Thirdweb Client ID
1. Go to [thirdweb.com/dashboard](https://thirdweb.com/dashboard)
2. Create a free account
3. Create a new project
4. Copy your Client ID to `.env.local`

## 📝 How It Works

### Market Lifecycle

1. **Creation**: User creates a market with a question and resolution date
2. **Trading**: Users buy YES or NO shares using ETH (1:1 ratio)
3. **Resolution**: After deadline, creator resolves to YES, NO, or INVALID
4. **Claiming**: Winners claim their proportional share of the total pool


### Payout Calculation

```
Your Winnings = (Total Pool × Your Shares) / Total Winning Shares
```

## 🧪 Testing

Run smart contract tests:
```bash
cd contracts
forge test -vv
```

## 🎨 Key Design Decisions

### Why Simple Pricing?
- **Easier to understand** for new users
- **Faster development** to validate the concept
- **Clear expectations** (no slippage, no fees)
- AMM pricing can be added as an improvement

### Why Thirdweb?
- **Better UX** with InApp Wallets (email/social login)
- **Gas sponsorship** removes barrier for new users
- **Easy integration** with React hooks
- **Production-ready** wallet connection UI

### Why No Selling?
- **Simpler contracts** and less attack surface
- **Clearer mechanics** for users
- **Commitment model** encourages thoughtful predictions
- Can be added as future improvement

## 🚧 Potential Future Improvements

### Smart Contract Enhancements
- [ ] **AMM Pricing**: Dynamic odds based on supply/demand (Uniswap-style constant product)
- [ ] **Sell Shares**: Allow users to exit positions before resolution
- [ ] **Trading Fees**: Add small fee (1-2%) to sustain liquidity
- [ ] **Liquidity Providers**: Incentivize initial liquidity with rewards
- [ ] **Multi-outcome Markets**: Support more than YES/NO (e.g., A/B/C/D options)
- [ ] **Oracle Integration**: Automated resolution via Chainlink oracles
- [ ] **Market Templates**: Pre-built categories (sports, crypto, politics)
- [ ] **Time-weighted Resolution**: Multiple resolution checkpoints

### Frontend Improvements
- [ ] **Search & Filters**: Search markets by keywords, filter by category/status
- [ ] **Market Analytics**: Historical charts, volume graphs, participant trends
- [ ] **Leaderboard**: Top predictors, most profitable users
- [ ] **Social Features**: Comments, market discussions, share on social media
- [ ] **Mobile App**: Native iOS/Android apps
- [ ] **Notification System**: Email/push notifications for market events
- [ ] **Market Discovery**: Trending markets, recommended predictions
- [ ] **Portfolio Dashboard**: P&L tracking, win rate, total volume
- [ ] **Dark Mode**: Toggle theme preference
- [ ] **Advanced Charts**: Recharts/D3.js visualizations

### UX Enhancements
- [ ] **Skeleton Loaders**: Better loading states
- [ ] **Optimistic Updates**: Instant UI feedback before blockchain confirmation
- [ ] **Transaction History**: View all past transactions
- [ ] **Export Data**: Download CSV of positions/history
- [ ] **Market Validation**: Prevent duplicate/spam markets
- [ ] **Tutorials**: Interactive onboarding for new users
- [ ] **FAQ Section**: Common questions about prediction markets

### Security & Testing
- [ ] **Audit**: Professional smart contract audit
- [ ] **Increased Test Coverage**: Edge cases, fuzzing tests
- [ ] **Pause Mechanism**: Emergency stop for critical bugs
- [ ] **Timelock**: Delay for contract upgrades
- [ ] **Bug Bounty**: Community-driven security testing

### Scaling & Performance
- [ ] **L2 Deployment**: Deploy to Arbitrum/Optimism for lower fees
- [ ] **Indexing**: The Graph protocol for faster queries
- [ ] **Caching**: Redis/CDN for market data
- [ ] **Lazy Loading**: Paginate large market lists
- [ ] **Event Streaming**: Real-time updates via WebSocket

### Governance & Community
- [ ] **DAO**: Community governance for platform decisions
- [ ] **Resolution Disputes**: Voting mechanism for contested outcomes
- [ ] **Platform Token**: Governance + fee sharing token
- [ ] **Creator Incentives**: Rewards for popular markets
- [ ] **Referral System**: Invite friends, earn rewards

## 📊 Smart Contract Addresses

### Sepolia Testnet
- **MarketFactory**: `0xbc79aD76fa014f9F56bC4638D037cC5598806FdA`

