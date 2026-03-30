import db from '../src/db';

async function checkSchema() {
    try {
        console.log('Checking hot_leads_new structure...');
        const { data, error } = await db
            .from('hot_leads_new')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        console.log('Columns:', Object.keys(data[0] || {}));
        
        // Check for specific cities from the Excel
        const citiesToCheck = ['North Bay', 'Sudbury', 'Timmins', 'Pictou', 'Brandon'];
        const { data: cityData, error: cityError } = await db
            .from('hot_leads_new')
            .select('city, state')
            .in('city', citiesToCheck);
            
        if (cityError) {
            console.error('City Error:', cityError);
            return;
        }
        
        console.log('Matches found:', cityData.length);
        console.log('Sample Matches:', cityData.slice(0, 5));
        
    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

checkSchema();
