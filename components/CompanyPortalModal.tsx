"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  X, Monitor, Headset, PhoneCall, HandHelping, 
  Printer, FileSearch, FileText, ChevronRight,
  Lock, Copy, Eye, EyeOff, CheckCircle2,
  Smartphone
} from "lucide-react";
import QuickClaimModal from "@/components/QuickClaimModal";

const SUPPORTED_COMPANIES = [
  "흥국생명", "라이나생명",
  "메리츠화재", "현대해상", "DB손해", "삼성화재", "한화손해", "KB손해"
];

export type CompanyData = {
  id: string;
  name: string;
  type: "손해보험" | "생명보험" | "기타";
  logoUrl?: string;
  browser?: string;
  portalUrl?: string;
  termsUrl?: string;
  claimUrl?: string;
  phones: { customer: string; inbound: string; helpdesk: string; fax: string; };
  cardInfo: { inquiry: string; method: string; apply: string; target: string; partners: string; };
};

interface CompanyPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData | null;
  targetAgentId: string | null;     
  targetAgentName: string | null;   
  isOS: boolean;                    
}

export default function CompanyPortalModal({ isOpen, onClose, company, targetAgentId, targetAgentName, isOS }: CompanyPortalModalProps) {
  
  const [creds, setCreds] = useState<{ login_id: string; login_pw: string; birth_date?: string } | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  
  const isSupported = company ? SUPPORTED_COMPANIES.some(c => company.name.includes(c)) : false;

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!company || !targetAgentId) {
        setCreds(null);
        return;
      }
      setShowPw(false); 

      const { data, error } = await supabase
        .from("agents")
        .select("company_codes")
        .eq("id", targetAgentId)
        .single();

      if (!error && data && data.company_codes) {
        const companyInfo = (data.company_codes as Record<string, any>)[company.name];

        if (companyInfo) {
          setCreds({
            login_id: companyInfo.id || companyInfo.login_id || companyInfo.code || "",
            login_pw: companyInfo.pw || companyInfo.password || companyInfo.login_pw || "",
            birth_date: companyInfo.birth || companyInfo.birth_date || ""
          });
        } else {
          setCreds(null); 
        }
      } else {
        setCreds(null); 
      }
    };

    fetchCredentials();
  }, [company, targetAgentId]);

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen || !company) return null;

  // ⭐️ 전산망 주소가 비어있거나 "-" 인 경우 판단
  const isPortalDisabled = !company.portalUrl || company.portalUrl.trim() === "-" || company.portalUrl.trim() === "";

  return (
    <div className="lg:static lg:inset-auto lg:bg-transparent lg:p-0 lg:backdrop-blur-none fixed inset-0 z-[100] flex items-center justify-center p-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 h-full w-full">
      <div className="bg-white rounded-none lg:shadow-none shadow-2xl lg:border-none w-full max-w-full h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 lg:slide-in-from-right-4 duration-300">
        
        {/* 헤더: 로고 + 이름 */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 p-1">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-sm font-black text-slate-400">{company.name.substring(0, 1)}</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{company.type}</p>
              <h3 className="font-black text-lg text-slate-800 leading-none">{company.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 (스크롤 영역) */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* 1. 메인 전산 접속 버튼 (값이 없을 땐 비활성화) */}
          {isPortalDisabled ? (
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="bg-slate-200 p-2 rounded-xl">
                  <Monitor className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-slate-400">전산망 바로가기</span>
                  <span className="text-[11px] text-slate-400 font-bold">※ 등록된 전산 주소가 없습니다</span>
                </div>
              </div>
            </div>
          ) : company.browser === 'chrome' ? (
            <a 
              href={company.portalUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-between p-5 bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md shadow-blue-200 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-white">보험사 전산망 바로가기</span>
                  <span className="text-[11px] text-blue-200 font-bold">※ 크롬(Chrome) 또는 기본 브라우저로 열립니다</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </a>
          ) : (
            <a 
              href={`microsoft-edge:${company.portalUrl}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-between p-5 bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-md shadow-emerald-200 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-white">보험사 전산망 바로가기</span>
                  <span className="text-[11px] text-emerald-200 font-bold">※ 엣지(Edge) 브라우저로 강제 실행됩니다</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </a>
          )}

          {/* 2. 접속 계정 정보 패널 */}
          <div className="bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-700 flex flex-col h-[216px]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" /> 전산망 접속 계정
              </h4>
              {isOS && targetAgentName && (
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-1 rounded-md border border-indigo-400/30">
                  {targetAgentName} FC 대리 열람
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {!targetAgentId ? (
                <div className="py-6 text-center text-sm font-medium text-slate-400 bg-slate-900/50 rounded-xl border border-slate-700">
                  좌측에서 대상 FC를 먼저 선택해주세요.
                </div>
              ) : creds ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 mb-0.5">아이디 / 사번</span>
                      <span className="text-sm font-bold text-slate-200 tracking-wide">{creds.login_id}</span>
                    </div>
                    <button onClick={() => handleCopy(creds.login_id, 'id')} className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white cursor-pointer">
                      {copiedField === 'id' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 mb-0.5">비밀번호</span>
                      <span className="text-sm font-bold text-slate-200 tracking-wide font-mono">
                        {showPw ? creds.login_pw : '••••••••'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setShowPw(!showPw)} className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white cursor-pointer">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleCopy(creds.login_pw, 'pw')} className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white cursor-pointer">
                        {copiedField === 'pw' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {creds.birth_date && (
                    <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 mb-0.5">생년월일 (6자리)</span>
                        <span className="text-sm font-bold text-slate-200 tracking-wide">{creds.birth_date}</span>
                      </div>
                      <button onClick={() => handleCopy(creds.birth_date!, 'birth')} className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white cursor-pointer">
                        {copiedField === 'birth' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center flex flex-col items-center bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-[13px] font-medium text-slate-400">등록된 계정 정보가 없습니다.</p>
                  <p className="text-[11px] text-slate-500 mt-1">마이페이지에서 보험사 전산 계정을 입력해주세요.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. 연락처 섹션 */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-800 px-1">📞 업무 연락처</h4>
            <div className="grid grid-cols-2 gap-3">
              
              {/* 고객 센터 */}
              {(() => {
                const isDisabled = !company.phones.customer || company.phones.customer === "-";
                return (
                  <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-center ${isDisabled ? 'bg-slate-50 border-slate-200' : 'bg-white border-gray-100'}`}>
                    <span className={`text-[11px] font-bold mb-1 flex items-center gap-1.5 ${isDisabled ? 'text-slate-400' : 'text-gray-500'}`}>
                      <Headset className="w-3.5 h-3.5" /> 고객 센터
                    </span>
                    <span className={`font-black ${isDisabled ? 'text-slate-400' : 'text-base text-slate-800'}`}>
                      {company.phones.customer}
                    </span>
                  </div>
                );
              })()}

              {/* 인콜 모니터링 */}
              {(() => {
                const isDisabled = !company.phones.inbound || company.phones.inbound === "-";
                return (
                  <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-center ${isDisabled ? 'bg-slate-50 border-slate-200' : 'bg-white border-gray-100'}`}>
                    <span className={`text-[11px] font-bold mb-1 flex items-center gap-1.5 ${isDisabled ? 'text-slate-400' : 'text-gray-500'}`}>
                      <PhoneCall className="w-3.5 h-3.5" /> 인콜 모니터링
                    </span>
                    <span className={`font-black ${isDisabled ? 'text-slate-400' : 'text-base text-slate-800'}`}>
                      {company.phones.inbound}
                    </span>
                  </div>
                );
              })()}

              {/* 헬프데스크 */}
              {(() => {
                const isDisabled = !company.phones.helpdesk || company.phones.helpdesk === "-";
                return (
                  <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-center ${isDisabled ? 'bg-slate-50 border-slate-200' : 'bg-white border-gray-100'}`}>
                    <span className={`text-[11px] font-bold mb-1 flex items-center gap-1.5 ${isDisabled ? 'text-slate-400' : 'text-gray-500'}`}>
                      <HandHelping className="w-3.5 h-3.5" /> 헬프데스크
                    </span>
                    <span className={`font-black ${isDisabled ? 'text-slate-400' : 'text-base text-slate-800'}`}>
                      {company.phones.helpdesk}
                    </span>
                  </div>
                );
              })()}
              
              {/* 청구 팩스 */}
              {(() => {
                const isDisabled = !company.phones.fax || company.phones.fax === "-" || company.phones.fax.includes("가상팩스");
                return (
                  <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-center ${isDisabled ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100'}`}>
                    <span className={`text-[11px] font-bold mb-1 flex items-center gap-1.5 ${isDisabled ? 'text-slate-400' : 'text-red-600'}`}>
                      <Printer className="w-3.5 h-3.5" /> 청구 팩스
                    </span>
                    <span className={`font-black ${isDisabled ? 'text-slate-400' : 'text-base text-red-700'}`}>
                      {company.phones.fax}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 4. 약관 및 청구 업무 */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-800 px-1">📄 약관 및 청구</h4>
            <div className="flex flex-col gap-2 w-full pb-2">
              
              <div className="flex gap-2 w-full">
                {/* 약관 조회 */}
                <a 
                  href={company.termsUrl || "#"} 
                  target={company.termsUrl ? "_blank" : "_self"} 
                  rel="noreferrer" 
                  className={`flex-1 flex items-center justify-center gap-2 px-2 py-3 rounded-xl border text-sm font-bold transition-colors ${
                    company.termsUrl 
                      ? 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50 text-gray-700 cursor-pointer' 
                      : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <FileSearch className={`w-4 h-4 shrink-0 ${company.termsUrl ? 'text-teal-600' : 'text-slate-300'}`} /> 
                  <span className="truncate">약관 조회</span>
                </a>
                
                {/* 대리 청구서 작성 */}
                <button 
                  onClick={() => isSupported && setIsClaimModalOpen(true)}
                  disabled={!isSupported}
                  className={`flex-1 flex items-center justify-center gap-2 px-2 py-3 rounded-xl border text-sm font-bold transition-colors ${
                    isSupported 
                      ? 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50 text-gray-700 cursor-pointer' 
                      : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <FileText className={`w-4 h-4 shrink-0 ${isSupported ? 'text-teal-600' : 'text-slate-300'}`} /> 
                  <span className="truncate">보험금 청구서</span>
                </button>
              </div>

              {/* 고객 직접 청구 (모바일/웹) */}
              {company.claimUrl ? (
                <a 
                  href={company.claimUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="relative w-full flex items-center justify-center gap-2 bg-orange-50 px-4 py-3 rounded-xl border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors cursor-pointer text-sm font-bold text-orange-700 group"
                >
                  <Smartphone className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>모바일/웹 직접 청구</span>
                  <ChevronRight className="absolute right-4 w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <div className="relative w-full flex items-center justify-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-sm font-bold text-slate-400 cursor-not-allowed">
                  <Smartphone className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>모바일/웹 직접 청구 미지원</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. 카드납 정보 */}
          <div className="space-y-3 pb-8">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">💳 카드납 수납 규정</h4>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4 border-b border-gray-50">
                <span className="w-16 shrink-0 text-xs font-bold text-gray-400">결제구분</span>
                <span className="text-sm font-bold text-slate-800">{company.cardInfo.inquiry}</span>
              </div>
              <div className="flex items-center gap-4 p-4 border-b border-gray-50">
                <span className="w-16 shrink-0 text-xs font-bold text-gray-400">수납방법</span>
                <span className="text-sm font-bold text-slate-800">{company.cardInfo.method}</span>
              </div>
              {company.cardInfo.apply && company.cardInfo.apply !== '-' && (
                <div className="flex items-center gap-4 p-4 border-b border-gray-50 bg-amber-50/30">
                  <span className="w-16 shrink-0 text-xs font-bold text-gray-400">신청방법</span>
                  <span className="text-sm font-bold text-slate-800">{company.cardInfo.apply}</span>
                </div>
              )}
              <div className="flex items-center gap-4 p-4 border-b border-gray-50 bg-slate-50/50">
                <span className="w-16 shrink-0 text-xs font-bold text-gray-400">카드범위</span>
                <span className="text-sm font-bold text-slate-800">{company.cardInfo.target}</span>
              </div>
              <div className="flex items-start gap-4 p-4">
                <span className="w-16 shrink-0 text-xs font-bold text-gray-400 pt-0.5">제휴카드</span>
                <span className="text-sm font-bold text-slate-800 leading-relaxed">{company.cardInfo.partners}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* ⭐️ 청구서 작성 모달 */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-[200]">
          <QuickClaimModal 
            isOpen={isClaimModalOpen}
            onClose={() => setIsClaimModalOpen(false)}
            client={{ name: "", phone: "", registration_number: "" }}
            insurance={{ insurance_company: company.name, product_name: "보험금 청구" }}
          />
        </div>
      )}
    </div>
  );
}