"use client";

import { useState, useEffect } from "react";
import { 
  Building2, TrendingUp, ShieldCheck, Landmark, Quote, Snowflake, Droplet, 
  Coins, ReceiptText, Timer, TrendingDown, ShieldPlus, LineChart, Lock, 
  ChevronRight, AlertCircle, Scale, Gavel, FileSignature, Stethoscope, 
  Search, UserCheck, AlertTriangle, CheckCircle2, FileText, FileSearch, XCircle,
  HelpCircle, UserX, UserPlus, HeartPulse, Activity, Ban
} from "lucide-react";

// SLIDE 1: 대문 (Intro)
export function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-10 py-4 bg-blue-50 text-blue-700 rounded-full font-bold text-xl tracking-widest z-10">
        마스터 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8 z-10 tracking-tight">
        계약 전 알릴의무 <br />
        <span className="text-blue-600">건강체보험과 간편체보험 맞춤 설계 전략</span>
      </h1>
      <p className="text-3xl text-gray-500 mt-6 font-medium z-10">법적 근거, 금감원 실무, 분쟁사례 분석</p>
    </div>
  );
}

// SLIDE 2: 목차 (Agenda)
export function SlideCh1() {
    const [step, setStep] = useState(0);
  
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight" || e.key === " ") {
          if (step < 4) {
            e.stopPropagation();
            e.preventDefault();
            setStep((prev) => prev + 1);
          }
        } else if (e.key === "ArrowLeft") {
          if (step > 0) {
            e.stopPropagation();
            e.preventDefault();
            setStep((prev) => prev - 1);
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown, true);
      return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [step]);
  
  return (
    <div className="flex flex-col h-full justify-center space-y-8 p-4">
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        <div className={`border rounded-3xl p-8 flex flex-col justify-center h-full group transition-all duration-700 ease-in-out ${step >= 1 ? 'border-gray-200 shadow-xl opacity-100 z-10' : 'bg-gray-50 border-gray-200 shadow-sm scale-95 opacity-40 grayscale blur-[1px]'}`}>
          <h3 className="text-2xl font-black text-blue-600 mb-3 flex items-center gap-2">
            <Scale className="w-6 h-6" /> PART 1. 상법 & 서면주의
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">고지의무의 법적 본질, 서면주의 원칙 및 모집종사자 기본 책무</p>
        </div>

        <div className={`border rounded-3xl p-8 flex flex-col justify-center h-full group transition-all duration-700 ease-in-out ${step >= 2 ? 'border-gray-200 shadow-xl opacity-100 z-10' : 'bg-gray-50 border-gray-200 shadow-sm scale-95 opacity-40 grayscale blur-[1px]'}`}>
          <h3 className="text-2xl font-black text-blue-600 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> PART 2. 고지의무의 중요성 & 해지권 제한
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">제척기간, 인과관계별 지급여부 및 보험사 해지권 제한사유</p>
        </div>

        <div className={`border rounded-3xl p-8 flex flex-col justify-center h-full group transition-all duration-700 ease-in-out ${step >= 3 ? 'border-gray-200 shadow-xl opacity-100 z-10' : 'bg-gray-50 border-gray-200 shadow-sm scale-95 opacity-40 grayscale blur-[1px]'}`}>
          <h3 className="text-2xl font-black text-blue-600 mb-3 flex items-center gap-2">
            <Gavel className="w-6 h-6" /> PART 3. 금감원 분쟁사례
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">실제 민원 분쟁: 건강검진, 인과관계, 설계사 구두고지 처리결과</p>
        </div>

        <div className={`border rounded-3xl p-8 flex flex-col justify-center h-full group transition-all duration-700 ease-in-out ${step >= 4 ? 'border-gray-200 shadow-xl opacity-100 z-10' : 'bg-gray-50 border-gray-200 shadow-sm scale-95 opacity-40 grayscale blur-[1px]'}`}>
          <h3 className="text-2xl font-black text-blue-600 mb-3 flex items-center gap-2">
            <Activity className="w-6 h-6" /> PART 4. 간편 전략
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">N값 세분화 활용, 병력자 맞춤 인수 설계 및 영업 실무 노하우</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 3: 상법 제651조 & 고지수령권
export function SlideCh2_1() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 relative">
      <p className="text-gray-700 text-center text-2xl font-bold shrink-0">
        "설계사에게 말한 것은 보험사에 말한 것이 아닙니다. <strong className="text-red-600">오직 서면(질문표)만이 법적 효력</strong>을 갖습니다."
      </p>

      <div className="flex bg-white p-16 rounded-[3rem] border border-blue-100 shadow-md items-center gap-10">
        <div className="bg-blue-600 p-16 rounded-full shadow-lg shrink-0">
          <Scale className="w-16 h-16 text-white" />
        </div>
        <div className="space-y-4 ml-18">
          <h3 className="text-3xl font-black text-blue-900">상법 제651조 (고지의무의 본질)</h3>
          <div className="text-2xl text-gray-500 leading-relaxed pt-2 rounded-2xl font-medium ">
            <strong className="text-gray-700">법적 정의 -</strong> 계약 체결 시 보험계약자가 중요한 사항을 알릴 의무
          </div>
          <div className="text-2xl text-gray-500 leading-relaxed pt-2 rounded-2xl font-medium ">
          <strong className="text-gray-700">주관적 요건 -</strong>  고의 또는 중대한 과실로 불고지 또는 부실고지 시 적용
          </div>
          <div className="text-2xl text-gray-500 leading-relaxed pt-2 rounded-2xl font-medium ">
          <strong className="text-gray-700">해지권 행사 -</strong>  보험회사는 위반 사실을 안 날로부터 1개월 내 행사
          </div>
          <div className="text-2xl text-gray-500 leading-relaxed pt-2 rounded-2xl font-medium ">
          <strong className="text-gray-700">제척기간 제한 -</strong>  계약을 체결한 날로부터 3년 이내에만 해지 가능
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE: 표준사업방법서 질문표 (첨부 이미지 반영)
export function SlideCh2_2() {  
    const questions = [
      {
        num: 1,
        period: "최근 3개월",
        desc: "이내에 의사로부터 진찰 또는 검사(건강검진 포함)를 통하여 다음과 같은 의료행위를 받은 사실이 있습니까?",
        details: "1) 질병확정진단  2) 질병의심소견  3) 치료  4) 입원  5) 수술(제왕절개 포함)  6) 투약",
        color: "blue"
      },
      {
        num: 2,
        period: "최근 3개월",
        desc: "이내에 마약을 사용하거나 혈압강하제, 신경안정제, 수면제, 각성제(흥분제), 진통제 등 약물을 상시 복용한 사실이 있습니까?",
        details: "",
        color: "blue"
      },
      {
        num: 3,
        period: "최근 1년",
        desc: "이내에 의사로부터 진찰 또는 검사를 통하여 추가검사(재검사)를 받은 사실이 있습니까?",
        details: "※ 단순 정기검진 결과 통보가 아닌, 의사의 명확한 '추가/재검사' 소견 기준",
        color: "emerald"
      },
      {
        num: 4,
        period: "최근 5년",
        desc: "이내에 의사로부터 진찰 또는 검사를 통하여 다음과 같은 의료행위를 받은 사실이 있습니까?",
        details: "1) 입원  2) 수술(제왕절개 포함)  3) 계속하여 7일 이상 치료  4) 계속하여 30일 이상 투약",
        color: "purple"
      },
      {
        num: 5,
        period: "최근 5년",
        desc: "이내에 아래 10대 질병으로 의사로부터 진찰 또는 검사를 통하여 의료행위를 받은 사실이 있습니까?",
        details: "①암 ②백혈병 ③고혈압 ④협심증 ⑤심근경색 ⑥심장판막증 ⑦간경화증 ⑧뇌졸중(뇌출혈,뇌경색) ⑨당뇨병 ⑩에이즈(AIDS, HIV보균)\n※ [실손의료비 가입시 추가질문] 직장 또는 항문관련질환(치질, 치루, 치열, 항문농양, 직장 또는 항문탈출, 항문출혈, 항문궤양)",
        color: "rose"
      }
    ];
  
    return (
      <div className="h-full flex flex-col justify-center py-4">
        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-auto">
          {questions.map((q, idx) => {
            const bgColors = {
              blue: "bg-blue-50 border-blue-200 text-blue-700",
              emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
              purple: "bg-purple-50 border-purple-200 text-purple-700",
              rose: "bg-rose-50 border-rose-200 text-rose-700"
            };
            const badgeClass = bgColors[q.color as keyof typeof bgColors];
  
            return (
              <div 
                key={q.num}
                className={`flex items-stretch bg-white border-2 border-gray-200 rounded-2xl transition-all duration-500 transform opacity-100 translate-x-0`}
              >
                {/* 좌측 넘버링 */}
                <div className="w-16 shrink-0 bg-gray-50 flex items-center justify-center border-r border-gray-200 rounded-l-2xl">
                  <span className="text-2xl font-black text-gray-400">{q.num}</span>
                </div>
                
                {/* 우측 내용 */}
                <div className="flex-1 p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-black text-sm px-3 py-1 rounded-lg border ${badgeClass}`}>
                      {q.period}
                    </span>
                    <span className="text-lg font-bold text-gray-800 tracking-tight">
                      {q.desc}
                    </span>
                  </div>
                    <p className="text-sm font-bold text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {q.details}
                    </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

// SLIDE 4: 표준사업방법서 주요 용어
export function SlideCh2_3() {
  return (
    <div className="h-full flex flex-col justify-center space-y-6">
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-8 h-8 text-indigo-600" />
            <h3 className="text-2xl font-black text-slate-800">추가검사 (재검사)</h3>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed p-4 rounded-xl font-medium flex-1">
          이전 검사에서 이상 소견이나 질병 의심 소견 등이 확인되어, 이를 명확히 진단하기 위해 후속으로 진행한 검사를 의미합니다. 단순히 증상이 없거나 정기적으로 진행하는 경과관찰과 및 추적관찰은 명확히 구분됩니다.
          </p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <FileSearch className="w-8 h-8 text-blue-600" />
            <h3 className="text-2xl font-black text-slate-800">질병 확정진단 및 의심소견</h3>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed p-4 rounded-xl font-medium flex-1">
            동일한 질병으로 의사에게 처방받은 약의 총 일수가 30일 이상인 경우를 말합니다. (실제 복용한 기간이 아니라 의사 처방전 상의 총 투약 일수 기준입니다.)
          </p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Timer className="w-8 h-8 text-amber-600" />
            <h3 className="text-2xl font-black text-slate-800">계속하여 7일 이상 치료</h3>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed p-4 rounded-xl font-medium flex-1">
            동일한 질병의 치료를 목적으로 의사의 진료를 받기 위해 의료기관에 방문한 일수가 총 합산하여 7일 이상인 경우를 말합니다.
          </p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <HeartPulse className="w-8 h-8 text-rose-600" />
            <h3 className="text-2xl font-black text-slate-800">계속하여 30일 이상 투약</h3>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed p-4 rounded-xl font-medium flex-1">
            검사를 통해 해당 질병을 명확하게 진단 하거나(진단서,소견서 등), 검사 결과상 이상소견이 발견되었으나, 아직 확진되지는 않고 해당 질병이 있을 것으로 의심되는 상태(소견서나 진료기록상)
          </p>
        </div>

      </div>
    </div>
  );
}

export function SlideCh2_4() {
    return (
      <div className="h-full flex flex-col justify-center py-4">
  
        <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
          {/* 1. 서면주의 원칙 */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col hover:shadow-md hover:border-blue-300 transition-all">
            <div className="bg-blue-100/70 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shrink-0">
              <FileSignature className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-blue-900 mb-4 shrink-0">서면(질문표)주의 원칙</h3>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              금융감독원 규정에 따라 청약서상 <strong className="text-gray-800 underline decoration-blue-300 decoration-2 underline-offset-4">정형화된 질문표(전자문서)</strong>에 기술된 항목에 한해서만 고지 효력이 발생합니다.
            </p>
          </div>
  
          {/* 2. 임의 고지 요구 금지 */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col hover:shadow-md hover:border-blue-300 transition-all">
            <div className="bg-blue-100/70 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shrink-0">
              <Ban className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-blue-900 mb-4 shrink-0">임의 고지 요구 금지</h3>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              보험회사는 표준 질문표 외의 사항을 자의적으로 요구할 수 없으며, 질문표에 없는 내용으로 계약을 해지할 수 없습니다.
            </p>
          </div>
  
          {/* 3. 모집종사자의 책무 */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col hover:shadow-md hover:border-blue-300 transition-all">
            <div className="bg-blue-100/70 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shrink-0">
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-blue-900 mb-4 shrink-0">모집종사자의 책무</h3>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              설계사는 고객이 질문표 항목을 사실대로 작성하도록 정확히 안내해야 하며, 부실고지를 유도하거나 방조해서는 안 됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

// SLIDE 5: 고지의무 중요성 3대 관점
export function SlideCh3_1() {
  return (
    <div className="h-full flex flex-col justify-center space-y-8">
      
      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="border border-blue-200 p-8 rounded-3xl bg-blue-50 shadow-sm flex flex-col h-full text-center relative overflow-hidden">
          <UserCheck className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-blue-900 mb-4">1. 고객 관점</h3>
          <h4 className="text-xl font-black text-blue-700 mb-4 bg-white py-2 rounded-xl border border-blue-100">완전한 보장권 확보</h4>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">정확한 고지 없이는 추후 암·뇌·심장 등 대형 사고 발생 시 계약 해지 및 보험금 부지급으로 인한 <strong>치명적 경제적 손실 위험</strong>에 노출됩니다.</p>
        </div>

        <div className="border border-emerald-200 p-8 rounded-3xl bg-emerald-50 shadow-sm flex flex-col h-full text-center relative overflow-hidden">
          <Building2 className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-emerald-900 mb-4">2. 보험사 & 제도 관점</h3>
          <h4 className="text-xl font-black text-emerald-700 mb-4 bg-white py-2 rounded-xl border border-emerald-100">역선택 방지 및 선의자 보호</h4>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">위험률을 정확히 측정하고 <strong>역선택(Adverse Selection)을 차단</strong>하여, 정직하게 가입한 대다수 선의의 계약자들을 위한 위험공동체를 유지합니다.</p>
        </div>

        <div className="border border-purple-200 p-8 rounded-3xl bg-purple-50 shadow-sm flex flex-col h-full text-center relative overflow-hidden">
          <ShieldPlus className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-purple-900 mb-4">3. 설계사 관점</h3>
          <h4 className="text-xl font-black text-purple-700 mb-4 bg-white py-2 rounded-xl border border-purple-100">불완전판매 & 구상권 차단</h4>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">고지의무 방조·유도 시 보험업법 제102조에 따른 손해배상책임 및 구상권이 청구될 수 있으므로, <strong>설계사 본인을 지키는 방어막</strong>이 됩니다.</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 6: 인과관계별 지급 여부
export function SlideCh3_2() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        if (step < 2) {
          e.stopPropagation();
          e.preventDefault();
          setStep((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (step > 0) {
          e.stopPropagation();
          e.preventDefault();
          setStep((prev) => prev - 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [step]);

  return (
    <div className="h-full flex flex-col justify-center relative">

      <div className="grid grid-cols-2 gap-10 flex-1 min-h-[450px]">
        {/* 왼쪽: 인과관계 없음 */}
        <div className={`border rounded-3xl p-10 flex flex-col items-center text-center transition-all duration-700 ease-in-out ${step >= 1 ? 'bg-blue-50 border-blue-300 shadow-xl opacity-100 z-10' : 'bg-gray-50 border-gray-200 shadow-sm opacity-40 grayscale blur-[1px]'}`}>
          <ShieldCheck className="w-20 h-20 text-blue-600 mb-6" />
          <h3 className="text-3xl font-black text-gray-800 mb-4">인과관계가 <span className="text-blue-600">없는</span> 경우</h3>
          <p className="text-xl text-gray-600 leading-relaxed font-medium mb-6">미고지 병력과 발생한 사고 사이에<br/>인과관계가 없음이 객관적으로 입증된 때</p>
          
          <div className="bg-white p-6 rounded-2xl w-full text-left shadow-sm border border-blue-100 space-y-4">
            <p className="text-xl font-bold text-gray-700">🔹 계약 해지: <span className="text-blue-600 font-black">해지 가능 (제척기간 내)</span></p>
            <p className="text-xl font-bold text-gray-700">🔹 보험금 지급: <span className="text-blue-600 font-black">정상 지급 (보상 O)</span></p>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-blue-800 font-bold">대표 예시:</span><br/>과거 <strong className="text-red-500">간경화 진단</strong>을 숨기고 가입 후, <strong className="text-blue-600">교통사고로 사망</strong>한 경우
            </div>
          </div>
        </div>

        {/* 오른쪽: 인과관계 있음 */}
        <div className={`border rounded-3xl p-10 flex flex-col items-center text-center transition-all duration-700 ease-in-out ${step >= 2 ? 'bg-red-50 border-red-300 shadow-2xl opacity-100 z-10' : 'bg-gray-50 border-gray-200 shadow-sm scale-95 opacity-30 grayscale blur-[1px]'}`}>
          <AlertTriangle className="w-20 h-20 text-red-600 mb-6" />
          <h3 className="text-3xl font-black text-gray-800 mb-4">인과관계가 <span className="text-red-600">있는</span> 경우</h3>
          <p className="text-xl text-gray-600 leading-relaxed font-medium mb-6">미고지 병력이 직접 원인이 되어<br/>질병/사고가 발생하거나 악화된 때</p>
          
          <div className="bg-white p-6 rounded-2xl w-full text-left shadow-sm border border-red-100 space-y-4 flex-1">
            <p className="text-xl font-bold text-gray-700">🔹 계약 해지: <span className="text-red-600 font-black">계약 즉시 해지</span></p>
            <p className="text-xl font-bold text-gray-700">🔹 보험금 지급: <span className="text-red-600 font-black">지급 거절 (보상 X)</span></p>
            <div className="mt-auto bg-red-50/50 p-4 rounded-xl border border-red-100">
              <span className="text-red-800 font-bold">대표 예시:</span><br/>과거 <strong className="text-red-500">협심증 치료</strong> 사실을 숨기고 가입 후, <strong className="text-red-600">급성 심근경색으로 사망</strong>한 경우
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 7: 금감원 분쟁사례
export function SlideCh6() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        if (step < 3) {
          e.stopPropagation();
          e.preventDefault();
          setStep((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (step > 0) {
          e.stopPropagation();
          e.preventDefault();
          setStep((prev) => prev - 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [step]);

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden relative">
      <div className="text-center shrink-0 mb-2">
        <h2 className="text-4xl font-black text-gray-900">금융감독원 실제 분쟁사례 분석</h2>
      </div>

      <div className="flex-1 grid grid-rows-3 gap-4 min-h-0">
        {/* CASE 1 */}
        <div className={`bg-white border-2 border-gray-200 rounded-2xl p-6 flex items-center shadow-sm transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-x-0 border-blue-400 shadow-md' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
          <div className="w-20 shrink-0 text-center">
            <span className="bg-blue-600 text-white font-black text-xl px-4 py-2 rounded-xl">사례 1</span>
          </div>
          <div className="flex-1 px-6">
            <h4 className="text-2xl font-black text-gray-800 mb-2">건강검진 추가검사/재검사 소견 미고지</h4>
            <p className="text-lg text-gray-600 font-medium">건강검진에서 '갑상선 결절 추가검사 요망'을 받았으나 미기재 가입. 1년 후 갑상선암 진단.</p>
          </div>
          <div className="w-72 shrink-0 bg-red-50 border border-red-200 p-4 rounded-xl text-center">
            <p className="text-red-700 font-black text-lg">보험사 승소 (부지급)</p>
            <p className="text-sm text-gray-600 mt-1 font-bold">건강검진 소견도 명백한 고지 대상</p>
          </div>
        </div>

        {/* CASE 2 */}
        <div className={`bg-white border-2 border-gray-200 rounded-2xl p-6 flex items-center shadow-sm transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-x-0 border-emerald-400 shadow-md' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
          <div className="w-20 shrink-0 text-center">
            <span className="bg-emerald-600 text-white font-black text-xl px-4 py-2 rounded-xl">사례 2</span>
          </div>
          <div className="flex-1 px-6">
            <h4 className="text-2xl font-black text-gray-800 mb-2">고지위반과 사고 간 인과관계 유무</h4>
            <p className="text-lg text-gray-600 font-medium">'간경화' 진단/치료 사실을 숨기고 상해보험 가입. 1년 후 <strong>교통사고로 사망</strong>.</p>
          </div>
          <div className="w-72 shrink-0 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
            <p className="text-emerald-700 font-black text-lg">일부 인정 (사망보험금 지급)</p>
            <p className="text-sm text-gray-600 mt-1 font-bold">병력과 사고 간 인과관계 없음 입증</p>
          </div>
        </div>

        {/* CASE 3 */}
        <div className={`bg-white border-2 border-gray-200 rounded-2xl p-6 flex items-center shadow-sm transition-all duration-500 ${step >= 3 ? 'opacity-100 translate-x-0 border-purple-400 shadow-md' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
          <div className="w-20 shrink-0 text-center">
            <span className="bg-purple-600 text-white font-black text-xl px-4 py-2 rounded-xl">사례 3</span>
          </div>
          <div className="flex-1 px-6">
            <h4 className="text-2xl font-black text-gray-800 mb-2">설계사의 고지방해 및 부실안내 분쟁</h4>
            <p className="text-lg text-gray-600 font-medium">고객이 구두로 용종 수술을 알렸으나, 설계사가 <strong>"가벼운 시술이니 기재 안 해도 됨"</strong> 유도.</p>
          </div>
          <div className="w-72 shrink-0 bg-purple-50 border border-purple-200 p-4 rounded-xl text-center">
            <p className="text-purple-700 font-black text-lg">손해배상책임 인정</p>
            <p className="text-sm text-gray-600 mt-1 font-bold">계약은 해지되나 설계사 과실로 배상</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 8: 3.N.5 간편보험 구조 및 전략
export function SlideCh7() {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="text-center shrink-0 mb-2">
        <h2 className="text-4xl font-black text-gray-900">3.N.5 간편가입보험 구조 및 세분화 전략</h2>
        <p className="text-xl text-gray-500 mt-3 font-medium">과거와 달리 <strong className="text-blue-600">N의 값이 세분화</strong>되어 병력자도 거절 없이 맞춤 설계가 가능합니다.</p>
      </div>

      <div className="flex justify-between gap-6 shrink-0">
        <div className="flex-1 bg-blue-50 border border-blue-200 p-8 rounded-3xl text-center shadow-sm relative overflow-hidden">
          <span className="text-7xl font-black text-blue-600 block mb-4">3</span>
          <p className="text-2xl font-bold text-gray-800">3개월 이내</p>
          <p className="text-base text-gray-500 mt-2 font-medium bg-white py-1.5 rounded-lg border border-blue-100 mx-4">입원 / 수술 / 추가검사 소견</p>
        </div>
        <div className="flex-1 bg-emerald-50 border border-emerald-300 p-8 rounded-3xl text-center shadow-lg transform scale-105 relative z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold px-4 py-1 rounded-full text-sm">핵심 유동 변수</div>
          <span className="text-7xl font-black text-emerald-600 block mb-4 animate-pulse">N</span>
          <p className="text-2xl font-bold text-gray-800">N년 이내 (1~5년)</p>
          <p className="text-base text-gray-500 mt-2 font-medium bg-white py-1.5 rounded-lg border border-emerald-100 mx-4">질병·사고 입원 및 수술</p>
        </div>
        <div className="flex-1 bg-purple-50 border border-purple-200 p-8 rounded-3xl text-center shadow-sm relative overflow-hidden">
          <span className="text-7xl font-black text-purple-600 block mb-4">5</span>
          <p className="text-2xl font-bold text-gray-800">5년 이내</p>
          <p className="text-base text-gray-500 mt-2 font-medium bg-white py-1.5 rounded-lg border border-purple-100 mx-4">중대질환 진단 / 입원 / 수술</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex-1 flex flex-col justify-center min-h-0">
        <h4 className="text-2xl font-black text-gray-800 mb-6 text-center">N값 세분화에 따른 맞춤 인수 라인업</h4>
        <div className="grid grid-cols-5 gap-3 h-full">
          {[
            { n: '1', title: '3.1.5', desc: '가입 문턱 가장 낮음 (인수 폭 최대)' },
            { n: '2', title: '3.2.5', desc: '2년 경과 시 3.1.5 대비 보험료 절감' },
            { n: '3', title: '3.3.5', desc: '가장 표준적인 간편 플랜 (계약 비중 최고)' },
            { n: '4', title: '3.4.5', desc: '4년 무사고 시 추가 할인 혜택 부여' },
            { n: '5', title: '3.5.5', desc: '5년 무사고 시 건강체 수준의 저렴한 보험료' },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col items-center text-center justify-center hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
              <span className="text-xl font-black text-emerald-600 mb-2">{item.title}</span>
              <p className="text-sm text-gray-700 font-bold leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// SLIDE 9: 현장 영업 성공 체크리스트
export function SlideCh8() {
  return (
    <div className="h-full flex flex-col justify-center space-y-8">
      <div className="text-center shrink-0">
        <h2 className="text-4xl font-black text-gray-900">현장 영업 성공 체크리스트</h2>
        <p className="text-xl text-gray-500 mt-3 font-medium">신뢰받는 금융전문가로서의 첫걸음은 철저한 고지의무 준수에서 시작됩니다.</p>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-3xl p-10 shadow-sm space-y-6 overflow-y-auto">
        <div className="flex items-start gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-colors border border-transparent hover:border-blue-100">
          <CheckCircle2 className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
          <div>
            <h4 className="text-2xl font-black text-gray-800 mb-2">1:1 정독 작성</h4>
            <p className="text-lg text-gray-600 font-medium">청약서 질문표(최근 3개월, N년, 5년)를 고객과 함께 한 줄씩 읽으며 <strong>직접 체크</strong>하도록 안내합니다.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-colors border border-transparent hover:border-blue-100">
          <CheckCircle2 className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
          <div>
            <h4 className="text-2xl font-black text-gray-800 mb-2">병력 일자 정확 파악</h4>
            <p className="text-lg text-gray-600 font-medium">수술·입원 <strong>퇴원일자</strong>를 날짜 단위로 확인하여 가장 유리한 N값(3.1.5~3.5.5)을 조준 설계합니다.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-colors border border-transparent hover:border-blue-100">
          <CheckCircle2 className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
          <div>
            <h4 className="text-2xl font-black text-gray-800 mb-2">건강검진 소견서 점검</h4>
            <p className="text-lg text-gray-600 font-medium">최근 3개월 내 받은 건강검진 결과지상 <strong>'재검사/추가검사 소견' 유무</strong>를 반드시 확인합니다.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-colors border border-transparent hover:border-blue-100">
          <CheckCircle2 className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
          <div>
            <h4 className="text-2xl font-black text-gray-800 mb-2">구두 전달 한계 인지</h4>
            <p className="text-lg text-gray-600 font-medium"><strong>"저에게 말씀하신 내용은 청약서 서면에 적히지 않으면 효력이 없다"</strong>는 점을 명확히 전달하여 분쟁을 차단합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}