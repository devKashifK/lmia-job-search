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

export const INSIGHTS_PROGRAMS: ProgramDefinition[] = [
    {
        id: 'rcip',
        label: 'RCIP',
        color: 'emerald',
        locations: [
            { state: 'Nova Scotia', cities: ['North Bay', 'Pictou', 'Pictou East Mountain', 'New Glasgow', 'Stellarton', 'Westville', 'Trenton'] },
            { state: 'Ontario', cities: ['North Bay', 'Sudbury', 'Sault Ste. Marie', 'Sault Ste Marie', 'Thunder Bay', 'Timmins'] },
            { state: 'Manitoba', cities: ['Timmins', 'Steinbach', 'Altona', 'Brandon', 'Main Steinbach', 'North Steinbach', 'Rhineland'] },
            { state: 'Alberta', cities: ['Sault Ste. Marie', 'Claresholm', 'Cochrane'] },
            { state: 'Saskatchewan', cities: ['Thunder Bay', 'Moose Jaw'] },
            { state: 'British Columbia', cities: ['Steinbach', 'Okanagan', 'Nelson', 'Trail', 'Castlegar', 'Rossland', 'Vernon', 'Salmon Arm', 'Enderby', 'Armstrong', 'Fort Nelson', 'Dawson Creek', 'Chetwynd'] },
            // Note: Some cities were listed under multiple states in the user's prompt, I've mapped them as provided but cleaned up duplicates where obvious.
            { state: 'Manitoba', cities: ['Pembina', 'Pembina Winnipeg', 'Pembina Hwywinnipeg'] },
            { state: 'Alberta', cities: ['A Pembina Hinton', 'Pembina Sherwood Park', 'Foothills'] }
        ]
    },
    {
        id: 'fcip',
        label: 'FCIP',
        color: 'blue',
        locations: [
            { state: 'New Brunswick', cities: ['Acadia Valley'] },
            { state: 'Ontario', cities: ['Sudbury', 'Peninsula Marathon', 'South Bruce Peninsula', 'Chapleau', 'Dubreuilville', 'Wawa', 'White River', 'Hornepayne', 'Manitouwadge'] },
            { state: 'Manitoba', cities: ['Timmins', 'St-Pierre-Jolys', 'St-pierre-jolys'] },
            { state: 'British Columbia', cities: ['St-Pierre-Jolys', 'St-pierre-jolys', 'Kelowna', 'West Kelowna'] }
        ]
    },
    {
        id: 'alberta-rural',
        label: 'Alberta Rural',
        color: 'amber',
        locations: [
            {
                state: 'Alberta',
                cities: [
                    'Brooks', 'Grande Prairie', 'Whitecourt', 'Taber', 'Innisfail', 'Smoky Lake', 'Falher',
                    'Sexsmith', 'Wembley', 'Beaverlodge', 'Rycroft', 'Acme', 'Three Hills', 'Linden',
                    'Fort Mcmurray', 'Jasper', 'Barrhead', 'Hinton', 'Fairview', 'Medicine Hat',
                    'Cypress Hills Park', 'Cypress River', 'Bow Island', 'Redcliff', 'Fox Creek',
                    'Cold Lake', 'Saint-paul', 'St. Paul', 'West St. Paul', 'East St. Paul', 'St. Pauls',
                    'Elk Point', 'Drayton Valley', 'Slave Lake', 'High Prairie', 'Lloydminster',
                    'Lethbridge', 'Westlock', 'Valleyview', 'Peace River', 'Wetaskiwin', 'Hanna',
                    'Oyen', 'Consort', 'Youngstown', 'Acadia Valley', 'Woodlands', 'Swan Hills',
                    'Mayerthorpe', 'Manning', 'Bonnyville', 'Two Hills', 'Lac La Biche', 'Plamondon',
                    'High Level', 'Didsbury', 'Coronation', 'Vilna', 'Waskatenau', 'Rocky Mountain House',
                    'Edson', 'Bassano', 'Tilley', 'Tilley Road', 'Close Innisfail', 'Olds', 'Bowden',
                    'Box Smoky Lake', 'Earth Smoky Lake', 'Donnelly', 'Girouxville', 'Trochu',
                    'Wood Buffalo', 'North Cypress', 'South Cypress', 'Horseshoe Richmond',
                    'Horseshoe Lake Beechville', 'Ab Waskatenau', 'East Waskatenau', 'Th Vilna',
                    'Castor', 'W High Level'
                ]
            }
        ]
    },
    {
        id: 'ontario-redi',
        label: 'Ontario REDI',
        color: 'rose',
        locations: [
            {
                state: 'Ontario',
                cities: [
                    'Sarnia', 'Thunder Bay', 'Lambton', 'Grenville', 'Bathurst', 'Drummond',
                    'Dalhousie', 'Sherbrooke', 'Rideau Ferry', 'Athens', 'Westport', 'Lanark Highlands'
                ]
            }
        ]
    },
    {
        id: 'manitoba-rural',
        label: 'MB Rural West-Central',
        color: 'purple',
        locations: [
            {
                state: 'Manitoba',
                cities: [
                    'Brussels', 'RUSSELL', 'Russell', 'Russell (Riding Mountain West)', 'Russellville',
                    'Yellowhead County', 'Roblin', 'Rossburn', 'Rossburgh', 'Yellowhead Ardrossan',
                    'Roblin Winnipeg', 'Shoal Lake', 'Shoal Lake Cree Nation', 'Oakburn', 'Mcauley',
                    'Saint-Lazare', 'Saint-lazare', 'St-Lazare', 'St-lazare', 'Mansonville',
                    'Angusville', 'Inglis', 'Shellmouthboulton', 'Silverton', 'Birtle', 'Miniota',
                    'Andikan, Beulah', 'Foxwarren', 'Solsgirth'
                ]
            }
        ]
    }
];
