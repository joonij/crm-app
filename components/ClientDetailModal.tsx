"use client";

import { User, CreditCard, X } from "lucide-react";

// ⭐️ 가입경로 매핑 딕셔너리
const clientSourceMap: Record<string, string> = {
  "1": "본인",
  "2": "지인",
  "3": "소개",
  "4": "DB",
  "5": "돌방",
  "6": "소모임",
};

// 타입스크립트 에러 방지를 위해 간단한 props 타입 정의
export default function ClientDetailModal({ client, onClose }: { client: any, onClose: () => void }) {
  if (!client) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 transition-opacity"
      onClick={onClose} // ⭐️ 모달 바깥쪽(어두운 배경) 클릭 시 창 닫기
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 md:zoom-in-95"
        onClick={(e) => e.stopPropagation()} // ⭐️ 모달 안쪽 클릭 시 닫히는 현상 방지
      >
        {/* 모달 헤더 */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl md:rounded-t-2xl shrink-0">
          <h3 className="font-bold text-lg text-gray-900">고객 상세 정보</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 컨텐츠 (스크롤 영역) */}
        <div className="p-5 overflow-y-auto space-y-6 pb-safe">
          
          {/* 1. 기본 인적사항 그룹 */}
          <section>
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 px-1">
              <User className="w-4 h-4 text-blue-600" />
              기본 인적사항
            </h4>
            <div className="bg-gray-50/80 rounded-xl p-4 grid grid-cols-2 gap-y-5 gap-x-4 border border-gray-100">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">이름</span>
                <span className="text-sm font-bold text-gray-900">{client.name || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">연락처</span>
                <span className="text-sm font-bold text-gray-900">{client.phone || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">가입경로</span>
                <span className="text-sm font-bold text-blue-600">
                  {/* 숫자("5")를 한글("돌방")로 변환하여 출력 */}
                  {clientSourceMap[String(client.client_source)] || client.client_source || "-"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">소개고객</span>
                <span className="text-sm font-bold text-gray-900">{client.introduce_client || "-"}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">주민번호</span>
                <span className="text-sm font-bold text-gray-900">{client.registration_num || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">직업</span>
                <span className="text-sm font-bold text-gray-900">{client.job || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">통신사</span>
                <span className="text-sm font-bold text-gray-900">{client.telecom_carriers || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">운전여부</span>
                <span className="text-sm font-bold text-gray-900">{client.driving_statuses || "-"}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">주소</span>
                <span className="text-sm font-bold text-gray-900">{client.address || "-"}</span>
              </div>
            </div>
          </section>

          {/* 2. 금융 및 결제 정보 그룹 */}
          <section>
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 px-1">
              <CreditCard className="w-4 h-4 text-blue-600" />
              금융 / 결제 정보
            </h4>
            <div className="bg-gray-50/80 rounded-xl p-4 grid grid-cols-2 gap-y-5 gap-x-4 border border-gray-100">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">은행</span>
                <span className="text-sm font-bold text-gray-900">{client.bank_lists || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">카드출금일</span>
                <span className="text-sm font-bold text-gray-900">{client.card_withdrawal || "-"}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">계좌번호</span>
                <span className="text-sm font-bold text-gray-900 tracking-widest">{client.bank_info || "-"}</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}