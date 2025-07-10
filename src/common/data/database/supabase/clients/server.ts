import { createClient } from '@supabase/supabase-js';
import { Database } from '@/supabase/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const createSupabaseServerClient = () => createClient<Database>(supabaseUrl, supabaseKey);

export default createSupabaseServerClient;



