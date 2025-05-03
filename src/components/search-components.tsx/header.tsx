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
import { Filter } from "../filters/filter";
import { toast } from "@/hooks/use-toast";
import { RecentSearches } from "./recent-searches";
import { SavedSearches } from "./saved-searches";
import db from "@/db";
import { useSheet } from "@/context/sheet-context";

export default function Header({ keywords }: { keywords: string }) {
  const filteredData = useTableStore((state) => state.filteredData);
  const showFilterPanel = useTableStore((state) => state.showFilterPanel);
  const setShowFilterPanel = useTableStore((state) => state.setShowFilterPanel);
  const { showSheet } = useSheet();

  return (
    <div className="bg-white border-b border-zinc-100 h-11">
      <div className="max-w-screen-2xl mx-auto h-full">
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pr-3 border-r border-zinc-200 h-5">
              <div className="p-1 bg-orange-50 rounded-md">
                <SearchCheck className="w-3 h-3 text-orange-600" />
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
            <SearchBar />
            <div className="h-4 w-px bg-zinc-200" />
            <div className="flex items-center gap-1">
              <Filter />
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
          ? "text-orange-600 bg-orange-50 shadow-sm font-medium"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  primary?: boolean;
}

const ActionButton = ({ icon, label, onClick, primary }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 text-xs transition-colors rounded-md",
        primary
          ? "text-orange-600 bg-orange-50 hover:bg-orange-100"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export function Export() {
  const filteredData = useTableStore((state) => state.filteredData);

  const exportToCSV = () => {
    console.log("Export clicked", filteredData);

    if (!filteredData || filteredData.length === 0) {
      console.log("No data to export");
      return;
    }

    try {
      const headers = Object.keys(filteredData[0]);
      const csvContent = [
        headers.join(","),
        ...filteredData.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              if (value === null || value === undefined) return "";
              if (typeof value === "object") return JSON.stringify(value);
              if (typeof value === "string") {
                if (
                  value.includes(",") ||
                  value.includes('"') ||
                  value.includes("\n")
                ) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
              }
              return value;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Export completed");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <ActionButton
      icon={<FileDown className="w-3 h-3" />}
      label="Export"
      onClick={exportToCSV}
    />
  );
}

export function SaveSearch() {
  const updateSearchSaved = useTableStore((state) => state.updateSearchSaved);
  const currentSearchId = sessionStorage.getItem("currentSearchId");

  const handleSave = async () => {
    if (!currentSearchId) {
      toast({
        title: "Error",
        description: "No search ID found",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSearchSaved(currentSearchId, true);
      toast({
        title: "Success",
        description: "Search saved successfully",
      });
    } catch (error) {
      console.error("Failed to save search:", error);
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ActionButton
      icon={<Save className="w-3 h-3" />}
      label="Save"
      primary
      onClick={handleSave}
    />
  );
}
