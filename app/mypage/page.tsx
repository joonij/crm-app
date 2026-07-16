"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, Phone, Mail, LogOut, Camera, Save, Loader2, Award, QrCode, 
  MapPin, Printer, Share2, MessageCircle, X, Quote, Briefcase, 
  Network, Plus, Trash2, KeyRound, TrendingUp, Pencil, ExternalLink 
} from "lucide-react";

type CompanyCredential = { code: string; password?: string };

type AgentProfile = {
  id: number;
  name: string;
  identity: string; 
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
  company_codes: Record<string, CompanyCredential>;
  skills: {name: string, score: number}[];   
  careers: {year: string, desc: string}[];  
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
  
  // 내 프로필 수정 폼 상태
  const [newCompany, setNewCompany] = useState("");
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [newCompanyPassword, setNewCompanyPassword] = useState("");
  const [companyCodes, setCompanyCodes] = useState<Record<string, CompanyCredential>>({});
  const [skills, setSkills] = useState<{name: string, score: number}[]>([]);
  const [careers, setCareers] = useState<{year: string, desc: string}[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillScore, setNewSkillScore] = useState(90);
  const [newCareerYear, setNewCareerYear] = useState("");
  const [newCareerDesc, setNewCareerDesc] = useState("");

  const [form, setForm] = useState({
    name: "", identity: "", phone: "", bio: "", office_address: "", fax: "", 
  });

  // ⭐️ 팀원 전체 정보 수정 모달용 상태 관리
  const [editingMember, setEditingMember] = useState<AgentProfile | null>(null);
  const [isMemberSaving, setIsMemberSaving] = useState(false);
  
  // 팀원 모달창 전용 임시 입력 상태
  const [modalNewSkillName, setModalNewSkillName] = useState("");
  const [modalNewSkillScore, setModalNewSkillScore] = useState(90);
  const [modalNewCareerYear, setModalNewCareerYear] = useState("");
  const [modalNewCareerDesc, setModalNewCareerDesc] = useState("");
  const [modalNewCompany, setModalNewCompany] = useState("");
  const [modalNewCompanyCode, setModalNewCompanyCode] = useState("");
  const [modalNewCompanyPassword, setModalNewCompanyPassword] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: agentData } = await supabase
          .from("agents")
          .select(`
            id, name, identity, phone, bio, office_address, fax, rank, agent_code, avatar_url, company_codes, agency_id, skills, careers,
            agencies (corporation_name, branch_name, team_number)
          `)
          .eq("auth_id", user.id)
          .single();

        if (agentData) {
          const agency = Array.isArray(agentData.agencies) ? agentData.agencies[0] : agentData.agencies;
          const rawCodes = agentData.company_codes || {};
          const formattedCodes: Record<string, CompanyCredential> = {};
          
          for (const [key, value] of Object.entries(rawCodes)) {
            if (typeof value === 'string') formattedCodes[key] = { code: value, password: "" }; 
            else formattedCodes[key] = value as CompanyCredential; 
          }

          setProfile({
            id: agentData.id,
            name: agentData.name || "",
            identity: agentData.identity || "", 
            phone: agentData.phone || "",
            email: user.email || "",
            bio: agentData.bio || "",
            office_address: agentData.office_address || "",
            fax: agentData.fax || "",
            rank: agentData.rank || "FC",
            agent_code: agentData.agent_code || "",
            avatar_url: agentData.avatar_url || null,
            agency_id: agentData.agency_id,
            company_codes: formattedCodes,
            skills: agentData.skills || [],
            careers: agentData.careers || [],
            corporation_name: agency?.corporation_name || "",
            branch_name: agency?.branch_name || "",
            team_number: agency?.team_number || "",
          });

          setForm({
            name: agentData.name || "", identity: agentData.identity || "", 
            phone: agentData.phone || "", bio: agentData.bio || "",
            office_address: agentData.office_address || "", fax: agentData.fax || "",
          });

          setCompanyCodes(formattedCodes);
          setSkills(agentData.skills?.length > 0 ? agentData.skills : []);
          setCareers(agentData.careers || []);

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
    const { error } = await supabase.from("agents").update({
      name: form.name, identity: form.identity, phone: form.phone, bio: form.bio,
      office_address: form.office_address, fax: form.fax,
      company_codes: companyCodes, skills: skills, careers: careers  
    }).eq("id", profile.id);

    if (error) alert("프로필 저장에 실패했습니다.");
    else {
      alert("프로필 및 포트폴리오 정보가 성공적으로 업데이트되었습니다.");
      setProfile({ ...profile, ...form, company_codes: companyCodes, skills, careers });
    }
    setIsSaving(false);
  };

  // --- 본인 프로필 수정 핸들러 ---
  const handleAddSkill = () => {
    if(!newSkillName.trim()) return alert("전문 분야 키워드를 입력해주세요.");
    setSkills([...skills, { name: newSkillName, score: newSkillScore }]);
    setNewSkillName(""); setNewSkillScore(90);
  };
  const handleRemoveSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

  const handleAddCareer = () => {
    if(!newCareerYear.trim() || !newCareerDesc.trim()) return alert("연도와 약력 내용을 모두 입력해주세요.");
    setCareers([{ year: newCareerYear, desc: newCareerDesc }, ...careers]);
    setNewCareerYear(""); setNewCareerDesc("");
  };
  const handleRemoveCareer = (index: number) => setCareers(careers.filter((_, i) => i !== index));

  const handleAddCompanyCode = () => {
    if (!newCompany.trim() || !newCompanyCode.trim()) return alert("보험사 이름과 사번(코드)은 필수 입력 사항입니다.");
    setCompanyCodes(prev => ({ ...prev, [newCompany.trim()]: { code: newCompanyCode.trim(), password: newCompanyPassword.trim() } }));
    setNewCompany(""); setNewCompanyCode(""); setNewCompanyPassword("");
  };
  const handleEditCompanyCode = (companyName: string) => {
    const data = companyCodes[companyName];
    if (data) {
      setNewCompany(companyName); setNewCompanyCode(data.code); setNewCompanyPassword(data.password || "");
      document.getElementById('company-input-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  const handleRemoveCompanyCode = (companyName: string) => {
    if(!window.confirm(`${companyName} 코드를 삭제하시겠습니까?`)) return;
    setCompanyCodes(prev => { const updated = { ...prev }; delete updated[companyName]; return updated; });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setIsUploading(true);
      const file = event.target.files[0];
      const filePath = `${profile?.id}-${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('agents').update({ avatar_url: publicUrl }).eq('id', profile?.id);
      if (updateError) throw updateError;
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      alert('프로필 사진이 성공적으로 등록되었습니다.');
    } catch (error: any) { alert(`사진 업로드 실패: ${error.message}`); } finally { setIsUploading(false); }
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
      if (!kakao.isInitialized()) kakao.init(KAKAO_KEY);
      const myCardUrl = `${window.location.origin}/card/${profile?.id}`;
      kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${profile?.corporation_name} ${profile?.branch_name}\n${profile?.identity ? `[${profile.identity}] ` : ''}${profile?.name} ${profile?.rank}`,
          description: `${profile?.identity}\n${profile?.bio}` || "고객님의 든든한 금융 파트너가 되겠습니다.",
          imageUrl: profile?.avatar_url || "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=800",
          link: { mobileWebUrl: myCardUrl, webUrl: myCardUrl },
        },
        itemContent: { profileText: `📞 ${profile?.phone || "연락처 미등록"}` },
        buttons: [{ title: '💳 모바일 명함 열기', link: { mobileWebUrl: myCardUrl, webUrl: myCardUrl } }],
      });
    } else { alert("카카오톡 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요."); }
  };

  // --- ⭐️ 팀원 모달창 전용 핸들러 ---
  const canEditOthers = profile ? ["BM", "RM", "본부장", "지점장", "SM", "팀장"].includes(profile.rank.toUpperCase()) : false;

  const openMemberEditModal = async (memberId: number) => {
    setIsLoading(true);
    const { data } = await supabase.from("agents").select("*").eq("id", memberId).single();
    if (data) {
      const rawCodes = data.company_codes || {};
      const formattedCodes: Record<string, CompanyCredential> = {};
      for (const [key, value] of Object.entries(rawCodes)) {
        if (typeof value === 'string') formattedCodes[key] = { code: value, password: "" }; 
        else formattedCodes[key] = value as CompanyCredential; 
      }
      setEditingMember({
        ...data,
        company_codes: formattedCodes,
        skills: data.skills || [],
        careers: data.careers || [],
      });
      // 모달 열 때 임시값 초기화
      setModalNewSkillName(""); setModalNewCareerYear(""); setModalNewCareerDesc("");
      setModalNewCompany(""); setModalNewCompanyCode(""); setModalNewCompanyPassword("");
    } else {
      alert("팀원 정보를 불러오는 중 오류가 발생했습니다.");
    }
    setIsLoading(false);
  };

  const handleModalAddSkill = () => {
    if(!editingMember || !modalNewSkillName.trim()) return;
    setEditingMember({...editingMember, skills: [...editingMember.skills, { name: modalNewSkillName, score: modalNewSkillScore }]});
    setModalNewSkillName(""); setModalNewSkillScore(90);
  };
  const handleModalRemoveSkill = (idx: number) => {
    if(!editingMember) return;
    setEditingMember({...editingMember, skills: editingMember.skills.filter((_, i) => i !== idx)});
  };

  const handleModalAddCareer = () => {
    if(!editingMember || !modalNewCareerYear.trim() || !modalNewCareerDesc.trim()) return;
    setEditingMember({...editingMember, careers: [{ year: modalNewCareerYear, desc: modalNewCareerDesc }, ...editingMember.careers]});
    setModalNewCareerYear(""); setModalNewCareerDesc("");
  };
  const handleModalRemoveCareer = (idx: number) => {
    if(!editingMember) return;
    setEditingMember({...editingMember, careers: editingMember.careers.filter((_, i) => i !== idx)});
  };

  const handleModalAddCompanyCode = () => {
    if(!editingMember || !modalNewCompany.trim() || !modalNewCompanyCode.trim()) return alert("보험사 이름과 사번은 필수입니다.");
    setEditingMember({
      ...editingMember, 
      company_codes: { 
        ...editingMember.company_codes, 
        [modalNewCompany.trim()]: { code: modalNewCompanyCode.trim(), password: modalNewCompanyPassword.trim() } 
      }
    });
    setModalNewCompany(""); setModalNewCompanyCode(""); setModalNewCompanyPassword("");
  };
  const handleModalEditCompanyCode = (companyName: string) => {
    if(!editingMember) return;
    const data = editingMember.company_codes[companyName];
    if (data) {
      setModalNewCompany(companyName); setModalNewCompanyCode(data.code); setModalNewCompanyPassword(data.password || "");
    }
  };
  const handleModalRemoveCompanyCode = (companyName: string) => {
    if(!editingMember || !window.confirm(`${companyName} 코드를 삭제하시겠습니까?`)) return;
    const updatedCodes = { ...editingMember.company_codes };
    delete updatedCodes[companyName];
    setEditingMember({...editingMember, company_codes: updatedCodes});
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    setIsMemberSaving(true);
    const { error } = await supabase
      .from("agents")
      .update({
        name: editingMember.name,
        rank: editingMember.rank,
        phone: editingMember.phone,
        identity: editingMember.identity,
        office_address: editingMember.office_address,
        bio: editingMember.bio,
        fax: editingMember.fax,
        skills: editingMember.skills,
        careers: editingMember.careers,
        company_codes: editingMember.company_codes
      })
      .eq("id", editingMember.id);

    if (error) {
      alert("수정 권한이 없거나 오류가 발생했습니다. (RLS 정책을 확인해주세요.)");
    } else {
      alert("팀원 정보가 전체적으로 성공적으로 수정되었습니다.");
      setTeamMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, name: editingMember.name, rank: editingMember.rank, phone: editingMember.phone } : m));
      setEditingMember(null);
    }
    setIsMemberSaving(false);
  };

  if (isLoading) return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!profile) return <div className="p-8 text-center text-gray-500">프로필 정보를 불러올 수 없습니다.</div>;

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
  const compareEnglishKorean = (a: string, b: string) => {
    const aIsEng = /^[A-Za-z]/.test(a); const bIsEng = /^[A-Za-z]/.test(b);
    if (aIsEng && !bIsEng) return -1; if (!aIsEng && bIsEng) return 1; return a.localeCompare(b, "ko-KR"); 
  };

  const sortedInsuranceCompanies = [...insuranceCompanies].sort((a, b) => {
    const priorityA = a.company_type === "생명보험" ? 1 : a.company_type === "손해보험" ? 2 : 3;
    const priorityB = b.company_type === "생명보험" ? 1 : b.company_type === "손해보험" ? 2 : 3;
    if (priorityA !== priorityB) return priorityA - priorityB; return compareEnglishKorean(a.company_name, b.company_name); 
  });
  const sortedCompanyCodes = Object.entries(companyCodes).sort(([companyA], [companyB]) => {
    const priorityA = getCompanyTypePriority(companyA); const priorityB = getCompanyTypePriority(companyB);
    if (priorityA !== priorityB) return priorityA - priorityB; return compareEnglishKorean(companyA, companyB); 
  });
  
  // 모달용 정렬된 코드
  const modalSortedCompanyCodes = editingMember ? Object.entries(editingMember.company_codes).sort(([companyA], [companyB]) => {
    const priorityA = getCompanyTypePriority(companyA); const priorityB = getCompanyTypePriority(companyB);
    if (priorityA !== priorityB) return priorityA - priorityB; return compareEnglishKorean(companyA, companyB); 
  }) : [];

  return (
    <div className="w-full mx-auto max-w-[1200px] p-4 md:p-8 pb-24 relative">
      
      {/* 상단 헤더 Z-index 고정 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md -mx-4 px-4 pt-4 pb-4 md:-mx-8 md:px-8 md:pt-6 md:pb-4 border-b border-gray-200/60 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <User className="w-7 h-7 text-blue-600" /> 마이페이지
          </h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500">내 프로필, 포트폴리오, 보험사 코드 및 소속 조직을 관리합니다.</p>
        </div>

        <button 
          onClick={handleSaveProfile} 
          disabled={isSaving} 
          className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3.5 sm:py-3 text-sm font-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          {isSaving ? "저장 중..." : "모든 변경사항 저장"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 좌측: 프로필 요약 카드 및 팀 조직도 */}
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
                {profile.identity && (
                  <span className="text-xs font-black text-amber-500 mb-1">{profile.identity}</span>
                )}
                <div className="flex items-center gap-2 justify-center">
                  <h2 className="text-xl font-extrabold text-gray-900">{profile.name}</h2>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase">{profile.rank}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1.5 font-medium">{profile.corporation_name} / {profile.branch_name}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <button onClick={() => setIsCardModalOpen(true)} className="cursor-pointer w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-md hover:shadow-lg">
                  <QrCode className="w-4 h-4 text-blue-300" /> 모바일 명함 확인 및 전송
                </button>
                <button onClick={handleLogout} className="cursor-pointer w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl py-3 text-sm font-bold transition-colors">
                  <LogOut className="w-4 h-4" /> 로그아웃
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Network className="w-5 h-5 text-gray-400" /> 우리 팀 조직도
            </h3>
            
            <div className="space-y-4">
              {managers.length > 0 && (
                <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 space-y-2">
                  <span className="text-[10px] font-black text-blue-500 px-2 uppercase tracking-wider">Manager</span>
                  {managers.map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => { if (canEditOthers && m.id !== profile.id) openMemberEditModal(m.id); }}
                      className={`flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-blue-100/50 ${canEditOthers && m.id !== profile.id ? 'cursor-pointer hover:border-blue-300 transition-colors' : ''}`}
                    >
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

              {teamLeaders.length > 0 && (
                <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 space-y-2 relative">
                  {managers.length > 0 && <div className="absolute -top-4 left-6 w-0.5 h-4 bg-gray-200" />}
                  <span className="text-[10px] font-black text-indigo-500 px-2 uppercase tracking-wider">Team Leader</span>
                  {teamLeaders.map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => { if (canEditOthers && m.id !== profile.id) openMemberEditModal(m.id); }}
                      className={`flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-indigo-100/50 ${canEditOthers && m.id !== profile.id ? 'cursor-pointer hover:border-indigo-300 transition-colors' : ''}`}
                    >
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

              {members.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-2 relative">
                  {(managers.length > 0 || teamLeaders.length > 0) && <div className="absolute -top-4 left-6 w-0.5 h-4 bg-gray-200" />}
                  <span className="text-[10px] font-black text-gray-500 px-2 uppercase tracking-wider">Members</span>
                  <div className="grid grid-cols-1 gap-2">
                    {members.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => { if (canEditOthers && m.id !== profile.id) openMemberEditModal(m.id); }}
                        className={`flex items-center gap-3 bg-white p-2.5 rounded-xl border ${m.id === profile.id ? 'border-blue-400 shadow-md ring-2 ring-blue-50' : 'border-gray-200 shadow-sm'} ${canEditOthers && m.id !== profile.id ? 'cursor-pointer hover:border-blue-300 transition-colors' : ''}`}
                      >
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

        {/* 우측: 정보 및 폼 수정 영역 */}
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
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">나만의 타이틀 (아이덴티티/별명)</label>
                  <input type="text" value={form.identity} onChange={e => setForm({...form, identity: e.target.value})} placeholder="예: 보험의 정석, 연금 마스터" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">휴대폰 번호</label>
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="010-0000-0000" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">계정 이메일 (로그인 ID)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={profile.email} disabled className={`${inputClass} pl-9 bg-gray-50 text-gray-500 cursor-not-allowed`} />
                  </div>
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
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">사무실 주소</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.office_address} onChange={e => setForm({...form, office_address: e.target.value})} placeholder="사무실 주소를 입력해주세요." className={`${inputClass} pl-9`} />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-xs font-bold text-gray-600">고객용 프로필 한 줄 소개 / 철학</label>
                  <span className={`text-[11px] font-bold ${form.bio.length >= 40 ? 'text-red-500' : 'text-gray-400'}`}>
                    {form.bio.length} / 20자
                  </span>
                </div>
                <textarea 
                  value={form.bio} 
                  onChange={e => setForm({...form, bio: e.target.value.slice(0, 20)})} 
                  rows={1} maxLength={20} placeholder="디지털 명함에 들어갈 소개 문구를 적어주세요. (최대 20자)"
                  className={`${inputClass} resize-none leading-relaxed`} 
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> 전문 컨설팅 포커스
                </h3>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5">
                <div className="flex flex-col gap-3">
                  {skills.length === 0 && <p className="text-sm text-gray-400 text-center py-2">등록된 전문 분야가 없습니다.</p>}
                  {skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex-1 pr-4">
                        <span className="text-sm font-bold text-gray-800">{skill.name}</span>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full" style={{width: `${skill.score}%`}}></div>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveSkill(idx)} className="cursor-pointer p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-200">
                  <input type="text" placeholder="키워드 입력 (예: 은퇴설계, 변액투자)" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} className={`${inputClass} flex-1`} />
                  <div className="flex gap-2">
                    <select value={newSkillScore} onChange={e => setNewSkillScore(Number(e.target.value))} className={`${inputClass} w-32`}>
                      <option value="98">최상 (98%)</option>
                      <option value="90">상 (90%)</option>
                      <option value="80">중상 (80%)</option>
                    </select>
                    <button onClick={handleAddSkill} className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-5 rounded-lg font-bold text-sm transition-colors whitespace-nowrap">추가</button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-blue-600" /> 주요 약력 및 증명 (타임라인)
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5">
                <div className="flex flex-col gap-2">
                  {careers.length === 0 && <p className="text-sm text-gray-400 text-center py-2">등록된 약력이 없습니다.</p>}
                  {careers.map((career, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                      <span className="text-sm font-black text-blue-600 w-12 text-center">{career.year}</span>
                      <span className="text-sm font-bold text-gray-800 flex-1">{career.desc}</span>
                      <button onClick={() => handleRemoveCareer(idx)} className="cursor-pointer p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-200">
                  <input type="text" placeholder="연도 (예: 2024)" value={newCareerYear} onChange={e => setNewCareerYear(e.target.value)} className={`${inputClass} sm:w-28 text-center`} maxLength={4} />
                  <div className="flex gap-2 flex-1">
                    <input type="text" placeholder="약력 내용 (예: MDRT 달성)" value={newCareerDesc} onChange={e => setNewCareerDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCareer()} className={`${inputClass} flex-1`} />
                    <button onClick={handleAddCareer} className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-5 rounded-lg font-bold text-sm transition-colors whitespace-nowrap">추가</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8" id="company-input-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> 보험사별 전속 코드(사번) 관리
              </h3>
              <p className="text-xs text-gray-500 font-medium">원수사 시스템 로그인 시 사용하는 사번과 비밀번호를 기록하세요.</p>
            </div>
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
                {sortedCompanyCodes.length === 0 ? (
                  <div className="col-span-full py-4 text-center text-sm text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    아직 등록된 보험사 코드가 없습니다. 아래에서 추가해주세요.
                  </div>
                ) : (
                  sortedCompanyCodes.map(([company, data]) => {
                    const priority = getCompanyTypePriority(company);
                    const badgeClass = priority === 1 ? "bg-blue-50 text-blue-600 border-blue-100" 
                                       : priority === 2 ? "bg-amber-50 text-amber-600 border-amber-100" 
                                       : "bg-gray-100 text-gray-500 border-gray-200";
                    const badgeText = priority === 1 ? "생명" : priority === 2 ? "손해" : "기타";

                    return (
                      <div key={company} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                        <div className="flex flex-col overflow-hidden pr-2 gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${badgeClass}`}>{badgeText}</span>
                            <span className="text-[11px] font-bold text-gray-500 truncate">{company}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900 tracking-wide truncate mt-0.5">{data.code}</span>
                          {data.password && (
                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                              <KeyRound className="w-2.5 h-2.5" /> {data.password}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleEditCompanyCode(company)} className="cursor-pointer p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRemoveCompanyCode(company)} className="cursor-pointer p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-4 border-t border-slate-200">
                <div className="md:col-span-4">
                  <input 
                    type="text" list="company-list" placeholder="보험사명 (직접입력)" 
                    value={newCompany} onChange={e => setNewCompany(e.target.value)} 
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <datalist id="company-list">{sortedInsuranceCompanies.map(c => <option key={c.company_name} value={c.company_name} />)}</datalist>
                </div>
                <div className="md:col-span-3">
                  <input 
                    type="text" placeholder="사번(코드)" 
                    value={newCompanyCode} onChange={e => setNewCompanyCode(e.target.value)} 
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="md:col-span-3">
                  <input 
                    type="text" placeholder="비밀번호(선택)" 
                    value={newCompanyPassword} onChange={e => setNewCompanyPassword(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAddCompanyCode()}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="md:col-span-2">
                  <button onClick={handleAddCompanyCode} className="cursor-pointer w-full h-full bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-2 py-2.5 text-sm font-bold flex items-center justify-center gap-1 transition-colors">
                    <Plus className="w-4 h-4" /> 추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 중앙 정렬된 모바일 디지털 명함 미리보기 모달 */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity animate-in fade-in" onClick={() => setIsCardModalOpen(false)}>
          {/* (명함 모달 기존 코드 동일 유지) */}
          <div className="w-full max-w-[360px] flex flex-col gap-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative text-center border border-gray-100">
              <div className="h-80 relative p-2">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                  {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-gray-400" />}
                </div>
              </div>
              <div className="relative px-6 pb-6">
                <div className="mt-8 space-y-1">
                  <p className="text-blue-600 font-extrabold text-xs tracking-tight">{profile.corporation_name} {profile.branch_name}</p>
                  {profile.identity && ( <p className="text-amber-500 font-black text-sm tracking-wide mb-1">{profile.identity}</p> )}
                  <div className="flex items-baseline justify-center gap-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{profile.name}</h2>
                    <span className="text-sm font-bold text-gray-500">{profile.rank}</span>
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-5 bg-gray-50/80 rounded-2xl p-4 border border-gray-100 relative">
                    <Quote className="absolute top-2 left-2 w-4 h-4 text-blue-200 rotate-180" />
                    <p className="text-sm font-medium text-gray-700 leading-relaxed text-center px-4">"{profile.bio}"</p>
                    <Quote className="absolute bottom-2 right-2 w-4 h-4 text-blue-200" />
                  </div>
                )}
                <div className="mt-6 space-y-3.5 text-left border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Phone className="w-4 h-4" /></div>
                    <span className="tracking-wide">{profile.phone || "연락처 미등록"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Printer className="w-4 h-4" /></div>
                    <span className="tracking-wide">{profile.fax || "팩스 미등록"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Mail className="w-4 h-4" /></div>
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5"><MapPin className="w-4 h-4" /></div>
                    <span className="leading-snug">{profile.office_address || "주소 미등록"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleKakaoShare} className="cursor-pointer w-full bg-[#FEE500] hover:bg-[#FADA0A] text-[#000000] rounded-2xl py-4 flex items-center justify-center gap-2 font-black text-[15px] shadow-lg transition-transform active:scale-95">
                <MessageCircle className="w-5 h-5 fill-black" /> 카카오톡으로 명함 전송하기
              </button>
              <div className="flex gap-2">
                <button onClick={() => window.open(`/card/${profile?.id}`, '_blank')} className="cursor-pointer flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-colors">
                  <ExternalLink className="w-4 h-4" /> 미리보기
                </button>
                <button onClick={() => setIsCardModalOpen(false)} className="cursor-pointer flex-1 bg-gray-800 hover:bg-gray-900 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-colors">
                  <X className="w-4 h-4" /> 닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⭐️ 확장된 팀원 전체 정보 수정 모달 (크기를 키우고 스크롤 가능하게 처리) */}
      {editingMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in" onClick={() => setEditingMember(null)}>
          <div className="bg-gray-50 rounded-[2rem] w-full max-w-4xl max-h-[95vh] overflow-y-auto relative shadow-2xl" onClick={e => e.stopPropagation()}>
            
            {/* 고정된 상단 헤더 & 저장 버튼 */}
            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-t-[2rem]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-gray-900">
                    <span className="text-blue-600">{editingMember.name}</span> 팀원 전체 관리
                  </h3>
                  <p className="text-xs text-gray-500 font-bold mt-0.5">권한: 관리자 (모든 정보 수정 가능)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleSaveMember} 
                  disabled={isMemberSaving}
                  className="cursor-pointer flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-6 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isMemberSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isMemberSaving ? "저장 중..." : "수정 완료"}
                </button>
                <button onClick={() => setEditingMember(null)} className="cursor-pointer p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0 border border-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              
              {/* 1. 기본 정보 설정 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h4 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" /> 1. 기본 정보 설정
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">이름</label>
                      <input type="text" value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">나만의 타이틀</label>
                      <input type="text" value={editingMember.identity || ''} onChange={e => setEditingMember({...editingMember, identity: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">직급</label>
                      <input type="text" value={editingMember.rank} onChange={e => setEditingMember({...editingMember, rank: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">휴대폰 번호</label>
                      <input type="text" value={editingMember.phone} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">팩스 번호</label>
                      <input type="text" value={editingMember.fax || ''} onChange={e => setEditingMember({...editingMember, fax: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">사무실 주소</label>
                      <input type="text" value={editingMember.office_address || ''} onChange={e => setEditingMember({...editingMember, office_address: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">프로필 한 줄 소개 / 철학 (최대 20자)</label>
                      <input type="text" value={editingMember.bio || ''} maxLength={20} onChange={e => setEditingMember({...editingMember, bio: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 전문 컨설팅 포커스 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> 2. 전문 컨설팅 포커스
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-col gap-2">
                    {editingMember.skills.length === 0 && <p className="text-xs text-gray-400 text-center py-2">등록된 전문 분야가 없습니다.</p>}
                    {editingMember.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex-1 pr-4">
                          <span className="text-sm font-bold text-gray-800">{skill.name}</span>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full" style={{width: `${skill.score}%`}}></div>
                          </div>
                        </div>
                        <button onClick={() => handleModalRemoveSkill(idx)} className="cursor-pointer p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-200">
                    <input type="text" placeholder="키워드 입력" value={modalNewSkillName} onChange={e => setModalNewSkillName(e.target.value)} className={`${inputClass} flex-1`} />
                    <div className="flex gap-2">
                      <select value={modalNewSkillScore} onChange={e => setModalNewSkillScore(Number(e.target.value))} className={`${inputClass} w-28`}>
                        <option value="98">최상(98%)</option>
                        <option value="90">상(90%)</option>
                        <option value="80">중상(80%)</option>
                      </select>
                      <button onClick={handleModalAddSkill} className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-4 rounded-lg font-bold text-sm transition-colors whitespace-nowrap">추가</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 주요 약력 및 증명 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" /> 3. 주요 약력 및 증명 (타임라인)
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-col gap-2">
                    {editingMember.careers.length === 0 && <p className="text-xs text-gray-400 text-center py-2">등록된 약력이 없습니다.</p>}
                    {editingMember.careers.map((career, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                        <span className="text-xs font-black text-blue-600 w-10 text-center">{career.year}</span>
                        <span className="text-sm font-bold text-gray-800 flex-1">{career.desc}</span>
                        <button onClick={() => handleModalRemoveCareer(idx)} className="cursor-pointer p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-200">
                    <input type="text" placeholder="연도(2024)" value={modalNewCareerYear} onChange={e => setModalNewCareerYear(e.target.value)} className={`${inputClass} sm:w-24 text-center`} maxLength={4} />
                    <div className="flex gap-2 flex-1">
                      <input type="text" placeholder="약력 내용" value={modalNewCareerDesc} onChange={e => setModalNewCareerDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleModalAddCareer()} className={`${inputClass} flex-1`} />
                      <button onClick={handleModalAddCareer} className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-4 rounded-lg font-bold text-sm transition-colors whitespace-nowrap">추가</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. 보험사별 전속 코드(사번) 관리 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" /> 4. 보험사별 전속 코드(사번) 관리
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {modalSortedCompanyCodes.length === 0 ? (
                      <div className="col-span-full py-3 text-center text-xs text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
                        등록된 보험사 코드가 없습니다.
                      </div>
                    ) : (
                      modalSortedCompanyCodes.map(([company, data]) => (
                        <div key={company} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                          <div className="flex flex-col pr-2">
                            <span className="text-[11px] font-bold text-gray-500">{company}</span>
                            <span className="text-sm font-black text-gray-900">{data.code}</span>
                            {data.password && <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><KeyRound className="w-2.5 h-2.5" /> {data.password}</span>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleModalEditCompanyCode(company)} className="cursor-pointer p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleModalRemoveCompanyCode(company)} className="cursor-pointer p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-4 border-t border-slate-200">
                    <div className="sm:col-span-4">
                      <input type="text" list="modal-company-list" placeholder="보험사명" value={modalNewCompany} onChange={e => setModalNewCompany(e.target.value)} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500" />
                      <datalist id="modal-company-list">{sortedInsuranceCompanies.map(c => <option key={c.company_name} value={c.company_name} />)}</datalist>
                    </div>
                    <div className="sm:col-span-3">
                      <input type="text" placeholder="사번(코드)" value={modalNewCompanyCode} onChange={e => setModalNewCompanyCode(e.target.value)} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 font-medium" />
                    </div>
                    <div className="sm:col-span-3">
                      <input type="text" placeholder="비밀번호" value={modalNewCompanyPassword} onChange={e => setModalNewCompanyPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleModalAddCompanyCode()} className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 font-medium" />
                    </div>
                    <div className="sm:col-span-2">
                      <button onClick={handleModalAddCompanyCode} className="cursor-pointer w-full h-full bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-2 py-2 text-sm font-bold flex items-center justify-center gap-1 transition-colors"><Plus className="w-3.5 h-3.5" /> 추가</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}