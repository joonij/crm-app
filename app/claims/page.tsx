"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Search, Clock, CheckCircle2, Download, 
  AlertCircle, RefreshCw, FileBox, Loader2, ChevronDown, Users 
} from "lucide-react";

import QuickClaimModal from "@/components/QuickClaimModal";

const SUPPORTED_COMPANIES = [
  "흥국생명", "라이나생명",
  "메리츠화재", "현대해상", "DB손해", "삼성화재", "한화손해", "KB손해"
];

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

// ==========================================
// ⭐️ [신규 추가] SearchableSelect 개별 옵션 Disabled 지원
// ==========================================
function SearchableSelect({ 
  options, value, onChange, placeholder, disabled 
}: { 
  options: {value: string | number, label: string, disabled?: boolean}[], // disabled 속성 추가
  value: string | number, 
  onChange: (val: any) => void, 
  placeholder: string, 
  disabled?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border text-sm font-bold rounded-xl px-3 py-2.5 flex items-center justify-between transition-all ${
          disabled 
            ? 'bg-gray-100 border-indigo-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white border-indigo-200 text-gray-700 cursor-pointer focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100'
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Search className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
            <input
              type="text"
              className="w-full text-sm bg-transparent outline-none placeholder:font-normal"
              placeholder="이름이나 번호로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">검색 결과가 없습니다.</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    if (opt.disabled) return; // ⭐️ disabled 이면 클릭 무시
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    opt.disabled
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed' // ⭐️ 비활성화 디자인
                      : String(value) === String(opt.value) 
                        ? 'bg-indigo-50 text-indigo-700 font-bold cursor-pointer' 
                        : 'hover:bg-gray-50 text-gray-700 cursor-pointer'
                  }`}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// ⭐️ 메인 페이지 컴포넌트
// ==========================================
export default function ClaimManagementPage() {
  const [agentRank, setAgentRank] = useState(""); 
  
  const [branchFCs, setBranchFCs] = useState<any[]>([]); 
  const [selectedFC, setSelectedFC] = useState(""); 
  
  const [fcClients, setFcClients] = useState<any[]>([]); 
  const [selectedClient, setSelectedClient] = useState(""); 
  
  const [clientInsurances, setClientInsurances] = useState<any[]>([]); 
  const [selectedInsurance, setSelectedInsurance] = useState("");

  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<{company_type: string, company_name: string}[]>([]);
  const [selectedNewCompany, setSelectedNewCompany] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [displayCount, setDisplayCount] = useState(20);

  const [modalClient, setModalClient] = useState<any>(null);
  const [modalInsurance, setModalInsurance] = useState<any>(null);

  const sortNameEngThenKor = (a: {name: string}, b: {name: string}) => {
    const nameA = a.name || "";
    const nameB = b.name || "";
    const aIsEng = /^[a-zA-Z]/.test(nameA);
    const bIsEng = /^[a-zA-Z]/.test(nameB);
    if (aIsEng && !bIsEng) return -1; 
    if (!aIsEng && bIsEng) return 1;  
    return nameA.localeCompare(nameB, 'ko-KR'); 
  };

  const isSupportedCompany = (companyName: string) => SUPPORTED_COMPANIES.some(c => (companyName || "").includes(c));

  useEffect(() => {
    setDisplayCount(20);
  }, [searchTerm]);

  useEffect(() => {
    if (!selectedFC) { setFcClients([]); setSelectedClient(""); return; }
    const fetchClients = async () => {
      const { data } = await supabase.from("clients").select("*").eq("agent_id", selectedFC);
      if (data) {
        setFcClients(data.sort(sortNameEngThenKor));
      }
    };
    fetchClients();
  }, [selectedFC]);

  useEffect(() => {
    if (!selectedClient) { setClientInsurances([]); setSelectedInsurance(""); return; }
    const fetchInsurances = async () => {
      const { data, error } = await supabase
        .from("subscription_insurance") 
        .select("*")
        .eq("client_id", selectedClient);
        
      if (error) {
        console.error("❌ 보험 리스트 에러:", error.message);
        alert(`보험 정보를 불러오지 못했습니다. (에러: ${error.message})`);
      }
      
      if (data) setClientInsurances(data);
    };
    fetchInsurances();
  }, [selectedClient]);

  const handleOsClaimStart = () => {
    if (!selectedFC || !selectedClient || !selectedInsurance) {
      return alert("직원, 고객, 보험을 모두 선택해주세요.");
    }
    const actualClient = fcClients.find(c => String(c.id) === String(selectedClient));
    const actualInsurance = clientInsurances.find(i => String(i.id) === String(selectedInsurance));

    setModalClient(actualClient);
    setModalInsurance(actualInsurance);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      const { data: compData } = await supabase.from("insurance_companies").select("company_type, company_name");
      if (compData && compData.length > 0) {
        setInsuranceCompanies(compData);
      } else {
        setInsuranceCompanies([
          { company_type: "손해보험", company_name: "메리츠화재" }, { company_type: "손해보험", company_name: "현대해상" },
          { company_type: "손해보험", company_name: "DB손해" }, { company_type: "손해보험", company_name: "삼성화재" },
          { company_type: "손해보험", company_name: "KB손해" }, { company_type: "손해보험", company_name: "한화손해" },
          { company_type: "손해보험", company_name: "흥국화재" }, { company_type: "손해보험", company_name: "롯데손해" },
          { company_type: "생명보험", company_name: "삼성생명" }, { company_type: "생명보험", company_name: "교보생명" },
          { company_type: "생명보험", company_name: "흥국생명" },
        ]);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: agent } = await supabase
          .from("agents")
          .select(`id, rank, agency_id, agencies ( corporation_name, branch_name )`)
          .eq("auth_id", user.id)
          .single();

        if (agent) {
          setAgentRank(agent.rank); 

          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

          // ⭐️ [공통] 해당 계정(agent.id)이 청구한 리스트만 하단에 노출되도록 통일!
          const { data: myClaims } = await supabase
            .from("claims")
            .select("*")
            .eq("agent_id", agent.id) 
            .gte("created_at", firstDayOfMonth) 
            .order("created_at", { ascending: false });

          if (myClaims) setClaims(myClaims);

          // ⭐️ [OS 전용] OS 계정일 경우, 상단 데스크에 띄워줄 지점 FC 목록만 추가로 불러옵니다.
          if (agent.rank === 'OS') {
            const corpName = agent.agencies.corporation_name;
            const branchName = agent.agencies.branch_name;

            const { data: targetAgencies } = await supabase
              .from("agencies")
              .select("id")
              .eq("corporation_name", corpName)
              .eq("branch_name", branchName);

            if (targetAgencies && targetAgencies.length > 0) {
              const agencyIds = targetAgencies.map(a => a.id);

              const { data: branchAgents } = await supabase
                .from("agents")
                .select("id, name, rank") 
                .in("agency_id", agencyIds);

              if (branchAgents && branchAgents.length > 0) {
                setBranchFCs(branchAgents.sort(sortNameEngThenKor)); 
              }
            }
          }
        }
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  const handleOpenModal = () => {
    if (!selectedNewCompany) return alert("청구서를 작성할 보험사를 먼저 선택해주세요.");
    const isSupported = isSupportedCompany(selectedNewCompany);
    if (!isSupported) return alert("아직 작성되지 않은 청구서 양식입니다. 관리자에게 문의 남겨주세요.");
    
    setModalClient({ id: "0", name: "", phone: "", registration_number: "" });
    setModalInsurance({ 
      insurance_company: selectedNewCompany, 
      product_name: "보험금 청구서", 
      contractor_name: "", insured_name: "", beneficiary_name: "" 
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: number, currentStatus: ClaimStatus) => {
    const nextStatus: Record<ClaimStatus, ClaimStatus> = { 'pending': 'completed', 'completed': 'rejected', 'rejected': 'pending' };
    const updatedStatus = nextStatus[currentStatus];
    const { error } = await supabase.from("claims").update({ status: updatedStatus }).eq("id", id);
    if (!error) setClaims(claims.map(c => c.id === id ? { ...c, status: updatedStatus } : c));
  };

  const handleDownloadPDF = (url: string | null) => {
    if (!url) return alert("저장된 PDF 파일이 만료되었거나 존재하지 않습니다.");
    window.open(url, '_blank');
  };

  const sortEngThenKor = (a: {company_name: string}, b: {company_name: string}) => {
    const aIsEng = /^[a-zA-Z]/.test(a.company_name);
    const bIsEng = /^[a-zA-Z]/.test(b.company_name);
    if (aIsEng && !bIsEng) return -1; 
    if (!aIsEng && bIsEng) return 1;  
    return a.company_name.localeCompare(b.company_name, 'ko-KR'); 
  };

  const nonLifeCompanies = insuranceCompanies.filter(c => c.company_type === "손해보험").sort(sortEngThenKor);
  const lifeCompanies = insuranceCompanies.filter(c => c.company_type === "생명보험").sort(sortEngThenKor);
  const otherCompanies = insuranceCompanies.filter(c => c.company_type !== "생명보험" && c.company_type !== "손해보험").sort(sortEngThenKor);

  const filteredClaims = claims.filter(c => c.client_name.includes(searchTerm) || c.insurance_company.includes(searchTerm));
  const displayedClaims = filteredClaims.slice(0, displayCount);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastClaimElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayCount < filteredClaims.length) {
        setDisplayCount(prev => prev + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, displayCount, filteredClaims.length]);

  const pendingCount = claims.filter(c => c.status === 'pending').length;
  const completedCount = claims.filter(c => c.status === 'completed').length;

  return (
    <div className="w-full mx-auto max-w-[1000px] space-y-6 p-4 md:p-8 pb-24">
      
      {/* 👑 OS 통합 청구 지원 데스크 */}
      {agentRank === 'OS' && (
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl shadow-sm mb-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> OS 통합 청구 지원 데스크
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* 1. 담당자 선택 (검색 가능) */}
            <SearchableSelect
              placeholder="1. 담당자 선택"
              value={selectedFC}
              onChange={setSelectedFC}
              options={branchFCs.map(fc => ({
                value: fc.id,
                label: `${fc.name} ${fc.rank || ''}`.trim()
              }))}
            />

            {/* 2. 고객 선택 (검색 가능) */}
            <SearchableSelect
              placeholder="2. 고객 선택"
              value={selectedClient}
              onChange={setSelectedClient}
              disabled={!selectedFC}
              options={fcClients.map(client => ({
                value: client.id,
                label: `${client.name} (${client.phone || "번호없음"})`
              }))}
            />

            {/* ⭐️ 3. 청구할 보험 선택 (검색 가능 + 미지원 시 Disabled 처리) */}
            <SearchableSelect
              placeholder="3. 청구할 보험 선택"
              value={selectedInsurance}
              onChange={setSelectedInsurance}
              disabled={!selectedClient}
              options={clientInsurances.map(ins => {
                const isSupported = isSupportedCompany(ins.insurance_company);
                return {
                  value: ins.id,
                  label: `[${ins.insurance_company}] ${ins.product_name} ${!isSupported ? '- 준비중' : ''}`,
                  disabled: !isSupported // ⭐️ 배열에 없으면 선택 불가!
                };
              })}
            />

            <button 
              onClick={handleOsClaimStart}
              disabled={!selectedInsurance}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-bold rounded-xl px-3 py-2.5 transition-colors shadow-sm cursor-pointer"
            >
              청구서 모달 열기
            </button>
          </div>
        </div>
      )}
      
      {/* 상단 헤더 & 보험사 선택 컨트롤 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <FileBox className="w-7 h-7 text-blue-600" /> 이번 달 청구 관리
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">이번 달에 진행된 고객의 보험금 청구 이력을 관리합니다.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-48">
            <select 
              value={selectedNewCompany}
              onChange={(e) => setSelectedNewCompany(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all cursor-pointer"
            >
              <option value="" disabled>보험사 선택</option>
              
              <optgroup label="생명보험사">
                {lifeCompanies.map(c => (
                  <option 
                    key={c.company_name} 
                    value={c.company_name} 
                    disabled={!isSupportedCompany(c.company_name)}
                  >
                    {!isSupportedCompany(c.company_name) && "- 준비중 : "}{c.company_name} 
                  </option>
                ))}
              </optgroup>
              
              <optgroup label="손해보험사">
                {nonLifeCompanies.map(c => (
                  <option 
                    key={c.company_name} 
                    value={c.company_name} 
                    disabled={!isSupportedCompany(c.company_name)}
                  >
                    {!isSupportedCompany(c.company_name) && "- 준비중 : "}{c.company_name} 
                  </option>
                ))}
              </optgroup>
              
              {otherCompanies.length > 0 && (
                <optgroup label="기타">
                  {otherCompanies.map(c => (
                    <option 
                      key={c.company_name} 
                      value={c.company_name} 
                      disabled={!isSupportedCompany(c.company_name)}
                    >
                      {!isSupportedCompany(c.company_name) && "- 준비중 : "}{c.company_name} 
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <button 
            onClick={handleOpenModal}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-200 shrink-0"
          >
            <Plus className="w-4 h-4" /> 새 청구서 작성
          </button>
        </div>
      </div>

      {/* 통계 대시보드 */}
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

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="고객 이름이나 보험사로 검색하세요..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"/>
      </div>

      {/* 청구 내역 리스트 */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />데이터를 불러오는 중입니다...</div>
        ) : displayedClaims.length === 0 ? (
          <div className="py-12 text-center text-gray-400 bg-white border border-dashed border-gray-300 rounded-2xl">이번 달 청구 내역이 없습니다.</div>
        ) : (
          displayedClaims.map((claim, index) => {
            const isLastElement = displayedClaims.length === index + 1;
            
            return (
              <div 
                key={claim.id} 
                ref={isLastElement ? lastClaimElementRef : null} 
                className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2.5">
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
                <div className="flex gap-2 shrink-0 border-t border-gray-100 md:border-0 pt-3 md:pt-0">
                  <button onClick={() => handleDownloadPDF(claim.pdf_url)} className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
                    <Download className="w-3.5 h-3.5" /> PDF 다운
                  </button>
                  <button onClick={() => handleDownloadPDF(claim.pdf_url)} className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 px-3.5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> 팩스 재청구
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <QuickClaimModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        client={modalClient} 
        insurance={modalInsurance} 
      />

    </div>
  );
}