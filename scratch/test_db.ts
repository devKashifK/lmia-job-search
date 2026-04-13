
import db from './src/db';

async function testQuery() {
    try {
        console.log("Testing connection...");
        const { data, error } = await (db.from('agency_profiles') as any).select('count', { count: 'exact', head: true });
        if (error) {
            console.error("DB Error:", JSON.stringify(error, null, 2));
        } else {
            console.log("Connection successful, count:", data);
        }
    } catch (err) {
        console.error("Execution Error:", err);
    }
}

testQuery();
