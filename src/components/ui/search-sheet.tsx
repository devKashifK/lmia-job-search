"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTableStore } from "@/context/store";

interface SearchSheetProps {
  children?: React.ReactNode;
  title: string;
  description?: string;
  side?: "top" | "right" | "bottom" | "left";
  component?: React.ComponentType<any>;
  componentProps?: Record<string, any>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSheet({
  children,
  title,
  description,
  side = "right",
  component: Component,
  componentProps = {},
  isOpen,
  onOpenChange,
}: SearchSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-4">
          {Component ? <Component {...componentProps} /> : children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
