"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Umbrella, TrendingDown, ShieldCheck, Printer, AlertCircle, Stethoscope, CheckCircle2, Info, FileText, AlertTriangle, Save, Loader2 } from "lucide-react";

// 금액 포맷팅 (숫자 -> 억/만 단위)
const formatMoney = (amount: number) => {
  if (amount === 0) return "0원";
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000);
    const man = amount % 10000;
    return `${eok.toLocaleString()}만 ${man > 0 ? man.toLocaleString() + "만 " : ""}원`;
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
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState({
    premium: { before: 0, after: 0 },
    coverages: [] as { name: string; before: number; after: number }[],
    rawPolicies: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  // 병력/알릴의무 상태
  const [medicalHistory, setMedicalHistory] = useState<any>({ checklist: {}, memo: "" });
  
  // 📝 맞춤형 컨설팅 입력 상태
  const [briefingText, setBriefingText] = useState("예시 : 유지 중이신 전체 보험 증권을 종합적으로 분석한 결과, 보장 범위가 겹치는 잉여 특약과 향후 유지비용이 급증하는 갱신형 담보들이 확인되었습니다.");
  const [points, setPoints] = useState(["예시 : 누수되는 고정 지출 차단", "예시 : 3대 핵심 질환 보장 강화", "예시 : 절감액을 활용한 노후 자산화"]);
  
  // 컨설팅 저장 로딩 상태
  const [isSavingConsulting, setIsSavingConsulting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const { data: clientData } = await supabase.from("clients").select("*").eq("id", clientId).single();
    if (clientData) {
      setClient(clientData);
      setMedicalHistory(clientData.medical_history || { checklist: {}, memo: "" });
      
      // DB에 저장된 컨설팅 데이터가 있으면 불러오기
      if (clientData.consulting_details) {
        if (clientData.consulting_details.briefing) setBriefingText(clientData.consulting_details.briefing);
        if (clientData.consulting_details.points) setPoints(clientData.consulting_details.points);
      }
    }

    // ⭐️ 2. 담당자(Agent) 및 소속 회사(Agency) 정보 함께 불러오기
    if (clientData.agent_id) {
      const { data: agentData } = await supabase
        .from("agents")
        .select("*, agencies(*)") // 외래키로 연결된 agencies 테이블까지 한 번에 가져옵니다.
        .eq("id", clientData.agent_id)
        .single();
        
      if (agentData) setAgentInfo(agentData);
    }

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
        .filter((item) => item.before > 0 || item.after > 0)
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

  // ⭐️ 컨설팅 내용 DB 저장 함수
  const handleSaveConsulting = async () => {
    setIsSavingConsulting(true);
    try {
      const payload = {
        briefing: briefingText,
        points: points
      };
      const { error } = await supabase
        .from("clients")
        .update({ consulting_details: payload })
        .eq("id", clientId);

      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000); // 2초 후 성공 아이콘 원복
    } catch (error: any) {
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSavingConsulting(false);
    }
  };

  const handlePrint = () => {
    // 1. 날짜 포맷 (YYMMDD 형식)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;

    // 2. 고객 이름 추출
    const clientName = client?.name || "고객";

    // 3. 파일명(타이틀) 조합
    const printTitle = `${dateStr}_${clientName}_보장분석 및 리모델링 제안서`;

    // 4. 기존 타이틀 백업 후 변경
    const originalTitle = document.title;
    document.title = printTitle;

    // 5. 인쇄 (PDF 저장) 실행
    window.print();

    // 6. 브라우저가 타이틀을 읽어간 후 원래 타이틀로 복구
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

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
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body, main, div {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          header, nav, aside, [role="navigation"], .fixed, .sticky, [class*="sidebar"], [class*="header"] {
            display: none !important;
          }
          @page { margin: 10mm; }
          .cover-page {
            height: 270mm !important;
            margin-bottom: 0 !important;
            border-radius: 20px !important;
          }
          textarea, input {
            border: none !important;
            background: transparent !important;
            resize: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}} />
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 print:p-1 print:m-0 print:max-w-none print:bg-white">
        
        {/* 상단 헤더 */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 -mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-gray-900 gap-4 print:hidden">
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
          <div className="flex items-center gap-3">
              <button 
                onClick={handleSaveConsulting}
                disabled={isSavingConsulting || saveSuccess}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all  ${
                  saveSuccess ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-white border border-slate-300 text-slate-700"
                }`}
              >
              {isSavingConsulting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {isSavingConsulting ? "저장 중..." : saveSuccess ? "저장 완료" : "내용 저장"}
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-md">
              <Printer className="w-4 h-4" /> 제안서 출력 (PDF)
            </button>
          </div>
        </div>

        {/* ⭐️ 0. 인쇄 전용 프리미엄 표지 (Cover Page) */}
        <section className="relative flex flex-col justify-between bg-white border border-slate-400 w-full rounded-3xl p-10 md:p-16 mb-8 cover-page print:break-after-page overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-overlay filter blur-[120px] opacity-40 translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-20 -translate-x-1/4 translate-y-1/4"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold tracking-widest text-slate-800">{agentInfo.agencies.corporation_name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mt-1">{new Date().toLocaleDateString('ko-KR')}</p>
            </div>
          </div>

          <div className="relative z-10 my-24 print:my-auto">
            <p className="text-blue-400 font-semibold tracking-widest mb-6 border-l-4 border-blue-500 pl-4">COMPREHENSIVE INSURANCE ANALYSIS</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 text-slate-900">
              보장 분석 및<br />리모델링 제안서
            </h1>
          </div>

          {/* ⭐️ 표지 하단 고객 및 동적 담당자 정보 */}
          <div className="relative z-10 flex justify-between items-end border-t border-slate-700/50 pt-10">
            <div>
              <p className="text-sm text-slate-600 mb-2 uppercase tracking-wider">Prepared for</p>
              <p className="text-4xl font-bold text-slate-900">{client.name} <span className="text-2xl font-normal text-slate-600">고객님</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Financial Consultant</p>
              <p className="text-2xl font-bold text-slate-900">
                {agentInfo?.name || "담당자"} <span className="text-lg font-normal text-slate-600">{agentInfo?.rank || "FC"}</span>
              </p>
            </div>
          </div>
        </section>

          
          {/* 2. 전문가 브리핑 및 컨설팅 포인트 */}
          {/* <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-400 print:border-slate-300 print:break-inside-avoid">
          <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2 print:border-slate-300">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <HeartHandshake className="w-6 h-6 text-blue-600" />
                안녕하세요 <strong className="text-blue-600">{client.name}</strong> 고객님,
              </h2>
            </div>
            <div className="flex items-start gap-5">
              <div className="flex-1">
                
                <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                  <p className="w-full mt-1 bg-white rounded p-0 transition-colors print:bg-transparent">
                    현재 위험 대비 수준을 점검하고 불필요한 지출을 줄여 가장 효율적이고 안정적인 맞춤형 포트폴리오를 제안합니다
                  </p>
                </div> */}
                
                {/* ⭐️ 인쇄 시에도 1줄에 3칸 유지되도록 print:grid-cols-3 적용 */}
                {/* <div className="mt-4 grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3">
                  {points.map((point, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm print:border-slate-300 print:break-inside-avoid">
                      <p className="text-[11px] font-bold text-blue-600 mb-1">Point {index + 1}.</p>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...points];
                          newPoints[index] = e.target.value;
                          setPoints(newPoints);
                        }}
                        placeholder={`컨설팅 포인트 ${index + 1}`}
                        className="w-full text-xs font-semibold text-gray-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-500 pb-1 print:border-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section> */}

          

          {/* 3. 월 보험료 변화 */}
          {/* 3 & 4. VIP 맞춤형 재무 & 보장 최적화 리포트 (그래프 제거 & 대시보드화) */}
          <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-400 shadow-sm print:border-slate-300 print:break-inside-avoid print:shadow-none relative overflow-hidden print:min-h-[250mm] flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0 print:border-slate-300">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                종합 재무 & 보장 최적화 리포트
              </h2>
            </div>
            
            {/* ⭐️ PART A: 재무 요약 대시보드 (1열: AS-IS/TO-BE, 2열: 결과 배너) */}
            <div className="flex flex-col gap-4 shrink-0">
              
              {/* --- 1번째 줄: 기존 유지안 vs 최적화 제안 --- */}
              <div className="flex flex-col md:flex-row gap-4 print:flex print:flex-col print:flex-row">
                {/* 기존 유지안 (AS-IS) */}
                <div className="flex-1 bg-slate-50 border border-slate-200 p-6 rounded-2xl print:border-slate-300 flex flex-col justify-between print:flex-1 print:justify-between">
                   <p className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-1.5">
                     <AlertCircle className="w-4 h-4"/> 기존 유지안 (AS-IS)
                   </p>
                   <div className="space-y-4">
                     <div>
                       <p className="text-xs font-bold text-slate-400 mb-1">월 납입 보험료</p>
                       <p className="text-2xl font-black text-slate-700">{formatPremium(analysisData.premium.before)}</p>
                     </div>
                     
                    {premiumDiff < 0 && (
                     <div className="border-t border-slate-200 pt-4 print:border-slate-300">
                       <p className="text-xs font-bold text-slate-400 mb-1">20년 누적 총 납입 원금</p>
                       <p className="text-xl font-black text-slate-500 line-through decoration-slate-400">
                         {formatMoney(analysisData.premium.before * 12 * 20)}
                       </p>
                     </div>
                    )}
                   </div>
                </div>
                

                {/* 최적화 제안 (TO-BE) */}
                <div className="flex-1 bg-blue-50/50 border border-blue-200 p-6 rounded-2xl print:bg-blue-50 print:border-blue-300 flex flex-col justify-between  print:flex-1 print:justify-between">
                   <p className="text-sm font-bold text-blue-600 mb-6 flex items-center gap-1.5">
                     <CheckCircle2 className="w-4 h-4"/> 최적화 제안 (TO-BE)
                   </p>
                   <div className="space-y-4">
                     <div>
                       <p className="text-xs font-bold text-blue-400 mb-1">월 납입 보험료</p>
                       <p className="text-2xl font-black text-gray-900">{formatPremium(analysisData.premium.after)}</p>
                     </div>
                     
                    {premiumDiff < 0 && (
                     <div className="border-t border-blue-100 pt-4 print:border-blue-200">
                       <p className="text-xs font-bold text-blue-400 mb-1">20년 누적 총 납입 원금</p>
                       <p className="text-xl font-black text-gray-900">
                         {formatMoney(analysisData.premium.after * 12 * 20)}
                       </p>
                     </div>
                    )}
                   </div>
                </div>
              </div>
            {/* --- 2번째 줄: 최종 결과 와이드 배너 (보험료 인상/인하에 따른 맞춤형 팩트 세일즈) --- */}
            <div className={`w-full p-5 md:p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-center gap-5 border print:shadow-none ${
              premiumDiff <= 0 
                ? 'bg-gradient-to-r from-blue-700 to-blue-600 border-blue-800' 
                : 'bg-gradient-to-r from-slate-900 to-indigo-950 border-slate-800' // ⭐️ 보험료 인상 시: 프리미엄 다크 인디고 테마로 변경하여 가치 강조
            }`}>
              
              {/* 좌측: 타이틀 및 핵심 가치 제안 */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`p-3 rounded-full shrink-0 border ${
                  premiumDiff <= 0 ? 'bg-white/10 border-white/20' : 'bg-indigo-500/20 border-indigo-500/30'
                }`}>
                  {premiumDiff <= 0 ? (
                    <TrendingDown className="w-8 h-8 text-yellow-300"/>
                  ) : (
                    <ShieldCheck className="w-8 h-8 text-emerald-400 animate-pulse"/> // ⭐️ 인상 시 '방어막 강화' 시각화
                  )}
                </div>
                <div>
                  <p className={`text-sm font-bold tracking-wide mb-1 ${
                    premiumDiff <= 0 ? 'text-white/80' : 'text-indigo-300'
                  }`}>
                    {premiumDiff <= 0 ? '💡 평생 고정 지출 절감 완료' : '🛡️ 가성비 중심 핵심 보장 자산 극대화'}
                  </p>
                  <p className="text-3xl font-black flex items-center gap-1.5 text-white">
                    {premiumDiff <= 0 ? (
                      <>
                        {formatPremium(Math.abs(premiumDiff))} 절감
                        <span className="text-xs font-medium text-white/60 ml-1">/ 월</span>
                      </>
                    ) : (
                      <>
                        핵심 보장 자산 대폭 강화
                        <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md ml-2 text-sm">
                          인수 심사 유리
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* 우측: 경제적 가치 환산 스코어 보드 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full md:w-auto text-left md:text-right shadow-inner backdrop-blur-sm">
                {premiumDiff <= 0 ? (
                  <>
                    <p className="text-[11px] font-medium mb-1 text-white/70">20년 기준 최종 세이브 자산</p>
                    <p className="text-2xl font-black text-yellow-300">
                      {formatMoney(Math.abs(premiumDiff * 12 * 20))}
                    </p>
                  </>
                ) : (
                  <>
                    {/* ⭐️ 보험료가 올랐을 때만 노출되는 '미래 위험 방어 비용' 환산 수치 */}
                    <p className="text-[11px] font-medium mb-1 text-indigo-300">3대 질환 진단 시 최대 방어 비용 (치료비+생활비)</p>
                    <p className="text-2xl font-black text-emerald-400">
                      + {formatMoney(
                        (analysisData.coverages.find(c => c.name.includes("암"))?.after || 0) +
                        (analysisData.coverages.find(c => c.name.includes("뇌"))?.after || 0) +
                        (analysisData.coverages.find(c => c.name.includes("심"))?.after || 0)
                      )} 확보
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* ⭐️ 보험료가 인상되었을 때 고객을 완벽히 납득시키는 [컨설팅 가치 서브 배너] */}
            {premiumDiff > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 print:grid-cols-2">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-emerald-900 mb-0.5">"가짜 보장"에서 "진짜 보장"으로의 전환</h5>
                    <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                    그동안 보험료는 계속 내셨지만, '뇌경색', '급성심근경색' 등 막상 큰병에 걸리면 받는 확률 10%짜리 가짜 방어막이었습니다.
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <Umbrella className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-blue-900 mb-0.5">소액암·유사암 및 수술비 공백 완전 메움</h5>
                    <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                      기존 포트폴리오에서 구멍 나 있던 공백을 메웠습니다. 이제 리스크가 발생해도 가계 자산이 무너지지 않는 100% 철벽 방어막이 완성되었습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            </div>

            {/* ⭐️ PART B: 제일 많이 증가한 순서대로 뽑아주는 핵심 보장 업그레이드 TOP 3 */}
            <div className="flex-1 flex flex-col justify-center mt-2">
              <div className="mb-4">
                <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600"/> 핵심 방어막 업그레이드 TOP 3
                </h4>
                <p className="text-xs font-bold text-gray-500 mt-1">리모델링을 통해 기존 대비 보장 금액이 <strong className="text-emerald-600">가장 많이 늘어난 3가지 핵심 담보</strong>입니다.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4">
                {analysisData.coverages
                  .filter(item => item.after > item.before)
                  // 👇 여기가 순증가액이 가장 큰 순서대로 정렬하는 핵심 코드입니다.
                  .sort((a, b) => (b.after - b.before) - (a.after - a.before)) 
                  .slice(0, 3)
                  .map((item, index) => {
                    const gap = item.after - item.before;
                    const increaseRate = item.before === 0 ? "신규 장착!" : `${Math.round((gap / item.before) * 100)}% 상승`;
                    
                    return (
                      <div key={index} className="bg-white border-2 border-emerald-100 p-5 rounded-2xl shadow-sm print:border-emerald-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl">
                          {increaseRate}
                        </div>
                        <p className="text-sm font-black text-gray-800 mb-4 pr-12 truncate">{item.name}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-medium text-gray-400">
                            <span>기존 보장액</span>
                            <span className="line-through">{formatMoney(item.before)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-700">제안 보장액</span>
                            <span className="font-black text-emerald-600">{formatMoney(item.after)}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200 text-right">
                          <span className="text-[11px] font-bold text-gray-500 mr-2">보장 순증가액</span>
                          <span className="text-base font-black text-blue-600">+{formatMoney(gap)}</span>
                        </div>
                      </div>
                    );
                })}
                
                {/* 만약 보장이 늘어난게 3개가 안 될 경우를 대비한 빈 칸(Fallback) */}
                {analysisData.coverages.filter(item => item.after > item.before).length === 0 && (
                  <div className="col-span-3 bg-gray-50 border border-gray-200 p-6 rounded-2xl text-center text-gray-500 font-bold text-sm">
                    보장금액이 상향된 항목이 없거나, 보장 분석 데이터가 부족합니다.
                  </div>
                )}
              </div>
            </div>
            {/* PART C: 전문가 총평 (A4 하단 마감) */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl print:bg-slate-50/80 shrink-0 mt-2">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="w-full">
                  <p className="text-sm font-bold text-slate-800 mb-1">Total Consulting Verdict</p>
                  <textarea
                    value={briefingText}
                    onChange={(e) => setBriefingText(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-600 font-medium leading-relaxed outline-none resize-none focus:border-b focus:border-blue-300 transition-colors print:border-none print:p-0"
                    rows={briefingText ? briefingText.split('\n').length + 1 : 3}
                  />
                </div>
              </div>
            </div>

          </section>


        {/* 5. 보장 금액 비교 표 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-400 shadow-sm print:border-slate-300 print:break-inside-avoid print:shadow-none relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            리모델링 보장 금액 합산
            </h2>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
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
                  <tr key={index} className="print:break-inside-avoid">
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

        {/* 6. 증권별 상세 리모델링 내역 */}
        
        <section className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-400 shadow-sm print:border-slate-300 print:break-inside-avoid print:shadow-none relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            리모델링 상세 내역
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-gray-200 print:grid-cols-3 ">
            {/* 해지 보험 */}
            <div className="p-5 border-0">
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
            <div className="p-5 border-0">
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
            <div className="p-5 border-0">
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

        {/* 1. 알릴의무 분석 리포트 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-400 shadow-sm print:border-slate-300 print:break-inside-avoid print:shadow-none relative overflow-hidden">
            <div className="mt-12 flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                고객 건강 및 알릴의무 분석
              </h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full print:border print:border-slate-300">
                심평원 데이터 기반
              </span>
            </div>

            {Object.values(medicalHistory.checklist || {}).some(val => val === true) ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 print:bg-red-50/50">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-black text-red-800">알릴 의무 해당 항목이 발견되었습니다. (상세 심사 필요)</p>
                  <p className="text-xs font-semibold text-red-600/80 mt-0.5">아래 붉은색으로 표기된 항목에 대해 보험사 고지가 필요합니다.</p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-6 flex items-center gap-3 print:bg-emerald-50/50">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-black text-emerald-800">특이 고지사항 없음 (건강체/우량체 가입 유리)</p>
                  <p className="text-xs font-semibold text-emerald-600/80 mt-0.5">고지 대상에 해당되는 이력이 발견되지 않았습니다.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {[
                { id: "q3Month_hospital", label: "3개월 내 병원 이력" },
                { id: "q1Year_same_disease", label: "1년 내 추가검사/재검사" },
                { id: "q5Year_surgery_suspect", label: "5년 내 수술 및 처치" },
                { id: "q5Year_hospitalization", label: "5년 내 입원 이력" },
                { id: "q5Year_7days_visit", label: "5년 내 7일 이상 통원" },
                { id: "q5Year_30days_medication", label: "5년 내 30일 이상 투약" },
              ].map((item) => {
                const isWarning = medicalHistory.checklist?.[item.id];
                return (
                  <div key={item.id} className={`flex items-center gap-2.5 p-3 rounded-xl border ${isWarning ? 'bg-red-50/50 border-red-200 print:bg-red-50' : 'bg-slate-50/50 border-slate-100 print:bg-white'} transition-colors`}>
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={`text-xs font-bold ${isWarning ? 'text-red-700' : 'text-slate-400 line-through decoration-slate-300'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5 print:bg-blue-50/50">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 상세 병력 및 분석 코멘트
              </p>
              <textarea
                value={medicalHistory.memo || ""}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, memo: e.target.value })}
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none resize-none leading-relaxed min-h-[300px] focus:border-b focus:border-blue-300 transition-colors print:border-none "
                rows={medicalHistory.memo ? medicalHistory.memo.split('\n').length + 1 : 4}
                placeholder="상세 병력 내용이 없습니다."
              />
            </div>

            <p className="text-[10px] font-semibold text-slate-400 mt-5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" /> 
              본 리포트는 국민건강보험공단(심평원) 진료 데이터를 기반으로 작성된 참고용 자료입니다
            </p>
          </section>

      </div>
    </>
  );
}