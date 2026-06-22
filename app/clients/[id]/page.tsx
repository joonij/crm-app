"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, FileText, Stethoscope, Calendar, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ClientDetailModal from "@/components/ClientDetailModal";
import ClientMemoCard from "@/components/ClientMemoCard";
import ClientCoverageCard from "@/components/ClientCoverageCard";
import ClientsMedicalHistoryCard from "@/components/ClientsMedicalHistoryCard";
import ClientScheduleCard from "@/components/ClientScheduleCard";

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
  // ⭐️ ID 값을 포함하여 조인 데이터를 받습니다.
  client_source?: { id: number; source: string } | null;
  contract_status?: { id: number; status: string } | null;
  telecom_carriers?: { id: number; telecom: string } | null;
  driving_statuses?: { id: number; status: string } | null;
  bank_lists?: { id: number; bank: string } | null;
  referrer?: { id: number; name: string } | null; 
};

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"memo" | "medical" | "schedule">("memo");

  // ⭐️ 핵심 수정: fetchClient를 useEffect 밖으로 꺼내서 useCallback으로 감쌌습니다.
  const fetchClient = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
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

    // 소개인 정보(referrer) 직접 가져오기
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

    setClient(clientData);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) void fetchClient();
  }, [fetchClient, id]);

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

      <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm shrink-0 flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">고객 프로필</p>
          <div className="flex items-center gap-3 mt-2">
            <h1 
              className="text-3xl font-bold tracking-tight text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsDetailModalOpen(true)}
            >
              {client.name}
            </h1>
            {client.contract_status?.status && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                {client.contract_status.status}
              </span>
            )}
          </div>
          <p className="mt-2 text-base text-gray-600 font-medium">{client.phone ?? "연락처 미등록"}</p>
        </div>
        
        <button 
          onClick={() => setIsDetailModalOpen(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          <User className="w-4 h-4" /> 상세 프로필
        </button>
      </section>

      <section className="flex flex-col lg:flex-row gap-6 w-full mt-6 flex-1 min-h-0">
        
        <div className="w-full lg:w-[35%] xl:w-[32%] flex flex-col gap-4 h-full min-h-0 shrink-0">
          <div className="flex bg-gray-200/60 p-1.5 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("memo")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "memo" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              <FileText className="w-4 h-4" /> 메모
            </button>
            <button
              onClick={() => setActiveTab("medical")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "medical" ? "bg-white shadow-sm text-red-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              <Stethoscope className="w-4 h-4" /> 알릴의무
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "schedule" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              <Calendar className="w-4 h-4" /> 일정
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden">
            <div className="h-full *:h-full">
              {activeTab === "memo" && <ClientMemoCard clientId={id} initialNote={client.notes} />}
              {activeTab === "medical" && <ClientsMedicalHistoryCard clientId={id} initialHistory={client.medical_history} />}
              {activeTab === "schedule" && <ClientScheduleCard clientId={id} agentId={String(client.agent_id)} />}
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
              setIsDetailModalOpen(false); // 모달 닫기
              void fetchClient(); // 정보 갱신
            }}
          />
        </div>
      )}
    </div>
  );
}