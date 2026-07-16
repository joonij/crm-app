// app/reset-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // ⭐️ Supabase 내장 기능: 암호화된 비밀번호 재설정 이메일 발송
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        // 고객이 이메일의 링크를 클릭하면 돌아올 우리 사이트 주소
        redirectTo: `${window.location.origin}/update-password`,
      }
    );

    if (resetError) {
      setError("이메일 발송에 실패했습니다. 가입된 이메일인지 확인해주세요.");
    } else {
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        {!isSuccess && (
          <Link href="/login" className="absolute top-6 left-6 text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}

        <div className="text-center mb-8 mt-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">비밀번호 찾기</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium break-keep px-4">
            가입하신 이메일 주소를 입력하시면<br/>안전한 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        {isSuccess ? (
          <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl w-full border border-emerald-100 flex flex-col items-center text-center mb-6">
              <CheckCircle2 className="w-8 h-8 mb-2" />
              <p className="font-bold text-sm">이메일이 성공적으로 발송되었습니다!</p>
              <p className="text-xs mt-1 text-emerald-600/70">메일함의 링크를 클릭하여 비밀번호를 변경해주세요.</p>
            </div>
            <Link 
              href="/login" 
              className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 text-center"
            >
              로그인 화면으로 돌아가기
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm font-bold text-red-600 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="가입한 이메일 주소 입력"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSubmitting ? "메일 발송 중..." : "재설정 링크 받기"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}