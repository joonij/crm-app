"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Building2, Phone, Mail, LogOut, Camera, Save, Loader2, Award, QrCode, MapPin, Printer, Share2, MessageCircle, X, Quote, Briefcase, Network, Plus, Trash2 } from "lucide-react";

type AgentProfile = {
  id: number;
  name: string;
  phone: string;
  email: string;
  bio: string; 
  office_address: string;
  fax: string; 
  rank: string;
  agent_code: string;
  corporation_name: string;
  branch_name: string;
  team_number: string;
  avatar_url: string | null;
  agency_id: number; 
  company_codes: Record<string, string>; 
};

type TeamMember = {
  id: number;
  name: string;
  rank: string;
  phone: string;
  avatar_url: string | null;
};

export default function MyPage() {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false); 

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<{company_type: string, company_name: string}[]>([]);
  
  const [newCompany, setNewCompany] = useState("");
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [companyCodes, setCompanyCodes] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    office_address: "",
    fax: "", 
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: agentData, error } = await supabase
          .from("agents")
          .select(`
            id, name, phone, bio, office_address, fax, rank, agent_code, avatar_url, company_codes, agency_id,
            agencies (corporation_name, branch_name, team_number)
          `)
          .eq("auth_id", user.id)
          .single();

        if (agentData) {
          const agency = Array.isArray(agentData.agencies) ? agentData.agencies[0] : agentData.agencies;
          
          setProfile({
            id: agentData.id,
            name: agentData.name || "",
            phone: agentData.phone || "",
            email: user.email || "",
            bio: agentData.bio || "",
            office_address: agentData.office_address || "",
            fax: agentData.fax || "",
            rank: agentData.rank || "FC",
            agent_code: agentData.agent_code || "",
            avatar_url: agentData.avatar_url || null,
            agency_id: agentData.agency_id,
            company_codes: agentData.company_codes || {},
            corporation_name: agency?.corporation_name || "",
            branch_name: agency?.branch_name || "",
            team_number: agency?.team_number || "",
          });

          setForm({
            name: agentData.name || "",
            phone: agentData.phone || "",
            bio: agentData.bio || "",
            office_address: agentData.office_address || "",
            fax: agentData.fax || "",
          });

          setCompanyCodes(agentData.company_codes || {});

          if (agentData.agency_id) {
            const { data: membersData } = await supabase
              .from("agents")
              .select("id, name, rank, phone, avatar_url")
              .eq("agency_id", agentData.agency_id);
            if (membersData) setTeamMembers(membersData);
          }
        }

        const { data: compData } = await supabase.from("insurance_companies").select("company_type, company_name");
        if (compData) setInsuranceCompanies(compData);
      }
      setIsLoading(false);
    };

    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("agents")
      .update({
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        office_address: form.office_address,
        fax: form.fax,
        company_codes: companyCodes, 
      })
      .eq("id", profile.id);

    if (error) {
      alert("프로필 저장에 실패했습니다.");
    } else {
      alert("프로필 및 코드 정보가 성공적으로 업데이트되었습니다.");
      setProfile({ ...profile, ...form, company_codes: companyCodes });
    }
    setIsSaving(false);
  };

  const handleAddCompanyCode = () => {
    if (!newCompany.trim() || !newCompanyCode.trim()) {
      return alert("보험사 이름과 사번(코드)을 모두 입력해주세요.");
    }
    setCompanyCodes(prev => ({ ...prev, [newCompany.trim()]: newCompanyCode.trim() }));
    setNewCompany("");
    setNewCompanyCode("");
  };

  const handleRemoveCompanyCode = (companyName: string) => {
    setCompanyCodes(prev => {
      const updated = { ...prev };
      delete updated[companyName];
      return updated;
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setIsUploading(true);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}-${Math.random()}.${fileExt}`; 
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('agents').update({ avatar_url: publicUrl }).eq('id', profile?.id);
      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      alert('프로필 사진이 성공적으로 등록되었습니다.');
    } catch (error: any) {
      alert(`사진 업로드 실패: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    await supabase.auth.signOut();
    window.location.href = "/login"; 
  };

  const handleKakaoShare = () => {
    const globalWindow = window as any;

    if (typeof window !== "undefined" && globalWindow.Kakao) {
      const kakao = globalWindow.Kakao;
      
      const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "ccb428fb9e389bec1c8579c12828fd97";

      if (!kakao.isInitialized()) {
        kakao.init(KAKAO_KEY);
      }

      const defaultImageUrl = "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=800";
      const myCardUrl = `${window.location.origin}/card/${profile?.id}`;

      kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `[디지털 명함] ${profile?.corporation_name}\n${profile?.name} ${profile?.rank}`,
          description: profile?.bio || "고객님의 든든한 금융 파트너가 되겠습니다. 언제든 편하게 연락주세요.",
          imageUrl: profile?.avatar_url || defaultImageUrl,
          link: {
            mobileWebUrl: myCardUrl,
            webUrl: myCardUrl,
          },
        },
        itemContent: {
          profileText: `${profile?.branch_name} ${profile?.team_number ? profile.team_number + '팀' : ''}`,
        },
        buttons: [
          {
            title: '💳 모바일 명함 열기',
            link: {
              mobileWebUrl: myCardUrl,
              webUrl: myCardUrl,
            },
          },
        ],
      });
    } else {
      alert("카카오톡 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }
  };

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-gray-500">프로필 정보를 불러올 수 없습니다.</div>;
  }

  const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all";

  const managers = teamMembers.filter(m => ["BM", "RM", "본부장", "지점장"].includes(m.rank.toUpperCase()));
  const teamLeaders = teamMembers.filter(m => ["SM", "팀장"].includes(m.rank.toUpperCase()));
  const members = teamMembers.filter(m => !["BM", "RM", "본부장", "지점장", "SM", "팀장"].includes(m.rank.toUpperCase()));

  const getCompanyTypePriority = (companyName: string) => {
    const company = insuranceCompanies.find(c => c.company_name === companyName);
    if (company?.company_type === "생명보험") return 1;
    if (company?.company_type === "손해보험") return 2;
    return 3; 
  };

  // ⭐️ [정렬 엔진 고도화] 영어(알파벳) 선행 후 한글 가나다순으로 정렬하는 헬퍼 함수
  const compareEnglishKorean = (a: string, b: string) => {
    const aIsEng = /^[A-Za-z]/.test(a);
    const bIsEng = /^[A-Za-z]/.test(b);

    if (aIsEng && !bIsEng) return -1; // 영어가 먼저 오도록
    if (!aIsEng && bIsEng) return 1;  // 한글이 뒤로 가도록
    return a.localeCompare(b, "ko-KR"); // 같은 문자 계열 내에서는 순차 정렬
  };

  // 드롭다운(Datalist)용 보험사 목록 정렬 (생명->손해->기타 그룹 정렬 후 내부 영어->한글 정렬)
  const sortedInsuranceCompanies = [...insuranceCompanies].sort((a, b) => {
    const priorityA = a.company_type === "생명보험" ? 1 : a.company_type === "손해보험" ? 2 : 3;
    const priorityB = b.company_type === "생명보험" ? 1 : b.company_type === "손해보험" ? 2 : 3;
    
    if (priorityA !== priorityB) return priorityA - priorityB; 
    return compareEnglishKorean(a.company_name, b.company_name); 
  });

  // 화면에 표시되는 등록된 사번(코드) 목록 정렬 (생명->손해->기타 그룹 정렬 후 내부 영어->한글 정렬)
  const sortedCompanyCodes = Object.entries(companyCodes).sort(([companyA], [companyB]) => {
    const priorityA = getCompanyTypePriority(companyA);
    const priorityB = getCompanyTypePriority(companyB);
    
    if (priorityA !== priorityB) return priorityA - priorityB; 
    return compareEnglishKorean(companyA, companyB); 
  });

  return (
    <div className="w-full mx-auto max-w-[1200px] space-y-6 p-4 md:p-8 pb-24">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-blue-600" />
          마이페이지
        </h1>
        <p className="mt-2 text-sm text-gray-500">내 프로필, 보험사 코드 및 소속 조직을 관리합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 좌측: 프로필 요약 카드 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden text-center">
            <div className="h-82 bg-gradient-to-r from-blue-600 to-indigo-700">
              <label className="w-full h-full bg-gray-100 flex items-center justify-center relative overflow-hidden group cursor-pointer border border-gray-100">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
              </label>
            </div>
            
            <div className="px-6 pb-6 relative">
              
              <div className="mt-14 flex flex-col items-center">
                <div className="flex items-center gap-2 justify-center">
                  <h2 className="text-xl font-extrabold text-gray-900">{profile.name}</h2>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase">{profile.rank}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1.5 font-medium">{profile.corporation_name} / {profile.branch_name}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <button onClick={() => setIsCardModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-md hover:shadow-lg">
                  <QrCode className="w-4 h-4 text-blue-300" /> 모바일 명함 확인 및 전송
                </button>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl py-3 text-sm font-bold transition-colors">
                  <LogOut className="w-4 h-4" /> 로그아웃
                </button>
              </div>
            </div>
          </div>

          {/* 하위 조직도 (Team Directory) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Network className="w-5 h-5 text-gray-400" /> 우리 팀 조직도
            </h3>
            
            <div className="space-y-4">
              {/* 지점장/본부장 그룹 */}
              {managers.length > 0 && (
                <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 space-y-2">
                  <span className="text-[10px] font-black text-blue-500 px-2 uppercase tracking-wider">Manager</span>
                  {managers.map(m => (
                    <div key={m.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-blue-100/50">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-900">{m.name}</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{m.rank}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{m.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 팀장 그룹 */}
              {teamLeaders.length > 0 && (
                <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 space-y-2 relative">
                  {managers.length > 0 && <div className="absolute -top-4 left-6 w-0.5 h-4 bg-gray-200" />}
                  <span className="text-[10px] font-black text-indigo-500 px-2 uppercase tracking-wider">Team Leader</span>
                  {teamLeaders.map(m => (
                    <div key={m.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-indigo-100/50">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-indigo-400" />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-900">{m.name}</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{m.rank}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{m.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 팀원 그룹 */}
              {members.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-2 relative">
                  {(managers.length > 0 || teamLeaders.length > 0) && <div className="absolute -top-4 left-6 w-0.5 h-4 bg-gray-200" />}
                  <span className="text-[10px] font-black text-gray-500 px-2 uppercase tracking-wider">Members</span>
                  <div className="grid grid-cols-1 gap-2">
                    {members.map(m => (
                      <div key={m.id} className={`flex items-center gap-3 bg-white p-2.5 rounded-xl border ${m.id === profile.id ? 'border-blue-400 shadow-md ring-2 ring-blue-50' : 'border-gray-200 shadow-sm'}`}>
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-900">{m.name}</span>
                            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{m.rank}</span>
                            {m.id === profile.id && <span className="text-[10px] font-black text-white bg-blue-500 px-1.5 py-0.5 rounded-full ml-1">ME</span>}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">{m.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 우측: 정보 및 코드 수정 폼 */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" /> 기본 정보 설정
            </h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">이름</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">휴대폰 번호</label>
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="010-0000-0000" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">팩스 번호</label>
                  <div className="relative">
                    <Printer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.fax} onChange={e => setForm({...form, fax: e.target.value})} placeholder="02-000-0000" className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">계정 이메일 (로그인 ID)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={profile.email} disabled className={`${inputClass} pl-9 bg-gray-50 text-gray-500 cursor-not-allowed`} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">사무실 주소</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input type="text" value={form.office_address} onChange={e => setForm({...form, office_address: e.target.value})} placeholder="사무실 주소를 입력해주세요." className={`${inputClass} pl-9`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">고객용 프로필 한 줄 소개 / 철학</label>
                <textarea 
                  value={form.bio} 
                  onChange={e => setForm({...form, bio: e.target.value})} 
                  rows={3} 
                  placeholder="디지털 명함에 들어갈 소개 문구를 적어주세요. (예: 진심을 다해 올바른 보장을 설계합니다.)"
                  className={`${inputClass} resize-none leading-relaxed`} 
                />
              </div>
            </div>
          </div>

          {/* 보험사별 사번(코드) 관리 구역 */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> 보험사별 전속 코드(사번) 관리
              </h3>
              <p className="text-xs text-gray-500 font-medium">원수사 시스템 로그인 시 사용하는 사번을 기록하세요.</p>
            </div>
            
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 md:p-5">
              
              {/* 등록된 코드 목록 (생명 -> 손해 -> 기타 순 및 각 내부 영어 -> 한글 정렬) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
                {sortedCompanyCodes.length === 0 ? (
                  <div className="col-span-full py-4 text-center text-sm text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    아직 등록된 보험사 코드가 없습니다. 아래에서 추가해주세요.
                  </div>
                ) : (
                  sortedCompanyCodes.map(([company, code]) => {
                    const priority = getCompanyTypePriority(company);
                    const badgeClass = priority === 1 ? "bg-blue-50 text-blue-600 border-blue-100" 
                                     : priority === 2 ? "bg-amber-50 text-amber-600 border-amber-100" 
                                     : "bg-gray-100 text-gray-500 border-gray-200";
                    const badgeText = priority === 1 ? "생명" : priority === 2 ? "손해" : "기타";

                    return (
                      <div key={company} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                        <div className="flex flex-col overflow-hidden pr-2">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${badgeClass}`}>{badgeText}</span>
                            <span className="text-[10px] font-bold text-gray-500 truncate">{company}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900 tracking-wide truncate">{code}</span>
                        </div>
                        <button onClick={() => handleRemoveCompanyCode(company)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 새 코드 추가 폼 */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200">
                <div className="flex-1">
                  <input 
                    type="text" 
                    list="company-list" 
                    placeholder="보험사명 (검색 또는 직접입력)" 
                    value={newCompany} 
                    onChange={e => setNewCompany(e.target.value)} 
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <datalist id="company-list">
                    {sortedInsuranceCompanies.map(c => <option key={c.company_name} value={c.company_name} />)}
                  </datalist>
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="사번 / 코드 입력" 
                    value={newCompanyCode} 
                    onChange={e => setNewCompanyCode(e.target.value)} 
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                    onKeyDown={e => e.key === 'Enter' && handleAddCompanyCode()}
                  />
                </div>
                <button 
                  onClick={handleAddCompanyCode} 
                  className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-1 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" /> 코드 추가
                </button>
              </div>
            </div>

            {/* 전체 정보 저장 버튼 */}
            <div className="pt-8 flex justify-end mt-2">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-3.5 text-base font-black transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                모든 변경사항 저장하기
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 중앙 정렬된 모바일 디지털 명함 미리보기 모달 */}
      {isCardModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity animate-in fade-in"
          onClick={() => setIsCardModalOpen(false)}
        >
          <div 
            className="w-full max-w-[360px] flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* 디지털 명함 본체 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative text-center">
              <div className="h-90 relative p-2">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="relative px-6 pb-6">

                <div className="mt-14 space-y-1">
                  <p className="text-blue-600 font-extrabold text-xs tracking-tight">{profile.corporation_name} {profile.branch_name}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{profile.name}</h2>
                    <span className="text-sm font-bold text-gray-500">{profile.rank}</span>
                  </div>
                </div>

                {profile.bio && (
                  <div className="mt-5 bg-gray-50/80 rounded-2xl p-4 border border-gray-100 relative">
                    <Quote className="absolute top-2 left-2 w-4 h-4 text-blue-200 rotate-180" />
                    <p className="text-sm font-medium text-gray-700 leading-relaxed text-center px-4">
                      "{profile.bio}"
                    </p>
                    <Quote className="absolute bottom-2 right-2 w-4 h-4 text-blue-200" />
                  </div>
                )}

                <div className="mt-6 space-y-3.5 text-left">
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="tracking-wide">{profile.phone || "연락처 미등록"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Printer className="w-4 h-4" />
                    </div>
                    <span className="tracking-wide">{profile.fax || "팩스 미등록"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="truncate">{profile.email}</span>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="leading-snug">{profile.office_address || "주소 미등록"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleKakaoShare}
                className="w-full bg-[#FEE500] hover:bg-[#FADA0A] text-[#000000] rounded-2xl py-4 flex items-center justify-center gap-2 font-black text-[15px] shadow-lg transition-transform active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-black" />
                카카오톡으로 명함 전송하기
              </button>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-colors">
                  <Share2 className="w-4 h-4 text-gray-500" /> 링크 복사
                </button>
                <button 
                  onClick={() => setIsCardModalOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-colors"
                >
                  <X className="w-4 h-4" /> 닫기
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}