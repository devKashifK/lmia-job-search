import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test_signup_' + Date.now() + '@example.com',
    password: 'password123!',
    options: {
      data: { name: 'Test User', user_type: 'student' }
    }
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
