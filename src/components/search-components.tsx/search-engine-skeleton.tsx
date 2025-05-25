"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function TopbarSkeleton() {
  return (
    <div className="w-full h-14 flex items-center px-4 border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md bg-brand-100" />
        <Skeleton className="h-7 w-24 rounded bg-brand-50" />
      </div>
      {/* Center: Search/Actions */}
      <div className="flex-1 flex justify-center gap-3">
        <Skeleton className="h-9 w-80 rounded-lg bg-brand-50" />
        <Skeleton className="h-9 w-10 rounded-md bg-brand-50" />
        <Skeleton className="h-9 w-10 rounded-md bg-brand-50" />
      </div>
      {/* Right: Notifications/User */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full bg-brand-100" />
        <Skeleton className="h-8 w-8 rounded-full bg-brand-100" />
      </div>
    </div>
  );
}

export function SearchEngineSkeleton({
  showOverlay = true,
}: {
  showOverlay?: boolean;
}) {
  const { session } = useSession();
  const params = useParams();
  const searchKey = params?.search as string;

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col relative">
      {/* Topbar Skeleton */}
      <TopbarSkeleton />
      <div className="flex flex-1 min-h-0">
        {/* Filter Panel Skeleton */}
        <div className="w-[300px] shrink-0 h-full border-r border-zinc-200/50 bg-white/95 backdrop-blur-sm flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 px-3 py-2.5 border-b border-zinc-100 bg-gradient-to-r from-brand-50/80 to-white flex items-center gap-2">
            <div className="p-1 bg-brand-100 rounded-md">
              <Skeleton className="h-4 w-4 bg-brand-200" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-4 w-20 bg-brand-100" />
              <Skeleton className="h-2 w-16 bg-brand-50" />
            </div>
          </div>
          {/* Search */}
          <div className="flex-shrink-0 p-2 border-b border-zinc-100">
            <Skeleton className="h-8 w-full rounded-lg bg-brand-50" />
          </div>
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-zinc-100">
            <Skeleton className="h-8 w-1/2 rounded-none bg-brand-50" />
            <Skeleton className="h-8 w-1/2 rounded-none bg-brand-50" />
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-transparent">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded bg-brand-50" />
            ))}
          </div>
          {/* Footer for filter panel skeleton */}
          <div className="px-4 py-2 border-t border-zinc-100 bg-gradient-to-r from-brand-50/60 to-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 bg-brand-200 rounded-full" />
              <Skeleton className="h-3 w-32 bg-brand-50" />
            </div>
            <Skeleton className="h-3 w-10 bg-brand-100" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col gap-4 py-3 px-4">
          {/* Charts Section Skeleton */}
          <div className="flex flex-col">
            {/* Charts Header Skeleton */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 bg-gradient-to-r from-brand-50/80 to-white rounded-t-lg">
              <div className="p-1 bg-brand-100 rounded-md">
                <Skeleton className="h-3.5 w-3.5 bg-brand-200" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1 bg-brand-100" />
                <Skeleton className="h-2 w-24 bg-brand-50" />
              </div>
              <Skeleton className="h-6 w-6 bg-brand-100 rounded-md" />
            </div>
            {/* Charts Cards Skeleton */}
            <div className="flex gap-3 overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border-x border-b border-zinc-200/50 rounded-b-lg pt-3 pb-2 px-3">
              <div className="flex-1 h-[220px] rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100" />
              </div>
              <div className="flex-1 h-[220px] rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100" />
              </div>
              <div className="flex-1 h-[220px] rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100" />
              </div>
            </div>
          </div>
          {/* Table Skeleton */}
          <div className="flex-1 min-h-0">
            <div className="h-full shadow-lg rounded-lg overflow-hidden flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-8 gap-4 p-4 border-b">
                <Skeleton className="h-6 bg-gradient-to-br from-brand-50 to-brand-100" />
                <Skeleton className="h-6 bg-gradient-to-br from-brand-50 to-brand-100" />
                <Skeleton className="h-6 bg-gradient-to-br from-brand-50 to-brand-100" />
                <Skeleton className="h-6 bg-gradient-to-br from-brand-50 to-brand-100" />
                <Skeleton className="h-6 bg-gradient-to-br from-brand-50 to-brand-100" />
                <Skeleton className="h-6 bg-gradient-to-br from-brand-50 to-brand-100" />
                <Skeleton className="h-6 bg-gradient-to-br from-brand-50 to-brand-100" />
                <Skeleton className="h-6 bg-gradient-to-br from-brand-50 to-brand-100" />
              </div>
              {/* Table Rows */}
              <div className="space-y-2 p-4 flex-1 overflow-y-auto">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="grid grid-cols-8 gap-4">
                    <Skeleton className="h-4 bg-gradient-to-br from-brand-50 to-brand-100" />
                    <Skeleton className="h-4 bg-gradient-to-br from-brand-50 to-brand-100" />
                    <Skeleton className="h-4 bg-gradient-to-br from-brand-50 to-brand-100" />
                    <Skeleton className="h-4 bg-gradient-to-br from-brand-50 to-brand-100" />
                    <Skeleton className="h-4 bg-gradient-to-br from-brand-50 to-brand-100" />
                    <Skeleton className="h-4 bg-gradient-to-br from-brand-50 to-brand-100" />
                    <Skeleton className="h-4 bg-gradient-to-br from-brand-50 to-brand-100" />
                    <Skeleton className="h-4 bg-gradient-to-br from-brand-50 to-brand-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay */}
      {!session && showOverlay && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 bg-white/90 rounded-lg shadow-lg">
            <Lock className="w-12 h-12 text-brand-600" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900">
                Premium Content
              </h3>
              <p className="text-sm text-zinc-600">
                You need to have an account to see the content
              </p>
            </div>
            <Link
              href={`/sign-in?redirect=${encodeURIComponent(
                `/search/${searchKey || ""}`
              )}`}
              className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors text-sm font-medium"
            >
              Sign in to view
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
