import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Pencil, Check, X } from "lucide-react";

interface SkillBadgeProps {
    name: string;
}

function SkillBadge({ name }: SkillBadgeProps) {
    // Normalize for icon search (lowercase, no spaces, replace special chars)
    // Common mappings or just simple normalization
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    // We can try to guess the icon from Devicon or Iconify via simple IMG
    // Using a generic service like devicon.dev or similar if available, or just a placeholder
    // A safe bet for a wide range is simple-icons via CDN or iconify
    // Let's use a generic placeholder approach if image fails, or just text if robust icon set isn't installed.
    // The user asked for "iconify api".

    // Iconify URL pattern: https://api.iconify.design/logos/[name].svg
    // We need to handle the case where "logos:[name]" might not exist.
    // Common prefixes: logos, fa-brands, simple-icons, skill-icons.

    // Try 'skill-icons' first as they are colorful and nice: https://skillicons.dev/icons?i=[name]
    // But strictly user asked for Iconify.
    // Let's use a smart heuristic: try to construct a valid img url.

    const iconUrl = `https://api.iconify.design/skill-icons:${normalized}.svg`;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-white border border-gray-200 hover:border-brand-200 rounded-lg transition-all shadow-sm hover:shadow group">
            <img
                src={iconUrl}
                alt=""
                className="w-4 h-4 object-contain opacity-80 group-hover:opacity-100"
                onError={(e) => {
                    // Fallback to generic code icon if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    ((e.target as HTMLImageElement).nextSibling as HTMLElement).style.display = 'block';
                }}
            />
            <Code className="w-4 h-4 text-gray-400 hidden group-hover:text-brand-500" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 capitalize">{name}</span>
        </div>
    );
}

interface SkillsSectionProps {
    value: string;
    onUpdate: (newValue: string) => Promise<void>;
    placeholder: string;
}

export function SkillsSection({ value, onUpdate, placeholder }: SkillsSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (editValue === value) {
            setIsEditing(false);
            return;
        }
        setIsLoading(true);
        try {
            await onUpdate(editValue);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const skillsList = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Code className="h-5 w-5 text-brand-600" />
                    Skills & Technologies
                </h2>
                {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-brand-600">
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={placeholder}
                        className="min-h-[100px] text-sm"
                    />
                    <p className="text-xs text-gray-500">Separate skills with commas (e.g. React, Node.js, Python)</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setEditValue(value); setIsEditing(false); }} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-brand-600 hover:bg-brand-700">
                            {isLoading ? "Saving..." : "Save Skills"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {skillsList.length > 0 ? (
                        skillsList.map((skill, i) => (
                            <SkillBadge key={i} name={skill} />
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic">No skills listed yet.</p>
                    )}
                </div>
            )}
        </section>
    );
}
