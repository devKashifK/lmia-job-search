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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

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
      description: `Loading search: ${search.keywords}`,
    });
    onClose();
  };

  if (isLoading) {
    return (
      <>
        <SheetHeader
          title={
            <span className="font-bold text-lg text-orange-600">
              Recent Searches
            </span>
          }
          description="Quick access to your previous searches"
          onClose={onClose}
        />
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl" />
            <div className="h-4 w-24 bg-orange-100/70 rounded-lg" />
          </div>
        </div>
      </>
    );
  }

  if (!searches || searches.length === 0) {
    return (
      <>
        <SheetHeader
          title={
            <span className="font-bold text-lg text-orange-600">
              Recent Searches
            </span>
          }
          description="Quick access to your previous searches"
          onClose={onClose}
        />
        <div className="flex flex-col items-center justify-center h-[300px] px-6 text-center">
          <div className="p-4 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-2xl mb-4 shadow-[0_2px_8px_rgba(251,146,60,0.12)]">
            <SearchIcon className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-base font-semibold text-zinc-800">
            No recent searches
          </p>
          <p className="text-sm text-zinc-500 mt-1 max-w-[240px] leading-relaxed">
            Your search history will appear here for quick access
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader
        title={
          <span className="font-bold text-lg text-orange-600">
            Recent Searches
          </span>
        }
        description="Quick access to your previous searches"
        onClose={onClose}
      />
      <div className="border-b border-orange-100 mb-2" />
      <ScrollArea className="flex-1">
        <div className="p-3">
          <TooltipProvider>
            {searches.map((search) => (
              <CustomLink
                key={search.id}
                href={`/search/${encodeURIComponent(search.keywords)}`}
                onClick={() => handleSearchSelect(search)}
                className="group block mb-2"
              >
                <div className="group flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm hover:shadow-md border border-zinc-100 hover:border-orange-200 transition-all cursor-pointer">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 via-orange-50 to-white text-orange-600 shadow group-hover:shadow-md">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 truncate">
                        {search?.keyword}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {formatDistanceToNow(new Date(search.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {search.filters &&
                      Object.keys(search.filters).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(search.filters)
                            .slice(0, 2)
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          {Object.keys(search.filters).length > 2 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full text-xs font-medium border border-zinc-200 cursor-pointer">
                                  +{Object.keys(search.filters).length - 2} more
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="center">
                                {Object.entries(search.filters)
                                  .slice(2)
                                  .map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="text-xs text-zinc-700"
                                    >
                                      {key}: {value}
                                    </div>
                                  ))}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-500 transition-colors" />
                </div>
              </CustomLink>
            ))}
          </TooltipProvider>
        </div>
      </ScrollArea>
    </div>
  );
}
