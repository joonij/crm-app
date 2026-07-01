"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Phone, MessageCircle, ChevronDown, TrendingDown, Gift, Share2, CheckCircle2, UserPlus, X, AlertCircle, Home, Bed, Bandage, HeartPulse, Brain, Heart, BriefcaseMedical, AlertTriangle, ShieldAlert } from "lucide-react";

// 금액 포맷팅 헬퍼
const formatMoney = (amount: number) => {
  if (amount === 0) return "0원";
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000);
    const man = amount % 10000;
    return `${eok}억 ${man > 0 ? man + "만" : ""}원`;
  }
  return `${amount.toLocaleString()}만 원`;
};

const extractNumber = (str: string | undefined | null) => {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
};

export default function ClientReportPage() {
  const params = useParams();
  const reportUuid = params.uuid as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expandedCovId, setExpandedCovId] = useState<number | null>(null);

  // 소개 입력 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refForm, setRefForm] = useState({ name: "", phone: "", relation: "" });
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      // 1. 고객 정보 먼저 조회
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("report_uuid", reportUuid)
        .single();

      if (clientError || !client) {
        setIsLoading(false);
        return;
      }

      // 2. 담당자 정보 따로 조회
      const { data: agent } = await supabase
        .from("agents")
        .select("name, rank, phone, agencies(corporation_name)")
        .eq("id", client.agent_id)
        .single();

      // 3. 전체 보험 데이터 조회
      const { data: insurances } = await supabase
        .from("subscription_insurance")
        .select("*")
        .eq("client_id", client.id);

      let premiumBefore = 0;
      let premiumAfter = 0;
      
      // 9가지 조건을 판별하기 위한 확장 스코어 보드
      const scores = {
        cancer: { before: 0, after: 0 },
        brain: { before: 0, after: 0 },
        heart: { before: 0, after: 0 },
        surgery: { before: 0, after: 0 },
        hasJongSurgery: false,     // 종수술비 보유 여부
        homeCare: { before: 0, after: 0 }, // 치매 및 재가급여
        hospitalization: { before: 0, after: 0 },
        injury: { before: 0, after: 0 },
        hasDriver: false,          // 운전자보험 가입 여부
        hasDental: false           // 치아보험 가입 여부
      };

      if (insurances) {
        insurances.forEach(ins => {
          const isBefore = ins.policy_status === "maintain" || ins.policy_status === "cancel";
          const isAfter = ins.policy_status === "maintain" || ins.policy_status === "new";

          if (isBefore) premiumBefore += ins.monthly_premium || 0;
          if (isAfter) premiumAfter += ins.monthly_premium || 0;

          // 상품명 기준 1차 필터링 (운전자 / 치아)
          if (isAfter) {
            const prodName = ins.product_name || "";
            if (prodName.includes("운전자")) scores.hasDriver = true;
            if (prodName.includes("치아") || prodName.includes("덴탈") || prodName.includes("치과")) scores.hasDental = true;
          }

          if (ins.details) {
            ins.details.forEach((d: any) => {
              const beforeVal = extractNumber(d.original_amount || d.amount);
              const afterVal = d.is_deleted ? 0 : extractNumber(d.amount);
              const name = d.name || "";

              // 1. 암 진단비 (유사암, 고액암 제외)
              if (name.includes("암") && !name.includes("유사") && !name.includes("고액")) {
                if (isBefore) scores.cancer.before += beforeVal;
                if (isAfter) scores.cancer.after += afterVal;
              }
              // 2. 뇌질환 진단비
              if (name.includes("뇌")) {
                if (isBefore) scores.brain.before += beforeVal;
                if (isAfter) scores.brain.after += afterVal;
              }
              // 3. 심장질환 진단비
              if (name.includes("허혈") || name.includes("심장") || name.includes("급성심근")) {
                if (isBefore) scores.heart.before += beforeVal;
                if (isAfter) scores.heart.after += afterVal;
              }
              // 4. 수술비 및 종수술비 판별
              if (name.includes("수술")) {
                if (isBefore) scores.surgery.before += beforeVal;
                if (isAfter) scores.surgery.after += afterVal;
                
                if (isAfter && (name.includes("종") || name.includes("1-5종") || name.includes("1-6종") || name.includes("1-9종"))) {
                  scores.hasJongSurgery = true;
                }
              }
              // 5. 치매 또는 재가급여
              if (name.includes("재가") || name.includes("치매")) {
                if (isBefore) scores.homeCare.before += beforeVal;
                if (isAfter) scores.homeCare.after += afterVal;
              }
              // 6. 입원비 일단 (실손 의료비 한도 제외 처리)
              if (name.includes("입원") && !name.includes("진단") && !name.includes("제외") && !name.includes("실손") && !name.includes("의료비")) {
                if (isBefore) scores.hospitalization.before += beforeVal;
                if (isAfter) scores.hospitalization.after += afterVal;
              }
              // 7. 통합상해 / 상해진단비
              if (name.includes("통합상해") || (name.includes("상해") && name.includes("진단"))) {
                if (isBefore) scores.injury.before += beforeVal;
                if (isAfter) scores.injury.after += afterVal;
              }
              // 특약명 기준 대조 (운전자 핵심 특약 / 치아 핵심 특약)
              if (isAfter) {
                if (name.includes("교통사고처리") || name.includes("변호사선임") || name.includes("자동차부상")) scores.hasDriver = true;
                if (name.includes("임플란트") || name.includes("크라운") || name.includes("보철")) scores.hasDental = true;
              }
            });
          }
        });
      }

      setData({
        client, agent, insurances: insurances || [],
        premium: { before: premiumBefore, after: premiumAfter },
        scores
      });
      setIsLoading(false);
    };

    fetchReportData();
  }, [reportUuid]);

  // 카카오톡 공유 로직
  const handleShareReferral = async () => {
    const { client, agent } = data;
    const shareText = `[무료 보장분석]\n\n제가 이번에 ${agent.name} ${agent.rank}님께 보장분석을 받았는데, 불필요하게 새는 보험료도 줄이고 보장도 훨씬 좋아졌어요!\n\n제 지인들에게만 특별히 '무료 정밀 분석'을 해주신다고 하니, 보험료 낭비하고 계신 건 없는지 아래 번호로 꼭 연락해서 점검 받아보세요.\n\n👨‍💼 담당자: ${agent.name} ${agent.rank}\n📞 연락처: ${agent.phone || "번호 미등록"}\n🏢 소속: ${Array.isArray(agent.agencies) ? agent.agencies[0]?.corporation_name : agent.agencies?.corporation_name}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: '스마트 보장분석 초대장', text: shareText });
      } catch (err) { console.log("공유 취소됨", err); }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("추천 메시지가 복사되었습니다! 카카오톡에 붙여넣기 하여 지인에게 보내주세요.");
    }
  };

  const formatPhoneNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    if (num.startsWith("02")) {
      if (num.length <= 2) return num;
      if (num.length <= 5) return `${num.slice(0, 2)}-${num.slice(2)}`;
      if (num.length <= 9) return `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
      return `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6, 10)}`;
    }
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    if (num.length <= 10) return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  const handleSubmitReferral = async () => {
    if (!refForm.name || !refForm.phone) {
      alert("지인분의 성함과 연락처를 입력해주세요.");
      return;
    }
    
    setIsSubmittingRef(true);
    try {
      const { data: newClient, error: clientError } = await supabase.from('clients').insert({
        name: refForm.name,
        phone: refForm.phone,
        agent_id: data.client.agent_id,
        introduce_client: data.client.id,
        contract_status: 3,
        client_source: 3, 
        notes: `모바일 리포트를 통해 직접 소개된 고객입니다. (관계: ${refForm.relation || "미기재"})`
      }).select('id').single();

      if (clientError) throw clientError;
      
      if (newClient) {
        await supabase.from('notifications').insert({
          agent_id: data.client.agent_id,
          title: "신규 지인 소개 접수 🎉",
          message: `${data.client.name} 고객님이 [${refForm.name}]님을 소개하셨습니다.`,
          type: "referral",
          link_url: `/clients/${newClient.id}`
        });
      }
      
      alert("소개 신청이 완료되었습니다. 담당 전문가가 곧 연락드리겠습니다!");
      setIsModalOpen(false);
      setRefForm({ name: "", phone: "", relation: "" });
    } catch (error: any) {
      alert("신청 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsSubmittingRef(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!data || !data.client) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">유효하지 않거나 만료된 링크입니다.</div>;

  const { client, agent, insurances, premium, scores } = data;
  
  const beforePremium = premium?.before || 0;
  const afterPremium = premium?.after || 0;
  const premiumDiff = beforePremium - afterPremium; 
  
  const agentCorp = Array.isArray(agent?.agencies) ? agent.agencies[0]?.corporation_name : agent?.agencies?.corporation_name;
  const activeInsurances = insurances.filter((ins:any) => ins.policy_status === "maintain" || ins.policy_status === "new");

  // 핵심 보장 노출 설정
  const coverageItems = [
    { label: "일반암 진단", icon: HeartPulse, color: "text-rose-500", ...scores?.cancer },
    { label: "뇌혈관 진단", icon: Brain, color: "text-indigo-500", ...scores?.brain },
    { label: "심혈관 진단", icon: Heart, color: "text-red-500", ...scores?.heart },
    { label: "수술비 합산", icon: BriefcaseMedical, color: "text-emerald-500", ...scores?.surgery },
    { label: "재가급여 합산", icon: Home, color: "text-orange-500", ...scores?.homeCare },
    { label: "입원비 합산", icon: Bed, color: "text-cyan-500", ...scores?.hospitalization },
    { label: "통합상해진단비 합산", icon: Bandage, color: "text-amber-500", ...scores?.injury },
  ].map(item => ({
    ...item,
    before: item.before || 0,
    after: item.after || 0,
    increase: (item.after || 0) - (item.before || 0)
  })).filter(item => item.increase > 0)
   .sort((a, b) => b.increase - a.increase);

  const highlightCards = [];
  if (premiumDiff > 0) {
    highlightCards.push({
      isPremium: true,
      label: "월 보험료 절감",
      icon: TrendingDown,
      color: "text-blue-500",
      before: beforePremium,
      after: afterPremium,
      increase: premiumDiff
    });
  }
  highlightCards.push(...coverageItems);

  // ⭐️ 9가지 조건부 보장 공백 데이터 구성
  const gapItems = [
    {
      condition: scores.cancer.after < 5000,
      title: "암 보장 공백 발견",
      desc: `현재 암 보장금액이 ${formatMoney(scores.cancer.after)}으로, 안정권 기준인 보다 부족한 상태입니다.`,
      action: "일반암/유사암 진단비 증액 권장"
    },
    {
      condition: scores.brain.after < 2000,
      title: "뇌혈관 보장 공백 발견",
      desc: `현재 뇌혈관 보장금액이 ${formatMoney(scores.brain.after)}으로, 권장 기준인 보다 부족한 상태입니다.`,
      action: "뇌혈관질환 진단비/수술비 보완 요망"
    },
    {
      condition: scores.heart.after < 2000,
      title: "심장 보장 공백 발견",
      desc: `현재 허혈성/심장 보장금액이 ${formatMoney(scores.heart.after)}으로, 권장 기준인 보다 부족합니다.`,
      action: "허혈성심장/심혈관 특정진단비 보완 권장"
    },
    {
      condition: scores.surgery.after === 0 || !scores.hasJongSurgery,
      title: "질병/종수술비 보장 부재",
      desc: scores.surgery.after === 0 ? "포트폴리오에 수술비 특약이 전혀 확인되지 않습니다." : "질병 강도에 비례해 지급되는 '종수술비(1-5종)'가 빠져있습니다.",
      action: "질병수술비 및 1-5종 수술비 장착 권장"
    },
    {
      condition: scores.homeCare.after === 0,
      title: "치매 리스크 노출",
      desc: "장기요양등급 판정 시 매월 생활비를 받는 재가급여 및 치매 보장 자산이 비어있습니다.",
      action: "LTC 장기요양 재가급여 특약 추가 권장"
    },
    {
      condition: scores.injury.after === 0,
      title: "통합상해진단비 공백",
      desc: "일상생활 중 발생하는 골절, 화상 및 각종 외상성 상해 진단비 자산이 준비되어 있지 않습니다.",
      action: "통합상해진단비 및 골절치료비 보완 권장"
    },
    {
      condition: scores.hospitalization.after === 0,
      title: "일당 입원비 보장 부재",
      desc: "첫날부터 보장받는 질병/상해 입원일당 특약이 없어 장기 입원 시 자부담 리스크가 있습니다.",
      action: "간병인 사용 일당 또는 입원일당 확보 고려"
    },
    {
      condition: !scores.hasDriver,
      title: "운전자 핵심 비용 담보 미가입",
      desc: "민사/형사상 책임을 방어하는 교통사고처리지원금, 변호사선임비용, 벌금 등의 필수 방어막이 없습니다.",
      action: "형사합의금 최대 지원 운전자 플랜 마련 권장"
    },
    {
      condition: !scores.hasDental,
      title: "치아 보장 자산 미가입",
      desc: "큰 비용이 드는 임플란트, 보철치료, 보존치료(크라운)에 대한 전문 치과 치료비 보장이 없습니다.",
      action: "치과 전문 케어 덴탈 포트폴리오 안내 가능"
    }
  ].filter(item => item.condition); // ⭐️True인 조건(부족한 항목)만 필터링

  return (
    <div className="min-h-screen bg-slate-100 pb-28 text-slate-800 font-sans selection:bg-blue-200">
      
      {/* 1. 커버 헤더 */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10">
          <p className="text-blue-600 font-black tracking-widest text-xs mb-4 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4"/> SMART ANALYSIS
          </p>
          <h1 className="text-3xl font-black leading-tight text-slate-900 mb-2 break-keep">
            <span className="text-blue-600">{client.name}</span>님을 위한<br/>맞춤형 보장 분석 결과
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-4 border-l-2 border-slate-300 pl-3">
            현재 가입된 보험의 효율성을 점검하고,<br/>가장 합리적인 대안을 제안해 드립니다.
          </p>
        </div>
      </header>

      <main className="px-5 mt-6 space-y-6 max-w-lg mx-auto">
        
        {/* 2. 핵심 보장 업그레이드 */}
        {highlightCards.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-3 px-1">
              <h2 className="text-base font-black text-slate-800">핵심 보장</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {highlightCards.map((item, idx) => (
                <div key={idx} className={`bg-white p-4 rounded-2xl shadow-sm border relative overflow-hidden ${item.isPremium ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className={`font-bold text-[11px] ${item.isPremium ? 'text-blue-700' : 'text-slate-600'}`}>{item.label}</span>
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-[10px] text-slate-400 line-through decoration-slate-300">
                      기존 {item.isPremium ? item.before.toLocaleString() + '원' : formatMoney(item.before)}
                    </p>
                    <p className={`text-lg font-black ${item.isPremium ? 'text-blue-600' : 'text-slate-800'}`}>
                      {item.isPremium ? item.after.toLocaleString() + '원' : formatMoney(item.after)}
                    </p>
                  </div>
                  <div className={`absolute bottom-0 right-0 text-[10px] font-black px-2 py-1 rounded-tl-lg ${item.isPremium ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    {item.isPremium ? `-${item.increase.toLocaleString()}원` : `+${formatMoney(item.increase)}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⭐️ 3. 동적 보장 공백 진단 섹션 (요청사항 완벽 구현) */}
        <section>
          <div className="flex justify-between items-end mb-3 px-1">
            <h2 className="text-base font-black text-slate-800">보장 공백 진단리포트</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${gapItems.length > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {gapItems.length > 0 ? `미흡 보장 ${gapItems.length}건 발견` : "완벽 철벽 방어"}
            </span>
          </div>

          {gapItems.length > 0 ? (
            <div className="space-y-3">
              {gapItems.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 flex items-start gap-3.5 relative overflow-hidden">
                  <div className="bg-red-50 p-2 rounded-xl shrink-0 text-red-500 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2 break-keep">{item.desc}</p>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-block">
                      {item.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 모든 공백 조건을 클리어했을 때 표시되는 프리미엄 배너
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-2xl shadow-sm text-center">
              <CheckCircle2 className="w-8 h-8 text-yellow-300 mx-auto mb-2 animate-bounce" />
              <h3 className="text-base font-black">완벽한 철벽 방어막 확보!</h3>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed font-medium">
                분석 결과 9대 주요 보장에 공백이 발견되지 않았습니다.<br/>매우 이상적이고 든든한 최고 수준의 포트폴리오입니다.
              </p>
            </div>
          )}
        </section>

        {/* 4. 전문가 소견 (Consulting Briefing) */}
        {client.consulting_details?.briefing && (
          <section className="bg-blue-600 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <h2 className="text-sm font-black mb-4 opacity-90 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> 전문가 종합 코멘트</h2>
            <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap relative z-10">{client.consulting_details.briefing}</p>
          </section>
        )}

        {/* 5. 최종 포트폴리오 요약 */}
        <section>
          <h2 className="text-base font-black mb-3 px-1 text-slate-800">보장 내역</h2>
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden divide-y divide-slate-100">
            <div className="bg-slate-50 p-5 flex justify-between items-center border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500">월 보험료</span>
              <span className="text-xl font-black text-blue-600">{afterPremium.toLocaleString()}원</span>
            </div>
            {activeInsurances.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">등록된 보험 내역이 없습니다.</p>
            ) : (
              activeInsurances.map((ins: any) => (
                <div key={ins.id} className="p-1">
                  <button onClick={() => setExpandedCovId(expandedCovId === ins.id ? null : ins.id)} className="w-full text-left p-4 flex justify-between items-center transition-colors active:bg-slate-50 rounded-xl">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-[10px] font-bold text-slate-600">{ins.insurance_company}</p>
                        {(ins.subscription_date || ins.maturity_date) && (
                          <span className="text-[9px] text-slate-400 font-medium">
                            ({ins.subscription_date ? ins.subscription_date.substring(0, 10).replace(/-/g, '.') : ''} 
                            {ins.maturity_date ? ` ~ ${ins.maturity_date.substring(0, 10).replace(/-/g, '.')}` : ''})
                          </span>
                        )}
                        {ins.indemnity_generation && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-100">
                            {ins.indemnity_generation}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-tight truncate">{ins.product_name}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <p className="text-sm font-black text-slate-900">{ins.monthly_premium.toLocaleString()}원</p>
                      <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${expandedCovId === ins.id ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {expandedCovId === ins.id && ins.details && (
                    <div className="px-4 pb-4 pt-1">
                      <div className="bg-slate-50/80 p-3 rounded-xl space-y-2 border border-slate-100">
                        {ins.details.filter((d:any) => !d.is_deleted).map((detail: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 font-medium truncate pr-4">{detail.name}</span>
                            <span className="font-bold text-slate-900 shrink-0">{detail.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* 6. 지인 소개 유도 컴포넌트 */}
        <section className="pt-4 pb-4">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500 rounded-full mix-blend-screen filter blur-[60px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-[50px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white mb-2 leading-snug break-keep">
                소중한 가족과 지인도<br/>보험료를 낭비하고 있다면?
              </h3>
              <p className="text-xs text-indigo-200 font-medium leading-relaxed mb-6">
                {client.name}님이 경험하신 놀라운 보장분석 결과를 사랑하는 분들께도 선물해 보세요. <strong className="text-white bg-indigo-500/30 px-1 rounded">{client.name}님의 지인에 한해 우선적으로 분석 진행해 드립니다.</strong>
              </p>
              
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-white text-indigo-900 font-black py-3.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  지인 무료 분석 직접 신청하기
                </button>
                
                <button 
                  onClick={handleShareReferral}
                  className="w-full bg-indigo-800/50 border border-indigo-400/30 text-indigo-100 font-bold py-3.5 rounded-xl hover:bg-indigo-800/70 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  또는 카카오톡으로 초대장 전달하기
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 플로팅 담당자 연락 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400">{agentCorp}</span>
            <span className="text-sm font-black text-slate-800">{agent?.name} <span className="font-normal text-slate-500 text-xs">{agent?.rank}</span></span>
          </div>
          <div className="flex gap-2 shrink-0">
            {agent?.phone && (
              <a href={`sms:${agent.phone}`} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200 transition-colors shadow-sm">
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {agent?.phone && (
              <a href={`tel:${agent.phone}`} className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white active:bg-slate-800 transition-colors shadow-md hover:shadow-lg">
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 지인 소개 직접 입력 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition-colors">
              <X className="w-5 h-5"/>
            </button>
            
            <div className="mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1.5">보장 분석 신청</h3>
              <p className="text-xs text-slate-500 break-keep leading-relaxed">
                정보를 남겨주시면 담당 전문가가 {client.name}님의 소개임을 말씀드리고 친절히 안내해 드립니다.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">지인 성함 <span className="text-red-500">*</span></label>
                <input 
                  value={refForm.name} 
                  onChange={(e) => setRefForm({...refForm, name: e.target.value})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                  placeholder="예: 홍길동"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">연락처 <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  value={refForm.phone} 
                  onChange={(e) => setRefForm({...refForm, phone: formatPhoneNumber(e.target.value)})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                  placeholder="예: 010-1234-5678"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">{client.name}님과의 관계</label>
                <input 
                  value={refForm.relation} 
                  onChange={(e) => setRefForm({...refForm, relation: e.target.value})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                  placeholder="가족, 직장동료, 친구 등"
                />
              </div>
            </div>

            <button 
              disabled={isSubmittingRef} 
              onClick={handleSubmitReferral} 
              className="w-full mt-8 bg-indigo-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {isSubmittingRef ? "신청 등록 중..." : "우선 배정으로 신청하기"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}