// proxy.ts (기존 middleware.ts에서 이름 변경)
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 🚫 1. 비로그인 유저 접근 통제
  if (!user) {
    // 메인화면('/')이나 내부 서비스 메뉴로 접근하면 모두 로그인 창으로 강제 이동
    if (
      pathname === "/" || 
      pathname.startsWith("/clients") || 
      pathname.startsWith("/schedules") || 
      pathname.startsWith("/training")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // 🔄 2. 이미 로그인한 유저 접근 통제
  if (user) {
    // 이미 로그인했는데 또 로그인/가입 화면이나 빈 메인화면으로 가려고 하면 고객 관리 대시보드로 강제 이동
    if (
      pathname === "/" || 
      pathname === "/login" || 
      pathname === "/signup"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/clients";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};