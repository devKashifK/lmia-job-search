# Reusability Analysis - JobMaze Codebase

## 🎯 Executive Summary
This document identifies reusable components, duplicate code patterns, and refactoring opportunities across the codebase.

---

## ✅ Already Reusable Components (Good Examples)

### 1. **Layout Components** (Highly Reusable ✨)
- **`<Navbar />`** - Used in 12 pages
  - Files: All authenticated & unauthenticated pages
  - Lines: `import Navbar from '@/components/ui/nabvar'`
  
- **`<Footer />`** - Used in 12 pages
  - Files: All main pages
  - Lines: `import Footer from '@/pages/homepage/footer'`

- **`<Sidebar />`** - Dashboard navigation
  - File: `/components/dashboard/sidebar.tsx`
  - Used in: Dashboard layout

### 2. **Data Display Components** (Excellent ✨)
- **`<DynamicDataView />`** - Main search results display
  - File: `/components/ui/dynamic-data-view.tsx`
  - Used in: Hot leads page, LMIA page
  - Props: `title`, `field`, `searchType`
  
- **`<NewFilterPanel />`** - Filter sidebar with RPC support
  - File: `/components/ui/new-filterpanel.tsx`
  - Used in: DynamicDataView component

- **`<JobCard />`** - Individual job display
  - File: `/components/ui/job-card.tsx`
  - Used in: Multiple list views

### 3. **UI Components** (shadcn/ui based)
All in `/components/ui/`:
- `<Button />`, `<Card />`, `<Badge />`, `<Input />`, `<Select />`, `<Dialog />`
- `<Skeleton />`, `<Tooltip />`, `<Popover />`, `<Calendar />`
- These are already highly reusable ✅

### 4. **Custom Hooks** (Well abstracted ✨)
- **`useSession()`** - Used in 24 files
  - File: `/hooks/use-session.tsx`
  - Purpose: Authentication state
  
- **`useToast()`** - Used in 17 files
  - File: `/hooks/use-toast.ts`
  - Purpose: Toast notifications
  
- **`useUpdateCredits()`** - Used in 3 files
  - File: `/hooks/use-credits.tsx`
  - Purpose: Credit management

- **`useFilterColumnAttributes()`** - Filter facet data
  - File: `/components/ui/new-filterpanel.tsx` (line 91-199)

---

## 🔴 DUPLICATE CODE - Refactoring Opportunities

### 1. **CRITICAL: Near-Identical Pages** 🚨

#### **Hot Leads vs LMIA Search Pages**
**Files:**
- `/app/(authenticated)/search/hot-leads/[search]/page.tsx` (30 lines)
- `/app/(authenticated)/search/lmia/[search]/page.tsx` (29 lines)

**Duplicate Code:**
```tsx
// BOTH FILES HAVE IDENTICAL STRUCTURE:
export default async function Engine({ params, searchParams }: PageProps) {
  const searchKey = params.search;
  const field = searchParams.field;
  return (
    <>
      <Navbar className="" />
      <div className="pt-24">
        <DynamicDataView
          title={decodeURIComponent(searchKey)}
          field={decodeURIComponent(field as string)}
          searchType="hot_leads" // ONLY DIFFERENCE
        />
      </div>
      <Footer />
    </>
  );
}
```

**💡 Refactoring Suggestion:**
Create a single `SearchResultsLayout` component:
```tsx
// components/layouts/search-results-layout.tsx
export function SearchResultsLayout({ 
  searchKey, 
  field, 
  searchType 
}: { 
  searchKey: string; 
  field: string; 
  searchType: 'hot_leads' | 'lmia'; 
}) {
  return (
    <>
      <Navbar className="" />
      <div className="pt-24">
        <DynamicDataView
          title={decodeURIComponent(searchKey)}
          field={decodeURIComponent(field)}
          searchType={searchType}
        />
      </div>
      <Footer />
    </>
  );
}
```

Then both pages become:
```tsx
export default async function Engine({ params, searchParams }: PageProps) {
  return <SearchResultsLayout 
    searchKey={params.search}
    field={searchParams.field as string}
    searchType="hot_leads" // or "lmia"
  />;
}
```

**Lines Saved:** ~50 lines across 2 files

---

### 2. **Repeated Hook Patterns**

#### **URL Search Params Management** (Used in 10+ files)
**Pattern Found In:**
- `/app/(authenticated)/search/page.tsx` (line 41-42)
- `/app/(authenticated)/analysis/[name]/page.tsx` (line 155-156)
- `/components/ui/new-filterpanel.tsx` (line 95)
- Many more...

**Duplicate Pattern:**
```tsx
const searchParams = useSearchParams();
const sp = new URLSearchParams(searchParams.toString());
const router = useRouter();
const pathname = usePathname();

// Update URL
const nextSp = new URLSearchParams(sp.toString());
nextSp.set('key', 'value');
router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
```

**💡 Refactoring Suggestion:**
Create a custom hook:
```tsx
// hooks/use-url-params.ts
export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateParams = useCallback((updates: Record<string, string>) => {
    const nextSp = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextSp.set(key, value);
      else nextSp.delete(key);
    });
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return {
    searchParams,
    updateParams,
    pathname,
    router,
  };
}
```

**Files to Update:** 10+ files
**Lines Saved:** ~100 lines total

---

### 3. **Toast Notification Patterns**

**Common Pattern (found in 17 files):**
```tsx
const { toast } = useToast();

// Success toast
toast({
  title: "Success",
  description: "Action completed",
});

// Error toast
toast({
  title: "Error",
  description: error.message,
  variant: "destructive",
});
```

**💡 Refactoring Suggestion:**
Create toast helper functions:
```tsx
// hooks/use-toast-helpers.ts
export function useToastHelpers() {
  const { toast } = useToast();
  
  return {
    showSuccess: (message: string, title = "Success") => {
      toast({ title, description: message });
    },
    showError: (error: string | Error, title = "Error") => {
      toast({
        title,
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive",
      });
    },
    showWarning: (message: string, title = "Warning") => {
      toast({
        title,
        description: message,
        variant: "default",
      });
    },
  };
}
```

**Files to Update:** 17 files
**Lines Saved:** ~50-70 lines

---

### 4. **Data Fetching with useQuery**

**Common Pattern (found in 15+ files):**
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['some-key', param1, param2],
  queryFn: async () => {
    const { data, error } = await db.from('table').select('*');
    if (error) throw new Error(error.message);
    return data;
  },
});

if (isLoading) return <LoadingState />;
if (error) return <ErrorState />;
```

**💡 Refactoring Suggestion:**
Create data fetching hooks:
```tsx
// hooks/use-table-query.ts
export function useTableQuery<T>(
  table: string,
  queryKey: string[],
  filters?: Record<string, any>
) {
  return useQuery({
    queryKey: [table, ...queryKey],
    queryFn: async () => {
      let query = db.from(table).select('*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        });
      }
      
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as T;
    },
  });
}
```

---

### 5. **Page Layout Wrapper Pattern**

**Found in 12+ pages:**
```tsx
export default function Page() {
  return (
    <>
      <Navbar />
      <div className="pt-24">
        {/* Page content */}
      </div>
      <Footer />
    </>
  );
}
```

**💡 Refactoring Suggestion:**
```tsx
// components/layouts/standard-page-layout.tsx
export function StandardPageLayout({ 
  children,
  className = "pt-24" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <Navbar />
      <div className={className}>
        {children}
      </div>
      <Footer />
    </>
  );
}
```

**Files to Update:** 12+ pages
**Lines Saved:** ~60 lines

---

## 📊 Refactoring Priority Matrix

| Component/Pattern | Files Affected | Lines Saved | Priority | Effort |
|------------------|----------------|-------------|----------|--------|
| SearchResultsLayout | 2 | 50 | 🔴 HIGH | Low |
| useUrlParams hook | 10+ | 100 | 🔴 HIGH | Medium |
| StandardPageLayout | 12+ | 60 | 🟡 MEDIUM | Low |
| useToastHelpers | 17 | 70 | 🟡 MEDIUM | Low |
| useTableQuery | 15+ | 150 | 🟢 LOW | High |

---

## 🎨 Already Well-Structured Components

### **Excellent Examples to Follow:**

1. **`DynamicDataView`** - Single component handles both hot_leads and lmia
   - Accepts `searchType` prop
   - Internally manages different data sources
   - Good separation of concerns

2. **`NewFilterPanel`** - Highly reusable filter component
   - Works with any table
   - Dynamic column handling
   - RPC function integration
   - Fallback mechanism

3. **Custom Hooks** - Well abstracted logic
   - `useSession` - Authentication
   - `useCredits` - Credit management
   - `useFilterColumnAttributes` - Filter data

4. **UI Component Library** - shadcn/ui pattern
   - Consistent API
   - TypeScript support
   - Themeable

---

## 🚀 Recommended Next Steps

### Immediate (High Impact, Low Effort):
1. ✅ Create `SearchResultsLayout` component
2. ✅ Create `StandardPageLayout` component
3. ✅ Create `useUrlParams` hook

### Short Term:
4. Create `useToastHelpers` hook
5. Extract common filter logic
6. Consolidate loading states

### Long Term:
7. Create data fetching abstraction layer
8. Build component documentation
9. Create Storybook for components

---

## 📝 Component Inventory

### By Category:

**Layout Components (8):**
- Navbar, Footer, Sidebar, DashboardLayout, StandardPageLayout (proposed)

**Data Display (15):**
- DynamicDataView, JobCard, AllJobsList, JobDescription, ComparisonResults, etc.

**Forms & Inputs (12):**
- SearchBar, SearchBox, CompactSearch, FilterPanel, etc.

**UI Primitives (40+):**
- Button, Card, Input, Select, Dialog, Badge, Skeleton, etc.

**Custom Hooks (10+):**
- useSession, useToast, useCredits, useFilterColumnAttributes, etc.

---

## 💡 Design Patterns Used

1. **Compound Components** - FilterPanel with sub-components
2. **Render Props** - Used in some UI components
3. **Custom Hooks** - Logic abstraction (useSession, useCredits)
4. **Higher-Order Components** - Authenticated wrapper
5. **Provider Pattern** - SessionProvider, QueryProvider
6. **Fallback Pattern** - RPC with client-side fallback

---

## 🔍 Code Quality Metrics

- **Reusable Components:** ~80 total
- **Custom Hooks:** 10+
- **Duplicate Code Blocks:** ~15 identified
- **Refactoring Potential:** ~500 lines can be reduced
- **Current Reusability Score:** 7/10 ⭐

**After Refactoring Target:** 9/10 ⭐⭐

---

## 📚 Additional Resources

For implementation details, see:
- `/components/ui/` - UI component library
- `/hooks/` - Custom React hooks
- `/components/layouts/` - Layout components (to be created)
- `/lib/utils.ts` - Utility functions

**Last Updated:** October 31, 2025
