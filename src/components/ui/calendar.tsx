"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon, Check, X } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showManualInput?: boolean;
  showActionButtons?: boolean;
  onApply?: () => void;
  onClear?: () => void;
  onSelect?: any;
  selected?: any;
  mode?: any;
}

// Simple inline dropdown without Portal
function InlineSelect({
  value,
  onValueChange,
  options,
  className
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          "flex h-7 items-center justify-between rounded-md border border-gray-200 bg-white px-2 text-xs hover:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500",
          className
        )}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-[200px] overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onValueChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 py-1.5 text-left text-xs hover:bg-brand-50 focus:bg-brand-50",
                value === option.value && "bg-brand-50 font-medium"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom caption with inline dropdowns
function CustomCaption(props: any) {
  const { displayMonth } = props;

  // Always use displayMonth from DayPicker - this ensures each calendar shows its correct month
  const month = displayMonth.getMonth();
  const year = displayMonth.getFullYear();

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="text-sm font-semibold text-gray-800">
      {months[month]} {year}
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showManualInput = false,
  showActionButtons = false,
  onApply,
  onClear,
  selected,
  onSelect,
  mode,
  ...props
}: CalendarProps) {
  const [manualFrom, setManualFrom] = React.useState("");
  const [manualTo, setManualTo] = React.useState("");
  const [month, setMonth] = React.useState<Date | undefined>(
    props.defaultMonth || (selected as any)?.from || new Date()
  );

  // Update manual inputs when calendar selection changes
  React.useEffect(() => {
    if (mode === "range" && selected) {
      const range = selected as { from?: Date; to?: Date };
      if (range.from) {
        setManualFrom(formatDate(range.from));
      }
      if (range.to) {
        setManualTo(formatDate(range.to));
      }
    } else if (mode === "single" && selected) {
      const date = selected as Date;
      setManualFrom(formatDate(date));
    }
  }, [selected, mode]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.split('-');
    if (parts.length !== 3) return undefined;
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
    return new Date(year, month, day);
  };

  const handleManualFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualFrom(value);

    const newFromDate = parseDate(value);
    if (newFromDate && onSelect) {
      if (mode === "range") {
        const range = (selected as { from?: Date; to?: Date }) || {};
        // @ts-ignore - onSelect signature varies by mode
        onSelect({ from: newFromDate, to: range.to });
      } else {
        // @ts-ignore
        onSelect(newFromDate);
      }
    }
  };

  const handleManualToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualTo(value);

    if (mode === "range") {
      const newToDate = parseDate(value);
      if (newToDate && onSelect) {
        const range = (selected as { from?: Date; to?: Date }) || {};
        // @ts-ignore
        onSelect({ from: range.from, to: newToDate });
      }
    }
  };

  // Create a custom caption component with access to setMonth
  const CaptionWithMonthControl = React.useCallback((captionProps: any) => {
    return <CustomCaption {...captionProps} onMonthChange={setMonth} />;
  }, [setMonth]);

  return (
    <div className="bg-white rounded-lg">
      {showManualInput && (
        <div className="px-2 pt-2 pb-1.5 border-b border-gray-100">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Quick Entry</Label>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-0.5">
                <Label htmlFor="from-date" className="text-[9px] text-gray-500">
                  From
                </Label>
                <Input
                  id="from-date"
                  type="date"
                  value={manualFrom}
                  onChange={handleManualFromChange}
                  className="h-6 text-[11px] border-gray-200 focus:border-brand-500 focus:ring-brand-500/20 px-1.5"
                  placeholder="YYYY-MM-DD"
                />
              </div>
              {mode === "range" && (
                <div className="space-y-0.5">
                  <Label htmlFor="to-date" className="text-[9px] text-gray-500">
                    To
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={manualTo}
                    onChange={handleManualToChange}
                    className="h-6 text-[11px] border-gray-200 focus:border-brand-500 focus:ring-brand-500/20 px-1.5"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DayPicker
        mode={mode}
        selected={selected}
        onSelect={onSelect as any}
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={showOutsideDays}
        className={cn("p-1.5", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0",
          month: " space-y-2",
          caption: "flex justify-center pb-1 relative items-center",
          caption_label: "text-xs font-semibold text-gray-800",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-6 w-6 bg-white p-0 border-gray-300 text-gray-700 hover:bg-brand-50 hover:border-brand-500 hover:text-brand-700"
          ),
          nav_button_previous: "absolute left-1 z-10",
          nav_button_next: "absolute right-1 z-10",
          table: "w-full border-collapse space-y-0.5",
          head_row: "flex",
          head_cell:
            "text-gray-500 rounded-md w-6 font-medium text-[9px] uppercase",
          row: "flex w-full mt-0.5",
          cell: cn(
            "relative p-0 text-center text-xs focus-within:relative focus-within:z-20",
            mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-6 w-6 p-0 font-normal text-[11px] hover:bg-brand-50 hover:text-brand-700"
          ),
          day_range_start: "day-range-start rounded-l-md",
          day_range_end: "day-range-end rounded-r-md",
          day_selected:
            "bg-brand-600 text-white hover:bg-brand-700 hover:text-white focus:bg-brand-700 focus:text-white font-semibold",
          day_today: "bg-gray-100 text-gray-900 font-semibold",
          day_outside:
            "day-outside text-gray-400 opacity-50",
          day_disabled: "text-gray-300 opacity-30",
          day_range_middle:
            "aria-selected:bg-brand-100 aria-selected:text-brand-900",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ className, ...props }) => (
            <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn("h-4 w-4", className)} {...props} />
          ),
        }}
        {...props}
      />

      {showActionButtons && (
        <div className="flex gap-1.5 px-2 pb-2 pt-1.5 border-t border-gray-100">
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear?.();
            }}
            variant="outline"
            className="flex-1 h-7 text-[11px] border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X className="h-2.5 w-2.5 mr-1" />
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onApply?.();
            }}
            className="flex-1 h-7 text-[11px] bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Check className="h-2.5 w-2.5 mr-1" />
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
