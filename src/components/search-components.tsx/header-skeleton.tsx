import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <div className="bg-white border-b border-zinc-100 h-11">
      <div className="max-w-screen-2xl mx-auto h-full">
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pr-3 border-r border-zinc-200 h-5">
              <Skeleton className="w-5 h-5 rounded-md" />
              <div className="flex items-center gap-1">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-8 h-3" />
              </div>
            </div>

            <div className="flex items-center h-5 gap-1">
              <Skeleton className="w-16 h-5 rounded-md" />
              <Skeleton className="w-16 h-5 rounded-md" />
              <Skeleton className="w-16 h-5 rounded-md" />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 h-5">
            <Skeleton className="w-32 h-5 rounded-md" />
            <div className="h-4 w-px bg-zinc-200" />
            <div className="flex items-center gap-1">
              <Skeleton className="w-16 h-5 rounded-md" />
              <Skeleton className="w-16 h-5 rounded-md" />
              <Skeleton className="w-16 h-5 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
