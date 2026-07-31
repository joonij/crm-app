"use client";

import { useEffect, useState } from "react";
import { Calendar, Trash2, ChevronDown, ChevronUp, Edit2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Schedule = { 
  id: number; 
  agent_id: number; 
  client_id: number; 
  date: string; 
  time: string; 
  content: string; 
  repeat: boolean; 
  category?: string; // ⭐️ 카테고리 필드 추가
};

export default function ClientScheduleCard({ clientId, agentId }: { clientId: string, agentId: number }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  // ⭐️ 폼 상태에 category 추가
  const [scheduleForm, setScheduleForm] = useState({ content: "", date: "", time: "", repeat: false, category: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const fetchSchedules = async () => {
    const { data } = await supabase.from("schedules").select("*").eq("client_id", clientId).order("date", { ascending: false }).order("time", { ascending: false });
    if (data) setSchedules(data);
  };

  useEffect(() => { void fetchSchedules(); }, [clientId]);

  // ⭐️ 카테고리별 색상 헬퍼 함수
  const getCategoryColor = (category: string | undefined) => {
    if (category === "AP") return "bg-purple-100 text-purple-700 border-purple-200";
    if (category === "상담") return "bg-blue-100 text-blue-700 border-blue-200";
    if (category === "계약") return "bg-red-100 text-red-700 border-red-200";
    if (category === "리쿠") return "bg-rose-100 text-rose-700 border-rose-200";
    if (category === "청구") return "bg-orange-100 text-orange-700 border-orange-200";
    if (category === "교육") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (category === "회의") return "bg-teal-100 text-teal-700 border-teal-200";
    if (category === "미팅") return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (category === "기타") return "bg-slate-200 text-slate-700 border-slate-300";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const handleEditClick = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setScheduleForm({
      content: schedule.content || "",
      date: schedule.date,
      time: schedule.time || "",
      repeat: schedule.repeat || false,
      category: schedule.category || "", // ⭐️ 수정 시 카테고리 불러오기
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setScheduleForm({ content: "", date: "", time: "", repeat: false, category: "" });
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.content.trim() || !scheduleForm.date || !scheduleForm.time) { 
      alert("모두 입력해주세요."); 
      return; 
    }
    setIsSaving(true);

    try {
      if (editingId) {
        // ⭐️ 기존 일정 수정 (UPDATE) - 카테고리 포함
        const { error } = await supabase
          .from("schedules")
          .update({
            content: scheduleForm.content,
            date: scheduleForm.date,
            time: scheduleForm.time,
            category: scheduleForm.category || null,
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // ⭐️ 신규 일정 추가 (INSERT) - 카테고리 포함
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
          content: scheduleForm.content,
          date: scheduleForm.date,
          time: scheduleForm.time,
          category: scheduleForm.category || null,
        }]);

        if (error) throw error;
      }

      setScheduleForm({ content: "", date: "", time: "", repeat: false, category: "" }); 
      setEditingId(null); 
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
      if (editingId === id) handleCancelEdit();
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
      
      {/* 상단 헤더 영역 */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <Calendar className="h-4 w-4" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">예정된 일정</h2>
        </div>
      </div>      
      
      {/* 입력 폼 영역 */}
      <div className="mb-4 flex flex-col gap-2 shrink-0">
        
        {/* ⭐️ 모바일과 데스크탑에서 모두 예쁘게 떨어지는 Grid 레이아웃 적용 */}
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-2">
          
          {/* 1. 카테고리 (모바일: 전체 차지 / 데스크탑: 3칸 차지) */}
          <div className="col-span-2 sm:col-span-3 relative">
            <select
              value={scheduleForm.category}
              onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
              className={`${inputClass} w-full appearance-none pr-8 cursor-pointer text-gray-700`}
            >
              <option value="AP">AP</option>
              <option value="상담">상담</option>
              <option value="계약">계약</option>
              <option value="리쿠">리쿠</option>
              <option value="청구">청구</option>
              <option value="교육">교육</option>
              <option value="회의">회의</option>
              <option value="미팅">미팅</option>
              <option value="기타">기타</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          {/* 2. 날짜 (모바일: 1칸(50%) 차지 / 데스크탑: 5칸 차지) */}
          <div className="col-span-1 sm:col-span-5">
            <input 
              type="date" 
              className={`${inputClass} w-full cursor-pointer`} 
              max="9999-12-31" 
              value={scheduleForm.date} 
              onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} 
            />
          </div>

          {/* 3. 시간 (모바일: 1칸(50%) 차지 / 데스크탑: 4칸 차지) */}
          <div className="col-span-1 sm:col-span-4">
            <input 
              type="time" 
              className={`${inputClass} w-full cursor-pointer`} 
              value={scheduleForm.time} 
              onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} 
            />
          </div>
        </div>
        
        <textarea 
          rows={5} 
          value={scheduleForm.content} 
          onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
          placeholder="만남 후기 및 기록을 입력하고 일정 추가 버튼을 누르세요." 
          className={`${inputClass} w-full resize-none ${editingId ? 'border-blue-300 ring-2 ring-blue-500/10' : ''}`}
        />
        
        {/* 버튼 영역 */}
        <div className="flex gap-2 mt-2">
          <button onClick={handleSaveSchedule} disabled={isSaving} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 cursor-pointer ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
            {isSaving ? "저장 중..." : (editingId ? "일정 내용 수정" : "일정 추가")}
          </button>
          {editingId && (
            <button onClick={handleCancelEdit} disabled={isSaving} className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              취소
            </button>
          )}
        </div>
      </div>

      {/* 일정 목록 리스트 영역 */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {schedules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
            등록된 일정이 없습니다.
          </div>
        ) : (
          schedules.map((s) => {
            const isExpanded = expandedIds.includes(s.id);
            const needsExpandButton = s.content || "";
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
                      className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors w-fit mt-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>접기 <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>더보기 <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
                
                {/* ⭐️ 카테고리 뱃지 및 일시 정보 표시 */}
                <div className="mt-3 flex items-center justify-end gap-1.5">
                  {s.category && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getCategoryColor(s.category)}`}>
                      {s.category}
                    </span>
                  )}
                  <p className="font-bold text-blue-600 text-xs bg-white py-1 px-2 rounded-md border border-blue-100 shadow-sm shrink-0">
                    {s.date} {s.time ? s.time.substring(0, 5) : ""}
                  </p>
                </div>
                
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <button onClick={() => handleEditClick(s)} className="text-gray-300 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer" title="수정">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteSchedule(s.id)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer" title="삭제">
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