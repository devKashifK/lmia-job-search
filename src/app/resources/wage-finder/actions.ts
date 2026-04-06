'use server';

import { getNocProfile, getAllNocSummaries, NocProfile, NocSummary } from '@/lib/noc-service';

export async function fetchNocDetails(code: string): Promise<NocProfile | null> {
    return await getNocProfile(code);
}

export async function fetchNocSummaries(): Promise<NocSummary[]> {
    return await getAllNocSummaries();
}
