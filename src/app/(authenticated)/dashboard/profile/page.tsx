"use client";
import { useState } from "react";
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
  Check,
  Globe,
  Linkedin,
  GraduationCap,
  Code,
  MapPin,
  Building,
  Clock,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { JobPreferencesSection } from "@/components/profile/job-preferences-section";
import { useUserPreferences } from "@/hooks/use-user-preferences";

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
    <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
            {icon}
          </div>
          <div className="flex-1 space-y-1.5">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {!isEditing ? (
              <p className={cn("text-sm", !value ? "text-gray-400 italic" : "text-gray-600")}>
                {value || "Not set"}
              </p>
            ) : (
              <div className="space-y-2.5">
                {isTextArea ? (
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[100px] resize-none text-sm"
                  />
                ) : (
                  <Input
                    type={type}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={placeholder}
                    className="h-9 text-sm"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="h-8 bg-brand-600 px-3 text-xs hover:bg-brand-700"
                  >
                    {isLoading ? "Saving..." : <><Check className="mr-1 h-3 w-3" />Save</>}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditing}
                    disabled={isLoading}
                    className="h-8 px-3 text-xs"
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
            className="h-8 w-8 text-gray-400 opacity-0 transition-opacity hover:text-brand-600 group-hover:opacity-100"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { session } = useSession();
  const { preferences } = useUserPreferences();

  if (!session) return null;

  const updateUserMetadata = async (key: string, value: string) => {
    const { error } = await db.auth.updateUser({
      data: {
        [key]: value,
      },
    });

    if (error) throw error;
  };

  // Calculate profile completion
  const profileFields = {
    name: session?.user?.user_metadata?.name,
    phone: session?.user?.user_metadata?.phone,
    country: session?.user?.user_metadata?.country,
    position: session?.user?.user_metadata?.position,
    company: session?.user?.user_metadata?.company,
    bio: session?.user?.user_metadata?.bio,
    skills: session?.user?.user_metadata?.skills,
    education: session?.user?.user_metadata?.education,
  };
  const filledProfileFields = Object.values(profileFields).filter(Boolean).length;
  const totalProfileFields = Object.keys(profileFields).length;
  const profileCompletion = Math.round((filledProfileFields / totalProfileFields) * 100);

  // Calculate job preferences completion
  const preferenceFields = {
    job_titles: preferences?.preferred_job_titles?.length > 0,
    locations: (preferences?.preferred_provinces?.length > 0) || (preferences?.preferred_cities?.length > 0),
    industries: preferences?.preferred_industries?.length > 0,
    noc_codes: preferences?.preferred_noc_codes?.length > 0,
    tiers: preferences?.preferred_company_tiers?.length > 0,
  };
  const filledPreferenceFields = Object.values(preferenceFields).filter(Boolean).length;
  const totalPreferenceFields = Object.keys(preferenceFields).length;
  const preferencesCompletion = Math.round((filledPreferenceFields / totalPreferenceFields) * 100);

  // Check if any preference is set
  const hasAnyPreference = filledPreferenceFields > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header with Completion */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Profile Settings
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your personal information and job preferences
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {/* Profile Completion */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10">
                  <svg className="h-10 w-10 -rotate-90 transform">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - profileCompletion / 100)}`}
                      className="text-brand-600 transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">Profile</div>
                  <div className="text-xs text-gray-500">
                    {filledProfileFields}/{totalProfileFields} fields
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Completion */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10">
                  <svg className="h-10 w-10 -rotate-90 transform">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - preferencesCompletion / 100)}`}
                      className="text-brand-600 transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                    {preferencesCompletion}%
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">Preferences</div>
                  <div className="text-xs text-gray-500">
                    {filledPreferenceFields}/{totalPreferenceFields} set
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Status Alert */}
        {!hasAnyPreference && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                No job preferences set
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Set at least one preference below to receive personalized job recommendations. The more preferences you set, the better your recommendations will be.
              </p>
            </div>
          </div>
        )}
        {hasAnyPreference && preferencesCompletion < 100 && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Improve your recommendations
              </p>
              <p className="mt-1 text-sm text-blue-700">
                You've set {filledPreferenceFields} out of {totalPreferenceFields} preferences. Fill all fields below for the most accurate job matches.
              </p>
            </div>
          </div>
        )}
        {preferencesCompletion === 100 && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-900">
                All preferences set!
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Your job preferences are complete. You'll receive the most accurate recommendations based on your criteria.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Single Column */}
      <div className="space-y-8">
        {/* Personal Information */}
        <section>
          <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
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
              icon={<Mail className="h-4 w-4" />}
              title="Email"
              value={session?.user?.email || ""}
              placeholder="your@email.com"
              onUpdate={(value) => updateUserMetadata("email", value)}
              type="email"
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

        {/* Professional Profile */}
        <section>
          <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
            <Briefcase className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">Professional Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <EditableField
                icon={<Briefcase className="h-4 w-4" />}
                title="Current Role"
                value={session?.user?.user_metadata?.position || ""}
                placeholder="Ex. Software Engineer"
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
              placeholder="Tell us about your professional background..."
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

        {/* Job Preferences */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <JobPreferencesSection />
        </section>
      </div>
    </div>
  );
}
