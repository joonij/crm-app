"use client";

import { useEffect, useState } from "react";
import { Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Schedule = { id: number; agent_id: number; client_id: number; date: string; time: string; content: string; repeat: boolean; };

export default function ClientScheduleCard({ clientId, agentId }: { clientId: string, agentId: number }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ content: "", date: "", time: "", repeat: false });
  const [isSaving, setIsSaving] = useState(false);

  const fetchSchedules = async () => {
    const { data } = await supabase.from("schedules").select("*").eq("client_id", clientId).order("date", { ascending: false }).order("time", { ascending: false });
    if (data) setSchedules(data);
  };

  useEffect(() => { void fetchSchedules(); }, [clientId]);

  const handleSaveSchedule = async () => {
    if (!scheduleForm.content.trim() || !scheduleForm.date || !scheduleForm.time) { alert("모두 입력해주세요."); return; }
    setIsSaving(true);
    const { error } = await supabase.from("schedules").insert([{ agent_id: agentId, client_id: parseInt(clientId, 10), ...scheduleForm }]);
    if (error) alert(`일정 저장 실패: ${error.message}`);
    else { setScheduleForm({ content: "", date: "", time: "", repeat: false }); fetchSchedules(); }
    setIsSaving(false);
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    // ⭐️ h-full과 min-h-0을 적용하여 부모 높이를 꽉 채우게 합니다.
    <div className="w-full flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm min-h-0">
      
      <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        <Calendar className="h-5 w-5" strokeWidth={2} />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 shrink-0">예정된 일정</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 mb-4 shrink-0">예정된 미팅 및 후속 일정이 이곳에 표시됩니다.</p>
      
      {/* ⭐️ 입력 폼 영역은 찌그러지지 않게 shrink-0 부여 */}
      <div className="mb-4 flex flex-col gap-2 shrink-0">
        <input type="text" placeholder="일정 내용 (예: 2차 미팅)" className={inputClass} value={scheduleForm.content} onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })} />
        <div className="flex gap-2">
          <input type="date" className={inputClass} value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
          <input type="time" className={inputClass} value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 px-1 text-sm text-gray-700">
          <input type="checkbox" checked={scheduleForm.repeat} onChange={(e) => setScheduleForm({ ...scheduleForm, repeat: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          반복 여부
        </label>
        <button onClick={handleSaveSchedule} disabled={isSaving} className="mt-2 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors">
          일정 추가
        </button>
      </div>

      {/* ⭐️ 하단 리스트 영역이 남은 공간을 꽉 채우고 스크롤 생성 (flex-1 overflow-y-auto) */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {schedules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
            등록된 일정이 없습니다.
          </div>
        ) : (
          schedules.map((s) => (
            <div key={s.id} className="relative group rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm pr-10">
              <p className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                <span className="truncate">{s.content}</span>
                {s.repeat && <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">반복</span>}
              </p>
              <p className="mt-2 text-right font-medium text-blue-600 text-xs">{s.date} {s.time}</p>
              <button onClick={() => handleDeleteSchedule(s.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1 transition-colors" title="삭제">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}