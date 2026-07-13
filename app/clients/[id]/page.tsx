// app/clients/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, FileText, Stethoscope, Calendar, User, Crown, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ClientDetailModal from "./components/ClientDetailModal";
import ClientMemoCard from "./components/ClientMemoCard";
import ClientCoverageCard from "./components/ClientCoverageCard";
import ClientsMedicalHistoryCard from "./components/ClientsMedicalHistoryCard";
import ClientScheduleCard from "./components/ClientScheduleCard";

type Client = {
  id: number;
  name: string;
  phone: string | null;
  agent_id: number;
  notes: string | null;
  registration_number: string | null;
  job: string | null;
  address: string | null;
  card_withdrawal_date: string | null;
  bank_info: string | null;
  medical_history?: any;
  introduce_client: number | null; 
  client_source?: { id: number; source: string } | null;
  contract_status?: { id: number; status: string } | null;
  telecom_carriers?: { id: number; telecom: string } | null;
  driving_statuses?: { id: number; status: string } | null;
  bank_lists?: { id: number; bank: string } | null;
  referrer?: { id: number; name: string } | null; 
  report_uuid?: string | null; // ⭐️ UUID 속성 추가
};

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isKeyman, setIsKeyman] = useState(false);
  const [activeTab, setActiveTab] = useState<"memo" | "medical" | "schedule">("memo");
  
  const contractStatusStyleMap: Record<string, string> = {
    "계약완료": "bg-blue-50 text-blue-700 border-blue-200/80",
    "계약진행": "bg-green-50 text-green-700 border-green-200/80",
    "계약보류": "bg-amber-50 text-amber-700 border-amber-200/80",
    "계약거절": "bg-zinc-50 text-zinc-600 border-zinc-200",
    "계약해지": "bg-red-50 text-red-700 border-red-200/80",
  };

  const fetchClient = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // 1. 현재 고객 정보 불러오기
    const { data, error: supabaseError } = await supabase
      .from("clients")
      .select(`
        *,
        client_source ( id, source ),
        contract_status ( id, status ),
        telecom_carriers!clients_telecom_carriers_fkey ( id, telecom ),
        driving_statuses ( id, status ),
        bank_lists!clients_bank_lists_fkey ( id, bank )
      `)
      .eq("id", id)
      .single();
    
    if (supabaseError) {
      console.error("🔴 DB 데이터 로드 실패:", supabaseError);
      setError("고객 정보를 불러오지 못했습니다.");
      setIsLoading(false);
      return;
    } 
    
    let clientData = data as Client;

    // 2. 소개인(referrer) 정보 직접 가져오기
    if (clientData.introduce_client) {
      const { data: referrerData } = await supabase
        .from("clients")
        .select("id, name")
        .eq("id", clientData.introduce_client)
        .single();
        
      if (referrerData) {
        clientData.referrer = referrerData;
      }
    }

    // 3. 키맨 확인 로직
    const { count, error: countError } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true }) 
      .eq("introduce_client", id);

    if (!countError && count !== null && count >= 3) {
      setIsKeyman(true);
    } else {
      setIsKeyman(false);
    }

    setClient(clientData);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) void fetchClient();
  }, [fetchClient, id]);

  // ⭐️ 링크 복사 핸들러 추가
  const handleCopyReportLink = async () => {
    if (!client?.report_uuid) {
      alert("아직 리포트 링크가 생성되지 않았거나, 새로고침이 필요합니다.");
      return;
    }
    
    const url = `${window.location.origin}/report/${client.report_uuid}`;
    
    try {
      await navigator.clipboard.writeText(url);
      alert("고객 전용 리포트 링크가 복사되었습니다!\n카카오톡 등에 붙여넣기 하세요.");
    } catch (err) {
      alert("링크 복사에 실패했습니다. 직접 복사해주세요: " + url);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center p-4"><p className="text-sm text-gray-500 font-bold">데이터를 불러오는 중...</p></div>;
  }

  if (error || !client) {
    return (
      <div className="w-full space-y-6 p-4 md:p-8">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="h-4 w-4" strokeWidth={2} /> 고객 목록으로 돌아가기
        </Link>
        <div className="w-full rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center shadow-sm">
          <p className="text-base text-red-600 font-bold">{error ?? "고객을 찾을 수 없습니다."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-7xl flex flex-col h-auto lg:h-[calc(100vh-1rem)] p-4 md:p-6 overflow-visible lg:overflow-hidden bg-gray-50/30">
      
      <div className="shrink-0 mb-4">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" strokeWidth={2} /> 고객 목록으로 돌아가기
        </Link>
      </div>

      <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">고객 프로필</p>
          <div className="flex items-center gap-3 mt-2">
            <h1 
              className="text-3xl font-bold tracking-tight text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsDetailModalOpen(true)}
            >
              {client.name}
            </h1>
            
            {isKeyman && (
              <span className="flex items-center gap-1 px-2.5 py-1 h-7 text-xs font-black rounded-lg border border-gray-200 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                키맨
              </span>
            )}

            {client.contract_status?.status && (
              <span className={`px-2.5 py-1 h-7 inline-flex items-center justify-center rounded-md border text-xs font-bold transition-all shadow-sm ${contractStatusStyleMap[client.contract_status.status] || "bg-gray-50 text-gray-400 border-gray-200 border-dashed"}`}>                              
                {client.contract_status.status}
              </span>
            )}
          </div>
          <p className="mt-2 text-base text-gray-600 font-medium">{client.phone ?? "연락처 미등록"}</p>
        </div>
        
        {/* ⭐️ 버튼 영역 분리 및 링크 복사 버튼 추가 */}
        <div className="flex w-full md:w-auto items-center gap-2">
          <button 
            onClick={handleCopyReportLink} 
            className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> 리포트 공유 링크
          </button>
          
          <button 
            onClick={() => setIsDetailModalOpen(true)}
            className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
          >
            <User className="w-4 h-4" /> 상세 프로필
          </button>
        </div>
      </section>

      <section className="flex flex-col lg:flex-row gap-6 w-full mt-6 flex-1 min-h-0">
        
        <div className="w-full lg:w-[35%] xl:w-[32%] flex flex-col gap-4 h-full min-h-0 shrink-0">
          <div className="flex bg-gray-200/60 p-1.5 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("memo")}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "memo" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              <FileText className="w-4 h-4" /> 메모
            </button>
            <button
              onClick={() => setActiveTab("medical")}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "medical" ? "bg-white shadow-sm text-red-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              <Stethoscope className="w-4 h-4" /> 알릴의무
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "schedule" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              <Calendar className="w-4 h-4" /> 일정
            </button>
          </div>

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <div className="h-full *:h-full">
              {activeTab === "memo" && <ClientMemoCard clientId={id} initialNote={client.notes} />}
              {activeTab === "medical" && <ClientsMedicalHistoryCard clientId={id} initialHistory={client.medical_history} />}
              {activeTab === "schedule" && <ClientScheduleCard clientId={id} agentId={client.agent_id} />}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[65%] xl:w-[68%] lg:h-full min-h-0">
          <ClientCoverageCard clientId={id} />
        </div>

      </section>

      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <ClientDetailModal 
            client={client} 
            onClose={() => setIsDetailModalOpen(false)} 
            onRefresh={() => {
              setIsDetailModalOpen(false);
              void fetchClient(); 
            }}
          />
        </div>
      )}
    </div>
  );
}