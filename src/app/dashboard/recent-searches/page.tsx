"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  Clock,
  Bookmark,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import db from "@/db";
import { useSession } from "@/hooks/use-session";
import CustomLink from "@/app/CustomLink";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LoadingScreen from "@/components/ui/loading-screen";

interface RecentSearch {
  id: string;
  keyword: string;
  created_at: string;
  user_id: string;
}

export default function RecentSearches() {
  const { session } = useSession();
  const { toast } = useToast();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSearch, setEditingSearch] = useState<RecentSearch | null>(null);
  const [newQuery, setNewQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSavedSearches();
  }, [session?.user?.id]);

  const fetchSavedSearches = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await db
        .from("searches")
        .select("*")
        .eq("id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecentSearches(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch saved searches",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from("searches").delete().eq("id", id);

      if (error) throw error;

      setRecentSearches((prev) => prev.filter((search) => search.id !== id));
      toast({
        title: "Search Deleted",
        description: "Your saved search has been removed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete saved search",
      });
    }
  };

  const handleRename = async () => {
    if (!editingSearch) return;

    try {
      const { error } = await db
        .from("searches")
        .update({ query: newQuery })
        .eq("id", editingSearch.id);

      if (error) throw error;

      setRecentSearches((prev) =>
        prev.map((search) =>
          search.id === editingSearch.id
            ? { ...search, query: newQuery }
            : search
        )
      );

      setIsDialogOpen(false);
      setEditingSearch(null);
      setNewQuery("");
      toast({
        title: "Search Renamed",
        description: "Your saved search has been updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename saved search",
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen className="h-[93vh] relative" />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-2.5 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-xl shadow-sm">
          <History className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Recent Searches
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            View and manage your recent search history
          </p>
        </div>
      </motion.div>

      {recentSearches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className="p-4 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-2xl shadow-sm mb-4">
            <Search className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">
            No recent searches yet
          </h2>
          <p className="text-sm text-zinc-500 text-center max-w-sm mb-6">
            Your recent searches will appear here. Start searching to see your
            history.
          </p>
          <CustomLink href="/search">
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              Start Searching
            </Button>
          </CustomLink>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-6 bg-gradient-to-r from-brand-50/90 via-brand-50/80 to-white border-b shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-lg shadow-md">
                    <History className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-zinc-900">
                      Search History
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-brand-50 rounded-full shadow-sm">
                        <span className="text-xs font-medium text-brand-600">
                          {recentSearches.length}{" "}
                          {recentSearches.length === 1 ? "search" : "searches"}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500">
                        Last updated{" "}
                        {new Date(
                          recentSearches[0]?.created_at
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <CustomLink href="/search">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-brand-50 hover:text-brand-600 transition-colors shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                    New Search
                  </Button>
                </CustomLink>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {recentSearches.map((search) => (
                    <motion.div
                      key={search.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="group relative"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50/60 transition-all duration-300">
                        <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 via-brand-50 to-white text-brand-600 shadow-sm">
                          <Search className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <CustomLink
                              href={`/search/${search.keyword}`}
                              className="block flex-1"
                            >
                              <h3 className="text-sm font-medium text-zinc-900 truncate group-hover:text-brand-600 transition-colors">
                                {search.keyword}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                <span className="text-xs text-zinc-500">
                                  {new Date(
                                    search.created_at
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </CustomLink>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white hover:text-blue-600"
                                onClick={() => {
                                  setEditingSearch(search);
                                  setNewQuery(search.query);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white hover:text-red-600"
                                onClick={() => handleDelete(search.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="Enter new search name"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRename}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
