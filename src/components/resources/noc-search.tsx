'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function NocSearch() {
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`${window.location.pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="relative max-w-xl mx-auto w-full">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                    className="pl-10 h-12 rounded-xl border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-brand-500/20 focus:border-brand-500 text-base"
                    placeholder="Search by NOC code or job title..."
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('q')?.toString()}
                />
            </div>
        </div>
    );
}
