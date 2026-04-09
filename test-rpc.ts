import db from './src/db';

async function main() {
    console.time('fetchTrending');
    const { data: d1, error: e1 } = await db.rpc('suggest_trending_job', {
        p_field: 'job_title',
        p_q: '',
        p_limit: 100
    });
    console.timeEnd('fetchTrending');
    console.log(d1?.length, e1);

    console.time('fetchLmia');
    const { data: d2, error: e2 } = await db.rpc('suggest_lmia', {
        p_field: 'JobTitle',
        p_q: '',
        p_limit: 100
    });
    console.timeEnd('fetchLmia');
    console.log(d2?.length, e2);
}

main().catch(console.error);
