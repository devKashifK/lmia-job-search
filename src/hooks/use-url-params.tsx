import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const nextSp = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) nextSp.set(key, value);
        else nextSp.delete(key);
      });
      router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return {
    searchParams,
    updateParams,
    pathname,
    router,
  };
}
