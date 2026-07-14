"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Search, Clock, CheckCircle2, Download, Send, AlertCircle, RefreshCw, FileBox, Loader2 } from "lucide-react";
// ⭐️ 기존 청구 모달창 컴포넌트 경로를 대표님 프로젝트에 맞게 수정해주세요
import QuickClaimModal from "@/components/QuickClaimModal"; 

type ClaimStatus = 'pending' | 'completed' | 'rejected';

interface ClaimRecord {
  id: number;
  created_at: string;
  client_name: string;
  insurance_company: string;
  reason: string;
  status: ClaimStatus;
  pdf_url: string | null;
}

export default function ClaimManagementPage() {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ⭐️ 기존 청구 모달 연동을 위한 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달을 단독으로 띄우기 위한 빈(Dummy) 데이터
  const dummyClient = { id: "0", name: "", phone: "", registration_number: "" };
  const dummyInsurance = { insurance_company: "보험사 미지정", product_name: "청구서 작성", contractor_name: "", insured_name: "", beneficiary_name: "" };

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: agent } = await supabase.from("agents").select("id").eq("auth_id", user.id).single();
      if (agent) {
        // ⭐️ DB에서 청구 내역 불러오기 (가장 최근 청구가 위로 오도록)
        const { data } = await supabase
          .from("claims")
          .select("*")
          .eq("agent_id", agent.id)
          .order("created_at", { ascending: false });
        
        if (data) setClaims(data);
      }
    }
    setIsLoading(false);
  };

  // 진행 상태 변경 함수 (진행중 ↔ 완료 ↔ 보류)
  const toggleStatus = async (id: number, currentStatus: ClaimStatus) => {
    const nextStatus: Record<ClaimStatus, ClaimStatus> = {
      'pending': 'completed',
      'completed': 'rejected',
      'rejected': 'pending'
    };
    const updatedStatus = nextStatus[currentStatus];

    const { error } = await supabase.from("claims").update({ status: updatedStatus }).eq("id", id);
    if (!error) {
      setClaims(claims.map(c => c.id === id ? { ...c, status: updatedStatus } : c));
    }
  };

  // PDF 다운로드 또는 재공유 로직
  const handleDownloadPDF = (url: string | null) => {
    if (!url) return alert("저장된 PDF 파일이 만료되었거나 존재하지 않습니다.");
    window.open(url, '_blank');
  };

  const filteredClaims = claims.filter(c => 
    c.client_name.includes(searchTerm) || c.insurance_company.includes(searchTerm)
  );

  const pendingCount = claims.filter(c => c.status === 'pending').length;
  const completedCount = claims.filter(c => c.status === 'completed').length;

  return (
    <div className="w-full mx-auto max-w-[1000px] space-y-6 p-4 md:p-8 pb-24">
      
      {/* 1. 페이지 헤더 및 통계 대시보드 */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <FileBox className="w-7 h-7 text-blue-600" />
              청구 관리 센터
            </h1>
            
            <p className="mt-2 text-sm text-gray-500 font-medium">고객의 보험금 청구 진행 상황과 PDF 이력을 관리합니다.</p>
          </div>
          {/* ⭐️ 모달 띄우기 버튼 */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-200"
          >
            <Plus className="w-4 h-4" /> 새 청구서 작성
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 mb-1">총 청구 건수</p>
            <p className="text-2xl font-black text-gray-900">{claims.length}<span className="text-sm font-bold text-gray-400 ml-1">건</span></p>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl shadow-sm text-center">
            <p className="text-xs font-bold text-amber-700 mb-1">진행중 (미결)</p>
            <p className="text-2xl font-black text-amber-600">{pendingCount}<span className="text-sm font-bold text-amber-400 ml-1">건</span></p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm text-center">
            <p className="text-xs font-bold text-emerald-700 mb-1">지급 완료</p>
            <p className="text-2xl font-black text-emerald-600">{completedCount}<span className="text-sm font-bold text-emerald-400 ml-1">건</span></p>
          </div>
        </div>
      </div>

      {/* 2. 검색 및 리스트 필터 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="고객 이름이나 보험사로 검색하세요..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* 3. 청구 내역 리스트 (모바일 친화적 카드 UI) */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />데이터를 불러오는 중입니다...</div>
        ) : filteredClaims.length === 0 ? (
          <div className="py-12 text-center text-gray-400 bg-white border border-dashed border-gray-300 rounded-2xl">
            청구 내역이 없습니다. 새 청구서를 작성해보세요!
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div key={claim.id} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2.5">
                  {/* 상태 변경 뱃지 (클릭 시 상태 변경) */}
                  <button onClick={() => toggleStatus(claim.id, claim.status)} className="cursor-pointer transition-transform active:scale-95">
                    {claim.status === 'pending' && <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-1 rounded-md text-[11px] font-black tracking-tight"><Clock className="w-3 h-3" /> 보상 진행중</span>}
                    {claim.status === 'completed' && <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md text-[11px] font-black tracking-tight"><CheckCircle2 className="w-3 h-3" /> 지급 완료</span>}
                    {claim.status === 'rejected' && <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-md text-[11px] font-black tracking-tight"><AlertCircle className="w-3 h-3" /> 보류 / 반려</span>}
                  </button>
                  <span className="text-[11px] font-bold text-gray-400">{new Date(claim.created_at).toLocaleDateString()}</span>
                </div>
                
                <h4 className="font-black text-gray-900 text-base flex items-center gap-2">
                  {claim.client_name} <span className="text-xs font-bold text-gray-400 font-normal border-l border-gray-200 pl-2">{claim.insurance_company}</span>
                </h4>
                <p className="text-sm font-medium text-gray-600 mt-1 truncate">{claim.reason}</p>
              </div>

              {/* 기능 버튼 구역 */}
              <div className="flex gap-2 shrink-0 border-t border-gray-100 md:border-0 pt-3 md:pt-0">
                <button 
                  onClick={() => handleDownloadPDF(claim.pdf_url)}
                  className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> PDF 다운
                </button>
                <button 
                  onClick={() => handleDownloadPDF(claim.pdf_url)}
                  className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 px-3.5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 팩스 재청구
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* 4. 기존 청구 모달 연동 */}
      <QuickClaimModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        client={dummyClient} 
        insurance={dummyInsurance} 
      />

    </div>
  );
}