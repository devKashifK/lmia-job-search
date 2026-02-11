"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import db from "@/db";
import { AlertCircle, ArrowRight } from "lucide-react";

const STORAGE_KEY = "profile_completion_dismissed";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function ProfileCompletionCheck() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkProfileCompletion = async () => {
            try {
                // Check if user has recently dismissed the toast
                const dismissedAt = localStorage.getItem(STORAGE_KEY);
                if (dismissedAt) {
                    const dismissedTime = parseInt(dismissedAt, 10);
                    const now = Date.now();

                    // If dismissed within last 24 hours, don't show
                    if (now - dismissedTime < DISMISS_DURATION_MS) {
                        return;
                    }
                }

                const { data: { session } } = await db.auth.getSession();
                if (!session) {
                    return;
                }

                // Check user preferences
                const { data: preferences } = await db
                    .from("user_preferences")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .maybeSingle();

                // If no preferences record exists at all, show toast
                if (!preferences) {
                    showCompletionToast("Set up your job preferences");
                    return;
                }

                // Check for missing critical preference fields
                const missingFields = [];

                if (!preferences.preferred_job_titles || preferences.preferred_job_titles.length === 0) {
                    missingFields.push("Job Titles");
                }
                if (!preferences.preferred_provinces || preferences.preferred_provinces.length === 0) {
                    missingFields.push("Locations");
                }

                // If any fields are missing, show toast
                if (missingFields.length > 0) {
                    const message = missingFields.length === 1
                        ? `Complete: ${missingFields[0]}`
                        : `Complete ${missingFields.length} items`;
                    showCompletionToast(message);
                }
            } catch (error) {
                console.error("Error checking profile completion:", error);
            }
        };

        // Check after a short delay - runs on every page mount
        const timer = setTimeout(checkProfileCompletion, 1500);
        return () => clearTimeout(timer);
    }, [pathname]); // Re-run when pathname changes

    const showCompletionToast = (message: string) => {
        toast.error(
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="font-semibold text-sm">Complete Your Profile</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                        {message} to get personalized job recommendations
                    </p>
                    <button
                        onClick={() => {
                            toast.dismiss();
                            router.push("/dashboard/profile");
                        }}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                        Complete Now <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            </div>,
            {
                duration: 15000,
                className: "border-l-4 border-red-500",
                onDismiss: () => {
                    // Remember that user dismissed this toast
                    localStorage.setItem(STORAGE_KEY, Date.now().toString());
                },
            }
        );
    };

    return null;
}
