import React from "react";
import { ChevronDown } from "lucide-react";

export interface SortOption {
  label: string;
  value: string;
}

interface SortButtonProps {
  options: SortOption[];
  currentSort: string;
  onSortChange: (value: string) => void;
  className?: string;
}

export default function SortButton({
  options,
  currentSort,
  onSortChange,
  className = "",
}: SortButtonProps) {
  const [showOptions, setShowOptions] = React.useState(false);

  const currentOption =
    options.find((opt) => opt.value === currentSort) || options[0];

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <span>Sort by: {currentOption.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            showOptions ? "rotate-180" : ""
          }`}
        />
      </button>
      {showOptions && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setShowOptions(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                  currentSort === option.value
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
