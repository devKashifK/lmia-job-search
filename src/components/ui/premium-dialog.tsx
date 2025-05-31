"use client";
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AnalyticsExplorer from "./analytics-explorer";

export function PremiumDialog({
  open,
  onOpenChange,
  selectedValue,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedValue: any;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[98%] max-w-[98%] p-0 h-[94vh] flex flex-col">
        <DialogTitle className="sr-only">Analytics</DialogTitle>

        <AnalyticsExplorer selectedValue={selectedValue} />
      </DialogContent>
    </Dialog>
  );
}
