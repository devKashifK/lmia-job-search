import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, User, Mail, Phone, MapPin, Briefcase, Building, FileText, Code, GraduationCap, X, Home, Calendar, Linkedin, Globe, Clock, ChevronRight, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: any;
    isUpdating: boolean;
}

export function AnalysisConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    data,
    isUpdating
}: AnalysisConfirmationDialogProps) {
    if (!data) return null;

    // Helper to render a compact field
    const CompactField = ({ icon: Icon, label, value, href }: any) => {
        if (!value) return null;
        return (
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:underline truncate block">
                            {value}
                        </a>
                    ) : (
                        <p className="text-sm font-medium text-gray-900 truncate" title={String(value)}>{value}</p>
                    )}
                </div>
            </div>
        );
    };

    // Parse skills if string
    const skillsList = data?.skills ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

    const [recommendedNocs, setRecommendedNocs] = useState<any[]>([]);
    const [recommendedTeers, setRecommendedTeers] = useState<string[]>([]);
    const [recommendedIndustries, setRecommendedIndustries] = useState<string[]>([]);

    useEffect(() => {
        const fetchNocs = async () => {
            if (data?.recommended_job_titles?.length > 0) {
                try {
                    const response = await fetch('/api/match-noc', {
                        method: 'POST',
                        body: JSON.stringify({ jobTitles: data.recommended_job_titles }),
                    });
                    if (response.ok) {
                        const resData = await response.json();
                        setRecommendedNocs(resData.matches || []);
                        setRecommendedTeers(resData.teerMatches || []);
                        setRecommendedIndustries(resData.industryMatches || []);
                    }
                } catch (e) {
                    console.error("Failed to fetch NOCs for dialog", e);
                }
            }
        };
        if (isOpen && data) {
            fetchNocs();
        }
    }, [isOpen, data]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-white">
                    <DialogTitle className="flex items-center gap-2 text-xl text-brand-900">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm">
                            <Check className="h-5 w-5" />
                        </div>
                        Review Resume Data
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 ml-10">
                        We extracted this information. Confirm to update your profile.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-gray-50/50">
                    <div className="p-6 space-y-6">
                        {/* 1. Identity Card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-brand-500" /> Personal Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                <CompactField icon={User} label="Full Name" value={data.name} />
                                <CompactField icon={Mail} label="Email" value={data.email} />
                                <CompactField icon={Phone} label="Phone" value={data.phone} />
                                <CompactField icon={MapPin} label="Location" value={data.location} />
                                <CompactField icon={Calendar} label="Born" value={data.dob} />
                                <CompactField icon={Linkedin} label="LinkedIn" value={data.linkedin} href={data.linkedin} />
                                <CompactField icon={Globe} label="Website" value={data.website} href={data.website} />
                                <CompactField icon={Home} label="Address" value={data.address} />
                            </div>
                        </div>

                        {/* 2. Professional Summary */}
                        {data.bio && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-brand-500" /> Professional Bio
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.bio}</p>
                            </div>
                        )}

                        {/* 3. Recommended Roles */}
                        {data.recommended_job_titles && data.recommended_job_titles.length > 0 && (
                            <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-4 bg-brand-50/30">
                                <h3 className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-brand-600" /> Recommended Roles
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.recommended_job_titles.map((title: string, i: number) => (
                                        <Badge key={i} className="bg-brand-100 text-brand-700 hover:bg-brand-200 border-brand-200">
                                            {title}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-xs text-brand-600/80 mt-2">
                                    These will be added to your job preferences automatically.
                                </p>
                            </div>
                        )}

                        {/* 3.5. Recommended NOCs */}
                        {recommendedNocs.length > 0 && (
                            <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-4 bg-brand-50/30">
                                <h3 className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-brand-600" /> Recommended NOC Codes
                                </h3>
                                <div className="space-y-2">
                                    {recommendedNocs.map((noc, i) => (
                                        <div key={i} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-brand-100/50">
                                            <Badge variant="outline" className="font-mono bg-brand-50 text-brand-700 border-brand-200 shrink-0">
                                                {noc.code}
                                            </Badge>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{noc.title}</p>
                                                <p className="text-xs text-brand-600/80 mt-0.5">Recommended based on job title match</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-brand-600/80 mt-3">
                                    These NOC codes will be suggested for your profile preferences.
                                </p>
                            </div>
                        )}

                        {/* 3.6. Recommended Industries */}
                        {recommendedIndustries.length > 0 && (
                            <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-4 bg-brand-50/30">
                                <h3 className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-brand-600" /> Recommended Industries
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {recommendedIndustries.map((ind, i) => (
                                        <Badge key={i} variant="outline" className="bg-brand-50 text-brand-700 border-brand-200">
                                            {ind}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-xs text-brand-600/80 mt-2">
                                    We'll add these industries to your preferences.
                                </p>
                            </div>
                        )}

                        {/* 3.7. Recommended TEERs */}
                        {recommendedTeers.length > 0 && (
                            <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-4 bg-brand-50/30">
                                <h3 className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-brand-600" /> Recommended TEER Levels
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {recommendedTeers.map((teer, i) => (
                                        <Badge key={i} variant="outline" className="bg-brand-50 text-brand-700 border-brand-200">
                                            TEER {teer}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-xs text-brand-600/80 mt-2">
                                    Based on your skillset, these TEER levels seem appropriate.
                                </p>
                            </div>
                        )}

                        {/* 4. Skills */}
                        {skillsList.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Code className="h-4 w-4 text-brand-500" /> Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {skillsList.map((skill: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="bg-brand-50 text-brand-700 hover:bg-brand-100 font-normal">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Experience & Work History */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(data.work_experience || data.experience || data.position) && (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col h-full">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-brand-500" /> Experience
                                    </h3>
                                    <div className="space-y-4 flex-1">
                                        {(data.position || data.company) && (
                                            <div className="p-3 bg-brand-50/30 rounded-lg border border-brand-100/50">
                                                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">Current Role</p>
                                                <p className="font-medium text-gray-900">{data.position}</p>
                                                <p className="text-sm text-gray-600">{data.company}</p>
                                            </div>
                                        )}
                                        {data.experience && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>Total Experience: <span className="font-medium text-gray-900">{data.experience} Years</span></span>
                                            </div>
                                        )}
                                        {data.work_experience && (
                                            <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap pl-3 border-l-2 border-brand-200">
                                                {Array.isArray(data.work_experience) ? data.work_experience.join("\n\n") : data.work_experience}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 5. Education */}
                            {data.education && (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col h-full">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-brand-500" /> Education
                                    </h3>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap pl-3 border-l-2 border-brand-200 flex-1">
                                        {Array.isArray(data.education) ? data.education.join("\n\n") : data.education}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isUpdating} className="h-10 px-4">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isUpdating} className="h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow">
                        {isUpdating ? "Applying Updates..." : "Confirm & Update Profile"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
