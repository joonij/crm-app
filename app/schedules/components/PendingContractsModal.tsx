import { X, AlertCircle, Building2, User } from "lucide-react";
import Link from "next/link";

export default function PendingContractsModal({ isOpen, onClose, events, date }: { isOpen: boolean, onClose: () => void, events: any[], date: string }) {
  if (!isOpen) return null;

  const totalPremium = events.reduce((sum, e) => sum + (e.premium || 0), 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm md:p-4 pt-24 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden">
        
        <div className="flex items-center justify-between border-b px-5 py-4 bg-orange-50 shrink-0">
          <h3 className="font-black text-lg text-orange-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            계약 예정 모아보기
          </h3>
          <button onClick={onClose} className="text-orange-400 hover:text-orange-600 p-1 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <span className="font-bold text-slate-600 text-sm">{date} 예정 건</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">총 {events.length}건 /</span>
            <span className="font-black text-orange-600">{totalPremium.toLocaleString()}원</span>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {events.map(evt => (
            <div key={evt.id} className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-sm flex flex-col gap-2 hover:border-orange-400 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 w-fit">
                    {evt.ownerName} FC
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {evt.clients?.insured_name || evt.clients?.contractor_name || evt.clients?.name}
                    {evt.clients?.contractor_name && evt.clients?.contractor_name !== evt.clients?.insured_name && (
                      <span className="text-xs text-slate-400 font-medium ml-1">/ 계약자: {evt.clients?.contractor_name}</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">계약예정</span>
                  <span className="font-black text-orange-600">{evt.premium?.toLocaleString()}원</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{evt.companyName || evt.content}</span>
              </div>
              
              {evt.client_id && (
                <div className="flex justify-end mt-1">
                  <Link 
                    href={`/clients/${evt.client_id}`}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <User className="w-3 h-3" /> 고객 프로필 이동
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}