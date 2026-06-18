"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const inputClassName =
  "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    window.location.href = "/";
  };

  const handleSignUp = async () => {
    setError(null);
    setIsLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    window.location.href = "/";
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            CRM Pro
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">로그인</h1>
          <p className="mt-2 text-sm text-gray-400">
            이메일과 비밀번호로 계정에 접속하세요.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-300"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-300"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "처리 중..." : "로그인"}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleSignUp()}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
