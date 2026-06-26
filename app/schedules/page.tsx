"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Users, ChevronLeft, ChevronRight, MapPin, Briefcase } from "lucide-react";

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<"personal" | "team">("team");

  // 예시 데이터 (실제로는 Supabase에서 fetch)
  const teamSchedules = [
    { id: 1, name: "정준희 (ASM)", role: "Manager", events: [
      { date: "2026-06-29", type: "사무", title: "주간 성과 리뷰", color: "bg-gray-100 text-gray-700" }
    ]},
    { id: 2, name: "김수웅 (FC)", role: "Member", events: [
      { date: "2026-06-29", type: "상담", title: "강남역 VIP 상담", color: "bg-blue-100 text-blue-700" },
      { date: "2026-06-30", type: "계약", title: "종신보험 청약", color: "bg-red-100 text-red-700" }
    ]},
    { id: 3, name: "이영희 (FC)", role: "Member", events: [
      { date: "2026-06-29", type: "교육", title: "신상품 교육", color: "bg-yellow-100 text-yellow-700" }
    ]}
  ];

  const weekDays = ["월 (6/29)", "화 (6/30)", "수 (7/1)", "목 (7/2)", "금 (7/3)"];

  return (
    <div className="flex h-full flex-col p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 상단 컨트롤 패널 */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode("personal")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === "personal" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
          >
            <CalendarIcon className="w-4 h-4" /> 내 일정
          </button>
          <button 
            onClick={() => setViewMode("team")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === "team" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
          >
            <Users className="w-4 h-4" /> 팀 일정
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
          <h2 className="text-lg font-bold text-slate-800">2026년 6월 5주차</h2>
          <button className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
        </div>
      </div>

      {/* 팀 타임라인 뷰 */}
      {viewMode === "team" && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
            <div className="p-4 border-r border-slate-200 flex items-center justify-center">팀원</div>
            {weekDays.map(day => (
              <div key={day} className="p-4 border-r border-slate-200 last:border-0 text-center">{day}</div>
            ))}
          </div>

          {/* 팀원별 로우 (Row) */}
          <div className="divide-y divide-slate-200">
            {teamSchedules.map(member => (
              <div key={member.id} className="grid grid-cols-6 hover:bg-slate-50 transition-colors">
                
                {/* 팀원 프로필 영역 */}
                <div className="p-4 border-r border-slate-200 flex flex-col justify-center">
                  <span className="font-bold text-sm text-slate-800">{member.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{member.role}</span>
                  </div>
                </div>

                {/* 요일별 일정 렌더링 영역 */}
                {["2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02", "2026-07-03"].map(date => {
                  const dayEvents = member.events.filter(e => e.date === date);
                  return (
                    <div key={date} className="p-2 border-r border-slate-200 last:border-0 flex flex-col gap-2 min-h-[100px]">
                      {dayEvents.map((evt, idx) => (
                        <div key={idx} className={`p-2 rounded-md border border-white/20 text-xs flex flex-col gap-1 shadow-sm ${evt.color}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{evt.type}</span>
                            {evt.type === "상담" ? <MapPin className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{evt.title}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}