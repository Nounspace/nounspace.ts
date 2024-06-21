import { createBrowserClient } from "@supabase/ssr";
import { Database as SupabaseDataBaseType } from "@/supabase/database";

export function createClient() {
  const supabase = createBrowserClient<SupabaseDataBaseType>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return supabase;
}
