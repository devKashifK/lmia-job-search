import { X } from "lucide-react";
import { SheetClose } from "./sheet";

interface SheetHeaderProps {
  title: string;
  description?: string;
  onClose?: () => void;
}

export function SheetHeader({ title, description, onClose }: SheetHeaderProps) {
  return (
    <div className="flex flex-col bg-gradient-to-r from-brand-50 via-brand-50/50 to-white border-b border-brand-100/50">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex-1">
          <h2 className="text-[15px] font-semibold text-zinc-900 flex items-center gap-2">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-zinc-500/90 mt-0.5 font-medium">
              {description}
            </p>
          )}
        </div>
        <SheetClose
          onClick={onClose}
          className="rounded-full p-2 -m-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </div>
    </div>
  );
}
