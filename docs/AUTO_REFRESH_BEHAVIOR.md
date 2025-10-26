# Auto-Refresh Behavior Explanation

## Why Newly Uploaded Assets Don't Appear Immediately

When you upload a new asset to the blockchain, there's a **multi-step process** before it appears in the gallery:

### The Upload Flow

```
1. Upload files to IPFS
   ↓
2. Mint NFT on blockchain (transaction)
   ↓
3. Wait for transaction confirmation
   ↓
4. Envio indexer detects event
   ↓
5. Envio processes and stores data
   ↓
6. Gallery queries Envio API
   ↓
7. Asset appears in gallery
```

### Timing Details

**Steps 1-3**: Instant to ~15 seconds (IPFS upload + transaction)
**Steps 4-5**: 1-5 seconds (Envio is very fast, usually 2-3 seconds)
**Step 6**: Depends on gallery refresh

## Auto-Refresh Mechanisms

The gallery has **three** automatic refresh mechanisms:

### 1. ⏱️ Periodic Auto-Refresh (10 seconds)
```typescript
// Runs every 10 seconds in the background
const interval = setInterval(() => {
  refetch();
}, 10000);
```
- **When**: Every 10 seconds continuously
- **Why**: Catches newly indexed assets from any source
- **Benefit**: No manual action needed

### 2. 👁️ Visibility Change Refresh
```typescript
// Triggers when you return to the tab
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    refetch();
  }
});
```
- **When**: When you switch back to the browser tab
- **Why**: If you uploaded in another tab/window, refresh when you return
- **Benefit**: Instant update when you come back

### 3. 🔄 Manual Refresh Button
```typescript
// Click the "Refresh" button in the gallery header
<button onClick={() => refetch()}>
  🔄 Refresh
</button>
```
- **When**: User clicks the button
- **Why**: Immediate control for users who want to check now
- **Benefit**: Instant on-demand refresh

## Why Different Filters Show Different Results

### "My Assets" Filter
```typescript
// When showMyAssets = true
creator = address  // Your wallet address
query: getAssetsByCreator(address)
```
- **What**: Fetches only assets created by your wallet
- **When to use**: To see your uploads
- **Result**: Shows only YOUR assets

### "Show All" Filter
```typescript
// When showMyAssets = false
creator = undefined
query: getMediaAssetsMinted()  // No creator filter
```
- **What**: Fetches ALL assets from ALL creators
- **When to use**: To browse the entire marketplace
- **Result**: Shows EVERYONE'S assets (including yours)

### ✅ After Our Fix
Both filters now use the **same query structure** with consistent results:
- No artificial limits
- Same ordering (newest first)
- Client-side pagination (12 per page)

## User Experience Scenarios

### Scenario 1: Upload then Navigate
```
1. You're on /upload page
2. Upload completes
3. Navigate to /marketplace
4. Gallery automatically fetches latest data
5. Your asset appears! ✅
```
**Why it works**: Component mounts → initial fetch includes your new asset

### Scenario 2: Upload in Background Tab
```
1. Upload page in Tab A
2. Marketplace in Tab B
3. Upload completes in Tab A
4. Switch to Tab B
5. Visibility change triggers refresh
6. Your asset appears! ✅
```
**Why it works**: Visibility listener detects tab switch

### Scenario 3: Staying on Marketplace
```
1. You're on /marketplace (open for a while)
2. Someone uploads a new asset
3. Wait 10 seconds...
4. Auto-refresh catches it
5. New asset appears! ✅
```
**Why it works**: Periodic refresh every 10 seconds

### Scenario 4: Impatient User
```
1. Upload completes
2. Navigate to marketplace
3. Don't see asset immediately
4. Click "Refresh" button
5. Asset appears! ✅
```
**Why it works**: Manual refresh forces immediate fetch

## Expected Timing

### Optimal Scenario (Everything Fast)
- Transaction confirms: ~12 seconds
- Envio indexes: ~2 seconds
- Next auto-refresh: ≤10 seconds
- **Total wait**: ~12-24 seconds maximum

### Typical Scenario
- Transaction confirms: ~15 seconds
- Envio indexes: ~3 seconds
- You navigate to marketplace
- **Total wait**: See it immediately on page load

### Worst Case Scenario
- Transaction confirms: ~20 seconds (slow network)
- Envio indexes: ~5 seconds
- You were already on marketplace page
- **Total wait**: Up to 10 seconds for next auto-refresh

## Debugging Tips

### Check Console Logs

The gallery logs extensive debugging information:

```javascript
// Initial fetch
🎬 Gallery mounted - initial fetch
🔄 Fetching assets from Envio... { creator: undefined }
✅ Fetched 22 assets from Envio

// Periodic refresh
🔄 Auto-refreshing assets...
🔄 Fetching assets from Envio... { creator: undefined }
✅ Fetched 23 assets from Envio  // New asset appeared!

// Tab switch refresh
👁️ Page visible - refreshing assets...

// Asset list
📦 FETCHED ASSETS:
==================
1. Beach Test (visual) - Token #22
2. test (visual) - Token #21
3. BEACH (visual) - Token #20
...
Total: 23 assets
Filter applied: All Assets
==================
```

### Verify Envio Indexing

Visit: https://indexer.dev.hyperindex.xyz/475cba9/v1/graphql

Run this query:
```graphql
query {
  MediaAssetNFT_MediaAssetMinted(
    order_by: { id: desc }
    limit: 5
  ) {
    id
    tokenId
    creator
    mediaType
  }
}
```

If your asset appears here, Envio has indexed it. The gallery will catch it on next refresh.

## Configuration

### Adjust Auto-Refresh Interval

To change the refresh frequency, edit `components/IndexedAssetsGallery.tsx`:

```typescript
// Current: 10 seconds
const interval = setInterval(() => {
  refetch();
}, 10000);

// Faster (5 seconds)
}, 5000);

// Slower (30 seconds) - saves API calls
}, 30000);
```

### Disable Auto-Refresh

To stop automatic refreshes (not recommended):

```typescript
// Comment out the useEffect for auto-refresh
/*
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 10000);
  return () => clearInterval(interval);
}, [refetch]);
*/
```

## Performance Considerations

### API Call Frequency
- **Auto-refresh**: 6 calls per minute (every 10 seconds)
- **Visibility change**: 1 call per tab switch
- **Manual**: Only when user clicks

### Optimization Strategies
1. **Increase interval** if many users (reduce server load)
2. **Add debouncing** to visibility change (wait 1 second before refetch)
3. **Implement WebSocket** for real-time updates (advanced)

### Network Impact
- Each API call fetches ~20-50 KB of data
- With 10-second refresh: ~120-300 KB/minute
- Minimal impact on modern connections

## Troubleshooting

### "My asset never appears"
1. Check transaction confirmed on Etherscan
2. Verify Envio query returns your asset
3. Check browser console for errors
4. Try manual refresh button

### "I see duplicates"
- Should not happen with our fix
- If it does, check React strict mode (dev only)
- Clear browser cache and reload

### "Gallery keeps reloading"
- Normal behavior: refreshes every 10 seconds
- Should be smooth (no visible flash)
- If jarring, increase interval to 20-30 seconds

## Summary

✅ **Current behavior**: Assets appear within 10-30 seconds of blockchain confirmation
✅ **Three refresh mechanisms**: Auto (10s), visibility change, manual button
✅ **Consistent queries**: Both filters use same data source
✅ **Fast indexing**: Envio typically indexes in 2-5 seconds

**Bottom line**: Your newly uploaded assets WILL appear in "Show All" view, you just need to wait up to 10 seconds for the next auto-refresh, or click the manual refresh button for immediate update!
