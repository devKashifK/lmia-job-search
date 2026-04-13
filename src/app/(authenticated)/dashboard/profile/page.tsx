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
import { ResumeUpload } from "@/components/profile/resume-upload";
import { AnalysisConfirmationDialog } from "@/components/profile/analysis-confirmation-dialog";
import { TimelineSection } from "@/components/profile/timeline-section";
import { SkillsSection } from "@/components/profile/skills-section";
import { NocRecommendationDialog } from "@/components/profile/noc-recommendation-dialog";
import { useUserProfile } from "@/hooks/use-user-profile";

interface EditableFieldProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  placeholder: string;
  onUpdate: (newValue: string) => Promise<void>;
  type?: string;
  isTextArea?: boolean;
  last?: boolean;
  weight?: number;
}

function EditableField({
  icon,
  title,
  value,
  placeholder,
  onUpdate,
  type = "text",
  isTextArea = false,
  last = false,
  weight,
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
    <div className={cn("group px-4 py-3.5 transition-colors hover:bg-gray-50/50", !last && "border-b border-gray-100")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50/80 text-gray-500 border border-transparent group-hover:border-brand-100 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
            {icon}
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{title}</p>
            {!isEditing ? (
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm font-medium", !value ? "text-gray-400 italic" : "text-gray-900")}>
                    {value || "Not set"}
                  </p>
                  {!value ? (
                    weight && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                        +{weight}%
                      </span>
                    )
                  ) : (
                    weight && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                          {weight}%
                        </span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      </div>
                    )
                  )}
                </div>
            ) : (
              <div className="space-y-3 mt-2 max-w-lg">
                {isTextArea ? (
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[100px] resize-none text-sm bg-white"
                  />
                ) : (
                  <Input
                    type={type}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={placeholder}
                    className="h-9 text-sm bg-white"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="h-7 bg-brand-600 px-3 text-xs hover:bg-brand-700"
                  >
                    {isLoading ? "Saving..." : <><Check className="mr-1 h-3 w-3" />Save</>}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditing}
                    disabled={isLoading}
                    className="h-7 px-3 text-xs"
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
            className="h-7 w-7 text-gray-300 opacity-0 transition-opacity hover:text-brand-600 hover:bg-brand-50 group-hover:opacity-100 -mt-1"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

import { AgencyProfileView } from "@/components/agency/agency-profile-view";
import { useCreditData } from "@/hooks/use-credits";

export default function UserProfile() {
  const { session } = useSession();
  const { creditData } = useCreditData();
  const { preferences, updatePreferences } = useUserPreferences();
  const { profile, updateProfile, isLoading: isProfileLoading } = useUserProfile();
  const { toast } = useToast();

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // NOC Dialog State
  const [isNocDialogOpen, setIsNocDialogOpen] = useState(false);
  const [pendingNocJobTitles, setPendingNocJobTitles] = useState<string[]>([]);

  if (!session) return null;

  const isAgency = creditData?.plan_type === 'agency';

  if (isAgency) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <AgencyProfileView />
      </div>
    );
  }

  const updateUserMetadata = async (key: string, value: string) => {
    // Only name and email stay in Auth metadata to keep JWT small
    if (key === "name" || key === "email") {
      const { error } = await db.auth.updateUser({
        data: { [key]: value },
      });
      if (error) throw error;
    } else {
      // Map legacy country key to location in profiles table
      const profileKey = key === "country" ? "location" : key;
      await updateProfile({ [profileKey]: value });
    }
  };

  const handleAnalysisComplete = async (data: any) => {
    if (!data) return;
    setAnalysisData(data);
    setIsAnalysisDialogOpen(true);
  };

  const handleConfirmAnalysis = async () => {
    if (!analysisData) return;

    setIsUpdatingProfile(true);
    try {
      const data = analysisData;
      console.log("DEBUG: Starting profile update with data:", data);

      let finalJobTitles: string[] = preferences?.preferred_job_titles || [];

      // 1. Update Identity Metadata (Keep minimal)
      const { error: metaError } = await db.auth.updateUser({
        data: {
          name: data.name || session?.user?.user_metadata?.name,
          email: data.email || session?.user?.user_metadata?.email,
        }
      });

      if (metaError) throw metaError;

      // 2. Update Professional Profile Table (Large data)
      const profileUpdates: any = {
        phone: data.phone || profile?.phone,
        location: data.location || profile?.location,
        linkedin: data.linkedin || profile?.linkedin,
        website: data.website || profile?.website,
        position: data.position || profile?.position,
        company: data.company || profile?.company,
        bio: data.bio || profile?.bio,
        skills: data.skills || profile?.skills,
        experience: data.experience ? String(data.experience) : profile?.experience,
        education: Array.isArray(data.education) ? data.education.join("\n\n") : data.education || profile?.education,
        work_history: Array.isArray(data.work_experience) ? data.work_experience.join("\n\n") : data.work_experience || profile?.work_history,
        projects: Array.isArray(data.projects) ? data.projects.join("\n\n") : data.projects || profile?.projects,
      };

      await updateProfile(profileUpdates);

      // Update Job Preferences with Recommended Titles
      if (data.recommended_job_titles && Array.isArray(data.recommended_job_titles)) {
        const currentTitles = preferences?.preferred_job_titles || [];
        const newTitles = data.recommended_job_titles.filter((t: string) => !currentTitles.includes(t));

        if (newTitles.length > 0) {
          console.log("DEBUG: Updating preferences with titles:", newTitles);
          finalJobTitles = [...currentTitles, ...newTitles];
          try {
            await updatePreferences({
              preferred_job_titles: finalJobTitles
            });
          } catch (prefError) {
            console.error("DEBUG: Preferences update failed", prefError);
            throw prefError;
          }
        } else {
          console.log("DEBUG: No new titles to add.");
          finalJobTitles = currentTitles;
        }
      }

      console.log("DEBUG: Profile update complete.");

      // Dismiss Analysis dialog
      setIsAnalysisDialogOpen(false);
      setAnalysisData(null);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated.",
      });

      // Instead of reloading, open NOC dialog if we have relevant titles
      if (finalJobTitles.length > 0) {
        setPendingNocJobTitles(finalJobTitles);
        setIsNocDialogOpen(true);
      } else {
        window.location.reload();
      }

    } catch (error: any) {
      console.error("Failed to apply analysis results:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Could not update profile: ${error.message || "Unknown error"}`,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleNocDialogClose = () => {
    setIsNocDialogOpen(false);
    // Reload page to reflect all changes (Profile + Job Titles + NOCs)
    window.location.reload();
  };

  const profileFields = {
    name: session?.user?.user_metadata?.name,
    phone: profile?.phone,
    country: profile?.location,
    position: profile?.position,
    company: profile?.company,
    bio: profile?.bio,
    skills: profile?.skills,
    education: profile?.education,
    work_history: profile?.work_history,
    projects: profile?.projects,
    experience: profile?.experience,
    linkedin: profile?.linkedin,
  };
  const filledProfileFields = Object.values(profileFields).filter(Boolean).length;
  const totalProfileFields = Object.keys(profileFields).length;
  const profileCompletion = Math.round((filledProfileFields / totalProfileFields) * 100);

  const preferenceFields = {
    job_titles: preferences?.preferred_job_titles?.length > 0,
    locations: (preferences?.preferred_locations?.length || 0) > 0,
    industries: preferences?.preferred_industries?.length > 0,
    noc_codes: preferences?.preferred_noc_codes?.length > 0,
    tiers: preferences?.preferred_company_tiers?.length > 0,
  };
  const filledPreferenceFields = Object.values(preferenceFields).filter(Boolean).length;
  const totalPreferenceFields = Object.keys(preferenceFields).length;
  const preferencesCompletion = Math.round((filledPreferenceFields / totalPreferenceFields) * 100);

  const hasAnyPreference = filledPreferenceFields > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-50/50 to-transparent opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {session?.user?.user_metadata?.name || "Your Profile"}
            </h1>
            <p className="text-gray-500 max-w-lg">
              Manage your personal information and complete your profile to get better job recommendations.
            </p>

            {/* Completion Bars */}
            <div className="flex gap-6 mt-6">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Profile Completion</span>
                  <span className="text-gray-900">{profileCompletion}%</span>
                </div>
                <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Preferences</span>
                  <span className="text-gray-900">{preferencesCompletion}%</span>
                </div>
                <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${preferencesCompletion}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Personal Info & Social (Sticky-ish?) */}
        <div className="lg:col-span-1 space-y-6">

          {/* Resume Upload Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-600" />
                Resume
              </h3>
            </div>
            <div className="p-4">
              <ResumeUpload
                currentResumeUrl={session?.user?.user_metadata?.resume_url}
                onUploadComplete={() => {
                  window.location.reload();
                }}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          </div>

          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-brand-600" />
                Personal Details
              </h3>
            </div>
            <div>
              <EditableField
                icon={<User className="h-4 w-4" />}
                title="Full Name"
                value={session?.user?.user_metadata?.name || ""}
                placeholder="Ex. John Doe"
                onUpdate={(value) => updateUserMetadata("name", value)}
                weight={9}
              />
              <EditableField
                icon={<Mail className="h-4 w-4" />}
                title="Email"
                value={profile?.email || session?.user?.user_metadata?.email || session?.user?.email || ""}
                placeholder="your@email.com"
                onUpdate={(value) => updateUserMetadata("email", value)}
                type="email"
                weight={9}
              />
              <EditableField
                icon={<Phone className="h-4 w-4" />}
                title="Phone"
                value={profile?.phone || ""}
                placeholder="+1 (555) 000-0000"
                onUpdate={(value) => updateProfile({ phone: value })}
                type="tel"
                weight={9}
              />
              <EditableField
                icon={<MapPin className="h-4 w-4" />}
                title="Location"
                value={profile?.location || ""}
                placeholder="Toronto, Canada"
                onUpdate={(value) => updateProfile({ location: value })}
                weight={9}
              />
              <EditableField
                icon={<Globe className="h-4 w-4" />}
                title="Website"
                value={profile?.website || ""}
                placeholder="https://..."
                onUpdate={(value) => updateProfile({ website: value })}
                weight={9}
              />
              <EditableField
                icon={<Shield className="h-4 w-4" />}
                title="LinkedIn"
                value={profile?.linkedin || ""}
                placeholder="https://linkedin.com/in/..."
                onUpdate={(value) => updateProfile({ linkedin: value })}
                last
                weight={9}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Professional Info, Timeline, Skills */}
        <div className="lg:col-span-2 space-y-6">

          {/* Preferences Alert (Keep existing logic but styled better) */}
          {!hasAnyPreference && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-900"><strong>Action Required:</strong> Set your job preferences to get personalized recommendations.</p>
            </div>
          )}

          {/* Professional Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-brand-600" />
                Professional Profile
              </h3>
            </div>
            <div>
              <EditableField
                icon={<Briefcase className="h-4 w-4" />}
                title="Current Role"
                value={profile?.position || ""}
                placeholder="Ex. Software Engineer"
                onUpdate={(value) => updateProfile({ position: value })}
                weight={9}
              />
              <EditableField
                icon={<Building className="h-4 w-4" />}
                title="Current Company"
                value={profile?.company || ""}
                placeholder="Ex. Google"
                onUpdate={(value) => updateProfile({ company: value })}
                weight={9}
              />
              <EditableField
                icon={<FileText className="h-4 w-4" />}
                title="Professional Bio"
                value={profile?.bio || ""}
                placeholder="Summary of your experience..."
                onUpdate={(value) => updateProfile({ bio: value })}
                isTextArea
                weight={9}
              />
              <EditableField
                icon={<Clock className="h-4 w-4" />}
                title="Years of Experience"
                value={profile?.experience || ""}
                placeholder="Ex. 5"
                onUpdate={(value) => updateProfile({ experience: value })}
                type="number"
                last
                weight={9}
              />
            </div>
          </div>

          {/* Skills */}
          <SkillsSection
            value={profile?.skills || ""}
            onUpdate={(value) => updateUserMetadata("skills", value)}
            placeholder="React, Next.js, Node.js..."
            weight={9}
          />
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-8">
        {/* Work History */}
        <TimelineSection
          title="Work History"
          type="work"
          value={profile?.work_history || ""}
          onUpdate={(value) => updateUserMetadata("work_history", value)}
          placeholder="List your past roles..."
          weight={9}
        />

        {/* Education */}
        <TimelineSection
          title="Education"
          type="education"
          value={profile?.education || ""}
          onUpdate={(value) => updateUserMetadata("education", value)}
          placeholder="List your education..."
          weight={9}
        />
        
        {/* Projects */}
        <TimelineSection
          title="Personal Projects"
          type="projects"
          value={profile?.projects || ""}
          onUpdate={(value) => updateUserMetadata("projects", value)}
          placeholder="List your key projects (e.g. Job Maze)..."
          weight={9}
        />

        {/* Job Preferences */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
          <JobPreferencesSection />
        </div>
      </div>

      {/* Dialogs... */}
      <AnalysisConfirmationDialog
        isOpen={isAnalysisDialogOpen}
        onClose={() => setIsAnalysisDialogOpen(false)}
        onConfirm={handleConfirmAnalysis}
        data={analysisData}
        isUpdating={isUpdatingProfile}
      />

      <NocRecommendationDialog
        isOpen={isNocDialogOpen}
        onClose={handleNocDialogClose}
        jobTitles={pendingNocJobTitles}
      />
    </div>
  );
}
