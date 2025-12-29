import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Previous protection for /todos routes has been removed as part of
  // the Todos cleanup. Route protection should now be applied to the
  // relevant API Key routes if needed.

  // Redirect authenticated users from /login or /register to /keys
  if (path === "/login" || path === "/register") {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session) {
      return NextResponse.redirect(new URL("/keys", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register"],
};
