"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Trash2, ChevronDown, ChevronUp, Plus, BarChart3, Edit2, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InsuranceModal from "@/app/clients/[id]/components/InsuranceModal";

type CoverageDetail = { name: string; amount: string; original_amount?: string; is_deleted?: boolean; };
type Coverage = { id: number; insurance_company: string; product_name: string; monthly_premium: number; details: CoverageDetail[] | null; indemnity_generation: string | null; policy_status?: string | null; };

const statusTheme: Record<string, { bg: string; border: string; text: string }> = {
  maintain: { bg: "bg-blue-50/30", border: "border-blue-200", text: "text-blue-700" },
  cancel: { bg: "bg-red-50/50", border: "border-red-200", text: "text-red-700" },
  new: { bg: "bg-green-50/40", border: "border-green-200", text: "text-green-700" },
};

export default function ClientCoverageCard({ clientId }: { clientId: string }) {
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [expandedCovId, setExpandedCovId] = useState<number | null>(null);
  const [isCovModalOpen, setIsCovModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<{ covId: number, idx: number, tempAmount: string } | null>(null);

  const fetchCoverages = async () => {
    const { data } = await supabase.from("subscription_insurance").select("*").eq("client_id", clientId).order("created_at", { ascending: true });
    if (data) setCoverages(data);
  };

  useEffect(() => { void fetchCoverages(); }, [clientId]);

  const toggleCoverage = (id: number) => setExpandedCovId(prev => (prev === id ? null : id));

  const handleDeleteCoverage = async (covId: number) => {
    if (!window.confirm("이 보장 내역을 완전히 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("subscription_insurance").delete().eq("id", covId);
    if (!error) setCoverages(prev => prev.filter(c => c.id !== covId));
  };

  const updatePolicyStatus = async (covId: number, newStatus: string) => {
    setCoverages(prev => prev.map(c => (c.id === covId ? { ...c, policy_status: newStatus } : c)));
    const { error } = await supabase.from("subscription_insurance").update({ policy_status: newStatus }).eq("id", covId);
    if (error) { alert("상태 변경 실패"); fetchCoverages(); }
  };

  const updateCoverageDetailsInDB = async (covId: number, newDetails: CoverageDetail[]) => {
    setCoverages(prev => prev.map(c => c.id === covId ? { ...c, details: newDetails } : c));
    const { error } = await supabase.from("subscription_insurance").update({ details: newDetails }).eq("id", covId);
    if (error) { alert("업데이트 실패"); fetchCoverages(); }
  };

  const handleToggleDetailDelete = async (covId: number, idx: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (!cov || !cov.details) return;
    const newDetails = [...cov.details];
    newDetails[idx] = { ...newDetails[idx], is_deleted: !newDetails[idx].is_deleted };
    await updateCoverageDetailsInDB(covId, newDetails);
  };

  const handleSaveDetailAmount = async (covId: number, idx: number) => {
    if (!editingDetail) return;
    const cov = coverages.find(c => c.id === covId);
    if (!cov || !cov.details) return;
    const newDetails = [...cov.details];
    if (!newDetails[idx].original_amount) newDetails[idx].original_amount = newDetails[idx].amount;
    newDetails[idx].amount = editingDetail.tempAmount;
    await updateCoverageDetailsInDB(covId, newDetails);
    setEditingDetail(null);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm min-h-0">
        
        {/* 상단 헤더 영역 (고정) */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <Shield className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">보장 분석 내역</h2>
              <p className="text-xs text-gray-500 mt-0.5">특약을 삭제(제외)하거나 감액하여 비교하세요.</p>
            </div>
          </div>
          
          <div className="flex w-full sm:w-auto gap-2 shrink-0">
            <Link href={`/clients/${clientId}/analysis`} className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
              <BarChart3 className="w-4 h-4" /> 분석표 비교
            </Link>
            <button onClick={() => setIsCovModalOpen(true)} className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100">
              <Plus className="w-4 h-4" /> 보험 추가
            </button>
          </div>
        </div>
        
        {/* ⭐️ 하단 리스트 영역 (독립 스크롤 활성화) */}
        <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 content-start pb-4">
            {coverages.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-400">
                등록된 보장 내역이 없습니다. 우측 상단의 추가 버튼을 눌러주세요.
              </div>
            ) : (
              coverages.map((cov) => {
                const currentStatus = cov.policy_status || "maintain";
                const theme = statusTheme[currentStatus];

                return (
                  <div key={cov.id} className={`relative group rounded-lg border text-sm overflow-hidden flex flex-col transition-colors h-fit ${theme.bg} ${theme.border}`}>
                    <div className="p-3 pr-8 cursor-pointer hover:bg-black/5 transition-colors" onClick={() => toggleCoverage(cov.id)}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900 truncate" title={cov.insurance_company}>{cov.insurance_company}</p>
                            <select
                              value={currentStatus}
                              onChange={(e) => updatePolicyStatus(cov.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className={`text-[11px] font-extrabold rounded px-1.5 py-0.5 border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${theme.text.split('-')[1]}-400 ${theme.bg} ${theme.border} ${theme.text}`}
                            >
                              <option value="maintain">유지</option>
                              <option value="cancel">해지</option>
                              <option value="new">신규 제안</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <p className="text-gray-600 text-xs truncate flex-1 min-w-0">{cov.product_name}</p>
                            {cov.indemnity_generation && <span className="inline-flex shrink-0 items-center rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 border border-gray-200">{cov.indemnity_generation}</span>}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 shrink-0 mt-0.5">
                          <p className={`font-bold ${currentStatus === 'cancel' ? 'text-gray-400 line-through' : theme.text}`}>{cov.monthly_premium.toLocaleString()}원</p>
                          {expandedCovId === cov.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCoverage(cov.id); }} className="absolute top-3 right-2 text-gray-300 hover:text-red-500 z-10 p-1" title="완전 삭제">
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* 특약 세부 내역 */}
                    {expandedCovId === cov.id && cov.details && cov.details.length > 0 && (
                      <div className="border-t border-black/10 bg-white/60 p-3 space-y-3">
                        {cov.details.map((detail, idx) => {
                          const isDeleted = detail.is_deleted;
                          const isEditing = editingDetail?.covId === cov.id && editingDetail?.idx === idx;
                          return (
                            <div key={idx} className={`flex flex-col text-xs border-b border-gray-200/50 pb-2 last:border-0 last:pb-0 ${isDeleted ? 'opacity-60 grayscale' : ''}`}>
                              <div className="flex justify-between items-center gap-2">
                                <span className={`text-gray-700 truncate flex-1 ${isDeleted ? 'line-through' : 'font-medium'}`}>{detail.name || "-"}</span>
                                {isEditing ? (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <input type="text" value={editingDetail.tempAmount} onChange={(e) => setEditingDetail({ ...editingDetail, tempAmount: e.target.value })} className="border border-blue-300 rounded px-1.5 py-1 w-20 text-right text-xs outline-none" autoFocus />
                                    <button onClick={() => handleSaveDetailAmount(cov.id, idx)} className="text-blue-600 font-bold px-1.5">확인</button>
                                    <button onClick={() => setEditingDetail(null)} className="text-gray-400 px-1">취소</button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-end shrink-0 leading-tight">
                                    {detail.original_amount && detail.original_amount !== detail.amount && !isDeleted && <span className="text-red-400 line-through text-[10px]">{detail.original_amount}</span>}
                                    <span className={`font-bold ${isDeleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{detail.amount || "-"}</span>
                                  </div>
                                )}
                              </div>
                              {!isEditing && (
                                <div className="flex justify-end gap-2 mt-1.5">
                                  {isDeleted ? (
                                    <button onClick={() => handleToggleDetailDelete(cov.id, idx)} className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded"><RotateCcw className="w-3 h-3" /> 복구</button>
                                  ) : (
                                    <>
                                      <button onClick={() => setEditingDetail({ covId: cov.id, idx, tempAmount: detail.amount })} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-600 px-1"><Edit2 className="w-3 h-3" /> 감액</button>
                                      <button onClick={() => handleToggleDetailDelete(cov.id, idx)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-500 px-1"><Trash2 className="w-3 h-3" /> 삭제</button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {isCovModalOpen && <InsuranceModal clientId={clientId} onClose={() => setIsCovModalOpen(false)} onSuccess={fetchCoverages} />}
    </>
  );
}