import { X, AlertCircle, Building2, User } from "lucide-react";
import Link from "next/link";

export default function PendingContractsModal({ isOpen, onClose, events, date }: { isOpen: boolean, onClose: () => void, events: any[], date: string }) {
  if (!isOpen) return null;

  const totalPremium = events.reduce((sum, e) => sum + (e.premium || 0), 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm md:p-4 pt-24 animate-in fade-in">
      {/* ⭐️ 리스트가 길어지므로 모달창의 최대 너비를 max-w-lg -> max-w-2xl 로 더 넓혔습니다 */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh] overflow-hidden">
        
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b px-5 py-4 bg-orange-50 shrink-0">
          <h3 className="font-black text-lg text-orange-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            계약 예정 모아보기
          </h3>
          <button onClick={onClose} className="text-orange-400 hover:text-orange-600 p-1 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 날짜 및 총 요약 */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <span className="font-bold text-slate-600 text-sm">{date} 예정 건</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">총 {events.length}건 /</span>
            <span className="font-black text-orange-600 text-lg tracking-tight">{totalPremium.toLocaleString()}원</span>
          </div>
        </div>

        {/* ⭐️ 한 줄 리스트 형태의 본문 영역 */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 bg-slate-50/50">
          {events.map(evt => (
            <div key={evt.id} className="bg-white p-3 rounded-xl border border-slate-200 hover:border-orange-400 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors group">
              
              {/* 좌측: 담당FC + 고객명 + ⭐️ 보험사/상품명 */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-[11px] font-extrabold px-2 py-1 rounded-md bg-slate-100 text-slate-600 shrink-0 text-center min-w-[50px]">
                  {evt.ownerName}
                </span>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
                  {/* 고객명 */}
                  <span className="font-bold text-slate-800 text-[13px] shrink-0 flex items-center gap-1">
                    {evt.clients?.insured_name || evt.clients?.contractor_name || evt.clients?.name}
                    {evt.clients?.contractor_name && evt.clients?.contractor_name !== evt.clients?.insured_name && (
                      <span className="text-[10px] text-slate-400 font-medium tracking-tight">/계:{evt.clients?.contractor_name}</span>
                    )}
                  </span>
                  
                  {/* ⭐️ 보험사 + 상품명 (evt.content 에 저장되어 있습니다) */}
                  <span className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.content}</span>
                  </span>
                </div>
              </div>

              {/* 우측: 금액 + 프로필 이동 버튼 */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100 mt-1 sm:mt-0">
                <span className="font-black text-orange-600 text-sm tracking-tight">
                  {evt.premium?.toLocaleString()}<span className="font-normal text-[11px] text-orange-500 ml-0.5">원</span>
                </span>
                
                {evt.client_id && (
                  <Link 
                    href={`/clients/${evt.client_id}`}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    <User className="w-3.5 h-3.5" /> 프로필
                  </Link>
                )}
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}