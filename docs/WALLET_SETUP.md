# 🦊 Setting Up Your Wallet for the Hackathon

## Option 1: MetaMask (Recommended - 5 minutes)

### Step 1: Install MetaMask

1. Go to https://metamask.io
2. Click **Download** → Choose your browser
3. Install the browser extension
4. Click the MetaMask icon in your browser

### Step 2: Create a New Wallet

1. Click **Create a new wallet**
2. Click **I agree** to terms
3. **IMPORTANT**: Write down your **Secret Recovery Phrase** (12 words)
   - Store it somewhere safe
   - Never share it with anyone
   - You'll need it to recover your wallet
4. Confirm the phrase by selecting words in order
5. Create a password for quick access

### Step 3: Add Arbitrum Sepolia Network

MetaMask might not have Arbitrum Sepolia by default. Add it:

1. Click MetaMask extension
2. Click the network dropdown (top left, says "Ethereum Mainnet")
3. Click **Add Network** or **Add a network manually**
4. Fill in these details:

```
Network Name: Arbitrum Sepolia
RPC URL: https://sepolia-rollup.arbitrum.io/rpc
Chain ID: 421614
Currency Symbol: ETH
Block Explorer: https://sepolia.arbiscan.io
```

5. Click **Save**
6. Switch to **Arbitrum Sepolia** network

### Step 4: Get Your Wallet Address

1. Click MetaMask extension
2. Your address is at the top (starts with 0x...)
3. Click to copy it
4. Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### Step 5: Get Free Test ETH

1. Go to https://faucet.quicknode.com/arbitrum/sepolia
2. Paste your wallet address
3. Complete the CAPTCHA
4. Click **Request**
5. Wait 30-60 seconds
6. Check MetaMask - you should have ~0.1 test ETH!

**Alternative Faucets** (if first one doesn't work):
- https://www.alchemy.com/faucets/arbitrum-sepolia
- https://www.l2faucet.com/arbitrum (requires Twitter account)

### Step 6: Get Your Private Key (for deployment)

⚠️ **SECURITY WARNING**: Only do this with your TEST wallet, NEVER with real funds!

1. Click MetaMask extension
2. Click the three dots (•••) → **Account details**
3. Click **Show private key**
4. Enter your MetaMask password
5. **Copy the private key**
6. Add it to your `.env` file:

```bash
PRIVATE_KEY=your_private_key_here
```

🔒 **Never commit .env to git! It's already in .gitignore**

---

## Option 2: Use a Test Wallet Generator (Quick & Dirty)

If you just want to deploy quickly for testing:

1. Go to https://vanity-eth.tk
2. Click **Generate**
3. Copy the **Private Key**
4. Copy the **Address**
5. Add private key to `.env`
6. Use the address to get test ETH from faucet

⚠️ **Don't use this for anything real - it's just for hackathons!**

---

## ✅ Verification Checklist

- [ ] MetaMask installed
- [ ] New wallet created
- [ ] Secret phrase written down (SAFELY!)
- [ ] Arbitrum Sepolia network added
- [ ] Switched to Arbitrum Sepolia network
- [ ] Got test ETH from faucet (balance shows in MetaMask)
- [ ] Private key copied to `.env` file

---

## 🚀 Next Steps

Once you have test ETH:

```bash
# 1. Compile the smart contract
npm run compile

# 2. Deploy to Arbitrum Sepolia
npm run deploy:testnet
```

You'll see output like:
```
MediaAssetNFT deployed to: 0x1234567890abcdef...
```

Copy that address and add to `.env.local`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef...
```

Then run the app:
```bash
npm run dev
```

---

## 🐛 Troubleshooting

### "Insufficient funds for gas"
- Make sure you're on Arbitrum Sepolia network
- Check you have test ETH in MetaMask
- Try getting more from another faucet

### "Nonce too high"
- In MetaMask: Settings → Advanced → Clear activity tab data

### "Network not found"
- Double-check the Chain ID is `421614`
- Try removing and re-adding the network

### Faucet not working
- Some faucets require social media verification
- Try multiple faucets listed above
- Wait a few minutes between requests

---

## 💡 Pro Tips

1. **Create a separate wallet for hackathons** - Don't mix with real funds
2. **Keep your secret phrase offline** - Write it on paper, don't save digitally
3. **Use testnet networks** - Always double-check you're on Sepolia, not mainnet
4. **Save some test ETH** - You'll need it for multiple transactions

---

## 📞 Quick Help

**Can't get test ETH?**
- Try different faucets
- Check you copied the address correctly
- Make sure you're on the right network

**Lost your private key?**
- If you have the secret phrase, you can recover it
- MetaMask → Account details → Show private key

**Want to start over?**
- Create a new MetaMask account
- Get fresh test ETH

---

Ready to deploy! 🚀
