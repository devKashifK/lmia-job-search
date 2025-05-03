import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function SearchEngineSkeleton({
  showOverlay = true,
}: {
  showOverlay?: boolean;
}) {
  const params = useParams();
  const searchKey = params?.search as string;

  return (
    <div className="w-full py-6 px-6 flex flex-col gap-4 relative">
      {/* Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 bg-white/90 rounded-lg shadow-lg">
            <Lock className="w-12 h-12 text-orange-600" />
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
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Sign in to view
            </Link>
          </div>
        </div>
      )}
      {/* Charts Section */}
      <div className="flex gap-2">
        <div className="w-1/3 h-[300px] rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100" />
        </div>
        <div className="w-1/3 h-[300px] rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100" />
        </div>
        <div className="w-1/3 h-[300px] rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100" />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex gap-0 relative min-h-[calc(100vh-23rem)]">
        {/* Filter Panel Skeleton */}
        <div className="w-[300px] shrink-0">
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full bg-gradient-to-br from-orange-50 to-orange-100" />
            <Skeleton className="h-8 w-full bg-gradient-to-br from-orange-50 to-orange-100" />
            <Skeleton className="h-8 w-full bg-gradient-to-br from-orange-50 to-orange-100" />
            <Skeleton className="h-8 w-full bg-gradient-to-br from-orange-50 to-orange-100" />
            <Skeleton className="h-8 w-full bg-gradient-to-br from-orange-50 to-orange-100" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="flex-1 relative">
          <div className="h-[calc(100vh-23rem)] shadow-lg rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-8 gap-4 p-4 border-b">
              <Skeleton className="h-6 bg-gradient-to-br from-orange-50 to-orange-100" />
              <Skeleton className="h-6 bg-gradient-to-br from-orange-50 to-orange-100" />
              <Skeleton className="h-6 bg-gradient-to-br from-orange-50 to-orange-100" />
              <Skeleton className="h-6 bg-gradient-to-br from-orange-50 to-orange-100" />
              <Skeleton className="h-6 bg-gradient-to-br from-orange-50 to-orange-100" />
              <Skeleton className="h-6 bg-gradient-to-br from-orange-50 to-orange-100" />
              <Skeleton className="h-6 bg-gradient-to-br from-orange-50 to-orange-100" />
              <Skeleton className="h-6 bg-gradient-to-br from-orange-50 to-orange-100" />
            </div>

            {/* Table Rows */}
            <div className="space-y-2 p-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4">
                  <Skeleton className="h-4 bg-gradient-to-br from-orange-50 to-orange-100" />
                  <Skeleton className="h-4 bg-gradient-to-br from-orange-50 to-orange-100" />
                  <Skeleton className="h-4 bg-gradient-to-br from-orange-50 to-orange-100" />
                  <Skeleton className="h-4 bg-gradient-to-br from-orange-50 to-orange-100" />
                  <Skeleton className="h-4 bg-gradient-to-br from-orange-50 to-orange-100" />
                  <Skeleton className="h-4 bg-gradient-to-br from-orange-50 to-orange-100" />
                  <Skeleton className="h-4 bg-gradient-to-br from-orange-50 to-orange-100" />
                  <Skeleton className="h-4 bg-gradient-to-br from-orange-50 to-orange-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
