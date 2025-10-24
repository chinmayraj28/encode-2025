# 🔄 Redeployment Guide

## ⚠️ IMPORTANT: Contract Updated!

The smart contract has been updated to include **creator-set pricing**. You need to **redeploy** the contract before the new features will work.

---

## 📋 What Changed in the Contract

### New Features:
- ✅ `price` field in MediaAsset struct
- ✅ Creator sets price during upload
- ✅ Buyers pay exact price (no manual entry)
- ✅ Smart contract enforces price

---

## 🚀 Redeployment Steps

### **Step 1: Make Sure Hardhat Node is Running**

Check if your blockchain terminal is still running:
```bash
# Should see "Started HTTP and WebSocket JSON-RPC server at..."
```

If NOT running, restart it:
```bash
npx hardhat node
```

### **Step 2: Redeploy the Contract**

In a new terminal:
```bash
cd /Users/chinmayraj/Downloads/encode-2025
npx hardhat run scripts/deploy.js --network localhost
```

### **Step 3: Update Contract Address**

1. Copy the new contract address from the deployment output
2. Update `.env.local`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=<new_contract_address>
```

### **Step 4: Reset MetaMask (Important!)**

1. Open MetaMask
2. Click account icon → Settings
3. Advanced → Clear activity tab data
4. Confirm

This clears the old blockchain state.

### **Step 5: Restart Frontend**

```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

---

## ✅ Testing the New Pricing System

### **Test as Creator (Upload)**

1. Connect wallet
2. Fill in asset details
3. **Set price** (e.g., 0.01 ETH) ⭐
4. Upload asset
5. Verify asset shows in gallery

### **Test as Buyer (Purchase)**

1. Switch to different MetaMask account
2. Browse to asset detail page
3. **See price displayed** (no input field) ⭐
4. Click "Purchase for X ETH"
5. Confirm in MetaMask
6. Wait for decryption key
7. Download full file

---

## 🐛 Troubleshooting

### **Error: "Invalid block tag"**
```
Solution: Reset MetaMask (see Step 4 above)
```

### **Error: "Insufficient payment"**
```
Solution: This is expected! The contract now enforces the creator's price.
Make sure you're paying the exact amount shown.
```

### **Asset doesn't show price**
```
Solution: That asset was created with the old contract.
Upload a new asset to test the pricing feature.
```

### **Can't set price in upload form**
```
Solution: Make sure you restarted the dev server after redeployment.
Clear browser cache if needed.
```

---

## 📝 What to Expect

### **Old Assets (Before Redeployment)**
- Created with old contract
- Don't have price field
- Won't display correctly (may show errors)
- **Solution**: Upload new assets

### **New Assets (After Redeployment)**
- Have price set by creator
- Display price prominently
- One-click purchase at fixed price
- Professional marketplace experience

---

## 🎯 Quick Checklist

- [ ] Hardhat node running
- [ ] Contract redeployed
- [ ] New contract address in `.env.local`
- [ ] MetaMask cache cleared
- [ ] Frontend restarted
- [ ] Test upload with price
- [ ] Test purchase at fixed price
- [ ] Verify decryption works

---

## 💡 Remember

After redeployment:
- **Old contract data is gone** (local blockchain resets)
- **Upload new test assets** to see new features
- **Price field is required** when uploading
- **Buyers see fixed prices** (no manual entry)

Your marketplace now has **professional pricing** like OpenSea! 🎨💰
