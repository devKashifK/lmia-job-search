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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden bg-white hover:bg-zinc-50/50 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-lg text-brand-500 shadow-sm">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-900">{title}</h3>
              {!isEditing && !value && (
                <p className="text-xs text-zinc-400 mt-0.5">Not set</p>
              )}
            </div>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEditing}
              className="h-8 w-8 p-0 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-zinc-900 transition-all"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEditing}
                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-900 hover:bg-white/50"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdate}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-brand-500 hover:text-brand-600 hover:bg-brand-50"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardContent className={cn("p-5", isEditing && "bg-zinc-50/80")}>
          {isEditing ? (
            isTextArea ? (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                className="min-h-[120px] resize-none bg-white border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20"
              />
            ) : (
              <Input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                className="bg-white border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20"
              />
            )
          ) : (
            <p className="text-sm text-zinc-600 leading-relaxed">
              {value || <span className="text-zinc-400">{placeholder}</span>}
            </p>
          )}
        </CardContent>
      </Card>
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
    <div className="max-w-7xl mx-auto p-6 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-brand-100 via-brand-50 to-white rounded-xl shadow-sm">
            <User className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              Profile Settings
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage your profile information and preferences
            </p>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-brand-50/50 to-brand-100/30 rounded-lg border border-brand-100/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Shield className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">
                Complete your profile
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Adding your information helps us provide better service and
                personalized experience
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="mb-6">
            <h2 className="text-sm font-medium text-zinc-900">
              Personal Information
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Your basic personal information
            </p>
          </div>
          <EditableField
            icon={<User className="w-4 h-4" />}
            title="Full Name"
            value={session?.user?.user_metadata?.name || ""}
            placeholder="Add your full name"
            onUpdate={(value) => updateUserMetadata("name", value)}
          />
          <EditableField
            icon={<Phone className="w-4 h-4" />}
            title="Phone Number"
            value={session?.user?.user_metadata?.phone || ""}
            placeholder="Add your phone number"
            onUpdate={(value) => updateUserMetadata("phone", value)}
            type="tel"
          />
          <EditableField
            icon={<Shield className="w-4 h-4" />}
            title="Gender"
            value={session?.user?.user_metadata?.gender || ""}
            placeholder="Add your gender"
            onUpdate={(value) => updateUserMetadata("gender", value)}
          />
          <EditableField
            icon={<Calendar className="w-4 h-4" />}
            title="Date of Birth"
            value={session?.user?.user_metadata?.dob || ""}
            placeholder="Add your date of birth"
            onUpdate={(value) => updateUserMetadata("dob", value)}
            type="date"
          />
          <EditableField
            icon={<MapPin className="w-4 h-4" />}
            title="Country"
            value={session?.user?.user_metadata?.country || ""}
            placeholder="Add your country"
            onUpdate={(value) => updateUserMetadata("country", value)}
          />
          <EditableField
            icon={<Home className="w-4 h-4" />}
            title="Address"
            value={session?.user?.user_metadata?.address || ""}
            placeholder="Add your address"
            onUpdate={(value) => updateUserMetadata("address", value)}
            isTextArea
          />
        </motion.div>

        {/* Professional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="mb-6">
            <h2 className="text-sm font-medium text-zinc-900">
              Professional Information
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Your work and education details
            </p>
          </div>
          <EditableField
            icon={<Briefcase className="w-4 h-4" />}
            title="Current Position"
            value={session?.user?.user_metadata?.position || ""}
            placeholder="Add your current position"
            onUpdate={(value) => updateUserMetadata("position", value)}
          />
          <EditableField
            icon={<Building className="w-4 h-4" />}
            title="Company"
            value={session?.user?.user_metadata?.company || ""}
            placeholder="Add your company name"
            onUpdate={(value) => updateUserMetadata("company", value)}
          />
          <EditableField
            icon={<Clock className="w-4 h-4" />}
            title="Experience (years)"
            value={session?.user?.user_metadata?.experience || ""}
            placeholder="Add years of experience"
            onUpdate={(value) => updateUserMetadata("experience", value)}
            type="number"
          />
          <EditableField
            icon={<GraduationCap className="w-4 h-4" />}
            title="Education"
            value={session?.user?.user_metadata?.education || ""}
            placeholder="Add your education details"
            onUpdate={(value) => updateUserMetadata("education", value)}
          />
          <EditableField
            icon={<Code className="w-4 h-4" />}
            title="Skills"
            value={session?.user?.user_metadata?.skills || ""}
            placeholder="Add your skills (comma separated)"
            onUpdate={(value) => updateUserMetadata("skills", value)}
            isTextArea
          />
          <EditableField
            icon={<Languages className="w-4 h-4" />}
            title="Languages"
            value={session?.user?.user_metadata?.languages || ""}
            placeholder="Add languages you speak"
            onUpdate={(value) => updateUserMetadata("languages", value)}
          />
          <EditableField
            icon={<Globe className="w-4 h-4" />}
            title="Website"
            value={session?.user?.user_metadata?.website || ""}
            placeholder="Add your website URL"
            onUpdate={(value) => updateUserMetadata("website", value)}
            type="url"
          />
          <EditableField
            icon={<Linkedin className="w-4 h-4" />}
            title="LinkedIn"
            value={session?.user?.user_metadata?.linkedin || ""}
            placeholder="Add your LinkedIn profile URL"
            onUpdate={(value) => updateUserMetadata("linkedin", value)}
            type="url"
          />
          <EditableField
            icon={<Twitter className="w-4 h-4" />}
            title="Twitter"
            value={session?.user?.user_metadata?.twitter || ""}
            placeholder="Add your Twitter profile URL"
            onUpdate={(value) => updateUserMetadata("twitter", value)}
            type="url"
          />
          <EditableField
            icon={<FileText className="w-4 h-4" />}
            title="Bio"
            value={session?.user?.user_metadata?.bio || ""}
            placeholder="Add your bio"
            onUpdate={(value) => updateUserMetadata("bio", value)}
            isTextArea
          />
        </motion.div>
      </div>
    </div>
  );
}
