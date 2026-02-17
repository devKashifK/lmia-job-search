'use client';

import { cn } from '@/lib/utils';
import { Book, Compass, Database, Zap, CreditCard, ChevronRight, BarChart3, Users, Bell, Shield } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Compass,
    },
    {
        id: 'search-mastery',
        title: 'Search Mastery',
        icon: Book,
    },
    {
        id: 'understanding-data',
        title: 'Understanding Data',
        icon: Database,
    },
    {
        id: 'dashboard-analysis',
        title: 'Dashboard & Analysis',
        icon: BarChart3,
    },
    {
        id: 'features-guide',
        title: 'Features Guide',
        icon: Zap,
    },
    {
        id: 'comparison-tool',
        title: 'Comparison Tool',
        icon: Book,
    },
    {
        id: 'job-alerts',
        title: 'Job Alerts',
        icon: Bell,
    },
    {
        id: 'profile-resume',
        title: 'Profile & Resume',
        icon: Users,
    },
    {
        id: 'step-by-step',
        title: 'How to Apply',
        icon: Compass,
    },
    {
        id: 'credits-pricing',
        title: 'Credits & Pricing',
        icon: CreditCard,
    },
    {
        id: 'security-privacy',
        title: 'Security & Privacy',
        icon: Shield,
    },
    {
        id: 'faq',
        title: 'FAQ',
        icon: Book,
    },
];

export function DocSidebar() {
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -60% 0px' }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="space-y-1">
            {sections.map((section) => {
                const isActive = activeSection === section.id;
                const Icon = section.icon;

                return (
                    <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                            'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                            isActive
                                ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200/50'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isActive ? "bg-white text-brand-600 shadow-sm" : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm"
                            )}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span>{section.title}</span>
                        </div>
                        {isActive && (
                            <ChevronRight className="w-4 h-4 text-brand-500 animate-in slide-in-from-left-1" />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
