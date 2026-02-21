"use client";
import {
  Binoculars,
  Blend,
  BookmarkMinus,
  FileDown,
  Save,
  SearchCheck,
} from "lucide-react";
import { useTableStore } from "@/context/store";
import { cn } from "@/lib/utils";
import { SearchBar } from "./search-bar";
import { toast } from "@/hooks/use-toast";
import { RecentSearches } from "./recent-searches";
import { SavedSearches } from "./saved-searches";
import db from "@/db";
import { useSheet } from "@/context/sheet-context";
import { Export, SaveSearch } from "./shared-actions";

export default function Header({ keywords }: { keywords: string }) {
  const filteredData = useTableStore((state) => state.filteredData);
  const showFilterPanel = useTableStore((state) => state.showFilterPanel);
  const setShowFilterPanel = useTableStore((state) => state.setShowFilterPanel);
  const { showSheet } = useSheet();

  return (
    <div className="bg-white border-b border-zinc-100 h-11">
      <div className="max-w-screen-2xl mx-auto h-full">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pr-3 border-r border-zinc-200 h-5">
              <div className="p-1 bg-brand-50 rounded-md">
                <SearchCheck className="w-3 h-3 text-brand-600" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-zinc-900">
                  {decodeURIComponent(keywords)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-medium">
                  {filteredData.length}
                </span>
              </div>
            </div>

            <div className="flex items-center h-5 gap-1">
              <NavItem
                icon={<Blend className="w-3 h-3" />}
                label="Filters"
                isActive={showFilterPanel}
                onClick={() => setShowFilterPanel(true)}
              />
              <NavItem
                icon={<Binoculars className="w-3 h-3" />}
                label="Recent"
                onClick={() => {
                  showSheet({
                    component: RecentSearches,
                    title: "Recent Searches",
                    description: "View your recent search history",
                    className: "w-[400px] sm:w-[540px]",
                  });
                }}
              />
              <NavItem
                icon={<BookmarkMinus className="w-3 h-3" />}
                label="Saved"
                onClick={() => {
                  showSheet({
                    component: SavedSearches,
                    title: "Saved Searches",
                    description: "View your saved searches",
                    className: "w-[400px] sm:w-[540px]",
                  });
                }}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 h-5">
            <SearchBar type="lmia" />
            <div className="h-4 w-px bg-zinc-200" />
            <div className="flex items-center gap-1">
              <Export />
              <SaveSearch />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-all duration-200 h-5",
        isActive
          ? "text-brand-600 bg-brand-50 shadow-sm font-medium"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}


