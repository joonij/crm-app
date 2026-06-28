// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import RealtimeNotification from "@/components/RealtimeNotification"; // ⭐️ 새로 추가한 컴포넌트

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isReportPage = pathname?.startsWith("/report");

  if (isReportPage) {
    return (
      <div className="flex-1 w-full h-screen overflow-y-auto bg-slate-100">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* ⭐️ CRM 화면일 때만 실시간 알림 컴포넌트 렌더링 */}
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