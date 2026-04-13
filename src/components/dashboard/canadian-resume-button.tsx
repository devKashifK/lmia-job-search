'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Sparkles, Loader2, Eye, X, Linkedin, Globe, Mail, Phone, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import jsPDF from 'jspdf';
import db from '@/db';
import { UserProfile } from '@/lib/api/users';

interface CanadianResumeButtonProps {
  profile: {
    full_name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    skills?: string;
    work_history?: string;
    education?: string;
    projects?: string;
    location?: string;
    position?: string;
    company?: string;
  };
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  showIcon?: boolean;
  clientId?: string;
  initialData?: any;
}

export const CanadianResumeButton = ({ 
  profile, 
  variant = 'default', 
  className,
  showIcon = true,
  clientId,
  initialData
}: CanadianResumeButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<any>(initialData || null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // If initialData changes, update state
  React.useEffect(() => {
    if (initialData) setResumeData(initialData);
  }, [initialData]);

  const generatePDF = (data: any) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const margin = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - (2 * margin);
    let y = margin;

    // Helper to add multiline text and update Y
    const addWrappedText = (text: string, fontSize: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0], spacing = 5) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += (lines.length * (fontSize * 0.4)) + spacing;
    };

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(data.header.name.toUpperCase(), margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let currentX = margin;
    const separator = '  |  ';
    const separatorWidth = doc.getTextWidth(separator);

    // Location
    doc.text(data.header.location, currentX, y);
    currentX += doc.getTextWidth(data.header.location);

    // Contact items
    data.header.contact.forEach((item: string) => {
      // Draw separator
      doc.setTextColor(200, 200, 200);
      doc.text(separator, currentX, y);
      currentX += separatorWidth;

      // Draw item
      const isEmail = item.includes('@') && !item.startsWith('http');
      const isLinkedin = item.includes('linkedin.com/in/');
      const isLink = item.startsWith('http') || item.includes('linkedin.com') || item.includes('github.com');
      const href = isEmail ? `mailto:${item}` : isLink ? (item.startsWith('http') ? item : `https://${item}`) : null;
      const displayText = isLinkedin ? 'LinkedIn' : (isLink && !isEmail) ? 'Portfolio' : item;
      
      const itemWidth = doc.getTextWidth(displayText);
      if (href) {
        doc.setTextColor(0, 102, 204); 
        doc.text(displayText, currentX, y);
        doc.link(currentX, y - 4, itemWidth, 5, { url: href });
      } else {
        doc.setTextColor(80, 80, 80);
        doc.text(displayText, currentX, y);
      }
      currentX += itemWidth;
    });

    y += 12;
    doc.setTextColor(0, 0, 0); // Reset to black

    // Sections
    const renderSectionHeader = (title: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(title.toUpperCase(), margin, y);
      y += 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    };

    // Professional Summary
    renderSectionHeader('Professional Summary');
    addWrappedText(data.professional_summary, 10, 'normal', [60,60,60], 8);

    // Skills
    if (data.skills && data.skills.length > 0) {
      renderSectionHeader('Technical Skills');
      data.skills.forEach((skillGroup: string) => {
        addWrappedText(skillGroup, 10, 'normal', [0,0,0], 4);
      });
      y += 4;
    }

    // Work Experience
    if (data.work_experience && data.work_experience.length > 0) {
      renderSectionHeader('Professional Experience');
      data.work_experience.forEach((job: any) => {
        // Job Title & Dates
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const jobDateWidth = doc.getTextWidth(job.date);
        const availableWidth = contentWidth - jobDateWidth - 5;
        const roleLines = doc.splitTextToSize(job.role, availableWidth);
        
        doc.text(roleLines, margin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(job.date, pageWidth - margin - jobDateWidth, y);
        
        y += (roleLines.length * 5) + 1;

        // Company & Location
        doc.setFont('helvetica', 'italic');
        doc.text(`${job.company} - ${job.location}`, margin, y);
        y += 6;

        // Bullets
        doc.setFont('helvetica', 'normal');
        job.bullets.forEach((bullet: string) => {
           // Ensure bullet is a single line indicator
           const bulletText = `• ${bullet}`;
           const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
           doc.text(lines, margin + 2, y);
           y += (lines.length * 4.5) + 1;
           
           if (y > 270) {
             doc.addPage();
             y = margin;
           }
        });
        y += 4;
      });
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
      if (y > 240) { doc.addPage(); y = margin; }
      renderSectionHeader('Key Projects');
      data.projects.forEach((proj: any) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(proj.name, margin, y);
        y += 5;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text(`Tech Stack: ${proj.tech_stack}`, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        proj.bullets.forEach((bullet: string) => {
           const bulletText = `• ${bullet}`;
           const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
           doc.text(lines, margin + 2, y);
           y += (lines.length * 4.5) + 1;
        });
        y += 4;
      });
    }

    // Education
    if (data.education && data.education.length > 0) {
      if (y > 250) { doc.addPage(); y = margin; }
      renderSectionHeader('Education');
      data.education.forEach((edu: any) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const eduDateWidth = doc.getTextWidth(edu.date);
        const availableWidth = contentWidth - eduDateWidth - 5;
        const degreeLines = doc.splitTextToSize(edu.degree, availableWidth);
        
        doc.text(degreeLines, margin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(edu.date, pageWidth - margin - eduDateWidth, y);
        
        y += (degreeLines.length * 5);
        doc.text(`${edu.institution}, ${edu.location}`, margin, y);
        y += 8;
      });
    }

    doc.save(`${data.header.name.replace(/\s+/g, '_')}_Canadian_Resume.pdf`);
  };

  const saveResumeToDb = async (data: any) => {
    if (!clientId) return;
    try {
      const { data: { session } } = await db.auth.getSession();
      await fetch('/api/agency/save-canadian-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ clientId, resumeData: data }),
      });
    } catch (error) {
      console.error('Failed to save resume to DB:', error);
    }
  };

  const handleGenerate = async () => {
    // If we already have data, just open preview
    if (resumeData) {
      setIsPreviewOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await db.auth.getSession();
      
      const response = await fetch('/api/generate-canadian-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate resume content');
      }

      const { data } = await response.json();
      setResumeData(data);
      setIsPreviewOpen(true);
      toast.success('Resume preview generated!');
      
      // Save to background
      if (clientId) {
        saveResumeToDb(data);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error generating resume');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        variant={variant}
        className={className}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : showIcon ? (
          <Sparkles className="w-4 h-4 mr-2 text-brand-500 fill-brand-500/20" />
        ) : null}
        {isGenerating ? 'Generating...' : resumeData ? 'View Canadian Resume' : 'Canadian Resume (AI)'}
      </Button>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-white border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-brand-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                </div>
                Canadian Resume Preview
              </DialogTitle>
              <div className="flex items-center gap-2 pr-8">
                <Button 
                  onClick={() => generatePDF(resumeData)} 
                  className="bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 bg-gray-50/50 p-8 overflow-y-auto">
            {resumeData && (
              <div className="max-w-[700px] mx-auto bg-white shadow-sm border border-gray-200 p-12 min-h-[900px] text-gray-900 font-sans selection:bg-brand-100">
                {/* Header */}
                <header className="mb-8">
                  <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{resumeData.header.name}</h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                    <span>{resumeData.header.location}</span>
                    {resumeData.header.contact.map((item: string, i: number) => {
                      const isEmail = item.includes('@') && !item.startsWith('http');
                      const isLinkedin = item.includes('linkedin.com/in/');
                      const isGithub = item.includes('github.com');
                      const isLink = item.startsWith('http') || isLinkedin || isGithub;
                      const href = isEmail ? `mailto:${item}` : isLink ? (item.startsWith('http') ? item : `https://${item}`) : null;
                      
                      const Icon = isEmail ? Mail : isLinkedin ? Linkedin : isLink ? Globe : null;
                      const displayText = isLinkedin ? 'LinkedIn' : isGithub ? 'GitHub' : (isLink && !isEmail) ? 'Portfolio' : item;

                      return (
                        <React.Fragment key={i}>
                          <span className="text-gray-300">•</span>
                          {href ? (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 hover:underline transition-colors flex items-center gap-1">
                              {Icon && <Icon className="w-3 h-3" />}
                              {displayText}
                            </a>
                          ) : (
                            <span className="flex items-center gap-1">
                              {Icon && <Icon className="w-3 h-3" />}
                              {item}
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </header>

                <div className="space-y-8">
                  {/* Summary */}
                  <section>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-1 mb-3">Professional Summary</h2>
                    <p className="text-[13px] leading-relaxed text-gray-700">{resumeData.professional_summary}</p>
                  </section>

                  {/* Skills */}
                  <section>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-1 mb-3">Technical Skills</h2>
                    <div className="space-y-1">
                      {resumeData.skills.map((skill: string, i: number) => (
                        <p key={i} className="text-[13px] text-gray-700">{skill}</p>
                      ))}
                    </div>
                  </section>

                  {/* Experience */}
                  <section>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-1 mb-4">Professional Experience</h2>
                    <div className="space-y-6">
                      {resumeData.work_experience.map((job: any, i: number) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-[15px] font-bold text-gray-900">{job.role}</h3>
                            <span className="text-[12px] font-bold text-gray-500 uppercase">{job.date}</span>
                          </div>
                          <p className="text-[13px] font-bold text-gray-500 italic -mt-1">{job.company} — {job.location}</p>
                          <ul className="list-disc ml-4 space-y-1.5">
                            {job.bullets.map((bullet: string, j: number) => (
                              <li key={j} className="text-[13px] text-gray-700 leading-relaxed pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Projects */}
                  {resumeData.projects && resumeData.projects.length > 0 && (
                    <section>
                      <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-1 mb-4">Key Projects</h2>
                      <div className="space-y-6">
                        {resumeData.projects.map((proj: any, i: number) => (
                          <div key={i} className="space-y-1.5">
                            <h3 className="text-[15px] font-bold text-gray-900">{proj.name}</h3>
                            <p className="text-[12px] font-bold text-gray-500 italic -mt-1">Technical Stack: {proj.tech_stack}</p>
                            <ul className="list-disc ml-4 space-y-1.5 mt-2">
                              {proj.bullets.map((bullet: string, j: number) => (
                                <li key={j} className="text-[13px] text-gray-700 leading-relaxed pl-1">{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Education */}
                  <section>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-1 mb-4">Education</h2>
                    <div className="space-y-4">
                      {resumeData.education.map((edu: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-[14px] font-bold text-gray-900">{edu.degree}</h3>
                            <span className="text-[12px] font-bold text-gray-500 uppercase">{edu.date}</span>
                          </div>
                          <p className="text-[13px] text-gray-600">{edu.institution}, {edu.location}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="mt-12 text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] border-t border-gray-50 pt-8">
                  JobMaze AI Generated • Canadian Professional Standards 
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
