"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, FileText, Stethoscope, Calendar } from "lucide-react";
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
  medical_history?: any;
};

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ⭐️ 탭 상태 관리 (기본값: 메모)
  const [activeTab, setActiveTab] = useState<"memo" | "medical" | "schedule">("memo");

  useEffect(() => {
    async function fetchClient() {
      setIsLoading(true);
      const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
      
      if (error) {
        setError("고객 정보를 불러오지 못했습니다.");
      } else {
        setClient(data);
      }
      setIsLoading(false);
    }
    if (id) void fetchClient();
  }, [id]);

  if (isLoading) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center p-4"><p className="text-sm text-gray-500">데이터를 불러오는 중...</p></div>;
  }

  if (error || !client) {
    return (
      <div className="w-full space-y-6 p-4 md:p-8">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" strokeWidth={2} /> 고객 목록으로 돌아가기
        </Link>
        <div className="w-full rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-gray-500">{error ?? "고객을 찾을 수 없습니다."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-7xl flex flex-col h-auto lg:h-[calc(100vh-1rem)] p-4 md:p-6 overflow-visible lg:overflow-hidden bg-gray-50/30">
      
      {/* 백버튼 */}
      <div className="shrink-0 mb-4">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" strokeWidth={2} /> 고객 목록으로 돌아가기
        </Link>
      </div>

      {/* 고객 상단 프로필 헤더 */}
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">고객 프로필</p>
        <h1 
          className="mt-2 text-3xl font-bold tracking-tight text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setIsDetailModalOpen(true)}
        >
          {client.name}
        </h1>
        <p className="mt-2 text-base text-gray-600">{client.phone ?? "연락처 미등록"}</p>
      </section>

      {/* ⭐️ 좌측(탭) / 우측(보장분석) 분리 레이아웃 */}
      <section className="flex flex-col lg:flex-row gap-6 w-full mt-6 flex-1 min-h-0">
        
        {/* 좌측 영역: 탭 메뉴 + 선택된 카드 내용 */}
        <div className="w-full lg:w-[35%] xl:w-[32%] flex flex-col gap-4 h-full min-h-0 shrink-0">
          
          {/* 탭 버튼 UI */}
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

          {/* 선택된 탭의 컴포넌트 렌더링 영역 */}
          <div className="flex-1 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden">
            <div className="h-full *:h-full">
              {activeTab === "memo" && <ClientMemoCard clientId={id} initialNote={client.notes} />}
              
              {activeTab === "medical" && <ClientsMedicalHistoryCard clientId={id} initialHistory={client.medical_history} />}
              
              {activeTab === "schedule" && <ClientScheduleCard clientId={id} agentId={client.agent_id} />}
            </div>
          </div>

        </div>

        {/* 우측 영역: 보장 분석 내역 (기존 그대로 유지) */}
        <div className="w-full lg:w-[65%] xl:w-[68%] lg:h-full min-h-0">
          <ClientCoverageCard clientId={id} />
        </div>

      </section>

      {/* 고객 상세 정보 모달 */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <ClientDetailModal client={client} onClose={() => setIsDetailModalOpen(false)} />
        </div>
      )}
    </div>
  );
}