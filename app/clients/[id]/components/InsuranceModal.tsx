"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, X, Plus, Sparkles, FileText, Loader2 } from "lucide-react";

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

// 실시간 금액 콤마(,) 포맷팅 함수
const formatAmountWithComma = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (!numericValue) return "";
  return Number(numericValue).toLocaleString("ko-KR");
};

const COVERAGE_OPTIONS = [
  "실손의료비 상해입원", "실손의료비 질병입원", "실손의료비 상해통원", "실손의료비 질병통원", "실손의료비 상해약제", "실손의료비 질병약제",
  "일반사망 진단비", "재해사망 진단비", "상해사망 진단비", "질병사망 진단비", 
  "재해 후유장해3%↑", "상해 후유장해3%↑", "질병 후유장해3%↑", 
  "일반암 진단금", "고액암 진단금", "유사암 진단금", "소액암 진단금", "항암방사선 치료비", "항암약물 치료비", "암 수술비",
  "뇌산정특례대상 진단비", "뇌혈관질환 진단비", "뇌졸증 진단비", "뇌출혈 진단비", "심장산정특례대상 진단비", "허혈성심장질환 진단비", "급성심근경색 진단비",
  "상해수술비", "상해1종 수술비", "상해2종 수술비", "상해3종 수술비", "상해4종 수술비", "상해5종 수술비",
  "질병수술비", "질병1종 수술비", "질병2종 수술비", "질병3종 수술비", "질병4종 수술비", "질병5종 수술비",
  "상해 입원일당", "질병 입원일당", "상해중환자실 입원일당", "질병중환자실 입원일당",
  "통합상해 진단금", "골절진단금", "화상진단금",
  "재가급여 1~5등급", "시설급여 1~5등급", "시설급여 1~2등급", "간병인 사용일당", "간병인 지원일당",
  "레진", "인레이", "크라운", "임플란트", "보존치료", "보철치료"
];

// 특약명 지능형 매핑 헬퍼 함수
const mapToStandardCoverage = (rawName: string) => {
  if (rawName.includes("기타")) return rawName;

  const name = rawName.replace(/\s+/g, ""); 
  
  if (name.includes("일반암") && name.includes("진단")) return "일반암 진단비";
  if (name.includes("고액암") && name.includes("진단")) return "고액암 진단비";
  if (name.includes("소액암") && name.includes("진단")) return "소액암 진단비";
  if (name.includes("유사암") && name.includes("진단")) return "유사암 진단비";
  if (name.includes("항암방사선약물")) return "항암방사선약물 치료비";
  if (name.includes("암") && name.includes("수술")) return "암 수술비";
  
  if (name.includes("뇌혈관") && name.includes("진단")) return "뇌혈관질환 진단비";
  if (name.includes("뇌졸증") && name.includes("진단")) return "뇌졸증 진단비";
  if (name.includes("뇌출혈") && name.includes("진단")) return "뇌출혈 진단비";
  if (name.includes("뇌") && name.includes("산정특례")) return "뇌산정특례대상 진단비";
  
  if (name.includes("허혈성") && name.includes("진단")) return "허혈성심장질환 진단비";
  if (name.includes("급성심근경색") && name.includes("진단")) return "급성심근경색 진단비";
  if (name.includes("심장") && name.includes("산정특례")) return "심장산정특례대상 진단비";
  
  if (name.includes("상해") && name.includes("사망")) return "상해사망 진단비";
  if (name.includes("질병") && name.includes("사망")) return "질병사망 진단비";
  if (name.includes("재해") && name.includes("사망")) return "재해사망 진단비";
  if (name.includes("일반") && name.includes("사망")) return "일반사망 진단비";
  
  if (name.includes("상해") && name.includes("후유장해") && name.includes("3")) return "상해 후유장해3%↑";
  if (name.includes("질병") && name.includes("후유장해") && name.includes("3")) return "질병 후유장해3%↑";
  if (name.includes("재해") && name.includes("후유장해") && name.includes("3")) return "재해 후유장해3%↑";
  
  if (name.includes("재해") && name.includes("수술")) return "상해수술비";
  if (name.includes("1종") && name.includes("재해")) return "재해1종 수술비";
  if (name.includes("2종") && name.includes("재해")) return "재해2종 수술비";
  if (name.includes("3종") && name.includes("재해")) return "재해3종 수술비";
  if (name.includes("4종") && name.includes("재해")) return "재해4종 수술비";
  if (name.includes("5종") && name.includes("재해")) return "재해5종 수술비";

  if (name.includes("상해") && name.includes("수술")) return "상해수술비";
  if (name.includes("1종") && name.includes("상해")) return "상해1종 수술비";
  if (name.includes("2종") && name.includes("상해")) return "상해2종 수술비";
  if (name.includes("3종") && name.includes("상해")) return "상해3종 수술비";
  if (name.includes("4종") && name.includes("상해")) return "상해4종 수술비";
  if (name.includes("5종") && name.includes("상해")) return "상해5종 수술비";
  
  if (name.includes("질병") && name.includes("수술")) return "질병수술비";
  if (name.includes("1종") && name.includes("질병")) return "질병1종 수술비";
  if (name.includes("2종") && name.includes("질병")) return "질병2종 수술비";
  if (name.includes("3종") && name.includes("질병")) return "질병3종 수술비";
  if (name.includes("4종") && name.includes("질병")) return "질병4종 수술비";
  if (name.includes("5종") && name.includes("질병")) return "질병5종 수술비";
  
  if (name.includes("상해") && name.includes("입원")) return "상해 입원일당";
  if (name.includes("재해") && name.includes("입원")) return "재해 입원일당";
  if (name.includes("질병") && name.includes("입원")) return "질병 입원일당";
  if (name.includes("중환자") && name.includes("재해") && name.includes("입원")) return "재해중환자실 입원일당";
  if (name.includes("중환자") && name.includes("상해") && name.includes("입원")) return "상해중환자실 입원일당";
  if (name.includes("중환자") && name.includes("질병") && name.includes("입원")) return "질병중환자실 입원일당";

  return rawName; 
};

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
  contractor: "",
  insured: "",
  beneficiary: "",
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

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    setCovForm(initialFormState);
    setCovDetails(Array(5).fill(null).map(() => ({ name: "", amount: "", renewal_type: "비갱신" })));
    setPasteText("");

    const fetchInitialData = async () => {
      const { data: compData } = await supabase
        .from("insurance_companies")
        .select("company_type, company_name")
        .order("company_type", { ascending: true })
        .order("company_name", { ascending: true });
      if (compData) setCompanies(compData);

      let currentAgentName = "";
      let currentClientName = "";

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agentData } = await supabase.from("agents").select("name").eq("auth_id", user.id).single();
        if (agentData) currentAgentName = agentData.name;
      }

      const { data: clientData } = await supabase.from("clients").select("name").eq("id", clientId).single();
      if (clientData) currentClientName = clientData.name;

      setCovForm(prev => ({
        ...prev,
        contractor: currentClientName,
        insured: currentClientName,
        beneficiary: currentClientName,
        agent_name: currentAgentName,
      }));
    };

    fetchInitialData();
  }, [clientId]);

  const handleAnalyzeText = async () => {
    if (!pasteText.trim()) return alert("분석할 텍스트를 입력해주세요.");
    setIsAnalyzing(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      let extractedCompany = "";
      let extractedProduct = "";
      let extractedPremium = "";
      let extractedSubDate = "";
      let extractedMatDate = "";
      let extractedPaymentPeriod = ""; 
      const extractedDetails: CoverageDetail[] = [];

      const lines = pasteText.split('\n').map(l => l.trim()).filter(l => l);

      const policyNumIndex = lines.findIndex(l => l.includes("증권번호"));
      if (policyNumIndex > 0) {
        extractedProduct = lines[policyNumIndex - 1];
      }

      for (const line of lines) {
        if (line.includes("보험") || line.includes("생명") || line.includes("화재") || line.includes("해상") || line.includes("공제")) {
          const companyMatch = line.match(/([가-힣]+(?:생명|화재|해상|손해|보험|공제))/);
          if (companyMatch) extractedCompany = companyMatch[1];
          break;
        }
      }

      const dateRegex = /(\d{4})[./-](\d{2})[./-](\d{2})\s*~\s*(\d{4})[./-](\d{2})[./-](\d{2})/;
      const dateMatch = pasteText.match(dateRegex);
      if (dateMatch) {
        extractedSubDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        extractedMatDate = `${dateMatch[4]}-${dateMatch[5]}-${dateMatch[6]}`;
      }

      const periodMatch = pasteText.match(/\((?:.*?납)?[,\s]*([0-9]+(?:년|세납|세|년납)|전기납|일시납)\)/) 
                       || pasteText.match(/([0-9]+(?:년납|세납|년|세)|전기납|일시납)/);

      if (periodMatch) {
        let p = periodMatch[1];
        if (!p.includes("납") && !p.includes("일시") && !p.includes("전기")) {
          p += "납";
        }
        extractedPaymentPeriod = p;
      }

      const premiumRegex = /([0-9,]+)원\s*(?:약관조회|상품공시실)/;
      const premiumMatch = pasteText.match(premiumRegex);
      if (premiumMatch) {
        extractedPremium = premiumMatch[1].replace(/,/g, "");
      } else {
        const termsIndex = lines.findIndex(l => l.includes("약관조회") || l.includes("상품공시실"));
        if (termsIndex > 0) {
          const premiumLine = lines[termsIndex - 1];
          const backupMatch = premiumLine.match(/([0-9,]+)/);
          if (backupMatch) extractedPremium = backupMatch[1].replace(/,/g, "");
        }
      }
      
      const expectedMatch = pasteText.match(/납입예정\s*([0-9,]+)원/);
      if (expectedMatch) {
        const expectedAmount = parseInt(expectedMatch[1].replace(/,/g, ""), 10);
        if (expectedAmount === 0) {
          extractedPremium = "0";
        }
      }

      for (const line of lines) {
        // ⭐️ '실손구분' 헤더도 건너뛰도록 조건 추가
        if (line.includes("보장구분") || line.includes("보장명") || line.includes("실손구분")) continue;

        // ⭐️ 정규식 고도화: 1억3,000만원 인식 및 중간 보장기간 날짜 텍스트 무시
        const coverageRegex = /^(.*?)\s+((?:\d+,?)+\s*(?:억\s*(?:\d+,?)*\s*만원|억원|만원|원))\s+(?:[\d.\-~ ]+\s+)?(정상|소멸|유지|해지)$/;
        const match = line.match(coverageRegex);
        
        if (match) {
          let rawName = match[1].trim();
          let amountStr = match[2].trim();
          let status = match[3].trim();

          if (status === "소멸" || status === "해지") continue;

          let name = rawName;

          if (rawName.includes("\t")) {
            const parts = rawName.split("\t").filter(t => t.trim() !== "");
            name = parts[parts.length - 1]; 
          } else {
            const parts = rawName.split(/\s+/);
            if (parts.length > 1) {
              if (parts[1].includes(parts[0]) || parts[0].includes(parts[1])) {
                 if (parts[0] !== "기타") parts.shift();
              }
            }
            name = parts.join(" ");
          }

          // ⭐️ 금액 파싱 고도화: 1억3,000만원 -> 13000 으로 변환
          let cleanAmount = amountStr.replace(/,/g, "").replace(/\s/g, "");
          let parsedAmountNum = 0;

          if (cleanAmount.includes("억")) {
            const parts = cleanAmount.split("억");
            const eok = parseInt(parts[0].replace(/[^0-9]/g, ""), 10) || 0;
            parsedAmountNum += eok * 10000;
            if (parts[1] && parts[1].includes("만")) {
              const man = parseInt(parts[1].replace(/[^0-9]/g, ""), 10) || 0;
              parsedAmountNum += man;
            }
          } else {
            parsedAmountNum = parseInt(cleanAmount.replace(/[^0-9]/g, ""), 10) || 0;
          }

          const finalMappedName = mapToStandardCoverage(name);

          extractedDetails.push({
            name: finalMappedName,
            amount: formatAmountWithComma(parsedAmountNum.toString()),
            renewal_type: name.includes("갱신형") ? "1년 갱신" : "비갱신"
          });
        }
      }

      setCovForm(prev => ({
        ...prev,
        company: extractedCompany || prev.company,
        product: extractedProduct || prev.product,
        premium: extractedPremium || prev.premium,
        premiumFormatted: extractedPremium ? formatAmountWithComma(extractedPremium) : prev.premiumFormatted,
        subscriptionDate: extractedSubDate || prev.subscriptionDate,
        maturityDate: extractedMatDate || prev.maturityDate,
        paymentPeriod: extractedPaymentPeriod || prev.paymentPeriod,
      }));

      if (extractedDetails.length > 0) {
        setCovDetails(extractedDetails);
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
          contractor: covForm.contractor.trim(),
          insured: covForm.insured.trim(),
          beneficiary: covForm.beneficiary.trim(),
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
              <p className="text-sm font-bold text-indigo-900">메리츠 보장분석 텍스트 파싱</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea 
                placeholder="보장분석 텍스트를 복사하여 붙여넣기 하세요."
                className="flex-1 rounded-lg border border-indigo-200 bg-white p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-14"
                value={pasteText} onChange={(e) => setPasteText(e.target.value)}
              />
              <button onClick={handleAnalyzeText} disabled={isAnalyzing} className="sm:w-28 flex items-center justify-center gap-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors hover:bg-indigo-700 disabled:opacity-50 shadow-md">
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
                {differentLifeInsurances.length > 0 && (
                  <optgroup label="[ 기타 ]">
                    {differentLifeInsurances.map((c) => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
                  </optgroup>
                )}
              </select>

              <input type="text" placeholder="상품명" className={inputClassName} value={covForm.product} onChange={(e) => setCovForm({ ...covForm, product: e.target.value })} />
              
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">계약자</label>
                <input type="text" className={inputClassName} value={covForm.contractor} onChange={(e) => setCovForm({ ...covForm, contractor: e.target.value })} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">피보험자</label>
                <input type="text" className={inputClassName} value={covForm.insured} onChange={(e) => setCovForm({ ...covForm, insured: e.target.value })} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">수익자</label>
                <input type="text" className={inputClassName} value={covForm.beneficiary} onChange={(e) => setCovForm({ ...covForm, beneficiary: e.target.value })} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">담당설계사</label>
                <input type="text" className={inputClassName} value={covForm.agent_name} onChange={(e) => setCovForm({ ...covForm, agent_name: e.target.value })} />
              </div>

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
              
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 ml-1 font-semibold">납입 기간</label>
                <select className={`${inputClassName} cursor-pointer`} value={covForm.paymentPeriod} onChange={(e) => setCovForm({ ...covForm, paymentPeriod: e.target.value })}>
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

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">세부 보장 항목</p>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-3">
              {covDetails.map((detail, index) => {
                const filteredOptions = detail.name.trim() 
                ? COVERAGE_OPTIONS.filter((opt) => opt.includes(detail.name) && opt !== detail.name)
                : [];

              return (
                <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-center p-2 sm:p-0 bg-gray-50/50 sm:bg-transparent rounded-lg border sm:border-0 border-gray-100">
                  
                  {/* ⭐️ 기본 datalist를 제거하고 자체 Dropdown이 결합된 형태의 컨테이너 구성 */}
                  <div className="relative w-full sm:w-[45%] shrink-0">
                    <input
                      type="text"
                      placeholder="특약 항목명 (검색)"
                      className={`${inputClassName} w-full text-xs font-medium`}
                      value={detail.name}
                      onChange={(e) => updateCovDetail(index, "name", e.target.value)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setTimeout(() => setFocusedIndex(null), 150)} // 클릭 이벤트 실행을 위해 약간의 지연
                      autoComplete="off"
                    />
                    
                    {/* 입력값이 있고, 포커스 상태이며, 매칭되는 검색어가 있을 때만 목록 노출 */}
                    {focusedIndex === index && filteredOptions.length > 0 && (
                      <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl py-1">
                        {filteredOptions.map((opt) => (
                          <li
                            key={opt}
                            onMouseDown={(e) => {
                              e.preventDefault(); // input 포커스 아웃(blur) 방지
                              updateCovDetail(index, "name", opt);
                              setFocusedIndex(null);
                            }}
                            className="px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="flex w-full sm:flex-1 gap-1.5 items-center">
                    <input
                      type="text"
                      placeholder="가입 금액"
                      className={`${inputClassName} flex-1 min-w-0 text-xs text-right`}
                      value={detail.amount}
                      onChange={(e) => updateCovDetail(index, "amount", e.target.value)}
                    />
                    <select
                      className={`${inputClassName} max-w-[120px] shrink-0 text-[11px] px-1 text-center font-bold text-gray-600 bg-gray-50 cursor-pointer`}
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
                      <option value="25년 갱신">25년 갱신</option>
                      <option value="30년 갱신">30년 갱신</option>
                    </select>
                    <button onClick={() => removeCovDetail(index)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0 bg-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
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
  </div>
);
}