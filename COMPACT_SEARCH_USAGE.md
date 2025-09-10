# Compact Search Integration for PageTitle Component

## Overview

I've successfully added a compact search functionality to the `PageTitle` component with a different design from the main search page. This search component expands on focus and provides the same powerful search capabilities with suggestions for both LMIA and Hot Leads searches.

## Components Created

### 1. CompactSearch Component (`src/components/ui/compact-search.tsx`)

A new compact search component that features:
- **Animated expansion** on focus (260px → 400px width)
- **Type-ahead suggestions** with fuzzy search
- **Dual search types** (Hot Leads / LMIA)
- **Credit system integration** 
- **Navigation to search results**
- **Different visual design** from the main search

### 2. Enhanced PageTitle Component

The `PageTitle` component now accepts new props:
- `showSearch?: boolean` - Enable/disable search functionality
- `searchPlaceholder?: string` - Custom placeholder text
- `defaultSearchType?: 'hot_leads' | 'lmia'` - Default search type

## Usage Examples

### Basic Usage with Search Enabled

```tsx
<PageTitle 
  title="Hot Leads Demo"
  showSearch={true}
  searchPlaceholder="Search hot leads..."
  defaultSearchType="hot_leads"
/>
```

### LMIA Search Configuration

```tsx
<PageTitle 
  title="LMIA Jobs"
  showSearch={true}
  searchPlaceholder="Search LMIA jobs..."
  defaultSearchType="lmia"
/>
```

### Regular PageTitle (No Search)

```tsx
<PageTitle 
  title="Regular Title"
  showSearch={false}
/>
```

## Features

### 🎯 Smart Expansion
- Compact 260px width by default
- Expands to 400px on focus with smooth animation
- Shows search type selector and "Go" button when expanded

### 🔍 Advanced Suggestions
- Real-time suggestions using existing RPC functions
- `suggest_trending_job` for Hot Leads
- `suggest_lmia` for LMIA searches
- Limited to 6 suggestions for compact display

### 💳 Credit System Integration
- Full credit checking before searches
- User authentication validation
- Credit deduction on search execution
- Redirects to credit purchase if no credits remain

### 🚀 Navigation
- Proper URL construction with search parameters
- Field-specific routing
- Search type preservation in URL

## Integration in DynamicDataView

The component is automatically integrated in `DynamicDataView` with smart defaults:
- Detects search type from URL parameter `t`
- Shows appropriate placeholder text
- Enables search by default

```tsx
<PageTitle 
  title={title} 
  showSearch={true}
  searchPlaceholder={searchType === 'lmia' ? 'Search LMIA jobs...' : 'Search hot leads...'}
  defaultSearchType={searchType}
/>
```

## Demo Page

I've created a demo page at `/demo` (when authenticated) that showcases:
- Hot Leads search configuration
- LMIA search configuration  
- Regular PageTitle without search

## Visual Design Differences from Main Search

1. **Compact Layout**: Smaller initial footprint
2. **Inline Controls**: Search type and button appear inline when expanded
3. **Subtle Animation**: Smooth width expansion instead of modal-style
4. **Condensed Suggestions**: Smaller suggestion dropdown with fewer items
5. **Minimalist Style**: Cleaner, more integrated appearance

## Technical Implementation

### Search Logic Reuse
- Reuses existing RPC functions (`suggest_trending_job`, `suggest_lmia`)
- Same credit checking and navigation logic as main search
- Consistent URL parameter handling

### Animation Framework
- Uses Framer Motion for smooth animations
- AnimatePresence for enter/exit transitions
- Layout animations for width changes

### State Management
- Local state for expansion and suggestions
- Integration with global search state where needed
- Proper cleanup on component unmount

## Browser Testing

The component works across modern browsers and provides:
- Responsive design for different screen sizes
- Keyboard navigation support
- Accessible focus management
- Smooth animations with fallbacks

This integration provides a seamless search experience directly within page titles while maintaining the full functionality of the main search system.
