"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, TrendingUp, TrendingDown, ShieldCheck, Printer, AlertCircle, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 금액 포맷팅 (숫자 -> 억/만 단위)
const formatMoney = (amount: number) => {
  if (amount === 0) return "0원";
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000);
    const man = amount % 10000;
    return `${eok.toLocaleString()}억 ${man > 0 ? man.toLocaleString() + "만 " : ""}원`;
  }
  return `${amount.toLocaleString()}만 원`;
};

const formatPremium = (amount: number) => `${amount.toLocaleString()}원`;

// 문자열에서 숫자만 추출하는 헬퍼
const extractNumber = (str: string | undefined | null) => {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
};

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState({
    premium: { before: 0, after: 0 },
    coverages: [] as { name: string; before: number; after: number }[],
    rawPolicies: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const { data: clientData } = await supabase.from("clients").select("*").eq("id", clientId).single();
    if (clientData) setClient(clientData);

    const { data: insData } = await supabase.from("subscription_insurance").select("*").eq("client_id", clientId);

    if (insData) {
      let premiumBefore = 0;
      let premiumAfter = 0;
      const coverageMap: Record<string, { before: number; after: number }> = {};

      insData.forEach((ins) => {
        const isBefore = ins.policy_status === "maintain" || ins.policy_status === "cancel";
        const isAfter = ins.policy_status === "maintain" || ins.policy_status === "new";

        if (isBefore) premiumBefore += ins.monthly_premium || 0;
        if (isAfter) premiumAfter += ins.monthly_premium || 0;

        if (ins.details && Array.isArray(ins.details)) {
          ins.details.forEach((detail: any) => {
            const name = detail.name.trim();
            if (!name) return;

            const beforeVal = extractNumber(detail.original_amount || detail.amount);
            const afterVal = detail.is_deleted ? 0 : extractNumber(detail.amount);

            if (!coverageMap[name]) {
              coverageMap[name] = { before: 0, after: 0 };
            }
            if (isBefore) coverageMap[name].before += beforeVal;
            if (isAfter) coverageMap[name].after += afterVal;
          });
        }
      });

      const coveragesArray = Object.keys(coverageMap)
        .map((key) => ({
          name: key,
          before: coverageMap[key].before,
          after: coverageMap[key].after,
        }))
        .filter(item => item.before > 0 || item.after > 0)
        .sort((a, b) => b.before - a.before);

      setAnalysisData({
        premium: { before: premiumBefore, after: premiumAfter },
        coverages: coveragesArray,
        rawPolicies: insData || [],
      });
    }
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    if (clientId) void fetchData();
  }, [clientId, fetchData]);

  if (isLoading || !client) {
    return <div className="flex h-[50vh] items-center justify-center text-gray-500">분석 데이터를 계산 중입니다...</div>;
  }

  const premiumDiff = analysisData.premium.after - analysisData.premium.before;

  const chartData = [
    { name: "기존 보험료", premium: analysisData.premium.before, color: "#94A3B8" }, 
    { name: "제안 보험료", premium: analysisData.premium.after, color: "#2563EB" },  
  ];

  return (
    <>
      {/* ⭐️ PDF 인쇄 최적화 스타일 (매우 중요) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* 1. 배경색 및 그라데이션 강제 인쇄 명령 */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* 2. 스크롤 해제 */
          html, body, main, div { 
            height: auto !important; 
            max-height: none !important; 
            overflow: visible !important; 
          }
          /* 3. 사이드바 등 불필요한 UI 숨김 */
          header, nav, aside, [role="navigation"], .fixed, .sticky, [class*="sidebar"], [class*="header"] { 
            display: none !important; 
          }
          /* 4. A4 용지 기본 여백 설정 */
          @page { margin: 10mm; }
          /* 5. 표지 카드 사이즈 A4 맞춤 */
          .cover-page { 
            height: 270mm !important; 
            margin-bottom: 0 !important;
            border-radius: 20px !important;
          }
        }
      `}} />

      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 pb-24 print:p-0 print:m-0 print:max-w-none">
        
        {/* 화면용 상단 헤더 (인쇄 시 숨김) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-gray-900 pb-4 gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
                보장 분석 및 리모델링 제안서
              </h1>
            </div>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-md">
            <Printer className="w-4 h-4" /> 제안서 출력 (PDF)
          </button>
        </div>

        {/* ⭐️ 0. 인쇄 전용 프리미엄 표지 (Cover Page) */}
        <section className="relative flex flex-col justify-between w-full bg-slate-900 text-white rounded-3xl p-10 md:p-16 mb-8 cover-page print:break-after-page shadow-2xl overflow-hidden">
          {/* 배경 장식 (블러 효과) */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-overlay filter blur-[120px] opacity-40 translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-20 -translate-x-1/4 translate-y-1/4"></div>

          {/* 표지 상단 로고 및 날짜 */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold tracking-widest text-slate-200">CRM PRO</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-400 tracking-widest">CONFIDENTIAL REPORT</p>
              <p className="text-sm text-slate-400 mt-1">{new Date().toLocaleDateString('ko-KR')}</p>
            </div>
          </div>

          {/* 표지 중앙 메인 타이틀 */}
          <div className="relative z-10 my-24 print:my-auto">
            <p className="text-blue-400 font-semibold tracking-widest mb-6 border-l-4 border-blue-500 pl-4">COMPREHENSIVE INSURANCE ANALYSIS</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 text-white">
              보장 분석 및<br />리모델링 제안서
            </h1>
            <p className="text-lg text-slate-300 max-w-xl font-light leading-relaxed">
              고객님의 현재 위험 대비 수준을 점검하고, 불필요한 지출을 줄여 가장 효율적이고 안정적인 맞춤형 금융 포트폴리오를 제안합니다.
            </p>
          </div>

          {/* 표지 하단 고객 및 담당자 정보 */}
          <div className="relative z-10 flex justify-between items-end border-t border-slate-700/50 pt-10">
            <div>
              <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Prepared for</p>
              <p className="text-4xl font-bold text-white">{client.name} <span className="text-2xl font-normal text-slate-400">고객님</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Financial Consultant</p>
              <p className="text-2xl font-bold text-white">정준희 <span className="text-lg font-normal text-slate-400">ASM</span></p>
              <p className="text-sm text-slate-400 mt-1">인카금융서비스 한강 6팀</p>
            </div>
          </div>
        </section>


        <div className="print:break-after-page space-y-6 print:space-y-8 print:mt-12">
          
          {/* 1. 전문가 브리핑 (Executive Summary) */}
          <section className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200 print:border-slate-300 print:bg-slate-50/50 print:break-inside-avoid">
            <div className="flex items-start gap-5">
              {/* 프로필/직급 아이콘 */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0 mt-1 shadow-md print:border print:border-blue-800">
                <span className="text-white font-black text-lg">ASM</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-slate-200 pb-2 print:border-slate-300">
                  담당자 <span className="text-blue-600">정준희</span>의 컨설팅 브리핑
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed mt-3">
                  안녕하세요 <strong className="text-blue-600">{client.name}</strong> 고객님, 유지 중이신 전체 보험 증권을 종합적으로 분석한 결과, 
                  보장 범위가 겹치는 잉여 특약과 향후 유지비용이 급증하는 갱신형 담보들이 확인되었습니다.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm print:border-slate-300">
                    <p className="text-[11px] font-bold text-blue-600 mb-1">Point 1.</p>
                    <p className="text-xs font-semibold text-gray-800">누수되는 고정 지출 차단</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm print:border-slate-300">
                    <p className="text-[11px] font-bold text-blue-600 mb-1">Point 2.</p>
                    <p className="text-xs font-semibold text-gray-800">3대 핵심 질환 보장 강화</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm print:border-slate-300">
                    <p className="text-[11px] font-bold text-blue-600 mb-1">Point 3.</p>
                    <p className="text-xs font-semibold text-gray-800">절감액을 활용한 노후 자산화</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 월 보험료 변화 (차트 + 텍스트) */}
          <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm print:border-gray-300 print:break-inside-avoid print:shadow-none">
            <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              월 고정 지출 최적화 결과
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-8 print:flex-row print:items-stretch">
              <div className="w-full md:w-1/2 h-[260px] print:w-1/2 print:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
                    <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: number) => [`${value.toLocaleString()}원`, '보험료']} />
                    <Bar dataKey="premium" radius={[8, 8, 0, 0]} barSize={50} isAnimationActive={false}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-4 print:w-1/2">
                <div className={`p-5 rounded-xl border-2 ${premiumDiff <= 0 ? 'bg-blue-50/50 border-blue-200 print:bg-blue-50' : 'bg-red-50/50 border-red-200 print:bg-red-50'}`}>
                  <p className={`text-sm font-bold ${premiumDiff <= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    리모델링 {premiumDiff <= 0 ? '절감' : '추가'} 효과
                  </p>
                  <div className="mt-2 text-2xl font-black text-gray-900 flex items-center gap-2">
                    월 {premiumDiff <= 0 ? <TrendingDown className="w-6 h-6 text-blue-600" /> : <TrendingUp className="w-6 h-6 text-red-600" />}
                    <span className={premiumDiff <= 0 ? 'text-blue-600' : 'text-red-600'}>
                      {formatPremium(Math.abs(premiumDiff))}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">기존 합계</p>
                    <p className="text-lg font-bold text-gray-400 line-through">{formatPremium(analysisData.premium.before)}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">제안 합계</p>
                    <p className="text-lg font-bold text-gray-900">{formatPremium(analysisData.premium.after)}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. 장기 누적 절감액 (인포그래픽) - 2페이지 하단을 꽉 채우는 요소 */}
          {premiumDiff < 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:break-inside-avoid">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[140px] print:bg-slate-800 print:border print:border-slate-900">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">10년 장기 누적 세이브 자산</p>
                  <p className="text-3xl font-black text-yellow-400 mt-2">
                    {formatPremium(Math.abs(premiumDiff) * 12 * 10)}
                  </p>
                </div>
                <p className="text-xs text-slate-300 mt-4 leading-tight">
                  단순 지출 조정을 통해 중형 세단 1대 가격의 은퇴 자금을 추가 확보했습니다.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[140px] print:bg-blue-900 print:border print:border-blue-950">
                <div>
                  <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">20년 장기 누적 세이브 자산</p>
                  <p className="text-3xl font-black text-green-400 mt-2">
                    {formatPremium(Math.abs(premiumDiff) * 12 * 20)}
                  </p>
                </div>
                <p className="text-xs text-blue-200 mt-4 leading-tight">
                  확보된 잉여 자금을 비과세 계좌로 이전하여 평생 마르지 않는 자산을 구축하세요.
                </p>
              </div>
            </section>
          )}
          
          {/* premiumDiff 가 0보다 커서 절감액 인포그래픽이 뜨지 않을 때를 대비한 대체 메시지 */}
          {premiumDiff > 0 && (
            <section className="bg-amber-50 rounded-2xl p-6 border border-amber-200 print:border-amber-300 print:bg-amber-50">
               <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-800 leading-relaxed font-medium">
                    본 리모델링은 보험료 절감보다는 <strong className="text-amber-900">부족한 핵심 보장을 정상화하여 필수적인 위험 대비책을 완성</strong>하는 데 목적을 두고 설계되었습니다. 추가된 예산 이상의 탄탄한 보호막이 제공됩니다.
                  </p>
               </div>
            </section>
          )}
          
        </div>










        {/* 2. 장기 누적 절감액 (인포그래픽) */}
        {premiumDiff < 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:break-inside-avoid">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[140px]">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">10년 장기 누적 세이브 자산</p>
                <p className="text-3xl font-black text-yellow-400 mt-2">
                  {formatPremium(Math.abs(premiumDiff) * 12 * 10)}
                </p>
              </div>
              <p className="text-xs text-slate-300 mt-4 leading-tight">
                단순 지출 조정을 통해 중형 세단 1대 가격의 은퇴 자금을 추가 확보했습니다.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[140px]">
              <div>
                <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">20년 장기 누적 세이브 자산</p>
                <p className="text-3xl font-black text-green-400 mt-2">
                  {formatPremium(Math.abs(premiumDiff) * 12 * 20)}
                </p>
              </div>
              <p className="text-xs text-blue-200 mt-4 leading-tight">
                확보된 잉여 자금을 비과세 계좌로 이전하여 평생 마르지 않는 자산을 구축하세요.
              </p>
            </div>
          </section>
        )}

        {/* 3. 보장 금액 비교 표 */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden print:break-inside-avoid print:mt-10">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">주요 보장자산 비교</h2>
            <p className="text-[11px] text-gray-400">* 리모델링에 따른 보장 금액 합산 변화</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-gray-900 w-1/4">담보 항목</th>
                <th className="px-6 py-4 text-right text-gray-500 w-1/4">리모델링 전</th>
                <th className="px-6 py-4 text-right font-bold text-blue-600 bg-blue-50/20 w-1/4">리모델링 후</th>
                <th className="px-6 py-4 text-right font-bold text-gray-900 w-1/4">증감</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analysisData.coverages.map((item, index) => {
                const gap = item.after - item.before;
                return (
                  <tr key={index} className="hover:bg-gray-50/50 print:break-inside-avoid">
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{formatMoney(item.before)}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 bg-blue-50/5">{formatMoney(item.after)}</td>
                    <td className="px-6 py-4 text-right font-bold">
                      {gap > 0 ? (
                        <span className="text-red-600">▲ {formatMoney(gap)}</span>
                      ) : gap < 0 ? (
                        <span className="text-blue-600">▼ {formatMoney(Math.abs(gap))}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* 4. 증권별 상세 리모델링 내역 */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden print:break-before-page">
          <div className="px-6 py-4 bg-gray-900 text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest">리모델링 상세 내역 (증권별)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 print:grid-cols-3 print:divide-y-0 print:divide-x">
            {/* 해지 보험 */}
            <div className="p-5 bg-red-50/10 print:bg-red-50/30">
              <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2 border-b border-red-100 pb-2">
                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">해지</span> 정리할 보험
              </h3>
              <div className="space-y-4">
                {analysisData.rawPolicies.filter(p => p.policy_status === "cancel").map(cov => (
                  <div key={cov.id} className="bg-white rounded-xl border border-red-100 p-3 shadow-sm print:break-inside-avoid">
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">{cov.insurance_company}</p>
                    <p className="font-semibold text-gray-900 text-xs mb-2 leading-tight">{cov.product_name}</p>
                    <p className="text-right font-bold text-red-600 line-through text-sm">{formatPremium(cov.monthly_premium)}</p>
                  </div>
                ))}
                {analysisData.rawPolicies.filter(p => p.policy_status === "cancel").length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">해지할 보험이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 유지/조정 보험 */}
            <div className="p-5 bg-blue-50/10 print:bg-blue-50/30">
              <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2 border-b border-blue-100 pb-2">
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">유지</span> 유지 및 조정 보험
              </h3>
              <div className="space-y-4">
                {analysisData.rawPolicies.filter(p => p.policy_status === "maintain").map(cov => (
                  <div key={cov.id} className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm print:break-inside-avoid">
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">{cov.insurance_company}</p>
                    <p className="font-semibold text-gray-900 text-xs mb-2 leading-tight">{cov.product_name}</p>
                    
                    {cov.details && (
                      <div className="space-y-1 mt-2 pt-2 border-t border-dashed border-gray-100">
                        {cov.details.map((d: any, i: number) => (
                          <div key={i} className={`flex justify-between text-[10px] ${d.is_deleted ? 'text-red-400 line-through' : 'text-gray-600'}`}>
                            <span className="truncate pr-2">{d.name}</span>
                            <span className="font-medium text-gray-900 shrink-0">
                              {d.is_deleted ? '삭제됨' : d.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-right font-bold text-blue-700 mt-2 text-sm">{formatPremium(cov.monthly_premium)}</p>
                  </div>
                ))}
                {analysisData.rawPolicies.filter(p => p.policy_status === "maintain").length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">유지하는 보험이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 신규 보험 */}
            <div className="p-5 bg-green-50/10 print:bg-green-50/30">
              <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2 border-b border-green-100 pb-2">
                <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">신규</span> 신규 제안 보험
              </h3>
              <div className="space-y-4">
                {analysisData.rawPolicies.filter(p => p.policy_status === "new").map(cov => (
                  <div key={cov.id} className="bg-white rounded-xl border border-green-200 p-3 shadow-sm print:break-inside-avoid">
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">{cov.insurance_company}</p>
                    <p className="font-semibold text-gray-900 text-xs mb-2 leading-tight">{cov.product_name}</p>
                    
                    {cov.details && (
                      <div className="space-y-1 mt-2 pt-2 border-t border-dashed border-gray-100">
                        {cov.details.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-[10px] text-gray-600">
                            <span className="truncate pr-2">{d.name}</span>
                            <span className="font-medium text-gray-900 shrink-0">{d.amount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-right font-bold text-green-700 mt-2 text-sm">{formatPremium(cov.monthly_premium)}</p>
                  </div>
                ))}
                {analysisData.rawPolicies.filter(p => p.policy_status === "new").length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">신규 제안 보험이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}