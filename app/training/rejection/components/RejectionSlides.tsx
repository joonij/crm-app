"use client";

import { 
  AlertCircle, ShieldCheck, TrendingDown, 
  Home, Building, Filter, CheckCircle2, XCircle, 
  PiggyBank, ArrowRight, Info
} from "lucide-react";

// SLIDE 1: 대문
export function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-6 py-2 bg-blue-50 text-blue-700 rounded-full font-bold tracking-widest text-xl z-10">
        사내 마스터 교육 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight tracking-tight z-10">
        보험 가입 전<br />
        <span className="text-blue-600">꼭 알아야 할 3가지</span>
      </h1>
      <div className="flex gap-4 z-10 mt-4">
        <span className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold text-lg">01. 적립보험료</span>
        <span className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold text-lg">02. 갱신형 vs 비갱신형</span>
        <span className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold text-lg">03. 우량담보</span>
      </div>
      <p className="text-3xl text-gray-500 font-bold mt-8 z-10">
        알고 가입하면 손해 보지 않습니다
      </p>
    </div>
  );
}

// SLIDE 2: 적립보험료
export function SlideSection1() {
  return (
    <div className="h-full flex flex-col justify-center gap-8 py-2">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-4">적립보험료란?</h3>
        <p className="text-xl text-gray-500 font-medium">매달 내는 보험료 중 일부는 '보장'이 아니라 '적립'에 들어갑니다.<br/>같은 보장을 받아도 적립보험료가 클수록 내 돈이 더 묶입니다.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* 1만원 카드 */}
        <div className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-white shadow-lg transform transition-transform hover:scale-105">
          <div className="text-3xl font-black mb-6 text-center">1만원</div>
          <div className="flex justify-between border-b border-white/20 pb-3 mb-3 text-sm"><span>보장보험료</span><b className="font-black">1만원</b></div>
          <div className="flex justify-between pb-3 mb-6 text-sm"><span>적립보험료</span><b className="font-black">0원</b></div>
          <div className="bg-white/20 rounded-xl p-3 text-center font-bold text-xl">암보장 5,000만원 동일</div>
        </div>

        <div className="text-4xl font-black text-gray-300">≠</div>

        {/* 5만원 카드 */}
        <div className="flex-1 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-8 text-white shadow-lg transform transition-transform hover:scale-105">
          <div className="text-3xl font-black mb-6 text-center">5만원</div>
          <div className="flex justify-between border-b border-white/20 pb-3 mb-3 text-sm"><span>보장보험료</span><b className="font-black">1만원</b></div>
          <div className="flex justify-between pb-3 mb-6 text-sm"><span>적립보험료</span><b className="font-black">4만원</b></div>
          <div className="bg-white/20 rounded-xl p-3 text-center font-bold text-xl">암보장 5,000만원 동일</div>
        </div>

        <div className="text-4xl font-black text-gray-300">≠</div>

        {/* 10만원 카드 */}
        <div className="flex-1 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-8 text-white shadow-lg transform transition-transform hover:scale-105">
          <div className="text-3xl font-black mb-6 text-center">10만원</div>
          <div className="flex justify-between border-b border-white/20 pb-3 mb-3 text-sm"><span>보장보험료</span><b className="font-black">1만원</b></div>
          <div className="flex justify-between pb-3 mb-6 text-sm"><span>적립보험료</span><b className="font-black">9만원</b></div>
          <div className="bg-white/20 rounded-xl p-3 text-center font-bold text-xl">암보장 5,000만원 동일</div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="text-2xl font-black text-red-800 mb-2 flex items-center justify-center gap-2"><PiggyBank /> 적립보험료 = 보험사 + 설계사 마진</div>
        <p className="text-red-600 font-bold">100세 만기 시 돌려받지만, 물가상승률을 고려하면 납입한 금액보다 실질적 가치가 훨씬 적게 돌아옵니다.</p>
      </div>
    </div>
  );
}

// SLIDE 3: 갱신형 vs 비갱신형
export function SlideSection2() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-4">같은 보장, 다른 평생 부담</h3>
        <p className="text-xl text-gray-500 font-medium">같은 보장이라도 납입 구조에 따라 평생 부담이 완전히 달라집니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-12 flex-1 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl z-10 shadow-xl border-4 border-white">
          VS
        </div>

        {/* 갱신형 (Bad) */}
        <div className="bg-white border-2 border-red-200 rounded-3xl p-10 flex flex-col shadow-lg">
          <h4 className="text-3xl font-black text-red-600 mb-2 flex items-center gap-3"><XCircle className="w-8 h-8"/> 갱신형 보험</h4>
          <ul className="space-y-6 text-xl text-gray-700 font-bold flex-1">
            <li>• 3~30년 주기로 <span className="text-red-500">보험료 인상</span></li>
            <li>• 만기(100세)까지 <span className="text-red-500">계속 납입</span></li>
            <li>• 소득이 끊기는 노후에는 <span className="text-red-500">납부 부담 매우 큼</span></li>
          </ul>
          <div className="mt-2 pt-6 border-t border-gray-100 flex items-center gap-4">
            <div className="bg-red-100 p-4 rounded-full text-red-600"><Building className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">비유하자면</p>
              <p className="text-xl font-black text-red-800">월세처럼 끝없이 나가는 비용</p>
            </div>
          </div>
        </div>

        {/* 비갱신형 (Good) */}
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-10 flex flex-col shadow-lg transform z-0">
          <h4 className="text-3xl font-black text-emerald-600 mb-2 flex items-center gap-3"><CheckCircle2 className="w-8 h-8"/> 비갱신형 보험</h4>
          <ul className="space-y-6 text-xl text-gray-700 font-bold flex-1">
            <li>• 20~30년만 납입 후 <span className="text-emerald-600">100세까지 평생 보장</span></li>
            <li>• 처음에 정한 <span className="text-emerald-600">보험료 변동 없음</span></li>
            <li>• 납입 완료 후 <span className="text-emerald-600">추가 부담 전혀 없음</span></li>
          </ul>
          <div className="mt-2 pt-6 border-t border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Home className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">비유하자면</p>
              <p className="text-xl font-black text-emerald-800">자가처럼 납입 후 완전한 내 것이 됨</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 text-white p-6 rounded-2xl text-center font-bold text-xl shadow-md">
        추천: 경제활동 중 <span className="text-yellow-300">비갱신형</span>으로 든든하게 가입 → 납입 완료 후 보완이 필요하면 갱신형 추가
      </div>
    </div>
  );
}

// SLIDE 4: 우량담보 (Funnel)
export function SlideSection3() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">

      <div className="flex flex-col items-center">

        <div className="w-full max-w-3xl flex flex-col items-center gap-3">
          <div className="font-black text-4xl w-full text-center">
            사망
          </div>
          <div className="bg-blue-500 text-white font-bold text-4xl py-4 rounded-xl w-[85%] text-center shadow-md flex items-center justify-center gap-2">
            <span className="text-blue-200 text-sm">조건추가</span> 상해 사망
          </div>
          <div className="bg-blue-400 text-white font-bold text-3xl py-3 rounded-xl w-[70%] text-center shadow-md flex items-center justify-center gap-2">
            <span className="text-blue-100 text-sm">조건추가</span> 교통 상해 사망
          </div>
          <div className="bg-blue-300 text-blue-900 font-bold text-2xl py-2 rounded-xl w-[55%] text-center shadow-md flex items-center justify-center gap-2">
            <span className="text-blue-700 text-sm">조건추가</span> 대중교통 교통 상해 사망
          </div>
          <div className="bg-red-500 text-white font-black text-sm py-1.5 rounded-xl w-[40%] text-center shadow-md flex items-center justify-center gap-2">
            <span className="text-red-200 text-sm">조건추가</span> 휴일 대중교통 교통 상해 사망
          </div>
        </div>

        <div className="text-gray-400 font-black mt-6 flex flex-col items-center gap-2">
          <TrendingDown className="w-8 h-8" />
          조건이 추가될수록 받기 어려워짐
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center font-bold text-xl text-emerald-800 shadow-sm flex items-center justify-center gap-3 mt-2">
        <Filter className="w-6 h-6" /> 특약 선택 팁: 이름이 짧을수록 보험금 받기 쉬운 좋은 특약!
      </div>
    </div>
  );
}

// SLIDE 5: 핵심정리
export function SlideSection4() {
  return (
    <div className="h-full flex flex-col justify-center gap-8 py-4">

      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 font-black text-2xl shrink-0">01</div>
          <h4 className="text-2xl font-black text-gray-900 mb-4">적립보험료</h4>
          <p className="text-gray-600 font-bold leading-relaxed text-lg flex-1">
            같은 보장이라면 적립보험료 없는 상품을 선택하세요. 보험사·설계사 마진이며, 돌려받아도 납입액보다 적습니다.
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 font-black text-2xl shrink-0">02</div>
          <h4 className="text-2xl font-black text-gray-900 mb-4">비갱신형 선택</h4>
          <p className="text-gray-600 font-bold leading-relaxed text-lg flex-1">
            비갱신형은 자가, 갱신형은 월세입니다. 경제활동 중 비갱신형으로 보험료를 고정하고, 필요하면 갱신형으로 보완하세요.
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 font-black text-2xl shrink-0">03</div>
          <h4 className="text-2xl font-black text-gray-900 mb-4">짧은 이름의 특약</h4>
          <p className="text-gray-600 font-bold leading-relaxed text-lg flex-1">
            이름이 짧을수록 보험금 수령 조건이 넓습니다. 긴 이름의 우량담보 특약은 피하세요.
          </p>
        </div>
      </div>

      <div className="text-center text-gray-400 font-medium text-sm mt-8 flex items-center justify-center gap-2">
        <Info className="w-4 h-4"/> 본 자료는 보험 가입 전 이해를 돕기 위한 교육 목적의 요약 자료입니다.
      </div>
    </div>
  );
}