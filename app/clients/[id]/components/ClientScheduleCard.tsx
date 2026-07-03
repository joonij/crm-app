"use client";

import { useEffect, useState } from "react";
import { Calendar, Trash2, ChevronDown, ChevronUp, Edit2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Schedule = { id: number; agent_id: number; client_id: number; date: string; time: string; content: string; repeat: boolean; };

export default function ClientScheduleCard({ clientId, agentId }: { clientId: string, agentId: number }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ content: "", date: "", time: "", repeat: false });
  const [isSaving, setIsSaving] = useState(false);

  // ⭐️ 수정 모드 상태 추가
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const fetchSchedules = async () => {
    const { data } = await supabase.from("schedules").select("*").eq("client_id", clientId).order("date", { ascending: false }).order("time", { ascending: false });
    if (data) setSchedules(data);
  };

  useEffect(() => { void fetchSchedules(); }, [clientId]);

  // ⭐️ 수정 버튼 클릭 시 폼에 데이터 세팅
  const handleEditClick = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setScheduleForm({
      content: schedule.content,
      date: schedule.date,
      time: schedule.time || "",
      repeat: schedule.repeat || false,
    });
  };

  // ⭐️ 수정 취소
  const handleCancelEdit = () => {
    setEditingId(null);
    setScheduleForm({ content: "", date: "", time: "", repeat: false });
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.content.trim() || !scheduleForm.date || !scheduleForm.time) { 
      alert("모두 입력해주세요."); 
      return; 
    }
    setIsSaving(true);

    try {
      if (editingId) {
        // ⭐️ 기존 일정 수정 (UPDATE)
        const { error } = await supabase
          .from("schedules")
          .update({
            content: scheduleForm.content,
            date: scheduleForm.date,
            time: scheduleForm.time,
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // ⭐️ 신규 일정 추가 (INSERT)
        const { data: agentData, error: agentError } = await supabase
          .from("agents")
          .select("agency_id")
          .eq("id", agentId)
          .single();

        if (agentError || !agentData) {
          throw new Error("담당자의 소속 정보를 불러올 수 없습니다.");
        }

        const { error } = await supabase.from("schedules").insert([{ 
          agent_id: agentId, 
          agency_id: agentData.agency_id,
          client_id: parseInt(clientId, 10), 
          schedule_type: "personal", 
          ...scheduleForm 
        }]);

        if (error) throw error;
      }

      setScheduleForm({ content: "", date: "", time: "", repeat: false }); 
      setEditingId(null); // 수정 모드 초기화
      fetchSchedules(); 
      
    } catch (error: any) {
      alert(`일정 저장 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      if (editingId === id) handleCancelEdit(); // 수정 중인 일정을 삭제했을 때 폼도 초기화
    }
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
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">예정된 일정</h2>
        {editingId && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full animate-pulse">수정 모드</span>}
      </div>
      <p className="text-sm leading-relaxed text-gray-500 mb-4 shrink-0">예정된 미팅 및 후속 일정이 이곳에 표시됩니다.</p>
      
      <div className="mb-4 flex flex-col gap-2 shrink-0">
        <div className="flex gap-2">
          <input type="date" className={inputClass} max="9999-12-31" value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
          <input type="time" className={inputClass} value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
        </div>
        <textarea 
          rows={5} 
          value={scheduleForm.content} 
          onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
          placeholder="만남 후기 및 기록 내용" 
          className={`${inputClass} resize-none ${editingId ? 'border-blue-300 ring-2 ring-blue-500/10' : ''}`}
        />
        
        {/* ⭐️ 버튼 영역 분기 처리 (추가 vs 수정) */}
        <div className="flex gap-2 mt-2">
          <button onClick={handleSaveSchedule} disabled={isSaving} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
            {isSaving ? "저장 중..." : (editingId ? "일정 내용 수정" : "일정 추가")}
          </button>
          {editingId && (
            <button onClick={handleCancelEdit} disabled={isSaving} className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              취소
            </button>
          )}
        </div>
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
            const isCurrentlyEditing = editingId === s.id;

            return (
              <div key={s.id} className={`relative group rounded-lg border p-4 text-sm shadow-sm transition-all pr-12 ${isCurrentlyEditing ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
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
                
                {/* ⭐️ 수정 및 삭제 툴바 */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <button onClick={() => handleEditClick(s)} className="text-gray-300 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors" title="수정">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteSchedule(s.id)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="삭제">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}