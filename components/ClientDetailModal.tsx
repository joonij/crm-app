"use client";

import { User, CreditCard, X, ShieldAlert } from "lucide-react";

export default function ClientDetailModal({ client, onClose }: { client: any, onClose: () => void }) {
  if (!client) return null;

  // ⭐️ 주민등록번호 프론트엔드 노출 방지 (마스킹 처리)
  // DB에서 원본이 오더라도 화면에서는 무조건 뒤 7자리를 * 로 가립니다.
  const formatSecureRegNumber = (regNum?: string) => {
    if (!regNum) return "-";
    const parts = regNum.split("-");
    if (parts.length === 2) {
      return `${parts[0]}-*******`; // 예: 900101-*******
    }
    // 하이픈이 없는 형태일 경우
    if (regNum.length >= 13) {
      return `${regNum.substring(0, 6)}-*******`;
    }
    return "비정상적인 데이터";
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 md:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
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

        {/* 모달 컨텐츠 */}
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
                {/* ⭐️ 외래키 조인 데이터 처리: client_source 테이블의 source 컬럼 */}
                <span className="text-sm font-bold text-blue-600">{client.client_source?.source || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">소개고객</span>
                {/* ⭐️ 자체 조인 데이터 처리: clients 테이블의 name 컬럼 */}
                <span className="text-sm font-bold text-gray-900">{client.introduce_client?.name || "-"}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  주민등록번호 <ShieldAlert className="w-3 h-3 text-red-500" />
                </span>
                {/* ⭐️ 마스킹 함수 적용 */}
                <span className="text-sm font-bold text-gray-900 tracking-widest">{formatSecureRegNumber(client.registration_number)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">직업</span>
                <span className="text-sm font-bold text-gray-900">{client.job || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">통신사</span>
                {/* ⭐️ 외래키 조인 데이터 처리 */}
                <span className="text-sm font-bold text-gray-900">{client.telecom_carriers?.telecom || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">운전여부</span>
                {/* ⭐️ 외래키 조인 데이터 처리 */}
                <span className="text-sm font-bold text-gray-900">{client.driving_statuses?.status || "-"}</span>
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
                {/* ⭐️ 외래키 조인 데이터 처리 */}
                <span className="text-sm font-bold text-gray-900">{client.bank_lists?.bank || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">카드출금일</span>
                <span className="text-sm font-bold text-gray-900">{client.card_withdrawal_date || "-"}</span>
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