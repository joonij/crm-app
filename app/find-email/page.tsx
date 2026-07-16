"use client";

import { useState } from "react";
import Link from "next/link";
import { findEmailAction } from "@/app/actions/auth";
import { Search, User, Phone, ArrowLeft, Mail, Loader2 } from "lucide-react";

// ⭐️ 전화번호 하이픈 자동 포맷팅 함수 추가
const formatPhoneNumber = (value: string) => {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  if (num.startsWith("02")) {
    if (num.length <= 2) return num;
    if (num.length <= 5) return `${num.slice(0, 2)}-${num.slice(2)}`;
    if (num.length <= 9) return `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
    return `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6, 10)}`;
  }
  if (num.length <= 3) return num;
  if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
  if (num.length <= 10) return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
  return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
};

export default function FindEmailPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFoundEmail(null);
    setIsSubmitting(true);

    // ⭐️ 하이픈을 지우지 않고 포맷팅된 상태(010-XXXX-XXXX) 그대로 서버로 전송하여 매칭
    const result = await findEmailAction(name, phone);

    if (result.error) {
      setError(result.error);
    } else if (result.email) {
      setFoundEmail(result.email);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        <Link href="/login" className="absolute top-6 left-6 text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="text-center mb-8 mt-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">이메일(아이디) 찾기</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium break-keep">가입 시 등록한 이름과 연락처를 입력해주세요.</p>
        </div>

        {foundEmail ? (
          <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center mb-6 shadow-sm">
              <p className="text-sm font-bold text-gray-500 mb-2">고객님의 이메일 주소입니다.</p>
              <div className="flex items-center justify-center gap-2 text-xl font-black text-indigo-600">
                <Mail className="w-5 h-5" /> {foundEmail}
              </div>
            </div>
            
            <div className="flex gap-3 w-full">
              <Link href="/reset-password" className="flex-1 rounded-xl bg-white border border-gray-200 py-3.5 text-sm font-bold text-gray-700 text-center hover:bg-gray-50 transition-colors">
                비밀번호 찾기
              </Link>
              <Link href="/login" className="flex-1 rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white text-center hover:bg-gray-800 transition-colors">
                로그인하기
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm font-bold text-red-600 text-center">
                {error}
              </div>
            )}

            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))} // ⭐️ 자동 하이픈 적용
                  placeholder="연락처 (예: 010-1234-5678)"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name || !phone}
              className="w-full mt-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "이메일 찾기"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}