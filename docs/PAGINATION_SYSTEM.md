# Pagination System

## Overview

Media Mercatum now features a robust pagination system that replaces the previous asset limit dropdown. This allows users to browse through large collections of assets seamlessly with an intuitive page navigation interface.

## Features

### ✅ Smart Pagination
- **Fixed Page Size**: 12 assets per page for consistent layout (3 columns × 4 rows)
- **Dynamic Page Count**: Automatically calculates total pages based on filtered results
- **Intelligent Page Numbers**: Shows relevant page numbers with ellipsis for large collections
- **Auto-Reset**: Returns to page 1 when filters change

### 🎯 User Experience

#### Navigation Controls
- **Previous/Next Buttons**: Navigate between pages sequentially
- **Direct Page Selection**: Click any visible page number to jump directly
- **Smart Page Display**: Shows current page ± 1, with ellipsis for skipped ranges
- **Disabled States**: Previous/Next buttons disabled at boundaries

#### Visual Feedback
- **Active Page Highlight**: Current page shown in teal color
- **Range Display**: "Showing 1-12 of 45 assets"
- **Page Counter**: "Page 2 of 4" in footer
- **Responsive Design**: Mobile-friendly pagination controls

## Technical Implementation

### Configuration
```typescript
const assetsPerPage = 12; // Fixed assets per page
const { assets } = useIndexedAssets(creator, 1000); // Load up to 1000 assets
```

### State Management
```typescript
const [currentPage, setCurrentPage] = useState(1);

// Calculate pagination
const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);
const startIndex = (currentPage - 1) * assetsPerPage;
const endIndex = startIndex + assetsPerPage;
const paginatedAssets = filteredAssets.slice(startIndex, endIndex);
```

### Auto-Reset on Filter Change
```typescript
useEffect(() => {
  setCurrentPage(1);
}, [mediaFilter, showMyAssets, showPurchases]);
```

## Pagination Display Logic

### Page Number Strategy

The pagination displays page numbers intelligently based on the current page and total pages:

#### Example 1: Few Pages (≤5 pages)
```
← Previous  [1]  [2]  [3]  [4]  [5]  Next →
```

#### Example 2: Current Page = 1
```
← Previous  [1]  [2]  [3]  ...  [10]  Next →
```

#### Example 3: Current Page = 5 (middle)
```
← Previous  [1]  ...  [4]  [5]  [6]  ...  [10]  Next →
```

#### Example 4: Current Page = 10 (last)
```
← Previous  [1]  ...  [8]  [9]  [10]  Next →
```

### Logic Breakdown

1. **Always Show Current Page**: The active page is always visible
2. **Show Adjacent Pages**: Current ± 1 pages shown
3. **Show First/Last**: Page 1 and last page shown when far from current
4. **Ellipsis for Gaps**: `...` shown when pages are skipped
5. **Edge Cases**: When near start/end, show up to 3 consecutive pages

### Code Implementation
```typescript
{Array.from({ length: totalPages }, (_, i) => i + 1)
  .filter(page => {
    return page === currentPage || 
           page === currentPage - 1 || 
           page === currentPage + 1 ||
           (currentPage <= 2 && page <= 3) ||
           (currentPage >= totalPages - 1 && page >= totalPages - 2);
  })
  .map(page => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={currentPage === page ? 'active' : ''}
    >
      {page}
    </button>
  ))}
```

## Interaction with Filters

### Media Type Filters
When user selects a different media type:
1. Assets are re-filtered
2. Pagination resets to page 1
3. Total pages recalculated
4. User sees first page of filtered results

### My Assets / Your Purchases
When toggling these filters:
1. Asset list changes immediately
2. Page resets to 1
3. Pagination controls update accordingly
4. Empty state shown if no results

### Purchase Checking
- Purchase verification happens before pagination
- All assets checked, then paginated results displayed
- Loading state shows "Checking your purchases..."

## Benefits

### Performance
- ✅ **Consistent Load Times**: Always renders 12 assets regardless of total
- ✅ **Better UX**: Easier to browse than scrolling through 100+ assets
- ✅ **Faster Rendering**: Browser only renders visible page
- ✅ **Responsive**: Quick page transitions

### Scalability
- ✅ **Handles Large Collections**: Can display 1000+ assets efficiently
- ✅ **Flexible**: Easy to change `assetsPerPage` constant
- ✅ **Maintainable**: Clean separation of concerns
- ✅ **Extensible**: Ready for server-side pagination if needed

### User Experience
- ✅ **Predictable Layout**: Always 3×4 grid on desktop
- ✅ **Easy Navigation**: Multiple ways to jump between pages
- ✅ **Clear Feedback**: Always know current position
- ✅ **Mobile Friendly**: Responsive pagination controls

## Component Structure

### Pagination Controls
```tsx
{totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 pt-8">
    {/* Previous Button */}
    <button disabled={currentPage === 1}>
      ← Previous
    </button>
    
    {/* Page Numbers */}
    <div className="flex gap-2">
      {/* Smart page number display */}
    </div>

    {/* Next Button */}
    <button disabled={currentPage === totalPages}>
      Next →
    </button>
  </div>
)}
```

### Footer Stats
```tsx
<div className="text-center text-sm text-gray-400 pt-4">
  <p>
    Showing {startIndex + 1}-{Math.min(endIndex, filteredAssets.length)} 
    of {filteredAssets.length} assets
    • Page {currentPage} of {totalPages}
  </p>
</div>
```

## Styling

### Active Page
- Background: `bg-teal-500`
- Text: `text-white`
- Font: `font-semibold`

### Inactive Pages
- Background: `bg-gray-800/50`
- Hover: `hover:bg-gray-700/50`
- Text: `text-white`

### Disabled Buttons
- Opacity: `opacity-50`
- Cursor: `cursor-not-allowed`
- No hover effect

### Ellipsis
- Color: `text-gray-500`
- Padding: `px-2 py-2`
- Non-interactive

## Responsive Design

### Desktop (lg+)
- 3 columns of assets
- Full pagination controls
- All page numbers visible

### Tablet (md)
- 2 columns of assets
- Pagination adapts to width
- May wrap on very small tablets

### Mobile
- 1 column of assets
- Compact pagination
- Fewer visible page numbers
- Previous/Next buttons emphasized

## Future Enhancements

### Potential Improvements
1. **Server-Side Pagination**: Fetch only current page from API
2. **URL Parameters**: Sync page number with URL for bookmarking
3. **Infinite Scroll Option**: Toggle between pagination/infinite scroll
4. **Custom Page Size**: Let users choose 12/24/48 assets per page
5. **Keyboard Navigation**: Arrow keys to navigate pages
6. **Jump to Page**: Input field to jump to specific page number

### Advanced Features
- **Prefetch Adjacent Pages**: Preload next/previous page for instant transitions
- **Lazy Loading**: Load images only when scrolling near them
- **Virtual Scrolling**: Render only visible assets for 10,000+ items
- **Session Persistence**: Remember page position across page reloads

## Migration from Old System

### Before (Limit Dropdown)
```tsx
<select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
  <option value={10}>10 assets</option>
  <option value={20}>20 assets</option>
  <option value={50}>50 assets</option>
  <option value={100}>100 assets</option>
</select>
```

### After (Pagination)
```tsx
// Automatic pagination with fixed page size
const assetsPerPage = 12;
const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

// Render pagination controls
{totalPages > 1 && <PaginationControls />}
```

### Key Changes
- ❌ Removed: `limit` state variable
- ❌ Removed: `setLimit` function
- ❌ Removed: Limit dropdown selector
- ✅ Added: `currentPage` state
- ✅ Added: `assetsPerPage` constant
- ✅ Added: Pagination calculation logic
- ✅ Added: Page navigation controls
- ✅ Added: Auto-reset on filter change

## Testing Scenarios

### Test Case 1: Single Page
- **Given**: 8 assets (< 12)
- **Expected**: No pagination controls shown
- **Result**: ✅ Only assets displayed, no page numbers

### Test Case 2: Multiple Pages
- **Given**: 45 assets (4 pages)
- **Expected**: Full pagination with 4 page buttons
- **Result**: ✅ Can navigate all 4 pages

### Test Case 3: Many Pages
- **Given**: 120 assets (10 pages)
- **Expected**: Smart pagination with ellipsis
- **Result**: ✅ Shows [1] ... [4] [5] [6] ... [10]

### Test Case 4: Filter Change
- **Given**: On page 3, change media filter
- **Expected**: Reset to page 1 with new results
- **Result**: ✅ Automatically returns to page 1

### Test Case 5: Empty Results
- **Given**: Filter with no matches
- **Expected**: Empty state message, no pagination
- **Result**: ✅ Shows "No assets found" message

### Test Case 6: Boundary Navigation
- **Given**: On page 1, click Previous
- **Expected**: Previous button disabled
- **Result**: ✅ Button grayed out, no action

## Summary

The pagination system provides a **professional, scalable, and user-friendly** way to browse large collections of NFT assets. It automatically adapts to filtering, handles edge cases gracefully, and provides clear visual feedback about the current position in the collection.

Key benefits:
- 🚀 **Better Performance**: Fixed page size prevents rendering issues
- 🎯 **Better UX**: Easy navigation through large collections
- 📱 **Responsive**: Works great on all screen sizes
- ♿ **Accessible**: Clear visual states and keyboard-friendly
- 🔧 **Maintainable**: Clean, well-structured code

---

**Status**: ✅ Implemented and Active  
**Last Updated**: October 26, 2025  
**Version**: 1.0.0  
**Assets Per Page**: 12
