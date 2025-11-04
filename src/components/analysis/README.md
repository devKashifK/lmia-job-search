# Analysis Components

This directory contains reusable components for the company analysis page, now mobile-optimized.

## Components Created

### 1. **MetricCard** (`metric-card.tsx`)
Displays key metrics with animated icons and contextual indicators.

**Props:**
- `label`: string - Metric label (e.g., "Growth Rate")
- `value`: string | number - Metric value
- `subtitle`: string - Description text
- `icon`: string - Icon name from @iconify/react

**Features:**
- Animated on hover
- Contextual status indicators (Growing/Declining/Stable)
- Special indicators for different metric types
- Gradient backgrounds on hover

---

### 2. **DashboardCard** (`dashboard-card.tsx`)
Container card for dashboard sections with header and icon.

**Props:**
- `title`: string - Card title
- `subtitle`: string (optional) - Subtitle text
- `icon`: LucideIcon - Icon component
- `children`: ReactNode - Card content
- `className`: string (optional) - Additional classes

**Features:**
- Gradient accent bar at top
- Animated icon on hover
- Consistent header styling
- Flex layout for content

---

### 3. **Charts** (`charts.tsx`)
Four chart components for data visualization:

#### **AreaChart**
Time-series line chart with gradient fill.
- Props: `data: Array<{period: string, count: number}>`, `color?: string`
- Interactive hover states
- Responsive SVG

#### **DonutChart**  
Circular segment chart for proportional data.
- Props: `data: Array<{name: string, value: number}>`, `centerValue?`, `centerLabel?`, `onSegmentClick?`
- Color-coded segments
- Hover effects
- Click interactions

#### **BarChart**
Horizontal bar chart for comparisons.
- Props: `data: Array<{name: string, value: number}>`, `maxValue?`, `onBarClick?`
- Gradient bars
- Hover scaling

#### **ColumnChart**
Vertical column chart for distributions.
- Props: `data: Array<{title: string, count: number}>`, `onColumnClick?`
- Responsive heights
- Interactive tooltips

---

### 4. **AnalysisLayout** (`analysis-layout.tsx`)
**Mobile-optimized** wrapper for analysis pages.

**Props:**
- `children`: ReactNode - Main content
- `companyName`: string - Company name for header
- `filterSidebar`: ReactNode - Filter component

**Features:**
- **Desktop**: Sidebar layout with sticky filters
- **Mobile**: Full-width content with floating filter button
- **Mobile Drawer**: Beautiful shadcn drawer for filters
- **Responsive**: Automatic mobile/desktop detection
- **Navigation**: MobileHeader + BottomNav on mobile

---

## Usage Example

```tsx
import {
  AnalysisLayout,
  MetricCard,
  DashboardCard,
  AreaChart,
  DonutChart,
  BarChart,
  ColumnChart,
} from '@/components/analysis';
import { Briefcase, MapPin } from 'lucide-react';

export default function CompanyAnalysis() {
  return (
    <AnalysisLayout
      companyName="Company Name"
      filterSidebar={<FilterSidebar {...filterProps} />}
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Jobs"
          value="1,234"
          subtitle="All time"
          icon="mdi:briefcase"
        />
        <MetricCard
          label="Growth Rate"
          value="+15.3%"
          subtitle="vs last quarter"
          icon="mdi:trending-up"
        />
      </div>

      {/* Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title="Location Distribution"
          subtitle="Jobs by state"
          icon={MapPin}
        >
          <DonutChart
            data={locationData}
            centerValue="100%"
            centerLabel="Total"
          />
        </DashboardCard>

        <DashboardCard
          title="Hiring Trends"
          subtitle="Over time"
          icon={Briefcase}
        >
          <AreaChart data={trendData} color="#10b981" />
        </DashboardCard>
      </div>
    </AnalysisLayout>
  );
}
```

---

## Mobile Optimization

### **Responsive Breakpoints**
- **Mobile**: < 1024px
- **Desktop**: >= 1024px

### **Mobile Layout**
```
┌─────────────────────────┐
│ 📱 MobileHeader         │ ← Sticky top
│ [←] Company Name        │
├─────────────────────────┤
│                         │
│ 📊 Metrics Grid         │ ← Stacked vertically
│ (1 column)              │
│                         │
│ 📈 Chart Cards          │ ← Full width
│ (1 column)              │
│                         │
│ ...                     │
│                         │
└─────────────────────────┘
  [Bottom Navigation]      ← Fixed bottom

         [🔵]              ← Floating filter
         Filters             button (FAB)
```

### **Desktop Layout**
```
┌──────────┬──────────────────────────┐
│ Filters  │  📊 Metrics (4 columns)  │
│ Sidebar  │                          │
│ (Sticky) │  📈 Charts (2 columns)   │
│          │                          │
│          │  📋 Data Tables          │
│          │                          │
└──────────┴──────────────────────────┘
```

---

## Filter Drawer (Mobile)

**Design Features:**
- Gradient header (brand → blue)
- Rounded top corners
- Drag handle for swipe to close
- 85% max height
- Scrollable content
- Beautiful close button
- Icon + title + subtitle

**Interaction:**
- Tap floating button to open
- Tap backdrop to close
- Tap X button to close  
- Swipe down to dismiss

---

## Styling

All components use:
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Shadcn UI** for base components
- **Brand colors** for consistency
- **Responsive utilities** (md:, lg: prefixes)

---

## Integration Steps

### Step 1: Import Components
```tsx
import {
  AnalysisLayout,
  MetricCard,
  DashboardCard,
  AreaChart,
} from '@/components/analysis';
```

### Step 2: Wrap Page in AnalysisLayout
```tsx
<AnalysisLayout
  companyName={companyName}
  filterSidebar={<YourFilterComponent />}
>
  {/* Your content here */}
</AnalysisLayout>
```

### Step 3: Use Components
Replace inline JSX with component calls.

**Before:**
```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>{/* chart code */}</CardContent>
</Card>
```

**After:**
```tsx
<DashboardCard title="Title" icon={Icon}>
  <AreaChart data={data} />
</DashboardCard>
```

---

## Next Steps

1. ✅ **Components Created** - MetricCard, DashboardCard, Charts, Layout
2. ⏳ **Extract FilterSidebar** - Move to separate component
3. ⏳ **Update Main Page** - Use new components
4. ⏳ **Test Mobile** - Verify responsive behavior
5. ⏳ **Optimize Performance** - Lazy load charts

---

## Performance Tips

- Use `React.memo` for chart components
- Lazy load heavy visualizations
- Debounce filter updates
- Virtualize long lists
- Code split by route

---

## Accessibility

- All interactive elements keyboard accessible
- ARIA labels on charts
- Focus management in drawer
- Screen reader friendly
- Color contrast compliant

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Created:** 2025-11-04  
**Status:** ✅ Ready for integration  
**Mobile Optimized:** ✅ Yes
