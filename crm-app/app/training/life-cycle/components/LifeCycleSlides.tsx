"use client";

import { PlaneTakeoff, HelpCircle, Home, Utensils, TrendingUp, PieChart, ShieldCheck, Building, Quote, HeartPulse, Stethoscope } from "lucide-react";

// SLIDE 1: 대문
export function Slide1() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-10 py-4 bg-blue-50 text-blue-700 rounded-full font-bold text-xl tracking-widest z-10">
      사내 마스터 교육 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8 z-10 tracking-tight">
        라이프사이클 및<br />
        <span className="text-blue-600">3대 자산 교육</span>
      </h1>
      <p className="text-3xl text-gray-500 mt-6 font-medium z-10">살아가며 꼭 필요한 금융지식</p>
    </div>
  );
}

// SLIDE 2: 스토리
export function Slide2() {
  return (
    <div className="h-full flex flex-col justify-center gap-10 py-4">
      
      <div className="grid grid-cols-2 gap-12 items-center flex-1">
        <div className="flex justify-center items-center">
          <div className="bg-slate-900 rounded-full w-80 h-80 flex items-center justify-center border-[8px] border-slate-100 shadow-2xl relative">
            <PlaneTakeoff className="w-32 h-32 text-blue-500" />
          </div>
        </div>
        <div className="space-y-6">
          <p className="text-xl text-gray-600 font-medium leading-relaxed">
            매달 꼬박꼬박 나오는 안정적인 월급은 달콤했습니다. 하지만 어느 순간 깨달았습니다. 그 안정은 결국 <strong className="text-blue-600">"정해진 미래의 한계"</strong>였다는 것을요.
          </p>
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-sm mt-6 relative">
            <Quote className="absolute -top-4 -left-4 w-10 h-10 text-blue-200 fill-current" />
            <p className="text-xl text-slate-700 font-bold leading-relaxed">
              <br/>"여러분의 소득은 이제 타인에 의해 재단당하지 않습니다."<br/><br/>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 3: 라이프사이클 곡선
export function Slide3() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center shadow-sm">
          <div className="text-sm text-blue-700 font-bold mb-1">[30~60세] 중견기업 30년 저축액</div>
          <div className="text-2xl text-gray-900 font-black mb-1">+ 3억 6,000만 원</div>
          <div className="text-[11px] text-gray-500">(월평균 수입 400만 - 생활비 300만 = 100만 저축)</div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center shadow-sm">
          <div className="text-sm text-red-700 font-bold mb-1">[60~100세] 40년 필요 노후자금</div>
          <div className="text-2xl text-gray-900 font-black mb-1">- 14억 4,000만 원</div>
          <div className="text-[11px] text-gray-500">(부부 적정 노후생활비 월 300만 유지 기준)</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl text-center shadow-sm text-white flex flex-col justify-center">
          <div className="text-sm text-slate-300 font-bold mb-1">확정된 노후 적자</div>
          <div className="text-3xl text-red-400 font-black">- 10억 8,000만 원</div>
        </div>
      </div>
      <p className="text-[10px] text-right text-gray-400 font-bold -mt-4">*근거: 통계청 가계동향조사 및 국민연금공단 노후생활비 통계</p>

      {/* SVG 그래프 영역 */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-[220px] relative shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 1100 230" preserveAspectRatio="none">
            {/* Base lines */}
            <line x1="80" y1="200" x2="1050" y2="200" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="80" y1="20" x2="80" y2="200" stroke="#94a3b8" strokeWidth="2"/>
            {/* Markers */}
            <line x1="350" y1="20" x2="350" y2="200" stroke="#cbd5e1" strokeDasharray="8,5"/>
            <line x1="700" y1="20" x2="700" y2="200" stroke="#cbd5e1" strokeDasharray="8,5"/>
            
            {/* Deficit Area */}
            <path d="M 700 110 Q 850 70, 1050 20 L 1050 200 L 700 200 Z" fill="#fee2e2"/>
            
            {/* Curves */}
            <path d="M 80 160 Q 350 140, 700 110 Q 850 70, 1050 20" fill="none" stroke="#ef4444" strokeWidth="5"/>
            <path d="M 80 200 L 350 130 Q 525 50, 700 110 L 700 200 L 1050 200" fill="none" stroke="#3b82f6" strokeWidth="5"/>
            
            {/* Labels */}
            <text x="75" y="225" fontSize="14" fill="#64748b">0세</text>
            <text x="310" y="225" fontSize="16" fontWeight="bold" fill="#0f172a">30세(소득시작)</text>
            <text x="660" y="225" fontSize="16" fontWeight="bold" fill="#ef4444">60세(은퇴/소득절벽)</text>
            <text x="960" y="45" fontSize="18" fontWeight="bold" fill="#ef4444">소비 곡선</text>
            <text x="730" y="185" fontSize="18" fontWeight="bold" fill="#3b82f6">수입 곡선</text>
            <text x="800" y="130" fontSize="22" fontWeight="bold" fill="#be123c">🚨 노후 적자 구간</text>
        </svg>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-2 flex gap-4 items-start shadow-sm">
        <Quote className="w-8 h-8 text-blue-400 shrink-0" />
        <div>
          <p className="text-xl font-black text-gray-900 mb-2">"60살 이후 우리의 소득이 끊긴다고 우리의 삶이 끊기는가?"</p>
          <p className="text-gray-600 font-bold leading-relaxed">
            아니다. 잘 곳도 필요하고 밥도 먹어야 한다.<br/>
            우리는 <strong className="text-red-600">우리가 돈을 버는 기간에 우리의 삶에 안주하면서 산다.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 4: 현실 직시
export function Slide4() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <h2 className="text-4xl font-black text-gray-900">소득이 끊겨도 삶은 멈추지 않는다</h2>
      
      <div className="grid grid-cols-2 gap-8 flex-1 mt-4">
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col">
          <h3 className="text-3xl font-black text-gray-900 mb-6 pb-4 border-b border-slate-200">30년 소득의 굴레</h3>
          <p className="text-xl text-gray-600 font-bold mb-8">
            우리는 돈을 버는 구간에 안주하며 삽니다.<br/>당장 월급이 들어오기 때문입니다.
          </p>
          <ul className="space-y-6 text-xl font-semibold text-slate-700 flex-1">
            <li className="flex items-center gap-4"><HelpCircle className="w-6 h-6 text-blue-500 shrink-0"/> 60세 이후, 소득이 끊기면 내 삶도 끝날까요?</li>
            <li className="flex items-center gap-4"><Home className="w-6 h-6 text-blue-500 shrink-0"/> 여전히 잠잘 곳이 필요합니다.</li>
            <li className="flex items-center gap-4"><Utensils className="w-6 h-6 text-blue-500 shrink-0"/> 여전히 매일 밥을 먹어야 합니다.</li>
          </ul>
        </div>
        
        <div className="p-8 flex flex-col justify-center">
          <h3 className="text-3xl font-black text-gray-900 mb-8">한정된 30년 안에 가능합니까?</h3>
          <div className="space-y-4">
            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 text-xl font-bold text-gray-800">
              <span className="text-3xl">🏠</span> 집은 어떻게 마련할 것인가?
            </div>
            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 text-xl font-bold text-gray-800">
              <span className="text-3xl">💍</span> 결혼과 자녀 양육비는?
            </div>
            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 text-xl font-bold text-gray-800">
              <span className="text-3xl">🚗</span> 자동차 유지비와 각종 세금은?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 5: 인플레이션
export function Slide5() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      
      <div className="grid grid-cols-2 gap-12 mt-6 flex-1 items-center">
        <div className="relative flex flex-col items-center text-center">
          <TrendingUp className="w-40 h-40 text-blue-500 mb-6" />
          <h3 className="text-3xl font-black text-gray-900">짜장면 그릇 값의 진실</h3>
          <div className="absolute -top-6 right-0 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-lg rotate-12 shadow-xl border-4 border-white z-10">
            🔥 SK하이닉스 성과급도<br/>물가 앞에 녹아내립니다!
          </div>
        </div>
        
        <div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-center border-collapse text-lg">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 font-bold">시대</th>
                  <th className="p-4 font-bold border-x border-slate-700">짜장면 한 그릇</th>
                  <th className="p-4 font-bold">비고</th>
                </tr>
              </thead>
              <tbody className="font-medium text-gray-700">
                <tr className="border-b border-gray-200">
                  <td className="p-5">1990년대</td>
                  <td className="p-5 border-x border-gray-200">1,000원</td>
                  <td className="p-5 text-gray-500">과거</td>
                </tr>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <td className="p-5 font-bold text-gray-900">현재</td>
                  <td className="p-5 border-x border-blue-200 font-black text-blue-700 text-2xl">10,000원</td>
                  <td className="p-5 font-bold text-blue-700">10배 상승</td>
                </tr>
                <tr className="bg-red-50 text-red-700 font-bold">
                  <td className="p-5">30년 뒤 미래</td>
                  <td className="p-5 border-x border-red-200 text-2xl font-black">50,000원</td>
                  <td className="p-5">예측 수치</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-8 font-black text-center text-2xl text-gray-900 leading-relaxed bg-gray-100 p-4 rounded-xl">
            밥값만 계산해도 미래는 상상 이상입니다.<br/>우리는 지금 안주하고 있지는 않습니까?
          </p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 6: 간병비 리스크
export function Slide6() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <h2 className="text-4xl font-black text-gray-900">62년생 친구 아버지</h2>
      
      <div className="grid grid-cols-2 gap-12 mt-10 items-center flex-1">
        <div className="text-center">
          <div className="text-8xl font-black text-red-600 tracking-tighter drop-shadow-sm">
            5,000,000
          </div>
          <div className="text-2xl font-black text-gray-900 mt-6 bg-red-50 inline-block px-6 py-2 rounded-full border border-red-100">
            매월 고정 간병비 (원)
          </div>
        </div>
        
        <div className="bg-red-50 border-l-[8px] border-red-600 p-10 shadow-sm rounded-r-3xl">
          <p className="text-2xl font-black text-gray-900 mb-6 leading-relaxed">
            "30년 성공의 결과가<br/>단 2년 만에 청산되었습니다."
          </p>
          <p className="text-xl text-gray-700 font-medium leading-relaxed">
            탄탄하게 사업을 일구셨던 아버님도, 예기치 못한 질병 앞에서는 무방비였습니다. 숨만 쉬어도 나가는 병원비와 매월 500만 원의 간병비가 평생 모은 자산을 순식간에 집어삼켰습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 7: 3대 자산
export function Slide7() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <h2 className="text-3xl font-black text-gray-900">우리가 설계해야 할 3대 자산</h2>
      
      <div className="grid grid-cols-3 gap-8 flex-1">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center border-t-[12px] border-t-blue-600 shadow-sm flex flex-col items-center justify-center">
          <PieChart className="w-16 h-16 text-blue-600 mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-4">목적 자산 (투자)</h3>
          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            특정 목적을 가지고 모으는 돈<br/>(은행예금, 단기 저축, 자동차/결혼)
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 text-center border-t-[12px] border-t-emerald-500 shadow-xl transform scale-105 z-10 flex flex-col items-center justify-center">
          <ShieldCheck className="w-16 h-16 text-emerald-600 mb-6" />
          <h3 className="text-2xl font-black text-emerald-800 mb-4">보장 자산 (보험)</h3>
          <p className="text-lg text-emerald-700 font-bold leading-relaxed">
            내 인생의 RISK를 대비하는 돈<br/>(의료비, 간병비 파산 방어)
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center border-t-[12px] border-t-purple-600 shadow-sm flex flex-col items-center justify-center">
          <Building className="w-16 h-16 text-purple-600 mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-4">노후 자산 (연금)</h3>
          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            은퇴 후 써먹을 수 있는 자산<br/>(국민연금, 주택, 개인연금)
          </p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 8: 시뮬레이션 A/B
export function Slide8() {
  return (
    <div className="h-full flex flex-col justify-center gap-6">
      <h2 className="text-3xl font-black text-gray-900">월 100만 원 저축의 5년 뒤 승자는?</h2>
      <p className="text-1xl font-bold text-gray-500">표면적인 현금 보유량의 착시와 보장 자산(방화벽) 분산 투자의 위력 비교</p>
      
      <div className="grid grid-cols-2 gap-8 flex-1">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
          <h3 className="text-2xl font-black text-slate-700 border-b-2 border-slate-100 pb-4 mb-6">👤 A의 선택 (순수 100% 저축)</h3>
          <ul className="space-y-5 text-lg text-gray-700 font-medium">
            <li><strong className="text-gray-900">투자 성향:</strong> 매달 100만 원을 은행 예적금 등 순수 '목적 자산'에만 전액 투입함.</li>
            <li><strong className="text-gray-900">보험에 대한 인식:</strong> "보험은 소멸성 비용이다. 안 아프면 버리는 돈이니 그 돈으로 차라리 예금을 더 하겠다."</li>
            <li className="p-4 bg-slate-50 rounded-xl mt-4"><strong className="text-blue-600 block mb-1">5년 뒤 표면적 결과:</strong> 이자를 포함하여 B보다 더 많은 현금(원금 6,000만 원+)을 통장에 보유함.</li>
          </ul>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8 shadow-md flex flex-col">
          <h3 className="text-2xl font-black text-blue-700 border-b-2 border-blue-100 pb-4 mb-6">👤 B의 선택 (90% 저축 + 10% 방어)</h3>
          <ul className="space-y-5 text-lg text-blue-900 font-medium">
            <li><strong className="text-blue-800">투자 성향:</strong> 매달 90만 원만 저축하고, 나머지 10만 원은 '보장 자산(실비, 암, 간병보험)'에 선제적으로 분산 투자함.</li>
            <li><strong className="text-blue-800">보험에 대한 인식:</strong> "내가 모은 자산을 지키기 위한 최소한의 리스크 헷지(Hedge) 비용이다."</li>
            <li className="p-4 bg-white rounded-xl mt-4"><strong className="text-red-500 block mb-1">5년 뒤 표면적 결과:</strong> A보다 통장의 순수 현금 보유량은 600만 원 가량 적음.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// SLIDE 9: 시뮬레이션 결과
export function Slide9() {
  return (
    <div className="h-full flex flex-col justify-center gap-6">
      <h2 className="text-3xl font-black text-gray-900">중증 리스크 발생</h2>
      <p className="text-1xl font-bold text-gray-500">예기치 못한 의료 재난 앞에서 극명하게 갈리는 목적 자산의 생존 여부</p>
      
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white mb-6">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-900 text-white text-center">
            <tr>
              <th className="p-4 font-bold w-1/5">리스크 발생</th>
              <th className="p-4 font-bold w-2/5 border-x border-slate-700">A의 결말 (저축 올인)</th>
              <th className="p-4 font-bold w-2/5">B의 결말 (보장 자산 구축)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-6 bg-red-50 border-r border-gray-200 text-center font-black text-red-700 text-lg">
                <HeartPulse className="w-10 h-10 mx-auto mb-2 text-red-600"/>
                중증 질환 발병<br/><span className="text-sm">(뇌출혈 / 폐암)</span>
              </td>
              <td className="p-6 bg-red-50/30 border-r border-gray-200">
                <strong className="text-red-700 text-xl block mb-3">[완전한 파산 및 도미노 붕괴]</strong>
                <span className="text-gray-700 font-medium leading-relaxed">
                  5년 동안 피땀 흘려 모은 6천만 원 이상의 목적 자산(적금)을 그날 즉시 전액 해지하여 수술비, 비급여 항암제, 장기 간병비로 원무과에 털어 넣습니다.<br/>
                  <strong className="text-red-600 block mt-2">모은 돈은 '0'이 되고 가계는 빚더미에 앉습니다.</strong>
                </span>
              </td>
              <td className="p-6 bg-blue-50/50">
                <strong className="text-blue-700 text-xl block mb-3">[자산의 완벽한 수호 및 진정한 승리]</strong>
                <span className="text-gray-700 font-medium leading-relaxed">
                  미리 준비해 둔 실비, 암, 간병인 보험(보장 자산)이 작동하여 치료비와 생활비 명목으로 수천만 원의 현금이 지급됩니다.<br/>
                  <strong className="text-blue-700 block mt-2">👉 B가 5년 동안 모아둔 목적 자산(적금 5,400만 원)은 단 1원도 다치지 않고 온전히 보존됩니다.</strong>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-md text-center font-black text-2xl tracking-wide">
        "보험은 불필요한 소비재가 아닙니다. 내 소중한 '목적 자산'을 지켜내는 가장 완벽한 방패입니다."
      </div>
    </div>
  );
}

// SLIDE 10: 방화벽 메커니즘
export function Slide10() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <p className="text-xl font-bold text-gray-500">재무설계의 완성은 자산 간의 연쇄 붕괴를 차단하는 잠금장치(Lock-in)에 있습니다</p>
      
      <div className="bg-slate-50 border-l-[8px] border-blue-600 p-10 rounded-r-3xl shadow-sm flex-1 flex flex-col justify-center">
        <h3 className="text-3xl font-black text-blue-700 mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" /> 보장 자산은 '방화벽(Firewall)'이다
        </h3>
        <p className="text-xl text-gray-700 font-medium leading-relaxed mb-6">
          우리가 고객에게 전달해야 할 3대 자산의 핵심 로직은 단 하나입니다.
        </p>
        <p className="text-2xl font-black text-gray-900 leading-relaxed mb-8 pl-6 border-l-4 border-slate-300 bg-white p-6 rounded-r-xl shadow-sm">
          "목적 자산(자동차, 결혼, 집)이나 노후 자산(연금)으로 정성껏 모은 자산들이, 예기치 못한 의료비 지출로 인해 서로를 침범하고 깎아먹지 않도록 <span className="text-blue-600">'보장 자산'이라는 단단한 방화벽</span>을 세우는 일입니다."
        </p>
        <p className="text-xl text-gray-700 font-medium leading-relaxed">
          고객이 매달 내는 보험료는 소모성 비용이 아니라, 고객의 인생 전체 자산(투자금과 연금)이 병원 원무과로 직행하는 것을 막아주는 가장 저렴하고 확실한 잠금장치(Lock-in)입니다.
        </p>
      </div>
    </div>
  );
}

// SLIDE 11: 금융 컨설팅의 본질
export function Slide11() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4 items-center text-center">
      <Stethoscope className="w-20 h-20 text-blue-500 mb-6" />
      <h2 className="text-5xl font-black text-gray-900 leading-tight mb-8">
        "우리는 최고(最高)가 아니어도<br/>
        <span className="text-blue-600 border-b-4 border-blue-600 pb-2">최선(最善)</span>의 선택을 돕습니다"
      </h2>
      <p className="text-2xl text-gray-500 font-bold leading-relaxed max-w-3xl">
        고객의 라이프사이클 예산 안에서,<br/>
        리스크를 가장 튼튼하게 막아줄 수 있는 대안을<br/>
        조립하는 전문가입니다.
      </p>
    </div>
  );
}

// SLIDE 12: 마무리
export function Slide12() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black rounded-3xl text-white">
      <h2 className="text-5xl font-black text-blue-400 mb-4 tracking-wider">
        Step Over the Edge
      </h2>
      <p className="text-4xl font-bold leading-relaxed">
        "때로는 선을 넘어봐야<br/>경계가 어디인지 알 수 있다"
      </p>
      <p className="text-xl text-slate-400 font-medium italic mt-6">
        - Sometimes you have to step over the edge to know where it is. -
      </p>
      <div className="text-lg text-blue-500 font-bold mt-12 tracking-widest uppercase">
        Damien Hirst
      </div>
    </div>
  );
}