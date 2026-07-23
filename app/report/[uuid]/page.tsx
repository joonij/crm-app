"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, Phone, MessageCircle, ChevronDown, TrendingDown, 
  Share2, CheckCircle2, UserPlus, X, AlertCircle, Home, Bed, 
  Bandage, HeartPulse, Brain, Heart, BriefcaseMedical, ShieldAlert, 
  Search, Target, Loader2, Info, Gem, LineChart,
  ArrowRight, XCircle, Check
} from "lucide-react";

// 비교할 질병 코드 데이터 구조화
const codeComparisons = [
  {
    category: "순환계 질환 (뇌·심장·혈관)",
    desc: "심근경색만 보장하던 좁은 범위에서 부정맥, 협심증까지 완벽하게 커버합니다.",
    codes: [
      { id: "I21-I23", name: "급성 심근경색", before: true, after: true },
      { id: "I20", name: "협심증", before: false, after: true },
      { id: "I49", name: "기타 부정맥", before: false, after: true },
      { id: "I50", name: "심부전", before: false, after: true },
      { id: "I60-I62", name: "뇌출혈", before: true, after: true },
      { id: "I63", name: "뇌경색증", before: false, after: true },
      { id: "I64-I69", name: "기타 뇌혈관 질환", before: false, after: true },
    ]
  },
  {
    category: "신생물 질환 (종양·암)",
    desc: "일반암은 물론, 놓치기 쉬운 0기암과 경계성 종양까지 빈틈없이 방어합니다.",
    codes: [
      { id: "C00-C97", name: "악성 신생물 (일반암)", before: true, after: true },
      { id: "D00-D09", name: "제자리암 (0기암)", before: false, after: true },
      { id: "D37-D48", name: "경계성 종양", before: false, after: true },
      { id: "C44", name: "기타 피부암", before: false, after: true },
      { id: "C73", name: "갑상선암", before: false, after: true },
    ]
  }
];

export function DiseaseCodeComparison() {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-black text-slate-800 mb-3 px-1">질병분류코드(KCD) 커버리지 정밀 비교</h2>
      
      <div className="space-y-4">
        {codeComparisons.map((item, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">{item.category}</h3>
            <p className="text-xs text-slate-500 font-medium mb-5">{item.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
              
              {/* 기존 보험 보장 범위 */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-center mb-3">
                  <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">AS-IS 기존 보험</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {item.codes.map((code) => (
                    code.before ? (
                      <span key={code.id} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {code.name} ({code.id})
                      </span>
                    ) : (
                      <span key={code.id} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100/50 border border-slate-200 border-dashed px-2.5 py-1.5 rounded-lg">
                        <XCircle className="w-3.5 h-3.5 text-slate-300" /> <span className="line-through">{code.name}</span>
                      </span>
                    )
                  ))}
                </div>
              </div>

              {/* 화살표 방향 */}
              <div className="flex justify-center text-blue-300 rotate-90 md:rotate-0 py-2 md:py-0">
                <ArrowRight className="w-8 h-8" />
              </div>

              {/* 맞춤 보장(리모델링) 범위 */}
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 shadow-inner">
                <div className="text-center mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">TO-BE 맞춤 보장</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {item.codes.map((code) => (
                    <span key={code.id} className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-lg shadow-sm border ${
                      !code.before && code.after 
                        ? 'bg-blue-600 text-white border-blue-700 animate-in zoom-in duration-500' // 새로 추가된 코드 강조
                        : 'bg-white text-slate-800 border-slate-200'
                    }`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${!code.before && code.after ? 'text-blue-200' : 'text-emerald-500'}`} /> 
                      {code.name} ({code.id})
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

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

// 전화번호 포맷팅
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

export default function ClientReportPage() {
  const params = useParams();
  const reportUuid = params.uuid as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // 탭 상태
  const [activeTab, setActiveTab] = useState<'insurances' | 'gaps'>('insurances');
  
  // 검색 및 아코디언 상태
  const [insuranceSearchTerm, setInsuranceSearchTerm] = useState("");
  const [expandedCovId, setExpandedCovId] = useState<number | null>(null);

  // 보장 공백 선택(장바구니) 상태
  const [selectedGaps, setSelectedGaps] = useState<string[]>([]);

  // 지인 소개 모달 상태
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [refForm, setRefForm] = useState({ name: "", phone: "", relation: "" });
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);

  // 간편 예약 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState("");
  const [specificProduct, setSpecificProduct] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      const { data: client, error: clientError } = await supabase.from("clients").select("*").eq("report_uuid", reportUuid).single();
      if (clientError || !client) return setIsLoading(false);

      const { data: agent } = await supabase.from("agents").select("name, rank, phone, agencies(corporation_name)").eq("id", client.agent_id).single();
      const { data: insurances } = await supabase.from("subscription_insurance").select("*").eq("client_id", client.id);

      let premiumBefore = 0;
      let premiumAfter = 0;
      
      const scores = {
        cancer: { before: 0, after: 0 }, brain: { before: 0, after: 0 }, heart: { before: 0, after: 0 },
        surgery: { before: 0, after: 0 }, hasJongSurgery: false, homeCare: { before: 0, after: 0 },
        hospitalization: { before: 0, after: 0 }, injury: { before: 0, after: 0 }, hasDriver: false, hasDental: false
      };

      if (insurances) {
        insurances.forEach(ins => {
          const isBefore = ins.policy_status === "maintain" || ins.policy_status === "cancel";
          const isAfter = ins.policy_status === "maintain" || ins.policy_status === "new";

          if (isBefore) premiumBefore += ins.monthly_premium || 0;
          if (isAfter) premiumAfter += ins.monthly_premium || 0;

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

              if (name.includes("암") && !name.includes("유사") && !name.includes("고액")) {
                if (isBefore) scores.cancer.before += beforeVal;
                if (isAfter) scores.cancer.after += afterVal;
              }
              if (name.includes("뇌")) {
                if (isBefore) scores.brain.before += beforeVal;
                if (isAfter) scores.brain.after += afterVal;
              }
              if (name.includes("허혈") || name.includes("심장") || name.includes("급성심근")) {
                if (isBefore) scores.heart.before += beforeVal;
                if (isAfter) scores.heart.after += afterVal;
              }
              if (name.includes("수술")) {
                if (isBefore) scores.surgery.before += beforeVal;
                if (isAfter) scores.surgery.after += afterVal;
                if (isAfter && (name.includes("종") || name.includes("1-5종") || name.includes("1-6종") || name.includes("1-9종"))) {
                  scores.hasJongSurgery = true;
                }
              }
              if (name.includes("재가") || name.includes("치매")) {
                if (isBefore) scores.homeCare.before += beforeVal;
                if (isAfter) scores.homeCare.after += afterVal;
              }
              if (name.includes("입원") && !name.includes("진단") && !name.includes("제외") && !name.includes("실손") && !name.includes("의료비")) {
                if (isBefore) scores.hospitalization.before += beforeVal;
                if (isAfter) scores.hospitalization.after += afterVal;
              }
              if (name.includes("통합상해") || (name.includes("상해") && name.includes("진단"))) {
                if (isBefore) scores.injury.before += beforeVal;
                if (isAfter) scores.injury.after += afterVal;
              }
              if (isAfter) {
                if (name.includes("교통사고처리") || name.includes("변호사선임") || name.includes("자동차부상")) scores.hasDriver = true;
                if (name.includes("임플란트") || name.includes("크라운") || name.includes("보철")) scores.hasDental = true;
              }
            });
          }
        });
      }

      setData({ client, agent, insurances: insurances || [], premium: { before: premiumBefore, after: premiumAfter }, scores });
      setCustomerName(client.name || "");
      setCustomerPhone(client.phone || "");
      setIsLoading(false);
    };

    fetchReportData();
  }, [reportUuid]);

  const handleShareReferral = async () => {
    const { client, agent } = data;
    const shareText = `[무료 보장분석]\n\n제가 이번에 ${agent.name} ${agent.rank}님께 보장분석을 받았는데, 불필요하게 새는 보험료도 줄이고 보장도 훨씬 좋아졌어요!\n\n제 지인들에게만 특별히 '무료 정밀 분석'을 해주신다고 하니, 보험료 낭비하고 계신 건 없는지 아래 번호로 꼭 연락해서 점검 받아보세요.\n\n👨‍💼 담당자: ${agent.name} ${agent.rank}\n📞 연락처: ${agent.phone || "번호 미등록"}\n🏢 소속: ${Array.isArray(agent.agencies) ? agent.agencies[0]?.corporation_name : agent.agencies?.corporation_name}`;

    if (navigator.share) {
      try { await navigator.share({ title: '스마트 보장분석 초대장', text: shareText }); } catch (err) {}
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("추천 메시지가 복사되었습니다! 카카오톡에 붙여넣기 하여 지인에게 보내주세요.");
    }
  };

  const handleSubmitReferral = async () => {
    if (!refForm.name || !refForm.phone) return alert("지인분의 성함과 연락처를 입력해주세요.");
    setIsSubmittingRef(true);
    try {
      const { data: newClient, error: clientError } = await supabase.from('clients').insert({
        name: refForm.name, phone: refForm.phone, agent_id: data.client.agent_id,
        introduce_client: data.client.id, contract_status: 3, client_source: 3, 
        notes: `모바일 리포트를 통해 직접 소개된 고객입니다. (관계: ${refForm.relation || "미기재"})`
      }).select('id').single();

      if (clientError) throw clientError;
      
      if (newClient) {
        await supabase.from('notifications').insert({
          agent_id: data.client.agent_id, title: "신규 지인 소개 접수 🎉",
          message: `${data.client.name} 고객님이 [${refForm.name}]님을 소개하셨습니다.`, type: "referral", link_url: `/clients/${newClient.id}`
        });
      }
      alert("소개 신청이 완료되었습니다. 담당 전문가가 곧 연락드리겠습니다!");
      setIsRefModalOpen(false);
      setRefForm({ name: "", phone: "", relation: "" });
    } catch (error: any) { alert("신청 중 오류가 발생했습니다: " + error.message); } 
    finally { setIsSubmittingRef(false); }
  };

  const handleReservationSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) return alert("성함과 연락처를 입력해주세요.");
    if (selectedNeed === "특정 상품 문의 요청" && !specificProduct) return alert("문의 상품 종류를 선택해주세요.");

    setIsSubmitting(true);
    try {
      let finalNeedLabel = selectedNeed;
      if (selectedNeed === "특정 상품 문의 요청") {
        finalNeedLabel = `특정 상품 문의 요청 (${specificProduct})`;
      } else if (selectedNeed === "보장 공백 보완 상담 요청") {
        finalNeedLabel = `보장 공백 보완 상담 (${specificProduct})`;
      }
      
      const { error: notiError } = await supabase.from('notifications').insert({
        agent_id: data.client.agent_id, 
        title: "모바일 리포트 상담 문의 접수 🎉",
        message: `[${finalNeedLabel}] ${customerName} 고객님이 리포트를 보다가 상담 예약을 남겼습니다. (연락처: ${customerPhone})`, 
        type: "inquiry", 
        link_url: `/clients/${data.client.id}`
      });

      if (notiError) throw notiError;

      alert(`예약이 성공적으로 접수되었습니다!\n담당 전문가가 확인 후 신속하게 연락드리겠습니다.`);
      setIsModalOpen(false);
      setSpecificProduct("");
      setSelectedGaps([]);
    } catch (error: any) { alert("신청 중 오류가 발생했습니다: " + error.message); } 
    finally { setIsSubmitting(false); }
  };

  // 장바구니 토글
  const toggleGapSelection = (title: string) => {
    setSelectedGaps(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const handleGapInquiry = (title: string) => {
    if (!selectedGaps.includes(title)) {
      setSelectedGaps([...selectedGaps, title]);
    }
    setSelectedNeed("보장 공백 보완 상담 요청");
    setSpecificProduct(Array.from(new Set([...selectedGaps, title])).join(", "));
    setIsModalOpen(true);
  };

  const handleSelectedGapsInquiry = () => {
    setSelectedNeed("보장 공백 보완 상담 요청");
    setSpecificProduct(selectedGaps.join(", ")); 
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  if (!data || !data.client) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">유효하지 않거나 만료된 링크입니다.</div>;

  const { client, agent, insurances, premium, scores } = data;
  const beforePremium = premium?.before || 0;
  const afterPremium = premium?.after || 0;
  const premiumDiff = beforePremium - afterPremium; 
  
  const agentCorp = Array.isArray(agent?.agencies) ? agent.agencies[0]?.corporation_name : agent?.agencies?.corporation_name;
  const activeInsurances = insurances.filter((ins:any) => ins.policy_status === "maintain" || ins.policy_status === "new");

  const filteredInsurances = activeInsurances.filter((ins: any) => {
    if (!insuranceSearchTerm) return true;
    const term = insuranceSearchTerm.toLowerCase();
    const matchCompany = ins.insurance_company?.toLowerCase().includes(term);
    const matchProduct = ins.product_name?.toLowerCase().includes(term);
    const matchDetails = ins.details?.some((d: any) => !d.is_deleted && d.name?.toLowerCase().includes(term));
    return matchCompany || matchProduct || matchDetails;
  });

  const coverageItems = [
    { label: "일반암 진단", icon: HeartPulse, color: "text-rose-500", ...scores?.cancer },
    { label: "뇌혈관 진단", icon: Brain, color: "text-indigo-500", ...scores?.brain },
    { label: "심혈관 진단", icon: Heart, color: "text-red-500", ...scores?.heart },
    { label: "수술비 합산", icon: BriefcaseMedical, color: "text-emerald-500", ...scores?.surgery },
    { label: "재가급여 합산", icon: Home, color: "text-orange-500", ...scores?.homeCare },
    { label: "입원비 합산", icon: Bed, color: "text-cyan-500", ...scores?.hospitalization },
    { label: "통합상해진단 합산", icon: Bandage, color: "text-amber-500", ...scores?.injury },
  ].map(item => ({ ...item, before: item.before || 0, after: item.after || 0, increase: (item.after || 0) - (item.before || 0) }))
   .filter(item => item.increase > 0).sort((a, b) => b.increase - a.increase);

  const highlightCards = [];
  if (premiumDiff > 0) {
    highlightCards.push({ isPremium: true, label: "월 보험료 절감", icon: TrendingDown, color: "text-blue-500", before: beforePremium, after: afterPremium, increase: premiumDiff });
  }
  highlightCards.push(...coverageItems);

  // 1. 기본 시스템 공백 진단
  const baseGapItems = [
    { condition: scores.cancer.after < 5000, title: "암 보장 공백 발견", desc: `현재 암 보장금액이 ${formatMoney(scores.cancer.after)}으로 안정권보다 부족한 상태입니다.`, action: "일반암 진단비 증액 권장" },
    { condition: scores.brain.after < 2000, title: "뇌혈관 보장 공백 발견", desc: `현재 뇌혈관 보장금액이 ${formatMoney(scores.brain.after)}으로 권장 기준보다 부족한 상태입니다.`, action: "뇌혈관 진단/수술비 보완 요망" },
    { condition: scores.heart.after < 2000, title: "심장 보장 공백 발견", desc: `현재 허혈성/심장 보장금액이 ${formatMoney(scores.heart.after)}으로 권장 기준보다 부족합니다.`, action: "심혈관 특정진단비 보완 권장" },
    { condition: scores.surgery.after === 0 || !scores.hasJongSurgery, title: "질병/종수술비 보장 부재", desc: scores.surgery.after === 0 ? "포트폴리오에 수술비 특약이 전혀 확인되지 않습니다." : "질병 강도에 비례해 지급되는 '종수술비'가 빠져있습니다.", action: "질병 및 1-5종 수술비 장착" },
    { condition: scores.homeCare.after === 0, title: "치매 리스크 노출", desc: "장기요양등급 판정 시 매월 생활비를 받는 재가급여 자산이 비어있습니다.", action: "장기요양 재가급여 특약 추가" },
    { condition: scores.injury.after === 0, title: "통합상해진단비 공백", desc: "일상생활 중 발생하는 골절, 화상 등 각종 외상성 상해 진단비 자산이 없습니다.", action: "통합상해진단비 보완 권장" },
    { condition: scores.hospitalization.after === 0, title: "일당 입원비 보장 부재", desc: "첫날부터 보장받는 입원일당 특약이 없어 장기 입원 시 자부담 리스크가 있습니다.", action: "간병인/입원일당 확보 고려" },
    { condition: !scores.hasDriver, title: "운전자 핵심 비용 부재", desc: "민사/형사상 책임을 방어하는 교통사고처리지원금, 변호사선임비 등의 방어막이 없습니다.", action: "형사합의금 지원 플랜 마련" },
    { condition: !scores.hasDental, title: "치아 보장 자산 부재", desc: "큰 비용이 드는 임플란트, 크라운에 대한 전문 치과 치료비 보장이 없습니다.", action: "치과 전문 덴탈 케어 안내" }
  ];

  // ⭐️ 2. 기존 자동 검출 카드 필터링 + 커스텀 작성 카드 병합 로직 (고객 페이지)
  const displayGaps = (() => {
    // ① 자동 검출 카드 중, 설계사가 켜둔(체크한) 것들만 추려냄 (수학적 조건 무시)
    const filteredAutoGaps = baseGapItems.filter(item => {
      if (!client?.consulting_details?.selectedGaps) return item.condition;
      return client.consulting_details.selectedGaps.includes(item.title);
    });

    // ② 설계사가 직접 작성한 커스텀 카드 목록
    const customGapsFromDB = client?.consulting_details?.customGaps || [];
    
    // ③ 커스텀 카드 중에서 현재 켜져있는(체크된) 것들만 추려냄
    const filteredCustomGaps = customGapsFromDB.filter((custom: any) => {
      if (!client?.consulting_details?.selectedGaps) return true;
      return client.consulting_details.selectedGaps.includes(custom.title);
    }).map((custom: any) => ({
      ...custom,
      isCustom: true // 커스텀 카드 식별용 플래그
    }));

    return [...filteredAutoGaps, ...filteredCustomGaps];
  })();

  return (
    <div className="min-h-screen bg-slate-100 pb-36 text-slate-800 font-sans selection:bg-blue-200">
      
      <header className="bg-white px-5 sm:px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <p className="text-blue-600 font-black tracking-widest text-sm mb-4 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5"/> SMART ANALYSIS
          </p>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight text-slate-900 mb-2 break-keep">
            <span className="text-blue-600">{client.name}</span>님을 위한<br/>맞춤 보장 분석 결과
          </h1>
          <p className="text-slate-500 text-base font-medium mt-4 border-l-2 border-slate-300 pl-3 leading-relaxed break-keep">
            현재 가입된 보험의 효율성을 점검하고,<br/>가장 합리적인 대안을 제안해 드립니다.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-5 mt-6 space-y-6 max-w-lg mx-auto">
        
        {highlightCards.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-slate-800 mb-3 px-1">핵심 보장 분석</h2>
            <div className="grid grid-cols-2 gap-3">
              {highlightCards.map((item, idx) => (
                <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border relative overflow-hidden ${item.isPremium ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className={`font-bold text-sm truncate ${item.isPremium ? 'text-blue-700' : 'text-slate-600'}`}>{item.label}</span>
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-xs text-slate-400 line-through decoration-slate-300">
                      기존 {item.isPremium ? item.before.toLocaleString() + '원' : formatMoney(item.before)}
                    </p>
                    <p className={`text-xl font-black ${item.isPremium ? 'text-blue-600' : 'text-slate-800'}`}>
                      {item.isPremium ? item.after.toLocaleString() + '원' : formatMoney(item.after)}
                    </p>
                  </div>
                  <div className={`absolute bottom-0 right-0 text-xs font-black px-3 py-1.5 rounded-tl-xl ${item.isPremium ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    {item.isPremium ? `-${item.increase.toLocaleString()}원` : `+${formatMoney(item.increase)}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="pt-2">
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab('insurances')}
              className={`flex-1 py-3.5 text-sm sm:text-base font-black rounded-xl transition-all ${activeTab === 'insurances' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              상세 보장 내역
            </button>
            <button
              onClick={() => setActiveTab('gaps')}
              className={`flex-1 py-3.5 text-sm sm:text-base font-black rounded-xl transition-all ${activeTab === 'gaps' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              보장 공백 진단
            </button>
          </div>

          {/* TAB 1: 보장 공백 진단 리포트 */}
          {activeTab === 'gaps' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-lg font-black text-slate-800">보장 공백 진단리포트</h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${displayGaps.length > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {displayGaps.length > 0 ? `미흡 보장 ${displayGaps.length}건 발견` : "완벽 철벽 방어"}
                </span>
              </div>

              {displayGaps.length > 0 ? (
                <div className="space-y-4">
                  {displayGaps.map((item, index) => {
                    const isSelected = selectedGaps.includes(item.title);

                    return (
                      <div 
                        key={index} 
                        onClick={() => toggleGapSelection(item.title)}
                        className={`bg-white p-5 rounded-2xl shadow-sm border flex flex-col relative overflow-hidden transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-400 ring-2 ring-indigo-100 bg-indigo-50/30' 
                            : 'border-red-100 hover:border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl shrink-0 transition-colors ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-red-50 text-red-500'}`}>
                            {isSelected ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base font-black mb-1.5 truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                              {item.isCustom && <span className="text-orange-500 mr-1">★</span>}
                              {item.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4 break-keep">{item.desc}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className={`text-xs font-black px-3 py-1.5 rounded-lg truncate max-w-[70%] transition-colors ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                            {item.action}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleGapInquiry(item.title); }}
                            className={`shrink-0 text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer ${
                              isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {isSelected ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5"/> 선택됨</span> : "문의하기"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 rounded-2xl shadow-sm text-center">
                  <CheckCircle2 className="w-10 h-10 text-yellow-300 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-lg font-black">완벽한 철벽 방어막 확보!</h3>
                  <p className="text-sm text-emerald-100 mt-2 leading-relaxed font-medium">
                    분석 결과 9대 주요 보장에 공백이 발견되지 않았습니다.<br/>매우 이상적이고 든든한 최고 수준의 포트폴리오입니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 가입 보장 내역 & 검색 */}
          {activeTab === 'insurances' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="mb-5 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="특약명 또는 보험사 이름으로 검색..."
                  value={insuranceSearchTerm}
                  onChange={(e) => setInsuranceSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="flex justify-between items-end mb-3 px-1">
                <h2 className="text-lg font-black text-slate-800">가입 보장 내역</h2>
                <span className="text-sm font-bold text-blue-600">{filteredInsurances.length}건 검색됨</span>
              </div>
              
              <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden divide-y divide-slate-100">
                <div className="bg-slate-50 p-5 flex justify-between items-center border-b border-slate-200">
                  <span className="text-sm font-bold text-slate-500">최종 월 보험료</span>
                  <span className="text-2xl font-black text-blue-600">{afterPremium.toLocaleString()}원</span>
                </div>
                
                {filteredInsurances.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center">
                    <Info className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-base font-bold text-slate-500">검색된 보장 내역이 없습니다.</p>
                  </div>
                ) : (
                  filteredInsurances.map((ins: any) => {
                    const isExpanded = expandedCovId === ins.id || insuranceSearchTerm.length > 0;
                    return (
                      <div key={ins.id} className="p-1">
                        <button 
                          onClick={() => setExpandedCovId(expandedCovId === ins.id ? null : ins.id)} 
                          className="w-full text-left p-5 flex justify-between items-center transition-colors hover:bg-slate-50 rounded-2xl cursor-pointer"
                        >
                          <div className="flex-1 pr-4 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{ins.insurance_company}</span>
                              {(ins.subscription_date || ins.maturity_date) && (
                                <span className="text-[11px] text-slate-400 font-medium">
                                  ({ins.subscription_date ? ins.subscription_date.substring(0, 10).replace(/-/g, '.') : ''} 
                                  {ins.maturity_date ? ` ~ ${ins.maturity_date.substring(0, 10).replace(/-/g, '.')}` : ''})
                                </span>
                              )}
                            </div>
                            <p className="text-base font-black text-slate-800 leading-tight truncate">{ins.product_name}</p>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                            <p className="text-base font-black text-slate-900">{ins.monthly_premium.toLocaleString()}원</p>
                            <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                          </div>
                        </button>
                        
                        {isExpanded && ins.details && (
                          <div className="px-5 pb-5 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="bg-slate-50/80 p-4 rounded-2xl space-y-3 border border-slate-100">
                              {ins.details.filter((d:any) => !d.is_deleted).map((detail: any, idx: number) => {
                                const isMatched = insuranceSearchTerm && detail.name.toLowerCase().includes(insuranceSearchTerm.toLowerCase());
                                return (
                                  <div key={idx} className={`flex justify-between items-center text-sm ${isMatched ? 'bg-blue-100 p-2 rounded-lg -mx-2 px-2' : ''}`}>
                                    <span className={`font-medium truncate pr-4 ${isMatched ? 'text-blue-900 font-bold' : 'text-slate-600'}`}>{detail.name}</span>
                                    <span className={`font-black shrink-0 ${isMatched ? 'text-blue-900' : 'text-slate-900'}`}>{detail.amount}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </section>

        {/* 4. 원클릭 간편 상담 예약 그리드 구역 */}
        <section className="pt-2">
          <h2 className="text-lg font-black text-slate-800 mb-3 px-1">원클릭 간편 상담 예약</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "보험 최신 업데이트 요청", desc: "내 보험 바로알기", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
              { label: "보험료 절감 요청", desc: "고정 지출 축소 ", icon: LineChart, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { label: "연금/노후 준비 요청", desc: "안정적 미래 설계", icon: Gem, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
              { label: "특정 상품 문의 요청", desc: "맞춤 가입 상담", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => { 
                  setSelectedNeed(item.label); 
                  setSpecificProduct(""); 
                  setIsModalOpen(true); 
                }}
                className={`flex flex-col items-start gap-3 bg-white border ${item.border} hover:shadow-md transition-all rounded-2xl p-4 text-left group cursor-pointer`}
              >
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <span className="block text-1sm font-black text-slate-800 leading-tight break-keep">{item.label}</span>
                  <span className="block text-sm font-bold text-slate-400 mt-1">{item.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 6. 지인 소개 유도 컴포넌트 */}
        <section className="pt-6 pb-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-7 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500 rounded-full mix-blend-screen filter blur-[70px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 rounded-full mix-blend-screen filter blur-[60px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-3 leading-snug break-keep">
                소중한 가족과 지인도<br/>보험료를 낭비하고 있다면?
              </h3>
              <p className="text-sm text-indigo-200 font-medium leading-relaxed mb-8 break-keep">
                {client.name}님이 경험하신 놀라운 보장분석 결과를 사랑하는 분들께도 선물해 보세요. <strong className="text-white bg-indigo-500/40 px-1.5 py-0.5 rounded leading-loose">{client.name}님의 지인에 한해 우선적으로 분석 진행해 드립니다.</strong>
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setIsRefModalOpen(true)}
                  className="w-full bg-white text-indigo-900 font-black py-4 text-base rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-6 h-6" /> 지인 무료 분석 신청하기
                </button>
                
                <button 
                  onClick={handleShareReferral}
                  className="w-full bg-indigo-800/50 border border-indigo-400/30 text-indigo-100 font-bold py-4 text-base rounded-2xl hover:bg-indigo-800/70 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-5 h-5" /> 카카오톡으로 초대장 보내기
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ⭐️ 플로팅 바 영역 (장바구니 팝업 + 기본 담당자 연락 바) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col">
        
        {/* 장바구니 팝업 */}
        {selectedGaps.length > 0 && (
          <div 
            onClick={handleSelectedGapsInquiry}
            className="bg-indigo-600 px-4 py-3 sm:px-6 shadow-[0_-10px_20px_rgba(79,70,229,0.2)] animate-in slide-in-from-bottom-4 flex justify-between items-center cursor-pointer mx-auto w-full max-w-lg rounded-t-3xl md:rounded-t-none md:max-w-full transition-all hover:bg-indigo-700"
          >
            <span className="text-white font-black text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-200" />
              {selectedGaps.length}개 보장 공백 선택됨
            </span>
            <span className="text-indigo-50 font-bold text-xs bg-indigo-800/60 px-3 py-1.5 rounded-lg flex items-center gap-1">
              한번에 상담 예약 <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        )}

        {/* 기본 플로팅 담당자 바 */}
        <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0 flex-1 pl-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">{agentCorp}</span>
              <span className="text-sm sm:text-base font-black text-slate-800 truncate">{agent?.name} <span className="font-medium text-slate-500 text-xs sm:text-sm ml-0.5">{agent?.rank}</span></span>
            </div>
            <div className="flex gap-2 shrink-0">
              {agent?.phone && (
                <a href={`tel:${agent.phone}`} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 active:bg-slate-200 transition-colors shadow-sm border border-slate-200 cursor-pointer">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              <button 
                onClick={() => {
                  setSelectedNeed("종합 상담 예약 요청"); 
                  setIsModalOpen(true);
                }}
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-full bg-blue-600 flex items-center justify-center gap-1.5 text-white font-black text-xs sm:text-sm active:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" /> 상담 예약
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 지인 소개 모달 */}
      {isRefModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-7 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsRefModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1.5 transition-colors cursor-pointer">
              <X className="w-5 h-5"/>
            </button>
            
            <div className="mb-6">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">보장 분석 신청</h3>
              <p className="text-sm text-slate-500 break-keep leading-relaxed font-medium">
                정보를 남겨주시면 담당 전문가가 {client.name}님의 소개임을 말씀드리고 친절히 안내해 드립니다.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">지인 성함 <span className="text-red-500">*</span></label>
                <input value={refForm.name} onChange={(e) => setRefForm({...refForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="예: 홍길동"/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">연락처 <span className="text-red-500">*</span></label>
                <input type="tel" value={refForm.phone} onChange={(e) => setRefForm({...refForm, phone: formatPhoneNumber(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="예: 010-1234-5678"/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">{client.name}님과의 관계</label>
                <input value={refForm.relation} onChange={(e) => setRefForm({...refForm, relation: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="가족, 직장동료, 친구 등"/>
              </div>
            </div>

            <button disabled={isSubmittingRef} onClick={handleSubmitReferral} className="w-full mt-8 bg-indigo-600 text-white text-base font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer">
              {isSubmittingRef ? "신청 등록 중..." : "우선 배정으로 신청하기"}
            </button>
          </div>
        </div>
      )}

      {/* 상담 예약 및 특정 상품 문의 모달 (장바구니 모드 포함) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-[360px] bg-white rounded-[2rem] p-7 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 text-xl">상담 예약 신청</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 p-1.5 rounded-full cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">선택한 상담 분야</label>
                <div className="bg-blue-50 text-blue-700 font-black text-base px-4 py-3.5 rounded-xl border border-blue-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> {selectedNeed}
                </div>
              </div>

              {/* 일반 상품 문의용 Select */}
              {selectedNeed === "특정 상품 문의 요청" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-slate-500 mb-2">문의 상품 종류 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={specificProduct}
                      onChange={e => setSpecificProduct(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold transition-all bg-white appearance-none cursor-pointer"
                    >
                      <option value="" disabled>상품을 선택해주세요</option>
                      <option value="종합/건강보험">종합/건강보험 (암/뇌/심장)</option>
                      <option value="실손의료비">실손의료비</option>
                      <option value="종신/정기보험">종신/정기보험</option>
                      <option value="어린이/태아보험">어린이/태아보험</option>
                      <option value="운전자/자동차보험">운전자/자동차/상해보험</option>
                      <option value="치아/치매/간병">치아/치매/간병보험</option>
                      <option value="연금/저축/변액">연금/저축/변액보험</option>
                      <option value="화재/배상/기타">화재/배상/기타</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
              
              {/* 장바구니로 선택한 공백 목록 표시 UI */}
              {selectedNeed === "보장 공백 보완 상담 요청" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-slate-500 mb-2">선택한 보완 항목 <span className="text-red-500">*</span></label>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-sm font-bold text-indigo-700 flex flex-col gap-2 shadow-inner">
                    {specificProduct.split(", ").map((gap, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> <span className="truncate">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">성함 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={customerName || ""}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">연락처 <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  value={customerPhone || ""}
                  onChange={e => setCustomerPhone(formatPhoneNumber(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold transition-all"
                />
              </div>

              <button
                onClick={handleReservationSubmit}
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-black text-white font-black text-base py-4 rounded-2xl mt-2 transition-colors shadow-lg shadow-slate-900/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />} 
                {isSubmitting ? "신청 접수 중..." : "예약 완료하기"}
              </button>
              
              <p className="text-[11px] text-center text-slate-400 font-medium mt-3 break-keep leading-relaxed">
                남겨주신 연락처로 담당 전문가가 내용 확인 후<br/>신속하게 회신해 드리겠습니다.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}