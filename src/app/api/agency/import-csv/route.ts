import { NextResponse } from 'next/server';
import db from '@/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clients } = body;

        if (!clients || !Array.isArray(clients)) {
            return NextResponse.json({ error: 'Invalid payload: clients array expected' }, { status: 400 });
        }

        // 1. Get current user session
        const { data: { session } } = await db.auth.getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const agencyId = session.user.id;

        // 2. Prepare for batch insert
        const recordsToInsert = clients.map(c => {
            const urn = `URN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
            return {
                agency_id: agencyId,
                urn,
                full_name: c.fullName || c.name || 'Unknown Candidate',
                email: c.email || null,
                phone: c.phone || null,
                status: 'pre-screening',
                extracted_data: {
                    bio: c.bio || '',
                    location: c.location || '',
                    position: c.position || c.title || '',
                    skills: c.skills || '',
                    work_experience: [],
                    education: []
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        });

        // 3. Insert in batches if needed, but for now we'll do one big insert
        // Supabase/Postgrest handles bulk insert with arrays
        const { data, error } = await db
            .from('agency_clients')
            .insert(recordsToInsert)
            .select('id, urn');

        if (error) {
            console.error('[import-csv] Insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            count: data.length,
            records: data
        });

    } catch (error: any) {
        console.error('[import-csv] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
