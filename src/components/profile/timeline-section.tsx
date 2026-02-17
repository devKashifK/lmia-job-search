import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Briefcase, GraduationCap, Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Parsing ---

interface TimelineItemData {
    id: string;
    title: string; // Role or Degree
    subtitle: string; // Company or School
    date: string;
    description: string;
}

// Helper to parse the legacy string format into structured data
const parseItems = (value: string): TimelineItemData[] => {
    if (!value) return [];

    // Split by double newline to get distinct blocks
    const blocks = value.split(/\n\n|\r\n\r\n/).filter(b => b.trim());

    return blocks.map((block, idx) => {
        const lines = block.split('\n');
        const firstLine = lines[0] || "";
        const description = lines.slice(1).join('\n').trim();

        // Try to parse "Role at Company (Date)" or "Degree, School, Date"
        // Regex for "Something (Date)"
        const dateMatch = firstLine.match(/\((.*?)\)$/);
        const date = dateMatch ? dateMatch[1] : "";

        let titleAndSubtitle = dateMatch ? firstLine.replace(dateMatch[0], "").trim() : firstLine;

        // Simple heuristic: " at " splits Title and Company
        let title = titleAndSubtitle;
        let subtitle = "";

        if (titleAndSubtitle.includes(" at ")) {
            const parts = titleAndSubtitle.split(" at ");
            title = parts[0].trim();
            subtitle = parts[1].trim();
        } else if (titleAndSubtitle.includes(",")) {
            // "Degree, School"
            const parts = titleAndSubtitle.split(",");
            title = parts[0].trim();
            subtitle = parts.slice(1).join(',').trim();
        }

        return {
            id: `item-${idx}-${Date.now()}`,
            title,
            subtitle,
            date,
            description
        };
    });
};

const serializeItems = (items: TimelineItemData[]): string => {
    return items.map(item => {
        let header = item.title;
        if (item.subtitle) header += ` at ${item.subtitle}`;
        if (item.date) header += ` (${item.date})`;

        return `${header}\n${item.description}`;
    }).join("\n\n");
};

// --- Components ---

interface TimelineItemProps {
    data: TimelineItemData;
    isLast: boolean;
    type: "work" | "education";
    onEdit?: () => void;
    onDelete?: () => void;
    editable?: boolean;
}

function TimelineItem({ data, isLast, type, onEdit, onDelete, editable }: TimelineItemProps) {
    return (
        <div className="relative pl-10 pb-8 last:pb-0 group">
            {/* Connector Line */}
            {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-100 group-hover:bg-brand-100 transition-colors" />
            )}

            {/* Icon Node */}
            <div className={cn(
                "absolute left-0 top-1 h-8 w-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-all duration-300",
                type === "work" ? "bg-brand-50 text-brand-600 group-hover:bg-brand-100" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
            )}>
                {type === "work" ? <Briefcase className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
            </div>

            {/* Content Card */}
            <div className={cn(
                "bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition-all relative overflow-hidden group/card hover:border-brand-200 hover:shadow-md",
                editable && "cursor-pointer"
            )} onClick={editable ? onEdit : undefined}>

                {/* Edit Actions Overlay */}
                {editable && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm z-20">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md" onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md" onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}

                <div className="space-y-1.5 relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm leading-snug">{data.title}</h4>
                            {data.subtitle && (
                                <p className="text-xs text-gray-600 font-medium mt-0.5">{data.subtitle}</p>
                            )}
                        </div>
                        {data.date && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-[10px] font-semibold text-gray-500 border border-gray-100 shrink-0">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                {data.date}
                            </div>
                        )}
                    </div>

                    {data.description && (
                        <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed pt-2 border-t border-gray-50/50">
                            {data.description}
                        </p>
                    )}
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-full opacity-50 pointer-events-none" />
            </div>
        </div>
    );
}

// --- Main Form ---

interface TimelineSectionProps {
    title: string;
    value: string;
    onUpdate: (newValue: string) => Promise<void>;
    placeholder: string;
    type: "work" | "education";
}

export function TimelineSection({ title, value, onUpdate, placeholder, type }: TimelineSectionProps) {
    const items = useMemo(() => parseItems(value), [value]);
    const [isEditing, setIsEditing] = useState(false);

    // Editing State
    const [localItems, setLocalItems] = useState<TimelineItemData[]>([]);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TimelineItemData>({ id: "", title: "", subtitle: "", date: "", description: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleStartEdit = () => {
        setLocalItems(items);
        setIsEditing(true);
        setEditingItemId(null); // Showing list of items
    };

    const handleEditItem = (item: TimelineItemData) => {
        setFormData(item);
        setEditingItemId(item.id);
    };

    const handleAddNew = () => {
        setFormData({ id: `new-${Date.now()}`, title: "", subtitle: "", date: "", description: "" });
        setEditingItemId("new");
    };

    const handleSaveForm = () => {
        // Validate
        if (!formData.title.trim()) return;

        let newItems = [...localItems];
        if (editingItemId === "new") {
            newItems.push({ ...formData, id: `item-${Date.now()}` });
        } else {
            newItems = newItems.map(item => item.id === editingItemId ? formData : item);
        }

        setLocalItems(newItems);
        setEditingItemId(null); // Back to list view
    };

    const handleDeleteItem = (id: string) => {
        setLocalItems(prev => prev.filter(i => i.id !== id));
    };

    const handleSaveAll = async () => {
        setIsLoading(true);
        try {
            const serialized = serializeItems(localItems);
            await onUpdate(serialized);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {type === "work" ? <Briefcase className="h-5 w-5 text-brand-600" /> : <GraduationCap className="h-5 w-5 text-blue-600" />}
                    {title}
                </h2>
                {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={handleStartEdit} className="text-gray-500 hover:text-brand-600 hover:bg-brand-50 h-8 text-xs font-medium">
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Manage
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    editingItemId ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-gray-50/50 rounded-xl p-5 border border-gray-200 space-y-4"
                        >
                            <div className="flex items-center justify-between pointer-events-none">
                                <h3 className="text-sm font-semibold text-gray-900">{editingItemId === "new" ? "Add New" : "Edit Item"}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500 font-medium">{type === "work" ? "Job Title" : "Degree / Certificate"}</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="h-9 bg-white text-sm"
                                        placeholder={type === "work" ? "e.g. Senior Developer" : "e.g. BSc Computer Science"}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500 font-medium">{type === "work" ? "Company" : "School / University"}</Label>
                                    <Input
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="h-9 bg-white text-sm"
                                        placeholder={type === "work" ? "e.g. Google" : "e.g. University of Toronto"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500 font-medium">Date / Duration</Label>
                                <Input
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="h-9 bg-white text-sm"
                                    placeholder="e.g. Jan 2020 - Present, or 2019"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500 font-medium">Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[100px] bg-white text-sm resize-none"
                                    placeholder="Describe your responsibilities, achievements, or coursework..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" size="sm" onClick={() => setEditingItemId(null)} className="h-8 text-xs">Back</Button>
                                <Button size="sm" onClick={handleSaveForm} disabled={!formData.title} className="h-8 text-xs bg-brand-600">{editingItemId === "new" ? "Add to List" : "Update Item"}</Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* List of items being edited */}
                            <div className="space-y-4">
                                {localItems.length > 0 ? (
                                    localItems.map((item, idx) => (
                                        <TimelineItem
                                            key={item.id}
                                            data={item}
                                            isLast={idx === localItems.length - 1}
                                            type={type}
                                            editable
                                            onEdit={() => handleEditItem(item)}
                                            onDelete={() => handleDeleteItem(item.id)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">No items yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <Button variant="outline" size="sm" onClick={handleAddNew} className="text-brand-600 border-brand-200 hover:bg-brand-50 h-8 text-xs">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add {type === "work" ? "Role" : "Education"}
                                </Button>

                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isLoading} className="h-8 text-xs">Cancel</Button>
                                    <Button size="sm" onClick={handleSaveAll} disabled={isLoading} className="h-8 text-xs bg-brand-600 hover:bg-brand-700">
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* VIEW MODE */}
                        {items.length > 0 ? (
                            <div className="mt-2">
                                {items.map((item, idx) => (
                                    <TimelineItem
                                        key={item.id}
                                        data={item}
                                        isLast={idx === items.length - 1}
                                        type={type}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                <div className={cn("mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3", type === "work" ? "bg-brand-50 text-brand-500" : "bg-blue-50 text-blue-500")}>
                                    {type === "work" ? <Briefcase className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">No {title.toLowerCase()} added</h3>
                                <p className="text-xs text-gray-500 max-w-[200px] mx-auto mt-1 mb-4">Add your experience to improve job recommendations.</p>
                                <Button variant="outline" size="sm" onClick={handleStartEdit} className="text-xs h-8">
                                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add {title}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
