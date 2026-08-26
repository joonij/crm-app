"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, X, Plus, Sparkles, FileText, Loader2, CheckSquare, Trash2 } from "lucide-react";
import { COVERAGE_OPTIONS, mapToStandardCoverage } from "@/lib/coverageMapper"; 
import { analyzeInsuranceEngine, formatAmountWithComma } from "@/lib/insuranceParser";

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type CoverageDetail = {
  name: string;
  amount: string;
  renewal_type?: string; 
};

type InsuranceCompany = {
  company_type: string;
  company_name: string;
};

const POLICY_PERIOD_OPTIONS = ["전기납", "일시납", "5년납", "7년납", "10년납", "15년납", "20년납", "25년납", "30년납"];
const RENEWAL_OPTIONS = ["전기납", "일시납", "비갱신", "1년 갱신", "3년 갱신", "5년 갱신", "10년 갱신", "15년 갱신", "20년 갱신", "30년 갱신"];

// ⭐️ 강력한 헤더/쓰레기값 필터 (특약명 절단 방지용 완벽 최적화)
const isHeaderOrJunk = (line: string) => {
  const s = line.trim();
  if (s.startsWith("※") || s.startsWith("■") || s.startsWith("-") || s.startsWith("*")) return true;

  const noSpace = s.replace(/\s+/g, "").toLowerCase();
  
  // 단독으로 쓰인 짧은 헤더 완벽 차단
  if (/^(보험료(\(원\))?|\(만원\)|구분|쪽|page|보험|기간|납입|주기|가입금액|계약사항|보장내용)$/.test(noSpace)) return true;
  
  // 실납입/할인전/합계 및 안내문구 등 표기 오류 유발 헤더 100% 차단
  if (/발행일시|가입안내서|페이지로|동일한번호|발행번호|fc:|tel:|page:|보험회사|미래에셋생명|보험상품명|주피보험자|보험계약의|계약체결시|수령하시기|할인전보험료|실납입보험료|합계|선택특약의|청약서를|기본계약|대상계약|가입특약|특약가입개요|소비자가직접|청약서발행|가입설계번호|대리점명|지점명|설계사명|www\.|라이나생명|chubb|가입설계용|보장내역|계약사항|계약자|지급사유|지급금액|보장합니다|가입기준|보험종류|보험가입금액|보험기간|납입기간|납입주기|의무부가특약|케어매칭서비스|암전장유전체|다수특약에|가입필요및/i.test(noSpace)) return true;
  
  return false;
};

// 초기 폼 상태
const initialFormState = {
  policy_status: "maintain",
  company: "",
  product: "",
  premium: "", 
  premiumFormatted: "", 
  indemnityGen: "",
  subscriptionDate: "",
  maturityDate: "",
  paymentPeriod: "", 
  contractor_name: "",
  contractor_id: null as number | null,
  insured_name: "",
  insured_id: null as number | null,
  beneficiary_name: "",
  beneficiary_id: null as number | null,
  agent_name: "",
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
  const [covDetails, setCovDetails] = useState<CoverageDetail[]>(
    Array(5).fill(null).map(() => ({ name: "", amount: "", renewal_type: "비갱신" }))
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 인풋 필드별 포커스 활성화 여부
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [focusedRenewalIndex, setFocusedRenewalIndex] = useState<number | null>(null);
  const [focusedPolicyPeriod, setFocusedPolicyPeriod] = useState(false);

  // 고객 검색 자동완성용 상태
  const [clientsList, setClientsList] = useState<{ id: number; name: string; phone?: string }[]>([]);
  const [focusedClientField, setFocusedClientField] = useState<'contractor' | 'insured' | 'beneficiary' | null>(null);

  // 담당자(본인) 여부 체크박스 상태
  const [isCurrentUserAgent, setIsCurrentUserAgent] = useState(false);
  const [loggedInAgentName, setLoggedInAgentName] = useState("");

  useEffect(() => {
    setCovForm(initialFormState);
    setCovDetails(Array(5).fill(null).map(() => ({ name: "", amount: "", renewal_type: "비갱신" })));
    setPasteText("");

    const fetchInitialData = async () => {
      let currentClientName = "";

      // 1. 현재 로그인한 유저 정보 확인
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: agentData } = await supabase.from("agents").select("id, name").eq("auth_id", user.id).single();
        
        if (agentData) {
          setLoggedInAgentName(agentData.name);
          setIsCurrentUserAgent(false);

          const { data: myClients } = await supabase
            .from("clients")
            .select("id, name, phone")
            .eq("agent_id", agentData.id) 
            .order("name");
            
          if (myClients) setClientsList(myClients);
        }
      }

      const { data: compData } = await supabase
        .from("insurance_companies")
        .select("company_type, company_name")
        .order("company_type", { ascending: true })
        .order("company_name", { ascending: true });
      if (compData) setCompanies(compData);

      const { data: clientData } = await supabase.from("clients").select("*").eq("id", clientId).single();
      if (clientData) {
        currentClientName = clientData.name;
      }
      
      const currentClientId = parseInt(clientId, 10);
      const today = new Date().toISOString().split("T")[0];

      setCovForm(prev => ({
        ...prev,
        contractor_name: currentClientName,
        contractor_id: currentClientId,
        insured_name: currentClientName,
        insured_id: currentClientId,
        beneficiary_name: currentClientName,
        beneficiary_id: currentClientId,
        agent_name: "", // ⭐️ 담당설계사 기본값을 빈 값으로 고정!
        subscriptionDate: today,
        policy_status: "maintain"
      }));
    };

    fetchInitialData();
  }, [clientId]);

  // ⭐️ 독립된 파싱 엔진 호출
  const handleAnalyzeText = async () => {
    if (!pasteText.trim()) return alert("분석할 텍스트를 입력해주세요.");
    setIsAnalyzing(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const result = analyzeInsuranceEngine(pasteText, covForm.contractor_name);

      setCovForm(prev => ({
        ...prev,
        company: result.company || prev.company,
        product: result.product || prev.product,
        premium: result.premium || prev.premium,
        premiumFormatted: result.premium ? formatAmountWithComma(result.premium) : prev.premiumFormatted,
        subscriptionDate: result.subDate || prev.subscriptionDate,
        maturityDate: result.matDate || "",
        paymentPeriod: result.paymentPeriod || prev.paymentPeriod,
      }));

      if (result.details.length > 0) {
        setCovDetails(result.details);
      } else {
        alert("특약 내역을 추출하지 못했습니다. 형식이 다르거나 텍스트가 부족할 수 있습니다.");
      }

      setPasteText("");
    } catch (error) {
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateCovDetail = (index: number, field: keyof CoverageDetail, value: string) => {
    const newDetails = [...covDetails];
    if (field === "amount") {
        newDetails[index][field] = formatAmountWithComma(value);
    } else {
        newDetails[index][field] = value;
    }
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
    if (!covForm.company.trim() || !covForm.product.trim() || !covForm.premiumFormatted) {
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
          monthly_premium: parseInt(covForm.premiumFormatted.replace(/,/g, ""), 10),
          indemnity_generation: covForm.indemnityGen || null,
          subscription_date: covForm.subscriptionDate || null,
          maturity_date: covForm.maturityDate || null,
          payment_period: covForm.paymentPeriod.trim() || null, 
          contractor_name: covForm.contractor_name.trim(),
          contractor_id: covForm.contractor_id,
          insured_name: covForm.insured_name.trim(),
          insured_id: covForm.insured_id,
          beneficiary_name: covForm.beneficiary_name.trim(),
          beneficiary_id: covForm.beneficiary_id,
          agent_name: covForm.agent_name.trim(),
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
  const differentLifeInsurances = companies.filter((c) => c.company_type === "기타");

  const getDisplayOptions = (currentInput: string, optionsList: string[]) => {
    const cleanInput = currentInput.replace(/\s+/g, "").toLowerCase();
    if (!cleanInput) return optionsList;

    const filtered = optionsList.filter((opt) => 
      opt.replace(/\s+/g, "").toLowerCase().includes(cleanInput)
    );
    return filtered.length > 0 ? filtered : optionsList;
  };

  const displayPolicyPeriods = getDisplayOptions(covForm.paymentPeriod, POLICY_PERIOD_OPTIONS);

  const renderClientSearchInput = (fieldPrefix: 'contractor' | 'insured' | 'beneficiary', label: string) => {
    const nameField = `${fieldPrefix}_name` as keyof typeof covForm;
    const idField = `${fieldPrefix}_id` as keyof typeof covForm;
    
    const currentValue = (covForm[nameField] || "") as string;

    const cleanNameInput = currentValue.replace(/\s+/g, "").toLowerCase();
    const cleanPhoneInput = currentValue.replace(/[^0-9]/g, "");

    const filteredClients = currentValue
      ? clientsList.filter(c => {
          const matchName = c.name 
            ? c.name.replace(/\s+/g, "").toLowerCase().includes(cleanNameInput)
            : false;
          
          const matchPhone = cleanPhoneInput && c.phone
            ? c.phone.replace(/[^0-9]/g, "").includes(cleanPhoneInput)
            : false;

          return matchName || matchPhone;
        })
      : clientsList;

    return (
      <div className="flex flex-col relative">
        <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">{label}</label>
        <input
          type="text"
          className={inputClassName}
          placeholder={`${label} 이름 또는 연락처 검색`}
          value={currentValue}
          onChange={(e) => {
            setCovForm(prev => ({ ...prev, [nameField]: e.target.value, [idField]: null }));
          }}
          onFocus={() => setFocusedClientField(fieldPrefix)}
          onBlur={() => setTimeout(() => setFocusedClientField(null), 150)}
        />
        {focusedClientField === fieldPrefix && filteredClients.length > 0 && (
          <ul 
            className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl py-1"
            onMouseDown={(e) => e.preventDefault()}
          >
            {filteredClients.map(c => (
              <li
                key={c.id}
                onClick={() => {
                  setCovForm(prev => ({ ...prev, [nameField]: c.name, [idField]: c.id }));
                  setFocusedClientField(null);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>{c.name}</span>
                {c.phone && <span className="text-xs text-gray-400 tracking-tight">{c.phone}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 md:p-4 transition-opacity">
      <div className="bg-white w-full max-w-4xl flex flex-col max-h-[90vh] md:max-h-[85vh] rounded-t-2xl md:rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl md:rounded-t-xl shrink-0">
          <h3 className="font-bold text-base md:text-lg text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" /> 새 보장 내역 추가
          </h3>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-6 h-6 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <p className="text-sm font-bold text-indigo-900">보험사 가입설계서 텍스트 붙여넣기 파싱</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea 
                placeholder="보험 증권의 PDF 텍스트나 카카오톡 내용을 여기에 붙여넣기 하세요."
                className="flex-1 rounded-lg border border-indigo-200 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-14"
                value={pasteText} onChange={(e) => setPasteText(e.target.value)}
              />
              <button onClick={handleAnalyzeText} disabled={isAnalyzing} className="cursor-pointer sm:w-28 flex items-center justify-center gap-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors hover:bg-indigo-700 disabled:opacity-50 shadow-md">
                {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> 분석중</> : <><FileText className="w-4 h-4" /> 추출하기</>}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">리모델링 상태 분류</p>
            <div className="flex gap-2">
              {[
                { id: "maintain", label: "기존 보험", color: "bg-blue-600 border-blue-600" },
                { id: "new", label: "새로 제안할 보험", color: "bg-green-600 border-green-600" },
              ].map((status) => (
                <button 
                  key={status.id} 
                  onClick={() => {
                    const isNew = status.id === "new";
                    setIsCurrentUserAgent(isNew);
                    
                    const today = new Date().toISOString().split("T")[0];
                    
                    setCovForm({
                      ...covForm,
                      policy_status: status.id,
                      agent_name: isNew ? loggedInAgentName : "",
                      subscriptionDate: isNew ? today : ""
                    });
                  }} 
                  className={`cursor-pointer flex-1 py-2 text-xs md:text-sm font-bold rounded-lg border transition-colors ${covForm.policy_status === status.id ? `${status.color} text-white` : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                >
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
                {differentLifeInsurances.length > 0 && (
                  <optgroup label="[ 기타 ]">
                    {differentLifeInsurances.map((c) => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
                  </optgroup>
                )}
              </select>

              <input type="text" placeholder="상품명" className={inputClassName} value={covForm.product} onChange={(e) => setCovForm({ ...covForm, product: e.target.value })} />
              
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">실손의료비</label>
                <select className={`${inputClassName} cursor-pointer`} value={covForm.indemnityGen} onChange={(e) => setCovForm({ ...covForm, indemnityGen: e.target.value })}>
                  <option value="">실손 세대 선택 (해당 없음)</option>
                  <option value="1세대 실손">1세대 실손 (2009년 9월 이전)</option>
                  <option value="2세대 실손">2세대 실손 (2009년 10월 이후)</option>
                  <option value="3세대 실손">3세대 실손 (2017년 4월 이후)</option>
                  <option value="4세대 실손">4세대 실손 (2021년 7월 이후)</option>
                  <option value="5세대 실손">5세대 실손 (2026년 5월 이후)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">보험료</label>
                <input 
                  type="text" 
                  placeholder="월 보험료 (원)" 
                  className={inputClassName} 
                  value={covForm.premiumFormatted} 
                  onChange={(e) => {
                      const formatted = formatAmountWithComma(e.target.value);
                      setCovForm({ ...covForm, premiumFormatted: formatted });
                  }} 
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">보험 가입 일자</label>
                <input type="date" max="9999-12-31" className={inputClassName} value={covForm.subscriptionDate} onChange={(e) => setCovForm({ ...covForm, subscriptionDate: e.target.value })} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">보험 만기 일자</label>
                <input type="date" max="9999-12-31" className={inputClassName} value={covForm.maturityDate} onChange={(e) => setCovForm({ ...covForm, maturityDate: e.target.value })} />
              </div>

              <div className="flex flex-col relative">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">납입 기간</label>
                <input
                  type="text"
                  placeholder="직접 입력 또는 선택"
                  className={inputClassName}
                  value={covForm.paymentPeriod}
                  onChange={(e) => setCovForm({ ...covForm, paymentPeriod: e.target.value })}
                  onFocus={() => setFocusedPolicyPeriod(true)}
                  onBlur={() => setFocusedPolicyPeriod(false)}
                />
                {focusedPolicyPeriod && displayPolicyPeriods.length > 0 && (
                  <ul 
                    className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl py-1"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {displayPolicyPeriods.map((opt) => (
                      <li
                        key={opt}
                        onClick={() => {
                          setCovForm({ ...covForm, paymentPeriod: opt });
                          setFocusedPolicyPeriod(false);
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="flex flex-col relative"></div>

              {renderClientSearchInput('contractor', '계약자')}
              {renderClientSearchInput('insured', '피보험자')}
              {renderClientSearchInput('beneficiary', '수익자')}

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1 ml-1">
                  <label className="text-xs text-gray-500 font-semibold">담당설계사</label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer font-bold select-none">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={isCurrentUserAgent}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsCurrentUserAgent(checked);
                        setCovForm(prev => ({ ...prev, agent_name: checked ? loggedInAgentName : "" }));
                      }}
                    />
                    내(본인)가 담당
                  </label>
                </div>
                <input 
                  type="text" 
                  className={`${inputClassName} ${isCurrentUserAgent ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} font-bold`} 
                  value={covForm.agent_name}
                  onChange={(e) => setCovForm({ ...covForm, agent_name: e.target.value })} 
                  readOnly={isCurrentUserAgent}
                  placeholder={isCurrentUserAgent ? "본인 담당" : "다른 담당자 이름 직접 입력"}
                />
              </div>

            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">세부 보장 항목</p>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-3">
              {covDetails.map((detail, index) => {
                const displayCoverages = getDisplayOptions(detail.name, COVERAGE_OPTIONS);
                const displayRenewals = getDisplayOptions(detail.renewal_type || "", RENEWAL_OPTIONS);

                return (
                  <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-center p-2 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-lg border sm:border-0 border-gray-100 relative hover:border-blue-200 transition-colors">
                    
                    <div className="relative w-full sm:w-[45%] shrink-0">
                      <input
                        type="text"
                        placeholder="특약 항목명 (검색 또는 직접입력)"
                        className={`${inputClassName} w-full text-xs font-bold text-gray-800`}
                        value={detail.name}
                        onChange={(e) => updateCovDetail(index, "name", e.target.value)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        autoComplete="off"
                      />
                      
                      {focusedIndex === index && displayCoverages.length > 0 && (
                        <ul 
                          className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl py-1"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {displayCoverages.map((opt) => (
                            <li
                              key={opt}
                              onClick={() => {
                                updateCovDetail(index, "name", opt);
                                setFocusedIndex(null);
                              }}
                              className="px-3 py-2 text-xs font-bold text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                              {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="flex w-full sm:flex-1 gap-1.5 items-center">
                      <div className="flex flex-1 items-center bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <input
                          type="text"
                          placeholder="가입 금액"
                          className="w-full text-right text-xs px-2 py-2 outline-none font-bold text-blue-700 placeholder:font-normal"
                          value={detail.amount}
                          onChange={(e) => updateCovDetail(index, "amount", e.target.value)}
                        />
                        <span className="text-[11px] font-bold text-gray-500 pr-2.5 bg-white whitespace-nowrap shrink-0">만원</span>
                      </div>
                      
                      <div className="relative shrink-0 w-[84px] sm:w-[100px]">
                        <input
                          type="text"
                          placeholder="납입/갱신"
                          className={`${inputClassName} w-full px-1 text-center text-[11px] font-bold text-gray-600 bg-gray-50`}
                          value={detail.renewal_type || ""}
                          onChange={(e) => updateCovDetail(index, "renewal_type", e.target.value)}
                          onFocus={() => setFocusedRenewalIndex(index)}
                          onBlur={() => setFocusedRenewalIndex(null)}
                          autoComplete="off"
                        />
                        {focusedRenewalIndex === index && displayRenewals.length > 0 && (
                          <ul 
                            className="absolute z-50 right-0 top-full mt-1 w-[120px] max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl py-1"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {displayRenewals.map((opt) => (
                              <li
                                key={opt}
                                onClick={() => {
                                  updateCovDetail(index, "renewal_type", opt);
                                  setFocusedRenewalIndex(null);
                                }}
                                className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors text-center"
                              >
                                {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <button onClick={() => removeCovDetail(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0 bg-white rounded-md border border-gray-200 cursor-pointer shadow-sm hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={addCovDetail} className="cursor-pointer w-full py-3 md:py-2.5 flex items-center justify-center gap-1 text-sm font-bold text-blue-600 border border-dashed border-blue-300 bg-blue-50/50 rounded-lg hover:bg-blue-100 transition-colors mt-4">
              <Plus className="w-4 h-4" /> 특약 한 줄 추가
            </button>
          </div>
        </div>

        <div className="p-4 md:p-5 border-t border-gray-100 bg-gray-50 md:rounded-b-xl flex justify-end gap-2 shrink-0 pb-safe">
          <button onClick={onClose} className="cursor-pointer flex-1 md:flex-none px-4 py-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button onClick={handleSaveCoverage} disabled={isSaving} className="cursor-pointer flex-1 md:flex-none px-6 py-3 md:py-2 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckSquare className="w-4 h-4"/>}
            {isSaving ? "저장 중..." : "보장 내역 완전히 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}