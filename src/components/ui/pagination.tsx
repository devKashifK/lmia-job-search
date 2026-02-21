import { useTableStore } from '@/context/store';
import React from 'react';
import useMobile from '@/hooks/use-mobile';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  const { dataConfig, setDataConfig } = useTableStore();
  const { isMobile } = useMobile();

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      // Use the provided onPageChange function (for NewDataPanel)
      onPageChange(page);
    } else {
      // Use the store method (for DataPanel)
      setDataConfig({
        ...(dataConfig || {}),
        page: String(page),
      });
    }
    // Use setTimeout to ensure the scroll happens after the page update
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }, 100);
  };

  const renderPageNumbers = () => {
    const pages = [];
    let start = 1;
    let end = totalPages;

    // Mobile: Show maximum 3 pages, Desktop: 7 pages
    const maxPages = isMobile ? 3 : 7;
    const range = isMobile ? 1 : 3;

    if (totalPages > maxPages) {
      if (currentPage <= range + 1) {
        end = maxPages;
      } else if (currentPage + range >= totalPages) {
        start = totalPages - (maxPages - 1);
      } else {
        start = currentPage - range;
        end = currentPage + range;
      }
    }

    // First page
    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={isMobile ? "px-2 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors" : "px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"}
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 text-gray-400">
            •••
          </span>
        );
      }
    }

    // Page numbers
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${isMobile ? 'px-2 py-1.5' : 'px-3 py-1.5'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium transition-colors ${i === currentPage
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'text-gray-600 hover:bg-gray-50'
            }`}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 text-gray-400">
            •••
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={isMobile ? "px-2 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors" : "px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"}
        >
          {totalPages}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-center gap-1'} ${className}`}>
      <div className={`flex items-center ${isMobile ? 'gap-0.5' : 'gap-1'} rounded-lg px-2 py-1 ${isMobile ? 'justify-center' : ''}`}>
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`${isMobile ? 'p-1' : 'p-1.5'} rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors`}
          aria-label="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isMobile ? "16" : "20"}
            height={isMobile ? "16" : "20"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        {renderPageNumbers()}
        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className={`${isMobile ? 'p-1' : 'p-1.5'} rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors`}
          aria-label="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isMobile ? "16" : "20"}
            height={isMobile ? "16" : "20"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
      <span className={`${isMobile ? 'text-xs text-center' : 'text-sm ml-4'} text-gray-500`}>
        Page {currentPage} of {totalPages || 1}
      </span>
    </div>
  );
}
