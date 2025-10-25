# 🔧 Fixing MetaMask Circuit Breaker Errors

## Problem
You see this error when trying to purchase or mint:
```
MetaMask - RPC Error: Execution prevented because the circuit breaker is open
```

## Why This Happens
- MetaMask is using a public RPC endpoint that is rate-limited or overloaded
- The "circuit breaker" is MetaMask's protection mechanism against failing RPCs
- This prevents your transactions from going through

## 🚀 Quick Fix (Automatic)

1. **Look for the yellow popup** in the bottom-right corner when you connect your wallet
2. **Click "Auto-Configure"** button
3. **Approve the network addition** in MetaMask popup
4. **Refresh the page**
5. **Try your transaction again**

## 🔧 Manual Fix (If Auto-Configure Fails)

### Step 1: Open MetaMask Settings
1. Click the **MetaMask extension**
2. Click the **network dropdown** (top-left, currently shows "Sepolia test network")
3. Click **"Add Network"** at the bottom

### Step 2: Add Alchemy RPC
Fill in these details:

| Field | Value |
|-------|-------|
| **Network Name** | Sepolia (Alchemy) |
| **RPC URL** | `https://eth-sepolia.g.alchemy.com/v2/gyb2g5dGCzm7HIsYfAHzW` |
| **Chain ID** | 11155111 |
| **Currency Symbol** | ETH |
| **Block Explorer URL** | https://sepolia.etherscan.io |

### Step 3: Switch to New Network
1. Click **"Save"**
2. Select **"Sepolia (Alchemy)"** from the network dropdown
3. **Refresh your browser**
4. **Reconnect your wallet** if needed

### Step 4: Test Transaction
1. Try uploading an asset or making a purchase
2. The error should be gone!

## ✅ How to Verify It's Working

After configuration, you should see:
- No more "circuit breaker" errors
- Faster transaction confirmations
- Smoother wallet interactions

## 📊 Benefits of Alchemy RPC

- **300M compute units/month** (free tier)
- **Dedicated infrastructure** - no rate limiting
- **Better uptime** than public RPCs
- **Faster response times**

## 🆘 Still Having Issues?

If you're still getting errors after following these steps:

1. **Clear MetaMask cache:**
   - Settings → Advanced → Clear activity tab data
   
2. **Restart browser completely**

3. **Check you have Sepolia ETH:**
   - Get free testnet ETH from: https://sepoliafaucet.com

4. **Contact support:**
   - Share the full error message from browser console (F12)
   - Include your wallet address (first and last 4 characters only)

## 🎯 For Other Networks

This guide is for **Sepolia testnet** only. For mainnet or other networks, the RPC URLs and Chain IDs will be different.

---

**Last Updated:** October 2025
