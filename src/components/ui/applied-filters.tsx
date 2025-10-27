'use client';

import * as React from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AttributeName } from '@/helpers/attribute';
import { format, parseISO, isValid } from 'date-fns';

type SelectedFilter = { column: string; value: string };

function fmtDate(s?: string) {
  if (!s) return '…';
  const d = parseISO(s);
  return isValid(d) ? format(d, 'MMM d, yyyy') : s; // fallback to raw if not ISO
}

export default function AppliedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Get table name from URL
  const tableName = (sp?.get('t') ?? 'trending_job').trim();

  // Get selected filters from URL
  const selectedFilters = React.useMemo(() => {
    if (!sp) return [];
    const filters: SelectedFilter[] = [];
    const filterKeys = [
      'state',
      'city',
      'category',
      'job_title',
      'noc_code',
      'employer',
      'territory',
    ];

    filterKeys.forEach((key) => {
      const values = sp.getAll(key);
      values.forEach((value) => {
        filters.push({ column: key, value });
      });
    });

    return filters;
  }, [sp]);

  // Get date range from URL
  const dateFrom = sp?.get('date_from');
  const dateTo = sp?.get('date_to');

  const handleRemoveFilter = (column: string, value: string) => {
    if (!sp) return;
    const nextSp = new URLSearchParams(sp.toString());
    const current = new Set(nextSp.getAll(column));
    current.delete(value);
    nextSp.delete(column);
    for (const v of current) nextSp.append(column, v);
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
  };

  const clearDateRange = () => {
    if (!sp) return;
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.delete('date_from');
    nextSp.delete('date_to');
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    if (!sp) return;
    const nextSp = new URLSearchParams();
    // Preserve essential parameters
    for (const key of ['t', 'field', 'page', 'pageSize']) {
      const v = sp.get(key);
      if (v) nextSp.set(key, v);
    }
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, {
      scroll: false,
    });
  };

  // Don't render if no filters are applied
  if (selectedFilters.length === 0 && !dateFrom && !dateTo) {
    return null;
  }

  return (
    <div className="px-0 pb-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          {(selectedFilters.length > 0 || dateFrom || dateTo) && (
            <span className="text-xs text-gray-500">
              {selectedFilters.length + (dateFrom || dateTo ? 1 : 0)} active
            </span>
          )}
        </div>
        {(selectedFilters.length > 0 || dateFrom || dateTo) && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedFilters.map((filter) => (
          <div
            key={`${filter.column}-${filter.value}`}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-brand-50 border border-brand-200 rounded-md text-xs group hover:bg-brand-100 transition-colors"
          >
            <span className="text-brand-600 font-semibold">
              <AttributeName name={filter.column} />
            </span>
            <span className="text-brand-400">•</span>
            <span className="text-brand-900 font-medium">{filter.value}</span>
            <button
              onClick={() => handleRemoveFilter(filter.column, filter.value)}
              className="ml-1 text-brand-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {(dateFrom || dateTo) && (
          <div className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-brand-50 border border-brand-200 rounded-md text-xs group hover:bg-brand-100 transition-colors">
            <CalendarIcon className="w-3 h-3 text-brand-500" />
            <span className="text-brand-600 font-semibold">
              {tableName === 'lmia' ? 'Year' : 'Date'}
            </span>
            <span className="text-brand-400">•</span>
            <span className="text-brand-900 font-medium">
              {fmtDate(dateFrom)} - {fmtDate(dateTo)}
            </span>
            <button
              onClick={clearDateRange}
              className="ml-1 text-brand-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
