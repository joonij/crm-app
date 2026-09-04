"use client";

import { 
  X, Monitor, Headset, PhoneCall, HandHelping, 
  Printer, FileSearch, FileText, CreditCard, ChevronRight
} from "lucide-react";

export type CompanyData = {
  id: string;
  name: string;
  type: "손해보험" | "생명보험" | "기타";
  logoUrl?: string;
  portalUrl?: string;
  phones: {
    customer: string;
    inbound: string;
    helpdesk: string;
    fax: string;
  };
  cardInfo: {
    inquiry: string;
    method: string;
    target: string;
    partners: string;
  };
};

interface CompanyPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData | null;
}

export default function CompanyPortalModal({ isOpen, onClose, company }: CompanyPortalModalProps) {
  if (!isOpen || !company) return null;

  return (
    // ⭐️ 핵심: lg: 이상에서는 투명 배경의 static 패널로 작동, 모바일에서는 fixed 모달로 작동!
    <div className="lg:static lg:inset-auto lg:bg-transparent lg:p-0 lg:backdrop-blur-none fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 h-full w-full">
      <div className="bg-white lg:rounded-3xl rounded-2xl lg:shadow-[0_8px_30px_rgba(0,0,0,0.08)] shadow-2xl lg:border lg:border-gray-200 w-full max-w-md lg:max-w-full h-full lg:h-full flex flex-col overflow-hidden animate-in zoom-in-95 lg:zoom-in-100 lg:slide-in-from-right-4 duration-300">
        
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
          
          {/* 1. 메인 전산 버튼 (가장 크게 강조) */}
          <a href={company.portalUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md shadow-blue-200 transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-black text-white">보험사 전산망 바로가기</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </a>

          {/* 2. 연락처 섹션 */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-800 px-1">📞 업무 연락처</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <span className="text-[11px] font-bold text-gray-500 mb-1 flex items-center gap-1.5"><Headset className="w-3.5 h-3.5" /> 고객 센터</span>
                <span className="text-base font-black text-slate-800">{company.phones.customer}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <span className="text-[11px] font-bold text-gray-500 mb-1 flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" /> 인콜 모니터링</span>
                <span className="text-base font-black text-slate-800">{company.phones.inbound}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <span className="text-[11px] font-bold text-gray-500 mb-1 flex items-center gap-1.5"><HandHelping className="w-3.5 h-3.5" /> 헬프데스크</span>
                <span className="text-base font-black text-slate-800">{company.phones.helpdesk}</span>
              </div>
              {/* 팩스번호는 붉은색 강조 */}
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-center">
                <span className="text-[11px] font-bold text-red-600 mb-1 flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" /> 청구 팩스</span>
                <span className="text-base font-black text-red-700">{company.phones.fax}</span>
              </div>
            </div>
          </div>

          {/* 3. 문서 및 양식 (가로 스크롤 가능한 버튼들) */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-800 px-1">📄 업무 서식</h4>
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              <button className="shrink-0 flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors cursor-pointer text-sm font-bold text-gray-700">
                <FileSearch className="w-4 h-4 text-teal-600" /> 약관 조회
              </button>
              <button className="shrink-0 flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors cursor-pointer text-sm font-bold text-gray-700">
                <FileText className="w-4 h-4 text-teal-600" /> 일반 청구서
              </button>
              <button className="shrink-0 flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors cursor-pointer text-sm font-bold text-gray-700">
                <FileText className="w-4 h-4 text-teal-600" /> 치아 청구서
              </button>
            </div>
          </div>

          {/* 4. 카드납 정보 */}
          <div className="space-y-3">
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
    </div>
  );
}