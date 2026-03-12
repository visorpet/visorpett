import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que exigem autenticação mas não exigem papel específico
const AUTH_ROUTES = ["/cliente", "/dono", "/admin"];

// Mapeamento: path prefix → papel necessário
const ROLE_ROUTES: Record<string, string> = {
  "/cliente": "CLIENTE",
  "/dono":    "DONO",
  "/admin":   "SUPER_ADMIN",
};

// Rotas públicas (sem autenticação)
const PUBLIC_ROUTES = ["/login", "/", "/api/webhooks"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Libera rotas públicas e assets
  if (
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Verifica o token JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Sem sessão → redireciona para login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verifica papel para rotas protegidas
  const matchedPrefix = Object.keys(ROLE_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (matchedPrefix) {
    const requiredRole = ROLE_ROUTES[matchedPrefix];
    const userRole     = (token as any).role;

    if (userRole !== requiredRole) {
      // Redireciona para o painel correto do papel do usuário
      const redirectMap: Record<string, string> = {
        CLIENTE:     "/cliente/inicio",
        DONO:        "/dono/inicio",
        SUPER_ADMIN: "/admin/painel",
      };
      return NextResponse.redirect(
        new URL(redirectMap[userRole] ?? "/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
