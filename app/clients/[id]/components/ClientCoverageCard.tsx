"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Trash2, ChevronDown, ChevronUp, Plus, BarChart3, Edit2, RotateCcw, MinusCircle, TrendingDown, Undo, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InsuranceModal from "@/app/clients/[id]/components/InsuranceModal";

// ⭐️ 금액 포맷팅 유틸리티 함수 (숫자만 추출해서 3자리 콤마 적용 후 텍스트와 결합)
const formatAmount = (val: string) => {
  if (!val) return "";
  const raw = val.replace(/,/g, ""); // 기존 콤마 제거
  const numericPart = raw.match(/\d+/); // 숫자 부분만 추출
  if (numericPart) {
    const formattedNum = Number(numericPart[0]).toLocaleString();
    return raw.replace(numericPart[0], formattedNum);
  }
  return raw;
};

type CoverageDetail = { 
  name: string; 
  amount: string; 
  original_amount?: string; 
  is_deleted?: boolean; 
  renewal_type?: string; 
};

type Coverage = { 
  id: number; 
  insurance_company: string; 
  product_name: string; 
  monthly_premium: number; 
  details: CoverageDetail[] | null; 
  indemnity_generation: string | null; 
  policy_status?: string | null; 
  subscription_date?: string | null; 
  maturity_date?: string | null; 
};

// ⭐️ DB 보험사 타입 추가
type InsuranceCompany = {
  company_type: string;
  company_name: string;
};

const statusTheme: Record<string, { bg: string; border: string; text: string }> = {
  maintain: { bg: "bg-blue-50/30", border: "border-blue-200", text: "text-blue-700" },
  cancel: { bg: "bg-red-50/50", border: "border-red-200", text: "text-red-700" },
  new: { bg: "bg-green-50/40", border: "border-green-200", text: "text-green-700" },
};

export default function ClientCoverageCard({ clientId }: { clientId: string }) {
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [expandedCovId, setExpandedCovId] = useState<number | null>(null);
  const [isCovModalOpen, setIsCovModalOpen] = useState(false);
    // ⭐️ 보험사 목록 리스트 상태
    const [companies, setCompanies] = useState<InsuranceCompany[]>([]);

    // 기본 정보(상품명 등) 수정을 위한 상태
  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);
  const [editingPolicyForm, setEditingPolicyForm] = useState<Partial<Coverage> | null>(null);

  // 특약 수정을 위한 상태
  const [editingDetail, setEditingDetail] = useState<{ covId: number, idx: number, tempName: string, tempAmount: string, tempRenewalType: string, mode: 'edit' | 'reduce' | 'new' } | null>(null);

  const fetchCoverages = async () => {
    const { data } = await supabase.from("subscription_insurance").select("*").eq("client_id", clientId);
    if (data) {
      // ⭐️ 1. 전체 보험 리스트를 '가입일' 순으로 정렬 (오래된 순, 가입일 없으면 뒤로)
      const sortedData = data.sort((a, b) => {
        const dateA = a.subscription_date ? new Date(a.subscription_date).getTime() : Infinity;
        const dateB = b.subscription_date ? new Date(b.subscription_date).getTime() : Infinity;
        return dateA - dateB;
      });

      // ⭐️ 2. 각 보험 내부의 특약 리스트를 '가나다순'으로 정렬
      const processedData = sortedData.map(cov => ({
        ...cov,
        details: cov.details ? [...cov.details].sort((a, b) => a.name.localeCompare(b.name)) : null
      }));
      setCoverages(processedData);
    }
  };

  // ⭐️ 최초 로드 시 보험사 리스트도 함께 패치
  useEffect(() => { 
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("insurance_companies")
        .select("company_type, company_name")
        .order("company_type", { ascending: true })
        .order("company_name", { ascending: true });
      if (data) setCompanies(data);
    };
    
    void fetchCoverages(); 
    void fetchCompanies();
  }, [clientId]);


  const toggleCoverage = (id: number) => {
    // 기본 정보 수정 중일 때는 아코디언 토글 방지
    if (editingPolicyId === id) return;
    setExpandedCovId(prev => (prev === id ? null : id));
  };

  // --- [기본 정보 수정 로직] ---
  const handleStartEditPolicy = (cov: Coverage) => {
    setEditingPolicyId(cov.id);
    setEditingPolicyForm({ ...cov });
    setExpandedCovId(cov.id); // 수정 모드 시 자동으로 열어둠
  };

  const handleSavePolicyEdit = async () => {
    if (!editingPolicyId || !editingPolicyForm) return;
    
    // 금액 포맷팅 제거 후 숫자로 변환
    const cleanPremium = Number(String(editingPolicyForm.monthly_premium).replace(/,/g, ''));

    const { error } = await supabase.from("subscription_insurance").update({
      insurance_company: editingPolicyForm.insurance_company,
      product_name: editingPolicyForm.product_name,
      monthly_premium: cleanPremium,
      subscription_date: editingPolicyForm.subscription_date || null,
      maturity_date: editingPolicyForm.maturity_date || null,
      indemnity_generation: editingPolicyForm.indemnity_generation || null,
    }).eq("id", editingPolicyId);

    if (error) {
      alert("정보 수정에 실패했습니다.");
    } else {
      setEditingPolicyId(null);
      setEditingPolicyForm(null);
      fetchCoverages(); // 재정렬을 위해 다시 패치
    }
  };
  // -------------------------

  const handleDeleteCoverage = async (covId: number) => {
    if (!window.confirm("이 보장 내역을 완전히 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("subscription_insurance").delete().eq("id", covId);
    if (!error) setCoverages(prev => prev.filter(c => c.id !== covId));
  };

  const updatePolicyStatus = async (covId: number, newStatus: string) => {
    setCoverages(prev => prev.map(c => (c.id === covId ? { ...c, policy_status: newStatus } : c)));
    await supabase.from("subscription_insurance").update({ policy_status: newStatus }).eq("id", covId);
  };

  const updateCoverageDetailsInDB = async (covId: number, newDetails: CoverageDetail[]) => {
    // ⭐️ 데이터베이스 업데이트 전 특약 배열을 항상 가나다순으로 정렬 유지
    const sortedDetails = [...newDetails].sort((a, b) => a.name.localeCompare(b.name));
    
    setCoverages(prev => prev.map(c => c.id === covId ? { ...c, details: sortedDetails } : c));
    const { error } = await supabase.from("subscription_insurance").update({ details: sortedDetails }).eq("id", covId);
    if (error) { alert("업데이트 실패"); fetchCoverages(); }
  };

  const handleToggleDetailDelete = async (covId: number, idx: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (!cov || !cov.details) return;
    const newDetails = [...cov.details];
    newDetails[idx] = { ...newDetails[idx], is_deleted: !newDetails[idx].is_deleted };
    await updateCoverageDetailsInDB(covId, newDetails);
  };

  const handlePermanentlyDeleteDetail = async (covId: number, idx: number) => {
    if (!window.confirm("이 특약을 목록에서 완전히 삭제하시겠습니까?")) return;
    const cov = coverages.find(c => c.id === covId);
    if (!cov || !cov.details) return;
    const newDetails = cov.details.filter((_, i) => i !== idx);
    await updateCoverageDetailsInDB(covId, newDetails.length > 0 ? newDetails : []);
  };

  const handleRestoreAmount = async (covId: number, idx: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (!cov || !cov.details) return;
    const newDetails = [...cov.details];
    if (newDetails[idx].original_amount) {
      newDetails[idx].amount = newDetails[idx].original_amount!;
      newDetails[idx].original_amount = undefined; 
      await updateCoverageDetailsInDB(covId, newDetails);
    }
  };

  const handleSaveDetail = async (covId: number, idx: number) => {
    if (!editingDetail) return;
    if (!editingDetail.tempName.trim()) return alert("특약명을 입력해주세요.");
    
    const cov = coverages.find(c => c.id === covId);
    if (!cov || !cov.details) return;
    
    const newDetails = [...cov.details];
    const currentDetail = newDetails[idx];
    
    if (editingDetail.mode === 'reduce') {
      if (currentDetail.amount === editingDetail.tempAmount) {
        setEditingDetail(null);
        return;
      }
      if (!currentDetail.original_amount) {
        currentDetail.original_amount = currentDetail.amount;
      }
      currentDetail.amount = formatAmount(editingDetail.tempAmount);
    } else {
      currentDetail.name = editingDetail.tempName;
      currentDetail.amount = formatAmount(editingDetail.tempAmount);
      currentDetail.renewal_type = editingDetail.tempRenewalType;
      
      if (currentDetail.original_amount && currentDetail.amount === currentDetail.original_amount) {
        currentDetail.original_amount = undefined;
      }
    }
    
    await updateCoverageDetailsInDB(covId, newDetails);
    setEditingDetail(null);
  };

  const handleAddNewDetail = async (covId: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (!cov) return;
    const newDetails = cov.details ? [...cov.details] : [];
    const newIdx = newDetails.length;
    
    newDetails.push({ name: "", amount: "", renewal_type: "비갱신" });
    await updateCoverageDetailsInDB(covId, newDetails);
    
    setEditingDetail({ covId, idx: newIdx, tempName: "", tempAmount: "", tempRenewalType: "비갱신", mode: 'new' });
  };

  const handleCancelEdit = async (covId: number, idx: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (cov && cov.details) {
      const detail = cov.details[idx];
      if (detail.name === "" && detail.amount === "") {
        const newDetails = cov.details.filter((_, i) => i !== idx);
        await updateCoverageDetailsInDB(covId, newDetails);
      }
    }
    setEditingDetail(null);
  };
  // 보험사 목록 필터링
  const lifeInsurances = companies.filter((c) => c.company_type === "생명보험");
  const nonLifeInsurances = companies.filter((c) => c.company_type === "손해보험");


  return (
    <>
      <div className="w-full h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm min-h-0">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <Shield className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">보장 분석 내역</h2>
              <p className="text-xs text-gray-500 mt-0.5">특약을 부분해지, 감액, 삭제하여 비교하세요.</p>
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
                const isPolicyEditing = editingPolicyId === cov.id;
                // 기존 DB에 있던 보험사명이 목록에 없을 경우를 위한 체크
                const isCustomCompany = editingPolicyForm?.insurance_company && !companies.some(c => c.company_name === editingPolicyForm.insurance_company);
                return (
                  <div key={cov.id} className={`relative group rounded-lg border text-sm overflow-hidden flex flex-col transition-colors h-fit ${theme.bg} ${theme.border}`}>
                    
                    {/* ⭐️ 기본 정보 블록 (수정 모드 vs 일반 모드) */}
                    {isPolicyEditing ? (
                      <div className="p-4 bg-white border-b border-gray-200 shadow-inner flex flex-col gap-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-blue-600">기본 정보 수정</span>
                          <div className="flex gap-1.5">
                            <button onClick={handleSavePolicyEdit} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 flex items-center gap-1 font-semibold"><Check className="w-3 h-3"/> 저장</button>
                            <button onClick={() => setEditingPolicyId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-200 flex items-center gap-1 font-semibold"><X className="w-3 h-3"/> 취소</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                    
                          {/* 1. 보험사 셀렉트박스 */}
                          <select 
                            value={editingPolicyForm?.insurance_company || ""} 
                            onChange={e => setEditingPolicyForm({...editingPolicyForm!, insurance_company: e.target.value})} 
                            className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">-- 보험사 선택 --</option>
                            {lifeInsurances.length > 0 && (
                              <optgroup label="[ 생명보험 ]">
                                {lifeInsurances.map((c) => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
                              </optgroup>
                            )}
                            {nonLifeInsurances.length > 0 && (
                              <optgroup label="[ 손해보험 ]">
                                {nonLifeInsurances.map((c) => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
                              </optgroup>
                            )}
                            {/* DB에 없는 커스텀 데이터 보존 */}
                            {isCustomCompany && <option value={editingPolicyForm!.insurance_company}>{editingPolicyForm!.insurance_company}</option>}
                          </select>


                          <input type="text" placeholder="상품명" value={editingPolicyForm?.product_name || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, product_name: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500" />
                          <div className="flex items-center border border-gray-200 rounded p-2 bg-white focus-within:border-blue-500">
                            <input type="text" placeholder="월 보험료" value={formatAmount(String(editingPolicyForm?.monthly_premium || ""))} onChange={e => setEditingPolicyForm({...editingPolicyForm!, monthly_premium: Number(e.target.value.replace(/,/g, ''))})} className="flex-1 w-full outline-none" />
                            <span className="text-gray-400">원</span>
                          </div>
                                                    
                          {/* 2. 실손 세대 셀렉트박스 */}
                          <select 
                            value={editingPolicyForm?.indemnity_generation || ""} 
                            onChange={e => setEditingPolicyForm({...editingPolicyForm!, indemnity_generation: e.target.value})} 
                            className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">실손 세대 (해당 없음)</option>
                            <option value="1세대 실손">1세대 실손 (2009년 9월 이전)</option>
                            <option value="2세대 실손">2세대 실손 (2009년 10월 이후)</option>
                            <option value="3세대 실손">3세대 실손 (2017년 4월 이후)</option>
                            <option value="4세대 실손">4세대 실손 (2021년 7월 이후)</option>
                            <option value="5세대 실손">5세대 실손 (2026년 5월 이후)</option>
                          </select>


                          <input type="date" max="9999-12-31" placeholder="가입일" value={editingPolicyForm?.subscription_date || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, subscription_date: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500" title="가입일" />
                          <input type="date" max="9999-12-31" placeholder="만기일" value={editingPolicyForm?.maturity_date || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, maturity_date: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500" title="만기일" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 pr-14 cursor-pointer hover:bg-black/5 transition-colors" onClick={() => toggleCoverage(cov.id)}>
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
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                <p className="text-gray-600 text-xs truncate flex-1 min-w-0">{cov.product_name}</p>
                                {cov.indemnity_generation && <span className="inline-flex shrink-0 items-center rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 border border-gray-200">{cov.indemnity_generation}</span>}
                              </div>
                              {(cov.subscription_date || cov.maturity_date) && (
                                <p className="text-[11px] font-medium text-gray-400 mt-0.5 flex gap-1.5">
                                  {cov.subscription_date && <span>가입 {cov.subscription_date}</span>}
                                  {cov.subscription_date && cov.maturity_date && <span>|</span>}
                                  {cov.maturity_date && <span>만기 {cov.maturity_date}</span>}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1 shrink-0 mt-0.5">
                            <p className={`font-bold ${currentStatus === 'cancel' ? 'text-gray-400 line-through' : theme.text}`}>{cov.monthly_premium.toLocaleString()}원</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 우측 상단 수정/삭제 툴바 */}
                    {!isPolicyEditing && (
                      <div className="absolute top-2 right-2 flex gap-1.5 z-10 text-right flex flex-col items-end cursor-pointer" onClick={() => toggleCoverage(cov.id)}>
                        <div>
                        <button onClick={(e) => { e.stopPropagation(); handleStartEditPolicy(cov); }} className="text-gray-300 hover:text-blue-500 p-1" title="기본 정보 수정">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCoverage(cov.id); }} className="text-gray-300 hover:text-red-500 p-1 pr-0" title="보장 내역 완전 삭제">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        </div>
                        {expandedCovId === cov.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    )}

                    {expandedCovId === cov.id && !isPolicyEditing && (
                      <div className="border-t border-black/10 bg-white/60 p-3 space-y-3">
                        {cov.details && cov.details.map((detail, idx) => {
                          const isDeleted = detail.is_deleted;
                          const isEditing = editingDetail?.covId === cov.id && editingDetail?.idx === idx;
                          
                          return (
                            <div key={idx} className={`flex flex-col text-xs border-b border-gray-200/50 pb-2 last:border-0 last:pb-0 ${isDeleted ? 'opacity-60 grayscale' : ''}`}>
                              <div className="flex justify-between items-start sm:items-center gap-2">
                                
                                {isEditing ? (
                                  editingDetail.mode === 'reduce' ? (
                                    <div className="flex items-center gap-1.5 w-full flex-wrap sm:flex-nowrap bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                                      <span className="text-gray-700 font-bold truncate flex-1 px-1">{detail.name}</span>
                                      <span className="line-through text-red-400 text-[10px] shrink-0 font-medium">{detail.original_amount || detail.amount} ➔</span>
                                      <input type="text" placeholder="감액 금액" value={formatAmount(editingDetail.tempAmount)} onChange={(e) => setEditingDetail({ ...editingDetail, tempAmount: formatAmount(e.target.value) })} className="border border-purple-300 rounded px-2 py-1.5 w-24 text-right text-xs outline-none focus:border-purple-500 font-bold" autoFocus />만원
                                      <div className="flex gap-1 shrink-0">
                                        <button onClick={() => handleSaveDetail(cov.id, idx)} className="text-purple-600 font-bold bg-white border border-purple-200 px-2 py-1.5 rounded hover:bg-purple-100">적용</button>
                                        <button onClick={() => handleCancelEdit(cov.id, idx)} className="text-gray-500 font-medium bg-gray-100 px-2 py-1.5 rounded hover:bg-gray-200">취소</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 w-full flex-wrap sm:flex-nowrap">
                                      <input type="text" placeholder="특약명" value={editingDetail.tempName} onChange={(e) => setEditingDetail({ ...editingDetail, tempName: e.target.value })} className="border border-blue-300 rounded px-2 py-1.5 flex-1 min-w-[100px] text-xs outline-none focus:border-blue-500" autoFocus={editingDetail.mode === 'new'} />
                                      <input type="text" placeholder="가입 금액" value={formatAmount(editingDetail.tempAmount)} onChange={(e) => setEditingDetail({ ...editingDetail, tempAmount: formatAmount(e.target.value) })} className="border border-blue-300 rounded px-2 py-1.5 w-16 text-right text-xs outline-none focus:border-blue-500" autoFocus={editingDetail.mode === 'edit'} />만원
                                      <select className="border border-blue-300 rounded px-1 py-1.5 w-[48px] text-[10px] outline-none focus:border-blue-500 shrink-0 font-medium text-gray-600 bg-white" value={editingDetail.tempRenewalType} onChange={(e) => setEditingDetail({ ...editingDetail, tempRenewalType: e.target.value })}>
                                        <option value="비갱신">비갱신</option>
                                        <option value="1년 갱신">1년</option>
                                        <option value="3년 갱신">3년</option>
                                        <option value="5년 갱신">5년</option>
                                        <option value="10년 갱신">10년</option>
                                        <option value="15년 갱신">15년</option>
                                        <option value="20년 갱신">20년</option>
                                        <option value="30년 갱신">30년</option>
                                      </select>
                                      <div className="flex gap-1 shrink-0">
                                        <button onClick={() => handleSaveDetail(cov.id, idx)} className="text-blue-600 font-bold bg-blue-50 px-2 py-1.5 rounded hover:bg-blue-100">확인</button>
                                        <button onClick={() => handleCancelEdit(cov.id, idx)} className="text-gray-500 font-medium bg-gray-100 px-2 py-1.5 rounded hover:bg-gray-200">취소</button>
                                      </div>
                                    </div>
                                  )
                                ) : (
                                  <>
                                    <span className={`text-gray-700 truncate flex-1 ${isDeleted ? 'line-through' : 'font-medium'}`}>{detail.name || "-"}</span>
                                    <div className="flex flex-col items-end shrink-0 leading-tight">
                                      {detail.original_amount && detail.original_amount !== detail.amount && !isDeleted && <span className="text-red-400 line-through text-[10px] font-medium">{detail.original_amount}</span>}
                                      
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        {/* ⭐️ 갱신 뱃지 강조 UI */}
                                        {detail.renewal_type && detail.renewal_type !== "비갱신" && !isDeleted ? (
                                          <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-200 px-1 py-0.5 rounded font-bold tracking-tighter whitespace-nowrap">
                                            {detail.renewal_type.replace(' 갱신', '')}
                                          </span>
                                        ) : detail.renewal_type === "비갱신" && !isDeleted && (
                                          <span className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-medium tracking-tighter whitespace-nowrap">
                                            비갱신
                                          </span>
                                        )}
                                        <span className={`font-bold ${isDeleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{detail.amount || "-"}만원</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              {!isEditing && (
                                <div className="flex justify-end gap-2 mt-2">
                                  {isDeleted ? (
                                    <>
                                      <button onClick={() => handleToggleDetailDelete(cov.id, idx)} className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded"><RotateCcw className="w-3 h-3" /> 복구</button>
                                      <button onClick={() => handlePermanentlyDeleteDetail(cov.id, idx)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-500 px-1"><Trash2 className="w-3 h-3" /> 영구삭제</button>
                                    </>
                                  ) : (
                                    <>
                                      {detail.original_amount && (
                                        <button onClick={() => handleRestoreAmount(cov.id, idx)} className="flex items-center gap-1 text-[10px] text-purple-600 font-semibold hover:text-purple-800 px-1 mr-1">
                                          <Undo className="w-3 h-3" /> 감액 취소
                                        </button>
                                      )}
                                      <button onClick={() => setEditingDetail({ covId: cov.id, idx, tempName: detail.name, tempAmount: detail.amount, tempRenewalType: detail.renewal_type || '비갱신', mode: 'edit' })} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-600 px-1">
                                        <Edit2 className="w-3 h-3" /> 수정
                                      </button>
                                      <button onClick={() => setEditingDetail({ covId: cov.id, idx, tempName: detail.name, tempAmount: detail.amount, tempRenewalType: detail.renewal_type || '비갱신', mode: 'reduce' })} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-purple-600 px-1">
                                        <TrendingDown className="w-3 h-3" /> 감액
                                      </button>
                                      <button onClick={() => handleToggleDetailDelete(cov.id, idx)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-orange-500 px-1">
                                        <MinusCircle className="w-3 h-3" /> 부분해지
                                      </button>
                                      <button onClick={() => handlePermanentlyDeleteDetail(cov.id, idx)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-500 px-1">
                                        <Trash2 className="w-3 h-3" /> 삭제
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        <button 
                          onClick={() => handleAddNewDetail(cov.id)} 
                          className="w-full mt-2 py-2 flex justify-center items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-100 border border-dashed border-blue-200 rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" /> 특약 추가하기
                        </button>
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