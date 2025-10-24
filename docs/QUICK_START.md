# 🚀 Quick Start Guide - Running the Artist Blockchain Platform

## Prerequisites
- Node.js installed
- MetaMask browser extension

---

## Step-by-Step Setup

### 1️⃣ **Start the Local Blockchain** (Terminal 1)

Open your first terminal and run:

```bash
cd /Users/chinmayraj/Downloads/encode-2025
npx hardhat node
```

**What this does:**
- Starts a local Ethereum blockchain on `http://127.0.0.1:8545`
- Creates 20 test accounts, each with **10,000 ETH**
- Runs on **Chain ID 31337**
- Shows all transactions in real-time

**Keep this terminal running!** You'll see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

---

### 2️⃣ **Deploy the Smart Contract** (Terminal 2)

Open a **second terminal** and run:

```bash
cd /Users/chinmayraj/Downloads/encode-2025
npx hardhat run scripts/deploy.js --network localhost
```

**What this does:**
- Deploys the `MediaAssetNFT` contract to your local blockchain
- Returns a contract address like: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

**✅ Already done!** Your contract is deployed at:
```
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

---

### 3️⃣ **Start the Frontend** (Terminal 3)

Open a **third terminal** and run:

```bash
cd /Users/chinmayraj/Downloads/encode-2025
npm run dev
```

**What this does:**
- Starts Next.js development server
- Frontend available at `http://localhost:3000`
- Hot-reloads when you make code changes

**You'll see:**
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
✓ Ready in 2s
```

---

### 4️⃣ **Configure MetaMask**

#### Add Localhost Network:

1. Open MetaMask
2. Click network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:

```
Network Name:     Localhost 8545
RPC URL:          http://127.0.0.1:8545
Chain ID:         31337
Currency Symbol:  ETH
```

5. Click "Save"

#### Import Test Account:

1. In MetaMask, click account icon (top right)
2. Select "Import Account"
3. Paste this private key:
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
4. Click "Import"

**You now have 10,000 ETH for testing! 🎉**

---

### 5️⃣ **Use the Platform**

1. Go to `http://localhost:3000` in your browser
2. Click "Connect Wallet" (top right)
3. Select MetaMask
4. Make sure you're on "Localhost 8545" network
5. Approve the connection

**Now you can:**
- ✅ Upload media files (audio, visual, VFX, SFX)
- ✅ Mint NFTs on the blockchain
- ✅ View assets in the gallery
- ✅ Click assets to see IPFS previews
- ✅ Purchase/use assets with test ETH

---

## 📊 Your Running Setup

You should have **3 terminals open**:

| Terminal | Command | Port | Purpose |
|----------|---------|------|---------|
| **Terminal 1** | `npx hardhat node` | 8545 | Local blockchain |
| **Terminal 2** | *(closed after deploy)* | - | Contract deployment |
| **Terminal 3** | `npm run dev` | 3000 | Frontend server |

---

## 🔄 Daily Workflow

### Starting Everything:

```bash
# Terminal 1: Start blockchain
npx hardhat node

# Terminal 2: Deploy contract (if restarting blockchain)
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start frontend
npm run dev
```

### When You Restart the Blockchain:

**⚠️ Important:** If you stop `npx hardhat node` and restart it:

1. The blockchain resets (all data lost)
2. You'll get a **new contract address**
3. You need to:
   - Redeploy the contract
   - Update `.env.local` with new contract address
   - Restart frontend (`npm run dev`)
   - Reset MetaMask account (Settings → Advanced → Clear activity tab data)

---

## 🎯 Testing the Full Flow

### Upload an Asset:

1. Connect wallet at `http://localhost:3000`
2. Fill out the upload form:
   - **Media Type**: Choose one (audio, visual, vfx, sfx)
   - **File**: Upload your file
   - **Name**: "My First Asset"
   - **Description**: "Testing the platform"
   - **Royalty**: 10 (means 10%)
3. Click "Upload & Mint NFT"
4. Approve transaction in MetaMask
5. Wait for confirmation

**In Terminal 1 (blockchain), you'll see:**
```
eth_sendRawTransaction
Contract call: MediaAssetNFT#mintMediaAsset
```

### View Your Asset:

1. Asset appears in gallery automatically
2. Click on the asset card
3. You're taken to `/asset/0` (asset detail page)
4. See IPFS preview of your file
5. View all asset details

### Purchase an Asset:

1. On asset detail page, scroll to "Use This Asset"
2. Enter amount (e.g., 0.001 ETH)
3. Click "Purchase & Use Asset"
4. Approve in MetaMask
5. See success message

**Creator receives royalty automatically!**

---

## 🔍 Monitoring Your Blockchain

### Terminal 1 (Blockchain) shows:

- All transactions in real-time
- Contract function calls
- Gas usage
- Block numbers

Example output:
```
eth_sendRawTransaction
  Contract call:       MediaAssetNFT#mintMediaAsset
  Transaction:         0x123abc...
  From:                0xf39fd6...
  To:                  0xe7f172...
  Value:               0 ETH
  Gas used:            150000
  Block #3:            0x456def...
```

### Terminal 3 (Frontend) shows:

- Page requests
- API calls
- Compilation status
- Errors/warnings

Example output:
```
GET / 200 in 50ms
GET /api/asset/0 200 in 87ms
```

---

## 📁 Important Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `.env.local` | Frontend config (contract address, Pinata) | After redeploying contract |
| `.env` | Blockchain config (private key) | Never (already set) |
| `hardhat.config.js` | Network settings | Rarely (already configured) |
| `contracts/MediaAssetNFT.sol` | Smart contract code | When adding features |

---

## 🐛 Troubleshooting

### "Contract not deployed" error?
- Make sure blockchain is running (`npx hardhat node`)
- Redeploy: `npx hardhat run scripts/deploy.js --network localhost`
- Update `.env.local` with new contract address
- Restart frontend

### Can't connect wallet?
- Make sure MetaMask is on "Localhost 8545" network
- Chain ID must be **31337** (not 1337)
- Try refreshing the page

### Assets not showing?
- Check Terminal 1 - is blockchain running?
- Check Terminal 3 - any errors?
- Make sure you've minted at least one asset
- Try refreshing the page

### Transaction fails?
- Make sure you're connected to localhost network
- Make sure you have test ETH
- Check blockchain terminal for errors

### Need to reset everything?
1. Stop all terminals (Ctrl+C)
2. Restart blockchain: `npx hardhat node`
3. Redeploy contract
4. Update `.env.local`
5. Clear MetaMask activity (Settings → Advanced → Clear activity tab data)
6. Restart frontend

---

## 💡 Pro Tips

### Keep Your Blockchain Data:
- Don't stop Terminal 1 unless you want to reset
- Blockchain data is in-memory, stopping loses everything

### Test Multiple Accounts:
- Import multiple test accounts from Terminal 1 output
- Each has 10,000 ETH
- Test creator/buyer interactions

### Watch Your Terminals:
- Terminal 1 shows blockchain activity
- Terminal 3 shows frontend logs
- Both helpful for debugging

### File Upload Tips:
- Supported: images, audio, video
- IPFS upload via Pinata is automatic
- Preview works for most media types

---

## ✅ Checklist - Am I Set Up Correctly?

- [ ] Terminal 1 running `npx hardhat node` (port 8545)
- [ ] Terminal 3 running `npm run dev` (port 3000)
- [ ] MetaMask connected to "Localhost 8545" (Chain ID 31337)
- [ ] Test account imported (10,000 ETH showing)
- [ ] Can access `http://localhost:3000`
- [ ] Can connect wallet on the website
- [ ] Contract address in `.env.local` matches deployed contract

**If all checked ✅ - You're ready to go! 🎉**

---

## 🎬 Quick Command Reference

```bash
# Start blockchain (keep running)
npx hardhat node

# Deploy contract (run once when blockchain starts)
npx hardhat run scripts/deploy.js --network localhost

# Start frontend (keep running)
npm run dev

# Compile contract (after code changes)
npx hardhat compile

# Run tests (if you write tests)
npx hardhat test
```

---

## 📚 What's Next?

- Upload different media types (audio, visual, VFX, SFX)
- Test the purchase flow
- Click assets to see IPFS previews
- Monitor transactions in Terminal 1
- Experiment with royalty percentages

**Need help?** Check the blockchain terminal (Terminal 1) for transaction details!

---

**Current Setup Status:**
- ✅ Blockchain: Can be started anytime
- ✅ Contract: Deployed at `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- ✅ Frontend: Configured and ready
- ✅ MetaMask: Just needs network + account import

**You're all set! Just start the blockchain and frontend, then go! 🚀**
