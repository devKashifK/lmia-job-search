"use client";

import React, { createContext, useContext, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SheetContextType {
  showSheet: (props: ShowSheetProps) => void;
  hideSheet: () => void;
}

interface ShowSheetProps {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  className?: string;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState<ShowSheetProps | null>(null);

  const showSheet = (props: ShowSheetProps) => {
    setSheetContent(props);
    setIsOpen(true);
  };

  const hideSheet = () => {
    setIsOpen(false);
    setTimeout(() => setSheetContent(null), 300);
  };

  return (
    <SheetContext.Provider value={{ showSheet, hideSheet }}>
      {children}
      {sheetContent && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="right"
            className={cn("p-0 w-full sm:w-[540px]", sheetContent.className)}
          >
            {React.createElement(sheetContent.component, {
              ...sheetContent.props,
              onClose: hideSheet,
            })}
          </SheetContent>
        </Sheet>
      )}
    </SheetContext.Provider>
  );
}

export const useSheet = () => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("useSheet must be used within a SheetProvider");
  }
  return context;
};
