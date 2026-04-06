import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readEnv } from "@/lib/env";

/**
 * Supabase client bound to the site visitor’s JWT (anon key + session cookie).
 * Use in Server Components, Route Handlers, and server actions so RLS applies.
 */
export async function createSupabaseUserServerClient() {
  const cookieStore = await cookies();

  return createServerClient(readEnv("NEXT_PUBLIC_SUPABASE_URL"), readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* Server Component may have read-only cookies */
        }
      },
    },
  });
}
