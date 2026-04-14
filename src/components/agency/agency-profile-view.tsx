"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAgencyProfile } from "@/hooks/use-agency-profile";
import db from "@/db";
import { useSession } from "@/hooks/use-session";
import {
  Building2,
  Globe,
  MapPin,
  Shield,
  Check,
  Pencil,
  Building,
  Mail,
  User,
  Image as ImageIcon,
  Briefcase,
  Linkedin,
  Twitter,
  CalendarDays,
  Award,
  Target,
  Loader2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  icon: React.ReactNode;
  title: string;
  value: string | number | null;
  placeholder: string;
  onUpdate: (newValue: any) => Promise<void>;
  type?: string;
  last?: boolean;
}

function EditableField({
  icon,
  title,
  value,
  placeholder,
  onUpdate,
  type = "text",
  last = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (editValue === value?.toString()) {
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    try {
      const finalValue = type === 'number' ? parseInt(editValue) || 0 : editValue;
      await onUpdate(finalValue);
      setIsEditing(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update ${title.toLowerCase()}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("group px-6 py-4 transition-colors hover:bg-gray-50/50", !last && "border-b border-gray-100")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all border border-transparent group-hover:border-brand-100">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-0.5">{title}</p>
            {!isEditing ? (
              <p className={cn("text-sm font-semibold", !value ? "text-gray-400 italic" : "text-gray-900")}>
                {value || `Set ${title.toLowerCase()}`}
              </p>
            ) : (
              <div className="space-y-3 mt-2 max-w-md">
                <Input
                  type={type}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={placeholder}
                  className="h-10 text-sm bg-white border-gray-200 focus:border-brand-500 rounded-xl"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleUpdate} disabled={isLoading} className="h-8 bg-brand-600 px-4 rounded-lg">
                    {isLoading ? "Saving..." : <><Check className="mr-2 h-4 w-4" />Save</>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isLoading} className="h-8 px-4">
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
            onClick={() => {
              setEditValue(value?.toString() || "");
              setIsEditing(true);
            }}
            className="h-8 w-8 text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:text-brand-600 hover:bg-brand-50 rounded-lg"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function AgencyProfileView() {
  const { profile, updateProfile, isLoading } = useAgencyProfile();
  const { session } = useSession();
  const { toast } = useToast();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please upload an image file." });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Logo must be under 2MB." });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/logo-${Date.now()}.${fileExt}`;

      // 1. Upload to Storage
      const { error: uploadError } = await db.storage
        .from('agency-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = db.storage
        .from('agency-logos')
        .getPublicUrl(fileName);

      // 3. Update Profile
      await updateProfile({ logo_url: publicUrl });

      toast({ title: "Logo updated", description: "Your agency logo has been successfully updated." });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({ variant: "destructive", title: "Upload failed", description: error.message || "Failed to upload logo." });
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-48 bg-gray-100 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-100 rounded-2xl" />
          <div className="h-96 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Brand Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-200 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className="relative group shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <div 
              onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
              className={cn(
                "h-28 w-28 rounded-2xl bg-white border-2 border-dashed flex items-center justify-center transition-all overflow-hidden shadow-inner font-bold cursor-pointer group/logo relative",
                isUploadingLogo ? "border-brand-300 bg-brand-50" : "border-gray-200 hover:border-brand-300 hover:bg-brand-50"
              )}
            >
               {isUploadingLogo ? (
                 <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
               ) : profile.logo_url ? (
                 <>
                   <img src={profile.logo_url} alt={profile.company_name} className="h-full w-full object-contain p-2" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                   </div>
                 </>
               ) : (
                 <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="h-10 w-10 text-gray-300 group-hover/logo:text-brand-400" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Upload Logo</span>
                 </div>
               )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest">Agency Partner</span>
                {profile.license_number && (
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Award className="h-3 w-3" />
                         Verified
                    </span>
                )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {profile.company_name || "New Agency Profile"}
            </h1>
            <p className="text-gray-500 max-w-lg text-sm font-medium">
              Update your business credentials and contact identity to build trust with your client roster.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Row 1: Left - Company Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                <Building2 className="h-4 w-4 text-brand-600" />
                Firm Credentials
              </h3>
            </div>
            <div>
              <EditableField
                icon={<Building className="h-5 w-5" />}
                title="Company Name"
                value={profile.company_name}
                placeholder="Ex. Global Recruits Inc."
                onUpdate={(val) => updateProfile({ company_name: val })}
              />
              <EditableField
                icon={<Globe className="h-5 w-5" />}
                title="Website"
                value={profile.website || ""}
                placeholder="https://agency-website.com"
                onUpdate={(val) => updateProfile({ website: val })}
              />
              <EditableField
                icon={<MapPin className="h-5 w-5" />}
                title="Office Location"
                value={profile.office_address || ""}
                placeholder="City, Country"
                onUpdate={(val) => updateProfile({ office_address: val })}
              />
              <EditableField
                icon={<Shield className="h-5 w-5" />}
                title="Recruitment License"
                value={profile.license_number || ""}
                placeholder="License ID"
                onUpdate={(val) => updateProfile({ license_number: val })}
                last
              />
            </div>
          </div>

          {/* Specialization Section */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                <Briefcase className="h-4 w-4 text-brand-600" />
                Specialization & Focus
              </h3>
            </div>
            <div>
              <EditableField
                icon={<Target className="h-5 w-5" />}
                title="Industry Focus"
                value={profile.specialization}
                placeholder="Ex. Healthcare, IT, Construction"
                onUpdate={(val) => updateProfile({ specialization: val })}
              />
              <EditableField
                icon={<CalendarDays className="h-5 w-5" />}
                title="Years Operating"
                value={profile.experience_years}
                placeholder="Number of years"
                type="number"
                onUpdate={(val) => updateProfile({ experience_years: val })}
                last
              />
            </div>
          </div>
        </div>

        {/* Row 1: Right - Contact & Social */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                <User className="h-4 w-4 text-brand-600" />
                Primary Contact
              </h3>
            </div>
            <div>
              <EditableField
                icon={<User className="h-5 w-5" />}
                title="Contact Person"
                value={profile.contact_name}
                placeholder="Name of primary contact"
                onUpdate={(val) => updateProfile({ contact_name: val })}
              />
              <EditableField
                icon={<Mail className="h-5 w-5" />}
                title="Business Email"
                value={profile.contact_email}
                placeholder="contact@agency.com"
                onUpdate={(val) => updateProfile({ contact_email: val })}
                last
              />
            </div>
          </div>

          {/* Social Presence */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                <Linkedin className="h-4 w-4 text-brand-600" />
                Social Connectivity
              </h3>
            </div>
            <div>
              <EditableField
                icon={<Linkedin className="h-5 w-5" />}
                title="LinkedIn Page"
                value={profile.linkedin_url}
                placeholder="https://linkedin.com/company/..."
                onUpdate={(val) => updateProfile({ linkedin_url: val })}
              />
              <EditableField
                icon={<Twitter className="h-5 w-5" />}
                title="Twitter / X Profile"
                value={profile.twitter_url}
                placeholder="https://x.com/agency_id"
                onUpdate={(val) => updateProfile({ twitter_url: val })}
                last
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
