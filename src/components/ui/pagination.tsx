import { useTableStore } from "@/context/store";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {

  const {dataConfig , setDataConfig} = useTableStore()
  const handlePageChange = (page: number) => {
    onPageChange(page);

    setDataConfig({
  ...(dataConfig || {}),
  page : page,
});
    // Use setTimeout to ensure the scroll happens after the page update
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "instant", // Use instant scroll for better reliability
      });
    }, 100);
  };


  const handlePagination = (newPage : number) => {
    setDataConfig(prevConfig => ({
      ...(prevConfig || {}), 
      page: newPage,         
    } ))
  }
  const renderPageNumbers = () => {
    const pages = [];
    let start = 1;
    let end = totalPages;
    if (totalPages > 7) {
      if (currentPage <= 4) {
        end = 7;
      } else if (currentPage + 3 >= totalPages) {
        start = totalPages - 6;
      } else {
        start = currentPage - 3;
        end = currentPage + 3;
      }
    }

    // First page
    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            i === currentPage
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "text-gray-600 hover:bg-gray-50"
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
          className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {totalPages}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 px-2 py-1">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          aria-label="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          aria-label="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
      <span className="text-sm text-gray-500 ml-4">
        Page {currentPage} of {totalPages || 1}
      </span>
    </div>
  );
}
