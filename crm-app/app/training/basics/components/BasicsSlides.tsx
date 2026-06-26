"use client";

import { ShieldCheck, HeartPulse, FileText, CheckCircle2, FileCheck, Car, Flame, Users } from "lucide-react";

// SLIDE 1: 대문
export function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-10 py-4 bg-blue-50 text-blue-700 rounded-full font-bold text-xl tracking-widest z-10">
        사내 마스터 교육 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8 z-10 tracking-tight">
        보험 기초공사<br />
        <span className="text-blue-600">어떻게 해야 할까?</span>
      </h1>
      <p className="text-3xl text-gray-500 mt-6 font-medium z-10">완벽한 보험 설계를 위한 마스터 가이드</p>
    </div>
  );
}

// SLIDE 2: 보험사 한눈에
export function SlideCh1() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-4">국내 주요 보험사</h3>
        <p className="text-xl text-gray-500 font-medium">생명보험사와 손해보험사, 이름과 얼굴을 먼저 익혀두면 이후 설계가 훨씬 쉬워집니다.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-10">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-10 flex flex-col shadow-sm items-center text-center">
          <div className="bg-blue-600 text-white p-5 rounded-full mb-6 shadow-lg">
            <HeartPulse className="w-12 h-12" />
          </div>
          <h4 className="text-3xl font-black text-blue-900 mb-4">생명보험사</h4>
          <p className="text-xl text-blue-800 leading-relaxed font-bold mb-6">교보 · 삼성생명 · 한화생명 · 신한라이프 등</p>
          <div className="bg-white px-6 py-3 rounded-xl border border-blue-100 text-lg font-bold text-gray-700">
            사망 보장의 본거지
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-10 flex flex-col shadow-sm items-center text-center">
          <div className="bg-red-500 text-white p-5 rounded-full mb-6 shadow-lg">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h4 className="text-3xl font-black text-red-900 mb-4">손해보험사</h4>
          <p className="text-xl text-red-800 leading-relaxed font-bold mb-6">삼성화재 · 현대해상 · DB · 메리츠 등</p>
          <div className="bg-white px-6 py-3 rounded-xl border border-red-100 text-lg font-bold text-gray-700">
            실손 · 진단 · 수술 보장의 본거지
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 3: 보장 흐름
export function SlideCh2() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-4">프로세스에 맞춘 보장 설계</h3>
        <p className="text-xl text-gray-500 font-medium">병원에 가면 일어나는 일 → 각 단계마다 보험으로 대비</p>
      </div>

      <div className="flex justify-between items-center gap-4">
        {[
          { step: "STEP 1", name: "진료", desc: "실비보험", color: "bg-blue-600" },
          { step: "STEP 2", name: "3대질환", desc: "가입전략", color: "bg-emerald-600" },
          { step: "STEP 3", name: "수술", desc: "수술보험 종류", color: "bg-orange-500" },
          { step: "STEP 4", name: "입원", desc: "입원일당", color: "bg-purple-600" },
          { step: "STEP 5", name: "사망", desc: "생명보험", color: "bg-indigo-600" }
        ].map((item, idx) => (
          <div key={idx} className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-md overflow-hidden flex flex-col text-center h-[260px]">
            <div className={`${item.color} text-white p-6 flex flex-col gap-2`}>
              <span className="text-sm font-bold tracking-widest opacity-80">{item.step}</span>
              <span className="text-2xl font-black">{item.name}</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 text-xl font-bold text-gray-700 bg-gray-50">
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-white p-6 rounded-2xl text-center shadow-lg text-xl font-medium mt-4">
        <strong className="text-blue-400 mr-4">기초공사 원칙:</strong>
        손해보험사로 먼저 구성 (실비 + 진단 + 수술) &nbsp;|&nbsp; 사망 보장은 생명보험사로
      </div>
    </div>
  );
}

// SLIDE 4: 약관 기술방식의 차이
export function SlideCh3() {
  return (
    <div className="h-full flex flex-col justify-center gap-8 py-2">
      
      <div className="flex-1 overflow-hidden rounded-3xl border border-gray-200 shadow-xl bg-white flex flex-col">
        <table className="w-full text-center border-collapse flex-1 h-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-6 border-b border-r border-gray-700 w-[20%] text-2xl font-bold">구분</th>
              <th className="p-6 border-b border-r border-gray-700 w-[40%] text-2xl font-black text-red-400">손해보험</th>
              <th className="p-6 border-b border-gray-700 w-[40%] text-2xl font-black text-blue-400">생명보험</th>
            </tr>
          </thead>
          <tbody className="text-xl text-gray-700 font-medium">
            <tr className="border-b border-gray-200">
              <td className="p-6 bg-gray-100 font-bold border-r border-gray-200">약관기술방식</td>
              <td className="p-6 border-r border-gray-200 font-black text-red-600 text-3xl">포괄주의</td>
              <td className="p-6 font-black text-blue-600 text-3xl">열거주의</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-6 bg-gray-100 font-bold border-r border-gray-200">핵심 원리</td>
              <td className="p-6 border-r border-gray-200">포함되지 않는 것만 빼고 다 보장</td>
              <td className="p-6">포함된 것만 보장</td>
            </tr>
            <tr>
              <td className="p-6 bg-gray-100 font-bold border-r border-gray-200">내용</td>
              <td className="p-6 border-r border-gray-200 leading-relaxed bg-red-50/30">
                '보장하지 않는 손해'에 해당하지 않으면<br/>예외 없이 보험금 지급
              </td>
              <td className="p-6 leading-relaxed bg-blue-50/30">
                약관에서 정한 내용(질병코드, 특정약물)에<br/>해당하지 않으면 보험금 부지급
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SLIDE 5: 실비보험
export function SlideCh4() {
  return (
    <div className="h-full flex items-center gap-12 py-2">
      <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-3xl p-12 flex flex-col justify-center shadow-md h-full">
        <div className="text-blue-600 font-bold tracking-widest mb-4">STEP 1</div>
        <h2 className="text-6xl font-black text-blue-900 mb-6">진료비</h2>
        <h3 className="text-3xl font-bold text-blue-800 mb-8">실비보험</h3>
        <p className="text-2xl text-gray-700 leading-relaxed mb-12 font-medium">
          실제 지출 비용을 청구하는<br/>가장 기본적인 보험
        </p>
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm text-2xl font-black text-gray-900 text-center">
          신규 가입은 반드시 <span className="text-red-600">손해보험사</span>로
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 h-full justify-center">
        <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600 w-1/3">2021년 이전</div>
          <div className="text-xl font-black text-gray-800 w-2/3 text-right">모든 보험사에서 실비보험 판매</div>
        </div>
        <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600 w-1/3">현재 상황</div>
          <div className="text-xl font-black text-gray-800 w-2/3 text-right">대부분의 생명보험사 실비 판매 중단</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="text-xl font-bold text-emerald-700 w-1/3">기존 보유자</div>
          <div className="text-xl font-black text-emerald-900 w-2/3 text-right">가입시기에 따라 점검필요</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="text-xl font-bold text-emerald-400 w-1/3">신규 가입자</div>
          <div className="text-2xl font-black text-white w-2/3 text-right">손해보험사 상품 선택</div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 6: 3대 질환 진단보험
export function SlideCh5() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">
      <div className="text-center">
        <p className="text-3xl text-gray-500 font-medium">대한민국 성인 주요 사망 원인질환</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white border-2 border-red-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-red-500 text-white p-6 text-center font-black text-3xl">01. 암</div>
          <div className="p-10 flex flex-col gap-6 text-2xl font-bold text-red-600 text-center flex-1 justify-center">
            <p>고액암</p>
            <p>일반암</p>
            <p>소액암</p>
            <p>유사암</p>
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-emerald-500 text-white p-6 text-center font-black text-3xl">02. 뇌질환</div>
          <div className="p-10 flex flex-col gap-6 text-2xl font-bold text-emerald-600 text-center flex-1 justify-center">
            <p>뇌혈관질환</p>
            <p>뇌졸중</p>
            <p>뇌출혈</p>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-blue-500 text-white p-6 text-center font-black text-3xl">03. 심장질환</div>
          <div className="p-10 flex flex-col gap-6 text-2xl font-bold text-blue-600 text-center flex-1 justify-center">
            <p>허혈성심장질환</p>
            <p>급성심근경색</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 7: 4가지의 암 분류
export function SlideCh6() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-red-500 text-white p-5 text-center font-black text-2xl">고액암</div>
          <div className="p-6 flex flex-col justify-between flex-1">
            <p className="text-xl text-gray-800 font-bold leading-relaxed mb-6">뇌암·뼈암·혈액암<br/>백혈병·림프종·조혈계암</p>
            <p className="text-sm text-red-600 font-black bg-white p-3 rounded-xl border border-red-100">폐암·간암·췌장암은 고액암이 아님!</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-blue-600 text-white p-5 text-center font-black text-2xl">일반암</div>
          <div className="p-6 flex flex-col justify-between flex-1">
            <p className="text-xl text-gray-800 font-bold leading-relaxed mb-6">위암·대장암·폐암<br/>간암·췌장암 등<br/>대부분의 암</p>
            <p className="text-sm text-blue-700 font-black bg-white p-3 rounded-xl border border-blue-100">일반암 범위에<br/>소액암 포함 여부 반드시 확인</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-purple-500 text-white p-5 text-center font-black text-2xl">소액암</div>
          <div className="p-6 flex flex-col justify-between flex-1">
            <p className="text-xl text-gray-800 font-bold leading-relaxed mb-6">유방암·자궁암<br/>전립선암·방광암 등<br/>생식기 계열 암</p>
            <p className="text-sm text-purple-700 font-black bg-white p-3 rounded-xl border border-purple-100">보험사마다 분류 다름<br/>일반암 진단비의 20% 수준</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-emerald-500 text-white p-5 text-center font-black text-2xl">유사암</div>
          <div className="p-6 flex flex-col justify-between flex-1">
            <p className="text-xl text-gray-800 font-bold leading-relaxed mb-6">갑상선암·기타피부암<br/>경계성종양·제자리암<br/>대장점막내암(주의)</p>
            <p className="text-sm text-emerald-700 font-black bg-white p-3 rounded-xl border border-emerald-100">생보 - 무조건 유사암<br/>손보 - 침윤에 따라 일반암 인정 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 8: 생명보험사 약관 (암)
export function SlideCh7() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <div className="text-2xl font-bold text-blue-600 shrink-0 flex items-center gap-2">
        <FileText className="w-8 h-8"/> 생명보험사 약관
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-xl p-8 overflow-y-auto font-medium text-lg text-gray-800 leading-relaxed">
        <p className="font-black text-xl mb-6 text-gray-900 border-b-2 border-gray-100 pb-4">제3조('암', '기타피부암' 및 '갑상선암'의 정의 및 진단확정)</p>
        <p>
          ① 이 특약에서 '암'이라 함은 한국표준질병사인분류 중 '대상이 되는 악성 신생물(암) 분류표(기타피부암, 갑상선암, 대장점막내암 및 비침습방광암 제외)'에서 정한 질병을 말합니다.
        </p>
        <p className="font-bold text-red-600 bg-red-50 p-4 rounded-xl">
          다만, 다음에 해당하는 경우에는 '암'의 분류에서 제외합니다.
        </p>
        <ul className="space-y-4 ml-4">
          <li className="m-0">1. 분류번호 C44(<span className="font-black text-red-600 underline underline-offset-4 decoration-2">기타 피부의 악성 신생물</span>)</li>
          <li className="m-0">
            2. 분류번호 C73(<span className="font-black text-red-600 underline underline-offset-4 decoration-2">갑상선의 악성 신생물</span>)<br/>
            <span className="text-base text-gray-600 ml-6">다만, 제4조에서 정한 중증갑상선암은 '암'에 포함합니다.</span>
          </li>
          <li className="m-0">3. 제5조에서 정한 <span className="font-black text-red-600 underline underline-offset-4 decoration-2">대장점막내암</span></li>
          <li className="m-0">4. 제6조에서 정한 <span className="font-black text-red-600 underline underline-offset-4 decoration-2">비침습방광암</span></li>
          <li className="m-0">5. 전암(前癌)상태(<span className="font-black text-red-600 underline underline-offset-4 decoration-2">암으로 변하기 이전 상태</span>)</li>
        </ul>
      </div>
    </div>
  );
}

// SLIDE 9: 손해보험사 약관 (암)
export function SlideCh8() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <div className="text-2xl font-bold text-red-600 shrink-0 flex items-center gap-2">
        <FileCheck className="w-8 h-8"/> 손해보험사 약관
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-xl p-10 overflow-y-auto font-medium text-lg text-gray-800 leading-relaxed">
        <table className="w-full text-center border-collapse mb-8 border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 border border-gray-300 font-black text-xl">보험금의 종류</th>
              <th className="p-4 border border-gray-300 font-black text-xl">지급금액</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border border-gray-300 font-bold bg-red-50 text-red-900">암진단(유사암제외)보험금</td>
              <td className="p-4 border border-gray-300"><strong>'암'('유사암' 제외)</strong>으로 진단확정된 경우</td>
            </tr>
          </tbody>
        </table>

        <p className="font-black text-xl mb-6 text-gray-900 border-b-2 border-gray-100 pb-4">제2조 (암 등의 정의 및 진단확정)</p>
        <p>
          ① 이 특약에서 '암'이라 함은 제8차 한국표준질병사인분류에 있어서 [별표10] '악성신생물(암) 분류표'에 해당하는 질병을 말합니다.<br/>
          다만, 전암(前癌)상태(암으로 변하기 이전 상태)는 제외합니다.
        </p>
        <p>
          ② 이 특약에서 <strong>'유사암'</strong>이라 함은 제3항에서 정한 '<span className="font-black text-emerald-700 underline underline-offset-4 decoration-2">기타피부암</span>', 제4항에서 정한 '<span className="font-black text-emerald-700 underline underline-offset-4 decoration-2">갑상선암</span>', 제5항에서 정한 '<span className="font-black text-emerald-700 underline underline-offset-4 decoration-2">제자리암</span>' 및 제6항에서 정한 '<span className="font-black text-emerald-700 underline underline-offset-4 decoration-2">경계성종양</span>'을 총칭합니다.
        </p>
      </div>
    </div>
  );
}

// SLIDE 10: 뇌·심장질환
export function SlideCh9() {
  return (
    <div className="h-full flex flex-col gap-8 py-2 overflow-auto">
              
      <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
        <div className="pr-8 pl-8 flex flex-col shadow-xl">
          <h4 className="text-3xl font-black pb-4 text-emerald-600">뇌질환 특약 비교</h4>
          <div className="space-y-4 flex-1">
            <div className="pb-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <div className="text-2xl font-black mb-2">뇌혈관질환</div>
                <div className="text-gray-400 font-medium">I60~I69 전체<br/>뇌혈관 꽈리·뇌동맥류 포함</div>
              </div>
              <div className="bg-emerald-500 text-gray-900 font-black px-4 py-2 rounded-full text-sm">★ 가장 넓음</div>
            </div>
            <div className="pb-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <div className="text-2xl font-black mb-2">뇌졸중</div>
                <div className="text-gray-400 font-medium">I60~I66<br/>뇌경색(혈관 막힘) 포함</div>
              </div>
              <div className="bg-blue-500 text-white font-black px-4 py-2 rounded-full text-sm">중간</div>
            </div>
            <div className="pb-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <div className="text-2xl font-black mb-2">뇌출혈</div>
                <div className="text-gray-400 font-medium">I60~I62<br/>출혈만 해당</div>
              </div>
              <div className="bg-red-500 text-white font-black px-4 py-2 rounded-full text-sm">가장 좁음</div>
            </div>
          </div>
          <div className="bg-red-900/90 text-red-200 p-4 rounded-xl text-center font-bold">
            오래된 보험 — 손보: 뇌졸중만 / 생보: 뇌출혈만 → 점검 필요!
          </div>
        </div>

        <div className="pr-8 pl-8 flex flex-col shadow-xl">
          <h4 className="text-3xl font-black pb-4 text-blue-500">심장질환 특약 비교</h4>
          <div className="space-y-4 flex-1">
            <div className="pb-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <div className="text-2xl font-black mb-2">허혈성심장질환</div>
                <div className="text-gray-400 font-medium">I20~I65 전체<br/>협심증 + 심근경색 모두 보장</div>
              </div>
              <div className="bg-emerald-500 text-gray-900 font-black px-4 py-2 rounded-full text-sm">★ 가장 넓음</div>
            </div>
            <div className="pb-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <div className="text-2xl font-black mb-2">급성심근경색</div>
                <div className="text-gray-400 font-medium">I21~I23<br/>심근경색만 보장(협심증 제외)</div>
              </div>
              <div className="bg-red-500 text-white font-black px-4 py-2 rounded-full text-sm">협심증 제외</div>
            </div>
            <div className="bg-gray-900 p-5 rounded-2xl border border-gray-700 text-gray-300 font-medium mt-4">
              <strong className="text-emerald-400">뇌혈관 진행 순서</strong><br/>
              뇌혈관질환 &gt; 뇌졸중 &gt; 뇌출혈<br/>(뇌혈관질환 특약 = 뇌출혈 포함. 반대는 불가)
            </div>
          </div>
          <div className="mt-4 bg-red-900/90 text-red-200 p-4 rounded-xl text-center font-bold">
            오래된 보험 — 손해보험: 급성심근경색만 → 점검 필요!
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 11: 진단 vs 치료보험
export function SlideCh10() {
  return (
    <div className="h-full flex flex-col gap-8 py-2 overflow-hidden">

      <div className="flex-1 grid grid-cols-2 gap-12 relative min-h-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl z-10 shadow-xl border-4 border-white">
          VS
        </div>

        <div className="bg-white border-2 border-red-200 rounded-3xl shadow-lg flex flex-col overflow-auto">
          <div className="bg-red-500 text-white p-6 text-center font-black text-3xl">진단보험</div>
          <div className="p-4 pl-10 pr-10 flex flex-col gap-6 flex-1">
            <div>
              <div className="text-xl font-black text-red-600 mb-3">장점</div>
              <p className="text-xl text-gray-800 font-bold mb-2">• 치료 여부와 무관하게 보상</p>
              <p className="text-xl text-gray-800 font-bold">• 진단만 받아도 즉시 지급</p>
            </div>
            <div>
              <div className="text-xl font-black text-red-600 mb-3">단점</div>
              <p className="text-xl text-gray-800 font-bold bg-red-50 p-4 rounded-xl">• 보험료가 상대적으로 비쌈</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl shadow-lg flex flex-col overflow-auto transform z-0">
          <div className="bg-emerald-600 text-white p-6 text-center font-black text-3xl">치료보험 (추천)</div>
          <div className="pl-10 pr-10 flex flex-col gap-6 flex-1">
            <p className="pt-2 text-xl text-emerald-900 font-bold text-center">
              특정 치료를 받아야만 보험금 지급 — 보험료 절약
            </p>
            <div className="bg-white p-3 pl-5 pr-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
              <div className="text-xl font-black text-emerald-600 w-1/3">암 수술</div>
              <div className="text-lg text-gray-700 font-bold w-2/3">수술로 암세포 제거 → 암수술 보험금</div>
            </div>
            <div className="bg-white  p-3 pl-5 pr-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
              <div className="text-xl font-black text-emerald-600 w-1/3">항암치료</div>
              <div className="text-lg text-gray-700 font-bold w-2/3">남은 암세포 제거 → 항암치료 보험금</div>
            </div>
            <div className="bg-white  p-3 pl-5 pr-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
              <div className="text-xl font-black text-emerald-600 w-1/3">표적항암</div>
              <div className="text-lg text-gray-700 font-bold w-2/3">치료 효과 향상 → 표적항암치료비</div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center font-black text-emerald-600 text-2xl mt-4 bg-emerald-50 py-4 rounded-2xl shadow-sm">
        진단보험 대비 절반 이하 보험료로 구성 가능
      </div>
    </div>
  );
}

// SLIDE 12: 견적비교 (진단)
export function SlideCh11() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">

      <div className="flex-1 bg-white border-2 border-gray-200 rounded-3xl shadow-xl p-8 overflow-y-auto font-medium text-gray-800 relative">
        <div className="flex justify-between items-center border-b-2 border-gray-900 pb-4 mb-6">
          <span className="text-2xl font-black text-red-600">보험료사항</span>
          <span className="text-sm font-bold text-gray-500">설계번호 : 718023937202606156</span>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between text-lg"><span className="text-gray-500">1회차보험료(할인후)</span><span className="text-3xl font-black text-red-600 border-b-2 border-red-600">124,900 원</span></div>
            <div className="flex justify-between text-lg"><span className="text-gray-500">2회차이후보험료</span><span className="font-bold text-gray-900">124,900 원</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-lg"><span className="text-gray-500">보장보험료</span><span className="font-bold text-gray-900">124,906 원</span></div>
            <div className="flex justify-between text-lg"><span className="text-gray-500">적립보험료</span><span className="font-bold text-gray-900">0 원</span></div>
          </div>
        </div>

        <div className="text-xl font-black text-red-600 mb-4">가입담보리스트</div>
        
        <table className="w-full text-center border-collapse border border-gray-300 text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-300">구분</th>
              <th className="p-3 border border-gray-300 text-left">가입담보</th>
              <th className="p-3 border border-gray-300">가입금액</th>
              <th className="p-3 border border-gray-300">보험료(원)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-gray-300 font-bold bg-gray-50">기본계약</td>
              <td className="p-3 border border-gray-300 text-left">일반상해80%이상후유장해</td>
              <td className="p-3 border border-gray-300">1백만원</td>
              <td className="p-3 border border-gray-300">6</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-300 font-bold bg-gray-50" rowSpan={2}>3대진단</td>
              <td className="p-3 border border-gray-300 text-left font-bold text-red-600 bg-red-50">암진단비(유사암제외)</td>
              <td className="p-3 border border-gray-300 font-bold text-red-600 bg-red-50">1억원</td>
              <td className="p-3 border border-gray-300 font-bold text-red-600 bg-red-50">122,000</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-300 text-left font-bold text-red-600 bg-red-50">유사암진단비</td>
              <td className="p-3 border border-gray-300 font-bold text-red-600 bg-red-50">2천만원</td>
              <td className="p-3 border border-gray-300 font-bold text-red-600 bg-red-50">2,900</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SLIDE 13: 견적비교 (치료)
export function SlideCh12() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">

      <div className="flex-1 bg-white border-2 border-emerald-200 rounded-3xl shadow-xl p-8 overflow-y-auto font-medium text-gray-800 relative">
        <div className="flex justify-between items-center border-b-2 border-gray-900 pb-4 mb-6">
          <span className="text-2xl font-black text-emerald-600">보험료사항</span>
          <span className="text-sm font-bold text-gray-500">설계번호 : 718023937202606156</span>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8 bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
          <div className="space-y-3">
            <div className="flex justify-between text-lg"><span className="text-emerald-800 font-bold">1회차보험료(할인후)</span><span className="text-3xl font-black text-emerald-600 border-b-2 border-emerald-600">57,820 원</span></div>
            <div className="flex justify-between text-lg"><span className="text-emerald-800 font-bold">2회차이후보험료</span><span className="font-bold text-gray-900">57,820 원</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-lg"><span className="text-emerald-800 font-bold">보장보험료</span><span className="font-bold text-gray-900">57,822 원</span></div>
            <div className="flex justify-between text-lg"><span className="text-emerald-800 font-bold">적립보험료</span><span className="font-bold text-gray-900">0 원</span></div>
          </div>
        </div>

        <div className="text-xl font-black text-emerald-600 mb-4">가입담보리스트 (진단비를 낮추고 수술/치료비 추가)</div>
        
        <table className="w-full text-center border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border border-gray-300">구분</th>
              <th className="p-2 border border-gray-300 text-left">가입담보</th>
              <th className="p-2 border border-gray-300">가입금액</th>
              <th className="p-2 border border-gray-300">보험료(원)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-300 font-bold bg-gray-50" rowSpan={2}>3대진단</td>
              <td className="p-2 border border-gray-300 text-left">암진단비(유사암제외)</td>
              <td className="p-2 border border-gray-300">3천만원</td>
              <td className="p-2 border border-gray-300">36,600</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 text-left">유사암진단비</td>
              <td className="p-2 border border-gray-300">6백만원</td>
              <td className="p-2 border border-gray-300">870</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 font-bold bg-emerald-50 text-emerald-800" rowSpan={2}>수술</td>
              <td className="p-2 border border-gray-300 text-left font-bold text-emerald-700 bg-emerald-50">다빈치로봇 암수술비(암)</td>
              <td className="p-2 border border-gray-300 font-bold text-emerald-700 bg-emerald-50">1천만원</td>
              <td className="p-2 border border-gray-300 font-bold text-emerald-700 bg-emerald-50">160</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 text-left font-bold text-emerald-700 bg-emerald-50">다빈치로봇 암수술비(특정암)</td>
              <td className="p-2 border border-gray-300 font-bold text-emerald-700 bg-emerald-50">1천만원</td>
              <td className="p-2 border border-gray-300 font-bold text-emerald-700 bg-emerald-50">170</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 font-bold bg-blue-50 text-blue-800" rowSpan={3}>치료비</td>
              <td className="p-2 border border-gray-300 text-left font-bold text-blue-700 bg-blue-50">항암방사선약물치료비</td>
              <td className="p-2 border border-gray-300 font-bold text-blue-700 bg-blue-50">3천만원</td>
              <td className="p-2 border border-gray-300 font-bold text-blue-700 bg-blue-50">18,120</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 text-left font-bold text-blue-700 bg-blue-50">계속받는 항암방사선약물치료비</td>
              <td className="p-2 border border-gray-300 font-bold text-blue-700 bg-blue-50">10만원</td>
              <td className="p-2 border border-gray-300 font-bold text-blue-700 bg-blue-50">646</td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-300 text-left font-bold text-blue-700 bg-blue-50">표적항암약물허가치료비Ⅱ</td>
              <td className="p-2 border border-gray-300 font-bold text-blue-700 bg-blue-50">5천만원</td>
              <td className="p-2 border border-gray-300 font-bold text-blue-700 bg-blue-50">1,250</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SLIDE 14: 수술특약 비교
export function SlideCh13() {
  return (
    <div className="h-full flex flex-col justify-center gap-8 py-2">
      
      <div className="flex-1 overflow-hidden rounded-3xl border border-gray-200 shadow-xl bg-white flex flex-col">
        <table className="w-full text-center border-collapse flex-1 h-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-6 border-b border-r border-gray-700 w-[20%] text-2xl font-bold">구분</th>
              <th className="p-6 border-b border-r border-gray-700 w-[40%] text-2xl font-black text-blue-400">질병·상해 수술특약</th>
              <th className="p-6 border-b border-gray-700 w-[40%] text-2xl font-black text-emerald-400">종(種) 수술특약</th>
            </tr>
          </thead>
          <tbody className="text-xl text-gray-700 font-medium">
            <tr className="border-b border-gray-200">
              <td className="p-6 bg-gray-100 font-bold border-r border-gray-200">기준</td>
              <td className="p-6 border-r border-gray-200 font-bold">질병 / 상해 여부</td>
              <td className="p-6 font-bold">수술 난이도 1~5종</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-6 bg-gray-100 font-bold border-r border-gray-200">치질·요실금·제왕절개</td>
              <td className="p-6 border-r border-gray-200 font-black text-red-600 bg-red-50/50">보장 안 됨<br/><span className="text-sm font-medium text-gray-500">(약관 명시 제외)</span></td>
              <td className="p-6 font-black text-emerald-600 bg-emerald-50/50">보장 됨</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-6 bg-gray-100 font-bold border-r border-gray-200">지급 기준</td>
              <td className="p-6 border-r border-gray-200">질병 / 상해 여부 판단</td>
              <td className="p-6 font-bold text-red-600">근막절제 미시행 시 보장 안 됨</td>
            </tr>
            <tr>
              <td className="p-6 bg-yellow-50 font-bold border-r border-yellow-200 text-yellow-800">추천 전략</td>
              <td colSpan={2} className="p-6 bg-yellow-50 font-black text-2xl text-gray-900">
                두 특약 모두 가입해야 빈틈 없음
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SLIDE 15: 입원일당
export function SlideCh14() {
  return (
    <div className="h-full flex flex-col justify-center gap-8">
      
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-6">
          <div className="bg-gray-100 text-gray-900 font-black px-6 py-3 rounded-xl text-xl w-1/4 text-center">일당 3만원 기준</div>
          <div className="text-2xl text-gray-700 font-bold w-3/4">월 보험료 2.8~3만원 이상 납부</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-6">
          <div className="bg-red-50 text-red-700 font-black px-6 py-3 rounded-xl text-xl w-1/4 text-center border border-red-100">손익분기점</div>
          <div className="text-2xl text-gray-700 font-bold w-3/4">연간 8일 이상 입원해야 낸 보험료만큼 회수 가능</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-6">
          <div className="bg-gray-100 text-gray-900 font-black px-6 py-3 rounded-xl text-xl w-1/4 text-center">현실</div>
          <div className="text-2xl text-gray-700 font-bold w-3/4">요즘 3일이면 퇴원 권고 — 장기 입원이 쉽지 않은 환경</div>
        </div>
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-200 shadow-md flex items-center gap-6 transform scale-105 mt-4">
          <div className="bg-emerald-600 text-white font-black px-6 py-4 rounded-xl text-2xl w-1/4 text-center shadow-inner">추천 전략</div>
          <div className="text-2xl text-emerald-900 font-black w-3/4">같은 보험료로 뇌혈관질환·심장 진단비 또는 수술특약을 강화하는 것이 더 유리</div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 16: 사망 보장
export function SlideCh15() {
  return (
    <div className="h-full flex flex-col gap-8 py-2 overflow-hidden">
      
      <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 flex flex-col shadow-xl justify-between">
          <div>
            <h4 className="text-3xl font-black text-red-400 mb-6 border-b border-gray-700 pb-4">손해보험사의 문제</h4>
            <div className="text-xl text-gray-300 leading-relaxed font-medium space-y-6">
              <p>사망 원인이 질병인지 상해인지를 따집니다<br/>→ 분쟁 발생 가능성이 높습니다</p>
              <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 text-gray-400 text-lg">
                집안에 누군가 사망하면 경황이 없는데, 사망 원인까지 신경 쓸 여유가 있을까요?
              </div>
            </div>
          </div>
          <div className="bg-red-500 text-white p-3 rounded-2xl text-center font-black text-xl shadow-md mt-6">
            사망보험은 반드시 생명보험사로!
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 flex flex-col shadow-xl justify-between">
          <div>
            <h4 className="text-3xl font-black text-emerald-400 mb-6 border-b border-gray-700 pb-4">실제 사례</h4>
            <div className="text-xl text-gray-300 leading-relaxed font-bold space-y-4 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <p>기분이 안 좋아 산책 → 실종</p>
              <p>1년 후, 산속 추락사로 발견 (타살 아님)</p>
              <p>유족이 상해사망 보험금 청구</p>
              <p className="text-red-400">보험사 거절 — "위험한 곳을 자발적으로 간 것은 우연한 사고가 아님"</p>
            </div>
          </div>
          <div className="bg-emerald-600 text-white p-3 rounded-2xl text-center font-black text-xl shadow-md mt-6">
            생명보험이었다면? → 사망 여부만 확인 → 지급!
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 17: 기타 보험
export function SlideCh16() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">
      <div className="text-center">
        <p className="text-3xl text-gray-500 font-medium">법률, 재물, 배상책임보험 등</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl shadow-sm overflow-hidden flex flex-col text-center p-8 items-center">
          <div className="bg-blue-600 text-white p-5 rounded-full mb-6"><Car className="w-10 h-10"/></div>
          <h4 className="font-black text-3xl text-blue-900 mb-6">운전자보험</h4>
          <p className="text-lg text-gray-700 font-bold mb-8 leading-relaxed flex-1">
            자동차보험이 보장 못하는<br/>사고 발생 시 형사책임에<br/>대한 보상을 해주는 보험
          </p>
          <div className="bg-white p-4 rounded-xl border border-blue-100 text-blue-700 font-black w-full">교통사고 형사합의금·변호사 비용</div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-3xl shadow-sm overflow-hidden flex flex-col text-center p-8 items-center">
          <div className="bg-red-500 text-white p-5 rounded-full mb-6"><Flame className="w-10 h-10"/></div>
          <h4 className="font-black text-3xl text-red-900 mb-6">화재보험</h4>
          <p className="text-lg text-gray-700 font-bold mb-8 leading-relaxed flex-1">
            주택이나 상가에<br/>화재 발생 시<br/>재산 손해에 대한 보상
          </p>
          <div className="bg-white p-4 rounded-xl border border-red-100 text-red-600 font-black w-full">건물·가재도구·집기비품 손해</div>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl shadow-sm overflow-hidden flex flex-col text-center p-8 items-center">
          <div className="bg-emerald-500 text-white p-5 rounded-full mb-6"><Users className="w-10 h-10"/></div>
          <h4 className="font-black text-3xl text-emerald-900 mb-6">일상생활 배상책임</h4>
          <p className="text-lg text-gray-700 font-bold mb-8 leading-relaxed flex-1">
            일상생활 중 다른 사람을<br/>다치게 하거나 물건을<br/>망가뜨렸을 때 보상
          </p>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 text-emerald-700 font-black w-full">2천원으로 1억까지 보상가능</div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 18: Summary
export function SlideSummary() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">

      <div className="grid grid-cols-2 gap-10">
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-10 shadow-sm">
          <div className="text-blue-600 font-bold tracking-widest mb-4 border-b border-blue-200 pb-2">생명보험사</div>
          <h4 className="text-3xl font-black text-blue-900 mb-6">이럴 때 생명보험</h4>
          <ul className="space-y-4 text-xl text-gray-800 font-bold">
            <li className="flex items-center gap-3"><CheckCircle2 className="text-blue-500 w-6 h-6"/> 사망 보험금 — 원인 따지지 않고 지급</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-blue-500 w-6 h-6"/> 자살도 일정 조건 충족 시 지급</li>
          </ul>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-3xl p-10 shadow-sm">
          <div className="text-red-600 font-bold tracking-widest mb-4 border-b border-red-200 pb-2">손해보험사</div>
          <h4 className="text-3xl font-black text-red-900 mb-6">이럴 때 손해보험</h4>
          <ul className="space-y-4 text-xl text-gray-800 font-bold">
            <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500 w-6 h-6"/> 실손 + 진단비 + 수술비 동시 설계</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500 w-6 h-6"/> 뇌혈관질환·허혈성심장 범위 우세</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500 w-6 h-6"/> 대장점막내암 일반암 인정 가능성</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500 w-6 h-6"/> 운전자·화재·배상책임 — 손보 전용</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between mt-4">
        <div className="text-lg font-medium"><strong className="text-red-400 text-xl mr-2">암 체크</strong>① 일반암 범위 소액암 포함 여부 ② 대장점막내암 처리</div>
        <div className="text-gray-600">|</div>
        <div className="text-lg font-medium"><strong className="text-emerald-400 text-xl mr-2">뇌·심장 체크</strong>① 뇌혈관질환 특약? ② 허혈성심장질환 특약? ③ 오래된 보험 점검</div>
      </div>
    </div>
  );
}