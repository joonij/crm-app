"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Plus, Users, X, CheckSquare, Square, BarChart3, Phone, Search, Crown, UserPlus } from "lucide-react";
import ClientModal from "@/components/ClientModal";
import { supabase } from "@/lib/supabase";
import Link from 'next/link';

type Client = {
  id: number;
  name: string;
  phone: string | null;
  progress_status: string | null;
  recruiting_status: string | null;
  contract_status: string | number | null;
  introduce_client: number | null;
  isKeyman?: boolean;
};

const contractStatusMap: Record<string, string> = {
  "1": "계약완료",
  "2": "계약진행",
  "3": "계약보류",
  "4": "계약거절",
  "5": "계약해지",
};

const contractStatusStyleMap: Record<string, string> = {
  "1": "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100/70",
  "2": "bg-green-50 text-green-700 border-green-200/80 hover:bg-green-100/70",
  "3": "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/70",
  "4": "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100/70",
  "5": "bg-red-50 text-red-700 border-red-200/80 hover:bg-red-100/70",
};

const SALES_STEPS = [
  { id: "step01", label: "첫 연락 (TA)" },
  { id: "step02", label: "1차 미팅 픽스" },
  { id: "step03", label: "1차 미팅 진행" },
  { id: "step04", label: "기본 인적사항 확보" },
  { id: "step05", label: "보험심사평가원 확보" },
  { id: "step06", label: "상담 요청" },
  { id: "step07", label: "비교분석표 작성" },
  { id: "step08", label: "고등요청" },
  { id: "step09", label: "설계요청" },
  { id: "step10", label: "추가 미팅 픽스" },
  { id: "step11", label: "추가 미팅 진행" },
  { id: "step12", label: "청약 진행" },
  { id: "step13", label: "모니터링 처리" },
  { id: "step14", label: "소개 요청" },
  { id: "step15", label: "증권 전달" },
];

const RECRUITING_STEPS = [
  { id: "rec01", label: "후보자 발굴" },
  { id: "rec02", label: "비전 제시" },
  { id: "rec03", label: "소득 설명" },
  { id: "rec04", label: "제도 설명" },
  { id: "rec05", label: "지점장/본부장 면접" },
  { id: "rec06", label: "입사 지원" },
  { id: "rec07", label: "보험연수원 40H 교육 연수" },
  { id: "rec08", label: "생명보험 자격시험 접수" },
  { id: "rec09", label: "생명보험 자격시험 합격" },
  { id: "rec10", label: "손해보험 자격시험 접수" },
  { id: "rec11", label: "손해보험 자격시험 합격" },
  { id: "rec12", label: "변액보험 자격시험 접수" },
  { id: "rec13", label: "변액보험 자격시험 합격" },
  { id: "rec14", label: "제3보험 자격시험 접수" },
  { id: "rec15", label: "제3보험 자격시험 합격" },
  { id: "rec16", label: "위촉 필요 서류 안내" },
  { id: "rec17", label: "협회 코드 발급 완료" },
  { id: "rec18", label: "신입 교육 참석" },
];

const parseSteps = (statusString: string | null): string[] => {
  if (!statusString) return [];
  try {
    const parsed = JSON.parse(statusString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  
  const [progressModalClient, setProgressModalClient] = useState<Client | null>(null);
  const [recruitingModalClient, setRecruitingModalClient] = useState<Client | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  // ⭐️ "all", "keyman", 혹은 계약상태 ID ("1", "2" 등)를 담는 상태
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("데이터 불러오기 에러:", error.message);
      setClients([]);
      return;
    }

    const fetchedData = data || [];

    const introCounts = fetchedData.reduce((acc, curr) => {
      if (curr.introduce_client) {
        acc[curr.introduce_client] = (acc[curr.introduce_client] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const clientsWithKeyman = fetchedData.map(client => ({
      ...client,
      isKeyman: (introCounts[client.id] || 0) >= 3
    }));

    setClients(clientsWithKeyman);
  }, []);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    const cleanSearchTerm = searchTerm.replace(/[-\s]/g, "").toLowerCase();

    return clients.filter((client) => {
      const cleanPhone = client.phone ? client.phone.replace(/[-\s]/g, "") : "";
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cleanPhone.includes(cleanSearchTerm);
      
      // ⭐️ 필터 분기 로직 강화
      let matchesStatus = false;
      if (statusFilter === "all") {
        matchesStatus = true;
      } else if (statusFilter === "keyman") {
        matchesStatus = !!client.isKeyman; // 키맨인 경우만 통과
      } else {
        const clientStatusId = client.contract_status !== null ? String(client.contract_status) : "";
        matchesStatus = clientStatusId === statusFilter;
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);
  
  const handleStatusChange = async (clientId: number, newStatusId: string) => {
    setClients((prev) =>
      prev ? prev.map((c) => (c.id === clientId ? { ...c, contract_status: newStatusId } : c)) : null
    );
    setEditingClientId(null);

    const { error } = await supabase
      .from("clients")
      .update({ contract_status: newStatusId })
      .eq("id", clientId);

    if (error) {
      console.error("DB 업데이트 에러 상세:", JSON.stringify(error, null, 2));
      alert(`계약 상태 변경 실패!\n원인: ${error.message}`);
      void fetchClients();
    }
  };

  const handleToggleStep = async (stepId: string) => {
    if (!progressModalClient) return;

    const currentSteps = parseSteps(progressModalClient.progress_status);
    const isCompleted = currentSteps.includes(stepId);
    
    const newSteps = isCompleted
      ? currentSteps.filter((id) => id !== stepId)
      : [...currentSteps, stepId];

    const newStatusString = JSON.stringify(newSteps);

    setProgressModalClient({ ...progressModalClient, progress_status: newStatusString });
    setClients((prev) =>
      prev ? prev.map((c) => (c.id === progressModalClient.id ? { ...c, progress_status: newStatusString } : c)) : null
    );

    const { error } = await supabase
      .from("clients")
      .update({ progress_status: newStatusString }) 
      .eq("id", progressModalClient.id);

    if (error) {
      console.error("DB 업데이트 에러 상세:", JSON.stringify(error, null, 2));
      alert(`영업 프로세스 업데이트 실패!\n원인: ${error.message}`);
      void fetchClients();
    }
  };

  const handleToggleRecruitingStep = async (stepId: string) => {
    if (!recruitingModalClient) return;

    const currentSteps = parseSteps(recruitingModalClient.recruiting_status);
    const isCompleted = currentSteps.includes(stepId);
    
    const newSteps = isCompleted
      ? currentSteps.filter((id) => id !== stepId)
      : [...currentSteps, stepId];

    const newStatusString = JSON.stringify(newSteps);

    setRecruitingModalClient({ ...recruitingModalClient, recruiting_status: newStatusString });
    setClients((prev) =>
      prev ? prev.map((c) => (c.id === recruitingModalClient.id ? { ...c, recruiting_status: newStatusString } : c)) : null
    );

    const { error } = await supabase
      .from("clients")
      .update({ recruiting_status: newStatusString }) 
      .eq("id", recruitingModalClient.id);

    if (error) {
      console.error("DB 업데이트 에러 상세:", JSON.stringify(error, null, 2));
      alert(`리쿠르팅 프로세스 업데이트 실패!\n원인: ${error.message}`);
      void fetchClients();
    }
  };

  if (clients === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500 font-bold">고객 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-[1400px] space-y-6 md:space-y-8 p-4 md:p-8 relative pb-20">
      
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 md:p-7 shadow-sm flex flex-col gap-5 md:gap-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Client Management</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              고객 관리
            </h1>
            <p className="mt-2 text-sm text-gray-500">등록된 고객 정보를 조회하고 관리합니다.</p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 shrink-0 shadow-sm"
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
            새 고객 등록
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center bg-gray-50/70 p-2 md:p-3 rounded-xl border border-gray-100">
          
          <div className="relative w-full lg:w-[320px] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="이름이나 전화번호로 검색..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex w-full gap-2 overflow-x-auto pt-1 pb-1 lg:pt-0 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button 
              onClick={() => setStatusFilter("all")} 
              className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${statusFilter === "all" ? "bg-gray-900 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              전체
            </button>
            
            {/* ⭐️ 키맨 전용 필터 버튼 추가 */}
            <button 
              onClick={() => setStatusFilter("keyman")} 
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                statusFilter === "keyman" 
                  ? "bg-amber-500 text-white shadow-sm border-amber-500" 
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-amber-50"
              }`}
            >
              <Crown className={`w-4 h-4 ${statusFilter === "keyman" ? "text-white" : "text-amber-500"}`} />
              키맨
            </button>

            {Object.entries(contractStatusMap).map(([idKey, label]) => (
              <button 
                key={idKey} 
                onClick={() => setStatusFilter(idKey)}
                className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${statusFilter === idKey ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        
        {/* 💻 데스크탑 뷰 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                {["이름", "", "영업 진행률", "리쿠르팅 진행률", "계약상태", "연락처"].map((header, idx) => (
                  <th key={idx} scope="col" className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {clients.length === 0 
                      ? "등록된 고객이 없습니다. 새 고객을 등록해주세요." 
                      : "검색 조건에 맞는 고객이 없습니다."}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const completedSteps = parseSteps(client.progress_status);
                  const progressPercent = Math.round((completedSteps.length / SALES_STEPS.length) * 100);
                  
                  const completedRecSteps = parseSteps(client.recruiting_status);
                  const recPercent = Math.round((completedRecSteps.length / RECRUITING_STEPS.length) * 100);
                  
                  const clientStatusId = client.contract_status !== null ? String(client.contract_status) : "";

                  return (
                    <tr key={client.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link href={`/clients/${client.id}`} className="block text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors py-1.5">
                            {client.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {client.isKeyman && (
                            <span className="flex items-center gap-1 px-2 py-1 h-8 border-gray-200 text-[14px] font-black rounded border shadow-sm mt-0.5">
                              <Crown className="w-4 h-4 text-amber-500" /> 키맨
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* 영업 진행률 */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group/progress p-1 -ml-1 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => setProgressModalClient(client)}
                          title="영업 진행률 체크리스트 열기"
                        >
                          <div className="w-28 bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200/50">
                            <div className={`h-2.5 rounded-full transition-all duration-500 ${progressPercent === 100 ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${progressPercent}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-600 group-hover/progress:text-blue-600 w-12">
                            {completedSteps.length} / {SALES_STEPS.length}
                          </span>
                        </div>
                      </td>

                      {/* 리쿠르팅 진행률 */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group/recruiting p-1 -ml-1 rounded-lg hover:bg-purple-50 transition-colors"
                          onClick={() => setRecruitingModalClient(client)}
                          title="리쿠르팅 진행률 체크리스트 열기"
                        >
                          <div className="w-28 bg-purple-100/50 rounded-full h-2.5 overflow-hidden border border-purple-200/50">
                            <div className={`h-2.5 rounded-full transition-all duration-500 ${recPercent === 100 ? "bg-green-500" : "bg-purple-600"}`} style={{ width: `${recPercent}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-600 group-hover/recruiting:text-purple-600 w-12">
                            {completedRecSteps.length} / {RECRUITING_STEPS.length}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-600">
                        <div className="flex items-center h-8 w-28">
                          {editingClientId === client.id ? (
                            <select
                              value={clientStatusId}
                              onChange={(e) => handleStatusChange(client.id, e.target.value)}
                              onBlur={() => setEditingClientId(null)}
                              className="w-full h-8 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            >
                              <option value="">선택 안함</option>
                              {Object.entries(contractStatusMap).map(([idKey, label]) => (
                                <option key={idKey} value={idKey}>{label}</option>
                              ))}
                            </select>
                          ) : (
                            <span
                              onClick={() => setEditingClientId(client.id)}
                              className={`w-full h-7 inline-flex items-center justify-center rounded-md border text-xs font-bold cursor-pointer transition-all shadow-sm ${contractStatusStyleMap[clientStatusId] || "bg-gray-50 text-gray-400 border-gray-200 border-dashed hover:bg-gray-100"}`}
                              title="클릭하여 상태 변경"
                            >
                              {contractStatusMap[clientStatusId] || "미지정"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500">
                        <div className="flex items-center h-8">{client.phone ?? "-"}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 📱 모바일 뷰 */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100 bg-gray-50/30">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              {clients.length === 0 ? "등록된 고객이 없습니다." : "검색 조건에 맞는 고객이 없습니다."}
            </div>
          ) : (
            filteredClients.map((client) => {
              const completedSteps = parseSteps(client.progress_status);
              const progressPercent = Math.round((completedSteps.length / SALES_STEPS.length) * 100);
              
              const completedRecSteps = parseSteps(client.recruiting_status);
              const recPercent = Math.round((completedRecSteps.length / RECRUITING_STEPS.length) * 100);

              const clientStatusId = client.contract_status !== null ? String(client.contract_status) : "";

              return (
                <div key={client.id} className="p-4 flex flex-col gap-4 bg-white hover:bg-gray-50 transition-colors">
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Link href={`/clients/${client.id}`} className="text-lg font-extrabold text-gray-900 hover:text-blue-600">
                        {client.name}
                      </Link>
                      {client.isKeyman && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200/80 text-[10px] font-black rounded border shadow-sm">
                          <Crown className="w-3 h-3 text-amber-500" /> 키맨
                        </span>
                      )}
                    </div>
                    
                    <div className="h-8 w-24">
                      {editingClientId === client.id ? (
                        <select
                          value={clientStatusId}
                          onChange={(e) => handleStatusChange(client.id, e.target.value)}
                          onBlur={() => setEditingClientId(null)}
                          className="w-full h-8 rounded-md border border-gray-300 bg-white px-1 py-1 text-[11px] font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
                          autoFocus
                        >
                          <option value="">선택 안함</option>
                          {Object.entries(contractStatusMap).map(([idKey, label]) => (
                            <option key={idKey} value={idKey}>{label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingClientId(client.id)}
                          className={`w-full h-7 inline-flex items-center justify-center rounded border text-[11px] font-bold cursor-pointer transition-all shadow-sm ${contractStatusStyleMap[clientStatusId] || "bg-gray-50 text-gray-400 border-gray-200 border-dashed"}`}
                        >
                          {contractStatusMap[clientStatusId] || "미지정"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="flex flex-col gap-1.5 cursor-pointer group"
                      onClick={() => setProgressModalClient(client)}
                    >
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-semibold text-gray-500 group-hover:text-blue-600">영업 진행률</span>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">{completedSteps.length}/{SALES_STEPS.length}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200/50">
                        <div className={`h-2.5 rounded-full transition-all duration-500 ${progressPercent === 100 ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>

                    <div 
                      className="flex flex-col gap-1.5 cursor-pointer group"
                      onClick={() => setRecruitingModalClient(client)}
                    >
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-semibold text-gray-500 group-hover:text-purple-600">도입 진행률</span>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-purple-600">{completedRecSteps.length}/{RECRUITING_STEPS.length}</span>
                      </div>
                      <div className="w-full bg-purple-100/50 rounded-full h-2.5 overflow-hidden border border-purple-200/50">
                        <div className={`h-2.5 rounded-full transition-all duration-500 ${recPercent === 100 ? "bg-green-500" : "bg-purple-600"}`} style={{ width: `${recPercent}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{client.phone || "연락처 미등록"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {isModalOpen && (
        <ClientModal onClose={() => setIsModalOpen(false)} onSuccess={() => void fetchClients()} />
      )}

      {/* 🔵 영업 진행 상황 모달 */}
      {progressModalClient && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 md:p-4 transition-opacity animate-in fade-in"
          onClick={() => setProgressModalClient(null)} 
        >
          <div 
            className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 md:zoom-in-95"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="px-5 md:px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl shrink-0">
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" /> 
                  영업 진행 상황
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  <strong className="text-blue-600">{progressModalClient.name}</strong> 고객님의 영업 진행도입니다.
                </p>
              </div>
              <button 
                onClick={() => setProgressModalClient(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 md:px-6 py-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pb-safe">
              {SALES_STEPS.map((step, index) => {
                const currentSteps = parseSteps(progressModalClient.progress_status);
                const isChecked = currentSteps.includes(step.id);
                
                return (
                  <div 
                    key={step.id}
                    onClick={() => handleToggleStep(step.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked 
                        ? "bg-blue-50 border-blue-200 shadow-sm" 
                        : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="shrink-0">
                      {isChecked ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isChecked ? "text-blue-900" : "text-gray-600"}`}>
                        <span className="text-xs text-gray-400 font-normal mr-1.5">{index + 1}.</span>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 md:rounded-b-2xl shrink-0 text-center pb-safe">
              <p className="text-[11px] md:text-xs text-gray-500 flex items-center justify-center gap-1">항목을 클릭하면 즉시 저장됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 🟣 리쿠르팅 진행 상황 모달 */}
      {recruitingModalClient && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 md:p-4 transition-opacity animate-in fade-in"
          onClick={() => setRecruitingModalClient(null)} 
        >
          <div 
            className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 md:zoom-in-95"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="px-5 md:px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-purple-50 rounded-t-2xl shrink-0">
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-600" /> 
                  리쿠르팅(도입) 상황
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  <strong className="text-purple-600">{recruitingModalClient.name}</strong> 고객님의 리쿠르팅 진행도입니다.
                </p>
              </div>
              <button 
                onClick={() => setRecruitingModalClient(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-purple-200/50 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 md:px-6 py-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pb-safe">
              {RECRUITING_STEPS.map((step, index) => {
                const currentSteps = parseSteps(recruitingModalClient.recruiting_status);
                const isChecked = currentSteps.includes(step.id);
                
                return (
                  <div 
                    key={step.id}
                    onClick={() => handleToggleRecruitingStep(step.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked 
                        ? "bg-purple-50 border-purple-200 shadow-sm" 
                        : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="shrink-0">
                      {isChecked ? <CheckSquare className="w-5 h-5 text-purple-600" /> : <Square className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isChecked ? "text-purple-900" : "text-gray-600"}`}>
                        <span className="text-xs text-gray-400 font-normal mr-1.5">{index + 1}.</span>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 md:rounded-b-2xl shrink-0 text-center pb-safe">
              <p className="text-[11px] md:text-xs text-gray-500 flex items-center justify-center gap-1">항목을 클릭하면 즉시 저장됩니다.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}