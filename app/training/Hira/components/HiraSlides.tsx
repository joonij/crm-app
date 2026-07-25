"use client";

import { Search, Coins, FileText, LockOpen, FileCheck, Stethoscope, AlertTriangle, Syringe, Landmark, CheckCircle2 } from "lucide-react";

// SLIDE 1: 대문
export function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-10 py-4 bg-blue-50 text-blue-700 rounded-full font-bold text-xl tracking-widest z-10">
        마스터 교육 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8 z-10 tracking-tight">
        심사평가원 실전 활용<br />
        <span className="text-blue-600">숨은 보험금을 찾기</span>
      </h1>
      <p className="text-3xl text-gray-500 mt-6 font-medium z-10">압도적 신뢰 구축과 완벽한 리모델링을 위한 필수 과정</p>
    </div>
  );
}

// SLIDE: 심사평가원(HIRA) 소개 및 조회 한계
export function SlideCh1() {
  return (
    <div className="h-full flex flex-col justify-center gap-2">
      <div className="text-center">
        <h3 className="text-2xl font-black text-gray-700">보험 설계를 시작하기 전, 반드시 알아야 할 조회 시스템의 기준과 범위</h3>
      </div>

      <div className="grid grid-cols-2 gap-10 mt-4">
        {/* 1. 장점 및 핵심 기능 */}
        <div className="bg-teal-50 border-2 border-teal-200 rounded-3xl p-10 flex flex-col shadow-sm justify-between">
          <div>
            <div className="bg-teal-600 text-white font-black text-xl py-2 px-6 rounded-xl inline-block mb-6 shadow-md">핵심 기능</div>
            <h4 className="text-3xl font-black text-teal-900 mb-6">5년치 건강보험 '급여' 내역 조회</h4>
            <p className="text-xl text-gray-800 font-medium leading-relaxed">
              지난 5년간 내가 이용한 병원, 약국 진료 이력을 낱낱이 확인할 수 있는 곳입니다.<br/><strong className="text-teal-700">보험가입 병력사항을 가장 세심하게 체크</strong>할 수 있는 최고의 데이터베이스입니다.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-teal-100 mt-6 shadow-sm">
            <p className="text-lg font-bold text-teal-800">💡 3대 질환이나 과거 수습 이력을 누락 없이 잡아내는 열쇠</p>
          </div>
        </div>

        {/* 2. 유의사항 (한계점) */}
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-10 flex flex-col shadow-sm justify-between">
          <div>
            <div className="bg-red-500 text-white font-black text-xl py-2 px-6 rounded-xl inline-block mb-6 shadow-md">반드시 유의할 점</div>
            <h4 className="text-3xl font-black text-red-900 mb-6">조회 공백 및 '비급여' 제외</h4>
            <ul className="space-y-4 text-xl font-bold text-gray-800">
              <li className="flex items-start gap-3">
                <span className="text-red-600 text-2xl font-black">❌</span>
                <span>조회 시점 기준 <strong className="text-red-700">최근 3개월 자료는 조회되지 않음</strong> (심사 및 전산 반영 기간 소요)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 text-2xl font-black">❌</span>
                <span>건강보험이 적용되지 않는 <strong className="text-red-700">'비급여' 진료 내역은 나오지 않음</strong> (도수치료, 비급여 주사 등은 별도 확인 필요)</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl border border-red-100 mt-6 shadow-sm">
            <p className="text-lg font-bold text-red-600">⚠️ 최근 3개월 병력과 비급여 항목은 고객 문진을 통해 반드시 교차 체크!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 2: 심평원, 왜 해야 할까? (동기부여)
export function SlideCh2() {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-4">고객 100명이면 100명 모두 놓친 보험금이 있습니다</h3>
        <p className="text-xl text-gray-500 font-medium">단순 보장분석을 넘어, 실제 돈을 찾아주는 '진짜 전문가'로 포지셔닝하세요</p>
      </div>

      <div className="grid grid-cols-2 gap-10 mt-6 items-center">
        <div className="bg-white border-2 border-teal-200 rounded-3xl p-10 shadow-sm text-center flex flex-col items-center justify-center h-[360px]">
          <div className="bg-teal-100 text-blue-700 p-6 rounded-full mb-6">
            <Coins className="w-16 h-16" />
          </div>
          <h4 className="text-3xl font-black text-gray-900 mb-4">가장 많이 놓치는 항목</h4>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-lg font-bold">치과 치료</span>
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-lg font-bold">약제비</span>
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-lg font-bold">한의원</span>
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-lg font-bold">도수치료</span>
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-lg font-bold">물리치료</span>
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-lg font-bold">자잘한 수술/처치</span>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-10 shadow-sm flex flex-col justify-center h-[360px]">
          <h4 className="text-2xl font-black text-blue-900 mb-6">오프닝 화법 (스크립트)</h4>
          <div className="bg-white p-6 rounded-2xl border border-blue-100 text-xl font-medium text-gray-800 leading-relaxed shadow-inner">
            "고객님, 지금 가입하신 보험에서 보장금액이 정확히 얼마인지, <strong>그동안 놓치고 못 받으신 숨은보험금은 없는지</strong> 꼼꼼하게 확인해 드리려 합니다.<br/><br/>
            점검을 위한 심사평가원 <strong>본인인증</strong> 진행 도와드리겠습니다."
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 3: 자료 추출 프로세스
export function SlideCh3() {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex justify-between items-center gap-4 mt-6">
        {[
          { step: "1. 본인인증", txt: "1. 심사평가원 접속\n2. 내 진료사항 열람\n3. 인증", color: "bg-blue-600" },
          { step: "2. 옵션 설정", txt: "'상병항목 표시'\n'민감상병 표시'\n체크\n\n대상기간 '5년' 설정", color: "bg-emerald-600" },
          { step: "3. 파일 다운", txt: "'개인진료정보요약'\n'기본진료내역'\n'세부진료정보'\n'처방조제정보'\n\n4개 PDF 다운로드", color: "bg-orange-500" },
          { step: "4. 암호 해제", txt: "1. PDF 실행\n2. 생년월일 인증\n3. 인쇄하기\n4. 'PDF로 인쇄'하여 재저장", color: "bg-red-500" },
          { step: "5. 업로드", txt: "암호가 해제된 파일을\n'케어링크' 시스템에 업로드", color: "bg-indigo-600" }
        ].map((item, idx, arr) => (
          <div key={idx} className="flex-1 flex items-center">
            <div className="flex-1 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col text-center h-[300px]">
              <div className={`${item.color} text-white py-4 flex flex-col gap-1`}>
                <span className="text-lg font-black">{item.step}</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 text-[17px] font-bold text-gray-700 bg-gray-50 whitespace-pre-line leading-relaxed break-keep">
                {item.txt}
              </div>
            </div>
            {idx < arr.length - 1 && <div className="text-gray-400 text-3xl font-black mx-2">→</div>}
          </div>
        ))}
      </div>

      <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl mt-4 flex items-center justify-between border border-gray-800">
        <div className="flex items-center gap-4">
          <FileText className="text-teal-400 w-8 h-8" />
          <span className="text-xl font-bold">(필수)다운로드 파일명 규칙 예시</span>
        </div>
        <div className="bg-gray-800 px-6 py-3 rounded-xl text-xl font-black tracking-wider border border-gray-700">
          <p className="text-gray-400 text-lg font-medium mx-3">260726_홍길동_요약</p>
          <p className="text-gray-400 text-lg font-medium mx-3">260726_홍길동_기본</p>
          <p className="text-gray-400 text-lg font-medium mx-3">260726_홍길동_세부</p>
          <p className="text-gray-400 text-lg font-medium mx-3">260726_홍길동_처방</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 4: 서류 분석 요령 (핵심)
export function SlideCh4() {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-4">수많은 기록 속에서 돈이 되는 <span className="text-red-600">핵심 키워드</span>와 <span className="text-red-600">코드</span>를 찾아냅니다</h3>
      </div>

      <div className="grid grid-cols-2 gap-10 mt-4">

        {/* 세부진료사항 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-10 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-6 border-b border-blue-200 pb-4">
            <Syringe className="w-10 h-10 text-blue-600" />
            <h4 className="text-3xl font-black text-blue-900">'세부' 진료사항</h4>
          </div>
          <p className="text-xl text-blue-800 font-bold mb-4">처치/수술/시술 청구 누락을 찾아내는 보물창고</p>
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-inner flex-1">
            <p className="text-xl font-bold text-gray-800 mb-4">아래 키워드가 보이면 무조건 체크!</p>
            <div className="flex gap-4">
              <span className="bg-blue-600 text-white px-6 py-3 rounded-xl text-2xl font-black">~ 처치</span>
              <span className="bg-blue-600 text-white px-6 py-3 rounded-xl text-2xl font-black">~ 술</span>
            </div>
            <p className="text-gray-500 mt-4 text-lg font-medium">고객은 단순 치료라 생각해서 실비만 받고<br/>수술비는 청구하지 않은 경우가 대다수입니다.</p>
          </div>
        </div>
        
        {/* 기본진료사항 */}
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-10 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-6 border-b border-red-200 pb-4">
            <Stethoscope className="w-10 h-10 text-red-600" />
            <h4 className="text-3xl font-black text-red-900">'기본' 진료사항</h4>
          </div>
          <p className="text-lg text-gray-600 font-bold">아래 질병 분류 기호(알파벳)를 주목</p>
          <p className="text-2xl text-red-800 font-bold mb-6">보험 가입이 어렵거나 유병자 상품으로 설계</p>
          <ul className="space-y-4 text-xl font-bold text-gray-800 flex-1">
            <li className="flex gap-4 items-start">
              <span className="bg-white border border-red-200 text-red-600 px-3 py-1 rounded-lg">R 코드</span>
              <span>증상 및 징후 (미확진 상태의 검사 등)</span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="bg-white border border-red-200 text-red-600 px-3 py-1 rounded-lg">F 코드</span>
              <span>정신 및 행동 장애 (정신과 관련)</span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="bg-white border border-red-200 text-red-600 px-3 py-1 rounded-lg">G 코드</span>
              <span>신경계통 질환 (두통, 수면장애 등)</span>
            </li>
          </ul>
          </div>
      </div>
    </div>
  );
}

// SLIDE 5: 선 리모델링 후 청구 (가장 중요)
export function SlideCh5() {
  return (
    <div className="h-full flex flex-col justify-center">

      <div className="bg-red-50 border-4 border-red-500 rounded-3xl p-10 shadow-lg text-center relative">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-8 py-3 rounded-full flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-8 h-8" />
          <span className="text-2xl font-black">치명적 실수 주의</span>
        </div>
        
        <p className="text-3xl font-black text-red-900 mb-4 leading-relaxed">
          "숨은 보험금을 찾았다고 기쁜 마음에 즉시 청구부터 하면 안 됩니다!"
        </p>

        <div className="flex gap-6 mt-4">
          <div className="flex-1 bg-white p-8 rounded-2xl border-2 border-gray-200">
            <h4 className="text-2xl font-black text-gray-400 mb-4">청구를 먼저 할 경우</h4>
            <p className="text-xl font-bold text-gray-700 leading-relaxed">
              보험사에 병력 기록이 즉시 공유되어,<br/>
              <strong className="text-red-600 text-2xl">신규 보험 가입(리모델링)이 거절되거나<br/>심각한 제한</strong>을 받게 됩니다.
            </p>
          </div>
          <div className="flex-1 bg-white p-8 rounded-2xl border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] transform scale-105">
            <h4 className="text-2xl font-black text-emerald-600 mb-4">올바른 순서</h4>
            <p className="text-xl font-bold text-gray-800 leading-relaxed">
              1. 심사평가원 자료를 토대로 아쉬운 보장 안내<br/>
              2. 부족한 보장 <strong>리모델링</strong><br/>
              <strong className="text-emerald-600 text-2xl">3. 숨은 보험금 일괄 청구</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-2">
        <div className="flex-1 bg-gray-900 text-white rounded-2xl p-6 shadow-md flex items-center gap-4 border border-gray-800">
          <FileCheck className="w-12 h-12 text-teal-400 shrink-0" />
          <div>
            <h5 className="text-xl font-black mb-1 text-teal-300">(필수) 병원 서류 발급을 위한 위임장 작성</h5>
            <p className="text-gray-300 font-medium">대리 발급 시 고객에게 "병원에서 본인 확인 전화가 갈 수 있다"고 반드시 사전 인지시킵니다</p>
          </div>
        </div>
        <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 shadow-md flex items-center gap-4">
          <Landmark className="w-12 h-12 text-indigo-500 shrink-0" />
          <div>
            <h5 className="text-xl font-black mb-1 text-indigo-800">(선택) 현대해상 '고등 및 심사' 시스템</h5>
            <p className="text-indigo-700 font-medium">고등을 통해 병력사항을 문의하면 과거 실비 청구 여부를 쉽게 더블체크 할 수 있습니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 6: 서류 발급 및 청구/방어 전략
export function SlideCh6() {
  return (
    <div className="h-full flex flex-col justify-center gap-8">

      <div className="grid grid-cols-2 gap-8 mt-4">
        {/* 서류 발급 */}
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-10 flex flex-col shadow-sm">
          <h4 className="text-2xl font-black text-emerald-800 mb-6 border-b border-emerald-100 pb-4">1. 서류 재발급 발품 팔기</h4>
          <p className="text-lg text-gray-700 font-medium leading-relaxed mb-6">
            심평원 자료를 바탕으로 <strong>최근 3년 이내</strong> 방문한 병원 및 약국을 직접 찾아가 아래 서류를 재발급 받습니다.
          </p>
          <ul className="space-y-3 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 font-bold text-emerald-900 text-xl">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-emerald-500"/> 진료비 영수증</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-emerald-500"/> 진료비 세부내역서</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-emerald-500"/> 약국 영수증</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-emerald-500"/> 수술 확인서</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-emerald-500"/> 입원 확인서</li>
          </ul>
        </div>

        {/* 더블 청구 및 방어화법 */}
        <div className="bg-white border-2 border-orange-200 rounded-3xl p-10 flex flex-col shadow-sm">
          <h4 className="text-2xl font-black text-orange-800 mb-6 border-b border-orange-100 pb-4">2. 더블 청구와 거절처리</h4>
          
          <div className="space-y-6">
            <div>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm font-bold mb-2 inline-block">고객이 이미 받았다고 할 때</span>
              <p className="text-lg text-gray-800 font-bold bg-gray-50 p-4 rounded-xl border border-gray-200">
                "고객님, 실손의료비는 받으셨겠지만 특정 '처치'나 '수술비' 담보에서 누락되었을 확률이 매우 높습니다. 제가 한 번 더 확실하게 청구 넣어보겠습니다!"
              </p>
            </div>
            
            <div>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm font-bold mb-2 inline-block">결국 미지급(면책) 되었을 때 방어</span>
              <p className="text-lg text-gray-800 font-bold bg-gray-50 p-4 rounded-xl border border-gray-200">
                "고객님, 해당 건을 샅샅이 뒤져 청구했는데, 보험사 측에서 약관상 사유에 해당한다며 지급을 거절하네요. 제가 담당자 였다면 면책사항 발생되지 않게 꼼꼼하게 체크했을텐데 아쉽습니다."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 7: Summary
export function SlideCh7() {
  return (
    <div className="h-full flex flex-col justify-center">

      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="bg-white border-2 border-teal-200 rounded-3xl p-10 shadow-sm flex flex-col gap-4">
           <div className="text-5xl font-black text-blue-600 mb-2">1</div>
           <p className="text-2xl font-bold text-gray-800 leading-relaxed"><strong className="text-blue-700">본인인증과 4대 서류 추출</strong>은 보장분석의 신뢰를 100배 높인다.</p>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-3xl p-10 shadow-sm flex flex-col gap-4">
           <div className="text-5xl font-black text-blue-600 mb-2">2</div>
           <p className="text-2xl font-bold text-gray-800 leading-relaxed">세부진료사항의 <strong className="text-blue-700">'~처치, ~술'</strong>은 수술비 누락을 찾는 마법의 키워드다.</p>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-3xl p-10 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex flex-col gap-4 transform scale-105 z-10">
           <div className="text-5xl font-black text-red-600 mb-2">3</div>
           <p className="text-2xl font-bold text-gray-800 leading-relaxed"><strong className="text-red-600 text-3xl">선(先) 리모델링, 후(後) 청구!</strong><br/>순서가 바뀌면 가입이 거절될수있다.</p>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-3xl p-10 shadow-sm flex flex-col gap-4">
           <div className="text-5xl font-black text-blue-600 mb-2">4</div>
           <p className="text-2xl font-bold text-gray-800 leading-relaxed">못 받더라도 보험사를 탓하며 <strong className="text-blue-700">기존 설계사에 대한 신뢰를 </strong>를 깨며 나를 어필한다.</p>
        </div>
      </div>
    </div>
  );
}