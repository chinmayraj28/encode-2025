# 💰 Creator-Set Pricing System

## Overview

Your NFT marketplace now uses a **creator-controlled pricing model** where sellers set their own prices when uploading assets, and buyers pay exactly that amount to purchase.

---

## 🎯 How It Works

### **Creator Flow (Upload & Set Price)**

```
1. Creator selects file
2. Enters title, description, media type
3. **Sets price in ETH** ⭐
4. Sets royalty percentage
5. (Optional) Adds collaborators
6. Uploads asset
   ↓
File encrypted → Uploaded to IPFS
   ↓
Price stored in smart contract
   ↓
Asset listed in marketplace
```

### **Buyer Flow (Pay Fixed Price)**

```
1. Buyer browses gallery
2. Clicks on asset
3. Views preview + **sees creator's price**
4. Clicks "Purchase for X ETH"
   ↓
MetaMask shows exact price
   ↓
No manual price entry needed!
   ↓
Payment sent to smart contract
   ↓
Royalties distributed automatically
   ↓
Decryption key released to buyer
```

---

## 💎 Smart Contract Changes

### **MediaAsset Struct** (Updated)

```solidity
struct MediaAsset {
    string ipfsHash;          // Encrypted file
    string previewHash;       // Preview file
    string mediaType;         // audio/visual/vfx/sfx
    uint256 uploadTimestamp;
    address creator;
    uint256 price;            // ⭐ NEW: Price in wei
    uint256 royaltyPercentage;
    uint256 usageCount;
    uint256 totalRevenue;
}
```

### **mintMediaAsset()** (Updated)

```solidity
function mintMediaAsset(
    string memory ipfsHash,
    string memory previewHash,
    string memory mediaType,
    string memory tokenURI,
    uint256 price,            // ⭐ NEW: Creator sets price
    uint256 royaltyPercentage,
    string memory encryptionKey,
    Collaborator[] memory _collaborators
) public returns (uint256)
```

**What Changed:**
- Added `price` parameter
- Price is stored in `mediaAssets[tokenId].price`
- Price is in wei (not ETH) for precision

### **useAsset()** (Updated)

```solidity
function useAsset(uint256 tokenId) public payable returns (string memory) {
    require(_ownerOf(tokenId) != address(0), "Asset does not exist");
    MediaAsset storage asset = mediaAssets[tokenId];
    require(msg.value >= asset.price, "Insufficient payment"); // ⭐ Checks price
    
    // ... rest of function
}
```

**What Changed:**
- Now checks `msg.value >= asset.price`
- Before: Accepted any payment amount > 0
- After: Enforces creator's price

---

## 🎨 Upload Form Changes

### **New Price Input Field**

```tsx
{/* Price */}
<div>
  <label className="block text-sm font-medium mb-2">Price (ETH) *</label>
  <input
    type="number"
    step="0.001"
    min="0.001"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
    className="..."
    placeholder="0.01"
    required
  />
  <p className="text-xs text-gray-400 mt-1">
    How much buyers pay to access your full asset
  </p>
</div>
```

**Features:**
- Required field (creators must set price)
- Minimum: 0.001 ETH
- Step: 0.001 ETH (1 finney)
- Default: 0.01 ETH
- Clear explanation below input

### **Contract Call** (Updated)

```tsx
writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'mintMediaAsset',
  args: [
    fileCID,
    previewCID,
    mediaType,
    tokenURI,
    parseEther(price),           // ⭐ Convert ETH to wei
    BigInt(royaltyPercentage * 100),
    encryptionKey,
    contractCollaborators,
  ],
});
```

**What Changed:**
- Added `parseEther(price)` argument
- Converts ETH string to wei BigInt
- Passed to smart contract

---

## 🛒 Asset Detail Page Changes

### **Before (Manual Price Entry)**

```tsx
// ❌ OLD: Buyers entered their own amount
<input
  type="number"
  value={paymentAmount}
  onChange={(e) => setPaymentAmount(e.target.value)}
  placeholder="0.001"
/>
<button onClick={handlePurchase}>
  Purchase & Get Decryption Key
</button>
```

**Problems:**
- Confusing for buyers
- No standard pricing
- Buyers might underpay
- No price discovery

### **After (Fixed Price Display)**

```tsx
// ✅ NEW: Shows creator's price, no input needed
<div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
  <p className="text-purple-400 font-semibold mb-2">💰 Purchase Price</p>
  <p className="text-3xl font-bold text-white">{formatEther(asset.price)} ETH</p>
  <p className="text-sm text-gray-400 mt-2">
    Set by creator • Includes {Number(asset.royaltyPercentage) / 100}% royalty
  </p>
</div>

<button onClick={handleUseAsset}>
  🚀 Purchase for {formatEther(asset.price)} ETH
</button>
```

**Benefits:**
- Clear pricing upfront
- No confusion about amount
- Professional marketplace feel
- Price discovery enabled

### **Purchase Function** (Updated)

```tsx
// ❌ OLD: Used manual input
const handleUseAsset = () => {
  writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'useAsset',
    args: [BigInt(asset.tokenId)],
    value: parseEther(paymentAmount), // Manual input
  });
};

// ✅ NEW: Uses asset's price
const handleUseAsset = () => {
  writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'useAsset',
    args: [BigInt(asset.tokenId)],
    value: asset.price, // From smart contract
  });
};
```

---

## 📊 UI Comparison

### **Asset Details Card**

**Before:**
```
Creator: 0xabcd...1234
Royalty Fee: 5%
Total Uses: 3
Total Revenue: 0.015 ETH
```

**After:**
```
Creator: 0xabcd...1234
Price: 0.01 ETH          ⭐ NEW
Royalty Fee: 5%
Total Uses: 3
Total Revenue: 0.015 ETH
```

### **Purchase Section**

**Before:**
```
┌────────────────────────────────────────┐
│ Purchase This Asset                    │
├────────────────────────────────────────┤
│ Payment Amount (ETH)                   │
│ [0.001_______________]                 │
│                                        │
│ [Purchase & Get Decryption Key]        │
└────────────────────────────────────────┘
```

**After:**
```
┌────────────────────────────────────────┐
│ Purchase This Asset                    │
├────────────────────────────────────────┤
│ 💰 Purchase Price                      │
│     0.01 ETH                           │
│ Set by creator • Includes 5% royalty   │
│                                        │
│ 🔒 File Protection                     │
│ AES-256 encrypted...                   │
│                                        │
│ [🚀 Purchase for 0.01 ETH]             │
└────────────────────────────────────────┘
```

---

## 💡 Pricing Strategy for Creators

### **How to Price Your Assets**

#### **Audio (Music/Beats)**
- **Demo/Sample**: 0.001 - 0.005 ETH
- **Full Beat**: 0.01 - 0.05 ETH
- **Exclusive Beat**: 0.1 - 0.5 ETH
- **Full Song**: 0.05 - 0.2 ETH

#### **Visual (Images/Art)**
- **Low res/Simple**: 0.005 - 0.01 ETH
- **High res/Detailed**: 0.01 - 0.05 ETH
- **Professional/Complex**: 0.05 - 0.2 ETH
- **Exclusive/1-of-1**: 0.2 - 1+ ETH

#### **Video/VFX**
- **Short clip**: 0.01 - 0.05 ETH
- **Stock footage**: 0.05 - 0.1 ETH
- **Motion graphics**: 0.1 - 0.3 ETH
- **Custom VFX**: 0.3 - 1+ ETH

#### **SFX (Sound Effects)**
- **Single effect**: 0.001 - 0.005 ETH
- **Effect pack (5-10)**: 0.01 - 0.03 ETH
- **Professional pack**: 0.05 - 0.1 ETH

### **Pricing Factors to Consider**

1. **Quality** ⭐⭐⭐
   - Higher quality = higher price
   - Professional production = premium pricing

2. **Uniqueness** 🎨
   - Generic/stock = lower price
   - Exclusive/custom = higher price

3. **Usage Rights** 📜
   - Personal use only = lower price
   - Commercial license = higher price

4. **Market Research** 📊
   - Check similar assets on platform
   - Price competitively

5. **Your Goals** 🎯
   - Quick sales = lower price
   - Building reputation = competitive pricing
   - Premium branding = higher price

---

## 🔐 Security & Validation

### **Smart Contract Validation**

```solidity
require(msg.value >= asset.price, "Insufficient payment");
```

- Buyer MUST send at least the price
- Can send more (extra goes to creator)
- Cannot send less (transaction reverts)

### **Frontend Validation**

```tsx
// Upload form validates price input
min="0.001"  // Minimum 0.001 ETH (1 finney)
step="0.001" // Increment by 1 finney
required     // Must set a price
```

- Creators can't leave price empty
- Minimum prevents free assets (unless intentional)
- Clear steps for easy pricing

---

## 📈 Benefits of Creator-Set Pricing

### **For Creators**
✅ Full control over pricing  
✅ Can adjust pricing strategy  
✅ Price reflects quality/effort  
✅ Professional marketplace feel  
✅ No price negotiation needed

### **For Buyers**
✅ Clear pricing upfront  
✅ No guessing what to pay  
✅ Fair, consistent prices  
✅ Easy price comparison  
✅ Professional purchasing experience

### **For Platform**
✅ Standard e-commerce model  
✅ Better user experience  
✅ Easier to build features (sorting by price, etc.)  
✅ More professional appearance  
✅ Attracts serious creators/buyers

---

## 🚀 Future Enhancements

### **Dynamic Pricing**
```solidity
// Allow creators to update price after minting
function updatePrice(uint256 tokenId, uint256 newPrice) public {
    require(msg.sender == mediaAssets[tokenId].creator, "Not creator");
    mediaAssets[tokenId].price = newPrice;
    emit PriceUpdated(tokenId, newPrice);
}
```

### **Discounts & Sales**
```solidity
// Temporary price reductions
mapping(uint256 => uint256) public salePrice;
mapping(uint256 => uint256) public saleEndTime;
```

### **Tiered Pricing**
```solidity
// Different prices for different licenses
struct PriceTiers {
    uint256 personalUse;
    uint256 commercialUse;
    uint256 exclusiveRights;
}
```

### **Bundle Pricing**
```solidity
// Buy multiple assets at discount
function buyBundle(uint256[] memory tokenIds) public payable {
    uint256 totalPrice = calculateBundlePrice(tokenIds);
    require(msg.value >= totalPrice, "Insufficient payment");
    // ...
}
```

### **Auction System**
```solidity
// Allow bidding on assets
struct Auction {
    uint256 startPrice;
    uint256 currentBid;
    address highestBidder;
    uint256 endTime;
}
```

---

## 🎯 Summary

### **What Changed:**
| Component | Before | After |
|-----------|--------|-------|
| **Upload** | No price field | ✅ Creator sets price |
| **Contract** | Any payment accepted | ✅ Enforces creator's price |
| **Purchase** | Buyer enters amount | ✅ Fixed price shown |
| **UI** | Manual input | ✅ Professional display |

### **Result:**
✅ **Professional marketplace** with standard pricing  
✅ **Clear expectations** for buyers  
✅ **Full control** for creators  
✅ **Better UX** for everyone  

Your marketplace now works like **OpenSea, AudioJungle, or any professional marketplace** - sellers set prices, buyers pay them! 🎨💰
