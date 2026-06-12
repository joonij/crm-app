"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, ArrowLeft, 
  Building2, TrendingUp, ShieldCheck, 
  Landmark, Quote, Zap, Snowflake, 
  Droplet, Coins, Umbrella
} from "lucide-react";

export default function SavingsTrainingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [activeAnswers, setActiveAnswers] = useState<Record<number, number>>({});
  const handleAnswerClick = (qId: number, aId: number) => {
    setActiveAnswers(prev => ({ ...prev, [qId]: aId }));
  };

  const slides = [
    // 타이틀
    {
      id: "intro",
      title: "",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="px-6 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold mb-4 tracking-widest">
            사내 마스터 교육 과정
          </div>
          <h1 className="text-5xl font-black text-gray-900 leading-tight">
            저축성 상품 심화<br />
            <span className="text-blue-600">금융 건강검진과 자산 극대화 전략</span>
          </h1>
          <p className="text-xl text-gray-500 mt-6">고객의 니즈 파악부터 복리/비과세 클로징까지</p>
        </div>
      )
    },
    // 챕터 1
    {
      id: "ch1",
      title: "Chapter 1. 금융 건강검진",
      content: (
        <div className="h-full flex flex-col justify-center gap-3">
          <p className="text-gray-500 font-medium mb-2">쉬운 비유로 고객의 숨은 니즈를 깨워보세요.</p>
          
          {[
            { id: 1, type: "1", q: "갑자기 냉장고가 고장 나면 깰 수 있는 저금통이 있나요?", opts: ["충분해요", "조금 부족해요", "당장 없어요"] },
            { id: 2, type: "2", q: "부모님이 아파서 일을 못해도 우리 가족 1년은 거뜬히 밥 먹을 수 있나요?", opts: ["거뜬해요", "걱정돼요", "큰일 나요"] },
            { id: 3, type: "3", q: "지금 모으는 돈, 10년 뒤에 쓸 건가요? 아니면 할아버지/할머니 돼서 쓸 건가요?", opts: ["가까운 미래", "아주 먼 미래", "빨리 불릴래요"] },
            { id: 4, type: "4", q: "나중에 돈 찾을 때, 나라에 세금(15.4%) 안 뺏기는 '마법 주머니'가 있나요?", opts: ["있어요", "잘 몰라요", "없어요"] },
            { id: 5, type: "5", q: "내 돈이 자라나는 모습 중 어떤 게 가장 마음 편한가요?", opts: ["안 다치게! (안전형)", "꾸준하게! (적립형)", "과감하게! (공격형)"] },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 w-[55%]">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-md whitespace-nowrap w-[70px] text-center">
                  {item.type}
                </span>
                <p className="text-base font-bold text-gray-800 leading-tight">{item.q}</p>
              </div>
              <div className="flex gap-2 w-[45%]">
                {item.opts.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerClick(item.id, idx)}
                    className={`flex-1 text-sm py-2 px-2 rounded-lg border transition-all truncate ${
                      activeAnswers[item.id] === idx 
                      ? "bg-blue-600 border-blue-600 text-white font-bold shadow-md" 
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
      )
    },
    // 챕터 2~3 벤다이어그램 (대칭 비율 및 겹침 완벽 수정)
    {
      id: "ch2-3",
      title: "Chapter 2. 3대 금융기관과 융합 상품",
      content: (
        <div className="h-full flex flex-col items-center justify-center relative">
          <p className="text-gray-500 mb-6 text-center text-lg">각 금융기관의 고유한 장점이 결합된 하이브리드 상품을 이해해야 합니다.</p>
          
          <div className="relative w-[600px] h-[550px]">
            {/* 원형 1: 은행 (좌측 상단) - 텍스트를 왼쪽 위로 이동 */}
            <div className="absolute top-0 left-2 w-[340px] h-[340px] rounded-full border-[8px] border-blue-200 bg-blue-50/80 mix-blend-multiply z-10 shadow-inner">
              <div className="absolute top-[50px] left-[40px] w-[180px] flex flex-col items-center text-center">
                <Landmark className="w-12 h-12 text-blue-600 mb-2" />
                <span className="text-2xl font-black text-blue-900">은행사</span>
                <span className="text-base text-blue-700 font-bold mt-1">예적금 (안전성)</span>
              </div>
            </div>
            
            {/* 원형 2: 증권 (우측 상단) - 텍스트를 오른쪽 위로 이동 */}
            <div className="absolute top-0 right-2 w-[340px] h-[340px] rounded-full border-[8px] border-red-200 bg-red-50/80 mix-blend-multiply z-10 shadow-inner">
              <div className="absolute top-[50px] right-[40px] w-[180px] flex flex-col items-center text-center">
                <TrendingUp className="w-12 h-12 text-red-600 mb-2" />
                <span className="text-2xl font-black text-red-900">증권사</span>
                <span className="text-base text-red-700 font-bold mt-1">주식/펀드 (수익성)</span>
              </div>
            </div>
            
            {/* 원형 3: 보험 (하단 중앙) - 텍스트를 아래로 이동 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full border-[8px] border-emerald-200 bg-emerald-50/80 mix-blend-multiply z-10 shadow-inner">
              <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 w-[180px] flex flex-col items-center text-center">
                <ShieldCheck className="w-12 h-12 text-emerald-600 mb-2" />
                <span className="text-2xl font-black text-emerald-900">보험사</span>
                <span className="text-base text-emerald-700 font-bold mt-1">저축/종신 (보장성)</span>
              </div>
            </div>

            {/* 교집합 1: 은행 + 증권 (상단 중앙) */}
            <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-20 text-center w-40">
              <div className="bg-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">ISA / CMA</div>
              <p className="text-xs leading-tight mt-2 text-gray-800 font-bold bg-white/90 p-1.5 rounded-md border border-gray-200 shadow-sm">입출금 + 투자</p>
            </div>

            {/* 교집합 2: 은행 + 보험 (좌측 하단) */}
            <div className="absolute bottom-[160px] left-[50px] z-20 text-center w-40">
              <div className="bg-cyan-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">방카슈랑스</div>
              <p className="text-xs leading-tight mt-2 text-gray-800 font-bold bg-white/90 p-1.5 rounded-md border border-gray-200 shadow-sm">은행에서 파는 보험</p>
            </div>

            {/* 교집합 3: 증권 + 보험 (우측 하단) */}
            <div className="absolute bottom-[160px] right-[50px] z-20 text-center w-40">
              <div className="bg-orange-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">변액보험</div>
              <p className="text-xs leading-tight mt-2 text-gray-800 font-bold bg-white/90 p-1.5 rounded-md border border-gray-200 shadow-sm">투자수익 + 비과세</p>
            </div>
          </div>
        </div>
      )
    },
    // 챕터 4-1. 단리와 복리 차이 (단리 선형 증가 구조로 수정)
    {
      id: "ch4-1",
      title: "Chapter 3-1. 이자가 붙는 두 가지 방식: 단리 vs 복리",
      content: (
        <div className="h-full flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-8 h-[450px]">
            {/* 단리 */}
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-between text-center shadow-sm">
              <div>
                <h3 className="text-3xl font-black text-gray-800 mb-4">단리 (Simple Interest)</h3>
                <p className="text-base text-gray-600">원금에만 동일한 이자가 붙어 <strong>계단식으로 일정하게 상승</strong>합니다.<br/>(물가 상승 시 실질적인 화폐 가치는 오히려 하락할 수 있습니다)</p>
              </div>
              <div className="flex items-end gap-3 h-48 w-full justify-center">
                {[70, 60, 50, 40, 30].map((height, i) => (
                  <div key={i} className="w-14 bg-gray-300 rounded-t-lg relative flex items-end justify-center pb-2 text-gray-700 font-bold" style={{ height: `${height}%` }}>
                    {i + 1}년
                  </div>
                ))}
              </div>
            </div>

            {/* 복리 */}
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 flex flex-col items-center justify-between text-center shadow-md transform scale-105">
              <div>
                <h3 className="text-3xl font-black text-blue-900 mb-4">복리 (Compound Interest)</h3>
                <p className="text-base text-blue-700"><strong>'원금+이자'</strong>에 또 이자가 붙습니다.<br/>시간이 지날수록 곡선을 그리며 기하급수적으로 폭발합니다.</p>
              </div>
              <div className="flex items-end gap-3 h-48 w-full justify-center">
                {[20, 30, 45, 70, 100].map((height, i) => (
                  <div key={i} className="w-14 bg-blue-500 rounded-t-lg relative flex items-end justify-center pb-2 text-white font-bold transition-all" style={{ height: `${height}%` }}>
                    {i + 1}년
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    // 챕터 4-2
    {
      id: "ch4-2",
      title: "Chapter 3-2. 눈사람 만들기: 복리의 마법",
      content: (
        <div className="h-full flex flex-col justify-center gap-8">
          <div className="flex bg-white p-10 rounded-3xl border border-blue-100 shadow-xl items-center gap-10">
            <div className="bg-blue-500 p-8 rounded-full shadow-lg shrink-0">
              <Snowflake className="w-20 h-20 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-blue-900">복리는 <span className="text-blue-600">눈사람 만들기</span>와 같습니다.</h3>
              <div className="text-xl text-gray-700 leading-relaxed bg-blue-50 p-6 rounded-2xl">
                처음에는 손바닥만 한 눈뭉치(원금)지만, 눈밭을 계속 굴리면 <strong>눈에 눈이 붙으면서(이자에 이자가 붙으면서)</strong> 나중에는 혼자서 밀기도 힘들 만큼 거대한 눈사람이 됩니다.<br/><br/>
                <span className="font-bold text-blue-800">은행의 단리는 매번 똑같은 양의 눈만 갖다 붙이는 것</span>이고, <span className="font-bold text-blue-800">보험의 복리는 눈사람 전체를 굴리는 것</span>입니다.
              </div>
            </div>
          </div>
        </div>
      )
    },
    // 챕터 4-3
    {
      id: "ch4-3",
      title: "Chapter 3-3. 밑빠진 독: 과세(세금)의 무서움",
      content: (
        <div className="h-full flex flex-col justify-center gap-8">
          <div className="flex bg-white p-10 rounded-3xl border border-red-100 shadow-xl items-center gap-10">
            <div className="bg-red-500 p-8 rounded-full shadow-lg shrink-0">
              <Droplet className="w-20 h-20 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-red-900">과세는 <span className="text-red-600">밑빠진 독에 물 붓기</span>입니다.</h3>
              <div className="text-xl text-gray-700 leading-relaxed bg-red-50 p-6 rounded-2xl">
                아무리 열심히 복리로 눈사람을 굴려도, 나라에서 매년 수익의 <strong>15.4%를 세금으로 떼어간다면(이자소득세)</strong> 어떻게 될까요?<br/><br/>
                100만 원의 이자가 생기면 15만 4천 원을 뺏깁니다. <strong>물(이자)을 아무리 부어도 독(세금)에 구멍이 뚫려있어</strong>, 복리의 효과가 반감되고 돈이 눈에 띄게 불어나지 않습니다.
              </div>
            </div>
          </div>
        </div>
      )
    },
    // 챕터 4-4
    {
      id: "ch4-4",
      title: "Chapter 3-4. 완벽한 방패: 비과세의 중요성",
      content: (
        <div className="h-full flex flex-col justify-center gap-8">
          <div className="flex bg-white p-10 rounded-3xl border border-emerald-100 shadow-xl items-center gap-10">
            <div className="bg-emerald-500 p-8 rounded-full shadow-lg shrink-0">
              <Umbrella className="w-20 h-20 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-emerald-900">비과세는 <span className="text-emerald-600">구멍 난 독을 완벽히 막는 마법</span>입니다.</h3>
              <div className="text-xl text-gray-700 leading-relaxed bg-emerald-50 p-6 rounded-2xl">
                저축성 상품은 <strong>10년 이상 유지하면 세금을 단 한 푼도(0원) 내지 않습니다.</strong><br/><br/>
                이자에 이자가 붙는 엄청난 '복리 눈사람'을 나라에 뺏기는 돈이 전혀 없기 때문에 <span className="font-bold text-emerald-800">세금으로 부터 온전히 내 자산으로 지키게</span> 됩니다. 이것이 부자들이 10년짜리 보험에 돈을 묶는 진짜 이유입니다.
              </div>
            </div>
          </div>
        </div>
      )
    },
    // 챕터 5. 표 연동 벤다이어그램 구조 수정
    {
      id: "ch5",
      title: "Chapter 4. 금융 상품별 혜택 총정리",
      content: (
        <div className="h-full flex items-center gap-10">
          
          {/* 좌측: 미니 벤다이어그램 */}
          <div className="relative w-[340px] h-[320px] shrink-0 opacity-95 mx-auto">
            <div className="absolute top-0 left-2 w-44 h-44 rounded-full border-[6px] border-blue-200 bg-blue-50/80 mix-blend-multiply flex flex-col items-center justify-center pt-2">
              <span className="font-bold text-blue-900 text-lg">은행</span>
            </div>
            <div className="absolute top-0 right-2 w-44 h-44 rounded-full border-[6px] border-red-200 bg-red-50/80 mix-blend-multiply flex flex-col items-center justify-center pt-2">
              <span className="font-bold text-red-900 text-lg">증권</span>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full border-[6px] border-emerald-200 bg-emerald-50/80 mix-blend-multiply flex flex-col items-center justify-center pb-2">
              <span className="font-bold text-emerald-900 text-lg">보험</span>
            </div>
            <div className="absolute bottom-[90px] right-[40px] z-20 text-center bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm">변액</div>
          </div>

          {/* 우측: 테이블 */}
          <div className="flex-1">
            <table className="w-full text-center border-collapse rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-4 text-base">상품군</th>
                  <th className="p-4 text-base">이자 방식</th>
                  <th className="p-4 text-base text-yellow-300">세금 혜택</th>
                </tr>
              </thead>
              <tbody className="bg-white text-lg">
                <tr className="border-b">
                  <td className="p-4 font-bold bg-blue-50/30 text-blue-900">은행 (예적금)</td>
                  <td className="p-4 text-gray-500">단리</td>
                  <td className="p-4 text-red-500">과세 (15.4%)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-bold bg-red-50/30 text-red-900">증권 (주식/펀드)</td>
                  <td className="p-4 text-blue-600 font-bold">복리</td>
                  <td className="p-4 text-red-500">과세(배당, 수익)</td>
                </tr>
                <tr className="border-b-4 border-blue-200 bg-emerald-50/30 transform scale-[1.02] shadow-sm">
                  <td className="p-5 font-black text-emerald-900 text-xl">보험 (저축/연금/종신)</td>
                  <td className="p-5 text-blue-700 font-black text-xl">복리</td>
                  <td className="p-5 text-emerald-600 font-black text-xl flex justify-center items-center gap-1">비과세 <ShieldCheck className="w-5 h-5"/></td>
                </tr>
                <tr className="border-b-4 border-blue-200 bg-emerald-50/30 transform scale-[1.02] shadow-sm">
                  <td className="p-5 font-black text-emerald-900 text-xl">보험 + 증권 (변액)</td>
                  <td className="p-5 text-blue-700 font-black text-xl">복리</td>
                  <td className="p-5 text-emerald-600 font-black text-xl flex justify-center items-center gap-1">비과세 <ShieldCheck className="w-5 h-5"/></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )
    },
    // 챕터 6
    {
      id: "ch6",
      title: "Chapter 5. 정답은 없습니다. '목적'이 다를 뿐입니다.",
      content: (
        <div className="flex flex-col h-full justify-center space-y-6">
          <div className="bg-gray-900 text-white p-4 rounded-xl text-center mb-4 shadow-md">
            <Quote className="inline-block w-5 h-5 text-gray-400 mb-1 mr-2"/>
            어떤 상품이 '무조건' 좋다는 편견을 버리세요. 고객의 목표 시기와 투자 성향에 맞는 옷을 입혀야 합니다.
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm hover:border-blue-300 transition-colors">
              <h3 className="text-sm font-bold text-gray-500 mb-1">단/중기 (1~5년) 목적자금</h3>
              <p className="text-2xl font-black text-gray-900 mb-3">은행 예/적금 & 저축보험</p>
              <p className="text-gray-600 text-sm">복리나 비과세의 마법이 발휘되기엔 시간이 짧습니다. 원금을 잃지 않고 안전하게 모으는 것이 최우선인 자금에 적합합니다.</p>
            </div>

            <div className="border border-blue-200 p-6 rounded-2xl bg-blue-50 shadow-sm hover:border-blue-400 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-blue-500 mb-1">장기 (10년↑) & 안정성 추구</h3>
                  <p className="text-2xl font-black text-blue-900 mb-3">연금보험 / 종신보험</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">확정 금리와 안정적인 10년 차 환급률을 통해, 원금 손실 불안 없이 <strong>비과세 혜택과 복리 효과를 가장 마음 편하게</strong> 누릴 수 있습니다.</p>
            </div>

            <div className="border border-red-200 p-6 rounded-2xl bg-red-50 shadow-sm hover:border-red-400 transition-colors col-span-2 md:col-span-1">
              <h3 className="text-sm font-bold text-red-500 mb-1">단/중기 & 공격적 투자</h3>
              <p className="text-2xl font-black text-red-900 mb-3">증권사 주식 / 펀드</p>
              <p className="text-gray-700 text-sm">물가 상승을 이기기 위해 적극적으로 투자합니다. 단, 세금(과세)과 원금 손실 리스크를 고객이 명확히 인지해야 합니다.</p>
            </div>

            <div className="border border-emerald-200 p-6 rounded-2xl bg-emerald-50 shadow-sm hover:border-emerald-400 transition-colors col-span-2 md:col-span-1">
              <h3 className="text-sm font-bold text-emerald-500 mb-1">장기 (10년↑) & 공격적 투자</h3>
              <p className="text-2xl font-black text-emerald-900 mb-3">변액보험</p>
              <p className="text-gray-700 text-sm">초반 사업비가 크지만, 주식/펀드 투자 수익률로 이를 상쇄합니다. <strong>공격적인 장기 투자 수익에 비과세 혜택을 얹고 싶을 때</strong> 최고의 무기입니다.</p>
            </div>
          </div>
        </div>
      )
    },
    // 부록
    {
      id: "appendix",
      title: "부록 1. 만능 계좌 2종 실전 활용법",
      content: (
        <div className="flex flex-col h-full gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg"><Coins className="w-5 h-5 text-purple-600" /></div>
                <h3 className="text-2xl font-bold text-gray-900">ISA (개인종합자산관리계좌)</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">하나의 계좌로 예적금, 주식 등을 굴리며 비과세(200~400만 원) 및 9.9% 분리과세 혜택.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <p className="text-purple-800 font-bold mb-1">💡 실전 활용 꿀팁</p>
              <p className="text-sm text-purple-700">"의무 기간 3년마다 만기를 채워 목돈을 만들고, 이를 연금저축 계좌로 이체하세요. 이체 금액의 10%(최대 300만 원)를 추가로 세액공제 받을 수 있습니다."</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-lg"><Building2 className="w-5 h-5 text-orange-600" /></div>
                <h3 className="text-2xl font-bold text-gray-900">연금저축 (세제적격)</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">연말정산 시 매년 납입액(최대 600만 원)에 대해 13.2~16.5% 세액공제를 받아 세금을 환급받는 계좌.</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <p className="text-orange-800 font-bold mb-1">💡 실전 활용 꿀팁</p>
              <p className="text-sm text-orange-700">"연말정산 때 뱉어내는 직장인이라면 무조건 한도를 채워야 합니다. 단순히 현금으로 두지 말고 연금저축펀드(증권사)로 개설해 ETF에 장기 투자하면 복리 효과를 함께 누릴 수 있습니다."</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? prev : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? prev : prev - 1));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <Link href="/training" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" />
          교육 목차로 돌아가기
        </Link>
        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full shadow-sm border border-blue-100">
          Slide {currentSlide + 1} / {slides.length}
        </div>
      </div>

      <div className="relative bg-white rounded-3xl border border-gray-200 shadow-xl h-[720px] flex flex-col overflow-hidden">
        
        <div 
          className="absolute top-0 left-0 h-1.5 bg-blue-600 transition-all duration-500 ease-out z-10" 
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} 
        />

        {slides[currentSlide].title && (
          <div className="px-12 pt-10 pb-4 border-b border-gray-100 shrink-0">
            <h2 className="text-3xl font-black text-gray-900">{slides[currentSlide].title}</h2>
          </div>
        )}

        <div className="flex-1 px-12 py-6 bg-white overflow-hidden">
          {slides[currentSlide].content}
        </div>

        <div className="px-10 py-5 border-t border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm shrink-0">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> 이전 슬라이드
          </button>
          
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            다음 슬라이드 <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}