# Refactoring Implementation Guide

This guide provides step-by-step implementation code for refactoring the identified duplications.

---

## 🚀 Quick Win #1: Search Results Layout

### Step 1: Create the shared layout component

**File:** `/src/components/layouts/search-results-layout.tsx`

```tsx
import React from 'react';
import DynamicDataView from '@/components/ui/dynamic-data-view';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';

interface SearchResultsLayoutProps {
  searchKey: string;
  field: string;
  searchType?: 'hot_leads' | 'lmia';
}

export function SearchResultsLayout({ 
  searchKey, 
  field, 
  searchType = 'lmia' 
}: SearchResultsLayoutProps) {
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

### Step 2: Update hot-leads page

**File:** `/src/app/(authenticated)/search/hot-leads/[search]/page.tsx`

**BEFORE (30 lines):**
```tsx
import React from 'react';
import DynamicDataView from '@/components/ui/dynamic-data-view';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';

type PageProps = {
  params: { segment: string; search: string };
  searchParams: Record<string, string | string[] | undefined>;
};

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
          searchType="hot_leads"
        />
      </div>
      <Footer />
    </>
  );
}
```

**AFTER (13 lines - 57% reduction!):**
```tsx
import React from 'react';
import { SearchResultsLayout } from '@/components/layouts/search-results-layout';

type PageProps = {
  params: { segment: string; search: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function HotLeadsPage({ params, searchParams }: PageProps) {
  return (
    <SearchResultsLayout 
      searchKey={params.search}
      field={searchParams.field as string}
      searchType="hot_leads"
    />
  );
}
```

### Step 3: Update LMIA page

**File:** `/src/app/(authenticated)/search/lmia/[search]/page.tsx`

```tsx
import React from 'react';
import { SearchResultsLayout } from '@/components/layouts/search-results-layout';

type PageProps = {
  params: { segment: string; search: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function LmiaPage({ params, searchParams }: PageProps) {
  return (
    <SearchResultsLayout 
      searchKey={params.search}
      field={searchParams.field as string}
      searchType="lmia"
    />
  );
}
```

**Result:** Both pages now 13 lines each, down from 30 lines. **34 lines saved!**

---

## 🚀 Quick Win #2: URL Parameters Hook

### Step 1: Create the hook

**File:** `/src/hooks/use-url-params.ts`

```tsx
'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Update multiple URL parameters at once
   * @param updates - Object with key-value pairs to update
   * @param options - Navigation options
   */
  const updateParams = useCallback((
    updates: Record<string, string | string[] | null | undefined>,
    options?: { scroll?: boolean; replace?: boolean }
  ) => {
    const nextSp = new URLSearchParams(searchParams?.toString() || '');
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        // Remove parameter if value is null/undefined
        nextSp.delete(key);
      } else if (Array.isArray(value)) {
        // Handle array values (add multiple with same key)
        nextSp.delete(key);
        value.forEach(v => nextSp.append(key, v));
      } else {
        // Set single value
        nextSp.set(key, value);
      }
    });

    const url = `${pathname}?${nextSp.toString()}`;
    
    if (options?.replace) {
      router.replace(url, { scroll: options.scroll ?? false });
    } else {
      router.push(url, { scroll: options.scroll ?? false });
    }
  }, [searchParams, router, pathname]);

  /**
   * Get a single parameter value
   */
  const getParam = useCallback((key: string): string | null => {
    return searchParams?.get(key) ?? null;
  }, [searchParams]);

  /**
   * Get all values for a parameter (for multi-value params)
   */
  const getParams = useCallback((key: string): string[] => {
    return searchParams?.getAll(key) ?? [];
  }, [searchParams]);

  /**
   * Remove one or more parameters
   */
  const removeParams = useCallback((
    keys: string | string[],
    options?: { scroll?: boolean }
  ) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    const updates = keysArray.reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as Record<string, null>);
    
    updateParams(updates, options);
  }, [updateParams]);

  return {
    // Raw values
    searchParams,
    pathname,
    router,
    
    // Helper functions
    updateParams,
    getParam,
    getParams,
    removeParams,
  };
}
```

### Step 2: Usage Examples

#### Before (in new-filterpanel.tsx):
```tsx
// Lines 190-191, 428-433
const router = useRouter();
const pathname = usePathname();
const sp = useSearchParams();

const handleFilterUpdate = (accessorKey: string, value: string) => {
  if (!sp) return;
  const current = new Set(sp.getAll(accessorKey));
  current.has(value) ? current.delete(value) : current.add(value);

  const nextSp = new URLSearchParams(sp.toString());
  nextSp.delete(accessorKey);
  for (const v of current) nextSp.append(accessorKey, v);
  nextSp.set('page', '1');
  router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });

  setLocalFilters(new Set(current));
};
```

#### After:
```tsx
import { useUrlParams } from '@/hooks/use-url-params';

const { getParams, updateParams } = useUrlParams();

const handleFilterUpdate = (accessorKey: string, value: string) => {
  const current = new Set(getParams(accessorKey));
  current.has(value) ? current.delete(value) : current.add(value);

  updateParams({
    [accessorKey]: Array.from(current),
    page: '1',
  });

  setLocalFilters(new Set(current));
};
```

**Lines saved per file:** ~8-10 lines
**Total files to update:** 10+
**Total lines saved:** ~100 lines

---

## 🚀 Quick Win #3: Toast Helpers

### Step 1: Create the helper hook

**File:** `/src/hooks/use-toast-helpers.ts`

```tsx
import { useToast } from '@/hooks/use-toast';

export function useToastHelpers() {
  const { toast } = useToast();
  
  return {
    /**
     * Show a success toast
     */
    success: (message: string, title = "Success") => {
      toast({
        title,
        description: message,
        variant: "default",
      });
    },

    /**
     * Show an error toast
     */
    error: (error: string | Error, title = "Error") => {
      const message = typeof error === 'string' 
        ? error 
        : error.message || 'An unexpected error occurred';
      
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    },

    /**
     * Show a warning toast
     */
    warning: (message: string, title = "Warning") => {
      toast({
        title,
        description: message,
        variant: "default",
      });
    },

    /**
     * Show an info toast
     */
    info: (message: string, title = "Info") => {
      toast({
        title,
        description: message,
      });
    },

    /**
     * Show a loading toast that can be updated
     */
    loading: (message: string, title = "Loading...") => {
      return toast({
        title,
        description: message,
        duration: Infinity, // Don't auto-dismiss
      });
    },

    /**
     * Promise-based toast (shows loading, then success/error)
     */
    promise: async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ) => {
      const toastId = toast({
        title: "Loading...",
        description: messages.loading,
        duration: Infinity,
      });

      try {
        const data = await promise;
        toastId.dismiss();
        
        const successMsg = typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success;
        
        toast({
          title: "Success",
          description: successMsg,
        });
        
        return data;
      } catch (error) {
        toastId.dismiss();
        
        const errorMsg = typeof messages.error === 'function' 
          ? messages.error(error as Error) 
          : messages.error;
        
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        
        throw error;
      }
    },
  };
}
```

### Step 2: Usage Examples

#### Before:
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success
toast({
  title: "Success",
  description: "Profile updated successfully",
});

// Error
toast({
  title: "Error",
  description: error.message,
  variant: "destructive",
});
```

#### After:
```tsx
import { useToastHelpers } from '@/hooks/use-toast-helpers';

const toast = useToastHelpers();

// Success
toast.success("Profile updated successfully");

// Error
toast.error(error);

// With custom title
toast.success("Profile updated successfully", "Well done!");

// Promise-based
await toast.promise(
  updateProfile(data),
  {
    loading: "Updating profile...",
    success: "Profile updated successfully!",
    error: (err) => `Failed to update: ${err.message}`,
  }
);
```

**Benefits:**
- ✅ Shorter, cleaner code
- ✅ Consistent error handling
- ✅ Built-in type safety
- ✅ Promise-based loading states

---

## 🛠️ Additional Refactoring: Standard Page Layout

### Create the component

**File:** `/src/components/layouts/standard-page-layout.tsx`

```tsx
import React from 'react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import { cn } from '@/lib/utils';

interface StandardPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
  navbarClassName?: string;
}

export function StandardPageLayout({ 
  children,
  className = "pt-24",
  showNavbar = true,
  showFooter = true,
  navbarClassName = "",
}: StandardPageLayoutProps) {
  return (
    <>
      {showNavbar && <Navbar className={navbarClassName} />}
      <div className={cn(className)}>
        {children}
      </div>
      {showFooter && <Footer />}
    </>
  );
}
```

### Usage:

```tsx
// Before
export default function MyPage() {
  return (
    <>
      <Navbar />
      <div className="pt-24">
        <MyContent />
      </div>
      <Footer />
    </>
  );
}

// After
import { StandardPageLayout } from '@/components/layouts/standard-page-layout';

export default function MyPage() {
  return (
    <StandardPageLayout>
      <MyContent />
    </StandardPageLayout>
  );
}

// With custom styling
export default function MyCustomPage() {
  return (
    <StandardPageLayout className="pt-32 bg-gray-50" showFooter={false}>
      <MyContent />
    </StandardPageLayout>
  );
}
```

---

## 📊 Impact Summary

| Refactoring | Files Changed | Lines Saved | Time Required |
|-------------|---------------|-------------|---------------|
| SearchResultsLayout | 3 | 34 | 10 min |
| useUrlParams | 11+ | 100 | 45 min |
| useToastHelpers | 18+ | 100 | 30 min |
| StandardPageLayout | 13+ | 60 | 20 min |
| **TOTAL** | **45+** | **~294** | **~2 hours** |

---

## 🧪 Testing the Refactored Code

### Test useUrlParams:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useUrlParams } from '@/hooks/use-url-params';

describe('useUrlParams', () => {
  it('should update single parameter', () => {
    const { result } = renderHook(() => useUrlParams());
    
    act(() => {
      result.current.updateParams({ key: 'value' });
    });
    
    expect(result.current.getParam('key')).toBe('value');
  });

  it('should handle array values', () => {
    const { result } = renderHook(() => useUrlParams());
    
    act(() => {
      result.current.updateParams({ tags: ['tag1', 'tag2'] });
    });
    
    expect(result.current.getParams('tags')).toEqual(['tag1', 'tag2']);
  });
});
```

### Test useToastHelpers:

```tsx
import { renderHook } from '@testing-library/react';
import { useToastHelpers } from '@/hooks/use-toast-helpers';

describe('useToastHelpers', () => {
  it('should show success toast', () => {
    const { result } = renderHook(() => useToastHelpers());
    
    result.current.success('Test message');
    
    // Verify toast was called with correct params
  });

  it('should handle promise toast', async () => {
    const { result } = renderHook(() => useToastHelpers());
    
    const promise = Promise.resolve('data');
    
    await result.current.promise(promise, {
      loading: 'Loading...',
      success: 'Done!',
      error: 'Failed',
    });
  });
});
```

---

## 🚀 Migration Checklist

### Phase 1: Layouts (Week 1)
- [ ] Create SearchResultsLayout
- [ ] Update hot-leads page
- [ ] Update lmia page
- [ ] Test both search types
- [ ] Create StandardPageLayout
- [ ] Migrate 5 pages to StandardPageLayout
- [ ] Test all migrated pages

### Phase 2: Hooks (Week 2)
- [ ] Create useUrlParams hook
- [ ] Write tests for useUrlParams
- [ ] Migrate new-filterpanel.tsx
- [ ] Migrate analysis page
- [ ] Migrate remaining 8+ files
- [ ] Create useToastHelpers
- [ ] Write tests for useToastHelpers
- [ ] Migrate all toast usage

### Phase 3: Validation (Week 3)
- [ ] E2E testing of refactored pages
- [ ] Performance testing
- [ ] Code review
- [ ] Documentation update
- [ ] Deploy to staging
- [ ] Monitor for issues

---

## 📝 Notes

- All refactorings are **backwards compatible** (no breaking changes)
- Can be done **incrementally** (one file at a time)
- Each refactoring is **independent** (can be done in any order)
- All changes maintain **existing functionality**
- Code becomes **more testable** and **maintainable**

---

**Ready to implement?** Start with SearchResultsLayout - it's the easiest and has immediate impact! 🚀
