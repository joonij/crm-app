"use client";

import { useEffect, useState } from "react";
import { Calendar, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Schedule = { id: number; agent_id: number; client_id: number; date: string; time: string; content: string; repeat: boolean; };

export default function ClientScheduleCard({ clientId, agentId }: { clientId: string, agentId: number }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ content: "", date: "", time: "", repeat: false });
  const [isSaving, setIsSaving] = useState(false);

  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const fetchSchedules = async () => {
    const { data } = await supabase.from("schedules").select("*").eq("client_id", clientId).order("date", { ascending: false }).order("time", { ascending: false });
    if (data) setSchedules(data);
  };

  useEffect(() => { void fetchSchedules(); }, [clientId]);

  const handleSaveSchedule = async () => {
    if (!scheduleForm.content.trim() || !scheduleForm.date || !scheduleForm.time) { 
      alert("모두 입력해주세요."); 
      return; 
    }
    setIsSaving(true);

    try {
      // ⭐️ 1. 전달받은 agentId를 활용해 해당 담당자의 agency_id 조회
      const { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("agency_id")
        .eq("id", agentId)
        .single();

      if (agentError || !agentData) {
        throw new Error("담당자의 소속 정보를 불러올 수 없습니다.");
      }

      // ⭐️ 2. agency_id 및 schedule_type 포함하여 INSERT
      const { error } = await supabase.from("schedules").insert([{ 
        agent_id: agentId, 
        agency_id: agentData.agency_id, // 조회된 소속 정보 추가
        client_id: parseInt(clientId, 10), 
        schedule_type: "personal", // 스케줄 보드 구분을 위한 필수값 추가
        ...scheduleForm 
      }]);

      if (error) {
        alert(`일정 저장 실패: ${error.message}`);
      } else { 
        setScheduleForm({ content: "", date: "", time: "", repeat: false }); 
        fetchSchedules(); 
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) setSchedules(prev => prev.filter(s => s.id !== id));
  };
  
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };

  const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="w-full flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm min-h-0">
      
      <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        <Calendar className="h-5 w-5" strokeWidth={2} />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 shrink-0">예정된 일정</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 mb-4 shrink-0">예정된 미팅 및 후속 일정이 이곳에 표시됩니다.</p>
      
      <div className="mb-4 flex flex-col gap-2 shrink-0">
        <div className="flex gap-2">
          <input type="date" className={inputClass} value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
          <input type="time" className={inputClass} value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
        </div>
        <textarea 
          rows={5} 
          value={scheduleForm.content} 
          onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
          placeholder="만남 후기" 
          className={`${inputClass} resize-none`}
        />
        <button onClick={handleSaveSchedule} disabled={isSaving} className="mt-2 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors">
          일정 추가
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {schedules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
            등록된 일정이 없습니다.
          </div>
        ) : (
          schedules.map((s) => {
            const isExpanded = expandedIds.includes(s.id);
            const needsExpandButton = s.content.length > 40 || (s.content.match(/\n/g) || []).length >= 2;

            return (
              <div key={s.id} className="relative group rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm pr-10 shadow-sm transition-all hover:border-gray-200">
                <div className="flex flex-col gap-1.5 pr-2">
                  <p 
                    className={`font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap ${!isExpanded ? "line-clamp-2" : ""}`}
                  >
                    {s.content}
                  </p>
                  
                  {needsExpandButton && (
                    <button 
                      onClick={() => toggleExpand(s.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors w-fit mt-1"
                    >
                      {isExpanded ? (
                        <>접기 <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>더보기 <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
                
                <p className="mt-3 text-right font-bold text-blue-600 text-xs bg-white py-1 px-2 rounded-md w-fit ml-auto border border-blue-100 shadow-sm">
                  {s.date} {s.time ? s.time.substring(0, 5) : ""}
                </p>
                
                <button onClick={() => handleDeleteSchedule(s.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="삭제">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}