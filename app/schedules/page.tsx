"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Loader2, Plus, X, Megaphone, Building2, Users, Save, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ScheduleType = 'company' | 'agency' | 'team' | 'personal';

type ScheduleEvent = {
  id: number;
  date: string;
  time: string;
  content: string;
  schedule_type: ScheduleType;
  color: string;
  agency_id: number;
};

type TeamMemberSchedule = {
  id: number;
  name: string;
  role: string;
  events: ScheduleEvent[];
};

export default function SchedulePage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [teamSchedules, setTeamSchedules] = useState<TeamMemberSchedule[]>([]);
  const [companyNotices, setCompanyNotices] = useState<ScheduleEvent[]>([]);
  const [agencyNotices, setAgencyNotices] = useState<ScheduleEvent[]>([]);
  const [teamNotices, setTeamNotices] = useState<ScheduleEvent[]>([]);
  
  const [expandedEvents, setExpandedEvents] = useState<number[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<{ date: string; label: string; rawLabel: string }[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const [selectedMobileDate, setSelectedMobileDate] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [myInfo, setMyInfo] = useState<{ 
    id: number; 
    agency_id: number; 
    rank: string;
    corpName: string;
    branchName: string;
    teamNum: string;
  } | null>(null);
  
  const [newSchedule, setNewSchedule] = useState({ 
    date: "", 
    time: "", 
    content: "", 
    schedule_type: "personal" as ScheduleType 
  });

  // ⭐️ 핵심 버그 픽스 영역 1: 로컬 연/월/일 추출 방식으로 변경
  const getWeekDays = (baseDate: Date) => {
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() - baseDate.getDay()); 
    const days = [];
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    for (let i = 0; i < 7; i++) { 
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      
      // toISOString() 대신 로컬 타임존 기반으로 YYYY-MM-DD 생성
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const label = `${dayNames[date.getDay()]} (${date.getMonth() + 1}/${date.getDate()})`;
      days.push({ date: dateString, label, rawLabel: dayNames[date.getDay()] });
    }
    return days;
  };

  const getWeekOfMonth = (date: Date) => {
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDay = firstDate.getDay();
    return Math.ceil((date.getDate() + startDay) / 7);
  };

  const getColorByContent = (content: string) => {
    if (!content) return "bg-slate-100 text-slate-700 border-slate-200";
    if (content.includes("상담") || content.includes("미팅") || content.includes("고객")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (content.includes("계약") || content.includes("청약") || content.includes("서명")) return "bg-red-100 text-red-800 border-red-200";
    if (content.includes("교육") || content.includes("회의") || content.includes("조회")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      setIsLoading(true);
      try {
        const currentWeek = getWeekDays(new Date(currentDate));
        setWeekDays(currentWeek);
        
        // ⭐️ 핵심 버그 픽스 영역 2: 오늘 날짜도 로컬 기준으로 추출
        const now = new Date();
        const tYear = now.getFullYear();
        const tMonth = String(now.getMonth() + 1).padStart(2, "0");
        const tDay = String(now.getDate()).padStart(2, "0");
        const todayStr = `${tYear}-${tMonth}-${tDay}`;

        const hasToday = currentWeek.some(d => d.date === todayStr);
        setSelectedMobileDate(hasToday ? todayStr : currentWeek[0].date);

        const startDate = currentWeek[0].date;
        const endDate = currentWeek[6].date;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: info } = await supabase
          .from("agents")
          .select("id, agent_code, name, rank, agency_id, agencies(corporation_name, branch_name, team_number)")
          .eq("auth_id", user.id)
          .single();

          if (!info || !info.agencies) return;
        
          // ⭐️ TS 에러 방지: agencies가 배열로 들어올 경우 첫 번째 요소([0])를 선택하도록 안전하게 처리
          const agencyData = Array.isArray(info.agencies) ? info.agencies[0] : info.agencies;
          
          const myCorp = agencyData?.corporation_name || "회사";
          const myBranch = agencyData?.branch_name || "지점";
          const myTeam = agencyData?.team_number?.toString() || "";

        setMyInfo({ 
          id: info.id, 
          agency_id: info.agency_id, 
          rank: info.rank || 'FC',
          corpName: myCorp,
          branchName: myBranch,
          teamNum: myTeam
        });

        const myAgencyId = info.agency_id; 
        const myRank = (info.rank || 'FC').toUpperCase();

        const { data: corpAgencies } = await supabase
          .from("agencies")
          .select("id, branch_name")
          .eq("corporation_name", myCorp);

        const corpAgencyIds = corpAgencies?.map(a => a.id) || [];
        const branchAgencyIds = corpAgencies?.filter(a => a.branch_name === myBranch).map(a => a.id) || [];

        let membersQuery = supabase
          .from("agents")
          .select("id, name, rank")
          .order('id', { ascending: true });

        if (myRank === 'SM') {
          membersQuery = membersQuery.eq('agency_id', myAgencyId);
        } else {
          membersQuery = membersQuery.eq('id', info.id);
        }

        const { data: members, error: memberError } = await membersQuery;
        if (memberError || !members) throw memberError;

        const { data: schedules, error: scheduleError } = await supabase
          .from("schedules")
          .select("id, agent_id, agency_id, date, time, content, schedule_type")
          .in("agency_id", corpAgencyIds)
          .gte("date", startDate)
          .lte("date", endDate)
          .order('time', { ascending: true });

        if (scheduleError) throw scheduleError;

        const c_notices = schedules?.filter(s => s.schedule_type === 'company').map(evt => ({
          ...evt, color: "bg-indigo-100 text-indigo-900 border-indigo-200"
        })) || [];

        const a_notices = schedules?.filter(s => {
          if (s.schedule_type !== 'agency') return false;
          if (myRank === 'RM') return true; 
          return branchAgencyIds.includes(s.agency_id); 
        }).map(evt => ({
          ...evt, color: "bg-purple-100 text-purple-900 border-purple-200"
        })) || [];

        const t_notices = schedules?.filter(s => {
          if (s.schedule_type !== 'team') return false;
          if (myRank === 'RM') return false;
          if (myRank === 'BM') return branchAgencyIds.includes(s.agency_id);
          return s.agency_id === myAgencyId;
        }).map(evt => ({
          ...evt, color: "bg-emerald-100 text-emerald-900 border-emerald-200"
        })) || [];

        const formattedMembers: TeamMemberSchedule[] = members.map(member => {
          const personalEvents = schedules?.filter(s => s.agent_id === member.id && s.schedule_type === 'personal') || [];
          
          return {
            id: member.id,
            name: `${member.name} (${member.rank || 'FC'})`,
            role: member.id === info.id ? "Me" : "Member",
            events: personalEvents.map(evt => ({
              ...evt, time: evt.time ? evt.time.substring(0, 5) : "", color: getColorByContent(evt.content)
            }))
          };
        });

        formattedMembers.sort((a, b) => {
          if (a.role === "Me") return -1;
          if (b.role === "Me") return 1;
          return a.name.localeCompare(b.name, 'ko-KR');
        });

        setCompanyNotices(c_notices);
        setAgencyNotices(a_notices);
        setTeamNotices(t_notices);
        setTeamSchedules(formattedMembers);

      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [currentDate, refreshTrigger]);

  const handleAddSchedule = async () => {
    if (!newSchedule.date || !newSchedule.time || !newSchedule.content) return alert("날짜, 시간, 내용을 모두 입력해주세요.");
    if (!myInfo) return alert("사용자 정보를 불러올 수 없습니다.");

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('schedules').insert({
        agent_id: myInfo.id,
        agency_id: myInfo.agency_id,
        date: newSchedule.date,
        time: newSchedule.time + ":00",
        content: newSchedule.content,
        schedule_type: newSchedule.schedule_type
      });

      if (error) throw error;

      setIsAddModalOpen(false);
      setNewSchedule({ date: "", time: "", content: "", schedule_type: "personal" });
      setRefreshTrigger(prev => prev + 1); 

    } catch (error: any) {
      alert("일정 추가 실패: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentDate(newDate);
    setExpandedEvents([]); 
  };

  const toggleEventExpand = (eventId: number) => {
    setExpandedEvents(prev => prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]);
  };

  const renderEvent = (evt: any) => {
    const isExpanded = expandedEvents.includes(evt.id);
    const isLongContent = evt.content.length > 20;

    return (
      <div 
        key={evt.id} 
        onClick={() => toggleEventExpand(evt.id)}
        className={`p-2 rounded-md border text-xs flex flex-col gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${evt.color}`}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-1">
          <span className="font-extrabold flex items-center gap-1">
            <Clock className="w-3 h-3 opacity-70" /> {evt.time ? evt.time.substring(0, 5) : ""}
          </span>
          {evt.schedule_type === 'personal' && (evt.content?.includes("상담") || evt.content?.includes("계약")) ? <MapPin className="w-3 h-3 opacity-70" /> : null}
        </div>
        <div className="flex flex-col">
          <span className={`leading-snug whitespace-pre-wrap ${isExpanded ? "" : "line-clamp-2"}`}>
            {evt.content}
          </span>
          {isLongContent && (
            <span className="text-[10px] font-bold mt-1.5 opacity-60 hover:opacity-100 text-right">
              {isExpanded ? "접기 ▲" : "더보기 ▼"}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderNoticeRow = (title: string, icon: any, events: any[], bgColor: string, textColor: string) => {
    if (events.length === 0) return null;
    return (
      <div className={`grid grid-cols-8 ${bgColor} transition-colors border-b-2 border-white/50`}>
        <div className="p-4 border-r border-slate-200/50 flex flex-col justify-center items-center text-center gap-1.5">
          {icon}
          <span className={`font-extrabold text-xs ${textColor} break-keep`}>{title}</span>
        </div>
        {weekDays.map(({ date }) => {
          const dayEvents = events.filter(e => e.date === date);
          return (
            <div key={`${title}-${date}`} className="p-2 border-r border-slate-200/50 last:border-0 flex flex-col gap-2 min-h-[70px]">
              {dayEvents.map(evt => renderEvent(evt))}
            </div>
          );
        })}
      </div>
    );
  };

  const currentRank = (myInfo?.rank || 'FC').toUpperCase();
  const canPostCompany = ['BM', 'RM'].includes(currentRank);
  const canPostAgency = ['SM', 'BM', 'RM'].includes(currentRank);

  const companyLabel = myInfo?.corpName ? `${myInfo.corpName} 공지` : "회사 공지";
  const agencyLabel = myInfo?.branchName ? `${myInfo.branchName} 공지` : "지점 공지";
  const teamLabel = myInfo?.branchName && myInfo?.teamNum ? `${myInfo.branchName} ${myInfo.teamNum}팀 공지` : "팀 공지";

  const activeCompanyMobileNotices = companyNotices.filter(n => n.date === selectedMobileDate);
  const activeAgencyMobileNotices = agencyNotices.filter(n => n.date === selectedMobileDate);
  const activeTeamMobileNotices = teamNotices.filter(n => n.date === selectedMobileDate);
  const hasAnyMobileNotice = activeCompanyMobileNotices.length > 0 || activeAgencyMobileNotices.length > 0 || activeTeamMobileNotices.length > 0;

  return (
    <div className="flex h-full flex-col p-4 md:p-6 max-w-[1400px] mx-auto space-y-4 md:space-y-6">
      
      {/* 상단 컨트롤 패널 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            통합 스케줄 보드
          </h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> 일정/공지 추가
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 bg-white p-1 rounded-xl border border-slate-200 self-center sm:self-auto shadow-sm">
          <button onClick={() => changeWeek(-1)} className="p-1.5 hover:bg-slate-100 rounded-full transition"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
          <h2 className="text-sm md:text-base font-bold text-slate-800 tracking-tight whitespace-nowrap px-1">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {getWeekOfMonth(currentDate)}주차
          </h2>
          <button onClick={() => changeWeek(1)} className="p-1.5 hover:bg-slate-100 rounded-full transition"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* 💻 1. 데스크탑 전용 와이드 뷰 (hidden md:block) */}
      {!isLoading && (
        <div className="hidden md:block border border-slate-200 rounded-xl overflow-auto bg-white shadow-sm overflow-x-auto">
          <div className="min-w-[1100px]">
            
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 shadow-sm z-10 relative">
              <div className="p-4 border-r border-slate-200 flex items-center justify-center">구분</div>
              {weekDays.map(day => (
                <div key={day.date} className={`p-4 border-r border-slate-200 last:border-0 text-center ${day.label.includes('일') ? 'text-red-500' : day.label.includes('토') ? 'text-blue-500' : ''}`}>
                  {day.label}
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-200">
              {renderNoticeRow(companyLabel, <Megaphone className="w-5 h-5 text-indigo-600" />, companyNotices, "bg-indigo-50/40", "text-indigo-800")}
              {renderNoticeRow(agencyLabel, <Building2 className="w-5 h-5 text-purple-600" />, agencyNotices, "bg-purple-50/40", "text-purple-800")}
              {renderNoticeRow(teamLabel, <Users className="w-5 h-5 text-emerald-600" />, teamNotices, "bg-emerald-50/40", "text-emerald-800")}

              {teamSchedules.map(member => (
                <div key={member.id} className="grid grid-cols-8 hover:bg-slate-50 transition-colors">
                  <div className="p-4 border-r border-slate-200 flex flex-col justify-center bg-white z-0">
                    <span className="font-bold text-sm text-slate-800">{member.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {member.role === "Me" ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">내 일정</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">팀원</span>
                      )}
                    </div>
                  </div>

                  {weekDays.map(({ date }) => {
                    const dayEvents = member.events.filter(e => e.date === date);
                    return (
                      <div key={date} className="p-2 border-r border-slate-200 last:border-0 flex flex-col gap-2 min-h-[100px] bg-white/50">
                        {dayEvents.map(evt => renderEvent(evt))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📱 2. 모바일 전용 수직 흐름 가독성 뷰 (md:hidden) */}
      {!isLoading && (
        <div className="md:hidden flex flex-col space-y-4">
          {/* 요일 가로 스위치 선택 바 */}
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {weekDays.map((day) => {
              const isSelected = selectedMobileDate === day.date;
              const isSun = day.rawLabel === '일';
              const isSat = day.rawLabel === '토';
              
              const hasEvents = teamSchedules.some(m => m.events.some(e => e.date === day.date));

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedMobileDate(day.date)}
                  className={`flex flex-col items-center justify-center px-3.5 py-2 min-w-[60px] rounded-xl border font-bold transition-all shrink-0 ${
                    isSelected 
                      ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-[10px] uppercase tracking-wider opacity-60 ${isSelected ? "text-white/80" : isSun ? "text-red-500" : isSat ? "text-blue-500" : ""}`}>
                    {day.rawLabel}
                  </span>
                  <span className="text-sm mt-0.5">
                    {day.date.split("-")[2]}
                  </span>
                  {hasEvents && (
                    <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-blue-400' : 'bg-blue-600'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* 선택한 날짜에 조직 공지가 있을 경우에만 보여주는 대시보드 */}
          {hasAnyMobileNotice && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 shadow-inner">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">📢 조직 주요 공지</h4>
              <div className="flex flex-col gap-2">
                {activeCompanyMobileNotices.map(evt => (
                  <div key={evt.id} className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex gap-3 items-start shadow-sm">
                    <Megaphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-indigo-950 font-medium whitespace-pre-wrap leading-relaxed">{evt.content}</div>
                  </div>
                ))}
                {activeAgencyMobileNotices.map(evt => (
                  <div key={evt.id} className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex gap-3 items-start shadow-sm">
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-purple-950 font-medium whitespace-pre-wrap leading-relaxed">{evt.content}</div>
                  </div>
                ))}
                {activeTeamMobileNotices.map(evt => (
                  <div key={evt.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3 items-start shadow-sm">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-emerald-950 font-medium whitespace-pre-wrap leading-relaxed">{evt.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 선택한 날짜의 인원별 개별 일정 타임라인 피드 */}
          <div className="flex flex-col divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {teamSchedules.map(member => {
              const todayEvents = member.events.filter(e => e.date === selectedMobileDate);
              const hasEvents = todayEvents.length > 0;

              return (
                <div key={`mobile-${member.id}`} className={`p-4 transition-colors ${hasEvents ? 'bg-white' : 'bg-slate-50/40'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800">{member.name}</span>
                      {member.role === "Me" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">내 일정</span>
                      )}
                    </div>
                    {!hasEvents && <span className="text-xs text-slate-400 font-medium tracking-tight">일정 없음</span>}
                  </div>

                  {hasEvents && (
                    <div className="mt-3 flex flex-col gap-2">
                      {todayEvents.map(evt => (
                        <div 
                          key={evt.id} 
                          onClick={() => toggleEventExpand(evt.id)}
                          className={`p-3 rounded-xl border text-xs flex flex-col gap-2 shadow-sm transition-all active:scale-[0.99] ${evt.color}`}
                        >
                          <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                            <span className="font-extrabold flex items-center gap-1 text-xs">
                              <Clock className="w-3.5 h-3.5 opacity-70" /> {evt.time}
                            </span>
                            {evt.content?.includes("상담") || evt.content?.includes("계약") ? <MapPin className="w-3.5 h-3.5 opacity-70" /> : null}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className={`leading-relaxed text-sm whitespace-pre-wrap font-medium ${expandedEvents.includes(evt.id) ? "" : "line-clamp-2"}`}>
                              {evt.content}
                            </span>
                            {evt.content.length > 20 && (
                              <span className="text-[10px] font-black mt-2 opacity-60 text-right flex items-center justify-end gap-0.5">
                                {expandedEvents.includes(evt.id) ? <>접기 <ChevronUp className="w-3 h-3" /></> : <>더보기 <ChevronDown className="w-3 h-3" /></>}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 일정/공지 추가 통합 모달창 (모바일은 바텀 시트 스타일 적용) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col pb-safe">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" /> 새 일정 추가
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-5 flex flex-col gap-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">일정 구분</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer transition-colors text-xs font-bold ${newSchedule.schedule_type === 'personal' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="type" value="personal" className="hidden" checked={newSchedule.schedule_type === 'personal'} onChange={(e) => setNewSchedule({...newSchedule, schedule_type: e.target.value as ScheduleType})} />
                    개별 일정
                  </label>
                  <label className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer transition-colors text-xs font-bold ${newSchedule.schedule_type === 'team' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="type" value="team" className="hidden" checked={newSchedule.schedule_type === 'team'} onChange={(e) => setNewSchedule({...newSchedule, schedule_type: e.target.value as ScheduleType})} />
                    {teamLabel.replace(" 공지", "")}
                  </label>
                  <label className={`flex items-center justify-center p-2.5 border rounded-lg transition-colors text-xs font-bold ${!canPostAgency ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' : newSchedule.schedule_type === 'agency' ? 'bg-purple-50 border-purple-500 text-purple-700 cursor-pointer' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer'}`}>
                    <input type="radio" name="type" value="agency" className="hidden" disabled={!canPostAgency} checked={newSchedule.schedule_type === 'agency'} onChange={(e) => setNewSchedule({...newSchedule, schedule_type: e.target.value as ScheduleType})} />
                    {agencyLabel.replace(" 공지", "")}
                  </label>
                  <label className={`flex items-center justify-center p-2.5 border rounded-lg transition-colors text-xs font-bold ${!canPostCompany ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' : newSchedule.schedule_type === 'company' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 cursor-pointer' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer'}`}>
                    <input type="radio" name="type" value="company" className="hidden" disabled={!canPostCompany} checked={newSchedule.schedule_type === 'company'} onChange={(e) => setNewSchedule({...newSchedule, schedule_type: e.target.value as ScheduleType})} />
                    {companyLabel.replace(" 공지", "")}
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">날짜</label>
                  <input 
                    type="date" 
                    value={newSchedule.date}
                    onChange={e => setNewSchedule({...newSchedule, date: e.target.value})}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">시간</label>
                  <input 
                    type="time" 
                    value={newSchedule.time}
                    onChange={e => setNewSchedule({...newSchedule, time: e.target.value})}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">상세 내용</label>
                <textarea 
                  placeholder={newSchedule.schedule_type === 'personal' ? "예: 강남역 고객 상담" : "예: 09:00 월간 실적 리뷰 미팅"}
                  value={newSchedule.content}
                  onChange={e => setNewSchedule({...newSchedule, content: e.target.value})}
                  rows={4}
                  className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none" 
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                취소
              </button>
              <button 
                onClick={handleAddSchedule}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}