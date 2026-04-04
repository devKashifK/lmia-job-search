import db from '@/db';

export interface ProgramLocation {
    state: string;
    cities: string[];
}

export interface ProgramDefinition {
    id: string;
    label: string;
    locations: ProgramLocation[];
    color: 'emerald' | 'orange' | 'blue' | 'purple' | 'rose' | 'amber';
}

// Map of program IDs to colors for consistent branding
const COLOR_MAP: Record<string, ProgramDefinition['color']> = {
    'rcip': 'emerald',
    'fcip': 'blue',
    'alberta-rural': 'amber',
    'ontario-redi': 'rose',
    'manitoba-rural': 'purple',
};

const DEFAULT_COLORS: ProgramDefinition['color'][] = ['emerald', 'blue', 'amber', 'rose', 'purple', 'orange'];

export async function getAllPrograms(): Promise<ProgramDefinition[]> {
    const { data, error } = await db
        .from('programs')
        .select('program_id, program_label, state, city')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching programs:', error);
        return [];
    }

    if (!data) return [];

    const grouped: Record<string, ProgramDefinition> = {};
    let colorIndex = 0;

    data.forEach((row: any) => {
        const id = row.program_id;
        if (!grouped[id]) {
            grouped[id] = {
                id,
                label: row.program_label,
                locations: [],
                color: COLOR_MAP[id] || DEFAULT_COLORS[colorIndex++ % DEFAULT_COLORS.length],
            };
        }

        let loc = grouped[id].locations.find(l => l.state === row.state);
        if (!loc) {
            loc = { state: row.state, cities: [] };
            grouped[id].locations.push(loc);
        }

        if (row.city && !loc.cities.includes(row.city)) {
            loc.cities.push(row.city);
        }
    });

    return Object.values(grouped);
}
