import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must call getUser() not getSession() for security.
  // Race against a 1.5s timeout: Supabase can be slow/paused; never block page loads.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const timedOut = new Promise<{ data: { user: null }; error: null }>((r) =>
      setTimeout(() => r({ data: { user: null }, error: null }), 1500)
    );
    const result = await Promise.race([supabase.auth.getUser(), timedOut]);
    user = result.data.user;
  } catch {
    // Supabase unreachable — treat as unauthenticated, pages still load
  }

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/account")) &&
    !user
  ) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-logged-in users away from auth pages
  // (but not reset-password/confirm which needs to run even when logged in)
  if (pathname.startsWith("/auth/") && !pathname.includes("confirm") && user) {
    // Check admin role from profile cookie hint — just send to home; login action handles /admin redirect
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
