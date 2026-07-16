"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, KeyRound, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // 페이지 접속 시, 링크가 유효한지(인증 토큰이 정상인지) 체크
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("보안 링크가 만료되었거나 유효하지 않습니다. 비밀번호 찾기를 다시 진행해 주세요.");
      }
      setIsValidating(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 1. 비밀번호 일치 확인
    if (password !== confirmPassword) {
      return setError("비밀번호가 서로 일치하지 않습니다.");
    }

    // 2. 비밀번호 길이 확인
    if (password.length < 6) {
      return setError("비밀번호는 최소 6자리 이상이어야 합니다.");
    }

    setIsSubmitting(true);

    try {
      // ⭐️ 이메일 링크를 통해 부여된 일회성 권한으로 비밀번호 즉시 교체
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setIsSuccess(true);
      
      // 3초 뒤에 자동으로 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      setError("비밀번호 변경에 실패했습니다. 관리자에게 문의해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xl">
        
        <div className="text-center mb-8 mt-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">새 비밀번호 설정</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium break-keep px-4">
            앞으로 사용할 새로운 비밀번호를<br/>입력해 주세요.
          </p>
        </div>

        {isSuccess ? (
          <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl w-full border border-emerald-100 flex flex-col items-center text-center mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10 mb-3" />
              <p className="font-black text-lg mb-1">변경 완료!</p>
              <p className="text-sm font-medium text-emerald-700/80 break-keep">
                비밀번호가 성공적으로 변경되었습니다.<br/>잠시 후 로그인 화면으로 이동합니다.
              </p>
            </div>
            <button 
              onClick={() => router.push("/login")}
              className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 text-center cursor-pointer"
            >
              지금 바로 로그인하기
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm font-bold text-red-600 text-center flex flex-col items-center gap-2 break-keep">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* 에러가 없을 때만 폼 보여주기 (만료된 링크 방어) */}
            {!error?.includes("만료") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700 ml-1">새 비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="새로운 비밀번호 입력 (6자리 이상)"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700 ml-1">새 비밀번호 확인</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호 다시 입력"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !password || !confirmPassword}
                  className="w-full mt-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSubmitting ? "변경 중..." : "비밀번호 변경하기"}
                </button>
              </form>
            )}
            
            {/* 링크 만료 시 다시 찾기로 이동하는 버튼 */}
            {error?.includes("만료") && (
              <button 
                onClick={() => router.push("/reset-password")}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 cursor-pointer"
              >
                비밀번호 다시 찾기
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}