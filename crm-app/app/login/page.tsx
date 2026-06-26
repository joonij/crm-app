// app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { Users, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signInAction(formData);

    // redirect가 발생하지 않고 에러 객체가 반환된 경우
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xl">
        
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-md shadow-blue-500/20">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-gray-900 tracking-tight">CRM 서비스 로그인</h1>
          <p className="mt-1.5 text-sm text-gray-500">등록된 계정으로 로그인해 주세요.</p>
        </div>

        {/* 에러 메시지 알림 박스 */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600 animate-in fade-in zoom-in-95">
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">이메일 주소</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="email"
                type="email"
                required
                placeholder="example@company.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 shadow-md disabled:opacity-50"
          >
            {isLoading ? "로그인 중..." : "로그인하기"}
          </button>
        </form>

        {/* 회원가입 유도 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-bold text-blue-600 hover:underline">
            회원가입하기
          </Link>
        </div>

      </div>
    </div>
  );
}