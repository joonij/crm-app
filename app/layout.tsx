import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // 최상단 components 폴더 참조
import MobileSidebar from "@/components/MobileSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "영업 관리 CRM",
  description: "Supabase 기반 맞춤형 CRM 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="flex h-screen w-full overflow-hidden bg-gray-50">
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
      </body>
    </html>
  );
}