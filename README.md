# 🎨 Artist Blockchain Platform

> **Encode 2025 Hackathon Submission**  
> A decentralized NFT marketplace for encrypted media assets with preview protection and collaborative revenue sharing.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📖 Overview

Artist Blockchain Platform is a decentralized marketplace that enables creators to mint, sell, and monetize encrypted media assets (audio, visual, VFX, SFX) as NFTs. The platform features advanced encryption, preview protection, IPFS storage, and collaborative revenue splitting—all built on Ethereum Sepolia testnet.

**Smart Contract**: [`0xf3C252022df94790aE4617C9058d9B3E5AEbB1E5`](https://sepolia.etherscan.io/address/0xf3C252022df94790aE4617C9058d9B3E5AEbB1E5)

### 🎯 Hackathon Category
Web3 Infrastructure & NFT Innovation

---

## ✨ Key Features

### 🔐 **Encrypted Media Protection**
- Full assets encrypted client-side with AES-256 before upload
- Preview versions watermarked/degraded for public browsing
- Encryption keys stored on-chain, accessible only to NFT owners
- Automated decryption flow post-purchase

### 🖼️ **NFT Marketplace**
- ERC-721 compliant smart contracts with OpenZeppelin
- Support for Audio, Visual, VFX, and SFX media types
- Real-time asset gallery with metadata from IPFS
- Purchase and instant ownership transfer

### 🌐 **Decentralized Storage**
- IPFS integration via Pinata with multi-gateway fallback
- Custom IPFS proxy (`/api/ipfs/[...path]`) bypasses CORS restrictions
- Metadata and files permanently stored on decentralized network
- Resilient architecture with automatic failover

### 🤝 **Collaborative Revenue Sharing**
- Multi-collaborator support with customizable revenue splits
- On-chain royalty tracking and distribution
- Transparent usage metrics for all stakeholders
- Automated smart contract payments

### 💼 **Enterprise-Grade Infrastructure**
- Alchemy RPC with 5-tier fallback system (300M compute units/month)
- Auto-configuration utility for MetaMask network setup
- Server-side rendering (SSR) for optimal performance
- Comprehensive error handling and logging

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  (React 18, TypeScript, Tailwind CSS, SSR-enabled)     │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   Wagmi + Viem │      │  Openfort Wallet   │
│  (Web3 Layer)  │      │ (Embedded Wallets) │
└───────┬────────┘      └─────────┬──────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────────┐
        │   Ethereum Sepolia Testnet  │
        │   MediaAssetNFT.sol         │
        │   (ERC-721 + Encryption)    │
        └────────────┬────────────────┘
                     │
        ┌────────────┼────────────┐
        │                         │
┌───────▼──────┐        ┌─────────▼────────┐
│ IPFS/Pinata  │        │  AES-256 Crypto  │
│ (Storage)    │        │  (Client-side)   │
└──────────────┘        └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **MetaMask** browser extension
- **Sepolia ETH** ([Get from faucet](https://sepoliafaucet.com))
- **Pinata Account** ([Sign up free](https://pinata.cloud))

### Installation

```bash
# Clone the repository
git clone https://github.com/chinmayraj28/encode-2025.git
cd encode-2025

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

Create `.env.local` with the following:

```bash
# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf3C252022df94790aE4617C9058d9B3E5AEbB1E5

# IPFS Storage (Pinata)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud

# RPC Provider (Alchemy)
NEXT_PUBLIC_ALCHEMY_RPC=https://eth-sepolia.g.alchemy.com/v2/your_api_key

# Wallet Integration
NEXT_PUBLIC_OPENFORT_PUBLISHABLE_KEY=your_openfort_key
NEXT_PUBLIC_SHIELD_PUBLISHABLE_KEY=your_shield_key

# Deployment (for smart contract deployment only)
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🎬 Usage Guide

### For Creators (Upload & Mint)

1. **Connect Wallet** → Click "Connect Wallet" and approve connection
2. **Upload Media** → Select your audio/visual/VFX/SFX file (max 100MB)
3. **Add Metadata** → Enter title, description, and set price in ETH
4. **Configure Collaborators** (Optional) → Add wallet addresses with revenue split percentages
5. **Mint NFT** → Approve transaction; your asset will be:
   - Encrypted with AES-256
   - Uploaded to IPFS
   - Minted as ERC-721 NFT
   - Listed in marketplace

### For Buyers (Browse & Purchase)

1. **Browse Gallery** → View all available assets with previews
2. **Preview Asset** → Click on asset to see watermarked preview
3. **Purchase** → Click "Purchase Access" and approve transaction
4. **Download** → After purchase, download and decrypt full asset automatically
5. **Verify Ownership** → NFT transferred to your wallet, viewable on Etherscan

---

## 🛠️ Technology Stack

### Blockchain
- **Solidity** 0.8.20 - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Audited contract libraries
- **Ethers.js** v5 - Blockchain interaction

### Frontend
- **Next.js** 14.2.5 - React framework with App Router
- **React** 18 - UI library
- **TypeScript** 5 - Type safety
- **Tailwind CSS** - Utility-first styling

### Web3
- **Wagmi** v2 - React hooks for Ethereum
- **Viem** v2 - TypeScript Ethereum library
- **Openfort** - Embedded wallet SDK
- **TanStack Query** v5 - Async state management

### Infrastructure
- **IPFS** - Decentralized storage via Pinata
- **Alchemy** - Enterprise RPC provider
- **CryptoJS** - Client-side encryption
- **VS Code Dev Tunnels** - Local development (production: Vercel-ready)

---

## 📂 Project Structure

```
encode-2025/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── asset/[id]/          # Asset data endpoint
│   │   └── ipfs/[...path]/      # IPFS proxy (CORS bypass)
│   ├── asset/[id]/              # Asset detail page
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout with providers
│   ├── providers.tsx             # Web3 provider setup
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── AssetGallery.tsx          # NFT gallery grid
│   ├── ConnectWallet.tsx         # Wallet connection + RPC helper
│   ├── UploadForm.tsx            # Asset upload & minting
│   ├── IPFSImage.tsx             # IPFS image with fallback
│   └── IPFSAudio.tsx             # IPFS audio player
├── config/                       # Configuration
│   └── wagmi.ts                  # Wagmi + chain config
├── contracts/                    # Smart contracts
│   └── MediaAssetNFT.sol         # Main NFT contract
├── lib/                          # Utilities
│   ├── encryption.ts             # AES-256 encryption
│   ├── pinata.ts                 # Pinata IPFS client
│   ├── preview-generator.ts      # Watermark/preview logic
│   └── metamask-rpc.ts           # MetaMask auto-config
├── scripts/                      # Deployment
│   └── deploy.js                 # Hardhat deployment script
├── docs/                         # Documentation
│   ├── FIXES_SUMMARY.md          # Technical fixes
│   ├── RPC_SETUP.md              # RPC configuration guide
│   └── *.md                      # Other guides
├── hardhat.config.js             # Hardhat configuration
├── package.json                  # Dependencies
└── .env.local                    # Environment variables
```

---

## 🧪 Smart Contract

### MediaAssetNFT.sol Features

```solidity
contract MediaAssetNFT is ERC721, Ownable {
    struct MediaAsset {
        string ipfsHash;          // Encrypted file on IPFS
        string previewHash;       // Public preview on IPFS
        string mediaType;         // audio | visual | vfx | sfx
        uint256 uploadTimestamp;
        address creator;
        uint256 royaltyPercentage;
        uint256 usageCount;
        uint256 totalRevenue;
    }
    
    struct Collaborator {
        address wallet;
        uint256 sharePercentage;  // Split revenue
    }
    
    function mintMediaAsset(...) external returns (uint256);
    function purchaseAccess(uint256 tokenId) external payable;
    function getMediaAsset(uint256 tokenId) external view returns (MediaAsset);
}
```

**Deployment Commands:**
```bash
npm run compile                    # Compile contracts
npm run deploy:sepolia             # Deploy to Sepolia
```

---

## 🔐 Security Features

### Encryption Pipeline
1. **Client-Side Encryption**: Files encrypted in browser with AES-256
2. **Key Management**: Encryption keys stored on-chain (only NFT owner access)
3. **Preview Protection**: Watermarked/degraded versions for public viewing
4. **Secure Decryption**: Automatic decryption post-purchase in browser

### CORS & RPC Protection
- Custom IPFS proxy prevents CORS errors from port-forwarded environments
- Multi-RPC fallback with circuit breaker protection
- Alchemy primary RPC with 5 public RPCs as backup
- Auto-configuration for MetaMask users

---

## 📊 Demo & Testing

### Live Demo
🔗 **[Try it now](https://vt4k60cs-3000.uks1.devtunnels.ms)** (Dev Tunnels - may require access)

### Test Workflow
1. Get Sepolia ETH from [faucet](https://sepoliafaucet.com)
2. Connect wallet to Sepolia network
3. Upload a test file (audio/image recommended)
4. Set price (e.g., 0.01 ETH)
5. Mint NFT → Check [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xf3C252022df94790aE4617C9058d9B3E5AEbB1E5)
6. Browse gallery → Purchase from another wallet
7. Download & decrypt → Verify full file access

---

## 🚢 Deployment

### Production Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

**Environment Variables Required:**
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_PINATA_JWT`
- `NEXT_PUBLIC_ALCHEMY_RPC`
- `NEXT_PUBLIC_OPENFORT_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SHIELD_PUBLISHABLE_KEY`

---

## 📚 Documentation

- **[Complete System Overview](./docs/COMPLETE_SYSTEM.md)**
- **[IPFS Proxy & CORS Fixes](./docs/FIXES_SUMMARY.md)**
- **[RPC Configuration Guide](./docs/RPC_SETUP.md)**
- **[Encryption Implementation](./docs/ENCRYPTION_COMPLETE.md)**
- **[Quick Start Guide](./docs/QUICK_START.md)**

---

## 🎯 Hackathon Achievements

### ✅ Technical Innovation
- [x] Novel encrypted NFT architecture with preview protection
- [x] Custom IPFS proxy solving CORS in tunnel/proxy environments
- [x] Multi-collaborator revenue splitting on-chain
- [x] Client-side encryption with server-side decentralization
- [x] Auto-configuration utilities for Web3 onboarding

### ✅ User Experience
- [x] Seamless wallet integration (MetaMask + Openfort)
- [x] Responsive, modern UI with Tailwind CSS
- [x] Real-time asset gallery with IPFS metadata
- [x] One-click RPC configuration for users
- [x] Comprehensive error handling and feedback

### ✅ Code Quality
- [x] TypeScript for type safety across stack
- [x] Modular, reusable components
- [x] Comprehensive documentation
- [x] Smart contract optimization (200 runs)
- [x] Production-ready architecture

---

## 🔮 Future Roadmap

### Phase 1 - Enhanced Features (Q1 2025)
- [ ] Batch minting for multiple assets
- [ ] Advanced search and filtering
- [ ] Creator profiles and portfolios
- [ ] Asset collections and bundles

### Phase 2 - Scaling (Q2 2025)
- [ ] Multi-chain deployment (Polygon, Arbitrum, Base)
- [ ] Subgraph for efficient data querying
- [ ] Mobile app (React Native)
- [ ] Auction and bidding system

### Phase 3 - Platform Growth (Q3 2025)
- [ ] Secondary marketplace with royalties
- [ ] DAO governance for platform decisions
- [ ] Creator verification and badges
- [ ] Analytics dashboard for creators

### Mainnet Preparation
- [ ] Security audit by third-party firm
- [ ] Gas optimization review
- [ ] Load testing and performance tuning
- [ ] Legal compliance review

---

## 🤝 Contributing

This is an active hackathon project! Contributions welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Encode 2025 Hackathon

**Team**: [Your Team Name]  
**Category**: Web3 Infrastructure & NFT Innovation  
**Submission Date**: October 2025

### Contact
- **GitHub**: [@chinmayraj28](https://github.com/chinmayraj28)
- **Repository**: [encode-2025](https://github.com/chinmayraj28/encode-2025)
- **Demo**: [Live Demo Link]

---

## 🙏 Acknowledgments

- **Encode Club** for organizing the hackathon
- **Alchemy** for reliable RPC infrastructure
- **Pinata** for IPFS storage solutions
- **OpenZeppelin** for audited smart contract libraries
- **Openfort** for embedded wallet SDK
- **Ethereum Foundation** for Sepolia testnet

---

<div align="center">

**Built with ❤️ for Encode 2025 Hackathon**

[![GitHub Stars](https://img.shields.io/github/stars/chinmayraj28/encode-2025?style=social)](https://github.com/chinmayraj28/encode-2025)
[![GitHub Forks](https://img.shields.io/github/forks/chinmayraj28/encode-2025?style=social)](https://github.com/chinmayraj28/encode-2025/fork)

[⬆ Back to Top](#-artist-blockchain-platform)

</div>

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Hardhat for Smart Contract Deployment

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

### 3. Initialize Hardhat

```bash
npx hardhat init
```

Select "Create an empty hardhat.config.js"

### 4. Set Up Environment Variables

Create `.env` for smart contract deployment:

```bash
PRIVATE_KEY=your_wallet_private_key
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=your_arbiscan_api_key_optional
```

Create `.env.local` for the frontend:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

### 5. Deploy Smart Contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

Copy the deployed contract address and add it to `.env.local`

### 6. Update WalletConnect Project ID

Edit `config/wagmi.ts` and replace `'YOUR_WALLETCONNECT_PROJECT_ID'` with your actual project ID from cloud.walletconnect.com

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How It Works

### For Artists (Uploading)

1. **Connect Wallet**: Connect your Metamask wallet
2. **Upload Asset**: Choose your audio/visual/VFX/SFX file
3. **Set Metadata**: Add title, description, media type
4. **Set Royalty**: Choose your royalty percentage (0-20%)
5. **Add Collaborators** (Optional): Add wallet addresses and split percentages
6. **Mint**: Files are uploaded to IPFS and an NFT is minted on Arbitrum

### For Users (Purchasing/Using)

1. **Browse Gallery**: View all available assets
2. **Select Asset**: Choose an asset you want to use
3. **Pay & Use**: Send ETH payment - royalties are automatically distributed
4. **Proof of Use**: Transaction is recorded on-chain

## 🎯 Smart Contract Features

- **ERC721 NFT Standard**: Each asset is a unique NFT
- **Royalty System**: Automatic royalty payments on each use
- **Multi-Collaborator Support**: Split ownership and revenue
- **Usage Tracking**: Track how many times an asset has been used
- **Revenue Transparency**: All payments visible on-chain

## 🧪 Testing on Arbitrum Sepolia

1. Get test ETH from [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
2. Switch Metamask to Arbitrum Sepolia network
3. Deploy contract and interact with the dApp

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes for asset fetching
│   ├── page.tsx           # Main landing page
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── UploadForm.tsx     # Upload and minting UI
│   └── AssetGallery.tsx   # Asset browsing and purchasing
├── config/                # Configuration
│   └── wagmi.ts          # Web3 wallet configuration
├── contracts/             # Solidity smart contracts
│   └── MediaAssetNFT.sol # Main NFT contract
├── scripts/              # Deployment scripts
│   └── deploy.js         # Hardhat deployment script
└── hardhat.config.js     # Hardhat configuration
```

## 🔐 Security Notes

- Never commit your `.env` or `.env.local` files
- Keep your private keys secure
- Use testnet for development
- Audit smart contracts before mainnet deployment

## 🚢 Deployment

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_WEB3_STORAGE_TOKEN`

## 🤝 Contributing

This is a hackathon project! Feel free to fork and improve it.

## 📄 License

MIT License

## 🎉 Hackathon Features Checklist

- ✅ Frontend with Next.js
- ✅ Wallet connection (Metamask)
- ✅ File upload to IPFS (Web3.Storage)
- ✅ Smart contract for NFT minting
- ✅ Royalty system
- ✅ Collaborator support
- ✅ Asset gallery
- ✅ Purchase/use functionality
- ✅ Arbitrum Sepolia deployment
- ✅ Responsive UI

## 🔮 Future Enhancements

- Subgraph for better data querying
- Advanced search and filtering
- Preview player for audio/video
- Creator profiles and portfolios
- Secondary marketplace
- DAO for platform governance
- Cross-chain support
- Mobile app

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ for the blockchain community
