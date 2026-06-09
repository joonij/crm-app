"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Calendar, FileText, Shield, Trash2, ChevronDown, ChevronUp, Plus, X, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ClientDetailModal from "@/components/ClientDetailModal";
import InsuranceModal from "@/components/InsuranceModal";

type Client = {
  id: number;
  name: string;
  phone: string | null;
  agent_id: number;
  notes: string | null;
  progress_status: string | null;
  contract_status: string | null;
  client_source: string | null;
  introduce_client: string | null;
  registration_num: string | null;
  telecom_carriers: string | null;
  address: string | null;
  job: string | null;
  driving_statuses: string | null;
  bank_lists: string | null;
  bank_info: string | null;
  card_withdrawal: string | null;
};

type CoverageDetail = {
  name: string;
  amount: string;
};

type Coverage = {
  id: number;
  insurance_company: string;
  product_name: string;
  monthly_premium: number;
  details: CoverageDetail[] | null;
  indemnity_generation: string | null;
  policy_status?: string | null; // ⭐️ 타입 에러 방지용 추가
};

type Schedule = {
  id: number;
  agent_id: number;
  client_id: number;
  date: string;
  time: string;
  content: string;
  repeat: boolean;
};

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [noteContent, setNoteContent] = useState("");
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [noteSaveSuccess, setNoteSaveSuccess] = useState(false);
  
  const [expandedCovId, setExpandedCovId] = useState<number | null>(null);
  const [isCovModalOpen, setIsCovModalOpen] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({ content: "", date: "", time: "", repeat: false });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      if (!id) return;

      const [clientRes, covRes, scheduleRes] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).single(), 
        supabase.from("subscription_insurance").select("*").eq("client_id", id).order("created_at", { ascending: true }),
        supabase.from("schedules").select("*").eq("client_id", id).order("date", { ascending: false }).order("time", { ascending: false })
      ]);

      if (clientRes.error) {
        console.error(clientRes.error.message);
        setError("고객 정보를 불러오지 못했습니다.");
      } else {
        setClient(clientRes.data);
        setNoteContent(clientRes.data.notes || "");
      }

      if (covRes.data) setCoverages(covRes.data);
      if (scheduleRes.data) setSchedules(scheduleRes.data);

      setIsLoading(false);
    }

    void fetchData();
  }, [id]);

  const handleSaveNote = async () => {
    setIsNoteSaving(true);
    setNoteSaveSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from("clients")
        .update({ notes: noteContent })
        .eq("id", parseInt(id, 10));
      
      if (updateError) throw updateError;

      setNoteSaveSuccess(true);
      setTimeout(() => {
        setNoteSaveSuccess(false);
      }, 2000);
      
    } catch (error: any) {
      alert(`메모 저장 실패 원인: ${error.message}`);
    } finally {
      setIsNoteSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.content.trim() || !scheduleForm.date || !scheduleForm.time) {
      alert("일정 내용, 일자, 시간을 모두 입력해주세요.");
      return;
    }

    if (!client || !client.agent_id) {
      alert("고객의 담당자 정보가 없습니다.");
      return;
    }

    setIsSaving(true);

    try {
      const { error: insertError } = await supabase.from("schedules").insert([{
        agent_id: client.agent_id, 
        client_id: parseInt(id, 10),
        date: scheduleForm.date,
        time: scheduleForm.time,
        content: scheduleForm.content.trim(),
        repeat: scheduleForm.repeat,
      }]);

      if (insertError) throw insertError;

      setScheduleForm({ content: "", date: "", time: "", repeat: false });
      const { data } = await supabase.from("schedules").select("*").eq("client_id", id).order("date", { ascending: false }).order("time", { ascending: false });
      if (data) setSchedules(data);

    } catch (error: any) {
      alert(`일정 저장 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCoverage = async (covId: number) => {
    if (!window.confirm("이 보장 내역을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("subscription_insurance").delete().eq("id", covId);
    if (error) alert(`삭제 실패: ${error.message}`);
    else setCoverages((prev) => prev.filter((c) => c.id !== covId));
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("schedules").delete().eq("id", scheduleId);
    if (error) alert(`삭제 실패: ${error.message}`);
    else setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  const toggleCoverage = (covId: number) => {
    setExpandedCovId((prev) => (prev === covId ? null : covId));
  };

  const refreshCoverages = async () => {
    const { data } = await supabase
      .from("subscription_insurance")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true });
    if (data) setCoverages(data);
  };

  const updatePolicyStatus = async (covId: number, newStatus: string) => {
    setCoverages((prev) =>
      prev.map((c) => (c.id === covId ? { ...c, policy_status: newStatus } : c))
    );

    const { error } = await supabase
      .from("subscription_insurance")
      .update({ policy_status: newStatus })
      .eq("id", covId);

    if (error) {
      alert(`상태 변경 실패: ${error.message}`);
      const { data } = await supabase.from("subscription_insurance").select("*").eq("client_id", id).order("created_at", { ascending: true });
      if (data) setCoverages(data);
    }
  };
  
  const statusTheme: Record<string, { bg: string; border: string; text: string }> = {
    maintain: { bg: "bg-blue-50/30", border: "border-blue-200", text: "text-blue-700" },
    cancel: { bg: "bg-red-50/50", border: "border-red-200", text: "text-red-700" },
    new: { bg: "bg-green-50/40", border: "border-green-200", text: "text-green-700" },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-4">
        <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="w-full space-y-6 p-4 md:p-8">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" strokeWidth={2} /> 고객 목록으로 돌아가기
        </Link>
        <div className="w-full rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-gray-500">{error ?? "고객을 찾을 수 없습니다."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-6xl space-y-6 md:space-y-8 p-4 md:p-8 relative">
      <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
        <ChevronLeft className="h-4 w-4" strokeWidth={2} /> 고객 목록으로 돌아가기
      </Link>

      <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 md:p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">고객 프로필</p>
        <h1 
          className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setIsDetailModalOpen(true)}
        >
          {client.name}
        </h1>
        <p className="mt-3 text-lg md:text-xl text-gray-600">{client.phone ?? "연락처 미등록"}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        
        {/* 1. 통합 상담 메모 카드 */}
        <div className="w-full flex min-h-[280px] max-h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <FileText className="h-5 w-5" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">상담 통합 메모</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 mb-4">고객의 특이사항이나 전체 상담 기록을 누적해서 작성하세요.</p>
          
          <div className="flex flex-col flex-1 gap-4 relative">
            <div className="relative flex-1">
              <textarea
                className={`${inputClassName} w-full h-full min-h-[160px] p-4 text-gray-800 leading-relaxed resize-none transition-all duration-200 ${
                  isNoteSaving || noteSaveSuccess ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-80" : ""
                }`}
                placeholder="여기에 메모를 입력하고 저장 버튼을 누르세요..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                disabled={isNoteSaving || noteSaveSuccess}
              />
              {isNoteSaving && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-lg">
                  <span className="font-semibold text-gray-600 animate-pulse">저장 중...</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSaveNote}
              disabled={isNoteSaving || noteSaveSuccess}
              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-100 ${
                noteSaveSuccess 
                  ? "bg-green-600 cursor-not-allowed" 
                  : isNoteSaving 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              {isNoteSaving ? "저장 중..." : noteSaveSuccess ? "✓ 저장 완료" : "메모 전체 저장"}
            </button>
          </div>
        </div>

        {/* 2. 보장 분석 내역 카드 ⭐️ UI 교체 완료 */}
        <div className="w-full flex min-h-[280px] max-h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Shield className="h-4 w-4" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">보장 분석 내역</h2>
            </div>
            
            <div className="flex w-full gap-2">
              <Link
                href={`/clients/${id}/analysis`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                <BarChart3 className="w-4 h-4" /> 분석표
              </Link>
              
              <button
                onClick={() => setIsCovModalOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" /> 추가
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-gray-500 mb-4">고객의 보장 분석 결과가 이곳에 표시됩니다.</p>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 md:pr-2 mt-2">
            {coverages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
                등록된 보장 내역이 없습니다. 상단의 추가 버튼을 눌러주세요.
              </div>
            ) : (
              coverages.map((cov) => {
                const currentStatus = cov.policy_status || "maintain";
                const theme = statusTheme[currentStatus];

                return (
                  <div 
                    key={cov.id} 
                    className={`relative group rounded-lg border text-sm overflow-hidden flex flex-col transition-colors ${theme.bg} ${theme.border}`}
                  >
                    <div 
                      className="p-3 pr-8 cursor-pointer hover:bg-black/5 transition-colors"
                      onClick={() => toggleCoverage(cov.id)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900 truncate" title={cov.insurance_company}>
                              {cov.insurance_company}
                            </p>
                            <select
                              value={currentStatus}
                              onChange={(e) => updatePolicyStatus(cov.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className={`text-[11px] font-extrabold rounded px-1.5 py-0.5 border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${theme.text.split('-')[1]}-400 ${theme.bg} ${theme.border} ${theme.text}`}
                            >
                              <option value="maintain">유지</option>
                              <option value="cancel">해지</option>
                              <option value="new">신규 제안</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1 flex-wrap">
                            <p className="text-gray-600 text-xs truncate flex-1 min-w-0" title={cov.product_name}>
                              {cov.product_name}
                            </p>
                            {cov.indemnity_generation && (
                              <span className="inline-flex shrink-0 items-center rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 border border-gray-200">
                                {cov.indemnity_generation}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex flex-col items-end gap-1 shrink-0 mt-0.5">
                          <p className={`font-bold ${currentStatus === 'cancel' ? 'text-gray-400 line-through' : theme.text}`}>
                            {cov.monthly_premium.toLocaleString()}원
                          </p>
                          {expandedCovId === cov.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteCoverage(cov.id); }}
                      className="absolute top-3 right-2 text-gray-300 hover:text-red-500 transition-colors z-10 p-1"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {expandedCovId === cov.id && cov.details && cov.details.length > 0 && (
                      <div className="border-t border-black/10 bg-white/60 p-3 space-y-2">
                        {cov.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between text-xs border-b border-gray-200/50 pb-1 last:border-0 last:pb-0 gap-2">
                            <span className="text-gray-600 truncate flex-1">{detail.name || "-"}</span>
                            <span className="font-bold text-gray-900 shrink-0">{detail.amount || "-"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {expandedCovId === cov.id && (!cov.details || cov.details.length === 0) && (
                      <div className="border-t border-black/10 bg-white/60 p-3 text-center text-xs text-gray-400">
                        등록된 세부 보장 항목이 없습니다.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. 예정된 일정 카드 */}
        <div className="w-full flex min-h-[280px] max-h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <Calendar className="h-5 w-5" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">예정된 일정</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 mb-4">예정된 미팅 및 후속 일정이 이곳에 표시됩니다.</p>
          
          <div className="mb-4 flex flex-col gap-2">
            <input type="text" placeholder="일정 내용 (예: 2차 미팅)" className={inputClassName} value={scheduleForm.content} onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })} />
            <div className="flex gap-2">
              <input type="date" className={inputClassName} value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
              <input type="time" className={inputClassName} value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 px-1 text-sm text-gray-700">
              <input type="checkbox" checked={scheduleForm.repeat} onChange={(e) => setScheduleForm({ ...scheduleForm, repeat: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              반복 여부
            </label>
            <button onClick={handleSaveSchedule} disabled={isSaving} className="mt-2 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50">
              일정 추가
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 md:pr-2">
            {schedules.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
                등록된 일정이 없습니다.
              </div>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} className="relative group rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm pr-10">
                  <p className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                    <span className="truncate">{schedule.content}</span>
                    {schedule.repeat && (
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">반복</span>
                    )}
                  </p>
                  <p className="mt-2 text-right font-medium text-blue-600 text-xs">
                    {schedule.date} {schedule.time}
                  </p>
                  <button onClick={() => handleDeleteSchedule(schedule.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1" title="삭제">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </section>

      {isCovModalOpen && (
        <InsuranceModal 
          clientId={id} 
          onClose={() => setIsCovModalOpen(false)} 
          onSuccess={refreshCoverages}
        />
      )}
      
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <ClientDetailModal 
            client={client} 
            onClose={() => setIsDetailModalOpen(false)} 
          />
        </div>
      )}
    </div>
  );
}