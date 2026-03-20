import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Mapeamento: path prefix → papel necessário
const ROLE_ROUTES: Record<string, string> = {
  "/cliente": "CLIENTE",
  "/dono":    "DONO",
  "/admin":   "SUPER_ADMIN",
};

// Rotas públicas (sem autenticação)
const PUBLIC_ROUTES = ["/login", "/cadastro", "/esqueci-senha", "/redefinir-senha", "/", "/api/webhooks", "/booking", "/api/booking"];

// Rotas do DONO que não exigem petShopId (onboarding)
const DONO_NO_SHOP_ALLOWED = ["/dono/onboarding"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Libera rotas públicas e assets
  if (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sem sessão → redireciona para login
  if (!user) {
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
    const userRole = user.user_metadata?.role as string | undefined;

    // SUPER_ADMIN pode acessar qualquer rota
    if (userRole === "SUPER_ADMIN") {
      return response;
    }

    if (userRole && userRole !== requiredRole) {
      const redirectMap: Record<string, string> = {
        CLIENTE: "/cliente/inicio",
        DONO:    "/dono/inicio",
      };
      return NextResponse.redirect(
        new URL(redirectMap[userRole] ?? "/login", request.url)
      );
    }

    // DONO sem pet shop → onboarding (lê petShopId do user_metadata — zero DB call)
    if (
      userRole === "DONO" &&
      pathname.startsWith("/dono") &&
      !DONO_NO_SHOP_ALLOWED.some((r) => pathname.startsWith(r)) &&
      !user.user_metadata?.petShopId
    ) {
      return NextResponse.redirect(new URL("/dono/onboarding", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
