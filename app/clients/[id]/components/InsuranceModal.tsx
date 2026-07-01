"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, X, Plus, Sparkles, FileText, Loader2 } from "lucide-react";

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

// ⭐️ renewal_type (갱신 주기) 타입 추가
type CoverageDetail = {
  name: string;
  amount: string;
  renewal_type?: string; 
};

type InsuranceCompany = {
  company_type: string;
  company_name: string;
};

const COVERAGE_OPTIONS = [
  "실손의료비 상해입원", "실손의료비 질병입원", "실손의료비 상해통원", "실손의료비 질병통원",
  "실손의료비 상해약제", "실손의료비 질병약제", "일반암 진단금", "고액암 진단금",
  "유사암 진단금", "항암방사선치료비", "항암약물물치료비", "암수술비",
  "뇌혈관 진단금", "허혈성 진단금", "상해수술비", "1종 상해수술비",
  "2종 상해수술비", "3종 상해수술비", "4종 상해수술비", "5종 상해수술비",
  "질병수술비", "1종 질병수술비", "2종 질병수술비", "3종 질병수술비",
  "4종 질병수술비", "5종 질병수술비", "상해입원비", "질병입원비",
];

const initialFormState = {
  policy_status: "maintain",
  company: "",
  product: "",
  premium: "",
  indemnityGen: "",
  subscriptionDate: "",
  maturityDate: "",
};

export default function InsuranceModal({
  clientId,
  onClose,
  onSuccess,
}: {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [covForm, setCovForm] = useState(initialFormState);
  
  // ⭐️ 초기 배열 생성 시 renewal_type 기본값을 '비갱신'으로 세팅
  const [covDetails, setCovDetails] = useState<CoverageDetail[]>(
    Array(5).fill(null).map(() => ({ name: "", amount: "", renewal_type: "비갱신" }))
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);

  const [pasteText, setPasteText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setCovForm(initialFormState);
    setCovDetails(Array(5).fill(null).map(() => ({ name: "", amount: "", renewal_type: "비갱신" })));
    setPasteText("");

    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("insurance_companies")
        .select("company_type, company_name")
        .order("company_type", { ascending: true })
        .order("company_name", { ascending: true });
      if (data) setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const handleAnalyzeText = async () => {
    if (!pasteText.trim()) return alert("분석할 텍스트를 입력해주세요.");
    setIsAnalyzing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("⚠️ 실제 분석 API가 연결되지 않아 데모 값으로 채워집니다. 백엔드 연동이 필요합니다.");
      setCovForm((prev) => ({
        ...prev,
        company: "삼성생명", 
        product: "무배당 삼성생명 종합건강보험",
        premium: "125000",
        subscriptionDate: "2020-05-10",
      }));
      // AI 파싱 시 갱신 여부도 세팅하도록 수정
      setCovDetails([
        { name: "일반암 진단금", amount: "5000만원", renewal_type: "비갱신" },
        { name: "뇌혈관 진단금", amount: "2000만원", renewal_type: "비갱신" },
        { name: "실손의료비 질병입원", amount: "5000만원", renewal_type: "1년 갱신" },
      ]);
      setPasteText("");
    } catch (error) {
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateCovDetail = (index: number, field: keyof CoverageDetail, value: string) => {
    const newDetails = [...covDetails];
    newDetails[index][field] = value;
    setCovDetails(newDetails);
  };

  const addCovDetail = () => {
    setCovDetails([...covDetails, { name: "", amount: "", renewal_type: "비갱신" }]);
  };

  const removeCovDetail = (index: number) => {
    const newDetails = covDetails.filter((_, i) => i !== index);
    setCovDetails(newDetails);
  };

  const handleSaveCoverage = async () => {
    if (!covForm.company.trim() || !covForm.product.trim() || !covForm.premium) {
      alert("보험사, 상품명, 월 보험료를 모두 입력해주세요.");
      return;
    }
    setIsSaving(true);
    const validDetails = covDetails.filter((d) => d.name.trim() !== "" && d.amount.trim() !== "");

    try {
      const { error } = await supabase.from("subscription_insurance").insert([
        {
          client_id: parseInt(clientId, 10),
          policy_status: covForm.policy_status,
          insurance_company: covForm.company.trim(),
          product_name: covForm.product.trim(),
          monthly_premium: parseInt(covForm.premium, 10),
          indemnity_generation: covForm.indemnityGen || null,
          subscription_date: covForm.subscriptionDate || null,
          maturity_date: covForm.maturityDate || null,
          details: validDetails.length > 0 ? validDetails : null,
        },
      ]);
      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`저장 실패 원인: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const lifeInsurances = companies.filter((c) => c.company_type === "생명보험");
  const nonLifeInsurances = companies.filter((c) => c.company_type === "손해보험");

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 md:p-4 transition-opacity">
      <div className="bg-white w-full max-w-4xl flex flex-col max-h-[90vh] md:max-h-[85vh] rounded-t-2xl md:rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl md:rounded-t-xl shrink-0">
          <h3 className="font-bold text-base md:text-lg text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" /> 새 보장 내역 추가
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-6 h-6 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <p className="text-sm font-bold text-indigo-900">증권 텍스트 자동 분석 (AI)</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea 
                placeholder="보험 증권의 PDF 텍스트나 카카오톡 내용을 여기에 붙여넣기 하세요."
                className="flex-1 rounded-lg border border-indigo-200 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-14"
                value={pasteText} onChange={(e) => setPasteText(e.target.value)}
              />
              <button onClick={handleAnalyzeText} disabled={isAnalyzing} className="sm:w-28 flex items-center justify-center gap-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors hover:bg-indigo-700 disabled:opacity-50">
                {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> 분석중</> : <><FileText className="w-4 h-4" /> 추출하기</>}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">리모델링 상태 분류</p>
            <div className="flex gap-2">
              {[
                { id: "maintain", label: "유지하는 보험", color: "bg-blue-600 border-blue-600" },
                { id: "cancel", label: "해지할 보험", color: "bg-red-600 border-red-600" },
                { id: "new", label: "새로 제안할 보험", color: "bg-green-600 border-green-600" },
              ].map((status) => (
                <button key={status.id} onClick={() => setCovForm({ ...covForm, policy_status: status.id })} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg border transition-colors ${covForm.policy_status === status.id ? `${status.color} text-white` : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">기본 정보</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select className={`${inputClassName} cursor-pointer`} value={covForm.company} onChange={(e) => setCovForm({ ...covForm, company: e.target.value })}>
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
              </select>

              <input type="text" placeholder="상품명" className={inputClassName} value={covForm.product} onChange={(e) => setCovForm({ ...covForm, product: e.target.value })} />
              <select className={`${inputClassName} cursor-pointer`} value={covForm.indemnityGen} onChange={(e) => setCovForm({ ...covForm, indemnityGen: e.target.value })}>
                <option value="">실손 세대 선택 (해당 없음)</option>
                <option value="1세대 실손">1세대 실손 (2009년 9월 이전)</option>
                <option value="2세대 실손">2세대 실손 (2009년 10월 이후)</option>
                <option value="3세대 실손">3세대 실손 (2017년 4월 이후)</option>
                <option value="4세대 실손">4세대 실손 (2021년 7월 이후)</option>
                <option value="5세대 실손">5세대 실손 (2026년 5월 이후)</option>
              </select>
              <input type="number" placeholder="월 보험료 (원)" className={inputClassName} value={covForm.premium} onChange={(e) => setCovForm({ ...covForm, premium: e.target.value })} />
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">보험 가입 일자</label>
                <input type="date" max="9999-12-31" className={inputClassName} value={covForm.subscriptionDate} onChange={(e) => setCovForm({ ...covForm, subscriptionDate: e.target.value })} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">보험 만기 일자</label>
                <input type="date" max="9999-12-31" className={inputClassName} value={covForm.maturityDate} onChange={(e) => setCovForm({ ...covForm, maturityDate: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">세부 보장 항목</p>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-3">
              {covDetails.map((detail, index) => (
                <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-center p-2 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-lg border sm:border-0 border-gray-100">
                  <input
                    type="text"
                    list="coverage-options"
                    placeholder="특약 항목명"
                    className={`${inputClassName} w-full sm:w-[45%] text-xs`}
                    value={detail.name}
                    onChange={(e) => updateCovDetail(index, "name", e.target.value)}
                  />
                  <div className="flex w-full sm:flex-1 gap-1.5 items-center">
                    <input
                      type="text"
                      placeholder="가입 금액"
                      className={`${inputClassName} flex-1 min-w-0 text-xs text-right`}
                      value={detail.amount}
                      onChange={(e) => updateCovDetail(index, "amount", e.target.value)}
                    />
                    {/* ⭐️ 통합 갱신 주기 셀렉트 박스 */}
                    <select
                      className={`${inputClassName} max-w-[120px] shrink-0 text-[11px] px-1 text-center font-bold text-gray-600 bg-gray-50`}
                      value={detail.renewal_type || "비갱신"}
                      onChange={(e) => updateCovDetail(index, "renewal_type", e.target.value)}
                    >
                      <option value="비갱신">비갱신</option>
                      <option value="1년 갱신">1년 갱신</option>
                      <option value="3년 갱신">3년 갱신</option>
                      <option value="5년 갱신">5년 갱신</option>
                      <option value="10년 갱신">10년 갱신</option>
                      <option value="15년 갱신">15년 갱신</option>
                      <option value="20년 갱신">20년 갱신</option>
                      <option value="30년 갱신">30년 갱신</option>
                    </select>
                    <button onClick={() => removeCovDetail(index)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0 bg-white rounded-md">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addCovDetail} className="w-full py-3 md:py-2.5 flex items-center justify-center gap-1 text-sm font-medium text-blue-600 border border-dashed border-blue-200 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors mt-4">
              <Plus className="w-4 h-4" /> 빈 항목 한 줄 추가
            </button>
          </div>
        </div>

        <div className="p-4 md:p-5 border-t border-gray-100 bg-gray-50 md:rounded-b-xl flex justify-end gap-2 shrink-0 pb-safe">
          <button onClick={onClose} className="flex-1 md:flex-none px-4 py-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button onClick={handleSaveCoverage} disabled={isSaving} className="flex-1 md:flex-none px-6 py-3 md:py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSaving ? "저장 중..." : "보장 내역 완전히 저장"}
          </button>
        </div>
      </div>

      <datalist id="coverage-options">
        {COVERAGE_OPTIONS.map((opt) => <option key={opt} value={opt} />)}
      </datalist>
    </div>
  );
}