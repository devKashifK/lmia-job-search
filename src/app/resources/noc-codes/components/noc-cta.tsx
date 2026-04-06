'use client';

import { useSession } from '@/hooks/use-session';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NocCTAProps {
    code: string;
}

export default function NocCTA({ code }: NocCTAProps) {
    const { user, loading } = useSession();

    if (loading) {
        return (
            <Card className="bg-gradient-to-br from-amber-400/50 to-amber-500/50 rounded-[2rem] p-8 shadow-xl border-none animate-pulse h-64" />
        );
    }

    return (
        <Card className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-[2rem] p-8 shadow-xl border-none text-brand-900">
            <h4 className="text-xl font-black mb-4">
                {user ? 'Find Your Next Opportunity' : 'Start your move to Canada'}
            </h4>
            <p className="text-sm font-medium mb-8 leading-relaxed opacity-90">
                {user 
                    ? `You are now exploring NOC ${code}. Use our AI-powered search to find matched LMIA jobs.`
                    : `JobMaze tracks 10,000+ LMIA opportunities specifically for professionals in NOC ${code}.`
                }
            </p>
            <Link href={user ? '/search/lmia/all?t=lmia' : '/sign-up'} className="block">
                <Button className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-6 rounded-2xl shadow-lg transition-all active:scale-95">
                    {user ? 'Search Active Jobs' : 'Create Free Account'}
                </Button>
            </Link>
            <p className="text-[10px] uppercase font-black text-center mt-4 tracking-widest opacity-60">
                TRUSTED BY 1,200+ CONSULTANTS
            </p>
        </Card>
    );
}
