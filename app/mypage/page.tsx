"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Building2, Phone, Mail, LogOut, Camera, Save, Loader2, Award, QrCode, MapPin, Printer, Share2, MessageCircle, X, Quote } from "lucide-react";

type AgentProfile = {
  id: number;
  name: string;
  phone: string;
  email: string;
  bio: string; 
  office_address: string;
  fax: string; // ⭐️ fax_number -> fax 로 변경
  rank: string;
  agent_code: string;
  corporation_name: string;
  branch_name: string;
  team_number: string;
};

export default function MyPage() {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false); 

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    office_address: "",
    fax: "", // ⭐️ fax 로 변경
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // ⭐️ select 문에서도 fax 로 변경
        const { data: agentData, error } = await supabase
          .from("agents")
          .select(`
            id, name, phone, bio, office_address, fax, rank, agent_code,
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
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
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
        fax: form.fax, // ⭐️ fax 업데이트
      })
      .eq("id", profile.id);

    if (error) {
      alert("프로필 저장에 실패했습니다.");
    } else {
      alert("프로필이 성공적으로 업데이트되었습니다.");
      setProfile({ ...profile, ...form });
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    await supabase.auth.signOut();
    window.location.href = "/login"; 
  };

  const handleKakaoShare = () => {
    alert("카카오톡 공유 API가 연동되면, 고객님의 카카오톡으로 세련된 디지털 명함 링크가 전송됩니다!");
  };

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-gray-500">프로필 정보를 불러올 수 없습니다.</div>;
  }

  const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all";

  return (
    <div className="w-full mx-auto max-w-[1000px] space-y-6 p-4 md:p-8 pb-24">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-blue-600" />
          마이페이지
        </h1>
        <p className="mt-2 text-sm text-gray-500">내 프로필 정보와 계정 설정을 관리합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 좌측: 중앙 정렬된 프로필 요약 카드 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden text-center">
            <div className="h-28">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <User className="w-10 h-10 text-gray-400" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                </div>
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
                <button 
                  onClick={() => setIsCardModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-md hover:shadow-lg"
                >
                  <QrCode className="w-4 h-4 text-blue-300" /> 모바일 명함 확인 및 전송
                </button>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl py-3 text-sm font-bold transition-colors">
                  <LogOut className="w-4 h-4" /> 로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 정보 수정 폼 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-400" /> 기본 정보 설정
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">이름</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">휴대폰 번호</label>
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="010-0000-0000" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">팩스</label>
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
                  <input 
                    type="text" 
                    value={form.office_address} 
                    onChange={e => setForm({...form, office_address: e.target.value})} 
                    placeholder="사무실 주소를 입력해주세요."
                    className={`${inputClass} pl-9`} 
                  />
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

              <div className="pt-4 flex justify-end border-t border-gray-100 mt-2">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  내 정보 저장
                </button>
              </div>
            </div>
          </div>

          {/* 소속 및 직급 정보 (Read-Only) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" /> 소속 및 보안 정보
            </h3>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">소속 대리점 / 본부</span>
                <p className="text-sm font-bold text-gray-800">{profile.corporation_name || "-"}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">지점 / 팀</span>
                <p className="text-sm font-bold text-gray-800">{profile.branch_name || "-"} {profile.team_number ? `${profile.team_number}팀` : ""}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">현재 직급</span>
                <p className="text-sm font-bold text-gray-800">{profile.rank}</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">설계사 사번(코드)</span>
                <p className="text-sm font-black text-blue-600 tracking-wider">{profile.agent_code || "-"}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ⭐️ 중앙 정렬된 모바일 디지털 명함 미리보기 모달 */}
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
              <div className="h-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-5 right-5 text-white/50 border border-white/30 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
                  Digital Card
                </div>
              </div>
              
              <div className="relative px-6 pb-6">
                {/* ⭐️ 디지털 명함의 사진도 '둥근 사각형(rounded-2xl)' 으로 변경 */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-2xl p-1.5 shadow-xl">
                  <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                    <User className="w-10 h-10 text-gray-300" />
                  </div>
                </div>

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
                    {/* ⭐️ fax 로 렌더링 */}
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