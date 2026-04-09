import db from './src/db/index';

async function checkSchema() {
    const { data, error } = await db.from('lmia').select('*').limit(1);
    if (error) {
        console.error('Error fetching lmia:', error);
        return;
    }
    console.log('LMIA Keys:', Object.keys(data[0] || {}));
    
    const { data: trendingData, error: trendingError } = await db.from('trending_job').select('*').limit(1);
    if (trendingError) {
        console.error('Error fetching trending_job:', trendingError);
        return;
    }
    console.log('Trending Job Keys:', Object.keys(trendingData[0] || {}));
}

checkSchema();
