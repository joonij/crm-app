"use client";

import { 
  ShieldAlert, Building2, Handshake, TrendingUp, AlertTriangle, 
  BriefcaseMedical, Globe, MessageSquare, ArrowRight, Lightbulb, 
  FileCheck2, Pill
} from "lucide-react";

// ==========================================
// 인트로 슬라이드
// ==========================================
export function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-10 py-4 bg-blue-50 text-blue-700 rounded-full font-bold text-xl tracking-widest z-10">
        사내 마스터 교육 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8 z-10 tracking-tight">
        보장성 상품 교육<br />
        <span className="text-blue-600">실손의료보험의 본질과 세대별 전략</span>
      </h1>
      <p className="text-3xl text-gray-500 mt-6 font-medium z-10">실손의료비 변천사</p>
    </div>
  );
}

// ==========================================
// 01. 탄생 배경과 역사
// ==========================================
export function SlideCh1() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <div className="shrink-0 border-l-[6px] border-emerald-500 pl-4">
        <p className="text-gray-500 text-lg font-bold">
          공적 보험 재정의 위험 한계점 노출과 민간 시장으로의 위험 전가 메커니즘
        </p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        {/* 카드 1 */}
        <div className="bg-red-50/50 border-t-[6px] border-red-500 rounded-2xl p-8 flex flex-col shadow-sm">
          <h3 className="text-2xl font-black text-red-600 mb-4 border-b-2 border-red-100 pb-3 flex items-center gap-2">
            <Building2 className="w-7 h-7" /> 국가 보건 재정의 한계 표면화
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed font-medium">
            • 의료 수요의 폭발적인 증가와 국민건강보험 재정의 고갈 리스크가 대두되었습니다.<br/><br/>
            • 국가 주도의 급여 혜택만으로는 가입자가 정면으로 마주하는 <strong className="text-red-600">법정 본인부담금</strong> 및 비필수적/고가 기술 대역인 <strong className="text-red-600">비급여 리스크</strong>를 완벽히 커버할 예산적 여력이 존재하지 않았습니다.
          </p>
        </div>

        {/* 카드 2 */}
        <div className="bg-white border-t-[6px] border-blue-600 rounded-2xl p-8 flex flex-col shadow-sm">
          <h3 className="text-2xl font-black text-blue-700 mb-4 border-b-2 border-blue-50 pb-3 flex items-center gap-2">
            <Handshake className="w-7 h-7" /> 민간 보험사로의 리스크 판권 이양 (1999년~)
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed font-medium">
            • 국가가 다 메워주지 못하는 치료비 공백을 방치할 수 없었기에, 정부는 민간 보험사들이 이 비급여 영역을 흡수하도록 조치했습니다.<br/><br/>
            • 즉, 실비의 본질은 단순 사금융 영리 상품이 아닙니다. 국민 경제 파탄을 차단하고자 국가 가이드라인 하에 위임 운영되는 <strong className="text-blue-700">제2의 국민건강보험</strong>이라는 역사적 명분을 지닙니다.
          </p>
        </div>
      </div>

      {/* 강의 팁 박스 */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 relative mt-4 shrink-0 shadow-sm flex gap-4 items-start">
        <Lightbulb className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
        <p className="text-gray-700 font-medium text-lg leading-relaxed">
          <strong className="text-gray-900">강의 내러티브 포인트:</strong> 실손의료보험은 탄생 배경 자체가 국가 재정 부족에 기인합니다. 국가가 해결하지 못한 비급여 사각지대를 방어하도록 특권을 열어준 안전망 구조임을 명확하게 전달하며 강의를 시작합니다.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 02. 실비의 딜레마 (이전에 수정 완료본 통합)
// ==========================================
export function SlideCh2() {
  return (
    <div className="h-full flex flex-col gap-4 py-2 overflow-hidden">
      <div className="shrink-0 border-l-[6px] border-emerald-500 pl-4 mb-2">
        <p className="text-gray-500 text-lg font-bold">
          신입 FC 필드 배치 즉시 고객 대면 상담용 공인 팩트 시트 (개별 세대 완벽 분리 세팅 완료)
        </p>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-gray-200 shadow-md bg-white">
        <table className="w-full text-center border-collapse text-sm">
          <thead className="bg-gray-900 text-white sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b border-r border-gray-700 w-[12%]">구분</th>
              <th className="p-3 border-b border-r border-gray-700 leading-snug">1세대 (구실손)<br/><span className="inline-block mt-1 bg-gray-700 text-white text-[10px] px-2 py-0.5 rounded">~ 2009.09</span></th>
              <th className="p-3 border-b border-r border-gray-700 leading-snug">2세대 (표준화)<br/><span className="inline-block mt-1 bg-teal-600 text-white text-[10px] px-2 py-0.5 rounded">2009.10 ~ 2017.03</span></th>
              <th className="p-3 border-b border-r border-gray-700 leading-snug">3세대 (착한실손)<br/><span className="inline-block mt-1 bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded">2017.04 ~ 2021.06</span></th>
              <th className="p-3 border-b border-r border-gray-700 leading-snug">4세대 실손<br/><span className="inline-block mt-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded">2021.07 ~ 2026.04</span></th>
              <th className="p-3 border-b bg-blue-600 text-white leading-snug">5세대 실손 (최신)<br/><span className="inline-block mt-1 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded">2026.05 ~ 현재</span></th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-gray-700">
            <tr className="border-b border-gray-200">
              <td className="p-2.5 bg-gray-100 font-bold border-r border-gray-200">자기부담금</td>
              <td className="p-2.5 border-r border-gray-200 font-black text-blue-600">0%<br/>(공짜 치료 보장)</td>
              <td className="p-2.5 border-r border-gray-200">급여/비급여<br/>10% ~ 20%</td>
              <td className="p-2.5 border-r border-gray-200">급여 10~20% /<br/>비급여 20%</td>
              <td className="p-2.5 border-r border-gray-200">급여 20% /<br/>비급여 30%</td>
              <td className="p-2.5 bg-red-50/50 font-black text-red-600">급여 20~30% /<br/>비중증 비급여 50%</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-2.5 bg-gray-100 font-bold border-r border-gray-200">보장 한도/구조</td>
              <td className="p-2.5 border-r border-gray-200">제한 없이<br/>일괄 보장</td>
              <td className="p-2.5 border-r border-gray-200">입원 5천만 /<br/>통원 30만</td>
              <td className="p-2.5 border-r border-gray-200">3대 비급여<br/>특약 분리</td>
              <td className="p-2.5 border-r border-gray-200">비급여 청구액<br/>연동 할증</td>
              <td className="p-2.5 font-bold text-gray-900">도수·주사 제외 /<br/>중증 상한 500만 신설</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-2.5 bg-gray-100 font-bold border-r border-gray-200">갱신 / 재가입</td>
              <td className="p-2.5 border-r border-gray-200">3/5년 갱신 /<br/>재가입 없음</td>
              <td className="p-2.5 border-r border-gray-200">1~3년 갱신 /<br/>15년 재가입</td>
              <td className="p-2.5 border-r border-gray-200">1년 갱신 /<br/>15년 재가입</td>
              <td className="p-2.5 border-r border-gray-200">1년 갱신 /<br/>5년 재가입</td>
              <td className="p-2.5 bg-emerald-50/50 font-black text-blue-600">1년 갱신 /<br/>5년 재가입 유지</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-2.5 bg-red-800 text-white font-bold border-r border-gray-200">보험료 수준</td>
              <td className="p-2.5 bg-red-50/50 border-r border-gray-200 font-black text-red-600">최고치<br/>(갱신 폭탄)</td>
              <td className="p-2.5 border-r border-gray-200 font-black text-red-600">높음<br/>(연대 인상)</td>
              <td className="p-2.5 border-r border-gray-200">보통<br/>(-35% 감소)</td>
              <td className="p-2.5 border-r border-gray-200">낮음<br/>(-70% 감소)</td>
              <td className="p-2.5 bg-emerald-50/50 font-black text-blue-600">최저가 수준<br/>(-80% 절감)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-2.5 bg-gray-100 font-bold border-r border-gray-200">필드 셀링 포인트</td>
              <td className="p-2.5 border-r border-gray-200 font-black text-red-600">노후 유지<br/>원천 불가</td>
              <td className="p-2.5 border-r border-gray-200 font-medium">과잉 이용<br/>연대 수렁</td>
              <td className="p-2.5 border-r border-gray-200 font-medium">의료 남용<br/>통제 과도기</td>
              <td className="p-2.5 border-r border-gray-200 font-medium">개인 할증<br/>리스크 개방</td>
              <td className="p-2.5 bg-emerald-50/50 font-black text-emerald-800">최소 안전망<br/>(정액 사보험 연계 필연)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-2.5 bg-gray-100 font-bold border-r border-gray-200">면책 질환 조항</td>
              <td className="p-2.5 border-r border-gray-200 text-left pl-4 leading-snug">• 임신/출산 전면 면책<br/>• 한방/치과 비급여 면책<br/>• 치질 보상 불가</td>
              <td className="p-2.5 border-r border-gray-200 text-left pl-4 leading-snug">• 한방/치과 급여만 보상<br/>• 치질 급여 항목 전환</td>
              <td className="p-2.5 border-r border-gray-200 text-left pl-4 leading-snug">• 3대 비급여 특약 분리<br/>• 정신질환 급여 일부 확대</td>
              <td className="p-2.5 border-r border-gray-200 text-left pl-4 leading-snug">• 영양제/비타민 면책<br/>• 불분명한 보신용주사 차단</td>
              <td className="p-2.5 bg-emerald-50/50 text-left pl-4 leading-snug font-medium">• 과잉 비급여 쇼핑 유발 치료 조항 전면 면책 격상</td>
            </tr>
            <tr>
              <td className="p-2.5 bg-gray-100 font-bold border-r border-gray-200">면책 일수 기준</td>
              <td className="p-2.5 border-r border-gray-200 text-left pl-4 leading-snug">발병일 기준 180일 보상 도달 후 <strong>180일 면책 강제 대기</strong></td>
              <td className="p-2.5 border-r border-gray-200 text-left pl-4 leading-snug">최초 입원 기준 1년 보상 도달 시 <strong>90일간 면책 대기</strong></td>
              <td className="p-2.5 border-r border-gray-200 text-left pl-4 leading-snug">동일 조항 유지<br/>(15년 재가입 연동)</td>
              <td className="p-2.5 border-r border-gray-200 text-left pl-4 leading-snug">5천만 한도 내 면책 없이 <strong>상시 연속 보상</strong></td>
              <td className="p-2.5 bg-emerald-50/50 text-left pl-4 leading-snug">동일 연속 보상 가동<br/>(단, <strong>비급여 이용량 할증</strong>)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 03. 초정밀 비교표 (누락된 열/행 HTML과 100% 동일하게 추가)
// ==========================================
export function SlideCh3() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <div className="shrink-0 border-l-[6px] border-emerald-500 pl-4">
        <p className="text-gray-500 text-lg font-bold">
          자기부담금 0%가 초래한 공동체 연대 파괴와 요율 왜곡 구조 분석
        </p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        <div className="bg-white border-l-[6px] border-gray-800 rounded-2xl p-8 flex flex-col shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3">
            자기부담금 0%가 초래한 왜곡 구조
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed font-medium">
            초기 모델인 1세대 실손보험의 본인부담금 전액 보장 제도는 가입자와 일부 의료기관의 모럴 해저드(도덕적 해이)를 완벽히 유발했습니다. 비용에 대한 심리적 장벽이 완전히 사라지자 자잘한 통원에도 무분별한 비급여 쇼핑 및 장기 입원을 남발하는 병폐가 축적되었습니다.
          </p>
        </div>
        <div className="bg-red-50/30 border-l-[6px] border-red-500 rounded-2xl p-8 flex flex-col shadow-sm">
          <h3 className="text-2xl font-black text-red-600 mb-4 border-b-2 border-red-100 pb-3 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-500" /> 공동체의 연대 파괴와 요율 폭등
          </h3>
          <p className="text-lg text-red-900/80 leading-relaxed font-bold">
            일부 헤비 유저의 무분별한 청구량으로 인해 가동된 적자는 손해율 누적으로 직결되었습니다. 병원을 거의 찾지 않는 절대다수의 성실한 가입자들까지 인상 요율의 고지서를 공동 연대 책임 형태로 나누어 받으며 가계 고정비를 파괴하는 폭탄 갱신 구조로 전락했습니다.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative mt-4 shrink-0 shadow-sm">
        <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm">
          🏛️ 금융위원회 공인 FACT CHECK 명세
        </div>
        <div className="mt-2 text-blue-900 font-semibold text-base leading-relaxed">
          • 지속적인 실손보험금 증가: <strong className="text-red-600">'18년 8.4조원 → '24년 15.2조원 (6년간 81% 증가)'</strong><br />
          • 가파른 보험료 상승: <strong className="text-red-600">'25년 2세대 보험료는 13년 대비 약 4배 수준 폭등'</strong><br />
          <span className="text-sm text-gray-500 font-normal mt-3 block text-right font-bold">- 금융위원회, 중증질환 보장관련 보도자료 (26.05.04) 2p 발췌</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 04. 보상의 사각지대와 도수치료의 최후
// ==========================================
export function SlideCh4() {
  return (
    <div className="h-full flex flex-col justify-between gap-6 py-2 overflow-hidden">
      <div className="shrink-0 border-l-[6px] border-emerald-500 pl-4 mb-2">
        <p className="text-gray-500 text-lg font-bold">
          과잉 의료 쇼핑 대역에 대한 강력한 차단 조치와 법정 부담률 상향의 현실
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="bg-white border-l-[6px] border-red-600 rounded-2xl p-10 shadow-md">
          <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-red-600" /> 입증되지 않는 통증 치료의 면책 처리
          </h3>
          <p className="text-2xl leading-relaxed text-gray-700 font-medium">
            객관적인 검사 소견이나 실질적인 증상 호전 추이가 데이터 서류상 증명되지 않는 도수치료 및 영양 주사제 청구는 즉각 심사 면책 처리(지급 거절)됩니다. 단순 체형 교정이나 마사지 대용으로 청구하던 관행은 완전히 끝났으며, 가입자가 이력을 남길수록 개별 요율만 폭증하게 밀봉되었습니다.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative mt-4 shrink-0 shadow-sm">
        <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm">
          🏛️ 금융위원회 공인 FACT CHECK 명세
        </div>
        <div className="mt-2 text-blue-900 font-semibold text-base leading-relaxed">
          • "보건당국에서 <strong className="text-red-600">도수치료의 관리급여화를 추진... 관리급여로 지정시 건강보험만 적용되어 95% 본인부담률이 적용</strong>"<br />
          • "도수치료 등 근골격계 치료는 과잉진료 우려가 큰 대표적인 비급여 항목으로서, <strong className="text-red-600">보험금 누수의 큰 원인</strong>"<br />
          <span className="text-sm text-gray-500 font-normal mt-3 block text-right font-bold">- 금융위원회, 5세대 실손보험 출시관련 Q&A 2p, 4p 발췌</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 05. 거대 리스크의 등장과 정액보장
// ==========================================
export function SlideCh5() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <div className="shrink-0 border-l-[6px] border-emerald-500 pl-4 mb-2">
        <p className="text-gray-500 text-lg font-bold">
          외래 한도를 초과하는 억 단위의 신의료 항암제와 실비 완전 면책인 간병비 리스크의 결말
        </p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        {/* 카드 1 */}
        <div className="bg-white border-t-[6px] border-gray-800 rounded-2xl p-8 flex flex-col shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3 flex items-center gap-2">
            <Pill className="w-6 h-6 text-gray-700" /> 초고가 표적/면역 항암 약제 실태
          </h3>
          <ul className="space-y-4 text-lg text-gray-700 font-medium">
            <li>• <strong>면역항암제 키트루다:</strong> 1회 약 600만 원 (연간 1억 원 이상 유출)</li>
            <li>• <strong>유방암 신약 엔허투:</strong> 연간 치료 예산 약 1억 5천만 원 상회</li>
            <li>• <strong>백혈병 치료제 킴리아:</strong> 1회 투여당 세팅 비용 최고 3억 6천만 원</li>
          </ul>
          <div className="mt-auto bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-red-700 font-bold">👉 실비의 외래 통원 한도(20~25만 원)로는 단 1회의 항암 치료비조차 막을 수 없습니다. 고액 현금이 지급되는 '정액 진단비' 조립이 필수입니다.</p>
          </div>
        </div>

        {/* 카드 2 */}
        <div className="bg-red-50/50 border-t-[6px] border-red-600 rounded-2xl p-8 flex flex-col shadow-sm">
          <h3 className="text-2xl font-black text-red-700 mb-4 border-b-2 border-red-100 pb-3 flex items-center gap-2">
            <BriefcaseMedical className="w-6 h-6 text-red-600" /> 실비 표준약관상 100% 면책: 간병인 파산
          </h3>
          <p className="text-xl leading-relaxed text-red-900 font-bold mb-4">
            • 실손의료보험 약관상 <strong className="bg-red-200 px-1">'간병비 및 간병인 비용'은 보상 범위에서 아예 제외된 전면 면책 사항</strong>입니다.
          </p>
          <p className="text-lg text-red-800 font-medium leading-relaxed">
            • 월 400~500만 원의 고정 간병비 지출이 개시되는 순간, 치료비를 실비로 막아내더라도 통장 자산이 통째로 파산당하는 비극이 시작됩니다. '간병인 보험(정액)' 연계가 필연적입니다.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative mt-4 shrink-0 shadow-sm">
        <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm">
          🏛️ 금융위원회 공인 FACT CHECK 명세
        </div>
        <div className="mt-2 text-blue-900 font-semibold text-base leading-relaxed">
          • "보장이 넓은 1·2세대 등 기존 실손보험상품은... <strong className="text-red-600">일반적인 소비자에게 무조건 유리하다고 보기는 어려움.</strong> 과잉 의료이용을 유발하여 보험료 인상의 큰 원인"<br />
          <span className="text-sm text-gray-500 font-normal mt-3 block text-right font-bold">- 금융위원회, 5세대 실손보험 출시관련 Q&A 3p 발췌</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 06. 포트폴리오 리빌딩 전략
// ==========================================
export function SlideCh6() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <div className="shrink-0 border-l-[6px] border-emerald-500 pl-4 mb-2">
        <p className="text-gray-500 text-lg font-bold">
          글 내용을 하단으로 배치하고 리빌딩의 직관적 자원 배분 이동을 명시한 구조 도표 시스템
        </p>
      </div>

      <div className="flex items-center justify-between gap-6 my-2 flex-1 min-h-0">
        {/* 기형적 포트폴리오 */}
        <div className="flex-1 bg-red-50 border-4 border-dashed border-red-200 rounded-3xl p-8 text-center h-full flex flex-col justify-center">
          <div className="text-red-600 font-bold text-lg mb-2">[기형적인 기존 포트폴리오 구조]</div>
          <div className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">월 150,000원<br/><span className="text-3xl text-red-500 block mt-2">전액 유출</span></div>
          <p className="text-gray-600 font-medium">자잘한 통원비 보장에 매달 고정비 낭비<br/><strong className="text-red-500">(정작 록인이 필요한 표적항암, 간병인 공백 시 즉각 파산)</strong></p>
        </div>

        {/* 화살표 */}
        <div className="shrink-0">
          <ArrowRight className="w-16 h-16 text-emerald-500" />
        </div>

        {/* 최적 포트폴리오 */}
        <div className="flex-[1.4] bg-emerald-50/50 border-[4px] border-emerald-500 rounded-3xl p-8 text-center h-full flex flex-col justify-center shadow-lg">
          <div className="text-emerald-800 font-bold text-lg mb-6">[바른지사 최적 포트폴리오 리빌딩 안]</div>
          <div className="flex items-center justify-around bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
            <div>
              <div className="text-gray-500 text-sm font-bold mb-1">최신 슬림 실비 전환</div>
              <div className="text-3xl font-black text-gray-900">월 30,000원</div>
            </div>
            <div className="text-3xl font-black text-emerald-500 mx-4">+</div>
            <div>
              <div className="text-emerald-700 text-sm font-bold mb-1">암·뇌·심 고액 진단비 및 간병비 방화벽 구축</div>
              <div className="text-3xl font-black text-emerald-700">월 120,000원</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shrink-0 shadow-sm">
        <p className="text-lg leading-relaxed text-gray-800 font-medium">
          • <strong className="text-gray-900">컨설팅 핵심 가이드:</strong> 일 년에 병원에 거의 가지도 않으면서 과거 구세대의 보장 조건 수치에 눈이 멀어 고정비 거품을 고수하는 무사고 고객군을 완벽히 개조해야 합니다.<br/>
          • 실비를 최신 세대로 슬림화하여 매달 세이브되는 고정 비용 차액(월 10~15만 원)을 그대로 살려, 가계 경제의 진짜 치명적 리스크인 <strong className="text-blue-700 bg-blue-100/50 px-1">'고액 정액 진단비'와 '간병인 현금 인프라 성벽'으로 재배치</strong>시키는 포트폴리오 리빌딩이 전문가의 사명입니다.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 07. 해외사례 / 노후·간편 실손 기본
// ==========================================
export function SlideCh7() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <div className="shrink-0 border-l-[6px] border-emerald-500 pl-4 mb-2">
        <p className="text-gray-500 text-lg font-bold">
          글로벌 민간 보충형 의료 자산 운영 사례 및 국내 고령/유병력자 세그먼트 보상 한계 명세
        </p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        {/* 카드 1 */}
        <div className="bg-white border-t-[6px] border-gray-800 rounded-2xl p-8 flex flex-col shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3 flex items-center gap-2">
            <Globe className="w-7 h-7 text-gray-700" /> 주요 선진국 민간 보충보험 체계
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed font-medium">
            • <strong>미국형 시스템:</strong> 공적 안전망의 심각한 사각지대로 인해 민간 건강보험 제도가 가계 파산을 방어하는 절대적 축으로 작용합니다.<br/><br/>
            • <strong>유럽형 시스템(독일/영국 등):</strong> 공적 의료비가 무상에 가깝지만, 국가 통제로 인해 수술 대기 기간이 수개월씩 지연되는 치명적 약점이 있습니다. 이에 따라 신속한 치료권과 비급여 상급 병실 이용을 매칭하기 위해 <strong>민간 보충형 실손보험 구조가 고도화</strong>되어 있습니다.
          </p>
        </div>

        {/* 카드 2 */}
        <div className="bg-white border-t-[6px] border-emerald-500 rounded-2xl p-8 flex flex-col shadow-sm">
          <h3 className="text-2xl font-black text-emerald-700 mb-4 border-b-2 border-emerald-50 pb-3 flex items-center gap-2">
            <BriefcaseMedical className="w-7 h-7 text-emerald-600" /> 국내 고령/간편 실손 인수 조건 명세
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed font-medium">
            • <strong>유병력자 간편 실손 (3·2·5 고지 패스):</strong> 만성질환자도 진입 가능하나 일괄 자기부담률이 30%로 조정됩니다. 핵심 비급여 항목인 <strong>3대 비급여(도수치료, 비급여 주사, MRI)가 약관상 전면 특약 면책 처리</strong>되는 치명적 사각지대를 내포합니다.<br/><br/>
            • <strong>노후 실손의료보험 (50~75세):</strong> 보험료를 대폭 슬림화한 대신 공제 한도를 급여 3만 원, 비급여 5만 원 단위로 대폭 상향시켜 자잘한 통원이 아닌 대형 수술 구조 방어에 특화 설계된 모델입니다.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shrink-0 mt-2">
        <p className="text-gray-900 font-bold text-[15px]">
          * 관련근거자료 : OECD 국가별 민영건강보험 보충형 모델 가이드라인 분석 보고서 및 금융감독원 가입자 보호조항 약관 표준화 명세 문서
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 클로징: 바른지사 표준 록인 RP
// ==========================================
export function SlideClosing() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-900 rounded-[2rem] p-10 text-center relative overflow-hidden shadow-2xl">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
      
      <FileCheck2 className="w-16 h-16 text-emerald-400 mb-6 relative z-10" />
      <h2 className="text-4xl font-black text-emerald-400 mb-10 relative z-10">바른금융파트너스 표준 록인(Lock-in) 클로징 RP</h2>
      
      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-3xl p-10 max-w-5xl backdrop-blur-sm relative z-10">
        <p className="text-2xl leading-[1.8] text-gray-200 font-medium text-left">
          "고객님, 병원도 안 가시는데 과거 1세대 조건에 묶여 매달 15만 원씩 새어나가는 돈은 자산을 지키는 게 아니라 보험사와 병원의 배만 불려주는 독식 구조에 속고 계신 겁니다.<br/>
          나라가 건강보험 재정에 한계를 느껴 민간에 실비 판권을 넘겼듯, 우리도 현명하게 자산을 재배치해야 합니다. 실비를 최신 세대로 슬림하게 다이어트하여 매월 고정비 10만 원을 즉시 세이브하십시오.<br/>
          그리고 <strong className="text-white bg-emerald-600/40 px-2 py-1 rounded">그 절약한 생돈으로, 고객님의 전 재산을 갉아먹을 '고액 항암 치료비'와 '간병인 파산 리스크'를 완벽하게 막아줄 최후의 성벽(정액 진단비)을 조립</strong>해 드리겠습니다. 현금 자산을 단 1원도 다치지 않게 록인(Lock-in)해 주는 이 컨설팅이 자본주의 생존의 최선입니다. 지금 바로 시작하겠습니다."
        </p>
      </div>
    </div>
  );
}