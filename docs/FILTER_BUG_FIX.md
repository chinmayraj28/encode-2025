# Filter Bug Fix - Show All vs My Assets

## Problem Identified
When users uploaded new assets, they were only visible in the "My Assets" filter but not in "Show All" view. This created an inconsistent user experience where:
- ✅ **My Assets** - User's newly uploaded assets appeared immediately
- ❌ **Show All** - Same assets were missing from the gallery

## Root Cause
The issue was caused by **query inconsistency** between two different data fetching paths:

### Before Fix
```typescript
// API Route: app/api/indexed-assets/route.ts
if (creator) {
  data = await getAssetsByCreator(creator);  // No limit - gets ALL assets
} else {
  data = await getMediaAssetsMinted(limit);  // Limited to 1000 assets
}
```

**The Problem:**
- `getAssetsByCreator()` had **no limit** parameter in its GraphQL query
- `getMediaAssetsMinted()` was called with `limit: 1000`
- Both queries ordered by `{ id: desc }` (newest first)
- But the limit caused a mismatch in results

**Why it appeared to work for "My Assets":**
- When filtering by creator, the query returned ALL assets for that specific creator
- No limit meant all recent uploads were included

**Why it failed for "Show All":**
- The limit of 1000 was applied, but GraphQL query structure was inconsistent
- Frontend was passing `limit: 1000` but also handling pagination client-side
- This created a race condition where newly indexed assets might not be in the first 1000 results

## Solution
Made both queries consistent by:

1. **Removed limit restrictions** - Both queries now fetch ALL assets
2. **Client-side pagination** - Frontend already implements pagination (12 per page)
3. **Consistent query parameters** - Both functions now have optional limit support

### Changes Made

#### 1. `lib/graphql.ts`
```typescript
// Before: Hard-coded default limit
export async function getMediaAssetsMinted(limit: number = 10) {
  // ... query with required limit parameter
}

// After: Optional limit, no default
export async function getMediaAssetsMinted(limit?: number) {
  const query = `
    query GetMintedAssets($limit: Int) {
      MediaAssetNFT_MediaAssetMinted(
        ${limit ? 'limit: $limit' : ''}  // Only apply if provided
        order_by: { id: desc }
      ) { ... }
    }
  `;
  const result = await queryGraphQL(query, limit ? { limit } : {});
}

// Also updated getAssetsByCreator to accept optional limit
export async function getAssetsByCreator(creator: string, limit?: number) {
  // ... similar optional limit pattern
}
```

#### 2. `app/api/indexed-assets/route.ts`
```typescript
// Before: Passed limit from query params
const limit = parseInt(searchParams.get('limit') || '10');
data = await getMediaAssetsMinted(limit);

// After: No limit - get all assets
data = await getMediaAssetsMinted();
```

#### 3. `lib/hooks/useEnvioData.ts`
```typescript
// Before: Accepted and passed limit parameter
export function useIndexedAssets(creator?: string, limit: number = 10)

// After: Removed limit parameter
export function useIndexedAssets(creator?: string)
```

#### 4. `components/IndexedAssetsGallery.tsx`
```typescript
// Before: Passed 1000 as limit
const { assets, ... } = useIndexedAssets(creator, 1000);

// After: No limit, pagination handled client-side
const { assets, ... } = useIndexedAssets(creator);
```

## Testing Verification

### Test Case 1: Upload New Asset
1. Connect wallet and upload a new image
2. Wait for transaction confirmation
3. Check "My Assets" filter → ✅ Should appear
4. Switch to "Show All" → ✅ Should also appear (FIXED)

### Test Case 2: Multiple Users
1. User A uploads asset
2. User B uploads asset
3. Both switch to "Show All"
4. Both should see BOTH assets → ✅ (FIXED)

### Test Case 3: Pagination
1. Upload 15 assets total
2. Check "Show All" displays 12 per page
3. Navigate to page 2
4. Verify remaining 3 assets appear → ✅ Works correctly

## Technical Notes

### Why This Approach?
- **Server-side**: Fetch ALL assets without arbitrary limits
- **Client-side**: Implement pagination (12 per page)
- **Benefits**:
  - No race conditions with indexing
  - Consistent data across filters
  - Simpler query logic
  - Better user experience

### Performance Considerations
- GraphQL query now returns all assets (no artificial limit)
- Client-side pagination handles display
- For large datasets (>10,000 assets), may need to implement:
  - GraphQL cursor-based pagination
  - Virtual scrolling
  - Lazy loading

### Cache Invalidation
- `dynamic = 'force-dynamic'` in API route prevents Next.js caching
- Each request fetches fresh data from Envio indexer
- Auto-refresh every 30 seconds keeps UI in sync

## Related Files
- `/lib/graphql.ts` - GraphQL query functions
- `/app/api/indexed-assets/route.ts` - API endpoint
- `/lib/hooks/useEnvioData.ts` - React hook for data fetching
- `/components/IndexedAssetsGallery.tsx` - Gallery component with filters

## Commit Information
- **Issue**: Filter inconsistency between "My Assets" and "Show All"
- **Root Cause**: Different query limits causing data mismatch
- **Fix**: Removed limits, rely on client-side pagination
- **Files Changed**: 4 files
- **Impact**: Critical bug fix - ensures all users see all uploaded assets
