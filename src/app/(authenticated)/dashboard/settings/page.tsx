"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session";
import db from "@/db";
import {
  Mail,
  Lock,
  Bell,
  Globe,
  Volume2,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Shield,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Palette,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateThemeColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);

  // Profile Settings State
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // System Settings State
  const [theme, setTheme] = useState(
    session?.user?.user_metadata?.theme || "light"
  );
  const [brandColor, setBrandColor] = useState(
    session?.user?.user_metadata?.brandColor || "brand"
  );
  const [notifications, setNotifications] = useState(
    session?.user?.user_metadata?.notifications !== false
  );
  const [language, setLanguage] = useState(
    session?.user?.user_metadata?.language || "en"
  );
  const [soundEffects, setSoundEffects] = useState(
    session?.user?.user_metadata?.sound_effects !== false
  );

  const colorPalette = [
    { name: "Brand", value: "brand", color: "#4ade80" },
    { name: "Blue", value: "blue", color: "#3b82f6" },
    { name: "Purple", value: "purple", color: "#a855f7" },
    { name: "Pink", value: "pink", color: "#ec4899" },
    { name: "Red", value: "red", color: "#ef4444" },
    { name: "Orange", value: "orange", color: "#f97316" },
    { name: "Yellow", value: "yellow", color: "#eab308" },
    { name: "Teal", value: "teal", color: "#14b8a6" },
    { name: "Cyan", value: "cyan", color: "#06b6d4" },
    { name: "Indigo", value: "indigo", color: "#6366f1" },
    { name: "Violet", value: "violet", color: "#8b5cf6" },
    { name: "Fuchsia", value: "fuchsia", color: "#d946ef" },
    { name: "Rose", value: "rose", color: "#f43f5e" },
    { name: "Amber", value: "amber", color: "#f59e0b" },
    { name: "Lime", value: "lime", color: "#84cc16" },
    { name: "Emerald", value: "emerald", color: "#10b981" },
    { name: 'Apple', value: 'black', color: '#000000' },
  ];

  // Apply theme color on initial load
  useEffect(() => {
    if (session?.user?.user_metadata?.brandColor) {
      // Ensure we respect the saved user preference on load
      setBrandColor(session.user.user_metadata.brandColor);
    }
  }, [session?.user?.user_metadata?.brandColor]);


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await db.auth.updateUser({
        email: email,
        password: newPassword || undefined,
      });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }

    setIsLoading(false);
  };

  const handleSystemUpdate = async (key: string, value: any) => {
    try {
      const { error } = await db.auth.updateUser({
        data: {
          [key]: value,
        },
      });

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your settings have been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleColorChange = async (color: string) => {
    try {
      setIsLoading(true);

      // Update user's brand color in the database
      const { error } = await db.auth.updateUser({
        data: {
          brandColor: color,
        },
      });

      if (error) throw error;

      // Update theme color immediately
      updateThemeColor(color);
      setBrandColor(color);
      setShowColorPalette(false);

      // Force a re-render of the entire app
      window.location.reload();

      toast({
        title: "Success",
        description: "Brand color updated successfully",
      });
    } catch (error) {
      console.error("Error updating brand color:", error);
      toast({
        title: "Error",
        description: "Failed to update brand color",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for theme color updates
  useEffect(() => {
    const handleThemeUpdate = (event: CustomEvent) => {
      const newColor = event.detail;
      setBrandColor(newColor);
    };

    window.addEventListener(
      "themeColorUpdated",
      handleThemeUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "themeColorUpdated",
        handleThemeUpdate as EventListener
      );
    };
  }, []);

  return (
    <div className="max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Account Settings
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Manage your account preferences and security settings.
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Helper Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Security First</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                  We prioritize your account security. Enable two-factor authentication for added protection.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Personalize</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                  Customize your dashboard with our carefully curated themes to match your style.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Settings Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Account Security */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Key className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm p-6 shadow-sm">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-white/50 border-gray-200 focus:border-brand-500 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 bg-white/50 border-gray-200 focus:border-brand-500 focus:ring-brand-500/20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-9 pr-10 bg-white/50 border-gray-200 focus:border-brand-500 focus:ring-brand-500/20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-3 text-sm text-orange-800">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>Make sure your new password is at least 8 characters long and includes a number.</p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="bg-brand-600 hover:bg-brand-700 text-white min-w-[140px]"
                  >
                    {isLoading ? "Saving..." : "Update Credentials"}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <SettingsIcon className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm divide-y divide-gray-100">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-6">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-gray-500" />
                    <Label className="text-base font-medium text-gray-900">Appearance</Label>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">
                    Customize how the application looks properly.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full bg-gray-100 p-1">
                    <button
                      onClick={() => {
                        setTheme("light");
                        handleSystemUpdate("theme", "light");
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        theme === "light" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      Light
                    </button>
                    <button
                      onClick={() => {
                        setTheme("dark");
                        handleSystemUpdate("theme", "dark");
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        theme === "dark" ? "bg-gray-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      Dark
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-6">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <Label className="text-base font-medium text-gray-900">Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">
                    Receive updates about job alerts and system changes.
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={(checked) => {
                    setNotifications(checked);
                    handleSystemUpdate("notifications", checked);
                  }}
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-6">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-gray-500" />
                    <Label className="text-base font-medium text-gray-900">Sound Effects</Label>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">
                    Play sounds for interactions and notifications.
                  </p>
                </div>
                <Switch
                  checked={soundEffects}
                  onCheckedChange={(checked) => {
                    setSoundEffects(checked);
                    handleSystemUpdate("sound_effects", checked);
                  }}
                />
              </div>

              {/* Brand Color */}
              <div className="flex items-center justify-between p-6">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <Label className="text-base font-medium text-gray-900">Accent Color</Label>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">
                    Choose a primary color for your dashboard.
                  </p>
                </div>
                <Popover
                  open={showColorPalette}
                  onOpenChange={setShowColorPalette}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[180px] justify-between bg-white border-zinc-200 hover:bg-zinc-50 font-normal"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-100 shadow-sm"
                          style={{
                            backgroundColor: colorPalette.find(
                              (c) => c.value === brandColor
                            )?.color,
                          }}
                        />
                        <span className="capitalize">{
                          colorPalette.find((c) => c.value === brandColor)?.name || brandColor
                        }</span>
                      </div>
                      <Palette className="w-3.5 h-3.5 text-zinc-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-4" align="end">
                    <div className="grid grid-cols-4 gap-2">
                      {colorPalette.map((color) => (
                        <button
                          key={color.value}
                          className={cn(
                            "group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200",
                            brandColor === color.value ? "bg-gray-100" : "hover:bg-gray-50"
                          )}
                          onClick={() => handleColorChange(color.value)}
                        >
                          <div className="relative">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full shadow-sm ring-1 ring-inset ring-black/5 transition-transform group-hover:scale-110",
                              )}
                              style={{ backgroundColor: color.color }}
                            />
                            {brandColor === color.value && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-gray-600 capitalize">
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between p-6">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <Label className="text-base font-medium text-gray-900">Language</Label>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">
                    Select your preferred language.
                  </p>
                </div>
                <Select
                  value={language}
                  onValueChange={(value) => {
                    setLanguage(value);
                    handleSystemUpdate("language", value);
                  }}
                >
                  <SelectTrigger className="w-[180px] bg-white border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
