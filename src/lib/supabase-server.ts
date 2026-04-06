import { createClient } from "@supabase/supabase-js";
import { readEnv } from "@/lib/env";

export function createSupabaseServerClient() {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
