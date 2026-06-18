"use client";

import { useState } from "react";
import { 
  Building2, TrendingUp, ShieldCheck, 
  Landmark, Quote, Snowflake, 
  Droplet, Coins, Umbrella,
  Timer, TrendingDown, ShieldPlus, LineChart
} from "lucide-react";

// SLIDE 1: 대문
export function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 relative overflow-hidden">
      <div className="px-10 py-4 bg-blue-50 text-blue-700 rounded-full font-bold text-xl tracking-widest z-10">
        사내 마스터 교육 과정 (바른금융파트너스)
      </div>
      <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8 z-10 tracking-tight">
        저축성 상품 교육<br />
        <span className="text-blue-600">금융 건강검진을 통한 자산 극대화 전략</span>
      </h1>
      <p className="text-3xl text-gray-500 mt-6 font-medium z-10">금융기관의 상품과 복리/비과세 이해</p>
    </div>
  );
}

// SLIDE 2: 챕터 1
export function SlideCh1() {
  const [activeAnswers, setActiveAnswers] = useState<Record<number, number>>({});
  const handleAnswerClick = (qId: number, aId: number) => {
    setActiveAnswers(prev => ({ ...prev, [qId]: aId }));
  };

  return (
    <div className="h-full flex flex-col justify-center gap-5">
      <p className="text-gray-600 font-bold mb-4 text-2xl text-center">쉬운 비유로 고객의 숨은 니즈를 깨워보세요.</p>
      
      {[
        { id: 1, type: "1", q: "갑자기 냉장고가 고장 나면 깰 수 있는 저금통이 있나요?", opts: ["충분해요", "조금 부족해요", "당장 없어요"] },
        { id: 2, type: "2", q: "부모님이 아파서 일을 못해도 우리 가족 1년은 거뜬히 밥 먹을 수 있나요?", opts: ["거뜬해요", "걱정돼요", "큰일 나요"] },
        { id: 3, type: "3", q: "지금 모으는 돈, 10년 뒤에 쓸 건가요? 아니면 할아버지/할머니 돼서 쓸 건가요?", opts: ["가까운 미래", "아주 먼 미래", "빨리 불릴래요"] },
        { id: 4, type: "4", q: "나중에 돈 찾을 때, 나라에 세금(15.4%) 안 뺏기는 '마법 주머니'가 있나요?", opts: ["있어요", "잘 몰라요", "없어요"] },
        { id: 5, type: "5", q: "내 돈이 자라나는 모습 중 어떤 게 가장 마음 편한가요?", opts: ["안 다치게! (안전형)", "꾸준하게! (적립형)", "과감하게! (공격형)"] },
      ].map((item) => (
        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-6 w-[55%]">
            <span className="bg-blue-600 text-white text-xl font-bold px-5 py-1 rounded-xl whitespace-nowrap w-[50px] text-center">
              {item.type}
            </span>
            <p className="text-xl font-bold text-gray-800 leading-tight">{item.q}</p>
          </div>
          <div className="flex gap-4 w-[45%]">
            {item.opts.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerClick(item.id, idx)}
                className={`flex-1 text-lg py-1 px-2 rounded-xl border-2 transition-all font-bold truncate ${
                  activeAnswers[item.id] === idx 
                  ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                  : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// SLIDE 3: 챕터 2 벤다이어그램
export function SlideCh2() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative">
      <p className="text-gray-600 font-bold mb-10 text-center text-2xl">각 금융기관의 고유한 장점이 결합된 하이브리드 상품을 이해해야 합니다.</p>
      
      <div className="relative w-[600px] h-[550px]">
        {/* 은행 */}
        <div className="absolute top-0 left-0 w-[340px] h-[340px] rounded-full border-[12px] border-blue-200 bg-blue-50/80 mix-blend-multiply z-10 shadow-inner flex flex-col items-center pt-6 pr-20">
          <Landmark className="w-14 h-14 text-blue-600 mb-2" />
          <span className="text-xl font-black text-blue-900">은행사</span>
          <span className="text-lg text-blue-700 font-bold mt-1">예적금</span>
        </div>
        
        {/* 증권 */}
        <div className="absolute top-0 right-0 w-[340px] h-[340px] rounded-full border-[12px] border-red-200 bg-red-50/80 mix-blend-multiply z-10 shadow-inner flex flex-col items-center pt-6 pl-20">
          <TrendingUp className="w-14 h-14 text-red-600 mb-2" />
          <span className="text-xl font-black text-red-900">증권사</span>
          <span className="text-lg text-red-700 font-bold mt-1">주식/펀드</span>
        </div>
        
        {/* 보험 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full border-[12px] border-emerald-200 bg-emerald-50/80 mix-blend-multiply z-10 shadow-inner flex flex-col items-center justify-end pb-6">
          <ShieldCheck className="w-14 h-14 text-emerald-600 mb-2" />
          <span className="text-xl font-black text-emerald-900">보험사</span>
          <span className="text-lg text-emerald-700 font-bold mt-1">저축/종신</span>
        </div>

        {/* 교집합 라벨 */}
        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-20 text-center w-44">
          <div className="bg-purple-600 text-white text-lg font-bold px-5 py-2.5 rounded-xl shadow-lg">은행사 + 증권사</div>
          <p className="text-base leading-tight mt-2 text-gray-800 font-bold bg-white/95 p-2.5 rounded-lg border border-gray-200 shadow-sm">IRP 계좌</p>
        </div>

        <div className="absolute bottom-[120px] -left-[-60px] z-20 text-center w-44">
          <div className="bg-cyan-600 text-white text-lg font-bold px-5 py-2.5 rounded-xl shadow-lg">보험사 + 은행사</div>
          <p className="text-base leading-tight mt-2 text-gray-800 font-bold bg-white/95 p-2.5 rounded-lg border border-gray-200 shadow-sm">방카슈랑스</p>
        </div>

        <div className="absolute bottom-[120px] -right-[-60px] z-20 text-center w-44">
          <div className="bg-orange-600 text-white text-lg font-bold px-5 py-2.5 rounded-xl shadow-lg">보험사 + 증권사</div>
          <p className="text-base leading-tight mt-2 text-gray-800 font-bold bg-white/95 p-2.5 rounded-lg border border-gray-200 shadow-sm">변액보험</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 4: 단리 vs 복리
export function SlideCh3_1() {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-10 h-[500px]">
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-between text-center shadow-sm">
          <div>
            <h3 className="text-4xl font-black text-gray-800 mb-6">단리 (Simple Interest)</h3>
            <p className="text-xl text-gray-600 leading-relaxed">원금에만 동일한 이자가 붙어 <strong className="text-gray-900">계단식으로 일정하게 상승</strong>합니다.<br/><span className="text-lg">(물가 상승 시 실질적인 화폐 가치는 오히려 하락할 수 있습니다)</span></p>
          </div>
          <div className="flex items-end gap-5 h-56 w-full justify-center">
            {[70, 60, 50, 40, 30].map((height, i) => (
              <div key={i} className="w-20 bg-gray-300 rounded-t-2xl relative flex items-end justify-center pb-4 text-gray-700 font-bold text-xl" style={{ height: `${height}%` }}>
                {i + 1}년
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-12 flex flex-col items-center justify-between text-center shadow-md transform scale-105">
          <div>
            <h3 className="text-4xl font-black text-blue-900 mb-6">복리 (Compound Interest)</h3>
            <p className="text-xl text-blue-700 leading-relaxed"><strong className="text-blue-900">'원금+이자'</strong>에 또 이자가 붙습니다.<br/>시간이 지날수록 곡선을 그리며 기하급수적으로 폭발합니다.</p>
          </div>
          <div className="flex items-end gap-5 h-56 w-full justify-center">
            {[20, 30, 45, 70, 100].map((height, i) => (
              <div key={i} className="w-20 bg-blue-500 rounded-t-2xl relative flex items-end justify-center pb-4 text-white font-bold text-xl transition-all" style={{ height: `${height}%` }}>
                {i + 1}년
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 5: 은행 적금 5% 착시
export function SlideCh3_2() {
  return (
    <div className="h-full flex flex-col justify-center gap-6">
        
        <div className="grid grid-cols-2 gap-8 h-[420px]">
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 flex flex-col relative shadow-sm">
              <div className="absolute -top-4 -left-4 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl shadow-lg border-4 border-white transform -rotate-12">X</div>
              <h3 className="text-2xl font-black text-red-900 mb-6 text-center">착각을 일으키는 은행사 상술</h3>
              
              <div className="space-y-4 flex-1">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
                  <span className="text-gray-600 font-bold">월 적금액</span>
                  <span className="text-lg font-black text-gray-900">100만 원</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
                  <span className="text-gray-600 font-bold">총 납입 원금</span>
                  <span className="text-lg font-black text-gray-900">1,200만 원</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
                  <span className="text-gray-600 font-bold">표면 금리</span>
                  <span className="text-lg font-black text-red-600">연 5%</span>
                </div>
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500 mb-1">고객이 기대한 이자 (1,200만 x 5%)</p>
                  <p className="text-4xl font-black text-red-600 line-through decoration-red-900 decoration-4">600,000원</p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 은행의 실제 계산 (O) */}
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 flex flex-col relative shadow-md transform">
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl shadow-lg border-4 border-white transform rotate-12">O</div>
              <h3 className="text-2xl font-black text-blue-900 mb-4 text-center">은행의 실제 계산법 (단리)</h3>
              
              {/* ⭐️ 변경된 스크롤 영역: 미니 바 차트와 색상 변화 적용 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 mb-4 h-[210px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full relative">
                
                <ul className="text-xs text-gray-600 space-y-3 font-mono mt-2">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const month = i + 1;
                    const remain = 13 - month; // 12, 11, 10 ... 1
                    const pct = Math.round((remain / 12) * 100);
                    
                    // 개월 수에 따른 색상 및 텍스트 변화 로직
                    const isHigh = remain >= 9;
                    const isMid = remain >= 5 && remain < 9;
                    const barColor = isHigh ? 'bg-blue-500' : isMid ? 'bg-blue-300' : 'bg-gray-200';
                    const textColor = isHigh ? 'text-blue-700 font-black' : isMid ? 'text-blue-400 font-bold' : 'text-gray-400 font-medium';

                    return (
                      <li key={month} className="flex flex-col gap-1.5 border-b border-gray-50 pb-2">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xl font-semibold text-gray-700">{month}개월 차 납입금</span>
                          <span className="flex items-center gap-1.5 text-sm">
                            <span className="text-gray-400 text-xl">× 5% ×</span>
                            <span className={`text-xl bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 ${textColor}`}>
                              {remain}/12
                            </span>
                          </span>
                        </div>
                        {/* 시각화 프로그레스 바 */}
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex-1">
                            <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className={`text-[10px] w-[110px] text-right truncate ${textColor}`}>
                            {pct}% 이자율 적용
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="text-center bg-blue-600 rounded-xl p-4 text-white shadow-inner shrink-0">
                <p className="text-sm text-blue-200 mb-1">실제 받는 세전 이자 (실효수익률 약 2.7%)</p>
                <p className="text-4xl font-black">325,000원</p>
              </div>
            </div>
          </div>
      <div className="bg-gray-800 text-white p-5 rounded-2xl text-center shadow-lg mx-auto w-[100%] mt-2 text-xl">
        <span className="font-bold text-yellow-400">링크:</span> <a href="https://zrr.kr/vWejGy" target="_blank" className="hover:underline">네이버 적금 계산기</a>
      </div>
    </div>
  );
}

// SLIDE 6: 덧셈 vs 곱셈
export function SlideCh3_3() {
  return (
    // ⭐️ gap을 6에서 4로 줄이고, 높이를 엄격하게 통제합니다.
    <div className="h-full flex flex-col gap-4 py-2 overflow-hidden">
      <p className="text-gray-500 text-center text-base font-medium shrink-0 text-xl">
        "가난한 사람은 돈을 <strong className="text-gray-800">더하고(+)</strong>, 부자는 돈을 <strong className="text-indigo-600">곱합니다(×)</strong>."
      </p>

      {/* ⭐️ flex-1 min-h-0을 통해 남는 공간에 딱 맞게 카드가 들어가도록 설정 */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* 1. 덧셈의 세계 (단리) */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col relative shadow-sm h-full overflow-hidden">
          <div className="absolute top-3 right-3 bg-gray-100 text-gray-500 w-8 h-8 rounded-full flex items-center justify-center font-black text-xl shrink-0">
            +
          </div>
          <h4 className="text-2xl font-black text-gray-800 mb-1 shrink-0">단리: 덧셈의 세계</h4>
          <p className="text-xl text-gray-500 mb-3 shrink-0">원금만 일하는 1차원적 구조</p>
          
          <div className="flex-1 flex flex-col justify-center items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100 min-h-0">
            <div className="flex items-center text-base md:text-3xl font-black text-gray-400 font-mono tracking-widest text-center flex-wrap justify-center shrink-0">
              100 <span className="text-gray-300 mx-1">+</span> 5 <span className="text-gray-300 mx-1">+</span> 5 <span className="text-gray-300 mx-1">+</span> 5
            </div>
            <div className="text-xl text-gray-500 font-medium bg-white px-3 py-1.5 rounded-full shadow-sm mt-1 text-center shrink-0">
              "매년 똑같은 금액만 쌓입니다"
            </div>
          </div>
        </div>

        {/* 2. 곱셈의 세계 (복리) */}
        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-2xl p-4 flex flex-col relative shadow-md transform h-full overflow-hidden z-10">
          <div className="absolute top-3 right-3 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xl shadow-lg shrink-0">
            ×
          </div>
          <h4 className="text-2xl font-black text-indigo-900 mb-1 shrink-0">복리: 곱셈의 세계</h4>
          <p className="text-xl  text-indigo-700 mb-3 shrink-0">이자가 자본이 되는 3차원적 증식 구조</p>
          
          <div className="flex-1 flex flex-col justify-center items-center gap-2 bg-white rounded-xl p-3 border border-indigo-100 shadow-sm min-h-0">
            <div className="flex items-center text-base md:text-3xl font-black text-indigo-600 font-mono tracking-widest text-center flex-wrap justify-center shrink-0">
              100 <span className="text-indigo-300 mx-1">×</span> 1.05 <span className="text-indigo-300 mx-1">×</span> 1.05 <span className="text-indigo-300 mx-1">×</span> 1.05
            </div>
            <div className="text-xl text-indigo-600 font-bold bg-indigo-100 px-3 py-1.5 rounded-full shadow-inner mt-1 text-center shrink-0 animate-pulse">
              "시간이 갈수록 기하급수적으로 폭발"
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 시간의 마법 타임라인 (결정적 차이) */}
      {/* ⭐️ shrink-0 속성을 유지하여 절대 위 요소에 눌려 찌그러지지 않게 방어 */}
      <div className="bg-gray-900 rounded-2xl p-4 shadow-xl shrink-0 mt-1">
        <h5 className="text-white text-center font-bold text-1xl mb-4">동일한 1,000만 원(연 5%)이 만들어내는 시간의 격차</h5>
        
        <div className="flex justify-between items-center relative px-2">
          {/* 타임라인 연결선 */}
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-gray-700 -translate-y-1/2 z-0"></div>
          
          {/* 10년 후 */}
          <div className="relative z-10 flex flex-col items-center bg-gray-900 px-2">
            <span className="text-gray-400 text-1xl font-bold mb-1">10년 후</span>
            <div className="w-3 h-3 rounded-full bg-gray-600 border border-gray-900 mb-1"></div>
            <div className="text-center">
              <p className="text-gray-400 text-1xl">단리: 1,500만</p>
              <p className="text-indigo-400 font-bold text-1xl">복리: 1,628만</p>
            </div>
          </div>

          {/* 20년 후 */}
          <div className="relative z-10 flex flex-col items-center bg-gray-900 px-2">
            <span className="text-gray-400 text-1xl font-bold mb-1">20년 후</span>
            <div className="w-4 h-4 rounded-full bg-indigo-400 border border-gray-900 mb-1 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
            <div className="text-center">
              <p className="text-gray-400 text-1xl">단리: 2,000만</p>
              <p className="text-indigo-400 font-bold ttext-1xl">복리: 2,653만</p>
            </div>
          </div>

          {/* 30년 후 */}
          <div className="relative z-10 flex flex-col items-center bg-gray-900 px-2">
            <span className="text-white text-1xl font-black mb-1">30년 후 (은퇴 시점)</span>
            <div className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-gray-900 mb-1 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse"></div>
            <div className="text-center bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-1xl line-through decoration-red-500 mb-0.5">단리: 2,500만</p>
              <p className="text-indigo-400 font-black text-1xl">복리: 4,321만</p>
              <p className="text-yellow-400 text-1xl mt-0.5 font-bold">격차: 1,821만 원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 7: 눈사람 만들기
export function SlideCh3_4() {
  return (
    <div className="h-full flex flex-col justify-center gap-8">
      <div className="flex bg-white p-16 rounded-[3rem] border border-blue-100 shadow-xl items-center gap-16">
        <div className="bg-blue-500 p-12 rounded-full shadow-lg shrink-0">
          <Snowflake className="w-32 h-32 text-white" />
        </div>
        <div className="space-y-8">
          <h3 className="text-4xl font-black text-blue-900">복리는 <span className="text-blue-600">눈사람 만들기</span>와 같습니다.</h3>
          <div className="text-2xl text-gray-700 leading-relaxed bg-blue-50 p-10 rounded-3xl font-medium">
            처음에는 손바닥만 한 눈뭉치(원금)지만, 눈밭을 계속 굴리면 <strong>눈에 눈이 붙으면서(이자에 이자가 붙으면서)</strong> 나중에는 혼자서 밀기도 힘들 만큼 거대한 눈사람이 됩니다.<br/><br/>
            <span className="font-bold text-blue-800">은행의 단리는 매번 똑같은 양의 눈만 갖다 붙이는 것</span>이고, <span className="font-bold text-blue-800">보험의 복리는 눈사람 전체를 굴리는 것</span>입니다.
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 8: 과세의 진실
export function SlideCh3_5() {
  return (
    <div className="h-full flex flex-col justify-center gap-8">
      <div className="flex bg-white p-16 rounded-[3rem] border border-red-100 shadow-xl items-center gap-16">
        <div className="bg-red-500 p-12 rounded-full shadow-lg shrink-0">
          <Droplet className="w-32 h-32 text-white" />
        </div>
        <div className="space-y-8">
          <h3 className="text-4xl font-black text-red-900">과세는 밑빠진 독에 물 붓기입니다.</h3>
          <div className="text-2xl text-gray-700 leading-relaxed bg-red-50 p-10 rounded-3xl font-medium">
          <br/>열심히 저금을 해서 나라에서 수익의 <strong className="text-red-600">15.4%를 가져간다면 어떨까요?</strong><br/><br/>
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 9: 도둑과 방패 비교
export function SlideCh3_6() {
  return (
    
    <div className="h-full flex flex-col gap-4 py-2 overflow-hidden">
    <p className="text-gray-500 text-center text-base font-medium shrink-0 text-xl">
      "수익률 1% 높은 상품을 찾는 것보다, <strong className="text-gray-800">번 돈을 세금으로 안 뺏기는 것</strong>이 먼저입니다."
    </p>

    <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
      <div className="bg-white border-2 border-red-200 rounded-2xl p-5 flex flex-col relative shadow-sm h-full overflow-hidden">
        <div className="absolute top-3 right-3 bg-red-100 text-red-500 w-8 h-8 rounded-full flex items-center justify-center font-black text-lg shrink-0">
          ✂️
        </div>
        <h4 className="font-black text-gray-800 mb-1 shrink-0 text-xl">과세: 보이지 않는 도둑</h4>
        <p className="text-xl text-gray-500 mb-4 shrink-0">수익이 날 때마다 15.4% 강제 징수</p>
        
        <div className="flex-1 flex flex-col justify-center items-center gap-3 bg-red-50/50 rounded-xl p-4 border border-red-100 min-h-0">
            <div className="w-full flex items-center h-14 bg-gray-200 rounded-full overflow-hidden shadow-inner relative">
              <div className="h-full bg-blue-400 w-[75%] flex items-center pl-6 text-xl font-bold text-white">내 몫 (84.6%)</div>
              <div className="h-full bg-red-500 w-[25%] flex items-center justify-center text-xl font-bold text-white relative">
              나라 (15.4%)
              </div>
            </div>
        </div>
      </div>

      {/* 2. 비과세 (완벽한 방패) */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex flex-col relative shadow-md transform h-full overflow-hidden z-10">
        <div className="absolute top-3 right-3 bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg shadow-lg shrink-0">
          🛡️
        </div>
        <h4 className="text-lg font-black text-emerald-900 mb-1 shrink-0">비과세: 완벽한 방패</h4>
        <p className="text-xs text-emerald-700 mb-4 shrink-0">10년 유지 시 세금 0원 (합법적 절세)</p>
        
        <div className="flex-1 flex flex-col justify-center items-center gap-3 bg-white rounded-xl p-4 border border-emerald-100 shadow-sm min-h-0">
            <div className="w-full flex items-center h-14 bg-gray-200 rounded-full overflow-hidden shadow-inner relative border-4 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]">
              <div className="h-full bg-emerald-500 w-full flex items-center justify-center text-2xl font-black text-white tracking-widest">
                내 몫 (100% 전액)
              </div>
            </div>
        </div>
      </div>
    </div>

    <div className="bg-gray-900 rounded-3xl p-6 shadow-xl shrink-0 mt-2">
      <h5 className="text-yellow-400 text-center font-black text-lg mb-4">"만약 이자로 딱 1,000만 원을 벌었다면?"</h5>
      <div className="flex justify-between items-center bg-gray-800 rounded-2xl p-5 border border-gray-700">
        <div className="flex-1 text-center pr-6">
          <span className="text-gray-400 text-sm font-bold block mb-2">일반 과세 (15.4%)</span>
          <p className="text-red-400 font-black text-2xl mb-2">- 154만 원 납부</p>
          <p className="text-gray-300 text-xs bg-gray-700 inline-block px-3 py-1.5 rounded-lg">✈️ <span className="line-through">동남아 여행값 증발</span></p>
        </div>
        <div className="px-6 font-black text-gray-500 italic text-3xl">VS</div>
        <div className="flex-1 text-center pl-6">
          <span className="text-emerald-400 text-sm font-bold block mb-2">비과세 혜택 적용</span>
          <p className="text-emerald-400 font-black text-2xl mb-2">세금 0원 (전액 수령)</p>
          <p className="text-emerald-100 text-xs bg-emerald-800/50 inline-block px-3 py-1.5 rounded-lg border border-emerald-700/50">✈️ 고생한 나에게 선물로 여행까지 가능</p>
        </div>
      </div>
    </div>
  </div>
  );
}

// SLIDE 10: 비과세 중요성
export function SlideCh3_7() {
  return (
    <div className="h-full flex flex-col justify-center gap-8">
      <div className="flex bg-white p-16 rounded-[3rem] border border-emerald-100 shadow-xl items-center gap-16">
        <div className="bg-emerald-500 p-12 rounded-full shadow-lg shrink-0">
          <Umbrella className="w-32 h-32 text-white" />
        </div>
        <div className="space-y-8">
          <h3 className="text-4xl font-black text-emerald-900">비과세는 구멍 난 독을 완벽히 막는 마법입니다.</h3>
          <div className="text-2xl text-gray-700 leading-relaxed bg-emerald-50 p-10 rounded-3xl font-medium">
            저축성 상품은 <strong className="text-emerald-600">10년 이상 유지하면 세금을 단 한 푼도(0원) 내지 않습니다.</strong><br/><br/>
            이자에 이자가 붙는 엄청난 '복리 눈사람'을 나라에 뺏기는 돈이 전혀 없기 때문에 <span className="font-bold text-emerald-800">세금으로 부터 온전히 내 자산으로 지키게</span> 됩니다. 이것이 부자들이 10년짜리 보험에 돈을 묶는 진짜 이유입니다.
          </div>
        </div>
      </div>
    </div>
  );
}

// SLIDE 11: 금융상품 혜택 총정리 (표)
export function SlideCh4() {
  return (
    <div className="h-full flex items-center gap-14 px-8">
      <div className="relative w-[450px] h-[450px] shrink-0 opacity-95 mx-auto">
        <div className="absolute top-0 left-2 w-[240px] h-[240px] rounded-full border-[10px] border-blue-200 bg-blue-50/80 mix-blend-multiply flex flex-col items-center justify-center pt-2">
          <span className="font-black text-blue-900 text-3xl">은행</span>
        </div>
        <div className="absolute top-0 right-2 w-[240px] h-[240px] rounded-full border-[10px] border-red-200 bg-red-50/80 mix-blend-multiply flex flex-col items-center justify-center pt-2">
          <span className="font-black text-red-900 text-3xl">증권</span>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[240px] h-[240px] rounded-full border-[10px] border-emerald-200 bg-emerald-50/80 mix-blend-multiply flex flex-col items-center justify-center pb-2">
          <span className="font-black text-emerald-900 text-3xl">보험</span>
        </div>
        <div className="absolute bottom-[180px] right-[40px] z-20 text-center bg-orange-600 text-white text-lg font-bold px-5 py-2.5 rounded-xl shadow-sm w-40">보험 + 증권</div>
      </div>

      <div className="flex-1">
      <p className="text-gray-600 text-center text-2xl font-bold shrink-0 p-4">
        금융상품 중 <strong className="text-blue-700">"복리"</strong> 에 <strong className="text-emerald-600">"비과세"</strong> 상품은?
      </p>
        <table className="w-full text-center border-collapse rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-6 text-2xl font-bold">상품군</th>
              <th className="p-6 text-2xl font-bold">이자 방식</th>
              <th className="p-6 text-2xl font-bold text-yellow-300">세금 혜택</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr className="border-b">
              <td className="p-6 font-bold text-xl bg-red-50/50 text-blue-900">은행 (예적금)</td>
              <td className="p-6 text-xl text-gray-500 font-medium">단리</td>
              <td className="p-6 text-xl text-red-500 font-bold">과세 (15.4%)</td>
            </tr>
            <tr className="border-b">
              <td className="p-6 font-bold text-xl bg-red-50/50 text-red-900">증권 (주식/펀드)</td>
              <td className="p-6 text-xl text-blue-600 font-bold">복리</td>
              <td className="p-6 text-xl text-red-500 font-bold">과세(배당, 수익)</td>
            </tr>
            <tr className="border-b-4 border-emerald-200 bg-emerald-50/50 transform scale-[1.02] shadow-sm relative z-10">
              <td className="p-8 font-black text-emerald-900 text-2xl">보험 (저축/연금/종신)</td>
              <td className="p-8 text-blue-700 font-black text-2xl">복리</td>
              <td className="p-8 text-emerald-600 font-black text-2xl flex justify-center items-center gap-3">비과세 <ShieldCheck className="w-8 h-8"/></td>
            </tr>
            <tr className="border-b-4 border-emerald-200 bg-emerald-50/50 transform scale-[1.02] shadow-sm relative z-10">
              <td className="p-8 font-black text-emerald-900 text-2xl">보험 + 증권 (변액)</td>
              <td className="p-8 text-blue-700 font-black text-2xl">복리</td>
              <td className="p-8 text-emerald-600 font-black text-2xl flex justify-center items-center gap-3">비과세 <ShieldCheck className="w-8 h-8"/></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SLIDE 12: 저축보험의 진실
export function SlideCh4_1() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <p className="text-gray-600 text-center text-2xl font-bold shrink-0">
        "복리는 <strong className="text-amber-600">시간이 금</strong>입니다. 하지만 저축보험은 그 시간을 허락하지 않습니다."
      </p>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 bg-white border-2 border-amber-200 rounded-3xl p-8 flex flex-col shadow-sm h-full overflow-hidden">
          <div className="flex items-center gap-4 mb-5 shrink-0">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-2xl"><Timer className="w-10 h-10" /></div>
            <h3 className="text-3xl font-black text-amber-900">녹아내리는 눈사람</h3>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden min-h-0">
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <p className="font-bold text-amber-800 mb-3 text-xl">❌ 치명적 한계: 짧은 만기</p>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                복리 효과는 10년, 20년이 지나야 눈덩이처럼 불어납니다. 하지만 저축보험은 보통 3~10년 만기입니다. <strong>이자가 새끼를 쳐서 폭발하려는 찰나에 강제 종료</strong>됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-amber-50 border-2 border-amber-200 rounded-3xl p-8 flex flex-col shadow-inner justify-center items-center relative overflow-hidden h-full">
          <h4 className="font-black text-amber-900 mb-8 text-2xl text-center shrink-0">만기의 벽에 부딪힌 복리 곡선</h4>
          <div className="relative flex-1 w-full min-h-0 flex justify-center items-center px-6">
            <svg viewBox="0 0 200 100" className="w-full h-full max-h-[260px] overflow-visible">
              <path d="M 10 90 Q 150 80 190 10" stroke="#fcd34d" strokeWidth="4" strokeDasharray="5 5" fill="none" />
              <path d="M 10 90 Q 70 87 90 80" stroke="#d97706" strokeWidth="6" fill="none" />
              <line x1="90" y1="100" x2="90" y2="10" stroke="#ef4444" strokeWidth="3" />
              <text x="95" y="45" fontSize="8" fill="#ef4444" fontWeight="black">강제 종료 (만기)</text>
              <circle cx="160" cy="35" r="6" fill="#fcd34d" className="opacity-60" />
              <text x="160" y="22" fontSize="8" fill="#d97706" textAnchor="middle" fontWeight="black">진짜 복리 폭발 지점</text>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white p-6 rounded-2xl text-center shadow-lg shrink-0 text-xl">
        <span className="font-bold text-amber-400">TIP:</span> "복리 엔진에 시동이 걸리려면 최소 10년이 필요합니다. 3년짜리 저축보험은 시동만 걸다 차에서 내리는 격입니다."
      </div>
    </div>
  );
}

// SLIDE 13: 연금보험의 진실
export function SlideCh4_2() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <p className="text-gray-600 text-center text-2xl font-bold shrink-0">
        "최저 보증? 안전해 보이지만, 사실 시간이 지날수록 <strong className="text-gray-900">이율 혜택이 계단식으로 반토막</strong> 납니다."
      </p>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 bg-white border-2 border-gray-300 rounded-3xl p-8 flex flex-col shadow-sm h-full overflow-hidden">
          <div className="flex items-center gap-4 mb-5 shrink-0">
            <div className="bg-gray-100 text-gray-700 p-2 rounded-2xl"><TrendingDown className="w-10 h-10" /></div>
            <h3 className="text-3xl font-black text-gray-900">우하향하는 보증 이율</h3>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden min-h-0">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <p className="font-bold text-gray-900 mb-3 text-xl">❌ 치명적 한계: 최저보증의 함정</p>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                안전하다며 유혹하지만, <strong>가입 후 5년 차에 한 번, 10년 차에 또 한 번 보증 이율이 낮아집니다.</strong> 가장 돈이 많이 쌓인 10년 뒤에는 가장 낮은 이율이 적용되어 폭발적인 복리 수익을 기대하기 어렵습니다.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <p className="font-bold text-blue-900 mb-3 text-xl">💡 올바른 활용법</p>
              <p className="text-lg text-blue-800 leading-relaxed font-medium">
                '수익률'을 기대하고 가입하면 안 됩니다. 연금보험의 진짜 가치는 수익이 아니라 <strong>'죽을 때까지 평생 마르지 않는 월급을 준다'</strong>는 장수 리스크 방어에 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-3xl p-8 flex flex-col shadow-inner justify-center relative overflow-hidden h-full">
          <h4 className="font-black text-gray-900 mb-8 text-2xl text-center shrink-0">연금보험 보증이율의 진실 (예시)</h4>
          <div className="relative flex-1 w-full min-h-0 flex items-end gap-3 px-10 pb-4">
            <div className="flex-1 flex flex-col justify-end h-full">
              <div className="bg-gray-400 w-full h-[90%] rounded-t-2xl flex items-center justify-center text-white font-black text-3xl shadow-md">1.5%</div>
              <p className="text-center text-base font-bold text-gray-600 mt-4">가입 ~ 5년</p>
            </div>
            <div className="flex-1 flex flex-col justify-end h-full">
              <div className="bg-gray-300 w-full h-[60%] rounded-t-2xl flex items-center justify-center text-gray-800 font-black text-3xl shadow-md border-t-2 border-gray-400">1.0%</div>
              <p className="text-center text-base font-bold text-gray-600 mt-4">5년 ~ 10년</p>
            </div>
            <div className="flex-1 flex flex-col justify-end h-full">
              <div className="bg-gray-200 w-full h-[30%] rounded-t-2xl flex items-center justify-center text-gray-600 font-black text-3xl shadow-md border-t-2 border-gray-300">0.5%</div>
              <p className="text-center text-base font-bold text-gray-600 mt-4">10년 초과~</p>
            </div>
            <svg className="absolute top-16 left-20 w-[70%] h-40 overflow-visible" viewBox="0 0 100 50">
              <path d="M 10 5 L 45 20 L 80 35" stroke="#ef4444" strokeWidth="4" fill="none" strokeDasharray="5 5"/>
              <polygon points="80,35 73,30 83,28" fill="#ef4444" transform="rotate(20 80 35)" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white p-6 rounded-2xl text-center shadow-lg shrink-0 text-xl">
        <span className="font-bold text-blue-400">TIP:</span> "연금보험은 재테크 상품이 아니라 안전 장치입니다. 자산을 폭발적으로 불리시려면 연금보험 하나로는 절대 부족합니다."
      </div>
    </div>
  );
}

// SLIDE 14: 단기납 종신의 진실
export function SlideCh4_3() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <p className="text-gray-600 text-center text-2xl font-bold shrink-0">
        "종신보험은 죽어야 나오는 돈? 아닙니다. <strong className="text-indigo-600">가장 확실한 10년짜리 확정 금리 저축통장</strong>으로 진화했습니다."
      </p>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 bg-white border-2 border-indigo-200 rounded-3xl p-8 flex flex-col shadow-sm h-full overflow-hidden">
          <div className="flex items-center gap-4 mb-5 shrink-0">
            <div className="bg-indigo-100 text-indigo-700 p-2 rounded-2xl"><ShieldPlus className="w-10 h-10" /></div>
            <h3 className="text-3xl font-black text-indigo-900">확정 수익과 보장의 하이브리드</h3>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden min-h-0">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <p className="font-bold text-indigo-900 mb-3 text-xl">🎯 핵심 경쟁력: 10년 차 환급률</p>
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                과거처럼 20년씩 길게 내지 않습니다. <strong>5년, 7년 만에 납입을 일찍 끝내고</strong> 가만히 두면, 10년이 되는 시점에 <strong>120~130% 내외의 높은 확정 환급금</strong>이 발생합니다.
              </p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <p className="font-bold text-emerald-900 mb-3 text-xl">🛡️ 비과세 + 생명 보호 (1석 3조)</p>
              <p className="text-lg text-emerald-800 leading-relaxed font-medium">
                수익에 대해 <strong>세금을 1원도 내지 않으며(비과세)</strong>, 돈을 굴리는 10년 동안 고객의 사망 리스크를 수천만 원으로 완벽히 커버합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-indigo-900 border-2 border-indigo-800 rounded-3xl p-6 flex flex-col shadow-xl justify-center items-center relative overflow-hidden h-full">
            <h4 className="font-black text-white mb-8 text-xl text-center z-10 shrink-0">7년납 10년 만기 단기납 종신 구조</h4>
            <div className="w-full flex-1 flex flex-col justify-center items-center gap-8 z-10 min-h-0 px-4">
            <div className="relative h-14 w-full flex items-center bg-indigo-950 rounded-full border-2 border-indigo-700 px-1.5 shrink-0 shadow-inner">
                <div className="h-10 bg-indigo-500 rounded-full w-[70%] flex items-center justify-center text-sm font-bold text-white shadow-inner relative">
                열심히 납입하는 시간 (7년)
                <span className="absolute -bottom-7 text-xs text-indigo-300 font-medium">원금 도달 전</span>
                </div>
                <div className="h-10 bg-transparent w-[30%] flex items-center justify-center text-sm font-bold text-indigo-200">
                기다림 (3년)
                </div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center transform scale-105 shadow-[0_0_25px_rgba(129,140,248,0.6)] border-4 border-indigo-400 animate-pulse shrink-0 w-[80%]">
                <p className="text-indigo-900 font-black text-2xl leading-tight mb-2">🎉 10년 차 달성!</p>
                <p className="text-gray-700 text-base font-bold mb-3">원금 100% + 확정 이자 20%↑</p>
                <div className="bg-indigo-600 text-white inline-block px-4 py-2 rounded-full text-sm font-black shadow-md">
                전액 비과세 수령
                </div>
            </div>
            </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white p-6 rounded-2xl text-center shadow-lg shrink-0 text-xl">
        <span className="font-bold text-indigo-400">TIP:</span> "은행처럼 안전하게 확정된 금액을 주면서, 은행은 절대 안 해주는 '비과세'와 '보장'을 얹어주는 최고의 안전 통장입니다."
      </div>
    </div>
  );
}

// SLIDE 15: 변액보험의 진실
export function SlideCh4_4() {
  return (
    <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
      <p className="text-gray-600 text-center text-2xl font-bold shrink-0">
        "투자 상품이라 위험하다고요? <strong className="text-emerald-600">인플레이션으로 내 돈이 휴지조각이 되는 것</strong>이 진짜 위험입니다."
      </p>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 bg-white border-2 border-emerald-200 rounded-3xl p-8 flex flex-col shadow-sm h-full overflow-hidden">
          <div className="flex items-center gap-4 mb-5 shrink-0">
            <div className="bg-emerald-100 text-emerald-700 p-2 rounded-2xl"><LineChart className="w-10 h-10" /></div>
            <h3 className="text-3xl font-black text-emerald-900">펀드 수익과 안전망의 결합</h3>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden min-h-0">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <p className="font-bold text-emerald-900 mb-3 text-xl">📈 공격수: 주식/채권 투자</p>
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                물가를 방어하려면 투자는 필수입니다. 10년 이상 꾸준히 적립식으로 납입하면(코스트 에버리지 효과) 단기 하락장을 이겨내고 큰 복리 수익을 냅니다.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <p className="font-bold text-blue-900 mb-3 text-xl">🛡️ 수비수: 최저보증 에어백</p>
              <p className="text-lg text-blue-800 leading-relaxed font-medium">
                <strong>"아무리 주식 시장이 반토막 나도 원금 이상은 무조건 연금 보증, 비과세에 사망 리스크까지"</strong> 투자 상품 중 이런 안전망을 가진 건 변액보험이 유일합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-900 border-2 border-gray-800 rounded-3xl p-8 flex flex-col shadow-xl justify-center items-center relative overflow-hidden h-full">
          <h4 className="font-black text-white mb-8 text-2xl text-center z-10 shrink-0">변액보험의 '에어백(최저보증)' 원리</h4>
          <div className="relative flex-1 w-full min-h-0 flex items-center justify-center mt-4 px-6">
            <svg viewBox="0 0 200 110" className="w-full h-full max-h-[280px] overflow-visible">
              <path d="M 10 70 L 30 50 L 50 85 L 80 40 L 110 90 L 140 30 L 170 60 L 190 20" stroke="#34d399" strokeWidth="4" fill="none" />
              <line x1="10" y1="70" x2="190" y2="70" stroke="#ef4444" strokeWidth="3" strokeDasharray="5 5" />
              <text x="15" y="84" fontSize="8" fill="#fca5a5" fontWeight="black">원금 100% (최저보증선)</text>
              <circle cx="50" cy="85" r="5" fill="#ef4444" className="animate-ping" />
              <circle cx="110" cy="90" r="5" fill="#ef4444" className="animate-ping" />
              <g transform="translate(10, 10)">
                <rect width="90" height="18" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                <text x="45" y="12" fontSize="7" fill="white" textAnchor="middle" fontWeight="bold">상승장: 수익 전액 고객 몫</text>
              </g>
              <g transform="translate(100, 95)">
                <rect width="90" height="18" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                <text x="45" y="12" fontSize="7" fill="white" textAnchor="middle" fontWeight="bold">폭락장: 회사 돈으로 원금 보전</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white p-6 rounded-2xl text-center shadow-lg shrink-0 text-xl">
        <span className="font-bold text-emerald-400">TIP:</span> "수익이 나면 비과세로 챙기시고, IMF급 경제 위기가 와도 원금은 보험회사가 물어내서 채워주는 완벽한 시스템입니다."
      </div>
    </div>
  );
}

// SLIDE 16: 결론
export function SlideCh5() {
  return (
    <div className="flex flex-col h-full justify-center space-y-8">
      <div className="bg-gray-900 text-white p-2 rounded-2xl text-center mb-6 shadow-md text-2xl font-medium">
        <Quote className="inline-block w-8 h-8 text-gray-400 mb-2 mr-3"/>
        어떤 상품이 '무조건' 좋다는 편견을 버리세요. 고객의 목표 시기와 투자 성향에 맞는 옷을 입혀야 합니다.
      </div>

      <div className="grid grid-cols-2 gap-10">
        <div className="border border-gray-200 p-4 rounded-3xl bg-white shadow-sm hover:border-blue-300 transition-colors">
          <h3 className="text-xl font-bold text-gray-500 mb-3">단/중기 (1~5년) 목적자금</h3>
          <p className="text-3xl font-black text-gray-900 mb-5">은행 예/적금 & 저축보험</p>
          <p className="text-gray-600 text-xl leading-relaxed">복리나 비과세의 마법이 발휘되기엔 시간이 짧습니다. <strong>원금을 잃지 않고 안전하게 모으는 것이 최우선</strong>인 자금에 적합합니다.</p>
        </div>

        <div className="border border-blue-200 p-4 rounded-3xl bg-blue-50 shadow-sm hover:border-blue-400 transition-colors">
          <h3 className="text-xl font-bold text-blue-600 mb-3">비과세 & 안정성 추구</h3>
          <p className="text-3xl font-black text-blue-900 mb-5">연금보험 / 종신보험</p>
          <p className="text-blue-800 text-xl leading-relaxed">확정 금리와 안정적인 10년 차 환급률을 통해, 원금 손실 불안 없이 <strong className="text-blue-900">비과세 혜택과 복리 효과를 가장 마음 편하게</strong> 누릴 수 있습니다.</p>
        </div>

        <div className="border border-gray-200 p-4 rounded-3xl bg-white shadow-sm hover:border-blue-300 transition-colors">
          <h3 className="text-xl font-bold text-gray-500 mb-3">단/중기 & 공격적 투자</h3>
          <p className="text-3xl font-black text-gray-900 mb-5">증권사 주식 / 펀드</p>
          <p className="text-gray-600 text-xl leading-relaxed">물가 상승을 이기기 위해 적극적으로 투자합니다. 단, <strong>세금(과세)과 원금 손실 리스크를 고객이 명확히 인지</strong>해야 합니다.</p>
        </div>

        <div className="border border-emerald-200 p-4 rounded-3xl bg-emerald-50 shadow-sm hover:border-emerald-400 transition-colors">
          <h3 className="text-xl font-bold text-emerald-600 mb-3">비과세 & 공격적 투자</h3>
          <p className="text-3xl font-black text-emerald-900 mb-5">변액보험</p>
          <p className="text-emerald-800 text-xl leading-relaxed">초반 사업비가 크지만, 주식/펀드 투자 수익률로 이를 상쇄합니다. <strong className="text-emerald-900">공격적인 장기 투자 수익에 비과세 혜택을 얹고 싶을 때</strong> 최고의 무기입니다.</p>
        </div>
      </div>
    </div>
  );
}

// SLIDE 17: 부록 (ISA / 연금저축)
export function SlideAppendix() {
  return (
    <div className="flex flex-col h-full gap-10 overflow-y-auto">
      <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-5 mb-5">
            <div className="bg-purple-100 p-4 rounded-2xl"><Coins className="w-10 h-10 text-purple-600" /></div>
            <h3 className="text-4xl font-black text-gray-900">ISA (개인종합자산관리계좌)</h3>
          </div>
          <p className="text-gray-600 text-xl mb-6 leading-relaxed font-medium">하나의 계좌로 예적금, 주식 등을 굴리며 비과세(200~400만 원) 및 9.9% 분리과세 혜택을 받습니다.</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
          <p className="text-purple-900 font-black mb-3 text-xl">💡 거절처리</p>
          <p className="text-xl text-purple-800 leading-relaxed font-medium">"의무 기간을 채우지 못하고 중도 해지하면, 그동안 얻은 수익에 대해 비과세 혜택이 전부 취소되고 일반 과세(15.4%)로 소급 적용"<br />"원금 내에서는 중도 인출이 자유롭지만, 투자 수익금이나 배당금은 중간에 뺄 수 없음. 수익금을 출금하려면 계좌 자체 해지해야함"</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-5 mb-5">
            <div className="bg-orange-100 p-4 rounded-2xl"><Building2 className="w-10 h-10 text-orange-600" /></div>
            <h3 className="text-4xl font-black text-gray-900">연금저축 (세제적격)</h3>
          </div>
          <p className="text-gray-600 text-xl mb-6 leading-relaxed font-medium">연말정산 시 매년 납입액(최대 600만 원)에 대해 13.2~16.5% 세액공제를 받아 세금을 환급받는 계좌입니다.</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <p className="text-orange-900 font-black mb-3 text-xl">💡 거절처리</p>
          <p className="text-xl text-orange-800 leading-relaxed font-medium">"중간에 계좌를 깨거나 중도 인출을 하면, 그동안 받았던 세액공제 혜택을 16.5% 기타소득세 발생"<br />"지금 세금을 안 내는 게 아니라 나중으로 미루는 것. 나중에 연금으로 탈 때 연령에 따라 3.3%~5.5%의 연금소득세 발생"</p>
        </div>
      </div>
    </div>
  );
}