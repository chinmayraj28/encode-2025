# 🎨 Artist Blockchain Platform

A decentralized platform for artists to upload, own, and monetize their audio, visual, VFX, and SFX assets on the blockchain.

## 🌟 Features

- **True Ownership**: Cryptographically signed uploads with permanent proof of authorship
- **Automatic Royalties**: Smart contracts automatically distribute revenue when assets are used
- **Collaboration**: Support for multiple collaborators with automatic revenue splitting
- **Decentralized Storage**: Files stored on IPFS via Web3.Storage
- **NFT Minting**: Each asset is minted as an NFT on Arbitrum testnet
- **Transparent Revenue**: All usage and payments tracked on-chain

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (React) hosted on Vercel
- **Storage**: Pinata (IPFS)
- **Blockchain**: Solidity smart contracts on Arbitrum Sepolia testnet
- **Wallet**: Metamask integration via RainbowKit & Wagmi
- **Styling**: Tailwind CSS

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Metamask** wallet
3. **Arbitrum Sepolia ETH** (get from [faucet](https://faucet.quicknode.com/arbitrum/sepolia))
4. **Pinata API Key** (get free account at [pinata.cloud](https://pinata.cloud))
5. **WalletConnect Project ID** (get from [cloud.walletconnect.com](https://cloud.walletconnect.com))

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
