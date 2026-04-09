import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
}

interface FeatureListWithCheckMarkProps {
  badgeText: string;
  heading: string;
  subtitle: string;
  features: Feature[];
}

export function FeatureListWithCheckMark({ badgeText, heading, subtitle, features }: FeatureListWithCheckMarkProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="py-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
            <div className="flex items-center">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="rounded-lg h-7 px-2 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all gap-2">
                        <Sparkles className="w-3 h-3" />
                        {isOpen ? 'Close Rule Details' : 'View Program Rules & Metrics'}
                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {features.map((feature, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg border border-gray-100 bg-white">
                        <div className={cn("w-7 h-7 rounded flex items-center justify-center shrink-0", feature.iconBg)}>
                            {React.isValidElement(feature.icon) ? React.cloneElement(feature.icon as React.ReactElement<any>, { size: 14 }) : feature.icon}
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-bold text-[9px] text-gray-600 uppercase tracking-wide">
                                {feature.title}
                            </h3>
                            <p className="text-[10px] text-gray-500 leading-snug font-medium">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    </div>
  );
}
