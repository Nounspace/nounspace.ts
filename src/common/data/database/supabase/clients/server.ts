import { createClient } from "@supabase/supabase-js";
import { Database as SupabaseDataBaseType } from "@/supabase/database";

const supabaseClient = createClient<SupabaseDataBaseType>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabaseClient;



