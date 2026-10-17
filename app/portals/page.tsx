"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ExternalLink, Users, Loader2, Search, ChevronDown, FileSpreadsheet, Upload, Download } from "lucide-react";
import CompanyPortalModal, { CompanyData } from "@/components/CompanyPortalModal";

const STORAGE_BUCKET = "support-files";
const STORAGE_FOLDER = "commission";
const STORAGE_BASE_NAME = "fc_commission_rate";

function SearchableSelect({ 
  options, value, onChange, placeholder, disabled 
}: { 
  options: {value: string | number, label: string, disabled?: boolean}[], 
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
              placeholder="이름 검색..."
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
                    if (opt.disabled) return; 
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    opt.disabled
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
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

export default function PortalsPage() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);

  const [userRank, setUserRank] = useState("");
  const [myAgentId, setMyAgentId] = useState<string | null>(null);
  const [branchFCs, setBranchFCs] = useState<any[]>([]);
  const [selectedFC, setSelectedFC] = useState("");

  const [commissionFile, setCommissionFile] = useState<{ fileName: string; updatedAt: string } | null>(null);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const fetchCommissionFileInfo = async () => {
    try {
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(STORAGE_FOLDER, {
        limit: 10,
        sortBy: { column: "updated_at", order: "desc" },
      });

      if (!error && data && data.length > 0) {
        const target = data.find((f) => f.name.startsWith(STORAGE_BASE_NAME));
        if (target) {
          const dateObj = new Date(target.updated_at || target.created_at || Date.now());
          const yy = String(dateObj.getFullYear()).slice(-2);
          const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(dateObj.getDate()).padStart(2, "0");
          setCommissionFile({
            fileName: target.name,
            updatedAt: `${yy}.${mm}.${dd}`,
          });
        }
      }
    } catch (e) {
      console.warn("수수료율 파일 정보 조회 실패:", e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agentData } = await supabase.from("agents")
          .select("id, name, rank, agencies(corporation_name, branch_name)")
          .eq("auth_id", user.id)
          .single();

        if (agentData) {
          setMyAgentId(String(agentData.id));
          // ⭐️ rank가 null일 때 빈 문자열 처리 후 대문자 변환
          const rank = String(agentData.rank || "").toUpperCase();
          setUserRank(rank);

          const isOsRole = rank.includes("OS") || rank.includes("총무");

          if (isOsRole) {
            const agency = Array.isArray(agentData.agencies) ? agentData.agencies[0] : agentData.agencies;
            if (agency) {
              const { data: targetAgencies } = await supabase.from("agencies")
                .select("id").eq("corporation_name", agency.corporation_name).eq("branch_name", agency.branch_name);
              
              if (targetAgencies && targetAgencies.length > 0) {
                const agencyIds = targetAgencies.map(a => a.id);
                const { data: branchAgents } = await supabase.from("agents")
                  .select("id, name, rank").in("agency_id", agencyIds);
                  if (branchAgents) {
                    setBranchFCs(branchAgents.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR')));
                    setSelectedFC(String(agentData.id));
                  }
              }
            }
          } else {
            setSelectedFC(String(agentData.id));
          }
        }
      }

      const { data: dbCompanies, error } = await supabase
        .from("insurance_companies")
        .select("*");

      if (!error && dbCompanies) {
        const formattedCompanies: CompanyData[] = dbCompanies.map((dbData) => ({
          id: String(dbData.id),
          name: dbData.company_name,
          type: dbData.company_type as "손해보험" | "생명보험" | "기타",
          logoUrl: dbData.logo_url || undefined,
          browser: dbData.browser || undefined,
          portalUrl: dbData.portal_url || undefined,
          termsUrl: dbData.terms_url || undefined,
          claimUrl: dbData.claim_url || undefined, 
          phones: { 
            customer: dbData.phone_customer || "-", 
            inbound: dbData.phone_inbound || "-", 
            helpdesk: dbData.phone_helpdesk || "-", 
            fax: dbData.phone_fax || "-" 
          },
          cardInfo: { 
            inquiry: dbData.card_inquiry || "-", 
            method: dbData.card_method || "-", 
            apply: dbData.card_apply || "-", 
            target: dbData.card_target || "-", 
            partners: dbData.card_partners || "-" 
          }
        }));

        formattedCompanies.sort((a, b) => {
          const aIsEng = /^[a-zA-Z]/.test(a.name);
          const bIsEng = /^[a-zA-Z]/.test(b.name);
          if (aIsEng && !bIsEng) return -1;
          if (!aIsEng && bIsEng) return 1; 
          return a.name.localeCompare(b.name, 'ko-KR');
        });

        setCompanies(formattedCompanies);
      }

      await fetchCommissionFileInfo();
      setIsLoading(false);
    };

    initData();
  }, []);

  // ⭐️ ADMIN 권한 체크가 포함된 엑셀 파일 업로드 핸들러
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userRank.includes("ADMIN")) {
      alert("관리자(ADMIN) 권한이 있는 계정만 업로드할 수 있습니다.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "xls";
    if (!["xls", "xlsx", "csv"].includes(ext)) {
      alert("엑셀 파일(.xls, .xlsx, .csv)만 업로드 가능합니다.");
      return;
    }

    setIsUploadingExcel(true);
    try {
      if (commissionFile?.fileName && commissionFile.fileName !== `${STORAGE_BASE_NAME}.${ext}`) {
        await supabase.storage.from(STORAGE_BUCKET).remove([`${STORAGE_FOLDER}/${commissionFile.fileName}`]);
      }

      const targetPath = `${STORAGE_FOLDER}/${STORAGE_BASE_NAME}.${ext}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(targetPath, file, {
        cacheControl: "0",
        upsert: true,
      });

      if (error) throw error;

      await fetchCommissionFileInfo();
      alert(`[${file.name}] 파일이 성공적으로 등록(업데이트)되었습니다.`);
    } catch (err: any) {
      console.error("Excel Upload Error:", err);
      alert(`파일 업로드 실패: ${err.message}`);
    } finally {
      setIsUploadingExcel(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  const handleExcelDownload = async () => {
    if (!commissionFile) {
      alert("아직 등록된 수수료율 파일이 없습니다.");
      return;
    }

    setIsDownloadingExcel(true);
    try {
      const targetPath = `${STORAGE_FOLDER}/${commissionFile.fileName}`;
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(targetPath);
      if (error || !data) throw error || new Error("파일 데이터를 가져올 수 없습니다.");

      const ext = commissionFile.fileName.split(".").pop() || "xls";
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FC수수료율.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Excel Download Error:", err);
      alert(`다운로드 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const nonLifeCompanies = companies.filter(c => c.type === "손해보험");
  const lifeCompanies = companies.filter(c => c.type === "생명보험");
  const otherCompanies = companies.filter(c => c.type === "기타");

  const renderCompanyCard = (company: CompanyData) => {
    const isSelected = selectedCompany?.id === company.id;

    return (
      <div 
        key={company.id}
        onClick={() => setSelectedCompany(company)}
        className={`bg-white border rounded-[24px] transition-all duration-300 flex flex-col items-center justify-center p-5 aspect-[5/4] cursor-pointer group ${
          isSelected 
            ? "border-blue-500 ring-2 ring-blue-100 shadow-md bg-blue-50/10 scale-[1.02]" 
            : "border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1"
        }`}
      >
        <div className="w-24 h-24 bg-white rounded-2xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={`${company.name} 로고`} className="w-full h-full object-contain p-1" />
          ) : (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-2xl">
              <span className={`text-lg font-black ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>{company.name.substring(0, 1)}</span>
            </div>
          )}
        </div>
        <h4 className={`font-bold text-[13px] text-center tracking-tight ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{company.name}</h4>
      </div>
    );
  };

  const isOS = userRank.includes('OS') || userRank.includes('총무');
  // ⭐️ agents 테이블의 rank 컬럼에 'ADMIN'이 포함된 계정만 업로드 가능
  const isAdmin = userRank.includes('ADMIN');
  const canUploadFile = isAdmin;

  const targetAgentId = isOS ? selectedFC : myAgentId;
  const targetAgentName = branchFCs.find(fc => String(fc.id) === selectedFC)?.name || null;

  return (
    <div className="w-full mx-auto max-w-[1800px] p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
      <div className="flex-1 w-full min-w-0 space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <ExternalLink className="w-7 h-7 text-blue-600" /> 전산망 및 업무 지원
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              각 보험사의 전산망 접속 및 고객센터, 팩스번호, 결제 정보를 한곳에서 확인하세요.
            </p>
          </div>

          {isOS && (
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center gap-3 w-full md:w-[260px] shrink-0 shadow-sm animate-in fade-in">
              <Users className="w-5 h-5 text-indigo-500 shrink-0" />
              <div className="w-full">
                <SearchableSelect
                  placeholder="담당 FC 선택"
                  value={selectedFC}
                  onChange={setSelectedFC}
                  options={branchFCs.map(fc => ({
                    value: fc.id,
                    label: `${fc.name} ${fc.rank || ''}`.trim()
                  }))}
                />
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm font-bold text-gray-500">보험사 정보를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-lg font-black text-slate-800 mb-4 ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 업무 지원 사이트
              </h2>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <a 
                  href="https://fc.t-fs.co.kr/main/login.php"
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50 rounded-2xl px-5 py-4 transition-all shadow-sm hover:shadow-md cursor-pointer group w-full sm:w-auto min-w-[200px]"
                >
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-sm">T금융서비스</span>
                    <span className="text-[11px] font-bold text-slate-400">인트라넷</span>
                  </div>
                </a>
                <div
                  onClick={handleExcelDownload}
                  className="relative flex items-center gap-3 bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-2xl px-5 py-4 transition-all shadow-sm hover:shadow-md cursor-pointer group w-full sm:w-auto min-w-[220px]"
                >
                  {canUploadFile && (
                    <input
                      type="file"
                      accept=".xls,.xlsx,.csv"
                      ref={excelInputRef}
                      onChange={handleExcelUpload}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden"
                    />
                  )}
                  <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
                    {isDownloadingExcel || isUploadingExcel ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5" />
                    )}
                  </div>
                  <div className={`flex flex-col ${canUploadFile ? "pr-6" : ""}`}>
                    <span className="font-black text-slate-800 text-sm flex items-center gap-1">
                      바른지사 수수료율
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {isUploadingExcel
                        ? "업로드 중..."
                        : commissionFile
                        ? `엑셀 다운로드 (${commissionFile.updatedAt})`
                        : "파일 미등록"}
                    </span>
                  </div>

                  {canUploadFile && (
                    <button
                      type="button"
                      title="새 엑셀 파일 업로드(교체) - ADMIN 전용"
                      onClick={(e) => {
                        e.stopPropagation();
                        excelInputRef.current?.click();
                      }}
                      disabled={isUploadingExcel}
                      className="cursor-pointer absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-100/80 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <a 
                  href="https://onedrive.live.com/?id=%2Fpersonal%2Fb107f7f63d3aa2b1%2FDocuments%2F%EC%99%B8%EB%B6%80%5F%EA%B3%B5%EC%9C%A0%ED%8C%8C%EC%9D%BC%28%EC%8B%9C%EC%B1%85%2C%EC%84%A4%EB%AA%85%ED%9A%8C%29%2F%F0%9F%8F%861%EB%93%B1%20%5B%20%EC%8B%9C%EC%B1%85%20%ED%8C%8C%EC%9D%BC%20%5D%F0%9F%9A%A8%EB%B9%84%EA%B5%90%ED%95%B4%20%EB%B3%B4%EC%84%B8%EC%9A%94%28T%EA%B8%88%EC%9C%B5%29&listurl=%2Fpersonal%2Fb107f7f63d3aa2b1%2FDocuments&sortField=LinkFilename&isAscending=true&viewid=073e6ad3%2D1ca0%2D4361%2Dbeff%2Da4bfebbbbd79&redeem=aHR0cHM6Ly8xZHJ2Lm1zL2YvYy9iMTA3ZjdmNjNkM2FhMmIxL0VyR2lPajMyOXdjZ2dMRXh3Z0FBQUFBQmFfQV9aUUxvXzB4d2NYY0NiYnh6cWc%5FZT1zN0dNNFU&ga=1"
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50 rounded-2xl px-5 py-4 transition-all shadow-sm hover:shadow-md cursor-pointer group w-full sm:w-auto min-w-[200px]"
                >
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-sm">바른지사 시책표</span>
                    <span className="text-[11px] font-bold text-slate-400">보험사 모든 시책표</span>
                  </div>
                </a>
                <a 
                  href="https://az.bojang114.com/index_real.html"
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50 rounded-2xl px-5 py-4 transition-all shadow-sm hover:shadow-md cursor-pointer group w-full sm:w-auto min-w-[200px]"
                >
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-sm">보장114</span>
                    <span className="text-[11px] font-bold text-slate-400">간편보장분석</span>
                  </div>
                </a>
                <a 
                  href="https://gaworld.kr/infra"
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50 rounded-2xl px-5 py-4 transition-all shadow-sm hover:shadow-md cursor-pointer group w-full sm:w-auto min-w-[200px]"
                >
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-sm">GAWORLD</span>
                    <span className="text-[11px] font-bold text-slate-400">보험사전산, 환급률 계산 등</span>
                  </div>
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-black text-slate-800 mb-4 ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 생명보험사
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3 sm:gap-4">
                {lifeCompanies.map(renderCompanyCard)}
              </div>
            </section>
            <section>
              <h2 className="text-lg font-black text-slate-800 mb-4 ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 손해보험사
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3 sm:gap-4">
                {nonLifeCompanies.map(renderCompanyCard)}
              </div>
            </section>

            {otherCompanies.length > 0 && (
              <section>
                <h2 className="text-lg font-black text-slate-800 mb-4 ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 기타 보험 및 공제
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3 sm:gap-4">
                  {otherCompanies.map(renderCompanyCard)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      
      {selectedCompany && !isLoading && (
        <div className="w-[380px] xl:w-[420px] shrink-0 hidden lg:block transition-all duration-300"></div>
      )}

      {selectedCompany && !isLoading && (
        <div className="fixed top-0 right-0 w-[380px] xl:w-[420px] h-screen z-50 animate-in fade-in slide-in-from-right-8 duration-300 hidden lg:block border-l border-gray-200 bg-white shadow-2xl">
          <CompanyPortalModal 
            isOpen={!!selectedCompany} 
            onClose={() => setSelectedCompany(null)} 
            company={selectedCompany}
            targetAgentId={targetAgentId} 
            targetAgentName={targetAgentName} 
            isOS={isOS} 
          />
        </div>
      )}

      <div className="lg:hidden">
        <CompanyPortalModal 
          isOpen={!!selectedCompany && !isLoading} 
          onClose={() => setSelectedCompany(null)} 
          company={selectedCompany}
          targetAgentId={targetAgentId}
          targetAgentName={targetAgentName}
          isOS={isOS}
        />
      </div>

    </div>
  );
}