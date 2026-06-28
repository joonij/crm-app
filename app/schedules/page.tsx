"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Loader2, Plus, Megaphone, Building2, Users, ChevronDown, ChevronUp, Edit2, Trash2, LayoutGrid, List } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ScheduleModal from "./components/ScheduleModal"; // ⭐️ 분리된 컴포넌트 임포트

type ScheduleType = 'company' | 'agency' | 'team' | 'personal';

type ScheduleEvent = {
  id: number;
  date: string;
  time: string;
  content: string;
  schedule_type: ScheduleType;
  color: string;
  agency_id: number;
  agent_id?: number;
  ownerName?: string;
  repeat?: boolean;
};

type TeamMemberSchedule = {
  id: number;
  name: string;
  role: string;
  events: ScheduleEvent[];
};

export default function SchedulePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  
  const [teamSchedules, setTeamSchedules] = useState<TeamMemberSchedule[]>([]);
  const [companyNotices, setCompanyNotices] = useState<ScheduleEvent[]>([]);
  const [agencyNotices, setAgencyNotices] = useState<ScheduleEvent[]>([]);
  const [teamNotices, setTeamNotices] = useState<ScheduleEvent[]>([]);
  
  const [expandedEvents, setExpandedEvents] = useState<number[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [weekDays, setWeekDays] = useState<{ date: string; label: string; rawLabel: string }[]>([]);
  const [monthDays, setMonthDays] = useState<{ date: string; isCurrentMonth: boolean; raw: number }[]>([]);
  
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [selectedMobileDate, setSelectedMobileDate] = useState("");
  
  // ⭐️ 모달 제어 상태 구조화
  const [modalState, setModalState] = useState<{ isOpen: boolean; editData: any; defaultDate: string }>({
    isOpen: false,
    editData: null,
    defaultDate: ""
  });
  
  const [myInfo, setMyInfo] = useState<{ id: number; agency_id: number; rank: string; corpName: string; branchName: string; teamNum: string } | null>(null);

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getWeekDays = (baseDate: Date) => {
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() - baseDate.getDay()); 
    const days = [];
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    for (let i = 0; i < 7; i++) { 
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      days.push({ date: formatDateStr(date), label: `${dayNames[date.getDay()]} (${date.getMonth() + 1}/${date.getDate()})`, rawLabel: dayNames[date.getDay()] });
    }
    return days;
  };

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: formatDateStr(d), isCurrentMonth: false, raw: d.getDate() });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: formatDateStr(d), isCurrentMonth: true, raw: i });
    }
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: formatDateStr(d), isCurrentMonth: false, raw: d.getDate() });
    }
    return days;
  };

  const getColorByContent = (content: string) => {
    if (!content) return "bg-slate-100 text-slate-700 border-slate-200";
    if (content.includes("상담") || content.includes("미팅")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (content.includes("계약") || content.includes("청약")) return "bg-red-100 text-red-800 border-red-200";
    if (content.includes("교육") || content.includes("회의")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      setIsLoading(true);
      try {
        const currentWeek = getWeekDays(currentDate);
        const currentMonth = getMonthDays(currentDate);
        setWeekDays(currentWeek);
        setMonthDays(currentMonth);
        
        const todayStr = formatDateStr(new Date());
        setSelectedMobileDate(currentWeek.some(d => d.date === todayStr) ? todayStr : currentWeek[0].date);

        const startDate = currentMonth[0].date;
        const endDate = currentMonth[currentMonth.length - 1].date;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: info } = await supabase.from("agents").select("id, rank, agency_id, agencies(corporation_name, branch_name, team_number)").eq("auth_id", user.id).single();
        if (!info || !info.agencies) return;
        
        const agencyData = Array.isArray(info.agencies) ? info.agencies[0] : info.agencies;
        setMyInfo({ 
          id: info.id, agency_id: info.agency_id, rank: info.rank || 'FC',
          corpName: agencyData?.corporation_name || "", branchName: agencyData?.branch_name || "", teamNum: agencyData?.team_number?.toString() || ""
        });

        const myAgencyId = info.agency_id; 
        const myRank = (info.rank || 'FC').toUpperCase();
        const { data: corpAgencies } = await supabase.from("agencies").select("id, branch_name").eq("corporation_name", agencyData.corporation_name);
        const corpAgencyIds = corpAgencies?.map(a => a.id) || [];
        const branchAgencyIds = corpAgencies?.filter(a => a.branch_name === agencyData.branch_name).map(a => a.id) || [];

        let membersQuery = supabase.from("agents").select("id, name, rank").order('id', { ascending: true });
        if (myRank === 'SM') membersQuery = membersQuery.eq('agency_id', myAgencyId);
        else membersQuery = membersQuery.eq('id', info.id);

        const [{ data: members }, { data: schedules }] = await Promise.all([
          membersQuery,
          supabase.from("schedules").select("*").in("agency_id", corpAgencyIds).gte("date", startDate).lte("date", endDate).order('time', { ascending: true })
        ]);

        if (!members || !schedules) return;

        setCompanyNotices(schedules.filter(s => s.schedule_type === 'company').map(e => ({ ...e, color: "bg-indigo-100 text-indigo-900 border-indigo-200" })));
        setAgencyNotices(schedules.filter(s => s.schedule_type === 'agency' && (myRank === 'RM' || branchAgencyIds.includes(s.agency_id))).map(e => ({ ...e, color: "bg-purple-100 text-purple-900 border-purple-200" })));
        setTeamNotices(schedules.filter(s => s.schedule_type === 'team' && (myRank === 'BM' ? branchAgencyIds.includes(s.agency_id) : s.agency_id === myAgencyId)).map(e => ({ ...e, color: "bg-emerald-100 text-emerald-900 border-emerald-200" })));
        
        const formattedMembers = members.map(member => ({
          id: member.id, name: `${member.name} (${member.rank || 'FC'})`, role: member.id === info.id ? "Me" : "Member",
          events: schedules.filter(s => s.agent_id === member.id && s.schedule_type === 'personal').map(evt => ({
            ...evt, time: evt.time ? evt.time.substring(0, 5) : "", color: getColorByContent(evt.content), ownerName: member.name
          }))
        })).sort((a, b) => a.role === "Me" ? -1 : b.role === "Me" ? 1 : a.name.localeCompare(b.name, 'ko-KR'));

        setTeamSchedules(formattedMembers);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamData();
  }, [currentDate, refreshTrigger, viewMode]);

  const changeDate = (offset: number) => {
    const newDate = new Date(currentDate);
    viewMode === 'weekly' ? newDate.setDate(newDate.getDate() + (offset * 7)) : newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
    setExpandedEvents([]); 
  };

  const openModal = (defaultDate: string = "", editData: any = null) => {
    setModalState({ isOpen: true, editData, defaultDate: defaultDate || formatDateStr(new Date()) });
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm("이 일정을 완전히 삭제하시겠습니까?")) return;
    try {
      await supabase.from('schedules').delete().eq('id', id);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) { alert("삭제 실패: " + error.message); }
  };

  const toggleEventExpand = (eventId: number) => setExpandedEvents(prev => prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]);

  const renderEvent = (evt: any, showOwner: boolean = false) => {
    const isExpanded = expandedEvents.includes(evt.id);
    return (
      <div key={evt.id} onClick={() => toggleEventExpand(evt.id)} className={`p-2 rounded-md border text-xs flex flex-col gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${evt.color}`}>
        <div className="flex items-center justify-between border-b border-black/10 pb-1">
          <span className="font-extrabold flex items-center gap-1"><Clock className="w-3 h-3 opacity-70" /> {evt.time}{showOwner && evt.ownerName && <span className="ml-1 opacity-70">| {evt.ownerName}</span>}</span>
          {evt.schedule_type === 'personal' && evt.content?.includes("상담") ? <MapPin className="w-3 h-3 opacity-70" /> : null}
        </div>
        <div className="flex flex-col">
          <span className={`leading-snug whitespace-pre-wrap ${isExpanded ? "" : "line-clamp-2"}`}>{evt.content}</span>
          {isExpanded && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/10">
              <span className="text-[10px] font-bold opacity-60">접기 ▲</span>
              {(evt.agent_id === myInfo?.id || !evt.agent_id) && (
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openModal("", evt); }} className="text-blue-700 flex items-center gap-0.5 font-bold"><Edit2 className="w-3 h-3" /> 수정</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(evt.id); }} className="text-red-600 flex items-center gap-0.5 font-bold"><Trash2 className="w-3 h-3" /> 삭제</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNoticeRow = (title: string, icon: any, events: any[], bgColor: string, textColor: string) => {
    if (events.length === 0) return null;
    return (
      <div className={`grid grid-cols-8 ${bgColor} border-b-2 border-white/50`}>
        <div className="p-4 border-r border-slate-200/50 flex flex-col justify-center items-center text-center gap-1.5">{icon}<span className={`font-extrabold text-xs ${textColor}`}>{title}</span></div>
        {weekDays.map(({ date }) => (
          <div key={`${title}-${date}`} className="p-2 border-r border-slate-200/50 last:border-0 flex flex-col gap-2 min-h-[70px]">
            {events.filter(e => e.date === date).map(evt => renderEvent(evt))}
          </div>
        ))}
      </div>
    );
  };

  const allEventsForMonth = [...companyNotices, ...agencyNotices, ...teamNotices, ...teamSchedules.flatMap(m => m.events)];

  return (
    <div className="flex h-full flex-col p-4 md:p-6 max-w-[1400px] mx-auto space-y-4 md:space-y-6">
      
      {/* 헤더/컨트롤 영역 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-blue-600" /> 스케줄 보드</h2>
          <button onClick={() => openModal()} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold px-3 py-2 rounded-lg shadow-sm"><Plus className="w-4 h-4" /> 일정 추가</button>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          <div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setViewMode('weekly')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'weekly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}><List className="w-3.5 h-3.5" /> 주간</button>
            <button onClick={() => setViewMode('monthly')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}><LayoutGrid className="w-3.5 h-3.5" /> 월간</button>
          </div>
          <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-slate-100 rounded-full transition"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-sm md:text-base font-bold text-slate-800 whitespace-nowrap px-2">
              {viewMode === 'weekly' ? `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7)}주차` : `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}
            </h2>
            <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-slate-100 rounded-full transition"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {isLoading && <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}

      {/* 데스크탑 뷰 */}
      {!isLoading && (
        <div className="hidden md:block border border-slate-200 rounded-xl bg-white shadow-sm">
          {viewMode === 'weekly' ? (
            <div className="overflow-x-auto min-w-[1100px]">
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 shadow-sm relative">
                <div className="p-4 border-r border-slate-200 flex items-center justify-center">구분</div>
                {weekDays.map(day => (
                  <div key={day.date} className="group relative p-4 border-r border-slate-200 text-center flex justify-center items-center gap-2 hover:bg-blue-50 transition-colors">
                    <span className={`${day.label.includes('일') ? 'text-red-500' : day.label.includes('토') ? 'text-blue-500' : ''}`}>{day.label}</span>
                    <button onClick={() => openModal(day.date)} className="opacity-0 group-hover:opacity-100 absolute right-2 p-1 bg-white border border-blue-200 text-blue-600 rounded-full shadow-sm hover:bg-blue-600 hover:text-white transition-all"><Plus className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-slate-200">
                {renderNoticeRow("회사 공지", <Megaphone className="w-5 h-5 text-indigo-600" />, companyNotices, "bg-indigo-50/40", "text-indigo-800")}
                {renderNoticeRow("지점 공지", <Building2 className="w-5 h-5 text-purple-600" />, agencyNotices, "bg-purple-50/40", "text-purple-800")}
                {renderNoticeRow("팀 공지", <Users className="w-5 h-5 text-emerald-600" />, teamNotices, "bg-emerald-50/40", "text-emerald-800")}
                {teamSchedules.map(member => (
                  <div key={member.id} className="grid grid-cols-8 hover:bg-slate-50 transition-colors">
                    <div className="p-4 border-r border-slate-200 flex flex-col justify-center bg-white"><span className="font-bold text-sm">{member.name}</span></div>
                    {weekDays.map(({ date }) => (
                      <div key={date} className="group relative p-2 border-r border-slate-200 flex flex-col gap-2 min-h-[100px] bg-white/50 hover:bg-slate-50/50 transition-colors">
                        {member.events.filter(e => e.date === date).map(evt => renderEvent(evt))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 shrink-0">
                {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => <div key={d} className={`p-3 text-center border-r border-slate-200 ${i===0?'text-red-500':i===6?'text-blue-500':''}`}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 flex-1 bg-slate-200 gap-[1px]">
                {monthDays.map((day, idx) => (
                  <div key={`${day.date}-${idx}`} className={`group relative bg-white p-2 flex flex-col min-h-[180px] overflow-hidden hover:bg-slate-50 ${day.isCurrentMonth ? '' : 'opacity-60 bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${day.date === formatDateStr(new Date()) ? 'bg-blue-600 text-white' : idx%7===0 ? 'text-red-500' : idx%7===6 ? 'text-blue-500' : ''}`}>{day.raw}</span>
                      <button onClick={() => openModal(day.date)} className="opacity-0 group-hover:opacity-100 p-1 bg-white border border-blue-200 text-blue-600 rounded-full shadow-sm hover:bg-blue-600 hover:text-white transition-all"><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {allEventsForMonth.filter(e => e.date === day.date).map(evt => renderEvent(evt, true))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 모달 호출부 */}
      <ScheduleModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ ...modalState, isOpen: false })} 
        onSuccess={() => setRefreshTrigger(prev => prev + 1)} 
        myInfo={myInfo} 
        editData={modalState.editData} 
        defaultDate={modalState.defaultDate} 
      />
    </div>
  );
}