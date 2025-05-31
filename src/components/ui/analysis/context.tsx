interface AnalysisContextProps {
  // The column being analyzed
  field: string;
  // The base field used as reference (e.g. job_title)
  baseField: string;
  // The value of the base field
  baseValue: string;
  // Total number of records in the analysis
  totalRecords: number;
  // Information about the most common value
  mostCommonValue?: {
    label: string; // The value that appears most frequently
    percentage: number; // What percentage of total records this represents
  };
  // Optional loading state
  isLoading?: boolean;
}

export function AnalysisContext({
  field,
  baseField,
  baseValue,
  totalRecords,
  mostCommonValue,
  isLoading = false,
}: AnalysisContextProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-50 p-3 rounded-lg space-y-2 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
      <h3 className="text-sm font-medium text-gray-600">Current Analysis</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Analyzing:</span>
        <span className="font-medium text-gray-900">{field}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">For {baseField}:</span>
        <span className="font-medium text-gray-900">{baseValue}</span>
      </div>
      <div className="grid grid-cols-2 gap-6 mt-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Similar Positions</p>
          <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
        </div>
        {mostCommonValue && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Most Common {field}</p>
            <p className="text-lg font-semibold text-gray-800">
              {mostCommonValue.label}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({Math.round(mostCommonValue.percentage)}%)
              </span>
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">
        This analysis shows how {field} is distributed across positions similar
        to {baseValue}
      </p>
    </div>
  );
}
