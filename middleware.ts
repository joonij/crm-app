// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. 응답(Response) 객체 초기화
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. 미들웨어용 Supabase 클라이언트 생성 (인증 토큰 새로고침 역할)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 요청(Request) 쿠키 업데이트
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          // 응답(Response) 쿠키 업데이트
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. 현재 접속한 유저의 인증 상태 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 4. 라우팅 보호 (접근 통제) 로직
  // 🚫 비로그인 유저가 '/clients' 등 내부 페이지에 접근하려 할 때 -> 로그인 페이지로 강제 이동
  if (!user && pathname.startsWith("/clients")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 🔄 이미 로그인한 유저가 로그인/회원가입 페이지나 메인('/')에 접근하려 할 때 -> 대시보드로 자동 이동
  if (user && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/clients";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// 5. 미들웨어가 감시할 경로 설정 (이미지, 정적 파일 등은 무시하여 속도 최적화)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};