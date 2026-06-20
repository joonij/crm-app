"use client";

import { PenTool, CheckCircle2, XCircle, ArrowRight, FileText } from "lucide-react";

// 공통 레이아웃 컴포넌트 (Flow 스텝용)
const FlowStep = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
  <div className="flex-1 min-w-[140px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center mb-3">
      {num}
    </div>
    <h5 className="font-bold text-gray-900 mb-1">{title}</h5>
    <p className="text-xs font-medium text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

// SLIDE 1
export function Slide1() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-6 py-2 bg-blue-50 text-blue-700 rounded-full font-bold tracking-widest text-xl z-10">
        사내 마스터 교육 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight tracking-tight">
        7단계 영업 프로세스
      </h1>
      <p className="text-2xl text-gray-500 font-bold mt-8">영업 실전 루틴</p>
    </div>
  );
}

// SLIDE 2
export function Slide2() {
  return (
    <div className="h-full flex flex-col justify-center gap-10">
      <h2 className="text-4xl font-black text-gray-900 text-center leading-snug">
        영업은 판촉이 아닌<br/>"가치를 파는 것" <span className="text-blue-600">(연애)</span>
      </h2>
      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-2xl font-black text-red-800">보험팔이</h3>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mb-4" />
          <h3 className="text-2xl font-black text-emerald-900 mb-2">가치전달</h3>
          <p className="text-emerald-700 font-bold text-lg">(신뢰 기반 정도영업)</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 3
export function Slide3() {
  return (
    <div className="h-full flex flex-col justify-center gap-8">
      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4">지속 가능한 영업 7단계 전체 프로세스</h2>
        <p className="text-xl text-gray-500 font-medium">가망고객 발굴부터 소개요청까지 — 유기적으로 연결된 완전한 영업 루틴</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {[
          { num: "1", title: "풀리스트", desc: "<이상형 월드컵>" },
          { num: "2", title: "TA (싯플랜)", desc: "<헌팅,자만추>" },
          { num: "3", title: "던지기", desc: "<밀당,썸>" },
          { num: "4", title: "상담", desc: "<데이트>" },
          { num: "5", title: "클로징", desc: "<고백,1일>" },
          { num: "6", title: "증권전달", desc: "<기념일>" },
          { num: "7", title: "소개요청", desc: "<결혼,출산>" }
        ].map((step, i) => (
          <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col items-center w-[160px] text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black mb-4">{step.num}</div>
            <h5 className="font-bold text-gray-900 mb-2">{step.title}</h5>
            <p className="text-sm text-gray-500 font-medium">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-2xl text-center font-bold text-lg shadow-sm">
        프로세스는 선순환. 7단계는 하나의 유기적 시스템.<br/>
        <span className="text-blue-600 text-base font-medium">(내가 해당 step에서 다음 진행 처리가 안된다하면 현재 진행 step 검토 필요!)</span>
      </div>
    </div>
  );
}

// SLIDE 4
export function Slide4() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 1</div>
      <h2 className="text-4xl font-black text-gray-900">풀리스트 (정리된 총알)</h2>
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex-1">
        <p className="font-black text-3xl text-gray-800 mb-6 border-b border-gray-100 pb-4">📋 공통 양식 8가지 기준</p>
        <ul className="space-y-6 text-3xl text-gray-700 font-medium">
          <li className="flex items-center gap-4"><CheckCircle2 className="text-blue-500" /> 분류 / 이름 / 성별 / 연락처 <ArrowRight className="text-gray-300 w-5 h-5"/> <strong className="text-blue-700">타겟팅</strong></li>
          <li className="flex items-center gap-4"><CheckCircle2 className="text-blue-500" /> 나이 / 지역 <ArrowRight className="text-gray-300 w-5 h-5"/> <strong className="text-blue-700">효율, 동선</strong></li>
          <li className="flex items-center gap-4"><CheckCircle2 className="text-blue-500" /> 관계성 / 성향 <ArrowRight className="text-gray-300 w-5 h-5"/> <strong className="text-blue-700">전략</strong></li>
        </ul>
      </div>
    </div>
  );
}

// SLIDE 5
export function Slide5() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 1 심화</div>
      <h2 className="text-4xl font-black text-gray-900">명단 분류 기준 & 시장별 공략 전략</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
          <h4 className="text-2xl font-black text-blue-600 mb-4">A 시장</h4>
          <p className="text-gray-800 font-bold mb-2">매우 친한 지인, 가족</p>
          <p className="text-gray-500 text-sm font-medium">친밀도 높음 / 거절 시 관계 부담</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
          <h4 className="text-2xl font-black text-blue-600 mb-4">B 시장</h4>
          <p className="text-gray-800 font-bold mb-2">친한 지인, 동창</p>
          <p className="text-gray-500 text-sm font-medium">접근 용이 / 설득 중간 난이도</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
          <h4 className="text-2xl font-black text-blue-600 mb-4">C 시장</h4>
          <p className="text-gray-800 font-bold mb-2">보통 지인, 직장 동료</p>
          <p className="text-gray-500 text-sm font-medium">관계 부담 낮음 / 성과 기대 이상</p>
        </div>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center font-bold text-lg shadow-sm mt-4">
        실전 지침: 명단은 최소 선거절 없이 50명 이상 작성.<br/>
        성향 컬럼에 '즉흥형/분석형/관계형'으로 체크 후 TA 돌려보기
      </div>
    </div>
  );
}

// SLIDE 6
export function Slide6() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 2</div>
      <h2 className="text-4xl font-black text-gray-900">TA (싯플랜) — 영화 예고편</h2>
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 shadow-sm">
          <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm mb-4 flex items-center w-max gap-2">⚠️ 절대 금지</span>
          <p className="text-xl text-red-900 font-bold leading-relaxed">
            2시간짜리 영화 스토리를 다 스포일러하지 마라.<br/>
            상품 설명, 보험료 언급, 보장 내용 나열 — 전부 TA 실패의 지름길.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 shadow-sm">
          <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm mb-4 flex items-center w-max gap-2">🎯 TA의 단 하나의 목적</span>
          <p className="text-xl text-blue-900 font-bold leading-relaxed">
            오직 '만남 약속' 선점! TA는 계약을 따는 자리가 아닌.<br/>
            만날 명분을 심어주거나 호기심을 자극하고 자리를 잡는 것.
          </p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 7
export function Slide7() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4 overflow-y-hidden">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 2 실전 — 공통 스크립트</div>
      <h2 className="text-3xl font-black text-gray-900 border-b pb-4">TA 멘트 흐름: 전화 / 카톡 / SNS 공통 스크립트</h2>
      
      <div className="space-y-6">
        <div>
          <p className="font-black text-lg text-gray-800 flex items-center gap-2">🗣️ 오프닝(서두) — 2가지 선택</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <h5 className="font-bold text-blue-600">① 안부형 <a className="text-gray-700 font-medium">"야, 오랜만이다! 잘 지냈어?"</a></h5>
              
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <h5 className="font-bold text-blue-600">② 정보제공형 <a className="text-gray-700 font-medium">"보험, 금융, 이벤트, 일상, 정보 꿀팁 등(만남이 시간낭비 X. 이득 O)"</a></h5>
              
            </div>
          </div>
        </div>

        <div>
          <p className="font-black text-lg text-gray-800 flex items-center gap-2">📅 약속 클로징 (필수 패턴)</p>
          <div className="bg-gray-100 border border-gray-300 p-5 rounded-2xl shadow-sm">
            <p className="text-gray-800 font-bold text-lg">"다음주에 근처 지나가는데, O요일이 편해, O요일이 편해? 커피 들고갈게."</p>
          </div>
        </div>

        <div>
          <p className="font-black text-lg text-gray-800 flex items-center gap-2">📱 채널별 적용법</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <h5 className="font-bold text-blue-600 mb-2">📞 전화</h5>
              <p className="text-gray-600 text-sm font-medium">오프닝 후 바로 약속 클로징</p>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <h5 className="font-bold text-blue-600 mb-2">💬 카톡</h5>
              <p className="text-gray-600 text-sm font-medium">스몰토크 → 오프닝 → 약속 클로징. 메시지는 3줄 이내</p>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <h5 className="font-bold text-blue-600 mb-2">📲 SNS DM</h5>
              <p className="text-gray-600 text-sm font-medium">최근 스토리 언급(근황/사고사례) → 오프닝 → 약속 클로징</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-md text-center">
          <b className="text-yellow-300 block mb-1">⚡ 핵심 원칙</b>
          <span className="font-medium">양자택일로 마무리 (폐쇄형 질문) · 상품 설명 절대 금지 · 만남 약속 선점이 유일한 목표</span>
        </div>
      </div>
    </div>
  );
}

// SLIDE 8
export function Slide8() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 2 거절 처리 Q&A ①</div>
      <h2 className="text-4xl font-black text-gray-900">거절 처리: "보험 얘기할 거면 만나지 마"</h2>
      
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 shadow-sm">
        <span className="inline-block text-red-600 font-black mb-2 flex items-center gap-2">❌ 고객 거절 패턴</span>
        <blockquote className="text-2xl font-bold text-red-900 border-l-4 border-red-500 pl-4 py-2 bg-white rounded-r-xl">
          "보험 얘기 꺼내면 진짜 안 만나. 나 보험 완전히 질렸어. 필요 없어."
        </blockquote>
        <p className="text-red-700 font-medium mt-4"><b>이 패턴의 본질:</b> 보험 자체가 싫은 게 아니라, 강요당하는 경험이 싫은 것이다.</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 shadow-sm mt-4">
        <span className="inline-block text-emerald-700 font-black mb-2 flex items-center gap-2">✅ 필살 카운터 멘트</span>
        <blockquote className="text-xl font-bold text-emerald-900 border-l-4 border-emerald-500 pl-4 py-3 bg-white rounded-r-xl leading-relaxed">
          "가입하라고 안 해! (선수) 나 이번 달 '고객 스피치 분석' 인사고가 평가 달이라서, 승진 시험 도와주는 셈 치고 평가 점수표만 써줘.<br/>
          도와주니까 밥은 내가 살게! 20분만 평가해줘."
        </blockquote>
        <p className="text-emerald-700 font-bold mt-4 text-sm bg-emerald-100 inline-block px-3 py-1 rounded-lg">
          → 프레임 전환: 가입 권유가 아닌 도와달라, 평가해달라는 뉘앙스로 반감 없이 접근
        </p>
      </div>
    </div>
  );
}

// SLIDE 9
export function Slide9() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 2 거절 처리 Q&A ②</div>
      <h2 className="text-4xl font-black text-gray-900">거절 처리: "가족한테 다 해서 완벽해"</h2>
      
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 shadow-sm">
        <span className="inline-block text-red-600 font-black mb-2 flex items-center gap-2">❌ 고객 거절 패턴</span>
        <blockquote className="text-2xl font-bold text-red-900 border-l-4 border-red-500 pl-4 py-2 bg-white rounded-r-xl">
          "나 이미 지인, 가족한테 완벽하게 들었어."
        </blockquote>
        <p className="text-red-700 font-medium mt-4"><b>이 패턴의 본질:</b> 기존 설계사에 대한 신뢰 + 귀찮음. 직접 부정하면 관계가 상한다.</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 shadow-sm mt-4">
        <span className="inline-block text-emerald-700 font-black mb-2 flex items-center gap-2">✅ 관계 존중 후 빈틈 공략</span>
        <blockquote className="text-xl font-bold text-emerald-900 border-l-4 border-emerald-500 pl-4 py-3 bg-white rounded-r-xl leading-relaxed">
          "기본 형태만 되어 있을 가능성 크다 why? 짜주는 대로 설계해서 실속형 특약은 다 빠져있는 경우 많거든.<br/>
          제3자 눈으로 구멍 난 방패인지 딱 한 번만 검증해 줄게. 손해 볼 게 없잖아?" (직접 봐!)
        </blockquote>
      </div>
    </div>
  );
}

// SLIDE 10
export function Slide10() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4 overflow-hidden">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 3</div>
      <h2 className="text-4xl font-black text-gray-900">던지기 — 보험 싫어! 보상 좋아!</h2>
      <p className="text-xl font-bold text-gray-500 mb-2">억지로 바늘을 입에 밀어 넣는 계약 방식은 금지다. 고객의 호기심을 자아내 스스로 입을 벌리게 만드는 것이 던지기의 본질이다.</p>
      
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <span className="text-blue-600 font-black text-lg mb-2">① 치아파절</span>
          <p className="text-gray-700 font-medium">음식 먹다 이 깨지거나 미세하게 금만 가도 50~200만 정액 지급</p>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <span className="text-blue-600 font-black text-lg mb-2">② 자부상</span>
          <p className="text-gray-700 font-medium">목 뻐근 한의원만 가서 경미한 진단만 받아도 30~100만 정액 지급</p>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <span className="text-blue-600 font-black text-lg mb-2">③ 수술비</span>
          <p className="text-gray-700 font-medium">쥐젖·용종, 코수술(비염) 등 흔히 일어나는 경미한 수술도 100만~1400만 이상 정액 지급</p>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <span className="text-blue-600 font-black text-lg mb-2">④ 일배책</span>
          <p className="text-gray-700 font-medium">깨짐(대물)사고, 누수·반려견, 운동중 십자인대 파열(대인) 등 사고 1억한도 비례보상</p>
        </div>
      </div>
      <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-md text-center font-bold text-lg mt-4 shrink-0">
        던지기 공통 6단계 흐름: 정의 → 연출 → 사례(보상액) → 공감 → 질문 → 정보수집.
      </div>
    </div>
  );
}

// SLIDE 11
export function Slide11() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4 overflow-y-auto">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 3 ① 이론</div>
      <h2 className="text-3xl font-black text-gray-900 border-b pb-4">골절진단비 & 치아파절 — <span className="text-blue-600">사전적 정의와 약관 완벽 정리</span></h2>
      
      <div className="space-y-6">
        <div>
          <p className="font-black text-xl text-gray-800 mb-2">📖 골절진단비란?</p>
          <p className="text-gray-700 font-medium bg-gray-50 p-4 rounded-xl border border-gray-200">
            상해 사고로 인해 뼈가 부러지거나 금이 갔을 때, 의사의 진단서 발급만으로 가입 금액을 정액 지급하는 담보.<br/>
            <span className="block mt-2 font-bold text-blue-700">• 입원·수술 필요 없음 &nbsp;&nbsp; • 진단서 1장으로 청구 완료 &nbsp;&nbsp; • 사고 후 즉시 적용</span>
          </p>
        </div>

        <div>
          <p className="font-black text-xl text-gray-800 mb-3">⚖️ 약관 핵심 비교</p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-center border-collapse text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b border-r border-gray-200 font-bold text-gray-800">구분</th>
                  <th className="p-3 border-b border-r border-gray-200 font-bold text-gray-800">치아파절 제외</th>
                  <th className="p-3 border-b border-gray-200 font-bold text-gray-800">치아파절 포함</th>
                </tr>
              </thead>
              <tbody className="font-medium text-gray-700">
                <tr>
                  <td className="p-3 border-b border-r border-gray-200 bg-gray-50 font-bold">일반 골절</td>
                  <td className="p-3 border-b border-r border-gray-200 text-emerald-600 font-bold">✅ 보장</td>
                  <td className="p-3 border-b border-gray-200 text-emerald-600 font-bold">✅ 보장</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-r border-gray-200 bg-gray-50 font-bold">치아 파절</td>
                  <td className="p-3 border-b border-r border-gray-200 text-red-500 font-bold">❌ 0원</td>
                  <td className="p-3 border-b border-gray-200 text-emerald-600 font-bold">✅ 정액 지급</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-r border-gray-200 bg-gray-50 font-bold">진단 코드</td>
                  <td className="p-3 border-b border-r border-gray-200 text-gray-400">-</td>
                  <td className="p-3 border-b border-gray-200 font-bold text-gray-900">S02.5</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-gray-200 bg-gray-50 font-bold">치킨 먹다 이 깨짐</td>
                  <td className="p-3 border-r border-gray-200 text-red-500 font-bold">❌ 한 푼도 없음</td>
                  <td className="p-3 text-emerald-600 font-bold">✅ 정액 보상</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 12
export function Slide12() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 3 ① 실전</div>
      <h2 className="text-4xl font-black text-gray-900">치아파절 던지기 — 어금니 바사삭 떡밥</h2>
      
      <div className="bg-gray-100 border border-gray-300 p-6 rounded-2xl shadow-sm text-gray-800 font-bold text-lg leading-relaxed mt-4">
        <strong className="text-blue-600">실제 지급 사례:</strong> 종합보험 가입 고객, 치킨 섭취 중 어금니 파절 → S02.5 코드 진단서 발급 → 골절진단비 180만 원 수령. 치료비 20만 원 제외 순수익 160만 원. <span className="underline decoration-blue-400 decoration-2 underline-offset-4">이 사례를 스마트폰에 캡처해 보여줄 것.</span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-8 text-2xl">
        <FlowStep num="1" title="정의" desc="치아 파절 시 정액 지급" />
        <FlowStep num="2" title="실행" desc="닭고기 섭취 중 치아 파절" />
        <FlowStep num="3" title="사례" desc="180만 원 보험금 수령" />
        <FlowStep num="4" title="공감" desc="연골 씹다 깨진 경험" />
        <FlowStep num="5" title="질문" desc="이 담보 입석시 있으신가요?" />
        <FlowStep num="6" title="정보수집" desc="핸드폰, 시스템 조회" />
      </div>
    </div>
  );
}

// SLIDE 13
export function Slide13() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4 overflow-y-hidden">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 3 ② 이론</div>
      <h2 className="text-3xl font-black text-gray-900 border-b pb-4">자동차사고 부상치료비 (자부상) — <span className="text-blue-600">사전적 정의와 구조</span></h2>
      
      <div className="space-y-6">
        <div>
          <p className="font-black text-xl text-gray-800">📖 자부상 담보란?</p>
          <p className="text-gray-700 font-medium">자동차 사고 발생 시, 부상 등급(1급~14급)에 따라 치료비를 정액 지급하는 특약. 자동차보험의 대인배상과 별개로 지급되는 순수 정액형 담보.</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
          <span className="font-black text-amber-700 block">💡 핵심 혜택</span>
          <p className="text-amber-900 font-bold">과실 비율 무관! 내 과실 100%여도 수령 가능. 가장 경미한 단순 염좌(목·허리 뻐근)로 한의원 통원 1회만 해도 14급 기준 정액 지급.</p>
        </div>

        <div>
          <p className="font-black text-xl text-gray-800">📊 부상 등급별 지급 예시</p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-center border-collapse text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b border-r border-gray-200 font-bold text-gray-800">등급</th>
                  <th className="p-3 border-b border-r border-gray-200 font-bold text-gray-800">부상 유형</th>
                  <th className="p-3 border-b border-gray-200 font-bold text-gray-800">지급액 예시</th>
                </tr>
              </thead>
              <tbody className="font-medium text-gray-700">
                <tr>
                  <td className="p-3 border-b border-r border-gray-200 bg-gray-50 font-bold">1급</td>
                  <td className="p-3 border-b border-r border-gray-200">척추 골절 / 사지 절단</td>
                  <td className="p-3 border-b border-gray-200 font-bold text-blue-600">최대 3,000만 원</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-r border-gray-200 bg-gray-50 font-bold">7급</td>
                  <td className="p-3 border-b border-r border-gray-200">손목 골절 / 인대 파열</td>
                  <td className="p-3 border-b border-gray-200 font-bold">약 200~500만 원</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-r border-gray-200 bg-gray-50 font-bold">11급</td>
                  <td className="p-3 border-b border-r border-gray-200">뇌진탕</td>
                  <td className="p-3 border-b border-gray-200 font-bold">약 60~100만 원</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-gray-200 bg-gray-50 font-bold">14급</td>
                  <td className="p-3 border-r border-gray-200">단순 염좌 / 목·허리 뻐근</td>
                  <td className="p-3 font-bold text-emerald-600">약 30~50만 원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 14
export function Slide14() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 3 ② 실전</div>
      <h2 className="text-4xl font-black text-gray-900">자부상 던지기 — 운전자 필수 치트키</h2>
      
      <div className="bg-gray-100 border border-gray-300 p-6 rounded-2xl shadow-sm text-gray-800 font-bold text-lg leading-relaxed mt-4">
        <strong className="text-blue-600">실제 지급 사례:</strong> 고객 A씨, 후방 추돌 사고 → 목 단순 염좌(14급) → 한의원 통원 1회 → 자부상 특약 100만 원 정액 수령. 자동차보험 합의금 별도.<br/><span className="underline decoration-blue-400 decoration-2 underline-offset-4">두 가지를 동시에 받는 '더블 수령' 가능!</span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-8 text-2xl">
        <FlowStep num="1" title="정의" desc="한의원 치료, 목 뻐근해도 정액 지급" />
        <FlowStep num="2" title="성과" desc="같이 타면 자동차 보험 슬쩍 언급" />
        <FlowStep num="3" title="사례" desc="합의금 외 수백만 원 상해 수령" />
        <FlowStep num="4" title="공감" desc="사고는 예고 없이 누구에게나 발생" />
        <FlowStep num="5" title="질문" desc="이 황금 보장, 가입되어 있나요?" />
        <FlowStep num="6" title="정보수집" desc="생년월일 말해주면 즉시 시스템 조회" />
      </div>
    </div>
  );
}

// SLIDE 15
export function Slide15() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 3 ③ 실전</div>
      <h2 className="text-4xl font-black text-gray-900">수술비 던지기 — 생활 밀착형 보상</h2>
      
      <div className="bg-gray-100 border border-gray-300 p-6 rounded-2xl shadow-sm text-gray-800 font-bold text-lg leading-relaxed mt-4 mb-4">
        <strong className="text-blue-600">실제 지급 사례:</strong> 고객 B씨, 피부과 쥐젖 제거 시술비 3만 원 → 질병수술비 + 종수술비(1종) 중복 수령 → 총 140만 원 보상. 시술비 대비 46배 수령. <span className="text-red-600">"이걸 이제 알았어?" 반응 유도 완료.</span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-4 text-2xl">
        <FlowStep num="1" title="정의" desc="대장 용종, 쥐젖 등 가벼운 수술도 보장" />
        <FlowStep num="2" title="실행" desc="가볍게 최근 건강검진 여부 물어보세요" />
        <FlowStep num="3" title="사례" desc="보장받은 사례 (낸돈 < 받은돈)" />
        <FlowStep num="4" title="공감" desc="주변에서 흔히 발생하는 생활 질환" />
        <FlowStep num="5" title="질문" desc="기존 보험에서 해당 케이스 보장되나요?" />
        <FlowStep num="6" title="정보수집" desc="보장 앱을 열어 분석" />
      </div>
    </div>
  );
}

// SLIDE 16
export function Slide16() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4 overflow-y-hidden">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 3 ④ 이론</div>
      <h2 className="text-3xl font-black text-gray-900 border-b pb-4">일상생활배상책임 (일배책) — <span className="text-blue-600">사전적 정의와 활용범위</span></h2>
      
      <div className="space-y-6">
        <div>
          <p className="font-black text-xl text-gray-800">📖 일배책이란?</p>
          <p className="text-gray-700 font-medium">일상생활 중 우연한 사고로 타인의 신체(대인) 또는 재물(대물)에 민사상 법적 배상책임을 질 때 발생하는 비용을 보상하는 손보사 특약.</p>
        </div>

        <div className="flex justify-between gap-4 bg-gray-50 border border-gray-200 p-4 rounded-xl text-center shadow-sm">
          <div className="flex-1"><span className="text-gray-500 text-sm font-bold block mb-1">보장 한도</span><b className="text-blue-600 text-lg">최대 1억 원~</b></div>
          <div className="flex-1 border-l border-gray-200"><span className="text-gray-500 text-sm font-bold block mb-1">월 보험료</span><b className="text-blue-600 text-lg">몇백원~1천원대</b></div>
          <div className="flex-1 border-l border-gray-200"><span className="text-gray-500 text-sm font-bold block mb-1">가입 단위</span><b className="text-blue-600 text-lg">피보험자 1인+가족</b></div>
        </div>
        
        <div>
          <p className="font-black text-xl text-gray-800">🏠 보장 범위 (광범위!)</p>
          <div className="grid grid-cols-2 gap-3 text-gray-700 font-bold">
            <p className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">💧 윗집 누수 → 아랫집 인테리어 피해</p>
            <p className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">📺 자녀가 친구집 고액 TV 파손</p>
            <p className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">🐕 산책중 반려견이 타인 물림 사고</p>
            <p className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">📱 지나가는 행인 접촉으로 휴대폰 파손</p>
            <p className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm col-span-2">🚴‍♂️ 자전거 사고로 타인 골절 부상</p>
          </div>
        </div>

        <div className="bg-blue-600 text-white p-4 rounded-xl text-center font-bold shadow-md">
          → 대인 자부담 X, 대물 자부담 O (단, 등본상 배상책임 2개 이상이면 자부담 X)
        </div>
      </div>
    </div>
  );
}

// SLIDE 17
export function Slide17() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 3 ④ 실전</div>
      <h2 className="text-4xl font-black text-gray-900">일배책 던지기 — 일상생활 배상책임 필수 특약</h2>
      
      <div className="bg-gray-100 border border-gray-300 p-6 rounded-2xl shadow-sm text-gray-800 font-bold text-lg leading-relaxed mt-4 mb-4">
        <strong className="text-blue-600">실제 지급 사례:</strong> 고객 C씨, 욕실 배관 노후화로 아랫집 누수 발생 → 아랫집 도배·바닥 공사비 청구 800만 원 → 일배책 특약으로 전액 보상 처리. 고객 부담 0원. <span className="text-emerald-600">"이거 없었으면 어쩔 뻔 했어" 반응 즉각 유발.</span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-4 text-2xl">
        <FlowStep num="1" title="정의" desc="일상생활 중 타인에게 입힌 손해 1억 보장" />
        <FlowStep num="2" title="실행" desc="누수 피해나 자녀의 기물파손 이야기" />
        <FlowStep num="3" title="사례" desc="누수로 인한 아랫집 수리비 전액 해결" />
        <FlowStep num="4" title="공감" desc="자녀가 TV를 깨거나 타인 재물 손해 공감" />
        <FlowStep num="5" title="질문" desc="이 놀라운 보장이 고객님 보험에 있나요?" />
        <FlowStep num="6" title="정보수집" desc="지금 가입하신 보험사가 어디인지 확인" />
      </div>
    </div>
  );
}

// SLIDE 18
export function Slide18() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 4</div>
      <h2 className="text-4xl font-black text-gray-900 mb-2">상담 — 설명하지 말고 진단하라</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm">
          <h5 className="font-black text-red-800 mb-2 flex items-center gap-2">❌ 자판기 설계사 (금지)</h5>
          <p className="text-gray-700 font-medium leading-relaxed">상품 설명서를 처음부터 끝까지 읊는다. 고객은 10분 후 졸고 있다. 정보 과부하는 계약 의욕 하락.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-sm">
          <h5 className="font-black text-emerald-800 mb-2 flex items-center gap-2">✅ 전문형 설계사 (지향)</h5>
          <p className="text-gray-700 font-medium leading-relaxed">엑스레이(보장분석표)를 화면에 띄우고, 뼈 때리는 질문으로 고객이 스스로 문제를 발견하게 유도한다.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-md space-y-4">
        <div className="flex gap-6 items-start">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0">01</div>
          <div><h4 className="font-black text-gray-800 text-lg mb-1">보장분석표 화면 공유</h4><p className="text-gray-600 font-medium">기존 보험을 앱으로 불러와 시각화. "이게 고객님 현재 방어막입니다."</p></div>
        </div>
        <div className="flex gap-6 items-start">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0">02</div>
          <div><h4 className="font-black text-gray-800 text-lg mb-1">핵심 공백 지적</h4><p className="text-gray-600 font-medium">"여기, 여기, 여기 이 세 곳이 비어 있네요." (고객이 직접 확인하게 한다)</p></div>
        </div>
        <div className="flex gap-6 items-start">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0">03</div>
          <div><h4 className="font-black text-gray-800 text-lg mb-1">니즈 환기 질문</h4><p className="text-gray-600 font-medium">"만약 내일 사고가 나면 이 상태로 얼마나 받으실 것 같으세요?" (쿠션화법 활용)</p></div>
        </div>
        <div className="flex gap-6 items-start">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0">04</div>
          <div><h4 className="font-black text-gray-800 text-lg mb-1">솔루션 제안</h4><p className="text-gray-600 font-medium">"월 O만 원 핸드폰 요금보다 저렴한 금액으로 구멍난 이 세 곳의 보장 완벽하게 채울 수 있습니다."</p></div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 19
export function Slide19() {
  return (
<div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 4 심화</div>
      <h2 className="text-4xl font-black text-gray-900 mb-4">자주 마주치는 보험 격파 비유법</h2>
      
      <div className="space-y-5 flex-1">
        
        {/* ① 30년납의 함정 */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-row items-center gap-8">
          <div className="w-1/4 shrink-0 border-r-2 border-gray-100 pr-4 pl-10">
            <h5 className="font-black text-2xl text-blue-600">① 30년납의 함정</h5>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-gray-700 font-medium text-lg"><b className="text-gray-900">비유:</b> "스마트폰 할부를 30년으로 하겠어요?"</p>
            <p className="text-gray-700 font-medium text-lg"><b className="text-gray-900">현실:</b> 납입 기간이 길수록 총 납입 보험료가 기하급수적으로 증가.</p>
          </div>
        </div>

        {/* ② CI보험의 덫 */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-row items-center gap-8">
          <div className="w-1/4 shrink-0 border-r-2 border-gray-100 pr-4 pl-10">
            <h5 className="font-black text-2xl text-blue-600">② CI보험의 덫</h5>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-gray-700 font-medium text-lg"><b className="text-gray-900">비유:</b> "박살 나야만 고쳐주는 액정 보험"</p>
            <p className="text-gray-700 font-medium text-lg"><b className="text-gray-900">현실:</b> 중증 상태(암 말기, 뇌졸중 확진)여야만 지급. 경미한 초기 진단엔 한 푼도 안 나온다.</p>
          </div>
        </div>

        {/* ③ 좁은 보장 범위 */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-row items-center gap-8">
          <div className="w-1/4 shrink-0 border-r-2 border-gray-100 pr-4 pl-10">
            <h5 className="font-black text-2xl text-blue-600">③ 좁은 보장 범위</h5>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-gray-700 font-medium text-lg"><b className="text-gray-900">비유:</b> "뇌 질환 91%는 보장 안 되는 9% 올인 보험" <span className="text-base text-gray-500 font-bold">(올인보험 vs 올인원케어보험)</span></p>
            <p className="text-gray-700 font-medium text-lg"><b className="text-gray-900">현실:</b> '뇌출혈'만 보장하면 뇌혈관(초기), 뇌경색, 뇌종양(중증) 등 대부분의 뇌 관련 질환이 제외.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// SLIDE 20
export function Slide20() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 5 & STEP 6</div>
      <h2 className="text-4xl font-black text-gray-900 mb-6">클로징 & 증권전달 — 약속과, 세트 메뉴의 시작</h2>
      
      <div className="grid grid-cols-2 gap-8 h-full">
        <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm flex flex-col justify-center text-center">
          <div className="mx-auto bg-blue-100 text-blue-600 p-4 rounded-full w-max mb-6"><PenTool className="w-12 h-12"/></div>
          <h5 className="font-black text-2xl text-blue-600 mb-4 border-b pb-4">STEP 5. 클로징</h5>
          <p className="text-gray-800 font-medium text-lg leading-relaxed mb-4">
            <b className="text-gray-900">비유:</b> 시식코너.<br/> 제대로된 상담(R.P) 맛을 봤다면, 계약 당연하다. <br/><br/><br/>
          </p>
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 font-bold">
          <br/>"계약은 구걸이 아닌 '고객 결심 대행'"<br/><br/>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl flex flex-col justify-center text-center text-white">
          <div className="mx-auto bg-gray-800 text-emerald-400 p-4 rounded-full w-max mb-6"><FileText className="w-12 h-12"/></div>
          <h5 className="font-black text-2xl text-emerald-400 mb-4 border-b border-gray-700 pb-4">STEP 6. 증권전달 (2차전 시작)</h5>
          <p className="text-gray-300 font-medium text-lg leading-relaxed mb-4">
            <b className="text-white">비유:</b> 맥도날드 업셀링.<br/>"세트로 하시겠어요? 감자튀김·콜라 추가요?" — 계약 완료 후 증권 전달 시 추가 니즈 발굴.
          </p>
          <ul className="text-sm font-bold text-gray-400 space-y-2 text-left bg-gray-800 p-4 rounded-xl">
            <li>• 재테크 연금 상품 제안</li>
            <li>• 부족 담보 추가 설계</li>
            <li>• 가족 보험 점검 제안</li>
            <li>• 다음 미팅 자연스럽게 셋팅</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// SLIDE 21
export function Slide21() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">STEP 7</div>
      <h2 className="text-4xl font-black text-gray-900">소개요청 — 사냥꾼은 굶고 농부는 풍요롭다</h2>
      
      <p className="font-black text-xl text-gray-800 mt-4 mb-2 flex items-center gap-2">🌾 소개 유도 5대 행동</p>
      
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center font-black mb-3">01</div>
          <p className="font-bold text-gray-700 text-xl">감사 표현 먼저<br/>(기프트)</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center font-black mb-3">02</div>
          <p className="font-bold text-gray-700 text-xl">소개만남 성과 공유<br/>(선조치 후보고)</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center font-black mb-3">03</div>
          <p className="font-bold text-gray-700 text-xl">자연스러운 질문<br/>(사례)</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center font-black mb-3">04</div>
          <p className="font-bold text-gray-700 text-xl">구체적 요청<br/>(타겟팅)</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center font-black mb-3">05</div>
          <p className="font-bold text-gray-700 text-xl">마음사기<br/>(신뢰, 동반자)</p>
        </div>
      </div>

      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-md text-center mt-6">
        <p className="font-black text-xl mb-3">지사 문을 나가며 오늘 바로 시작하라.</p>
        <p className="font-medium">풀리스트 100명 공통 양식에 작성 완료 · TA 10명 전화·카톡·DM으로 돌리기 · 던지기 스크립트 거울 보고 5회 연습</p>
      </div>

      <div className="bg-gray-900 text-white p-6 rounded-2xl text-center font-black text-3xl shadow-xl mt-4">
        "상상 말고 실행하십시오!"
      </div>
    </div>
  );
}

// SLIDE 22
export function Slide22() {
  return (
    <div className="h-full flex flex-col justify-center gap-6 py-4">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm w-max mb-2">결론</div>
      <h2 className="text-4xl font-black text-gray-900 text-center">7단계 영업 프로세스 — 전체 요약</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { num: "1", title: "STEP 1 · 풀리스트", desc: "50명 명단 정비" },
          { num: "2", title: "STEP 2 · TA (싯플랜)", desc: "만남 약속만 잡는다" },
          { num: "3", title: "STEP 3 · 던지기", desc: "보험 X 보상사례 O" },
          { num: "4", title: "STEP 4 · 상담", desc: "의사처럼 진단" },
          { num: "5", title: "STEP 5 · 클로징", desc: "결심 대행" },
          { num: "6", title: "STEP 6 · 증권전달", desc: "업셀링 세트 메뉴" },
          { num: "7", title: "STEP 7 · 소개요청", desc: "농부의 씨앗" }
        ].map((item, i) => (
          <div key={i} className={`bg-white border border-gray-200 p-3 rounded-2xl shadow-sm text-center flex flex-col ${i === 6 ? 'col-span-2' : ''}`}>
            <div className="text-2xl font-black text-blue-600 mb-2">{item.num}</div>
            <h5 className="font-bold text-gray-900 mb-1 text-xl">{item.title}</h5>
            <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-3xl text-center shadow-xl">
        <p className="text-xl font-medium italic leading-relaxed mb-4">
          "영업은 재능이 아니라 시스템입니다.<br/>이 7단계 루틴을 패턴화 하는 순간, 여러분들의 영업력은 한계가 없을 겁니다."
        </p>
      </div>

      <p className="text-center font-black text-blue-600 text-2xl">여러분들의 첫 클로징 그리고 첫 사업을 응원하겠습니다!</p>
    </div>
  );
}