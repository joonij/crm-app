"use client";

import { ShieldCheck, HeartPulse, FileText, CheckCircle2, FileCheck, Car, Flame, Users } from "lucide-react";

// SLIDE 1: 대문
export function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-10 py-4 bg-blue-50 text-blue-700 rounded-full font-bold text-xl tracking-widest z-10">
        마스터 교육 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8 z-10 tracking-tight">
        보장성 상품 교육<br />
        <span className="text-blue-600">보험가입 가이드라인</span>
      </h1>
      <p className="text-3xl text-gray-500 mt-6 font-medium z-10">병원에서 일어나는 일로 설계하는, 흔들리지 않는 보험 구성법</p>
    </div>
  );
}

// SLIDE 2: Divider
export function SlideCh1() {
  return (
    <div className="h-full flex flex-col justify-center gap-10 text-center items-center">
      <h2 className="text-6xl font-black text-gray-900 leading-tight">보험 시장의 구조를<br/>먼저 이해합니다</h2>
      <div className="w-24 h-2 bg-blue-600 rounded-full mt-4"></div>
    </div>
  );
}

// SLIDE 3: Overview
export function SlideCh2() {
  return (
    <div className="h-full flex flex-col justify-center gap-2">
      <div className="text-center">
        <p className="text-2xl text-gray-500 font-medium">국내 모든 보험사는 크게 생명보험사와 손해보험사, 두 축으로 나뉩니다.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-10 items-center relative mt-6">
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-red-500 font-black text-3xl border-4 border-red-500 w-20 h-20 rounded-full flex items-center justify-center z-10 shadow-lg">
          VS
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-12 flex flex-col shadow-sm items-center text-center h-full justify-center">
          <div className="bg-blue-600 text-white p-6 rounded-full mb-8 shadow-lg">
            <HeartPulse className="w-16 h-16" />
          </div>
          <h4 className="text-4xl font-black text-blue-900 mb-6">생명보험사</h4>
          <p className="text-2xl text-blue-800 leading-relaxed font-bold">사람의 생존·사망을 보장의 중심에 두는 회사</p>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-12 flex flex-col shadow-sm items-center text-center h-full justify-center">
          <div className="bg-red-500 text-white p-6 rounded-full mb-8 shadow-lg">
            <ShieldCheck className="w-16 h-16" />
          </div>
          <h4 className="text-4xl font-black text-red-900 mb-6">손해보험사</h4>
          <p className="text-2xl text-red-800 leading-relaxed font-bold">사고·질병으로 인한 손해를 보장의 중심에 두는 회사</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 4: Why the Price Gap
export function SlideCh3() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">

      <div className="flex justify-between items-center gap-4 mt-4">
        {[
          { step: "STEP 1", txt: "실손보험 최초 판매", color: "text-blue-600" },
          { step: "STEP 2", txt: "손보사 가입률 증가", color: "text-blue-600" },
          { step: "STEP 3", txt: "가입률에 따른 환자수 증가", color: "text-blue-600" },
          { step: "STEP 4", txt: "손해율 상승", color: "text-red-500" },
          { step: "STEP 5", txt: "보험료 인상에 기여", color: "text-red-600" }
        ].map((item, idx, arr) => (
          <div key={idx} className="flex-1 flex items-center">
            <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col text-center h-[200px] justify-center p-4">
              <span className="text-teal-600 font-bold tracking-widest mb-4 text-sm">{item.step}</span>
              <span className={`text-xl font-black ${item.color} leading-snug break-keep`}>{item.txt}</span>
            </div>
            {idx < arr.length - 1 && <div className="text-red-500 text-3xl font-black mx-2">›</div>}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-l-8 border-blue-500 p-8 rounded-2xl shadow-sm text-2xl font-medium text-gray-800 mt-6 leading-relaxed">
        <strong className="text-blue-800">기본 설계는 생명보험 중심으로.</strong><br/>
        단, 상해·배상책임·운전자보험처럼 손해보험사만 팔거나 보장이 더 좋은 항목은 적절한 비율로 함께 구성합니다.
      </div>
    </div>
  );
}

// SLIDE 5: Company Compare
export function SlideCh4() {
  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      <div className="text-center shrink-0">
        <p className="text-sm text-gray-400">(설계사 교육용 자료 고객 제공 불가)</p>
        <p className="text-lg text-gray-500 font-medium">홍길동(42세, 남성) 고객님의 생손보 건강(무해지) · 20년납/100세만기, 종신 보험료 비교 (단위: 원)</p>
      </div>
      
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <table className="w-full text-center border-collapse text-[13px] min-w-[1000px] whitespace-nowrap">
          <thead className="bg-gray-900 text-white font-semibold">
            <tr>
              <th className="border border-gray-700 px-3 py-3" rowSpan={2}>보험사</th>
              <th className="border border-gray-700 px-3 py-3" rowSpan={2}>가입금액</th>
              <th className="border border-gray-700 px-3 py-3">미래에셋</th><th className="border border-gray-700 px-3 py-3">KB라이프</th><th className="border border-gray-700 px-3 py-3">DB생명</th><th className="border border-gray-700 px-3 py-3">동양생명</th>
              <th className="border border-gray-700 px-3 py-3">흥국생명</th><th className="border border-gray-700 px-3 py-3">신한라이프</th><th className="border border-gray-700 px-3 py-3">삼성생명</th>
              <th className="border border-gray-700 px-3 py-3">한화생명</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            <tr><td className="border border-gray-200 px-3 py-3 text-left font-bold bg-gray-50">암진단비(유사·소액 제외)</td><td className="border border-gray-200 px-3 py-3 font-bold">3,000</td><td className="border border-gray-200">37,920</td><td className="border border-gray-200">42,600</td><td className="border border-gray-200">38,790</td><td className="border border-gray-200">41,037</td><td className="border border-gray-200">43,830</td><td className="border border-gray-200">42,027</td><td className="border border-gray-200">45,540</td><td className="border border-gray-200">52,530</td></tr>
            <tr><td className="border border-gray-200 px-3 py-3 text-left font-bold bg-gray-50">뇌혈관질환진단비</td><td className="border border-gray-200 px-3 py-3 font-bold">1,000</td><td className="border border-gray-200">10,470</td><td className="border border-gray-200">8,500</td><td className="border border-gray-200">10,790</td><td className="border border-gray-200">11,225</td><td className="border border-gray-200">8,400</td><td className="border border-gray-200">10,320</td><td className="border border-gray-200">11,690</td><td className="border border-gray-200">9,700</td></tr>
            <tr><td className="border border-gray-200 px-3 py-3 text-left font-bold bg-gray-50">허혈성심장질환진단비</td><td className="border border-gray-200 px-3 py-3 font-bold">1,000</td><td className="border border-gray-200">9,230</td><td className="border border-gray-200">6,610</td><td className="border border-gray-200">8,600</td><td className="border border-gray-200">7,266</td><td className="border border-gray-200">7,830</td><td className="border border-gray-200">9,830</td><td className="border border-gray-200">8,540</td><td className="border border-gray-200">8,350</td></tr>
            <tr className="bg-blue-100 font-bold text-blue-900"><td className="border border-blue-200 px-3 py-3 text-left">합계</td><td className="border border-blue-200">-</td><td className="border border-blue-200">57,620</td><td className="border border-blue-200">57,710</td><td className="border border-blue-200">58,180</td><td className="border border-blue-200">59,528</td><td className="border border-blue-200">60,060</td><td className="border border-blue-200">62,177</td><td className="border border-blue-200">65,770</td><td className="border border-blue-200">70,580</td></tr>
          </tbody>
        </table>

        <table className="w-full text-center border-collapse text-[13px] min-w-[1000px] whitespace-nowrap">
          <thead className="bg-gray-900 text-white font-semibold">
            <tr>
              <th className="border border-gray-700 px-3 py-3" rowSpan={2}>보험사</th>
              <th className="border border-gray-700 px-3 py-3" rowSpan={2}>가입금액</th>
              <th className="border border-gray-700 px-3 py-3">DB손해</th><th className="border border-gray-700 px-3 py-3">농협손해</th>
              <th className="border border-gray-700 px-3 py-3">메리츠화재</th><th className="border border-gray-700 px-3 py-3">현대해상화재</th><th className="border border-gray-700 px-3 py-3">흥국화재</th>
              <th className="border border-gray-700 px-3 py-3">삼성화재</th><th className="border border-gray-700 px-3 py-3">KB손해</th><th className="border border-gray-700 px-3 py-3">한화손해</th>
              
            </tr>
          </thead>
          <tbody className="text-gray-800">
            <tr><td className="border border-gray-200 px-3 py-3 text-left font-bold bg-gray-50">암진단비(유사·소액 제외)</td><td className="border border-gray-200 px-3 py-3 font-bold">3,000</td><td className="border border-gray-200">49,320</td><td className="border border-gray-200">53,460</td><td className="border border-gray-200">51,300</td><td className="border border-gray-200">50,565</td><td className="border border-gray-200">53,340</td><td className="border border-gray-200">55,590</td><td className="border border-gray-200">52,800</td><td className="border border-gray-200">54,810</td></tr>
            <tr><td className="border border-gray-200 px-3 py-3 text-left font-bold bg-gray-50">뇌혈관질환진단비</td><td className="border border-gray-200 px-3 py-3 font-bold">1,000</td><td className="border border-gray-200">15,640</td><td className="border border-gray-200">13,500</td><td className="border border-gray-200">14,440</td><td className="border border-gray-200">14,420</td><td className="border border-gray-200">15,000</td><td className="border border-gray-200">13,280</td><td className="border border-gray-200">15,400</td><td className="border border-gray-200">15,900</td></tr>
            <tr><td className="border border-gray-200 px-3 py-3 text-left font-bold bg-gray-50">허혈성심장질환진단비</td><td className="border border-gray-200 px-3 py-3 font-bold">1,000</td><td className="border border-gray-200">6,430</td><td className="border border-gray-200">7,530</td><td className="border border-gray-200">9,070</td><td className="border border-gray-200">11,330</td><td className="border border-gray-200">9,000</td><td className="border border-gray-200">9,310</td><td className="border border-gray-200">10,690</td><td className="border border-gray-200">12,000</td></tr>
            <tr className="bg-red-100 font-bold text-red-900"><td className="border border-red-200 px-3 py-3 text-left">합계</td><td className="border border-red-200">-</td><td className="border border-blue-200">71,390</td><td className="border border-blue-200">74,490</td><td className="border border-red-200">74,810</td><td className="border border-red-200">76,315</td><td className="border border-red-200">77,340</td><td className="border border-red-200">78,180</td><td className="border border-red-200">78,890</td><td className="border border-red-200">82,710</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SLIDE 6: Step 5 사망
export function SlideCh5() {
  return (
    <div className="h-full flex flex-col justify-center">
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-10 flex flex-col shadow-sm">
          <p className="text-blue-600 font-bold text-lg">생명보험사 →</p>
          <span className="text-3xl font-black text-blue-900 mb-8">일반사망</span>
          <ul className="text-xl font-bold text-gray-800">
            <li>• 사망 여부만 판단</li>
            <li>• 자살도 보상</li>
          </ul>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-10 flex flex-col shadow-sm">
          <p className="text-red-600 font-bold text-lg">손해보험사 →</p>
          <ul className="text-xl font-bold text-gray-800 grid grid-cols-2">
            <li className="text-3xl font-black text-red-900 mb-8">상해사망</li>
            <li className="text-3xl font-black text-red-900 mb-8">질병사망</li>
          </ul>
          <ul className="space-y-4 text-xl font-bold text-gray-800">
            <li>• '급격·우연·외래' 요건 충족해야 인정</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-xl mt-4 border border-gray-800">
        <h5 className="text-emerald-400 font-black text-2xl mb-6">실제 분쟁 사례 · 산행 중 실종, 1년 뒤 추락사로 발견</h5>
        <ul className="space-y-3 text-lg font-medium text-gray-300">
          <li>→ 타살 아닌 추락사로 판명 (상해사망 보험금 청구)</li>
          <li>→ 발견 장소가 정식 등산로가 아니었다는 이유로 보험사 지급 거절</li>
          <li><span className="text-red-400">→ '급격·우연한 외래의 사고'가 아니라 위험을 알고 간 것으로 판단 (손보 요건 미충족)</span></li>
        </ul>
      </div>

      <div className="text-emerald-700 p-6 text-center text-2xl font-black">
        사망을 준비한다면, 요건을 덜 따지는 생명보험사가 유리합니다.
      </div>
    </div>
  );
}

// SLIDE 7: Design Framework
export function SlideCh6() {
  return (
    <div className="h-full flex flex-col justify-center gap-4">
      <div className="text-center">
        <p className="text-4xl text-gray-500 font-medium">우리가 아플 때 겪는 다섯 단계를 그대로 보장 항목에 대입합니다.</p>
      </div>

      <div className="flex justify-between items-center gap-4 mt-8">
        {[
          { step: "STEP 1", name: "진료", desc: "실비보험", color: "bg-blue-600" },
          { step: "STEP 2", name: "3대질환", desc: "가입전략", color: "bg-emerald-600" },
          { step: "STEP 3", name: "수술", desc: "질병·상해 / 1~5종", color: "bg-orange-500" },
          { step: "STEP 4", name: "입원", desc: "입원일당", color: "bg-purple-600" }
        ].map((item, idx, arr) => (
          <div key={idx} className="flex-1 flex items-center">
            <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-md overflow-hidden flex flex-col text-center h-[260px]">
              <div className={`${item.color} text-white p-6 flex flex-col gap-2`}>
                <span className="text-sm font-bold tracking-widest opacity-80">{item.step}</span>
                <span className="text-2xl font-black">{item.name}</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 text-xl font-bold text-gray-700 bg-gray-50">
                {item.desc}
              </div>
            </div>
            {idx < arr.length - 1 && <div className="text-red-500 text-3xl font-black mx-2">→</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// SLIDE 8: Step 1 진료
export function SlideCh7() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">
      
      <div className="flex gap-10 mt-8">
        <div className="flex-1 bg-white border-2 border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[350px]">
          <div className="bg-gray-800 text-white p-6 text-center font-black text-2xl">2017년 이전</div>
          <div className="p-10 space-y-6 text-2xl font-bold text-gray-700 flex-1 bg-gray-50 flex flex-col justify-center">
            <div className="flex justify-between border-b border-gray-300 pb-6"><span>손해보험사</span><span className="text-gray-900 font-black">통원한도 25만원</span></div>
            <div className="flex justify-between"><span>생명보험사</span><span className="text-gray-900 font-black">통원한도 20만원</span></div>
          </div>
        </div>
        
        <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[350px]">
          <div className="bg-blue-600 text-white p-6 text-center font-black text-2xl">현재 · 실손의료비보험</div>
          <div className="p-10 space-y-6 text-2xl font-bold text-blue-800 flex-1 flex flex-col justify-center">
            <div className="flex justify-between border-b border-blue-200 pb-6"><span>진료비 보상받는</span><span className="text-blue-900 font-black">유일한 보험</span></div>
            <div className="flex justify-between"><span>생명·손해보험사</span><span className="text-blue-900 font-black">보장 내용 동일</span></div>
          </div>
        </div>
      </div>

      <div className="bg-blue-100 border border-blue-200 text-blue-900 p-6 rounded-2xl text-center shadow-sm text-2xl font-black mt-4">
        포인트: 어느 회사에서 가입하든 실비 보장은 같다 — 가입 여부 자체가 핵심입니다.
      </div>
    </div>
  );
}

// SLIDE 9: Step 2 진단
export function SlideCh8() {
  return (
    <div className="h-full flex flex-col justify-center gap-4">
      <div className="text-center">
        <p className="text-4xl text-gray-500 font-medium">대한민국 성인 주요 사망 원인질환</p>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-4">
        <div className="bg-white border-2 border-red-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="bg-red-500 text-white p-6 text-center font-black text-3xl">01. 암</div>
          <div className="p-10 flex flex-col gap-2 text-2xl font-bold text-red-600 text-center flex-1 justify-center bg-red-50/30">
            <span className="bg-white py-3 rounded-xl border border-red-100 shadow-sm">고액암</span>
            <span className="bg-white py-3 rounded-xl border border-red-100 shadow-sm">일반암</span>
            <span className="bg-white py-3 rounded-xl border border-red-100 shadow-sm">소액암</span>
            <span className="bg-white py-3 rounded-xl border border-red-100 shadow-sm">유사암</span>
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="bg-emerald-500 text-white p-6 text-center font-black text-3xl">02. 뇌질환</div>
          <div className="p-10 flex flex-col gap-6 text-2xl font-bold text-emerald-600 text-center flex-1 justify-center bg-emerald-50/30">
            <span className="bg-white py-3 rounded-xl border border-emerald-100 shadow-sm">뇌혈관질환</span>
            <span className="bg-white py-3 rounded-xl border border-emerald-100 shadow-sm">뇌졸중</span>
            <span className="bg-white py-3 rounded-xl border border-emerald-100 shadow-sm">뇌출혈</span>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="bg-blue-500 text-white p-6 text-center font-black text-3xl">03. 심장질환</div>
          <div className="p-10 flex flex-col gap-6 text-2xl font-bold text-blue-600 text-center flex-1 justify-center bg-blue-50/30">
            <span className="bg-white py-3 rounded-xl border border-blue-100 shadow-sm">허혈성심장질환</span>
            <span className="bg-white py-3 rounded-xl border border-blue-100 shadow-sm">급성심근경색</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 10: 암보험 체크
export function SlideCh9() {
  return (
    <div className="h-full flex flex-col justify-center gap-4">
      <div className="text-center">
        <p className="text-4xl text-gray-500 font-medium">소액암으로 분류되면 진단비가 확 줄어듭니다.</p>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-10 flex flex-col shadow-sm text-center">
          <h4 className="text-3xl font-black text-red-600 mb-6">고액암</h4>
          <p className="text-xl text-gray-800 font-bold leading-relaxed mb-6">뇌암·뼈암·혈액암<br/>백혈병·림프종·조혈계암</p>
          <div className="mt-auto bg-white p-3 rounded-xl border border-red-100 text-red-600 font-bold shadow-sm">폐암·간암·췌장암 아님!</div>
        </div>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-3xl p-10 flex flex-col shadow-sm text-center">
          <h4 className="text-3xl font-black text-gray-900 mb-6">일반암</h4>
          <p className="text-xl text-gray-800 font-bold leading-relaxed mb-6">위암·대장암·폐암<br/>간암·췌장암 등 대부분의 암</p>
          <div className="mt-auto bg-white p-3 rounded-xl border border-gray-200 text-gray-800 font-bold shadow-sm">소액암 포함 여부 확인 필수</div>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-10 flex flex-col shadow-sm text-center">
          <h4 className="text-3xl font-black text-emerald-600 mb-6">소액암</h4>
          <p className="text-xl text-gray-800 font-bold leading-relaxed mb-6">유방암·자궁암<br/>전립선암·방광암 등</p>
          <div className="mt-auto bg-white p-3 rounded-xl border border-emerald-100 text-emerald-700 font-bold shadow-sm">일반암의 20% 수준</div>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-lg text-gray-500 font-medium mb-4">모든 보험사가 동일하게 취급 — 회사 간 차이 없음</p>
        <div className="flex justify-center gap-4 flex-wrap">
          {['유사암', '기타피부암', '갑상선암', '경계성종양', '제자리암'].map(chip => (
            <span key={chip} className="bg-white border-2 border-gray-200 text-gray-800 font-black px-6 py-3 rounded-xl shadow-sm text-lg">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// SLIDE 11: 뇌혈관질환 종류
export function SlideCh10() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">
      
      <div className="grid grid-cols-3 gap-8 mt-8">
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-12 flex flex-col items-center text-center shadow-sm h-[350px] justify-center">
          <div className="bg-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-lg">1</div>
          <h4 className="text-3xl font-black text-emerald-900 mb-6">뇌동맥류</h4>
          <p className="text-xl text-gray-600 font-bold">혈관벽이 약해져 풍선처럼 부풀어 오르는 질환</p>
        </div>
        
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-12 flex flex-col items-center text-center shadow-sm h-[350px] justify-center">
          <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-lg">2</div>
          <h4 className="text-3xl font-black text-blue-900 mb-6">뇌경색</h4>
          <p className="text-xl text-gray-600 font-bold">혈전이 혈관을 막아 혈류가 막히는 허혈성 질환</p>
        </div>
        
        <div className="bg-white border-2 border-red-200 rounded-3xl p-12 flex flex-col items-center text-center shadow-sm h-[350px] justify-center">
          <div className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-lg">3</div>
          <h4 className="text-3xl font-black text-red-900 mb-6">뇌출혈</h4>
          <p className="text-xl text-gray-600 font-bold">혈관이 터져 출혈이 발생하는 질환</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 12: 심근경색 vs 협심증
export function SlideCh11() {
  return (
    <div className="h-full flex flex-col justify-center gap-4">
      <div className="text-center">
        <p className="text-4xl text-gray-500 font-medium">심장질환은 크게 허혈성심장질환과 급성심근경색으로 나뉩니다.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-10 mt-8 max-w-5xl mx-auto w-full">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-12 flex flex-col items-center text-center shadow-sm h-[400px] justify-center">
          <div className="bg-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black mb-8 shadow-lg">협</div>
          <h4 className="text-4xl font-black text-blue-900 mb-6">협심증</h4>
          <p className="text-2xl text-blue-800 font-bold leading-relaxed">대표적인 허혈성심장질환<br/>심장 혈관이 좁아지는 질환</p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-12 flex flex-col items-center text-center shadow-sm h-[400px] justify-center">
          <div className="bg-red-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black mb-8 shadow-lg">심</div>
          <h4 className="text-4xl font-black text-red-900 mb-6">급성심근경색</h4>
          <p className="text-2xl text-red-800 font-bold leading-relaxed">심장 혈관이 꽉 막혀<br/>괴사가 진행되는 질환</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 13: 뇌심혈관 사각지대
export function SlideCh12() {
  return (
    <div className="h-full flex flex-col justify-center gap-4">
      <div className="text-center">
        <p className="text-4xl text-gray-500 font-medium">동맥류처럼 뇌·심장 혈관 밖에서 생기는 질환은 사각지대에 놓입니다.</p>
      </div>

      <div className="flex justify-between items-center gap-4 mt-8">
        <div className="flex-1 bg-white border-2 border-gray-200 rounded-3xl p-8 text-center shadow-sm">
          <h4 className="text-2xl font-black text-gray-900 mb-6">뇌동맥류</h4>
          <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-black border border-emerald-200">뇌혈관특약 보상 가능</span>
        </div>
        <div className="text-4xl text-red-400 font-black">→</div>
        <div className="flex-1 bg-white border-2 border-gray-200 rounded-3xl p-8 text-center shadow-sm">
          <h4 className="text-2xl font-black text-gray-900 mb-6">흉부동맥류</h4>
          <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black border border-red-200">심혈관특약 미보상</span>
        </div>
        <div className="text-4xl text-red-400 font-black">→</div>
        <div className="flex-1 bg-white border-2 border-gray-200 rounded-3xl p-8 text-center shadow-sm">
          <h4 className="text-2xl font-black text-gray-900 mb-6">복부동맥류</h4>
          <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black border border-red-200">어디에도 해당 없음</span>
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-xl mt-6 flex flex-col">
         <div className="text-teal-400 font-bold mb-2 text-lg">해결책</div>
         <h4 className="text-3xl font-black mb-4">순환계질환 특약</h4>
         <p className="text-xl font-medium text-gray-300">뇌·심혈관 외 다른 혈관 질환까지 폭넓게 보완 — 보험점검 2년이 지났다면 가입 여부 재확인 필요</p>
      </div>
    </div>
  );
}

// SLIDE 14: 수술 보장은 두 특약이 서로를 보완한다
export function SlideCh13() {
  return (
    <div className="h-full flex flex-col justify-center gap-4">
      
      <div className="flex items-center gap-8 mt-8">
        <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-3xl p-12 flex flex-col shadow-sm text-center h-[350px] justify-center">
          <h3 className="text-4xl font-black text-blue-900 mb-6">질병·상해수술특약</h3>
          <p className="text-2xl text-gray-800 font-bold mb-4">질병 또는 상해로 인한 수술 보상</p>
          <div className="bg-white p-4 rounded-xl border border-blue-100 mt-4">
            <p className="text-2xl text-red-600 font-bold">치질·요실금·제왕절개는 보상 제외</p>
            <p className="text-xl text-gray-500">(질병도 상해도 아니라고 규정)</p>
          </div>
        </div>
        
        <div className="text-6xl font-black text-red-500">+</div>
        
        <div className="flex-1 bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-12 flex flex-col shadow-sm text-center h-[350px] justify-center">
          <h3 className="text-4xl font-black text-emerald-900 mb-6">1~5종 수술특약</h3>
          <p className="text-2xl text-gray-800 font-bold mb-4">수술 난이도(1~5단계)에 따라 차등 지급</p>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 mt-4">
            <p className="text-2xl text-emerald-700 font-bold">질병 여부와 무관하게 보상 가능</p>
            <p className="text-xl text-gray-500">(단, 칼이 근육층까지 들어가는 절제 필요)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 15: 입원보험, 굳이 무리해서 가입할 필요는 없다
export function SlideCh14() {
  return (
    <div className="h-full flex flex-col justify-center">

      <div className="flex gap-10 mt-8">
         <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-3xl p-6 flex flex-col shadow-sm text-center">
           <div className="bg-gray-800 text-white font-black text-2xl py-3 px-8 rounded-xl inline-block mx-auto mb-2 shadow-md">과거</div>
           <p className="text-2xl text-gray-700 font-bold leading-relaxed">사소한 이유로도 입원<br/>↓<br/>보험사 손해 증가<br/>↓<br/>보험료 대폭 인상</p>
         </div>
         <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 flex flex-col shadow-sm text-center">
           <div className="bg-blue-600 text-white font-black text-2xl py-3 px-8 rounded-xl inline-block mx-auto mb-2 shadow-md">현재</div>
           <p className="text-2xl text-blue-900 font-bold leading-relaxed mt-10">암 수술 후에도<br/>3일이면 퇴원하는 추세</p>
         </div>
      </div>

      <div className="text-center mt-2">
        <p className="text-xl text-gray-500 font-bold mb-4">같은 보험료라면, 이렇게 보강하세요</p>
        <div className="flex justify-center gap-4">
          <span className="bg-white border-2 border-gray-200 text-gray-800 font-black px-8 py-4 rounded-2xl text-2xl shadow-sm">간병보험 보강</span>
          <span className="bg-white border-2 border-gray-200 text-gray-800 font-black px-8 py-4 rounded-2xl text-2xl shadow-sm">수술보험 보강</span>
        </div>
      </div>
      
      <div className="mt-8 text-red-700  text-center text-xl font-bold">
        비싼 보험료를 내면서도 내 맘대로 길게 입원할 수 없다면?<br/>→ 입원비 특약보다 다른 진단/수술비를 높이는 것이 압도적으로 유리합니다.
      </div>
    </div>
  );
}

// SLIDE 18: Summary
export function SlideCh15() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">
      <div className="text-center">
        <span className="text-teal-600 font-bold tracking-widest mb-4 block uppercase">Summary</span>
        <h3 className="text-4xl font-black text-gray-900 mb-4"></h3>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-10 shadow-sm flex flex-col gap-4">
           <div className="text-5xl font-black text-blue-600 mb-2">1</div>
           <p className="text-2xl font-bold text-gray-800 leading-relaxed">생명·손해보험 회사의 구분보단 <strong className="text-blue-700">보장범위 확인이 필수</strong></p>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-10 shadow-sm flex flex-col gap-4">
           <div className="text-5xl font-black text-blue-600 mb-2">2</div>
           <p className="text-2xl font-bold text-gray-800 leading-relaxed"><strong className="text-blue-700">손해율이 낮은 생명보험사 위주로 기본 설계</strong>하여 보험료 이점을 활용</p>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-10 shadow-sm flex flex-col gap-4">
           <div className="text-5xl font-black text-blue-600 mb-2">3</div>
           <p className="text-2xl font-bold text-gray-800 leading-relaxed">상해·배상책임·운전자보험 등은 손보사가 강점 — <strong className="text-blue-700">한 회사로 다 커버 불가</strong></p>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-10 shadow-sm flex flex-col gap-4">
           <div className="text-5xl font-black text-blue-600 mb-2">4</div>
           <p className="text-2xl font-bold text-gray-800 leading-relaxed">사망보장을 준비한다면 요건이 까다롭지 않은 <strong className="text-blue-700">생명보험사가 유리</strong></p>
        </div>
      </div>
    </div>
  );
}