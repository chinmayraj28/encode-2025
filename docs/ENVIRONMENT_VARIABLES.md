# 🔐 Environment Variables Guide

## Important Security Notice

⚠️ **Your `.env.local` file is NOT pushed to GitHub** (it's in `.gitignore`)

This is intentional to protect your secrets!

## What's in Your Local `.env.local`

Your local `.env.local` file contains:

1. **Contract Address**: `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - This is the deployed smart contract address on your local blockchain
   - Changes each time you restart the blockchain and redeploy
   - Safe to share (it's a public blockchain address)

2. **Pinata JWT**: `NEXT_PUBLIC_PINATA_JWT` ⚠️ **SECRET**
   - This is your personal Pinata API key
   - Gives access to upload files to YOUR Pinata account
   - **NEVER** share this or commit it to GitHub
   - Anyone with this key can upload to your IPFS storage

3. **Pinata Gateway**: `NEXT_PUBLIC_PINATA_GATEWAY`
   - Public gateway URL for fetching IPFS files
   - Safe to share (it's public)

## Why Only Pinata Credentials Are Used

**Currently Active:**
- ✅ Pinata JWT - Used to upload files to IPFS
- ✅ Pinata Gateway - Used to fetch/display files from IPFS

**Not Currently Active:**
- ❌ Contract deployed to testnet (we're using localhost)
- ❌ Testnet RPC URLs (using local Hardhat node)

The `.env` file in the root (also ignored by git) contains:
- Deployer wallet private key for testnet (not used on localhost)

## For New Team Members / Cloning the Repo

If someone clones your GitHub repo, they need to:

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get their own Pinata credentials:**
   - Go to https://app.pinata.cloud/
   - Sign up / Log in
   - Get API key (JWT)
   - Replace `your_pinata_jwt_here` in `.env.local`

3. **Deploy the contract locally:**
   ```bash
   npx hardhat node        # Terminal 1
   npx hardhat run scripts/deploy.js --network localhost  # Terminal 2
   ```
   - Copy the contract address
   - Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

## What's Safe to Share

✅ **Safe to commit/share:**
- `.env.example` (template with placeholders)
- Contract addresses (they're public on blockchain)
- Network configurations (RPC URLs, Chain IDs)
- Gateway URLs (they're public)

❌ **NEVER commit/share:**
- `.env.local` (contains your secrets)
- `.env` (contains private keys)
- Pinata JWT tokens
- Private keys
- API secrets

## Current Setup

Your project is configured for **local development**:
- Blockchain: Local Hardhat node (http://127.0.0.1:8545)
- IPFS: Pinata cloud service
- Contract: Deployed locally (resets when blockchain restarts)

## For Production Deployment

When deploying to a real testnet/mainnet, you'll need:
- Testnet/mainnet RPC URL (e.g., Alchemy, Infura)
- Different contract address (from testnet/mainnet deployment)
- Same Pinata credentials (or separate production account)

---

**Remember:** Your `.env.local` stays on your machine only! 🔒
