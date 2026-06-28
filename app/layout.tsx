// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper"; // ⭐️ 새로 만든 래퍼 임포트

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareLink",
  description: "고객 맞춤 케어 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full`}>
        {/* ⭐️ LayoutWrapper가 주소를 판별해서 화면을 알아서 그려줍니다 */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}