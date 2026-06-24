// app/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { UserPlus, Lock, Mail, User, Building2, BadgeCheck, Phone, MapPin, Hash, Printer, UserCog } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signUpAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1.5 block text-xs font-bold text-gray-700";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 md:p-10 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-gray-900 tracking-tight">CRM 매니저 회원가입</h1>
          <p className="mt-1.5 text-sm text-gray-500">소속 정보와 계정을 생성하여 서비스를 시작하세요.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600 animate-in fade-in zoom-in-95 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 소속 및 직급 정보 */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">1. 소속 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>이름 (실명) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className={iconClass} />
                  <input name="name" type="text" required placeholder="예: 홍길동" className={inputClass} />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>사번 (Agent Code) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Hash className={iconClass} />
                  <input name="agent_code" type="number" required placeholder="고유 사번 입력" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>소속 지점 ID <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 className={iconClass} />
                  <input name="agency_id" type="number" required placeholder="지점 ID (예: 1)" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>직급</label>
                <div className="relative">
                  <BadgeCheck className={iconClass} />
                  <input name="rank" type="text" placeholder="예: ASM, SM 등" className={inputClass} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>상급자 코드 (Manager Code)</label>
                <div className="relative">
                  <UserCog className={iconClass} />
                  <input name="manager_code" type="number" placeholder="관리자/상급자의 ID (선택)" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. 연락 및 주소 */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">2. 연락 및 주소</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>연락처</label>
                <div className="relative">
                  <Phone className={iconClass} />
                  <input name="phone" type="tel" placeholder="010-0000-0000" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>팩스 번호 (Fax)</label>
                <div className="relative">
                  <Printer className={iconClass} />
                  <input name="fax" type="tel" placeholder="02-000-0000" className={inputClass} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>사무실 주소</label>
                <div className="relative">
                  <MapPin className={iconClass} />
                  <input name="office_address" type="text" placeholder="근무하시는 지점의 주소를 입력해주세요" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. 계정 정보 */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">3. 계정 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>이메일 주소 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input name="email" type="email" required placeholder="로그인 시 사용할 이메일" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>비밀번호 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className={iconClass} />
                  <input name="password" type="password" required minLength={6} placeholder="6자리 이상 비밀번호" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 rounded-xl bg-purple-600 py-4 text-sm font-bold text-white transition-colors hover:bg-purple-700 shadow-lg shadow-purple-500/30 disabled:opacity-50"
          >
            {isLoading ? "담당자 계정 생성 중..." : "회원가입 완료하기"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-medium">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-bold text-purple-600 hover:underline">
            로그인하기
          </Link>
        </div>

      </div>
    </div>
  );
}