# Envio GraphQL Integration Complete ✅

## What Was Set Up

### 1. GraphQL Client (`lib/graphql.ts`)
A comprehensive GraphQL client with helper functions to query Envio indexed data:

- **`queryGraphQL()`** - Base function for all GraphQL queries
- **`getMediaAssetsMinted()`** - Get all minted assets
- **`getAssetsByCreator()`** - Filter by creator address
- **`getTokenTransfers()`** - Get transfer history
- **`getAssetUsage()`** - Get usage/purchase history
- **`getDecryptionKeyReleases()`** - Track decryption key releases
- **`getRoyaltyPayments()`** - Query royalty payments
- **`getTokenHistory()`** - Get complete token history

### 2. API Routes
#### `/api/indexed-assets`
- GET all indexed assets or filter by creator
- Query params: `?creator=0x...&limit=10`

#### `/api/token-history/[tokenId]`
- GET complete history for a specific token
- Returns transfers, usage, keys, and royalties

### 3. React Hook (`lib/hooks/useEnvioData.ts`)
Custom hooks for easy data fetching:
- **`useIndexedAssets(creator?, limit?)`** - Fetch and display assets
- **`useTokenHistory(tokenId)`** - Get token event history

### 4. UI Component (`components/IndexedAssetsGallery.tsx`)
A beautiful gallery component that:
- ✅ Displays indexed assets from Envio
- ✅ Filters by creator (show "My Assets")
- ✅ Adjustable limit (10, 20, 50, 100)
- ✅ Real-time loading states
- ✅ Image previews with fallbacks
- ✅ Links to asset detail pages

### 5. Integrated into Main Page
- Tab switching between "Indexed Assets" (Envio) and "Blockchain Assets" (direct RPC)
- Indexed tab loads **instantly** from Envio's indexed data
- Much faster than querying blockchain directly

## How It Works

```
┌─────────────────┐
│   Smart Contract│
│   (Sepolia)     │
└────────┬────────┘
         │ Events
         ↓
┌─────────────────┐
│  Envio Indexer  │
│  (Port 8080)    │
└────────┬────────┘
         │ GraphQL
         ↓
┌─────────────────┐
│   Next.js API   │
│   Routes        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  React          │
│  Components     │
└─────────────────┘
```

## Example Queries

### Get All Minted Assets
```graphql
query {
  MediaAssetNFT_MediaAssetMinted(limit: 10) {
    tokenId
    creator
    ipfsHash
    mediaType
  }
}
```

### Get Assets by Creator
```graphql
query GetMyAssets($creator: String!) {
  MediaAssetNFT_MediaAssetMinted(
    where: { creator: { _eq: $creator } }
  ) {
    tokenId
    ipfsHash
    mediaType
  }
}
```

### Get Token History
```graphql
query GetHistory($tokenId: String!) {
  MediaAssetNFT_Transfer(where: { tokenId: { _eq: $tokenId } }) {
    from
    to
  }
  MediaAssetNFT_AssetUsed(where: { tokenId: { _eq: $tokenId } }) {
    user
    paymentAmount
  }
}
```

## Benefits

✅ **Instant Loading** - No waiting for blockchain queries
✅ **Rich Queries** - Complex filters, sorting, pagination
✅ **Historical Data** - Access to all past events
✅ **Efficient** - Single query for multiple event types
✅ **Real-time** - Envio automatically syncs new events
✅ **Cost-Free** - No RPC rate limits or costs

## Usage in Your App

### Display All Assets
```tsx
import IndexedAssetsGallery from '@/components/IndexedAssetsGallery';

<IndexedAssetsGallery />
```

### Use in Custom Components
```tsx
import { useIndexedAssets } from '@/lib/hooks/useEnvioData';

function MyComponent() {
  const { assets, loading, error } = useIndexedAssets(address, 20);
  
  return (
    <div>
      {assets.map(asset => (
        <div key={asset.id}>{asset.tokenId}</div>
      ))}
    </div>
  );
}
```

### Direct GraphQL Calls
```tsx
import { getMediaAssetsMinted } from '@/lib/graphql';

const data = await getMediaAssetsMinted(50);
console.log(data.MediaAssetNFT_MediaAssetMinted);
```

## Testing

1. **GraphQL Playground**: http://localhost:8080/v1/graphql
2. **API Route**: http://localhost:3000/api/indexed-assets
3. **UI Component**: http://localhost:3000 (click "Indexed Assets" tab)

## Next Steps

🔜 Add more analytics (total volume, top creators, etc.)
🔜 Real-time subscriptions for live updates
🔜 Advanced filtering (by mediaType, price range, etc.)
🔜 Caching with React Query for better performance
🔜 Export data as CSV/JSON for creators

---

**Your Envio indexer is now fully integrated with your Next.js app!** 🎉
