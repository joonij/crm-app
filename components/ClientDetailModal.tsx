"use client";

import { useState, useEffect } from "react";
import { User, CreditCard, X, ShieldAlert, FileText, MapPin, Briefcase } from "lucide-react";
// ⭐️ 이전에 만든 복호화 서버 액션을 불러옵니다.
import { decryptRegNumber } from "@/app/actions/crypto";

export default function ClientDetailModal({ client, onClose }: { client: any, onClose: () => void }) {
  console.log(client);
  const [decryptedReg, setDecryptedReg] = useState<string | null>(null);

  // ⭐️ 모달이 열릴 때 암호화된 주민번호를 복호화합니다.
  useEffect(() => {
    async function getDecryptedData() {
      if (client?.registration_number) {
        const decrypted = await decryptRegNumber(client.registration_number);
        setDecryptedReg(decrypted);
      }
    }
    getDecryptedData();
  }, [client]);

  if (!client) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 md:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-xl text-gray-900">고객 상세 프로필</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                {client.contract_status?.status || "상태 없음"}
              </span>
              <span className="text-xs text-gray-400">ID: {client.id}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 모달 컨텐츠 (스크롤 영역) */}
        <div className="p-6 overflow-y-auto space-y-8 pb-10">
          
          {/* 1. 기본 인적사항 */}
          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 mb-4">
              <User className="w-4 h-4 text-blue-600" />
              기본 정보
            </h4>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">이름</span>
                <span className="text-sm font-black text-gray-900">{client.name || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">연락처</span>
                <span className="text-sm font-black text-gray-900">{client.phone || "-"}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1">
                  주민등록번호
                </span>
                <span className="text-sm font-black text-gray-900 tracking-widest">
                  {decryptedReg}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">직업</span>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-black text-gray-900">{client.job || "-"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">통신사</span>
                <span className="text-sm font-black text-gray-900">{client.telecom_carriers?.telecom || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">운전여부</span>
                <span className="text-sm font-black text-gray-900">{client.driving_statuses?.status || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">가입경로</span>
                <span className="text-sm font-black text-blue-600">{client.client_source?.source || "-"}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">주소</span>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <span className="text-sm font-black text-gray-900 leading-relaxed">{client.address || "-"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 금융 정보 */}
          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 mb-4">
              <CreditCard className="w-4 h-4 text-blue-600" />
              금융 및 결제 정보
            </h4>
            <div className="bg-slate-900 rounded-2xl p-5 grid grid-cols-2 gap-y-6 gap-x-4 shadow-lg">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">주거래 은행</span>
                <span className="text-sm font-black text-white">{client.bank_lists?.bank || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">결제일</span>
                <span className="text-sm font-black text-white">{client.card_withdrawal_date || "-"}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">계좌번호</span>
                <span className="text-sm font-black text-white tracking-widest">{client.bank_info || "-"}</span>
              </div>
            </div>
          </section>

          {/* 3. 메모 및 특이사항 */}
          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 mb-4">
              <FileText className="w-4 h-4 text-blue-600" />
              상담 메모
            </h4>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-amber-900 leading-relaxed whitespace-pre-wrap italic">
                {client.notes ? `"${client.notes}"` : "등록된 메모가 없습니다."}
              </p>
            </div>
          </section>

          {/* 소개 고객 정보 (있을 경우만 표시) */}
          {client.introduce_client && (
            <section className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">소개인: {client.introduce_client.name}</span>
              <span className="text-[10px] text-gray-400">ID: {client.introduce_client.id}</span>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}