// app/promo/1/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ShieldCheck, DollarSign, ArrowRight, TrendingUp, Landmark, Calculator, 
  CalendarDays, BadgePercent, Building2, Globe2, Award, ArrowDown,
  Info, Check
} from "lucide-react";

function PromoContent() {
  const searchParams = useSearchParams();
  // ⭐️ URL 파라미터가 없을 경우를 대비해 가입제안서 상의 대표님 정보를 기본값으로 세팅했습니다.
  const agentName = searchParams.get("name") || "정준희 GFSR";
  const agentPhone = searchParams.get("phone") || "010-4488-9752";

  return (
    <div className="fixed inset-0 z-[100] bg-[#f4f7f9] overflow-y-auto pb-28 font-sans selection:bg-[#0090da]/30">
      
      {/* 1. 커버(Cover) 섹션 - 메트라이프 프리미엄 테마 */}
      <div className="bg-[#003764] text-white pt-16 pb-32 px-6 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-bl from-[#0090da] to-transparent rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-gradient-to-tr from-[#a2d45e] to-transparent rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-white/10 text-[#a2d45e] border border-[#a2d45e]/30 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase">
              MetLife Financial Solution
            </span>
          </div>
          
          <h2 className="text-[20px] font-medium text-blue-100 mb-2 tracking-tight">
            당신의 미래를 지키는 가장 확실한 선택
          </h2>
          <h1 className="text-[36px] md:text-[42px] font-black leading-[1.2] mb-6 break-keep">
            오늘의 <span className="text-[#0090da]">달러</span><br/>
            내일의 <span className="text-[#a2d45e]">연금</span>
          </h1>
          
          <div className="w-12 h-1 bg-[#a2d45e] mb-6"></div>

          <p className="text-[15px] font-medium text-blue-100/90 leading-relaxed break-keep">
            기축통화 달러로 안전하게 자산을 지키고,<br/>
            가입 직후부터 20년간 매달 쏟아지는<br/>달러 쿠폰의 여유를 누리세요.
          </p>
        </div>
      </div>

      {/* 2. 회사 신뢰도 섹션 (MetLife 160년 역사) */}
      <div className="relative z-20 px-5 -mt-16 mb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 flex flex-col gap-6">
          <div className="text-center pb-5 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">Global Standard</h3>
            <p className="text-lg font-black text-[#003764]">메트라이프가 약속합니다.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 divide-x divide-slate-100">
            <div className="flex flex-col items-center text-center px-2">
              <Globe2 className="w-8 h-8 text-[#0090da] mb-2" strokeWidth={1.5} />
              <p className="text-[22px] font-black text-slate-800 leading-none mb-1">160<span className="text-xs font-bold text-slate-500 ml-0.5">년</span></p>
              <p className="text-[10px] font-bold text-slate-500 break-keep">글로벌 금융 역사</p>
            </div>
            <div className="flex flex-col items-center text-center px-2">
              <Landmark className="w-8 h-8 text-[#0090da] mb-2" strokeWidth={1.5} />
              <p className="text-[22px] font-black text-slate-800 leading-none mb-1">7,420<span className="text-xs font-bold text-slate-500 ml-0.5">억$</span></p>
              <p className="text-[10px] font-bold text-slate-500 break-keep">총 운용 자산</p>
            </div>
            <div className="flex flex-col items-center text-center px-2">
              <Award className="w-8 h-8 text-[#0090da] mb-2" strokeWidth={1.5} />
              <p className="text-[22px] font-black text-slate-800 leading-none mb-1">1<span className="text-xs font-bold text-slate-500 ml-0.5">위</span></p>
              <p className="text-[10px] font-bold text-slate-500 break-keep">가장 존경받는 기업</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 맞춤 제안 서머리 */}
      <div className="px-5 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-[#003764] rounded-full"></div>
          <h3 className="text-2xl font-black text-slate-800">고객 맞춤 플랜 요약</h3>
        </div>

        <div className="bg-[#003764] rounded-3xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
            <div>
              <p className="text-[#0090da] font-bold text-sm mb-1">무배당 오늘의 달러 연금보험</p>
              <p className="text-2xl font-black">2형 (쿠폰형)</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-medium mb-1">납입기간</p>
              <p className="text-lg font-bold bg-white/10 px-3 py-1 rounded-lg inline-block">일시납</p>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-[13px] font-medium mb-1">총 납입 보험료</p>
              <p className="text-[28px] font-black text-[#a2d45e] leading-none">$ 72,000</p>
              <p className="text-[11px] text-slate-300 mt-1.5">(약 9,952만 원)</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#a2d45e]" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. 4대 핵심 혜택 (Brochure Style) */}
      <div className="px-5 mb-12 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-[#0090da] rounded-full"></div>
          <h3 className="text-2xl font-black text-slate-800">상품 핵심 포인트</h3>
        </div>

        {/* 포인트 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6 text-[#0090da]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#0090da] bg-blue-50 px-2 py-0.5 rounded-sm mb-1.5 inline-block">POINT 1</span>
            <h4 className="text-lg font-black text-slate-800 mb-1.5">가입 즉시 20년간 이자 지급</h4>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed break-keep">
              가입 후 1개월 경과 시점부터 매월 달러 이자(쿠폰)가 지급되어 물가 상승에 완벽하게 대비할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 포인트 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-sm mb-1.5 inline-block">POINT 2</span>
            <h4 className="text-lg font-black text-slate-800 mb-1.5">연 5.77% 고금리 확정</h4>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed break-keep">
              이율확정기간(최초 20년) 동안 시장 금리가 떨어져도 연복리 5.77%를 변함없이 든든하게 확정 적용합니다.
            </p>
          </div>
        </div>

        {/* 포인트 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
            <BadgePercent className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-sm mb-1.5 inline-block">POINT 3</span>
            <h4 className="text-lg font-black text-slate-800 mb-1.5">전액 비과세 혜택</h4>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed break-keep">
              관련 세법에서 정한 요건(10년 이상 유지 등) 충족 시 발생한 이자소득에 대해 15.4%의 세금이 전액 비과세됩니다.
            </p>
          </div>
        </div>

      </div>

      {/* 5. 시뮬레이션 타임라인 (핵심 숫자로 보여주기) */}
      <div className="bg-white py-12 px-5 mb-10 border-y border-slate-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
          <h3 className="text-2xl font-black text-slate-800">투자 흐름 시뮬레이션</h3>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-4 space-y-10 pb-4">
          
          {/* Step 1 */}
          <div className="relative pl-8">
            <div className="absolute -left-[17px] top-0 w-8 h-8 bg-white border-4 border-slate-200 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
            </div>
            <p className="text-xs font-black text-slate-400 mb-1">가입 시점 (30세)</p>
            <h4 className="text-lg font-black text-slate-800 mb-2">일시납 $72,000 납입</h4>
            <p className="text-[13px] text-slate-500 font-medium">안전한 기축통화 달러로 자산 포트폴리오를 구성합니다.</p>
          </div>

          {/* Step 2 */}
          <div className="relative pl-8">
            <div className="absolute -left-[17px] top-0 w-8 h-8 bg-white border-4 border-[#0090da] rounded-full flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 text-[#0090da]" strokeWidth={3} />
            </div>
            <p className="text-xs font-black text-[#0090da] mb-1">가입 1개월 후 ~ 20년간</p>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-2">
              <h4 className="text-[15px] font-bold text-slate-700 mb-1">매월 달러 이자 지급</h4>
              <p className="text-2xl font-black text-[#003764]">$ 260.48 / 월</p>
              <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center text-[12px]">
                <span className="text-slate-500 font-bold">20년 총 수령액</span>
                <span className="text-[#0090da] font-black">$ 62,515</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative pl-8">
            <div className="absolute -left-[17px] top-0 w-8 h-8 bg-white border-4 border-[#a2d45e] rounded-full flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-[#a2d45e]" strokeWidth={4} />
            </div>
            <p className="text-xs font-black text-[#a2d45e] mb-1">가입 20년 후 (50세)</p>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mt-2">
              <h4 className="text-[15px] font-bold text-slate-300 mb-1">매월 이자 받고도 원금 초과</h4>
              <p className="text-2xl font-black text-[#a2d45e]">$ 74,005 <span className="text-xs font-medium text-slate-400 ml-1">(해약환급금)</span></p>
              <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center text-[12px]">
                <span className="text-slate-400 font-bold">원금 대비 환급률</span>
                <span className="text-white font-black">102.78 %</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 bg-slate-50 rounded-xl p-4 flex gap-3 border border-slate-200">
          <Info className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed break-keep">
            본 예시의 금액 및 환급률은 2026.09.16 기준 이율확정기간 공시이율(5.77%)을 가정하여 산출되었으며, 향후 해지 시점에 따라 금리차환급금조정률(MVA)이 적용될 수 있습니다. 20년 이후 유지 시 90세부터 종신 연금으로 수령 가능합니다.
          </p>
        </div>
      </div>

      {/* 6. 예금자 보호 안내 */}
      <div className="max-w-md mx-auto px-5 mb-10">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-start gap-4">
          <div className="shrink-0 bg-blue-50 p-2.5 rounded-full">
            <ShieldCheck className="w-6 h-6 text-[#003764]" />
          </div>
          <div>
            <h4 className="text-[14px] font-black text-slate-800 mb-1.5">
              안전한 예금자보호 상품
            </h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed break-keep">
              이 보험계약은 예금자보호법에 따라 예금보험공사가 보호하되, 보호 한도는 본 보험회사에 있는 귀하의 모든 예금보호 대상 금융상품의 해약환급금에 기타지급금을 합하여 1인당 "최고 1억 원"입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 7. 하단 고정 다이렉트 콜 CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex flex-col gap-2.5">
          <div className="flex justify-between items-center px-1">
            <p className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              전담 재무설계사 대기중
            </p>
            <p className="text-[13px] font-black text-[#003764]">{agentName}</p>
          </div>
          
          <a 
            href={`tel:${agentPhone}`} 
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#003764] to-[#00529b] text-white py-4 rounded-xl font-black text-[16px] shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          >
            지금 바로 무료 상담 전화하기 <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

    </div>
  );
}

// Next.js useSearchParams 에러 방지용 Suspense 바인딩
export default function PromoPage1() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7f9]" />}>
      <PromoContent />
    </Suspense>
  );
}