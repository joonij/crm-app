// ClientCoverageCard.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Trash2, ChevronDown, ChevronUp, Plus, BarChart3, Edit2, RotateCcw, MinusCircle, TrendingDown, Undo, Check, X, PartyPopper, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InsuranceModal from "@/app/clients/[id]/components/InsuranceModal";

// ⭐️ 방금 만든 퀵 청구 모달 불러오기
import QuickClaimModal from "./QuickClaimModal";

// 금액 포맷팅 유틸리티 함수
const formatAmount = (val: string) => {
  if (!val) return "";
  const raw = val.replace(/,/g, ""); 
  const numericPart = raw.match(/\d+/); 
  if (numericPart) {
    const formattedNum = Number(numericPart[0]).toLocaleString();
    return raw.replace(numericPart[0], formattedNum);
  }
  return raw;
};

const COVERAGE_OPTIONS = [
  "실손의료비 상해입원", "실손의료비 질병입원", "실손의료비 상해통원", "실손의료비 질병통원", "실손의료비 상해약제", "실손의료비 질병약제",
  "일반사망 진단비", "재해사망 진단비", "상해사망 진단비", "질병사망 진단비", 
  "재해 후유장해3%↑", "상해 후유장해3%↑", "질병 후유장해3%↑", 
  "재해 후유장해80%↑", "상해 후유장해80%↑", "질병 후유장해80%↑", 
  "일반암 진단비", "고액암 진단비", "유사암 진단비", "소액암 진단비",
  "항암방사선약물 치료비", "암 수술비",
  "뇌산정특례대상 진단비", "뇌혈관질환 진단비", "뇌졸증 진단비", "뇌출혈 진단비",
  "심장산정특례대상 진단비", "허혈성심장질환 진단비", "급성심근경색 진단비",
  "상해수술비", "상해1종 수술비", "상해2종 수술비", "상해3종 수술비", "상해4종 수술비", "상해5종 수술비",
  "질병수술비", "질병1종 수술비", "질병2종 수술비", "질병3종 수술비", "질병4종 수술비", "질병5종 수술비",
  "상해 입원비", "질병 입원비", "상해중환자실 입원비", "질병중환자실 입원비",
  "골절철심제거 수술비", "5대골절 수술비", "골절 수술비", "화상 수술비", "깁스 치료비", "골절부목 치료비(치아파절제외)",
  "통합상해 진단비", "골절 진단비", "화상 진단비",
  "장기요양 1~2등급 진단비", "장기요양 1~3등급 진단비", "장기요양 1~4등급 진단비", "장기요양 1~5등급 진단비", "장기요양 1~인지지원등급 진단비", 
  "장기요양 1~2등급 재가급여", "장기요양 1~3등급 재가급여", "장기요양 1~4등급 재가급여", "장기요양 1~5등급 재가급여", "장기요양 1~인지지원등급 재가급여", 
  "장기요양 1~2등급 시설급여", "장기요양 1~3등급 시설급여", "장기요양 1~4등급 시설급여", "장기요양 1~5등급 시설급여", "장기요양 1~인지지원등급 시설급여", 
  "응급실내원비(비응급)", "응급실내원비(응급)",
  "간병인 사용비", "간병인 지원비",
  "레진", "인레이", "크라운", "임플란트", "보존치료", "보철치료"
];

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
  remodeled_amount?: number | null; 
  details: CoverageDetail[] | null; 
  indemnity_generation: string | null; 
  policy_status?: string | null; 
  subscription_date?: string | null; 
  maturity_date?: string | null;
  contractor?: string | null;
  insured?: string | null;
  beneficiary?: string | null;
  agent_name?: string | null;
  payment_period?: string | null;
};

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
  const [clientData, setClientData] = useState<any>(null); // 모달에 넘겨주기 위한 고객 기본 정보
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [expandedCovId, setExpandedCovId] = useState<number | null>(null);
  const [isCovModalOpen, setIsCovModalOpen] = useState(false);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);

  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);
  const [editingPolicyForm, setEditingPolicyForm] = useState<Partial<Coverage> | null>(null);

  const [reducingPolicyId, setReducingPolicyId] = useState<number | null>(null);
  const [reducingPremium, setReducingPremium] = useState<string>("");

  const [editingDetail, setEditingDetail] = useState<{ covId: number, idx: number, tempName: string, tempAmount: string, tempRenewalType: string, mode: 'edit' | 'reduce' | 'new' } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ⭐️ 퀵 청구 모달 상태
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedClaimIns, setSelectedClaimIns] = useState<Coverage | null>(null);

  const fetchCoverages = async () => {
    const { data } = await supabase.from("subscription_insurance").select("*").eq("client_id", clientId);
    if (data) {
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.subscription_date ? new Date(a.subscription_date).getTime() : Infinity;
        const dateB = b.subscription_date ? new Date(b.subscription_date).getTime() : Infinity;
        return dateA - dateB;
      });

      const processedData = sortedData.map(cov => ({
        ...cov,
        details: cov.details ? [...cov.details].sort((a, b) => a.name.localeCompare(b.name)) : null
      }));
      setCoverages(processedData);
    }
  };

  useEffect(() => { 
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("insurance_companies")
        .select("company_type, company_name")
        .order("company_type", { ascending: true })
        .order("company_name", { ascending: true });
      if (data) setCompanies(data);
    };

    const fetchClient = async () => {
      const { data } = await supabase.from("clients").select("*").eq("id", clientId).single();
      if (data) setClientData(data);
    };
    
    void fetchCoverages(); 
    void fetchCompanies();
    void fetchClient();
  }, [clientId]);

  const toggleCoverage = (id: number) => {
    if (editingPolicyId === id || reducingPolicyId === id) return;
    setExpandedCovId(prev => (prev === id ? null : id));
  };

  // ⭐️ 청구 모달 열기 핸들러
  const handleOpenClaimModal = (cov: Coverage) => {
    setSelectedClaimIns(cov);
    setIsClaimModalOpen(true);
  };

  // (이하 편집/수정/삭제 함수들은 기존과 완전히 동일)
  const handleStartEditPolicy = (cov: Coverage) => {
    setEditingPolicyId(cov.id);
    setEditingPolicyForm({ ...cov });
    setReducingPolicyId(null);
    setExpandedCovId(cov.id);
  };

  const handleStartReducePolicy = (cov: Coverage) => {
    setReducingPolicyId(cov.id);
    setReducingPremium(cov.monthly_premium.toString());
    setEditingPolicyId(null);
  };

  const handleSavePolicyReduce = async (covId: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (!cov) return;
    
    const cleanPremium = Number(reducingPremium.replace(/,/g, ''));
    if (cleanPremium === cov.monthly_premium) {
      setReducingPolicyId(null);
      return;
    }

    const original = cov.remodeled_amount ? cov.remodeled_amount : cov.monthly_premium;

    const { error } = await supabase.from("subscription_insurance").update({
      monthly_premium: cleanPremium,
      remodeled_amount: original
    }).eq("id", covId);

    if (!error) {
      setCoverages(prev => prev.map(c => c.id === covId ? { ...c, monthly_premium: cleanPremium, remodeled_amount: original } : c));
      setReducingPolicyId(null);
    } else {
      alert("보험료 감액 처리에 실패했습니다.");
    }
  };

  const handleRestorePolicyPremium = async (covId: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (!cov || !cov.remodeled_amount) return;

    const { error } = await supabase.from("subscription_insurance").update({
      monthly_premium: cov.remodeled_amount,
      remodeled_amount: null
    }).eq("id", covId);

    if (!error) {
      setCoverages(prev => prev.map(c => c.id === covId ? { ...c, monthly_premium: cov.remodeled_amount!, remodeled_amount: null } : c));
    }
  };

  const handleSavePolicyEdit = async () => {
    if (!editingPolicyId || !editingPolicyForm) return;
    
    const cleanPremium = Number(String(editingPolicyForm.monthly_premium).replace(/,/g, ''));

    const { error } = await supabase.from("subscription_insurance").update({
      insurance_company: editingPolicyForm.insurance_company,
      product_name: editingPolicyForm.product_name,
      monthly_premium: cleanPremium,
      subscription_date: editingPolicyForm.subscription_date || null,
      maturity_date: editingPolicyForm.maturity_date || null,
      indemnity_generation: editingPolicyForm.indemnity_generation || null,
      contractor: editingPolicyForm.contractor || null,
      insured: editingPolicyForm.insured || null,
      beneficiary: editingPolicyForm.beneficiary || null,
      agent_name: editingPolicyForm.agent_name || null,
      payment_period: editingPolicyForm.payment_period || null,
    }).eq("id", editingPolicyId);

    if (error) {
      alert("정보 수정에 실패했습니다.");
    } else {
      setEditingPolicyId(null);
      setEditingPolicyForm(null);
      fetchCoverages();
    }
  };

  const handleDeleteCoverage = async (covId: number) => {
    if (!window.confirm("이 보장 내역을 완전히 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("subscription_insurance").delete().eq("id", covId);
    if (!error) setCoverages(prev => prev.filter(c => c.id !== covId));
  };

  const updatePolicyStatus = async (covId: number, newStatus: string) => {
    setCoverages(prev => prev.map(c => (c.id === covId ? { ...c, policy_status: newStatus } : c)));
    await supabase.from("subscription_insurance").update({ policy_status: newStatus }).eq("id", covId);
  };

  const handleCompletePolicy = async (covId: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (!cov) return;

    if (!window.confirm("이 제안을 최종 체결 처리하시겠습니까?\n가입일이 오늘로 설정되며 만기일도 동일하게 연장됩니다.")) return;
    
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let newMaturityDate = cov.maturity_date;

    if (cov.subscription_date && cov.maturity_date && cov.maturity_date !== '9999-12-31') {
      const oldSub = new Date(cov.subscription_date);
      const oldMat = new Date(cov.maturity_date);
      
      if (!isNaN(oldSub.getTime()) && !isNaN(oldMat.getTime())) {
        const diffYears = oldMat.getFullYear() - oldSub.getFullYear();
        const diffMonths = oldMat.getMonth() - oldSub.getMonth();
        const diffDays = oldMat.getDate() - oldSub.getDate();

        const newMat = new Date(today.getFullYear() + diffYears, today.getMonth() + diffMonths, today.getDate() + diffDays);
        newMaturityDate = `${newMat.getFullYear()}-${String(newMat.getMonth() + 1).padStart(2, '0')}-${String(newMat.getDate()).padStart(2, '0')}`;
      }
    }

    const { error } = await supabase.from("subscription_insurance").update({ 
      policy_status: "maintain",
      subscription_date: formattedToday,
      maturity_date: newMaturityDate
    }).eq("id", covId);

    if (error) {
      alert("체결 처리에 실패했습니다.");
    } else {
      fetchCoverages(); 
    }
  };

  const updateCoverageDetailsInDB = async (covId: number, newDetails: CoverageDetail[]) => {
    const { error } = await supabase.from("subscription_insurance").update({ details: newDetails }).eq("id", covId);
    if (error) { alert("업데이트 실패"); }
    fetchCoverages();
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
    const newDetails = [...cov.details];
    newDetails.splice(idx, 1);
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
    const currentDetail = { ...newDetails[idx] };
    
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
    
    newDetails[idx] = currentDetail;
    setEditingDetail(null);
    await updateCoverageDetailsInDB(covId, newDetails);
  };

  const handleAddNewDetail = async (covId: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (!cov) return;
    
    const newDetails = cov.details ? [...cov.details] : [];
    const newIdx = newDetails.length;
    
    newDetails.push({ name: "", amount: "", renewal_type: "비갱신" });
    setCoverages(prev => prev.map(c => c.id === covId ? { ...c, details: newDetails } : c));
    
    setEditingDetail({ covId, idx: newIdx, tempName: "", tempAmount: "", tempRenewalType: "비갱신", mode: 'new' });
  };

  const handleCancelEdit = async (covId: number, idx: number) => {
    const cov = coverages.find(c => c.id === covId);
    if (cov && cov.details) {
      const detail = cov.details[idx];
      if (detail.name === "" && detail.amount === "") {
        const newDetails = [...cov.details];
        newDetails.splice(idx, 1);
        setCoverages(prev => prev.map(c => c.id === covId ? { ...c, details: newDetails } : c));
      }
    }
    setEditingDetail(null);
  };

  const lifeInsurances = companies.filter((c) => c.company_type === "생명보험");
  const nonLifeInsurances = companies.filter((c) => c.company_type === "손해보험");
  const differentLifeInsurances = companies.filter((c) => c.company_type === "기타");

  return (
    <>
      <div className="w-full h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm min-h-0 relative">
        
        {/* 상단 헤더 영역 */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <Shield className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">보장 분석 내역</h2>
              <p className="text-xs text-gray-500 mt-0.5">보험과 특약을 감액, 삭제하여 비교하세요.</p>
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
        
        {/* 보험 리스트 출력 영역 */}
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
                const isPolicyReducing = reducingPolicyId === cov.id;
                const isCustomCompany = editingPolicyForm?.insurance_company && !companies.some(c => c.company_name === editingPolicyForm.insurance_company);
                
                return (
                  <div key={cov.id} className={`relative group rounded-lg border text-sm overflow-hidden flex flex-col transition-colors h-fit ${theme.bg} ${theme.border}`}>
                    
                    {/* 1. 보험 기본정보 '수정 모드' 뷰 */}
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
                            {differentLifeInsurances.length > 0 && (
                              <optgroup label="[ 기타 ]">
                                {differentLifeInsurances.map((c) => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
                              </optgroup>
                            )}
                            {isCustomCompany && <option value={editingPolicyForm!.insurance_company}>{editingPolicyForm!.insurance_company}</option>}
                          </select>

                          <input type="text" placeholder="상품명" value={editingPolicyForm?.product_name || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, product_name: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500" />
                          
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">계약자</span>
                            <input type="text" placeholder="계약자" value={editingPolicyForm?.contractor || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, contractor: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">피보험자</span>
                            <input type="text" placeholder="피보험자" value={editingPolicyForm?.insured || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, insured: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">수익자</span>
                            <input type="text" placeholder="수익자" value={editingPolicyForm?.beneficiary || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, beneficiary: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">담당설계사</span>
                            <input type="text" placeholder="담당설계사" value={editingPolicyForm?.agent_name || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, agent_name: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500" />
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">월 보험료</span>
                            <div className="flex items-center border border-gray-200 rounded p-2 bg-white focus-within:border-blue-500">
                              <input type="text" placeholder="월 보험료" value={formatAmount(String(editingPolicyForm?.monthly_premium || ""))} onChange={e => setEditingPolicyForm({...editingPolicyForm!, monthly_premium: Number(e.target.value.replace(/,/g, ''))})} className="flex-1 w-full outline-none" />
                              <span className="text-gray-400">원</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">실손 세대</span>
                            <select 
                              value={editingPolicyForm?.indemnity_generation || ""} 
                              onChange={e => setEditingPolicyForm({...editingPolicyForm!, indemnity_generation: e.target.value})} 
                              className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500 bg-white h-[34px]"
                            >
                              <option value="">해당 없음</option>
                              <option value="1세대 실손">1세대 실손</option>
                              <option value="2세대 실손">2세대 실손</option>
                              <option value="3세대 실손">3세대 실손</option>
                              <option value="4세대 실손">4세대 실손</option>
                              <option value="5세대 실손">5세대 실손</option>
                            </select>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">가입일자</span>
                            <input type="date" max="9999-12-31" value={editingPolicyForm?.subscription_date || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, subscription_date: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500 h-[34px]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">만기일자</span>
                            <input type="date" max="9999-12-31" value={editingPolicyForm?.maturity_date || ""} onChange={e => setEditingPolicyForm({...editingPolicyForm!, maturity_date: e.target.value})} className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500 h-[34px]" />
                          </div>
                          <div className="flex flex-col col-span-2">
                            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">납입 기간</span>
                            <select 
                              value={editingPolicyForm?.payment_period || ""} 
                              onChange={e => setEditingPolicyForm({...editingPolicyForm!, payment_period: e.target.value})} 
                              className="border border-gray-200 rounded p-2 outline-none focus:border-blue-500 bg-white"
                            >
                              <option value="">선택 안함</option>
                              <option value="일시납">일시납</option>
                              <option value="전기납">전기납</option>
                              <option value="3년납">3년납</option>
                              <option value="5년납">5년납</option>
                              <option value="7년납">7년납</option>
                              <option value="10년납">10년납</option>
                              <option value="15년납">15년납</option>
                              <option value="20년납">20년납</option>
                              <option value="25년납">25년납</option>
                              <option value="30년납">30년납</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 2. 보험 기본정보 '일반 보기 모드' 뷰
                      <div className="p-4 cursor-pointer hover:bg-black/5 transition-colors flex flex-col gap-2" onClick={() => toggleCoverage(cov.id)}>
                        
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <p className="font-bold text-gray-900 truncate text-base" title={cov.insurance_company}>{cov.insurance_company}</p>
                            
                            {currentStatus === 'new' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleCompletePolicy(cov.id); }}
                                className="flex items-center gap-1 text-[10px] font-black bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded shadow-sm transition-colors animate-pulse"
                                title="이 제안을 체결로 확정하고 가입일을 오늘로 지정합니다."
                              >
                                <PartyPopper className="w-3 h-3" /> 체결
                              </button>
                            )}
                            
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
                          
                          {!isPolicyReducing && (
                            <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
                                {cov.remodeled_amount && (
                                  <button onClick={() => handleRestorePolicyPremium(cov.id)} className="text-purple-500 hover:bg-purple-50 p-1.5 border-r border-gray-100/50" title="감액 취소">
                                    <Undo className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button onClick={() => handleStartReducePolicy(cov)} className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 p-1.5 border-r border-gray-100/50" title="보험료 감액">
                                  <TrendingDown className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleStartEditPolicy(cov)} className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 p-1.5 border-r border-gray-100/50" title="기본 정보 수정">
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDeleteCoverage(cov.id)} className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-1.5" title="보장 내역 완전 삭제">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-end gap-3 mt-1">
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-gray-700 text-sm font-medium truncate min-w-0">{cov.product_name}</p>
                              {cov.indemnity_generation && <span className="shrink-0 bg-white border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold rounded text-gray-500">{cov.indemnity_generation}</span>}
                            </div>

                            {/* ⭐️ [다이렉트 청구하기] 버튼 추가 위치 */}
                            {/* <div className="mt-1" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => handleOpenClaimModal(cov)}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded-md transition-colors shadow-sm"
                              >
                                <Send className="w-3 h-3" /> 이 보험으로 다이렉트 청구하기
                              </button>
                            </div> */}

                            {(cov.subscription_date || cov.maturity_date) && (
                              <p className="text-[11px] font-medium text-gray-400 flex gap-1.5 mt-0.5">
                                {cov.subscription_date && <span>가입 {cov.subscription_date}</span>}
                                {cov.subscription_date && cov.maturity_date && <span>|</span>}
                                {cov.maturity_date && <span>만기 {cov.maturity_date}</span>}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end z-20" onClick={e => e.stopPropagation()}>
                            {isPolicyReducing ? (
                              <div className="flex flex-col items-end gap-1.5 bg-purple-50 p-2 rounded-lg border border-purple-200 shadow-sm" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-1">
                                  <span className="line-through text-red-400 text-[10px] font-medium leading-none">
                                    {(cov.remodeled_amount || cov.monthly_premium).toLocaleString()} ➔
                                  </span>
                                  <input 
                                    type="text" 
                                    value={formatAmount(reducingPremium)} 
                                    onChange={e => setReducingPremium(formatAmount(e.target.value))} 
                                    className="border border-purple-300 rounded px-2 py-1 w-[88px] text-right text-xs outline-none focus:border-purple-500 font-bold" 
                                    autoFocus 
                                  />
                                </div>
                                <div className="flex gap-1 w-full justify-end">
                                  <button onClick={() => handleSavePolicyReduce(cov.id)} className="text-[10px] text-purple-600 font-bold bg-white border border-purple-200 px-2 py-1 rounded hover:bg-purple-100 flex-1">적용</button>
                                  <button onClick={() => setReducingPolicyId(null)} className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 flex-1">취소</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-0.5" onClick={() => toggleCoverage(cov.id)}>
                                {cov.remodeled_amount && cov.remodeled_amount !== cov.monthly_premium && currentStatus !== 'cancel' && (
                                  <span className="text-red-400 line-through text-[11px] font-medium leading-none">{cov.remodeled_amount.toLocaleString()}</span>
                                )}
                                <div className="flex items-baseline gap-1.5">
                                  {cov.payment_period && <span className="text-xs text-gray-500 font-medium tracking-tight">{cov.payment_period}</span>}
                                  <p className={`text-lg font-black tracking-tight ${currentStatus === 'cancel' ? 'text-gray-400 line-through' : theme.text}`}>
                                    {cov.monthly_premium.toLocaleString()}<span className="text-sm font-bold ml-0.5">원</span>
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-center -mb-2 mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          {expandedCovId === cov.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    )}

                    {/* 확장된 특약 및 상세 정보 패널 (기존과 동일) */}
                    {expandedCovId === cov.id && !isPolicyEditing && (
                      <div className="border-t border-black/10 bg-white/60 p-4 space-y-3">
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50/80 p-2.5 rounded-lg border border-gray-200/60 mb-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-gray-400 font-bold tracking-wider">계약자</span>
                            <span className="text-[11px] text-gray-800 font-bold truncate">{cov.contractor || "-"}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-gray-400 font-bold tracking-wider">피보험자</span>
                            <span className="text-[11px] text-gray-800 font-bold truncate">{cov.insured || "-"}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-gray-400 font-bold tracking-wider">수익자</span>
                            <span className="text-[11px] text-gray-800 font-bold truncate">{cov.beneficiary || "-"}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-gray-400 font-bold tracking-wider">담당설계사</span>
                            <span className="text-[11px] text-gray-800 font-bold truncate">{cov.agent_name || "-"}</span>
                          </div>
                        </div>

                        {cov.details && cov.details.map((detail, idx) => {
                          const isDeleted = detail.is_deleted;
                          const isEditing = editingDetail?.covId === cov.id && editingDetail?.idx === idx;
                          
                          const filteredOptions = isEditing && editingDetail.tempName.trim()
                            ? COVERAGE_OPTIONS.filter((opt) => opt.includes(editingDetail.tempName) && opt !== editingDetail.tempName)
                            : [];

                          return (
                            <div key={idx} className={`flex flex-col text-xs border-b border-gray-200/50 pb-2 last:border-0 last:pb-0 ${isDeleted ? 'opacity-60 grayscale' : ''}`}>
                              <div className="flex justify-between items-start sm:items-center gap-2">
                                
                                {isEditing ? (
                                  editingDetail.mode === 'reduce' ? (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full bg-purple-50 p-2.5 rounded-lg border border-purple-200 shadow-sm my-1">
                                      <span className="text-gray-700 font-bold truncate flex-1 px-1 text-sm">{detail.name}</span>
                                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="flex items-center gap-1.5">
                                          <span className="line-through text-red-400 text-[11px] font-bold">{detail.original_amount || detail.amount} ➔</span>
                                          <div className="flex items-center bg-white border border-purple-300 rounded-md overflow-hidden focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 w-[90px]">
                                            <input type="text" placeholder="금액" value={formatAmount(editingDetail.tempAmount)} onChange={(e) => setEditingDetail({ ...editingDetail, tempAmount: formatAmount(e.target.value) })} className="w-full text-right text-xs px-2 py-1.5 outline-none font-black text-purple-700" autoFocus />
                                          </div>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                          <button onClick={() => handleSaveDetail(cov.id, idx)} className="text-[11px] text-purple-600 font-bold bg-white border border-purple-300 px-3.5 py-1.5 rounded-md hover:bg-purple-100 shadow-sm">적용</button>
                                          <button onClick={() => handleCancelEdit(cov.id, idx)} className="text-[11px] text-gray-500 font-bold bg-gray-100 px-3.5 py-1.5 rounded-md hover:bg-gray-200 border border-gray-200 shadow-sm">취소</button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-2 w-full bg-blue-50/40 p-2.5 rounded-lg border border-blue-200 shadow-sm my-1">
                                      
                                      <div className="relative w-full">
                                        <input 
                                          type="text" 
                                          placeholder="특약명 (검색 또는 직접입력)" 
                                          value={editingDetail.tempName} 
                                          onChange={(e) => setEditingDetail({ ...editingDetail, tempName: e.target.value })} 
                                          onFocus={() => setIsDropdownOpen(true)}
                                          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                                          className="border border-blue-300 rounded-md px-3 py-2 w-full text-xs font-bold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 placeholder:font-normal" 
                                          autoComplete="off"
                                          autoFocus={editingDetail.mode === 'new'} 
                                        />
                                        {isDropdownOpen && filteredOptions.length > 0 && (
                                          <ul className="absolute z-50 left-0 top-full mt-1 min-w-full sm:min-w-[260px] max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl py-1">
                                            {filteredOptions.map((opt) => (
                                              <li
                                                key={opt}
                                                onMouseDown={(e) => {
                                                  e.preventDefault(); 
                                                  setEditingDetail({ ...editingDetail, tempName: opt });
                                                  setIsDropdownOpen(false);
                                                }}
                                                className="px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors whitespace-nowrap"
                                              >
                                                {opt}
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>

                                      <div className="flex justify-between items-center w-full gap-2">
                                        <div className="flex items-center gap-1.5 flex-1">
                                          <div className="flex items-center bg-white border border-blue-300 rounded-md overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                            <input 
                                              type="text" 
                                              placeholder="가입 금액" 
                                              value={formatAmount(editingDetail.tempAmount)} 
                                              onChange={(e) => setEditingDetail({ ...editingDetail, tempAmount: formatAmount(e.target.value) })} 
                                              className="w-full text-right text-xs px-2 py-1.5 outline-none font-bold text-blue-700 placeholder:text-gray-300 placeholder:font-normal" 
                                              autoFocus={editingDetail.mode === 'edit'} 
                                            />
                                            <span className="text-[11px] font-bold text-gray-500 pr-2.5 bg-white whitespace-nowrap">만원</span>
                                          </div>
                                          <select 
                                            className="border border-blue-300 rounded-md px-1.5 py-1.5 w-[76px] sm:w-[84px] text-[11px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold text-gray-600 bg-white cursor-pointer transition-all" 
                                            value={editingDetail.tempRenewalType} 
                                            onChange={(e) => setEditingDetail({ ...editingDetail, tempRenewalType: e.target.value })}
                                          >
                                            <option value="비갱신">비갱신</option>
                                            <option value="1년 갱신">1년</option>
                                            <option value="3년 갱신">3년</option>
                                            <option value="5년 갱신">5년</option>
                                            <option value="10년 갱신">10년</option>
                                            <option value="15년 갱신">15년</option>
                                            <option value="20년 갱신">20년</option>
                                            <option value="25년 갱신">25년</option>
                                            <option value="30년 갱신">30년</option>
                                          </select>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                          <button onClick={() => handleSaveDetail(cov.id, idx)} className="text-[11px] text-white font-bold bg-blue-600 px-3.5 py-1.5 rounded-md hover:bg-blue-700 shadow-sm transition-colors active:scale-95">확인</button>
                                          <button onClick={() => handleCancelEdit(cov.id, idx)} className="text-[11px] text-gray-600 font-bold bg-white border border-gray-300 px-3.5 py-1.5 rounded-md hover:bg-gray-50 shadow-sm transition-colors active:scale-95">취소</button>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                ) : (
                                  <>
                                    <span className={`text-gray-700 truncate flex-1 ${isDeleted ? 'line-through' : 'font-medium'}`}>{detail.name || "-"}</span>
                                    <div className="flex flex-col items-end shrink-0 leading-tight">
                                      {detail.original_amount && detail.original_amount !== detail.amount && !isDeleted && <span className="text-red-400 line-through text-[10px] font-medium">{detail.original_amount}</span>}
                                      
                                      <div className="flex items-center gap-1.5 mt-0.5">
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
      
      {/* ⭐️ 보험 추가 모달 (기존) */}
      {isCovModalOpen && <InsuranceModal clientId={clientId} onClose={() => setIsCovModalOpen(false)} onSuccess={fetchCoverages} />}
      
      {/* ⭐️ 방금 추가한 원클릭 청구 모달 렌더링 */}
      <QuickClaimModal 
        isOpen={isClaimModalOpen} 
        onClose={() => setIsClaimModalOpen(false)} 
        client={clientData} 
        insurance={selectedClaimIns} 
      />
    </>
  );
}