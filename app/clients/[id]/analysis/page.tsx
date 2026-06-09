"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, TrendingUp, TrendingDown, ShieldCheck, Printer } from "lucide-react";

// 금액 포맷팅 (숫자만 입력했다고 가정, 만 원 단위로 텍스트 추가)
const formatMoney = (amount: number) => {
  if (amount === 0) return "0";
  if (amount >= 10000) return `${(amount / 10000).toLocaleString()}억 원`;
  return `${amount.toLocaleString()}만 원`;
};

const formatPremium = (amount: number) => {
  return `${amount.toLocaleString()}원`;
};

const formatDetailAmount = (amountStr: string) => {
  if (!amountStr) return "-";
  // 문자열이 오직 숫자와 쉼표(,)로만 이루어져 있는지 검사
  const isPureNumber = /^[0-9, ]+$/.test(amountStr);
  if (isPureNumber) {
    const num = parseInt(amountStr.replace(/,/g, ""), 10) || 0;
    if (num === 0) return "0원";
    if (num >= 10000) return `${(num / 10000).toLocaleString()}억 원`;
    return `${num.toLocaleString()}만 원`;
  }
  // "실손", "1종" 처럼 글자가 섞여 있다면 입력한 그대로 출력
  return amountStr;
};

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState({
    premium: { before: 0, after: 0 },
    coverages: [] as { name: string; before: number; after: number }[],
    rawPolicies: [] as any[], // 원본 보험 리스트 저장용
  });
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 불러오기 및 가공 로직
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    // 1. 고객 기본 정보 조회
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();
    if (clientData) setClient(clientData);

    // 2. 고객의 전체 보험 내역 조회
    const { data: insData } = await supabase
      .from("subscription_insurance")
      .select("*")
      .eq("client_id", clientId);

    if (insData) {
      let premiumBefore = 0;
      let premiumAfter = 0;
      const coverageMap: Record<string, { before: number; after: number }> = {};

      // 3. Before / After 자동 합산 계산식
      insData.forEach((ins) => {
        const isBefore = ins.policy_status === "maintain" || ins.policy_status === "cancel";
        const isAfter = ins.policy_status === "maintain" || ins.policy_status === "new";

        if (isBefore) premiumBefore += ins.monthly_premium || 0;
        if (isAfter) premiumAfter += ins.monthly_premium || 0;

        if (ins.details && Array.isArray(ins.details)) {
          ins.details.forEach((detail: { name: string; amount: string }) => {
            const name = detail.name.trim();
            if (!name) return;

            const numericAmount = parseInt(detail.amount.replace(/[^0-9]/g, ""), 10) || 0;

            if (!coverageMap[name]) {
              coverageMap[name] = { before: 0, after: 0 };
            }
            if (isBefore) coverageMap[name].before += numericAmount;
            if (isAfter) coverageMap[name].after += numericAmount;
          });
        }
      });

      const coveragesArray = Object.keys(coverageMap).map((key) => ({
        name: key,
        before: coverageMap[key].before,
        after: coverageMap[key].after,
      }));

      setAnalysisData({
        premium: { before: premiumBefore, after: premiumAfter },
        coverages: coveragesArray,
        rawPolicies: insData || [],
      });
    }
    
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      void fetchData();
    }
  }, [clientId, fetchData]);

  if (isLoading || !client) {
    return <div className="flex h-[50vh] items-center justify-center text-gray-500">분석 데이터를 계산 중입니다...</div>;
  }

  const premiumDiff = analysisData.premium.after - analysisData.premium.before;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* ⭐️ 인쇄할 때 부모 레이아웃의 스크롤 제한을 강제로 해제하는 마법의 코드 */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* 1. 스크롤/높이 제한 해제 */
          html, body, main, div {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          /* ⭐️ 2. 상단바, 사이드바, 햄버거 메뉴 등 화면에 고정된 요소 강력 숨김 */
          header, nav, aside, [role="navigation"], 
          .fixed, .sticky, 
          [class*="sidebar"], [class*="header"] {
            display: none !important;
          }
          /* 3. 프린트 여백 리셋 */
          @page {
            margin: 1.5cm;
          }
        }
      `}} />
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 pb-24 print:p-0 print:m-0 print:w-full print:max-w-none print:bg-white">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-gray-900 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition print:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
              보장 분석 및 리모델링 제안서
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              <strong className="text-gray-900">{client.name}</strong> 고객님을 위한 맞춤형 분석 결과입니다.
            </p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition print:hidden"
        >
          <Printer className="w-4 h-4" />
          PDF 저장 / 인쇄
        </button>
      </div>

      <section className="bg-gray-50 rounded-2xl p-6 border border-gray-200 print:border-gray-300 print:shadow-none print:break-inside-avoid">
        <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">월 보험료 변화</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 print:flex-row">
          <div className="flex-1 bg-white p-5 rounded-xl border border-gray-100 shadow-sm w-full text-center print:border-gray-300">
            <p className="text-sm font-medium text-gray-500 mb-1">리모델링 전</p>
            <p className="text-2xl font-bold text-gray-400 line-through decoration-gray-300">
              {formatPremium(analysisData.premium.before)}
            </p>
          </div>
          <div className="flex-1 bg-white p-5 rounded-xl border-2 border-blue-500 shadow-md w-full text-center print:border-2 print:border-blue-600">
            <p className="text-sm font-bold text-blue-600 mb-1">리모델링 후</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {formatPremium(analysisData.premium.after)}
            </p>
          </div>
          <div className={`flex-1 p-5 rounded-xl border w-full text-center flex flex-col items-center justify-center print:border-gray-300 ${premiumDiff < 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
            <p className="text-sm font-medium text-gray-600 mb-1">월 {premiumDiff < 0 ? '절감액' : '추가액'}</p>
            <div className={`flex items-center gap-1 text-2xl font-bold ${premiumDiff < 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {premiumDiff < 0 ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
              {formatPremium(Math.abs(premiumDiff))}
            </div>
          </div>
        </div>
      </section>

      {/* ⭐️ 1. 표 행 잘림 방지 (print:break-inside-avoid) */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:border-gray-300 print:shadow-none print:break-inside-avoid">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 print:bg-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">세부 보장금액 비교</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-left font-bold text-gray-900 bg-gray-50/50 w-1/4">보장 항목</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 w-1/4">기존 보장 (Before)</th>
                <th className="px-6 py-4 text-right font-bold text-blue-600 bg-blue-50/30 w-1/4 print:bg-blue-50">제안 보장 (After)</th>
                <th className="px-6 py-4 text-right font-bold text-gray-900 w-1/4">증감 내역</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analysisData.coverages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">등록된 세부 보장 내역이 없습니다.</td>
                </tr>
              ) : (
                analysisData.coverages.map((item, index) => {
                  const gap = item.after - item.before;
                  if (item.before === 0 && item.after === 0) return null;

                  return (
                    // ⭐️ 표의 한 줄(tr)이 반으로 쪼개지지 않도록 설정
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors print:break-inside-avoid">
                      <td className="px-6 py-4 font-semibold text-gray-800 bg-gray-50/20">{item.name}</td>
                      <td className="px-6 py-4 text-right text-gray-500">{formatMoney(item.before)}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 bg-blue-50/10 print:bg-blue-50/30">{formatMoney(item.after)}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        {gap > 0 ? (
                          <span className="text-red-600 flex items-center justify-end gap-1">▲ {formatMoney(gap)}</span>
                        ) : gap < 0 ? (
                          <span className="text-blue-600 flex items-center justify-end gap-1">▼ {formatMoney(Math.abs(gap))}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ⭐️ 2. 섹션 강제 넘기기 (print:break-before-page) */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:border-gray-300 print:shadow-none print:break-before-page">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 print:bg-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">리모델링 상세 내역 (증권별)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 print:grid-cols-3 print:divide-y-0 print:divide-x">
          
          <div className="p-4 md:p-5 bg-red-50/20 print:bg-white print:p-4">
            <h3 className="flex items-center gap-2 font-bold text-red-700 mb-4 border-b border-red-100 pb-2">
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">해지</span>기존 보험
            </h3>
            <div className="space-y-4">
              {analysisData.rawPolicies.filter(p => p.policy_status === "cancel").map(cov => (
                // ⭐️ 3. 개별 카드 반갈죽 방지 (print:break-inside-avoid)
                <div key={cov.id} className="bg-white rounded-xl border border-red-100 shadow-sm print:border-gray-300 print:shadow-none overflow-hidden flex flex-col print:break-inside-avoid">
                  <div className="p-3 bg-red-50/30 print:bg-gray-50/50">
                    <p className="text-[11px] font-bold text-gray-400 mb-0.5">{cov.insurance_company}</p>
                    <p className="font-semibold text-gray-900 text-sm leading-tight mb-2">{cov.product_name}</p>
                    <p className="text-right font-extrabold text-red-600 line-through decoration-red-300">
                      {cov.monthly_premium.toLocaleString()}원
                    </p>
                  </div>
                  {cov.details && cov.details.length > 0 && (
                    <div className="px-3 py-2.5 border-t border-dashed border-red-100 print:border-gray-200 bg-white space-y-1.5">
                      {cov.details.map((detail: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] md:text-xs">
                          <span className="text-gray-600 truncate pr-2">{detail.name}</span>
                          <span className="font-semibold text-gray-900 shrink-0">{formatDetailAmount(detail.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {analysisData.rawPolicies.filter(p => p.policy_status === "cancel").length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">해지할 보험이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="p-4 md:p-5 bg-blue-50/20 print:bg-white print:p-4">
            <h3 className="flex items-center gap-2 font-bold text-blue-700 mb-4 border-b border-blue-100 pb-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">유지</span>기존 보험
            </h3>
            <div className="space-y-4">
              {analysisData.rawPolicies.filter(p => p.policy_status === "maintain").map(cov => (
                <div key={cov.id} className="bg-white rounded-xl border border-blue-100 shadow-sm print:border-gray-300 print:shadow-none overflow-hidden flex flex-col print:break-inside-avoid">
                  <div className="p-3 bg-blue-50/30 print:bg-gray-50/50">
                    <p className="text-[11px] font-bold text-gray-400 mb-0.5">{cov.insurance_company}</p>
                    <p className="font-semibold text-gray-900 text-sm leading-tight mb-2">{cov.product_name}</p>
                    <p className="text-right font-extrabold text-blue-700">
                      {cov.monthly_premium.toLocaleString()}원
                    </p>
                  </div>
                  {cov.details && cov.details.length > 0 && (
                    <div className="px-3 py-2.5 border-t border-dashed border-blue-100 print:border-gray-200 bg-white space-y-1.5">
                      {cov.details.map((detail: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] md:text-xs">
                          <span className="text-gray-600 truncate pr-2">{detail.name}</span>
                          <span className="font-semibold text-gray-900 shrink-0">{formatDetailAmount(detail.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {analysisData.rawPolicies.filter(p => p.policy_status === "maintain").length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">유지하는 보험이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="p-4 md:p-5 bg-green-50/20 print:bg-white print:p-4">
            <h3 className="flex items-center gap-2 font-bold text-green-700 mb-4 border-b border-green-100 pb-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">신규</span>제안 보험
            </h3>
            <div className="space-y-4">
              {analysisData.rawPolicies.filter(p => p.policy_status === "new").map(cov => (
                <div key={cov.id} className="bg-white rounded-xl border border-green-200 shadow-sm print:border-gray-300 print:shadow-none overflow-hidden flex flex-col print:break-inside-avoid">
                  <div className="p-3 bg-green-50/30 print:bg-gray-50/50">
                    <p className="text-[11px] font-bold text-gray-400 mb-0.5">{cov.insurance_company}</p>
                    <p className="font-semibold text-gray-900 text-sm leading-tight mb-2">{cov.product_name}</p>
                    <p className="text-right font-extrabold text-green-700">
                      {cov.monthly_premium.toLocaleString()}원
                    </p>
                  </div>
                  {cov.details && cov.details.length > 0 && (
                    <div className="px-3 py-2.5 border-t border-dashed border-green-200 print:border-gray-200 bg-white space-y-1.5">
                      {cov.details.map((detail: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] md:text-xs">
                          <span className="text-gray-600 truncate pr-2">{detail.name}</span>
                          <span className="font-semibold text-gray-900 shrink-0">{formatDetailAmount(detail.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {analysisData.rawPolicies.filter(p => p.policy_status === "new").length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">신규 제안 보험이 없습니다.</p>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
    </>
  );
}