"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, AlertCircle, CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
    id: string;
    type: "profile" | "preferences" | "system";
    title: string;
    message: string;
    completion?: number; // 0-100
    actionUrl?: string;
    actionText?: string;
    createdAt: Date;
    isRead: boolean;
}

const STORAGE_KEY = "jobmaze_notifications_read";

export function NotificationsPopover() {
    const { session } = useSession();
    const { preferences } = useUserPreferences();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
    const [open, setOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Generate notifications based on profile/preferences completion
    useEffect(() => {
        if (!session?.user) return;

        const generatedNotifications: Notification[] = [];

        // Check profile completion
        const profileFields = {
            name: session.user.user_metadata?.name,
            phone: session.user.user_metadata?.phone,
            country: session.user.user_metadata?.country,
            position: session.user.user_metadata?.position,
            company: session.user.user_metadata?.company,
            bio: session.user.user_metadata?.bio,
            skills: session.user.user_metadata?.skills,
            education: session.user.user_metadata?.education,
        };

        const filledProfileFields = Object.values(profileFields).filter(Boolean).length;
        const totalProfileFields = Object.keys(profileFields).length;
        const profileCompletion = Math.round((filledProfileFields / totalProfileFields) * 100);

        if (profileCompletion < 100) {
            generatedNotifications.push({
                id: "profile-incomplete",
                type: "profile",
                title: "Complete Your Profile",
                message: `Your profile is ${profileCompletion}% complete. Add missing information to improve your job matches.`,
                completion: profileCompletion,
                actionUrl: "/dashboard/profile",
                actionText: "Complete Profile",
                createdAt: new Date(),
                isRead: false,
            });
        }

        // Check preferences completion
        const preferenceFields = {
            job_titles: preferences?.preferred_job_titles?.length > 0,
            locations:
                (preferences?.preferred_provinces?.length || 0) > 0 ||
                (preferences?.preferred_cities?.length || 0) > 0,
            industries: preferences?.preferred_industries?.length > 0,
            noc_codes: preferences?.preferred_noc_codes?.length > 0,
            tiers: preferences?.preferred_company_tiers?.length > 0,
        };

        const filledPreferenceFields = Object.values(preferenceFields).filter(Boolean).length;
        const totalPreferenceFields = Object.keys(preferenceFields).length;
        const preferencesCompletion = Math.round(
            (filledPreferenceFields / totalPreferenceFields) * 100
        );

        if (preferencesCompletion < 100) {
            generatedNotifications.push({
                id: "preferences-incomplete",
                type: "preferences",
                title: "Set Your Job Preferences",
                message: `${preferencesCompletion}% of preferences set. Complete all fields for better recommendations.`,
                completion: preferencesCompletion,
                actionUrl: "/dashboard/profile#preferences-form",
                actionText: "Set Preferences",
                createdAt: new Date(),
                isRead: false,
            });
        }

        // Load read status from localStorage
        const readNotifications = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        ) as string[];

        const notificationsWithReadStatus = generatedNotifications.map((notif) => ({
            ...notif,
            isRead: readNotifications.includes(notif.id),
        }));

        setNotifications(notificationsWithReadStatus);
    }, [session, preferences, refreshTrigger]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Trigger useEffect to regenerate notifications
        setTimeout(() => {
            setRefreshTrigger((prev) => prev + 1);
            setIsRefreshing(false);
        }, 500);
    };

    const markAsRead = (id: string) => {
        const readNotifications = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        ) as string[];

        if (!readNotifications.includes(id)) {
            readNotifications.push(id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(readNotifications));
        }

        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        );
    };

    const markAsUnread = (id: string) => {
        const readNotifications = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        ) as string[];

        const filtered = readNotifications.filter((nid) => nid !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === id ? { ...notif, isRead: false } : notif
            )
        );
    };

    const markAllAsRead = () => {
        const allIds = notifications.map((n) => n.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    };

    const getCompletionColor = (completion?: number) => {
        if (!completion) return "text-gray-600";
        if (completion < 30) return "text-red-600";
        if (completion < 60) return "text-amber-600";
        if (completion < 100) return "text-blue-600";
        return "text-green-600";
    };

    const getCompletionBgColor = (completion?: number) => {
        if (!completion) return "bg-gray-100";
        if (completion < 30) return "bg-red-50";
        if (completion < 60) return "bg-amber-50";
        if (completion < 100) return "bg-blue-50";
        return "bg-green-50";
    };

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const readNotifications = notifications.filter((n) => n.isRead);
    const unreadCount = unreadNotifications.length;

    if (!session?.user) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 text-gray-600 hover:text-brand-600 hover:bg-brand-50"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </motion.span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="end" sideOffset={8}>
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="h-7 text-xs text-gray-600 hover:text-brand-600"
                                title="Refresh notifications"
                            >
                                <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                            </Button>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="h-7 text-xs text-brand-600 hover:text-brand-700"
                                >
                                    <Check className="mr-1 h-3 w-3" />
                                    Mark all read
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-gray-100 bg-white p-0">
                        <TabsTrigger
                            value="unread"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600"
                        >
                            Unread
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 bg-brand-100 text-brand-700">
                                    {unreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="read"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600"
                        >
                            Read
                            {readNotifications.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 bg-gray-100 text-gray-600">
                                    {readNotifications.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="max-h-[400px] overflow-y-auto">
                        <TabsContent value="unread" className="m-0 p-0">
                            {unreadNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <CheckCircle2 className="mb-3 h-12 w-12 text-green-500" />
                                    <p className="text-sm font-medium text-gray-900">All caught up!</p>
                                    <p className="mt-1 text-xs text-gray-500">No new notifications</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {unreadNotifications.map((notif, index) => (
                                        <NotificationItem
                                            key={notif.id}
                                            notification={notif}
                                            onMarkAsRead={() => markAsRead(notif.id)}
                                            onClose={() => setOpen(false)}
                                            index={index}
                                        />
                                    ))}
                                </AnimatePresence>
                            )}
                        </TabsContent>

                        <TabsContent value="read" className="m-0 p-0">
                            {readNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Circle className="mb-3 h-12 w-12 text-gray-300" />
                                    <p className="text-sm font-medium text-gray-900">No read notifications</p>
                                    <p className="mt-1 text-xs text-gray-500">Your read notifications will appear here</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {readNotifications.map((notif, index) => (
                                        <NotificationItem
                                            key={notif.id}
                                            notification={notif}
                                            onMarkAsUnread={() => markAsUnread(notif.id)}
                                            onClose={() => setOpen(false)}
                                            index={index}
                                            isRead
                                        />
                                    ))}
                                </AnimatePresence>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: () => void;
    onMarkAsUnread?: () => void;
    onClose: () => void;
    index: number;
    isRead?: boolean;
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onMarkAsUnread,
    onClose,
    index,
    isRead = false,
}: NotificationItemProps) {
    const completionColor = getCompletionColor(notification.completion);
    const completionBgColor = getCompletionBgColor(notification.completion);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "group relative border-b border-gray-100 p-4 transition-colors hover:bg-gray-50",
                !isRead && "bg-brand-50/30"
            )}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        completionBgColor
                    )}
                >
                    {notification.completion !== undefined ? (
                        <span className={cn("text-sm font-bold", completionColor)}>
                            {notification.completion}%
                        </span>
                    ) : (
                        <AlertCircle className={cn("h-5 w-5", completionColor)} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        {!isRead ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onMarkAsRead}
                                className="h-6 w-6 shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-brand-600 group-hover:opacity-100"
                                title="Mark as read"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onMarkAsUnread}
                                className="h-6 w-6 shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-brand-600 group-hover:opacity-100"
                                title="Mark as unread"
                            >
                                <Circle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600">{notification.message}</p>

                    {notification.actionUrl && (
                        <Link href={notification.actionUrl} onClick={onClose}>
                            <Button
                                size="sm"
                                className="mt-2 h-7 bg-brand-600 text-xs hover:bg-brand-700"
                            >
                                {notification.actionText || "View"}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function getCompletionColor(completion?: number) {
    if (!completion) return "text-gray-600";
    if (completion < 30) return "text-red-600";
    if (completion < 60) return "text-amber-600";
    if (completion < 100) return "text-blue-600";
    return "text-green-600";
}

function getCompletionBgColor(completion?: number) {
    if (!completion) return "bg-gray-100";
    if (completion < 30) return "bg-red-50";
    if (completion < 60) return "bg-amber-50";
    if (completion < 100) return "bg-blue-50";
    return "bg-green-50";
}
