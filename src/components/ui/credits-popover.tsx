"use client";

import React from "react";
import { Wallet, Sparkles, ArrowUpRight, Zap, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCreditData } from "@/hooks/use-credits";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CreditsPopover() {
  const { creditData, creditRemaining, isUnlimited, isLoading } = useCreditData();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 opacity-50 animate-pulse">
        <Wallet className="h-5 w-5" />
      </Button>
    );
  }

  const totalCredits = creditData?.total_credit ?? 0;
  const usedCredits = creditData?.used_credit ?? 0;
  const progress = isUnlimited ? 100 : (totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0);
  const planName = creditData?.plan_type?.toUpperCase() ?? "FREE";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all duration-300",
            creditRemaining < 5 && !isUnlimited && "text-red-500 hover:text-red-600 hover:bg-red-50"
          )}
        >
          <Wallet className="h-5 w-5" />
          {!isUnlimited && creditRemaining <= 10 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-2 ring-white">
              !
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden rounded-3xl border-gray-200/50 shadow-2xl backdrop-blur-xl" align="end" sideOffset={12}>
        {/* Header */}
        <div className="bg-brand-900 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-[10px] font-black tracking-widest uppercase">{planName} PLAN</span>
              </div>
              <Zap className={cn("w-5 h-5", isUnlimited ? "text-brand-400 animate-pulse" : "text-white/20")} />
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Available Searches</span>
              <span className="text-3xl font-black tracking-tighter">
                {isUnlimited ? "∞ Unlimited" : creditRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
              <span>{isUnlimited ? "Total Searches" : "Monthly Usage"}</span>
              <span className="text-brand-600">{usedCredits} / {totalCredits === 99999 || totalCredits === 0 && isUnlimited ? "Unlimited" : totalCredits}</span>
            </div>
            {!isUnlimited || (totalCredits > 0 && totalCredits < 99999) ? (
              <Progress value={progress} className="h-2.5 bg-slate-100" indicatorClassName="bg-brand-500 shadow-[0_0_15px_rgba(15,123,94,0.3)] transition-all duration-1000" />
            ) : (
              <div className="h-2.5 w-full bg-brand-50 rounded-full overflow-hidden">
                <div className="h-full w-full bg-brand-500/20 animate-pulse" />
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
              {isUnlimited ? "Unlimited access active" : "Credits reset on the 1st of every month"}
            </p>
          </div>

          {isUnlimited && (
            <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
              <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                You are on a <span className="font-black uppercase">{planName}</span> plan. High-volume usage is enabled and tracked for your account dashboard.
              </p>
            </div>
          )}

          <div className="pt-2">
            <Link href="/pricing">
              <Button className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs gap-2 group transition-all">
                {isUnlimited ? "Manage Subscription" : "Upgrade Plan"}
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
