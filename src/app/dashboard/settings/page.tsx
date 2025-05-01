"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function Settings() {
  const { session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile Settings State
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // System Settings State
  const [theme, setTheme] = useState(
    session?.user?.user_metadata?.theme || "light"
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

  return (
    <div className="max-w-7xl mx-auto p-6 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-xl shadow-sm">
            <SettingsIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              Account Settings
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage your account preferences and settings
            </p>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-orange-50/80 to-white rounded-lg border border-orange-100/50 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Shield className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">
                Security First
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Keep your account secure by using a strong password and enabling
                notifications
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="mb-6">
            <h2 className="text-sm font-medium text-zinc-900">
              Account Security
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage your email and password
            </p>
          </div>

          <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-6 bg-gradient-to-r from-orange-50/90 via-orange-50/80 to-white border-b shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-lg shadow-md">
                  <Key className="w-4 h-4 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-zinc-900">
                    Security Settings
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Update your email and password
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-zinc-600"
                >
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label
                  htmlFor="current-password"
                  className="flex items-center gap-2 text-zinc-600"
                >
                  <Lock className="w-4 h-4" />
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="new-password"
                  className="flex items-center gap-2 text-zinc-600"
                >
                  <Lock className="w-4 h-4" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-orange-50/50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <p className="text-xs text-zinc-600">
                  Make sure your new password is strong and unique
                </p>
              </div>

              <Button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                {isLoading ? "Updating..." : "Update Security Settings"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="mb-6">
            <h2 className="text-sm font-medium text-zinc-900">Preferences</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Customize your app experience
            </p>
          </div>

          <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-6 bg-gradient-to-r from-orange-50/90 via-orange-50/80 to-white border-b shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-lg shadow-md">
                  <SettingsIcon className="w-4 h-4 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-zinc-900">
                    App Preferences
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Customize your app settings
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-900 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Theme
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Choose your preferred theme
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => {
                      const newTheme = checked ? "dark" : "light";
                      setTheme(newTheme);
                      handleSystemUpdate("theme", newTheme);
                    }}
                  />
                  <Moon className="w-4 h-4 text-zinc-400" />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-900 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Receive important updates
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

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-900 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Sound Effects
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Enable sound notifications
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

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label className="text-zinc-900 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </Label>
                <Select
                  value={language}
                  onValueChange={(value) => {
                    setLanguage(value);
                    handleSystemUpdate("language", value);
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
