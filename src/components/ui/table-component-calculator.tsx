import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";

export interface PointsSection {
  title: string;
  maxPoints: number;
  rows: {
    label: string;
    points: string | number;
  }[];
}

interface GenericCalculatorBreakdownTableProps {
  sections: PointsSection[];
  badgeText: string;
  heading: string;
  headingHighlight: string;
  description: string;
}

export function GenericCalculatorBreakdownTable({ 
  sections, 
  badgeText, 
  heading, 
  headingHighlight, 
  description 
}: GenericCalculatorBreakdownTableProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="py-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
        <div className="flex items-center">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="rounded-lg h-7 px-2 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all gap-2">
                    <Info className="w-3 h-3" />
                    {isOpen ? 'Close Points Legend' : 'View Points Reference Grid'}
                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sections.map((section, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-100 overflow-hidden flex flex-col">
                    <div className="bg-gray-50/80 px-3 py-1.5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-[8px] uppercase tracking-widest text-gray-500">{section.title}</h3>
                    <div className="text-[8px] font-black text-gray-400 uppercase">
                        {section.maxPoints} PT
                    </div>
                    </div>
                    <div className="p-0 flex-1">
                    <Table>
                        <TableBody>
                        {section.rows.map((row, rowIdx) => (
                            <TableRow key={rowIdx} className="hover:bg-gray-50/50 border-gray-50 border-b">
                            <TableCell className="text-[9px] font-bold text-gray-500 py-1.5 pl-3">
                                {row.label}
                            </TableCell>
                            <TableCell className="text-right text-[9px] font-black text-gray-900 py-1.5 pr-3 tabular-nums">
                                {row.points}
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </div>
                </div>
                ))}
            </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
