import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

/**
 * True when the request has a valid Supabase session and the user is listed in public.admin_users.
 */
export async function isAdminSession(): Promise<boolean> {
  try {
    const supabase = await createSupabaseUserServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return false;

    const { data, error } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}
