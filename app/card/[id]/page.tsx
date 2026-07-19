// app/card/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { User, Phone, Mail, MapPin, Printer, Quote, Award, CheckCircle2, MessageSquare, ShieldCheck, LineChart, Briefcase, Gem, Target, BadgeCheck, X, Search, BarChart3, HeartHandshake, Loader2, ChevronDown, Users } from "lucide-react";

// 전화번호 하이픈 자동 포맷팅 함수
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

export default function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const targetId = resolvedParams.id;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 예약 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specificProduct, setSpecificProduct] = useState(""); // ⭐️ 특정 상품 선택 상태 추가
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select(`
            id, name, phone, email, bio, office_address, fax, rank, avatar_url, skills, careers, identity,
            agencies (corporation_name, branch_name)
          `)
          .eq("id", targetId)
          .single();

        if (error || !data) setError(true);
        else setProfile(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetId]);

  // DB 저장 및 알림 연동 함수
  const handleReservationSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      return alert("성함과 연락처를 모두 입력해주세요.");
    }

    // 특정 상품 문의를 선택했는데, 상품 종류를 고르지 않은 경우 방어 로직
    if (selectedNeed === "특정 상품 문의" && !specificProduct) {
      return alert("문의하실 특정 상품 종류를 선택해주세요.");
    }
    
    setIsSubmitting(true);
    try {
      // DB와 알림에 보낼 내용 구성
      const isSpecific = selectedNeed === "특정 상품 문의";
      const finalNeedLabel = isSpecific ? `특정 상품 문의 (${specificProduct})` : selectedNeed;
      const notesText = `[디지털 명함 간편 예약] 상담 희망 분야: ${finalNeedLabel}`;

      const { data: newClient, error: clientError } = await supabase.from('clients').insert({
        name: customerName,
        phone: customerPhone,
        agent_id: profile.id, 
        client_source: 4, 
        notes: notesText
      }).select('id').single();

      if (clientError) throw clientError;
      
      if (newClient) {
        await supabase.from('notifications').insert({
          agent_id: profile.id,
          title: "신규 상담 예약 접수 🎉",
          message: `[${finalNeedLabel}] ${customerName} 고객님이 명함을 통해 상담을 신청했습니다.`,
          type: "inquiry",
          link_url: `/clients/${newClient.id}` 
        });
      }
      
      alert(`[${finalNeedLabel}] 상담 신청이 완료되었습니다!\n${profile?.name} ${profile?.rank}이(가) 곧 연락드리겠습니다.`);
      setIsModalOpen(false);
      
      // 상태 초기화
      setCustomerName("");
      setCustomerPhone("");
      setSpecificProduct(""); 
    } catch (error: any) {
      alert("신청 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (error || !profile) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center text-slate-500 font-bold">삭제되었거나 유효하지 않은 명함입니다.</div></div>;

  const agency = Array.isArray(profile.agencies) ? profile.agencies[0] : profile.agencies;
  const skills = profile.skills || [];
  const careers = profile.careers || [];

  const getExpertiseLabel = (score: number) => {
    if (score >= 95) return "MASTER";
    if (score >= 85) return "EXPERT";
    return "PRO";
  };

  const SpecialtyIcons = [ShieldCheck, LineChart, Gem, Briefcase, Target];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      
      <div className="w-full max-w-[400px] bg-white overflow-hidden shadow-2xl border border-slate-200/60 relative">
        
        {/* 상단 프로필 배경 */}
        <div className="h-80 relative bg-gradient-to-b from-slate-100 to-slate-200">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white rounded-full opacity-40 blur-2xl"></div>
          <div className="absolute bottom-10 left-0 -ml-10 w-32 h-32 bg-blue-100 rounded-full opacity-40 blur-2xl"></div>
          
          <div className="w-full h-full flex items-center justify-center overflow-hidden relative z-10">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-20 h-20 text-slate-300" />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/50 to-transparent z-20" />
        </div>
        
        <div className="px-6 pb-8 relative z-30 -mt-12">
          
          {/* 소속 및 이름 */}
          <div className="space-y-1.5 text-center mb-8">
            <p className="text-blue-600 font-extrabold text-[13px] tracking-widest uppercase">
              {agency?.corporation_name} {agency?.branch_name}
            </p>
            <div className="flex items-center justify-center gap-1.5">
            <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-50" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
              팀장
            </div>
            <div className="mt-1">
              <span className="text-[13px] font-bold text-slate-600 border border-slate-200 bg-white shadow-sm px-3 py-1 rounded-full inline-block">
                {profile.identity}
              </span>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6 bg-slate-50 rounded-3xl p-5 relative border border-slate-100">
              <Quote className="absolute top-3 left-3 w-5 h-5 text-blue-200 rotate-180" />
              <p className="text-[14px] font-bold text-slate-700 leading-relaxed text-center px-5 break-keep">
                {profile.bio}
              </p>
              <Quote className="absolute bottom-3 right-3 w-5 h-5 text-blue-200" />
            </div>
          )}

          {/* 핵심 역량 */}
          {skills.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4 pl-1">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> 핵심 컨설팅 솔루션
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {skills.map((skill: any, idx: number) => {
                  const Icon = SpecialtyIcons[idx % SpecialtyIcons.length];
                  return (
                    <div key={idx} className="relative overflow-hidden bg-white border border-slate-200 hover:border-blue-300 transition-colors rounded-2xl p-4 shadow-sm flex items-center justify-between group cursor-default">
                      <Icon className="absolute -right-3 -top-3 w-16 h-16 text-slate-50 opacity-50 transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[14px] font-bold text-slate-800 tracking-tight leading-snug">{skill.name}</span>
                      </div>
                      <div className="relative z-10 shrink-0 ml-2">
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md tracking-wider">
                          {getExpertiseLabel(skill.score)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 약력 타임라인 */}
          {careers.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-6 pl-1">
                <Award className="w-5 h-5 text-blue-600" /> 주요 약력 및 증명
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-300 before:via-slate-200 before:to-transparent">
                {careers.map((career: any, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="absolute left-0 w-6 h-6 rounded-full bg-white border-[3px] border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                    <div className="pl-10 pb-1 pt-0.5">
                      <span className="inline-block text-[11px] font-black text-white bg-slate-800 px-2 py-0.5 rounded mb-1">{career.year}</span>
                      <p className="text-[14px] font-bold text-slate-800 break-keep leading-snug">{career.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 프로세스 */}
          <div className="mt-10">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5 pl-1">
              <LineChart className="w-5 h-5 text-blue-600" /> 체계적인 4단계 컨설팅 프로세스
            </h3>
            
            <div className="relative border-l-2 border-blue-100 ml-4 space-y-7 pb-2">
              <div className="relative pl-6">
                <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shadow-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-black text-slate-800 text-[14px]">STEP 1. 분야별 23명의 전문가 진단 및 분석</h4>
                <p className="text-[12px] font-bold text-slate-500 mt-1.5 leading-relaxed break-keep">고객님의 현재 재무 상태와 기가입된 보장 내역을 객관적인 지표로 꼼꼼하게 진단합니다.</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shadow-sm">
                  <Search className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-black text-slate-800 text-[14px]">STEP 2. 숨은 보험금 및 자산 검토</h4>
                <p className="text-[12px] font-bold text-slate-500 mt-1.5 leading-relaxed break-keep">고객님께서 미처 챙기지 못한 숨은 보험금까지 꼼꼼하게 찾아내어, 잃어버렸던 정당한 권리를 돌려드립니다.</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-black text-slate-800 text-[14px]">STEP 3. 맞춤형 미래 솔루션 기획</h4>
                <p className="text-[12px] font-bold text-slate-500 mt-1.5 leading-relaxed break-keep">불필요한 지출은 줄이고 샐 틈 없는 보장망을 구축하는 1:1 맞춤형 포트폴리오를 설계합니다.</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shadow-sm">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-black text-slate-800 text-[14px]">STEP 4. 실행 및 평생 사후관리 시스템</h4>
                <p className="text-[12px] font-bold text-slate-500 mt-1.5 leading-relaxed break-keep">솔루션 실행 후에도 지속적인 리뷰와 보험금 청구 대행 등 변함없는 관리를 약속드립니다.</p>
              </div>
            </div>
          </div>

          {/* 1분 간편 예약 */}
          <div className="mt-10">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-3 pl-1">
              <Target className="w-5 h-5 text-rose-500" /> 1분 간편 상담 예약
            </h3>
            <p className="text-[12px] font-bold text-slate-500 pl-1 mb-4">원하시는 상담 분야를 선택하시면 빠르게 연락드리겠습니다.</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "보장 분석", desc: "내 보험 바로알기", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                { label: "보험료 절감", desc: "고정 지출 축소 ", icon: LineChart, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                { label: "연금/노후 준비", desc: "안정적 미래 설계", icon: Gem, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                { label: "특정 상품 문의", desc: "맞춤 가입 상담", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { 
                    setSelectedNeed(item.label); 
                    setSpecificProduct(""); // 모달 열 때 초기화
                    setIsModalOpen(true); 
                  }}
                  className={`flex flex-col items-start gap-3 bg-white border ${item.border} hover:shadow-md transition-all rounded-2xl p-4 text-left group cursor-pointer`}
                >
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <span className="block text-[13px] font-black text-slate-800">{item.label}</span>
                    <span className="block text-[10px] font-bold text-slate-400 mt-0.5">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="mt-10">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4 pl-1">
              <Phone className="w-5 h-5 text-blue-600" /> 컨택 포인트
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${profile.phone}`} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Phone className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-[12px] font-black text-slate-800">{profile.phone || "연락처 미등록"}</span>
              </a>

              <a href={`mailto:${profile.email}`} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Mail className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-[12px] font-black text-slate-800 truncate w-full text-center px-1">{profile.email}</span>
              </a>
            </div>

            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                <Printer className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">팩스 번호</p>
                <p className="text-[13px] font-black text-slate-800">{profile.fax || "미등록"}</p>
              </div>
            </div>

            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-slate-700" />
              </div>
              <div className="pt-0.5">
                <p className="text-[10px] font-bold text-slate-400 mb-0.5">사무실 오시는 길</p>
                <p className="text-[13px] font-black text-slate-800 leading-snug break-keep">{profile.office_address || "미등록"}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* ⭐️ DB 연동된 예약 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-[340px] bg-white rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 text-lg">상담 예약 신청</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 p-1.5 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2">선택한 상담 분야</label>
                <div className="bg-blue-50 text-blue-700 font-black text-sm px-4 py-3 rounded-xl border border-blue-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {selectedNeed}
                </div>
              </div>

              {/* ⭐️ '특정 상품 문의' 선택 시에만 나타나는 상품 선택 드롭다운 */}
              {selectedNeed === "특정 상품 문의" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[12px] font-bold text-slate-500 mb-2">문의 상품 종류 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={specificProduct}
                      onChange={e => setSpecificProduct(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold transition-all bg-white appearance-none cursor-pointer"
                    >
                      <option value="" disabled>상품을 선택해주세요</option>
                      <option value="종합/건강보험">종합/건강보험 (암/뇌/심장)</option>
                      <option value="실손의료비">실손의료비</option>
                      <option value="종신/정기보험">종신/정기보험</option>
                      <option value="어린이/태아보험">어린이/태아보험</option>
                      <option value="운전자/상해보험">운전자/자동차/상해보험</option>
                      <option value="치아/치매/간병">치아/치매/간병보험</option>
                      <option value="연금/저축보험">연금/저축/변액보험</option>
                      <option value="화재/배상/기타">화재/배상/기타</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2">성함 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2">연락처 <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(formatPhoneNumber(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold transition-all"
                />
              </div>

              <button
                onClick={handleReservationSubmit}
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-black text-white font-black text-sm py-4 rounded-xl mt-4 transition-colors shadow-lg shadow-slate-900/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />} 
                {isSubmitting ? "신청 접수 중..." : "예약 완료하기"}
              </button>
              
              <p className="text-[10px] text-center text-slate-400 font-medium mt-3 break-keep">
                남겨주신 연락처로 담당자가 신속하게 회신드리겠습니다.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}