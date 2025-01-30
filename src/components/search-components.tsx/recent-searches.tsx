"use client";

import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fetchRecentSearches } from "@/lib/queries";
import { Search } from "@/types/search";
import { useSession } from "@/hooks/use-session";
import CustomLink from "@/app/CustomLink";
import { Clock, Search as SearchIcon, ArrowRight } from "lucide-react";
import { SheetHeader } from "@/components/ui/sheet-header";
import { toast } from "@/hooks/use-toast";

interface RecentSearchesProps {
  onClose: () => void;
}

export function RecentSearches({ onClose }: RecentSearchesProps) {
  const { session } = useSession();
  const { data: searches, isLoading } = useQuery<Search[]>({
    queryKey: ["recentSearches"],
    queryFn: () => fetchRecentSearches({ id: session.user.id }),
  });

  const handleSearchSelect = (search: Search) => {
    sessionStorage.setItem("currentSearchId", search.id);
    toast({
      title: "Search loaded",
      description: `Loading search: ${search.keyword}`,
    });
    onClose();
  };

  if (isLoading) {
    return (
      <>
        <SheetHeader
          title="Recent Searches"
          description="Quick access to your previous searches"
          onClose={onClose}
        />
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-xl" />
            <div className="h-3 w-20 bg-orange-100/70 rounded-lg" />
          </div>
        </div>
      </>
    );
  }

  if (!searches || searches.length === 0) {
    return (
      <>
        <SheetHeader
          title="Recent Searches"
          description="Quick access to your previous searches"
          onClose={onClose}
        />
        <div className="flex flex-col items-center justify-center h-[300px] px-6 text-center">
          <div className="p-3.5 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-2xl mb-4 shadow-[0_2px_4px_rgba(251,146,60,0.1)]">
            <SearchIcon className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-sm font-medium text-zinc-800">
            No recent searches
          </p>
          <p className="text-xs text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
            Your search history will appear here for quick access
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader
        title="Recent Searches"
        description="Quick access to your previous searches"
        onClose={onClose}
      />
      <ScrollArea className="flex-1">
        <div className="p-3">
          {searches.map((search) => (
            <CustomLink
              key={search.id}
              href={`/search/${encodeURIComponent(search.keyword)}`}
              onClick={() => handleSearchSelect(search)}
              className="group block mb-1"
            >
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-50/50 transition-all">
                <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 via-orange-50 to-white text-orange-600 shadow-sm group-hover:shadow-md transition-all">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-zinc-900 truncate leading-none">
                      {search.keyword}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-zinc-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(search.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                  {search.filters && Object.keys(search.filters).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Object.entries(search.filters)
                        .slice(0, 2)
                        .map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-0.5 text-[11px] font-medium bg-white text-zinc-600 rounded-md border shadow-sm group-hover:border-orange-200 transition-all"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      {Object.keys(search.filters).length > 2 && (
                        <span className="px-2 py-0.5 text-[11px] font-medium text-zinc-400 bg-zinc-50 rounded-md">
                          +{Object.keys(search.filters).length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CustomLink>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
