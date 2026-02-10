"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import db from "@/db";
import { useSession } from "@/hooks/use-session";
import {
  User,
  Phone,
  Shield,
  Calendar,
  Home,
  Briefcase,
  FileText,
  Pencil,
  X,
  Check,
  Globe,
  Linkedin,
  Twitter,
  GraduationCap,
  Languages,
  Code,
  MapPin,
  Building,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EditableFieldProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  placeholder: string;
  onUpdate: (newValue: string) => Promise<void>;
  type?: string;
  isTextArea?: boolean;
}

function EditableField({
  icon,
  title,
  value,
  placeholder,
  onUpdate,
  type = "text",
  isTextArea = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const handleUpdate = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(editValue);
      toast({
        title: "Updated successfully",
        description: `Your ${title.toLowerCase()} has been updated`,
      });
      setIsEditing(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update ${title.toLowerCase()}`,
      });
      setEditValue(value);
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-brand-100/50 hover:bg-white/80">
        <div className="flex items-start justify-between p-4">
          <div className="flex gap-4">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-gray-100 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:ring-brand-100">
              {icon}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-gray-900">
                {title}
              </p>
              {!isEditing ? (
                <p className={cn("text-sm leading-relaxed", !value ? "text-gray-400 italic" : "text-gray-600")}>
                  {value || "Not set"}
                </p>
              ) : (
                <div className="mt-2 space-y-3">
                  {isTextArea ? (
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={placeholder}
                      className="min-h-[100px] resize-none border-gray-200 bg-white/50 focus:border-brand-500 focus:ring-brand-500/20"
                    />
                  ) : (
                    <Input
                      type={type}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={placeholder}
                      className="h-9 border-gray-200 bg-white/50 focus:border-brand-500 focus:ring-brand-500/20"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={isLoading}
                      className="h-8 bg-brand-600 px-3 text-xs hover:bg-brand-700"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEditing}
                      disabled={isLoading}
                      className="h-8 px-3 text-xs text-gray-500 hover:text-gray-900"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStartEditing}
              className="h-8 w-8 text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-900 group-hover:opacity-100"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {title}</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function UserProfile() {
  const { session } = useSession();

  if (!session) return null;

  const updateUserMetadata = async (key: string, value: string) => {
    const { error } = await db.auth.updateUser({
      data: {
        [key]: value,
      },
    });

    if (error) throw error;
  };

  return (
    <div className="max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Profile Settings
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Manage your personal information and professional profile.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-700/10">
            <Sparkles className="h-4 w-4" />
            <span>Profile Completion: 85%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Sidebar/Navigation (Optional - for future expansion, keeping layout balanced) */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 p-1 ring-4 ring-white">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold text-brand-600">
                    {session.user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-1.5 ring-4 ring-white"></div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {session.user.user_metadata?.name || "User"}
              </h2>
              <p className="text-sm text-gray-500">{session.user.email}</p>

              <div className="mt-6 w-full space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-brand-500" />
                  <span>Verified Account</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Form Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Information */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <User className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditableField
                icon={<User className="h-4 w-4" />}
                title="Full Name"
                value={session?.user?.user_metadata?.name || ""}
                placeholder="Ex. John Doe"
                onUpdate={(value) => updateUserMetadata("name", value)}
              />
              <EditableField
                icon={<Phone className="h-4 w-4" />}
                title="Phone Number"
                value={session?.user?.user_metadata?.phone || ""}
                placeholder="Ex. +1 (555) 000-0000"
                onUpdate={(value) => updateUserMetadata("phone", value)}
                type="tel"
              />
              <EditableField
                icon={<MapPin className="h-4 w-4" />}
                title="Location"
                value={session?.user?.user_metadata?.country || ""}
                placeholder="Ex. Toronto, Canada"
                onUpdate={(value) => updateUserMetadata("country", value)}
              />
              <EditableField
                icon={<Calendar className="h-4 w-4" />}
                title="Date of Birth"
                value={session?.user?.user_metadata?.dob || ""}
                placeholder="Select date"
                onUpdate={(value) => updateUserMetadata("dob", value)}
                type="date"
              />
              <div className="sm:col-span-2">
                <EditableField
                  icon={<Home className="h-4 w-4" />}
                  title="Address"
                  value={session?.user?.user_metadata?.address || ""}
                  placeholder="Ex. 123 Main St, Apt 4B"
                  onUpdate={(value) => updateUserMetadata("address", value)}
                  isTextArea
                />
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Briefcase className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-semibold text-gray-900">Professional Profile</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <EditableField
                  icon={<Briefcase className="h-4 w-4" />}
                  title="Current Role"
                  value={session?.user?.user_metadata?.position || ""}
                  placeholder="Ex. Senior Software Engineer"
                  onUpdate={(value) => updateUserMetadata("position", value)}
                />
                <EditableField
                  icon={<Building className="h-4 w-4" />}
                  title="Company"
                  value={session?.user?.user_metadata?.company || ""}
                  placeholder="Ex. Tech Solutions Inc."
                  onUpdate={(value) => updateUserMetadata("company", value)}
                />
              </div>

              <EditableField
                icon={<FileText className="h-4 w-4" />}
                title="Professional Bio"
                value={session?.user?.user_metadata?.bio || ""}
                placeholder="Tell us a bit about your professional background..."
                onUpdate={(value) => updateUserMetadata("bio", value)}
                isTextArea
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <EditableField
                  icon={<Clock className="h-4 w-4" />}
                  title="Years of Experience"
                  value={session?.user?.user_metadata?.experience || ""}
                  placeholder="Ex. 5"
                  onUpdate={(value) => updateUserMetadata("experience", value)}
                  type="number"
                />
                <EditableField
                  icon={<GraduationCap className="h-4 w-4" />}
                  title="Education"
                  value={session?.user?.user_metadata?.education || ""}
                  placeholder="Ex. BSc Computer Science"
                  onUpdate={(value) => updateUserMetadata("education", value)}
                />
              </div>

              <EditableField
                icon={<Code className="h-4 w-4" />}
                title="Skills"
                value={session?.user?.user_metadata?.skills || ""}
                placeholder="Ex. React, Node.js, TypeScript (comma separated)"
                onUpdate={(value) => updateUserMetadata("skills", value)}
                isTextArea
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <EditableField
                  icon={<Linkedin className="h-4 w-4" />}
                  title="LinkedIn URL"
                  value={session?.user?.user_metadata?.linkedin || ""}
                  placeholder="https://linkedin.com/in/..."
                  onUpdate={(value) => updateUserMetadata("linkedin", value)}
                  type="url"
                />
                <EditableField
                  icon={<Globe className="h-4 w-4" />}
                  title="Portfolio / Website"
                  value={session?.user?.user_metadata?.website || ""}
                  placeholder="https://..."
                  onUpdate={(value) => updateUserMetadata("website", value)}
                  type="url"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
