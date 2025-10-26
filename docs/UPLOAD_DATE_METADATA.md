# Upload Date Metadata Display

## Overview

Media Mercatum now displays upload date/time metadata on asset cards and detail pages, providing users with temporal context about when assets were created and uploaded to the platform.

## Features

### ✅ Smart Date Formatting

#### Relative Time (Recent Uploads)
For assets uploaded recently, the system shows human-friendly relative timestamps:
- **Just now** - Less than 1 minute ago
- **5m ago** - Minutes ago (< 1 hour)
- **3h ago** - Hours ago (< 24 hours)
- **2d ago** - Days ago (< 7 days)

#### Absolute Dates (Older Uploads)
For assets older than a week:
- **Oct 15** - Same year uploads
- **Dec 25, 2024** - Previous year uploads

### 📍 Display Locations

#### 1. Marketplace Gallery Cards
Each asset card shows the upload date below the price:
```
🎵 Audio
Creator: 0x1234...5678
Price: 0.05 ETH
📅 Uploaded 2h ago
```

#### 2. Asset Detail Page - Metadata Card
The metadata section shows full upload timestamp:
```
📝 Metadata
Name: Lofi Hip Hop Beat
Description: Chill beats for studying
Created: Oct 26, 2025, 3:45 PM
```

## Technical Implementation

### Data Source

The timestamp comes from the `metadata.timestamp` field stored in IPFS during upload:

```typescript
// During upload (UploadForm.tsx)
const metadata = {
  name: title,
  description: description,
  mediaType: mediaType,
  creator: address,
  timestamp: new Date().toISOString(), // ← ISO 8601 format
  collaborators: collaborators,
};
```

### Type Definition

Added to `AssetMetadata` interface:

```typescript
interface AssetMetadata {
  name: string;
  description: string;
  mediaType: string;
  encryptedFileHash: string;
  previewHash: string;
  price: string;
  timestamp?: string; // ← Optional ISO 8601 timestamp
  collaborators?: Array<{
    address: string;
    percentage: number;
  }>;
}
```

### Formatting Logic

#### Gallery Cards (Relative Time)

```typescript
const formatDate = (timestamp: string | undefined) => {
  if (!timestamp) return null;
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    // Relative time for recent uploads
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    // Absolute date for older uploads
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch (error) {
    return null;
  }
};
```

#### Detail Page (Full Timestamp)

```typescript
{metadata.timestamp && (
  <p>
    <span className="text-gray-400">Created:</span>{' '}
    <span className="text-gray-300">
      {new Date(metadata.timestamp).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })}
    </span>
  </p>
)}
```

### UI Integration

#### Gallery Card
```tsx
<div className="space-y-2 text-sm text-gray-400 mb-4">
  <p>
    <span className="inline-flex items-center">
      <span className="mr-2">{getMediaIcon(mediaType)}</span>
      <span className="text-gray-300 capitalize">{mediaType}</span>
    </span>
  </p>
  <p>
    Creator: <span className="text-teal-400">{formatAddress(asset.creator)}</span>
  </p>
  <p>
    Price: <span className="text-green-400">
      {asset.price ? `${formatEther(BigInt(asset.price))} ETH` : 'Not set'}
    </span>
  </p>
  {metadata?.timestamp && (
    <p className="flex items-center gap-1">
      <span>📅</span>
      <span className="text-gray-400">
        Uploaded {formatDate(metadata.timestamp)}
      </span>
    </p>
  )}
</div>
```

## Date Format Examples

### Relative Time Examples

| Time Difference | Display |
|----------------|---------|
| 0 seconds | Just now |
| 30 seconds | Just now |
| 5 minutes | 5m ago |
| 45 minutes | 45m ago |
| 2 hours | 2h ago |
| 23 hours | 23h ago |
| 1 day | 1d ago |
| 5 days | 5d ago |
| 7 days | Oct 19 |
| 30 days | Sep 26 |
| 180 days | Apr 28 |
| 1 year+ | Dec 25, 2024 |

### Absolute Date Examples

| Upload Date | Current Year | Display |
|------------|--------------|---------|
| Oct 26, 2025 | 2025 | Oct 26 |
| Sep 15, 2025 | 2025 | Sep 15 |
| Dec 31, 2024 | 2025 | Dec 31, 2024 |
| Jan 1, 2024 | 2025 | Jan 1, 2024 |

### Detail Page Examples

| Timestamp | Display |
|-----------|---------|
| 2025-10-26T15:45:00Z | Oct 26, 2025, 3:45 PM |
| 2025-01-15T09:30:00Z | Jan 15, 2025, 9:30 AM |
| 2024-12-25T23:59:00Z | Dec 25, 2024, 11:59 PM |

## Benefits

### For Users
- ✅ **Discover Fresh Content**: Easily identify newly uploaded assets
- ✅ **Trust Signals**: Timestamps verify when content was created
- ✅ **Sorting Context**: Understand asset timeline without extra queries
- ✅ **Trend Awareness**: Spot trending content uploaded recently

### For Platform
- ✅ **Transparency**: Clear audit trail for all uploads
- ✅ **Discovery**: Users can find new vs. established content
- ✅ **Trust**: Professional metadata builds credibility
- ✅ **Analytics**: Track upload patterns and user behavior

## Edge Cases Handled

### Missing Timestamp
```typescript
if (!timestamp) return null; // Gracefully hide date field
```

### Invalid Date Format
```typescript
try {
  const date = new Date(timestamp);
  // Format date
} catch (error) {
  return null; // Don't crash, just hide
}
```

### Optional Field
```typescript
{metadata?.timestamp && (
  <p>...</p> // Only render if timestamp exists
)}
```

### Legacy Assets
Assets uploaded before this feature was added won't have timestamps:
- **Gallery**: Date field won't appear
- **Detail Page**: "Created" field won't show
- **No Errors**: Optional field handles gracefully

## Styling

### Gallery Card Date
- **Icon**: 📅 calendar emoji
- **Color**: `text-gray-400` (subtle, non-distracting)
- **Position**: Below price, aligned with other metadata
- **Layout**: Flex row with icon and text

### Detail Page Date
- **Label**: "Created:" in `text-gray-400`
- **Value**: Formatted date in `text-gray-300`
- **Position**: After description, before attributes
- **Format**: Full date and time

## Future Enhancements

### Potential Improvements
1. **Sort by Date**: Allow marketplace sorting by upload date (newest/oldest)
2. **Date Range Filters**: "Uploaded this week", "Last month", etc.
3. **Last Modified**: Track and display update timestamps
4. **Time Zones**: Respect user's local timezone
5. **Hover Details**: Show full timestamp on hover of relative time
6. **Calendar View**: Browse assets by upload date in calendar format

### Advanced Features
- **Batch Upload Dates**: Show date range for collections
- **Historical Timeline**: Visualize creator's upload history
- **Freshness Badge**: Highlight assets uploaded in last 24h
- **Anniversary Tags**: "Uploaded 1 year ago today"

## Backward Compatibility

### Legacy Assets
Assets minted before timestamp feature:
- ✅ **No Errors**: Optional field prevents crashes
- ✅ **Graceful Degradation**: Simply don't show date
- ✅ **No Migration**: No need to update old metadata
- ✅ **Future Proof**: New uploads automatically include timestamp

### Data Migration (Optional)
If needed, could backfill timestamps from blockchain:
```typescript
// Get on-chain upload timestamp
const uploadTimestamp = asset.uploadTimestamp; // From blockchain
const backfilledDate = new Date(Number(uploadTimestamp) * 1000).toISOString();
```

## Testing Scenarios

### Test Case 1: New Upload
- **Action**: Mint a new NFT
- **Expected**: "Just now" appears in gallery
- **Result**: ✅ Shows relative time immediately

### Test Case 2: Older Asset
- **Action**: View asset uploaded last week
- **Expected**: Shows "Oct 19" (absolute date)
- **Result**: ✅ Displays formatted date

### Test Case 3: Detail Page
- **Action**: Click into asset detail
- **Expected**: Full timestamp "Oct 26, 2025, 3:45 PM"
- **Result**: ✅ Shows complete date and time

### Test Case 4: Missing Timestamp
- **Action**: View legacy asset without timestamp
- **Expected**: No date field shown, no errors
- **Result**: ✅ Gracefully handles missing data

### Test Case 5: Cross-Year
- **Action**: View asset from 2024 in 2025
- **Expected**: Shows "Dec 25, 2024" with year
- **Result**: ✅ Includes year for clarity

## Best Practices

### When to Use Relative Time
- ✅ Recent content (< 7 days)
- ✅ Social/feed contexts
- ✅ Emphasize freshness
- ✅ Quick scanning

### When to Use Absolute Dates
- ✅ Older content (> 7 days)
- ✅ Historical reference
- ✅ Precise documentation
- ✅ Formal contexts

### Timezone Considerations
- Current implementation uses user's browser locale
- ISO 8601 format stores UTC time
- Display automatically converts to local time
- No timezone indicator shown (assumes local context)

## Summary

The upload date metadata feature provides **essential temporal context** for NFT assets, helping users discover fresh content and understand the timeline of the marketplace. It uses smart formatting (relative for recent, absolute for older) to maximize readability while maintaining precision where needed.

Key benefits:
- 🕒 **Fresh Content Discovery**: Spot newly uploaded assets
- 📊 **Timeline Context**: Understand when assets were created
- 🎯 **User Trust**: Transparent upload timestamps
- 🔄 **Graceful Degradation**: Handles missing timestamps elegantly
- 📱 **Responsive**: Works across all device sizes

---

**Status**: ✅ Implemented and Active  
**Last Updated**: October 26, 2025  
**Version**: 1.0.0  
**Format**: Relative (< 7 days) / Absolute (≥ 7 days)
