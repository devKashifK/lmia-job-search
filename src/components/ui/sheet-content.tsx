import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

interface SheetContentBaseProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function SheetContentBase({
  title,
  description,
  children,
  onClose,
}: SheetContentBaseProps) {
  return (
    <div className="h-full flex flex-col">
      <SheetHeader className="relative pr-8">
        {title && <SheetTitle>{title}</SheetTitle>}
        {description && <SheetDescription>{description}</SheetDescription>}
        <button
          onClick={onClose}
          className="absolute right-0 top-0 p-2 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </SheetHeader>
      <div className="flex-1 mt-4 overflow-auto">{children}</div>
    </div>
  );
}
