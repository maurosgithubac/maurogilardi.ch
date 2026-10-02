import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  /* Refreshes the auth session cookie when needed */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Neue Admin-Konten mit Startpasswort: erst eigenes Passwort setzen, dann weiter
  if (user?.user_metadata?.must_change_password === true) {
    const path = request.nextUrl.pathname;
    const allowed = path === "/admin/settings" || path === "/admin/login" || path === "/api/admin/logout";
    if (!allowed) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Bitte zuerst ein eigenes Passwort vergeben." }, { status: 403 });
      }
      const target = request.nextUrl.clone();
      target.pathname = "/admin/settings";
      target.search = "?pflicht=1";
      const redirect = NextResponse.redirect(target);
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
      return redirect;
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
