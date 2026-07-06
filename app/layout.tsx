// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper"; // ⭐️ 새로 만든 래퍼 임포트
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InsuCareLink",
  description: "고객 맞춤 케어 플랫폼",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full`}>
        {/* ⭐️ LayoutWrapper가 주소를 판별해서 화면을 알아서 그려줍니다 */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}