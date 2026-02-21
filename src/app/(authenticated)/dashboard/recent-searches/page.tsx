"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Search,
  Clock,
  Trash2,
  ExternalLink,
  Edit2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/ui/loading-screen";
import { deleteSearch, clearSearchHistory, renameSearch, getSearchHistory } from "@/lib/api/searches";

export interface SearchRecord {
  id: string; // This will map to search_id
  term: string;
  filters: any;
  timestamp: Date;
  resultCount?: number;
}

export default function RecentSearches() {
  const { session } = useSession();
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [editingSearch, setEditingSearch] = useState<SearchRecord | null>(null);
  const [newTerm, setNewTerm] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSearches = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const data = await getSearchHistory(session.user.id);

      if (data) {
        setSearches(data.map((item: any) => ({
          id: item.search_id,
          term: item.keyword,
          filters: {}, // No filters column in schema yet
          timestamp: new Date(item.created_at),
          resultCount: undefined // Not stored
        })));
      }
    } catch (error) {
      console.error("Error fetching searches:", error);
      toast({
        title: "Error",
        description: "Failed to load recent searches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSearch(id);

      setSearches(searches.filter((s) => s.id !== id));
      toast({
        title: "Success",
        description: "Search history deleted",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete search",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = async () => {
    if (!session?.user?.id) return;
    try {
      await clearSearchHistory(session.user.id);

      setSearches([]);
      toast({
        title: "Success",
        description: "All search history cleared",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  const startRename = (search: SearchRecord) => {
    setEditingSearch(search);
    setNewTerm(search.term);
    setIsRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (editingSearch && newTerm.trim()) {
      try {
        await renameSearch(editingSearch.id, newTerm);

        setSearches(
          searches.map((s) =>
            s.id === editingSearch.id ? { ...s, term: newTerm } : s
          )
        );
        setIsRenameDialogOpen(false);
        toast({
          title: "Success",
          description: "Search renamed successfully",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to rename search",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen className="h-[50vh]" />;
  }

  return (
    <div className="max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Recent Searches
          </h1>
          <p className="mt-2 text-base text-gray-500">
            View and manage your search history.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleClearHistory}
          disabled={searches.length === 0}
          className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          {searches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">
                No recent searches
              </p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Your search history will appear here. Start searching to see your
                recent queries.
              </p>
              <Button className="mt-6 bg-brand-600 hover:bg-brand-700 text-white" asChild>
                <Link href="/search">Start Searching</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              <AnimatePresence>
                {searches.map((search, index) => (
                  <motion.li
                    key={search.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                        <Search className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {search.term}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {format(search.timestamp, "MMM d, h:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center self-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-brand-600 hover:bg-brand-50 hidden sm:flex"
                        asChild
                      >
                        <Link href={`/search?q=${encodeURIComponent(search.term)}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Run Search
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild className="sm:hidden">
                            <Link href={`/search?q=${encodeURIComponent(search.term)}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Run Search
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startRename(search)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDelete(search.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Search</DialogTitle>
            <DialogDescription>
              Give this search a custom name to recognize it easily later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Enter search name..."
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} className="bg-brand-600 hover:bg-brand-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
