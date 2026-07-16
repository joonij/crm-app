// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import RealtimeNotification from "@/components/RealtimeNotification";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 1. 사이드바를 숨길 예외 페이지 조건 정의
  const isFindEmailPage = pathname?.startsWith("/find-email");
  const isUpdatePasswordPage = pathname?.startsWith("/update-password");
  const isResetPasswordPage = pathname?.startsWith("/reset-password");
  const isReportPage = pathname?.startsWith("/report");
  const isCardPage = pathname?.startsWith("/card");
  const isAuthPage = pathname === "/login" || pathname === "/signup"; // ⭐️ 로그인 및 회원가입 페이지 조건 추가

  // 2. 예외 페이지일 경우 사이드바와 알림을 완전히 제외한 단독 레이아웃 반환
  if (isReportPage || isAuthPage || isCardPage || isFindEmailPage || isResetPasswordPage || isUpdatePasswordPage) {
    return (
      <div className="flex-1 w-full h-screen overflow-y-auto bg-slate-100">
        {children}
      </div>
    );
  }

  // 3. 일반 CRM 화면일 때만 사이드바 포함 레이아웃 렌더링
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <RealtimeNotification />
      
      <div className="hidden md:flex h-full shrink-0 z-40 bg-slate-900 print:hidden">
        <Sidebar />
      </div>
      <main className="flex-1 min-w-0 w-full flex flex-col h-screen overflow-hidden">
        <MobileSidebar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}