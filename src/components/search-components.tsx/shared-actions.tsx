"use client";

import React from "react";
import { useTableStore } from "@/context/store";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FileDown, Save } from "lucide-react";

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    primary?: boolean;
}

export const ActionButton = ({ icon, label, onClick, primary }: ActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 text-xs transition-colors rounded-md",
                primary
                    ? "text-brand-600 bg-brand-50 hover:bg-brand-100"
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
        if (!filteredData || filteredData.length === 0) {
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
    const currentSearchId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("currentSearchId") : null;

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
