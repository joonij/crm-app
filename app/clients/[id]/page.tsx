"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, FileText, Stethoscope, Calendar, User, Crown, MessageCircle, Send, Info, X, BarChart3, CheckSquare, Square, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ClientDetailModal from "./components/ClientDetailModal";
import ClientMemoCard from "./components/ClientMemoCard";
import ClientCoverageCard from "./components/ClientCoverageCard";
import ClientsMedicalHistoryCard from "./components/ClientsMedicalHistoryCard";
import ClientScheduleCard from "./components/ClientScheduleCard";

// ⭐️ 암호화 해제를 위한 함수 임포트
import { decryptRegNumber } from "@/app/actions/crypto";

// ⭐️ 진행 단계 상수 추가
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
  { id: "step13", label: "비교안내확인서 진행" },
  { id: "step14", label: "모니터링 처리" },
  { id: "step15", label: "소개 요청" },
  { id: "step16", label: "증권 전달" },
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

const parseSteps = (statusString: string | null): string[] => {
  if (!statusString) return [];
  try {
    const parsed = JSON.parse(statusString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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
  
  // ⭐️ 추가된 진행률 필드
  progress_status?: string | null;
  recruiting_status?: string | null;
  decrypted_reg?: string | null;
};

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [clientDemo, setClientDemo] = useState<{ age: number; gender: string } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isKeyman, setIsKeyman] = useState(false);
  const [activeTab, setActiveTab] = useState<"memo" | "medical" | "schedule">("memo");

  const [kakaoRequestData, setKakaoRequestData] = useState<{ isOpen: boolean, text: string, clientName: string }>({ isOpen: false, text: "", clientName: "" });

  // ⭐️ 상태 변경 모달용 State
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isRecruitingModalOpen, setIsRecruitingModalOpen] = useState(false);

  // ⭐️ 주민등록번호 기반 나이/성별 계산 함수
  const getAgeAndGender = (rrn: string) => {
    if (!rrn || rrn.length < 7) return null;
    const cleanStr = rrn.replace(/[^0-9]/g, "");
    if (cleanStr.length < 7) return null;

    const yy = parseInt(cleanStr.substring(0, 2), 10);
    const mm = parseInt(cleanStr.substring(2, 4), 10);
    const dd = parseInt(cleanStr.substring(4, 6), 10);
    const gDigit = parseInt(cleanStr.substring(6, 7), 10);

    let year = 1900 + yy;
    if ([3, 4, 7, 8].includes(gDigit)) year = 2000 + yy;
    else if ([9, 0].includes(gDigit)) year = 1800 + yy;

    const gender = [1, 3, 5, 7, 9].includes(gDigit) ? "남성" : "여성";

    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < mm || (today.getMonth() + 1 === mm && today.getDate() < dd)) {
      age--;
    }

    return { age, gender };
  };

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

    const { count, error: countError } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true }) 
      .eq("introduce_client", id);

    if (!countError && count !== null && count >= 3) {
      setIsKeyman(true);
    } else {
      setIsKeyman(false);
    }

    if (clientData.registration_number) {
      try {
        const decryptedReg = await decryptRegNumber(clientData.registration_number);
        clientData.decrypted_reg = decryptedReg;
        if (decryptedReg) {
          setClientDemo(getAgeAndGender(decryptedReg));
        }
      } catch (e) {
        console.error("복호화 중 에러 발생", e);
      }
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

  // ⭐️ 상태 변경 처리 핸들러 (계약 상태, 영업 진행률, 도입 진행률)
  const handleStatusChange = async (newStatusId: string) => {
    if (!client) return;
    
    // 로컬 상태 먼저 업데이트
    const updatedStatus = { id: parseInt(newStatusId), status: contractStatusMap[newStatusId] };
    setClient({ ...client, contract_status: updatedStatus });
    setIsEditingContract(false);

    const { error } = await supabase.from("clients").update({ contract_status: newStatusId }).eq("id", client.id);
    if (error) {
      alert(`계약 상태 변경 실패!\n원인: ${error.message}`);
      void fetchClient();
    }
  };

  const handleToggleStep = async (stepId: string) => {
    if (!client) return;

    const currentSteps = parseSteps(client.progress_status || null);
    const isCompleted = currentSteps.includes(stepId);
    
    const newSteps = isCompleted ? currentSteps.filter((step_id) => step_id !== stepId) : [...currentSteps, stepId];
    const newStatusString = JSON.stringify(newSteps);

    setClient({ ...client, progress_status: newStatusString });

    const { error } = await supabase.from("clients").update({ progress_status: newStatusString }).eq("id", client.id);
    if (error) {
      alert(`영업 프로세스 업데이트 실패!\n원인: ${error.message}`);
      void fetchClient();
    }
  };

  const handleToggleRecruitingStep = async (stepId: string) => {
    if (!client) return;

    const currentSteps = parseSteps(client.recruiting_status || null);
    const isCompleted = currentSteps.includes(stepId);
    
    const newSteps = isCompleted ? currentSteps.filter((step_id) => step_id !== stepId) : [...currentSteps, stepId];
    const newStatusString = JSON.stringify(newSteps);

    setClient({ ...client, recruiting_status: newStatusString });

    const { error } = await supabase.from("clients").update({ recruiting_status: newStatusString }).eq("id", client.id);
    if (error) {
      alert(`리쿠르팅 프로세스 업데이트 실패!\n원인: ${error.message}`);
      void fetchClient();
    }
  };

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
              } else {
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
        if (surgeries.length > 0) resultParts.push(`[5년 내 수술 의심]\n${surgeries.join('\n')}`);

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

  const openKakaoRequestModal = async () => {
    if (!client) return;
    const medicalMemo = formatMedicalHistory(client.medical_history);
    const telecomLabel = client.telecom_carriers?.telecom || (typeof client.telecom_carriers === 'string' ? client.telecom_carriers : '미입력');
    const drivingLabel = client.driving_statuses?.status || (typeof client.driving_statuses === 'string' ? client.driving_statuses : '미입력');

    const template = `고객등록 및 설계 요청드립니다.

이름: ${client.name}
주민등록번호: ${client.decrypted_reg || '미입력'}
연락처: ${client.phone || '미입력'}
통신사: ${telecomLabel}
주소: ${client.address || '미입력'}
직업: ${client.job || '미입력'}
운전여부: ${drivingLabel}
병력사항:
${medicalMemo}`;

    setKakaoRequestData({ isOpen: true, text: template, clientName: client.name });
  };

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

  const completedSteps = parseSteps(client.progress_status || null);
  const progressPercent = Math.round((completedSteps.length / SALES_STEPS.length) * 100);
  
  const completedRecSteps = parseSteps(client.recruiting_status || null);
  const recPercent = Math.round((completedRecSteps.length / RECRUITING_STEPS.length) * 100);

  const clientStatusId = client.contract_status?.id ? String(client.contract_status.id) : "";

  return (
    <div className="w-full max-w-[1500px] mx-auto max-w-7xl flex flex-col h-auto lg:h-[calc(100vh-1rem)] p-4 md:p-6 overflow-visible lg:overflow-hidden bg-gray-50/30">
      
      <div className="shrink-0 mb-4">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" strokeWidth={2} /> 고객 목록으로 돌아가기
        </Link>
      </div>

      <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex flex-col gap-2.5 w-full md:w-auto">
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 
              className="text-3xl font-bold tracking-tight text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsDetailModalOpen(true)}
            >
              {client.name}
            </h1>
            
            {clientDemo && (
              <span className="flex items-center px-2.5 py-1 text-sm font-bold bg-slate-100 text-slate-700 rounded-lg shadow-sm">
                {clientDemo.gender} / 만 {clientDemo.age}세
              </span>
            )}

            <span className="flex items-center px-2.5 py-1 text-sm font-bold bg-blue-50 text-blue-700 rounded-lg shadow-sm border border-blue-100">
              {client.phone ?? "연락처 미등록"}
            </span>

            {isKeyman && (
              <span className="flex items-center gap-1 px-2.5 py-1 h-7 text-xs font-black rounded-lg border border-amber-200 shadow-sm bg-amber-50 text-amber-600">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                키맨
              </span>
            )}
            {/* 1. 계약 상태 변경 */}
            <div className="h-8 w-28 shrink-0 mt-1">
              {isEditingContract ? (
                <select
                  value={clientStatusId}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  onBlur={() => setIsEditingContract(false)}
                  className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  autoFocus
                >
                  <option value="">선택 안함</option>
                  {Object.entries(contractStatusMap).map(([idKey, label]) => (
                    <option key={idKey} value={idKey}>{label}</option>
                  ))}
                </select>
              ) : (
                <span
                  onClick={() => setIsEditingContract(true)}
                  className={`w-full h-8 inline-flex items-center justify-center rounded-md border text-xs font-bold cursor-pointer transition-all shadow-sm ${contractStatusStyleMap[clientStatusId] || "bg-gray-50 text-gray-400 border-gray-200 border-dashed hover:bg-gray-100"}`}
                >
                  {contractStatusMap[clientStatusId] || "미지정"}
                </span>
              )}
            </div>

            {/* 2. 영업 진행률 */}
            <div 
              className="flex flex-col gap-1.5 cursor-pointer group/progress p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors w-32"
              onClick={() => setIsProgressModalOpen(true)}
            >
              <div className="flex justify-between items-end px-0.5">
                <span className="text-[11px] font-semibold text-gray-500 group-hover/progress:text-blue-600">영업</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover/progress:text-blue-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200/50">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${progressPercent === 100 ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            {/* 3. 리쿠르팅 진행률 */}
            <div 
              className="flex flex-col gap-1.5 cursor-pointer group/recruiting p-2 -ml-2 rounded-lg hover:bg-purple-50 transition-colors w-32"
              onClick={() => setIsRecruitingModalOpen(true)}
            >
              <div className="flex justify-between items-end px-0.5">
                <span className="text-[11px] font-semibold text-gray-500 group-hover/recruiting:text-purple-600">도입</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover/recruiting:text-purple-600">{recPercent}%</span>
              </div>
              <div className="w-full bg-purple-100/50 rounded-full h-2.5 overflow-hidden border border-purple-200/50">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${recPercent === 100 ? "bg-green-500" : "bg-purple-600"}`} style={{ width: `${recPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 mt-2 md:mt-0">
          <button 
            onClick={() => openKakaoRequestModal()}
            className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
          >
            고객등록요청
          </button>
          
          <button 
            onClick={handleCopyReportLink} 
            className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
          >
            리포트링크
          </button>
          
          <button 
            onClick={() => setIsDetailModalOpen(true)}
            className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
          >
            상세프로필
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

      {/* 🟢 설계 요청 폼 모달 */}
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

      {/* 🔵 영업 진행 상황 모달 */}
      {isProgressModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 md:p-4 transition-opacity animate-in fade-in"
          onClick={() => setIsProgressModalOpen(false)} 
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
                  <strong className="text-blue-600">{client.name}</strong> 고객님의 영업 진행도입니다.
                </p>
              </div>
              <button 
                onClick={() => setIsProgressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 md:px-6 py-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pb-safe">
              {SALES_STEPS.map((step, index) => {
                const isChecked = completedSteps.includes(step.id);
                
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
      {isRecruitingModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 md:p-4 transition-opacity animate-in fade-in"
          onClick={() => setIsRecruitingModalOpen(false)} 
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
                  <strong className="text-purple-600">{client.name}</strong> 고객님의 리쿠르팅 진행도입니다.
                </p>
              </div>
              <button 
                onClick={() => setIsRecruitingModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-purple-200/50 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 md:px-6 py-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pb-safe">
              {RECRUITING_STEPS.map((step, index) => {
                const isChecked = completedRecSteps.includes(step.id);
                
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