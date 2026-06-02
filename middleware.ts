import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/", "/features", "/pricing", "/docs", "/contact", "/login", "/register", "/forgot-password", "/verify"];
const ADMIN_ROUTES = ["/admin"];
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "REVIEWER"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/"),
  );

  const isApiRoute = nextUrl.pathname.startsWith("/api/");
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  if (isApiRoute) {
    const publicApiRoutes = ["/api/auth", "/api/health"];
    const isPublicApi = publicApiRoutes.some((r) => nextUrl.pathname.startsWith(r));
    if (isPublicApi) return NextResponse.next();
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isPublicRoute) return NextResponse.next();

  if (!session) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = ADMIN_ROUTES.some((route) => nextUrl.pathname.startsWith(route));
  if (isAdminRoute) {
    const userRole = session.user?.role;
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
