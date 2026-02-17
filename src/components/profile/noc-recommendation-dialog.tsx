"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, BookOpen, Check } from "lucide-react";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { useToast } from "@/hooks/use-toast";
import { NocSummary } from "@/lib/noc-service";

interface NocRecommendationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitles: string[];
}

export function NocRecommendationDialog({ isOpen, onClose, jobTitles }: NocRecommendationDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<NocSummary[]>([]);
    const [selectedNocs, setSelectedNocs] = useState<string[]>([]);
    const { preferences, updatePreferences } = useUserPreferences();
    const { toast } = useToast();

    // Fetch recommendations when dialog opens with new titles
    useEffect(() => {
        if (isOpen && jobTitles.length > 0) {
            fetchRecommendations();
        }
    }, [isOpen, jobTitles]);

    const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/match-noc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitles }),
            });
            const data = await response.json();
            if (data.matches) {
                setRecommendations(data.matches);
                // Pre-select all recommendations by default? Or let user choose? 
                // Let's pre-select high confidence ones or just let user choose.
                // For now, let's pre-select none to encourage review.
            }
        } catch (error) {
            console.error("Failed to fetch NOC recommendations", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNoc = (code: string) => {
        setSelectedNocs(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const handleConfirm = async () => {
        if (selectedNocs.length === 0) {
            onClose();
            return;
        }

        try {
            const currentNocs = preferences?.preferred_noc_codes || [];
            // Merge unique
            const newNocs = [...new Set([...currentNocs, ...selectedNocs])];

            await updatePreferences({
                preferred_noc_codes: newNocs
            });

            toast({
                title: "Preferences Updated",
                description: `Added ${selectedNocs.length} NOC codes to your preferences.`,
            });
            onClose();
        } catch (error) {
            console.error("Failed to update NOC preferences", error);
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "Could not save NOC preferences.",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BookOpen className="h-5 w-5 text-brand-600" />
                        Recommended NOC Codes
                    </DialogTitle>
                    <DialogDescription>
                        Based on your job titles <strong>({jobTitles.slice(0, 3).join(", ")}{jobTitles.length > 3 ? "..." : ""})</strong>,
                        we recommend these National Occupational Classification (NOC) codes for your profile.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                            <p className="text-sm text-gray-500">Finding best NOC matches...</p>
                        </div>
                    ) : recommendations.length > 0 ? (
                        <div className="grid gap-3">
                            {recommendations.map((noc) => (
                                <div
                                    key={noc.code}
                                    onClick={() => toggleNoc(noc.code)}
                                    className={`
                                        group relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none
                                        ${selectedNocs.includes(noc.code)
                                            ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                                            : 'border-gray-100 bg-white hover:border-brand-200 hover:shadow-md'}
                                    `}
                                >
                                    <div className="pt-1">
                                        <Checkbox
                                            checked={selectedNocs.includes(noc.code)}
                                            className={`pointer-events-none transition-colors ${selectedNocs.includes(noc.code) ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300'}`}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-md ${selectedNocs.includes(noc.code) ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {noc.code}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-white border-gray-200 text-gray-500">
                                                TEER {noc.teer}
                                            </Badge>
                                        </div>
                                        <h4 className={`text-base font-semibold leading-tight ${selectedNocs.includes(noc.code) ? 'text-brand-900' : 'text-gray-900'}`}>
                                            {noc.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                            Matches your experience in software and web development.
                                        </p>
                                    </div>
                                    {selectedNocs.includes(noc.code) && (
                                        <div className="absolute right-4 top-4 text-brand-600 animate-in fade-in zoom-in duration-200">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Briefcase className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                            <p>No direct NOC matches found for these titles.</p>
                            <Button variant="link" onClick={onClose}>Skip for now</Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedNocs.length === 0}
                        className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Add {selectedNocs.length} to Preferences
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
