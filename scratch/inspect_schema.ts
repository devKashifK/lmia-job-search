import db from './src/db';

async function inspectSchema() {
    try {
        const { data: lmia, error: e1 } = await db.from('lmia').select('*').limit(1);
        const { data: trending, error: e2 } = await db.from('trending_job').select('*').limit(1);

        console.log('--- LMIA SAMPLE ---');
        console.log(lmia ? Object.keys(lmia[0]) : 'No data');
        console.log(lmia ? lmia[0] : '');

        console.log('--- TRENDING SAMPLE ---');
        console.log(trending ? Object.keys(trending[0]) : 'No data');
        console.log(trending ? trending[0] : '');
    } catch (err) {
        console.error(err);
    }
}

inspectSchema();
