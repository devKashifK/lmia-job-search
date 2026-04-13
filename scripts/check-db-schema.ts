import db from "./src/db/index.ts";

async function testPersistence() {
  console.log("Checking database schema for 'interview_questions' column...");
  
  const { data, error } = await (db.from('agency_client_strategies') as any)
    .select('interview_questions')
    .limit(1);

  if (error) {
    if (error.message.includes('column "interview_questions" does not exist')) {
      console.error("❌ COLUMN MISSING: The 'interview_questions' column needs to be added to the 'agency_client_strategies' table.");
      console.log("Please run the following SQL in your Supabase SQL Editor:");
      console.log("ALTER TABLE public.agency_client_strategies ADD COLUMN interview_questions JSONB DEFAULT '[]'::jsonb;");
    } else {
      console.error("❌ DATABASE ERROR:", error.message);
    }
    return;
  }

  console.log("✅ COLUMN EXISTS: The 'interview_questions' column is present in the database.");
  console.log("Current data sample:", data);
}

testPersistence().catch(console.error);
