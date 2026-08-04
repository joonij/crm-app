"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, FileText, Stethoscope, Calendar, User, Crown, MessageCircle, Send, Info, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ClientDetailModal from "./components/ClientDetailModal";
import ClientMemoCard from "./components/ClientMemoCard";
import ClientCoverageCard from "./components/ClientCoverageCard";
import ClientsMedicalHistoryCard from "./components/ClientsMedicalHistoryCard";
import ClientScheduleCard from "./components/ClientScheduleCard";

// ⭐️ 암호화 해제를 위한 함수 임포트
import { decryptRegNumber } from "@/app/actions/crypto"; 

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
  report_uuid?: string | null;
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

  // ⭐️ 고객등록요청 모달 상태 추가
  const [kakaoRequestData, setKakaoRequestData] = useState<{isOpen: boolean, text: string, clientName: string}>({isOpen: false, text: "", clientName: ""});
  
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

  // ⭐️ 병력 요약 헬퍼 함수
  const formatMedicalHistory = (medicalData: any) => {
    if (!medicalData) return "특이사항 없음";

    try {
      const data = typeof medicalData === 'string' ? JSON.parse(medicalData) : medicalData;
      const memoStr = data.memo || (typeof data === 'string' ? data : "");
      if (!memoStr.trim()) return "특이사항 없음";

      const grouped = {
        recent3m: {} as Record<string, any>,
        recent1y: {} as Record<string, any>,
        visit7: {} as Record<string, any>,
        medication30: {} as Record<string, any>
      };

      const admissions: string[] = [];
      const surgeries: string[] = [];

      let currentSection = "";
      let isParsed = false;
      
      const lines = memoStr.split('\n');
      
      lines.forEach((line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.includes('[3개월')) { currentSection = 'recent3m'; return; }
        if (trimmed.includes('[1년')) { currentSection = 'recent1y'; return; }
        if (trimmed.includes('수술 의심')) { currentSection = 'surgery'; return; }
        if (trimmed.includes('입원 이력')) { currentSection = 'admission'; return; }
        if (trimmed.includes('7번 이상')) { currentSection = 'visit7'; return; }
        if (trimmed.includes('30일 이상')) { currentSection = 'medication30'; return; }

        if (trimmed.startsWith('-') && currentSection) {
          const parts = trimmed.split('·').map(p => p.trim());
          
          if (parts.length >= 3) {
            const dateMatch = parts[0].match(/\d{4}-\d{2}-\d{2}/);
            const date = dateMatch ? dateMatch[0] : "";
            const code = parts[2] || "";
            let name = parts[3] || "";
            let extra = parts.slice(4).join(' · '); 
            
            if (date) {
              isParsed = true;
              
              let days = 0;
              const mediMatch = name.match(/\((\d+)일\s*투약\)/);
              if (mediMatch) {
                days = parseInt(mediMatch[1], 10);
                name = name.replace(/\(\d+일\s*투약\)/, '').trim(); 
              }

              if (currentSection === 'admission' || currentSection === 'surgery') {
                const extraInfo = extra ? ` · ${extra}` : '';
                const lineStr = `- ${date} · ${code} · ${name}${extraInfo}`;
                
                if (currentSection === 'admission') admissions.push(lineStr);
                else surgeries.push(lineStr);
              } 
              else {
                const groupKey = code || name || '미상';
                const targetGroup = grouped[currentSection as keyof typeof grouped];
                
                if (targetGroup) {
                  if (!targetGroup[groupKey]) {
                    targetGroup[groupKey] = { code, name, dates: new Set(), count: 0, days: 0 };
                  }
                  targetGroup[groupKey].dates.add(date);
                  targetGroup[groupKey].count++;      
                  targetGroup[groupKey].days += days; 
                }
              }
            }
          }
        }
      });

      if (isParsed) {
        let resultParts: string[] = [];

        const renderGrouped = (groupObj: any, unit: string) => {
          const vals = Object.values(groupObj) as any[];
          if (vals.length === 0) return null;
          
          return vals.map(g => {
            const sorted = Array.from(g.dates).sort() as string[];
            const start = sorted[0];
            const end = sorted[sorted.length - 1];
            const dateStr = (start !== end && start && end) ? `${start}~${end}` : start;
            const countOrDays = unit === '일' ? g.days : g.count;
            return `- ${dateStr} · ${g.code} · ${g.name} · 총 ${countOrDays}${unit}`;
          }).join('\n');
        };

        const r3m = renderGrouped(grouped.recent3m, '회');
        if (r3m) resultParts.push(`[3개월 내 다녀온 병원 및 약국 이력]\n${r3m}`);

        const r1y = renderGrouped(grouped.recent1y, '회');
        if (r1y) resultParts.push(`[1년 내 같은 질병(코드) 병원 이력]\n${r1y}`);

        if (admissions.length > 0) resultParts.push(`[5년 내 입원 이력]\n${admissions.join('\n')}`);
        if (surgeries.length > 0) resultParts.push(`[5년 내 수술 의심 (처치/수술 & 진료비 5만원↑)]\n${surgeries.join('\n')}`);

        const v7 = renderGrouped(grouped.visit7, '회');
        if (v7) resultParts.push(`[5년 내 같은 코드로 7번 이상 병원 이력]\n${v7}`);

        const m30 = renderGrouped(grouped.medication30, '일');
        if (m30) resultParts.push(`[5년 내 같은 약품으로 30일 이상 투약]\n${m30}`);

        if (resultParts.length > 0) {
          return `■ 주요 병력 요약 (알릴 의무 대상)\n\n` + resultParts.join('\n\n');
        }
      }

      return memoStr.replace(/·\s*[^·]+\s*·/g, "· ·").trim() || "특이사항 없음";

    } catch (e) {
      console.error("의료 기록 파싱 에러", e);
      return "특이사항 없음";
    }
  };

  // ⭐️ 고객등록요청 모달 열기 핸들러
  const openKakaoRequestModal = async () => {
    if (!client) return;

    const medicalMemo = formatMedicalHistory(client.medical_history);

    let decryptedReg: string = "";
    if (client.registration_number) {
      try {
        const result = await decryptRegNumber(client.registration_number);
        decryptedReg = result || ""; 
      } catch (e) {
        console.error("복호화 중 에러 발생", e);
      }
    }

    const telecomLabel = client.telecom_carriers?.telecom || "미입력";
    const drivingLabel = client.driving_statuses?.status || "미입력";

    const template = `고객등록 및 설계 요청드립니다.

이름: ${client.name}
주민등록번호: ${decryptedReg || '미입력'}
연락처: ${client.phone || '미입력'}
통신사: ${telecomLabel}
주소: ${client.address || '미입력'}
직업: ${client.job || '미입력'}
운전여부: ${drivingLabel}
병력사항:
${medicalMemo}`;

    setKakaoRequestData({ isOpen: true, text: template, clientName: client.name });
  };

  // ⭐️ 카카오톡 전송 핸들러
  const handleSendKakaoRequest = async () => {
    const { text } = kakaoRequestData;
    
    try {
      await navigator.clipboard.writeText(text);
    } catch(e) {
      console.error("클립보드 복사 실패", e);
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `kakaotalk://send?text=${encodeURIComponent(text)}`;
    } else {
      alert("✅ 내용이 클립보드에 복사되었습니다!\nPC 카카오톡 대화창에 바로 붙여넣기(Ctrl+V) 해주세요.");
    }
    
    setKakaoRequestData({ isOpen: false, text: "", clientName: "" });
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
          <div className="flex items-center gap-3">
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
            <p className="text-base text-gray-600 font-medium">{client.phone ?? "연락처 미등록"}</p>

            {client.contract_status?.status && (
              <span className={`px-2.5 py-1 h-7 inline-flex items-center justify-center rounded-md border text-xs font-bold transition-all shadow-sm ${contractStatusStyleMap[client.contract_status.status] || "bg-gray-50 text-gray-400 border-gray-200 border-dashed"}`}>                              
                {client.contract_status.status}
              </span>
            )}
          </div>
        </div>
        
        {/* ⭐️ 버튼 영역: 고객등록요청 버튼 추가 */}
        <div className="flex w-full md:w-auto items-center gap-2 flex-wrap sm:flex-nowrap">
          <button 
            onClick={() => openKakaoRequestModal()}
            className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" /> 고객등록요청
          </button>
          
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

      {/* 🟢 설계 요청 폼 편집 및 전송 모달 */}
      {kakaoRequestData.isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm md:p-4 pt-24 animate-in fade-in"
          onClick={() => setKakaoRequestData({ ...kakaoRequestData, isOpen: false })}
        >
          <div 
            className="bg-white w-full md:max-w-[900px] md:max-h-[900px] h-full md:rounded-2xl md:shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-50 px-5 py-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900">
                <h3 className="font-extrabold text-base">고객등록 및 설계 요청</h3>
              </div>
              <button 
                onClick={() => setKakaoRequestData({ ...kakaoRequestData, isOpen: false })}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 h-full flex flex-col gap-3">
              <div className="bg-blue-50/50 text-blue-800 border border-blue-100/50 text-[13px] font-semibold p-3.5 rounded-xl flex gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                <p className="leading-relaxed text-gray-600">
                  전송 전 내용을 자유롭게 수정할 수 있습니다.
                </p>
              </div>
              
              <textarea
                value={kakaoRequestData.text}
                onChange={(e) => setKakaoRequestData({ ...kakaoRequestData, text: e.target.value })}
                className="w-full md:max-h-[800px] h-full p-4 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none font-medium text-gray-700 leading-relaxed shadow-sm"
              />
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSendKakaoRequest}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> 메시지 전송
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}