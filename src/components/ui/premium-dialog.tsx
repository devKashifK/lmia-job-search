import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedColumn: string;
  handleSubscribe: () => void;
}

export function PremiumDialog({
  open,
  onOpenChange,
  selectedColumn,
  handleSubscribe,
}: PremiumDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-brand-600">
            <Lock className="h-5 w-5" />
            Premium Content
          </DialogTitle>
          <DialogDescription>
            Subscribe to unlock detailed information about {selectedColumn}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-brand-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Email Address
                  </p>
                  <p className="text-xs text-zinc-500">Contact information</p>
                </div>
              </div>
              <Lock className="h-4 w-4 text-brand-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-brand-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Phone Number
                  </p>
                  <p className="text-xs text-zinc-500">Direct contact</p>
                </div>
              </div>
              <Lock className="h-4 w-4 text-brand-600" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-brand-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure access to contact information</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-brand-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Unlimited access to all premium data</span>
            </div>
          </div>

          <Button
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium"
            onClick={handleSubscribe}
          >
            Subscribe Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
