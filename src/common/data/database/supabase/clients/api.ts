import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";
import { Database as SupabaseDataBaseType } from "@/supabase/database";

export default function createClient(req: NextRequest, res: NextResponse) {
  const supabase = createServerClient<SupabaseDataBaseType>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string) {
          res.cookies.set(name, value);
        },
        remove(name: string) {
          res.cookies.delete(name);
        },
      },
    },
  );

  return supabase;
}
