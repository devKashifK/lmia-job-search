"use client";

import { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
  AlertCircle,
  Palette,
  Check,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    { name: "Black", value: "black", color: "#000000" },
  ];

  useEffect(() => {
    if (session?.user?.user_metadata?.brandColor) {
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
        title: "Success",
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
        title: "Success",
        description: "Settings updated successfully.",
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

      const { error } = await db.auth.updateUser({
        data: {
          brandColor: color,
        },
      });

      if (error) throw error;

      updateThemeColor(color);
      setBrandColor(color);
      setShowColorPalette(false);

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Security Section */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Account & Security
            </h2>
            <p className="text-sm text-gray-500">
              Update your email and password
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Password must be at least 8 characters with a number
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="bg-brand-600 hover:bg-brand-700"
              >
                {isLoading ? "Saving..." : "Update Account"}
              </Button>
            </div>
          </div>
        </div>

        {/* Appearance & Preferences */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Appearance & Preferences
            </h2>
            <p className="text-sm text-gray-500">
              Customize how the app looks and behaves
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Theme */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Theme</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Choose light or dark mode
                </p>
              </div>
              <div className="flex items-center rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => {
                    setTheme("light");
                    handleSystemUpdate("theme", "light");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    theme === "light"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
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
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    theme === "dark"
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Accent Color</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Personalize your dashboard color
                </p>
              </div>
              <Popover open={showColorPalette} onOpenChange={setShowColorPalette}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[160px] justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                        style={{
                          backgroundColor: colorPalette.find(
                            (c) => c.value === brandColor
                          )?.color,
                        }}
                      />
                      <span className="text-sm capitalize">
                        {colorPalette.find((c) => c.value === brandColor)?.name || brandColor}
                      </span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-4" align="end">
                  <div className="grid grid-cols-4 gap-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color.value}
                        className={cn(
                          "group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all",
                          brandColor === color.value
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => handleColorChange(color.value)}
                      >
                        <div className="relative">
                          <div
                            className="w-8 h-8 rounded-full shadow-sm ring-1 ring-inset ring-black/10 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: color.color }}
                          />
                          {brandColor === color.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check
                                className="w-4 h-4 text-white drop-shadow-md"
                                strokeWidth={3}
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-gray-600">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Notifications</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Receive job alerts and updates
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
            <div className="flex items-center justify-between px-6 py-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Sound Effects</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Play sounds for interactions
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

            {/* Language */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Language</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Choose your preferred language
                </p>
              </div>
              <Select
                value={language}
                onValueChange={(value) => {
                  setLanguage(value);
                  handleSystemUpdate("language", value);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
