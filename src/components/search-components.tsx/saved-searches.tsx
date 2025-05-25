"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fetchSavedSearches } from "@/lib/queries";
import { Search } from "@/types/search";
import { useSession } from "@/hooks/use-session";
import CustomLink from "@/app/CustomLink";
import {
  Bookmark,
  Search as SearchIcon,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { SheetHeader } from "@/components/ui/sheet-header";
import { toast } from "@/hooks/use-toast";
import db from "@/db";

interface SavedSearchesProps {
  onClose: () => void;
}

export function SavedSearches({ onClose }: SavedSearchesProps) {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const { data: searches, isLoading } = useQuery<Search[]>({
    queryKey: ["savedSearches"],
    queryFn: () => fetchSavedSearches({ id: session.user.id }),
  });

  const handleSearchSelect = (search: Search) => {
    sessionStorage.setItem("currentSearchId", search.id);
    toast({
      title: "Search loaded",
      description: `Loading search: ${search.keyword}`,
    });
    onClose();
  };

  const mutation = useMutation({
    mutationFn: async (searchId: string) => {
      const { error } = await db
        .from("searches")
        .update({ save: false })
        .eq("id", searchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedSearches"] });
      toast({
        title: "Search removed",
        description: "Search removed from saved searches",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove search",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <>
        <SheetHeader
          title="Saved Searches"
          description="Quick access to your saved searches"
          onClose={onClose}
        />
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-8 h-8 bg-zinc-100 rounded-full" />
            <div className="h-3 w-20 bg-zinc-100 rounded" />
          </div>
        </div>
      </>
    );
  }

  if (!searches || searches.length === 0) {
    return (
      <>
        <SheetHeader
          title="Saved Searches"
          description="Quick access to your saved searches"
          onClose={onClose}
        />
        <div className="flex flex-col items-center justify-center h-[300px] px-6 text-center">
          <div className="p-3 bg-gradient-to-b from-brand-50 to-brand-100/50 rounded-xl mb-3">
            <SearchIcon className="w-6 h-6 text-brand-600" />
          </div>
          <p className="text-sm font-medium text-zinc-900">No saved searches</p>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-[180px]">
            Save your searches for quick access later
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader
        title="Saved Searches"
        description="Quick access to your saved searches"
        onClose={onClose}
      />
      <ScrollArea className="flex-1">
        <div className="px-1.5 py-2">
          {searches.map((search) => (
            <div key={search.id} className="group relative">
              <CustomLink
                href={`/search/${encodeURIComponent(search.keyword)}`}
                onClick={() => handleSearchSelect(search)}
                className="block"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-brand-50/60 transition-all group-hover:pr-12">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100/70 text-brand-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {search.keyword}
                      </p>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium text-zinc-400">
                        {formatDistanceToNow(new Date(search.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {search.filters &&
                        Object.keys(search.filters).length > 0 && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-zinc-200" />
                            <div className="flex items-center gap-1.5">
                              {Object.entries(search.filters)
                                .slice(0, 2)
                                .map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="w-full h-full rounded-md border group-hover:border-brand-200/70 transition-colors px-1.5 py-0.5 text-[10px] font-medium bg-white text-zinc-500"
                                  >
                                    {key}: {value}
                                  </span>
                                ))}
                              {Object.keys(search.filters).length > 2 && (
                                <span className="text-[10px] font-medium text-zinc-400">
                                  +{Object.keys(search.filters).length - 2} more
                                </span>
                              )}
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </CustomLink>
              <button
                onClick={() => mutation.mutate(search.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="sr-only">Remove saved search</span>
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
