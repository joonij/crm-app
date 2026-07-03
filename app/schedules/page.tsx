"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Loader2, Plus, Megaphone, Building2, Users, ChevronDown, ChevronUp, Edit2, Trash2, LayoutGrid, List } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ScheduleModal from "./components/ScheduleModal"; 

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
        if (viewMode === 'monthly') {
          setSelectedMobileDate(currentMonth.some(d => d.date === todayStr && d.isCurrentMonth) ? todayStr : currentMonth.find(d => d.isCurrentMonth)?.date || currentMonth[0].date);
        } else {
          setSelectedMobileDate(currentWeek.some(d => d.date === todayStr) ? todayStr : currentWeek[0].date);
        }

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
      <div key={evt.id} onClick={() => toggleEventExpand(evt.id)} className={`p-3 sm:p-2 rounded-xl sm:rounded-md border text-sm sm:text-xs flex flex-col gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${evt.color}`}>
        <div className="flex items-center justify-between border-b border-black/10 pb-1.5 sm:pb-1">
          <span className="font-black sm:font-extrabold flex items-center gap-1.5 sm:gap-1 text-[13px] sm:text-xs"><Clock className="w-3.5 h-3.5 sm:w-3 sm:h-3 opacity-70" /> {evt.time}{showOwner && evt.ownerName && <span className="ml-1 opacity-70">| {evt.ownerName}</span>}</span>
          {evt.schedule_type === 'personal' && evt.content?.includes("상담") ? <MapPin className="w-3.5 h-3.5 sm:w-3 sm:h-3 opacity-70" /> : null}
        </div>
        <div className="flex flex-col mt-0.5">
          <span className={`leading-relaxed whitespace-pre-wrap font-medium ${isExpanded ? "" : "line-clamp-2"}`}>{evt.content}</span>
          {isExpanded && (
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/10">
              <span className="text-[11px] sm:text-[10px] font-bold opacity-60">접기 ▲</span>
              {(evt.agent_id === myInfo?.id || !evt.agent_id) && (
                <div className="flex gap-3 sm:gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openModal("", evt); }} className="text-blue-700 flex items-center gap-1 font-bold text-xs"><Edit2 className="w-3 h-3" /> 수정</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(evt.id); }} className="text-red-600 flex items-center gap-1 font-bold text-xs"><Trash2 className="w-3 h-3" /> 삭제</button>
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
    // ⭐️ 최상단 컨테이너에 overflow-hidden 추가하여 전체 페이지 스크롤 방지
    <div className="flex flex-col p-0 sm:p-4 md:p-6 max-w-[1400px] mx-auto space-y-0 sm:space-y-4 md:space-y-6 relative pb-0 sm:pb-0 overflow-hidden h-full md:h-auto md:pb-20">
      
      {/* ⭐️ 헤더/컨트롤 영역 (shrink-0 부여로 고정) */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-0 bg-white sm:bg-transparent z-20 border-b sm:border-0 border-slate-100 shadow-sm sm:shadow-none">
        <div className="flex items-center gap-3 md:gap-4 justify-between w-full md:w-auto">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-blue-600" /> 스케줄 보드</h2>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button onClick={() => setViewMode('weekly')} className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${viewMode === 'weekly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                <span className="hidden sm:inline">주간</span><span className="sm:hidden">주간</span>
              </button>
              <button onClick={() => setViewMode('monthly')} className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${viewMode === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                <span className="hidden sm:inline">월간</span><span className="sm:hidden">월간</span>
              </button>
            </div>
            {/* 데스크탑 전용 추가 버튼 */}
            <button onClick={() => openModal()} className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold px-3 py-2 rounded-lg shadow-sm cursor-pointer"><Plus className="w-4 h-4" /> 일정 추가</button>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          <div className="flex items-center gap-3 w-full sm:w-auto bg-white p-1 sm:rounded-xl border border-slate-200 shadow-sm rounded-lg justify-between">
            <button onClick={() => changeDate(-1)} className="p-2 sm:p-1.5 hover:bg-slate-100 rounded-lg sm:rounded-full transition cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-[13px] sm:text-base font-bold text-slate-800 whitespace-nowrap px-2 text-center flex-1">
              {viewMode === 'weekly' ? `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7)}주차` : `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}
            </h2>
            <button onClick={() => changeDate(1)} className="p-2 sm:p-1.5 hover:bg-slate-100 rounded-lg sm:rounded-full transition cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {isLoading && <div className="flex justify-center flex-1 items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}

      {!isLoading && (
        <>
          {/* 데스크탑 뷰 (기존 UI 유지) */}
          <div className="hidden md:block border border-slate-200 rounded-xl bg-white shadow-sm flex-1 overflow-hidden flex flex-col">
            {viewMode === 'weekly' ? (
              <div className="overflow-x-auto overflow-y-auto flex-1 min-w-[1100px]">
                <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 shadow-sm relative sticky top-0 z-20">
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
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 shrink-0">
                  {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => <div key={d} className={`p-3 text-center border-r border-slate-200 ${i===0?'text-red-500':i===6?'text-blue-500':''}`}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 flex-1 bg-slate-200 gap-[1px] overflow-y-auto">
                  {monthDays.map((day, idx) => (
                    <div key={`${day.date}-${idx}`} className={`group relative bg-white p-2 flex flex-col min-h-[140px] xl:min-h-[180px] overflow-hidden hover:bg-slate-50 ${day.isCurrentMonth ? '' : 'opacity-60 bg-slate-50'}`}>
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

          {/* ⭐️ 모바일 뷰 (flex-1과 overflow-hidden 부여하여 전체 레이아웃 구속) */}
          <div className="md:hidden flex flex-col bg-slate-50 flex-1 min-h-0 relative overflow-hidden">
            
            {viewMode === 'weekly' ? (
              // ⭐️ 가로 날짜 선택기 (shrink-0으로 상단 고정)
              <div className="shrink-0 flex overflow-x-auto bg-white border-b border-slate-200 px-2 py-3 gap-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden z-10">
                {weekDays.map(day => {
                  const isSelected = selectedMobileDate === day.date;
                  const isToday = day.date === formatDateStr(new Date());
                  const dayNum = parseInt(day.date.slice(-2), 10);
                  
                  return (
                    <button 
                      key={day.date} 
                      onClick={() => setSelectedMobileDate(day.date)}
                      className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-2xl transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                      <span className={`text-[10px] font-bold mb-1 ${isSelected ? 'text-blue-100' : day.rawLabel === '일' ? 'text-red-400' : day.rawLabel === '토' ? 'text-blue-400' : ''}`}>{day.rawLabel}</span>
                      <span className={`text-sm font-black ${isToday && !isSelected ? 'text-blue-600' : ''}`}>{dayNum}</span>
                      {isToday && <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-600'}`} />}
                    </button>
                  )
                })}
              </div>
            ) : (
              // ⭐️ 모바일 전용 미니 캘린더 (shrink-0으로 상단 고정)
              <div className="shrink-0 bg-white border-b border-slate-200 px-2 py-3 shadow-sm z-10">
                <div className="grid grid-cols-7 mb-1.5">
                  {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                    <div key={d} className={`text-center text-[10px] font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-500'}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {monthDays.map((day, idx) => {
                    const isSelected = selectedMobileDate === day.date;
                    const isToday = day.date === formatDateStr(new Date());
                    const dayEvents = allEventsForMonth.filter(e => e.date === day.date);
                    
                    return (
                      <button
                        key={`${day.date}-${idx}`}
                        onClick={() => setSelectedMobileDate(day.date)}
                        className={`flex flex-col items-center justify-start py-1.5 min-h-[44px] rounded-xl transition-all ${!day.isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200 shadow-sm' : 'hover:bg-slate-50'}`}
                      >
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isSelected ? 'bg-blue-600 text-white' : isToday ? 'text-blue-600 bg-blue-100' : idx % 7 === 0 ? 'text-red-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-slate-700'}`}>
                          {day.raw}
                        </span>
                        <div className="flex gap-0.5 mt-0.5 h-1.5">
                          {dayEvents.slice(0, 3).map((e, i) => (
                            <span key={i} className={`w-1.5 h-1.5 rounded-full ${e.schedule_type === 'company' ? 'bg-indigo-400' : e.schedule_type === 'agency' ? 'bg-purple-400' : e.schedule_type === 'team' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                          ))}
                          {dayEvents.length > 3 && <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ⭐️ 선택된 날짜의 일정 피드 (여기에만 스크롤 바 생성) */}
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-28">
              
              <div className="space-y-3">
                {companyNotices.filter(e => e.date === selectedMobileDate).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-black text-xs px-1"><Megaphone className="w-3.5 h-3.5" /> 회사 공지</div>
                    {companyNotices.filter(e => e.date === selectedMobileDate).map(evt => renderEvent(evt))}
                  </div>
                )}
                {agencyNotices.filter(e => e.date === selectedMobileDate).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-purple-700 font-black text-xs px-1"><Building2 className="w-3.5 h-3.5" /> 지점 공지</div>
                    {agencyNotices.filter(e => e.date === selectedMobileDate).map(evt => renderEvent(evt))}
                  </div>
                )}
                {teamNotices.filter(e => e.date === selectedMobileDate).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs px-1"><Users className="w-3.5 h-3.5" /> 팀 공지</div>
                    {teamNotices.filter(e => e.date === selectedMobileDate).map(evt => renderEvent(evt))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {teamSchedules.map(member => {
                  const memberEvents = member.events.filter(e => e.date === selectedMobileDate);
                  if (memberEvents.length === 0) return null;
                  
                  return (
                    <div key={member.id} className="flex flex-col gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs px-1 pb-2 border-b border-slate-100">
                        {member.role === 'Me' ? <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">내 일정</span> : <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">팀원</span>}
                        {member.name}
                      </div>
                      <div className="flex flex-col gap-2 mt-1">
                        {memberEvents.map(evt => renderEvent(evt))}
                      </div>
                    </div>
                  )
                })}
                
                {allEventsForMonth.filter(e => e.date === selectedMobileDate).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                    <CalendarIcon className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-semibold">이날은 등록된 일정이 없습니다.</p>
                  </div>
                )}
              </div>

            </div>

            {/* 모바일 플로팅 액션 버튼 (FAB) */}
            <button 
              onClick={() => openModal(selectedMobileDate)}
              className="md:hidden absolute bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40 border-2 border-white"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

        </>
      )}

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