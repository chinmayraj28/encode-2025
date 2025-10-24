# 🚀 Quick Setup Guide

Follow these steps to get your Artist Blockchain Platform running!

## ✅ Step 1: Get Your API Keys

### 1. Pinata API Key (for IPFS)
1. Go to https://pinata.cloud
2. Sign up for a free account (gets you 1GB storage)
3. Go to **API Keys** in the sidebar
4. Click **New Key** → Select **Admin** access
5. Give it a name like "Artist Platform"
6. Copy your **JWT** (this is your API key)
7. Copy your **Gateway Domain** (looks like `gateway.pinata.cloud` or custom domain)

### 2. WalletConnect Project ID
1. Go to https://cloud.walletconnect.com
2. Create a free account
3. Create a new project
4. Copy your Project ID

### 3. Get Test ETH
1. Go to https://faucet.quicknode.com/arbitrum/sepolia
2. Enter your wallet address
3. Claim free Arbitrum Sepolia ETH

## ✅ Step 2: Configure Environment

### Create `.env` file (for smart contract deployment):
```bash
PRIVATE_KEY=your_metamask_private_key_here
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
```

⚠️ **How to get your private key from Metamask:**
1. Open Metamask
2. Click the 3 dots → Account Details
3. Click "Show Private Key"
4. Enter your password and copy

## ✅ Step 3: Deploy Smart Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

You'll see output like:
```
MediaAssetNFT deployed to: 0x1234567890abcdef...
```

**Copy this contract address!**

## ✅ Step 4: Configure Frontend

### Create `.env.local` file:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

**Note:** If you have a custom Pinata gateway domain, use that instead of `gateway.pinata.cloud`

### Update WalletConnect Project ID
Open `config/wagmi.ts` and replace:
```typescript
projectId: 'YOUR_WALLETCONNECT_PROJECT_ID'
```
with your actual Project ID.

## ✅ Step 5: Run the App!

```bash
npm run dev
```

Open http://localhost:3000 🎉

## 🎨 How to Use

1. **Connect Wallet** - Click "Connect Wallet" and select Metamask
2. **Upload Asset** - Fill in the form with your media details
3. **Set Royalty** - Choose how much you earn when others use your asset
4. **Add Collaborators** (optional) - Add wallet addresses and split %
5. **Upload & Mint** - Your file goes to IPFS and NFT is minted!
6. **Browse Gallery** - See all assets and purchase usage rights

## 🐛 Troubleshooting

### "Contract not deployed" error
- Make sure you deployed the contract and copied the address to `.env.local`
- Restart the dev server: `Ctrl+C` then `npm run dev`

### "Insufficient funds" error
- Get more test ETH from the faucet
- Make sure you're on Arbitrum Sepolia network in Metamask

### "Transaction failed" error
- Check you have enough ETH for gas
- Make sure your wallet is connected
- Try increasing gas limit in Metamask

## 🎯 Demo Flow for Hackathon

1. **Show the Problem**: Traditional platforms take high fees, no ownership proof
2. **Connect Wallet**: Demonstrate wallet connection
3. **Upload Demo Asset**: Upload a sample audio/visual file
4. **Show IPFS Storage**: Open the Pinata IPFS link to show decentralized storage
5. **View on Blockchain**: Check transaction on Arbiscan
6. **Purchase Flow**: Demonstrate buying/using an asset
7. **Show Royalty Payment**: Show how creator gets paid automatically
8. **Collaboration Demo**: Upload with multiple collaborators

## 📊 Key Talking Points

- ✅ **True Ownership**: Cryptographic proof on blockchain
- ✅ **No Middlemen**: Smart contracts handle payments automatically
- ✅ **Decentralized**: Files on IPFS, not centralized servers
- ✅ **Transparent**: All transactions visible on-chain
- ✅ **Collaboration-Friendly**: Built-in revenue splitting
- ✅ **Low Fees**: Arbitrum's L2 = cheap transactions

## 🚢 Deploy to Production

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Smart Contract (Mainnet)
Update `hardhat.config.js` with Arbitrum mainnet RPC and deploy:
```bash
npx hardhat run scripts/deploy.js --network arbitrum
```

⚠️ **Get contract audited before mainnet deployment!**

## 📝 Next Steps for Hackathon

- [ ] Deploy contract to testnet
- [ ] Test upload flow
- [ ] Test purchase flow
- [ ] Prepare demo script
- [ ] Take screenshots for presentation
- [ ] Deploy frontend to Vercel
- [ ] Create demo video (optional)

Good luck! 🚀
