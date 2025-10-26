# 🎯 Quick Start Guide - Openfort Payment Gateway

## New Features Overview

### 1. **Connect Wallet Button**
```
┌─────────────────────────┐
│   Connect Wallet   🔗   │  ← Click to open Openfort modal
└─────────────────────────┘
```

**What happens:**
- Opens Openfort authentication modal
- Choose Google or Wallet connection
- Creates/connects embedded wallet

---

### 2. **Network Selector** (After connecting)
```
┌──────────────────────────┬─────────────────────────────┐
│  🟢 Hardhat Local    ▼  │  💰 0.1234 ETH              │
└──────────────────────────┴──────────────0xAb...cd12  ▼─┘
                           └─ Click to expand dropdown ─┘
```

**Dropdown shows:**
```
┌────────────────────────────┐
│  Select Network            │
├────────────────────────────┤
│  🟢 Hardhat Local       ✓  │ ← Current network
│     Chain ID: 31337        │
├────────────────────────────┤
│  🔵 Arbitrum Sepolia       │
│     Chain ID: 421614       │
└────────────────────────────┘
```

---

### 3. **Wallet Info Dropdown**
```
┌──────────────────────────────────────────┐
│  Wallet Address                          │
│  ┌────────────────────────────┐  📋     │ ← Copy button
│  │ 0xAbc123...def456          │         │
│  └────────────────────────────┘         │
│  ✓ Copied to clipboard!                 │
├──────────────────────────────────────────┤
│  Balance                                 │
│  5700.0000 ETH                           │
├──────────────────────────────────────────┤
│  🔴 Disconnect                           │
└──────────────────────────────────────────┘
```

---

## Payment Flow Diagram

### **Minting NFT (Upload)**
```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│   Upload    │───▶│  Encrypt &   │───▶│  Upload to    │
│    File     │    │  Generate    │    │     IPFS      │
│             │    │  Preview     │    │               │
└─────────────┘    └──────────────┘    └───────────────┘
                                               │
                                               ▼
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│   NFT       │◀───│  Sign with   │◀───│  Encode       │
│  Minted!    │    │  Openfort    │    │  Contract     │
│             │    │  Wallet      │    │  Call         │
└─────────────┘    └──────────────┘    └───────────────┘
```

### **Purchasing Asset**
```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│   Browse    │───▶│  Click       │───▶│  Approve      │
│   Gallery   │    │  "Purchase"  │    │  Payment      │
│             │    │              │    │  (Openfort)   │
└─────────────┘    └──────────────┘    └───────────────┘
                                               │
                                               ▼
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│  Download   │◀───│  Decryption  │◀───│  Smart        │
│  Full File  │    │  Key         │    │  Contract     │
│             │    │  Received    │    │  Splits $     │
└─────────────┘    └──────────────┘    └───────────────┘
```

---

## Setup Steps

### 1. **Environment Variables**
Create/update `.env.local`:
```bash
# Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Pinata IPFS
NEXT_PUBLIC_PINATA_JWT=eyJhbGci...
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud

# Openfort
NEXT_PUBLIC_OPENFORT_PUBLISHABLE_KEY=pk_test_28fe81e1-40e5-5d35-ba6c-21192830fd93
NEXT_PUBLIC_SHIELD_PUBLISHABLE_KEY=cb7b2cd2-13a0-4259-ad32-3e7558c8f58e
```

### 2. **Start Hardhat Node**
```bash
# Terminal 1
npx hardhat node
```
Keep this running!

### 3. **Deploy Contract**
```bash
# Terminal 2
npx hardhat run scripts/deploy.js --network localhost

# Output will show:
# MediaAssetNFT deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

Copy the address and update `.env.local`

### 4. **Fund Test Wallet**
```bash
# Terminal 3 - Open Hardhat console
npx hardhat console --network localhost

# In console:
const signers = await ethers.getSigners();
await signers[0].sendTransaction({
  to: "0xYOUR_WALLET_ADDRESS",
  value: ethers.utils.parseEther("5600")
});
```

### 5. **Start Next.js**
```bash
# Terminal 2
npm run dev
```

Open http://localhost:3000

---

## Usage Examples

### Example 1: Connect with Google
```
1. Click "Connect Wallet"
2. Choose "Continue with Google"
3. Sign in with Google account
4. Openfort creates embedded wallet
5. ✅ Connected!
```

### Example 2: Switch Networks
```
1. Click network button (shows "🟢 Hardhat Local")
2. Click "🔵 Arbitrum Sepolia"
3. Wallet switches network
4. Balance updates to new network
```

### Example 3: Copy Address
```
1. Click wallet balance/address
2. Click 📋 copy icon
3. See "✓ Copied to clipboard!"
4. Paste anywhere: 0xAbc123...def456
```

### Example 4: Upload Asset
```
1. Fill form:
   - Title: "Chill Lofi Beat"
   - File: beat.mp3
   - Price: 0.5 ETH
2. Click "🚀 Upload & Mint NFT"
3. Approve transaction in Openfort popup
4. Wait for confirmation
5. ✅ Asset appears in gallery!
```

### Example 5: Purchase Asset
```
1. Click asset in gallery
2. Listen to watermarked preview
3. Click "Purchase for 0.5 ETH"
4. Approve payment transaction
5. Wait for decryption key
6. Download full-quality file
7. ✅ Your purchase!
```

---

## Troubleshooting

### Issue: "Insufficient funds"
**Solution:**
- Check you're on correct network (Hardhat Local)
- Fund your wallet using Hardhat console
- Verify balance shows in wallet dropdown

### Issue: "Transaction failed"
**Solution:**
- Ensure Hardhat node is running
- Check contract address matches deployed contract
- Try switching network back and forth

### Issue: "Cannot connect wallet"
**Solution:**
- Check `.env.local` has Openfort keys
- Restart dev server: `npm run dev`
- Clear browser cache

### Issue: "Network not showing"
**Solution:**
- Add Hardhat network to MetaMask:
  - Network: Hardhat Local
  - RPC: http://127.0.0.1:8545
  - Chain ID: 31337

---

## Feature Comparison

| Feature | RainbowKit (Old) | Openfort (New) |
|---------|------------------|----------------|
| Google Login | ❌ | ✅ |
| Network Selector | Basic | ✅ Enhanced with dropdown |
| Copy Address | ❌ | ✅ One-click copy |
| Balance Display | Basic | ✅ Real-time per network |
| Payment Gateway | Basic | ✅ Enhanced with useSendTransaction |
| Embedded Wallets | ❌ | ✅ Openfort Shield |
| Mobile Support | Limited | ✅ Full support |
| Account Abstraction | ❌ | ✅ Smart accounts |

---

## Testing Checklist

- [ ] Connect with Google ✓
- [ ] Connect with MetaMask ✓
- [ ] Switch to Hardhat Local ✓
- [ ] Switch to Arbitrum Sepolia ✓
- [ ] Copy wallet address ✓
- [ ] Check balance updates ✓
- [ ] Upload and mint NFT ✓
- [ ] Purchase NFT ✓
- [ ] Receive decryption key ✓
- [ ] Download full file ✓
- [ ] Test collaborator splits ✓
- [ ] Disconnect wallet ✓

---

## Next Steps

1. **Add More Networks**
   - Edit `config/wagmi.ts`
   - Add chain definitions
   - Update transports

2. **Enable Gasless Transactions**
   - Set up Openfort policy in dashboard
   - Configure gas sponsorship
   - Update transaction calls

3. **Add Fiat On-Ramp**
   - Integrate Stripe
   - Add card payment option
   - Convert USD → ETH

4. **Deploy to Testnet**
   ```bash
   npx hardhat run scripts/deploy.js --network arbitrumSepolia
   ```

---

**Ready to build? Start with:** `npm run dev` 🚀
