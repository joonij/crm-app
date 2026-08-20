"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Loader2, Plus, Megaphone, Building2, Users, Edit2, Trash2, X, Trophy, Target, TrendingUp, DollarSign, AlertCircle, User, Building, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ScheduleModal from "./components/ScheduleModal"; 
import PendingContractsModal from "./components/PendingContractsModal"; // ⭐️ 새로 추가된 임포트

type ScheduleType = 'company' | 'agency' | 'team' | 'personal';

type ScheduleEvent = {
  id: number | string;
  date: string;
  time: string;
  content: string;
  category?: string;
  schedule_type: ScheduleType;
  color: string;
  agency_id: number;
  agent_id?: number;
  client_id?: number; 
  ownerName?: string;
  repeat?: boolean;
  clients?: { name?: string; contractor_name?: string; insured_name?: string; };
  contractStatus?: 'new' | 'maintain' | null; 
  premium?: number;
  companyName?: string; // ⭐️ 보험사별 통계를 위한 필드 추가
};

type MemberStats = {
  weekNewAmt: number;
  weekNewCnt: number;
  weekMaintainAmt: number;
  weekMaintainCnt: number;
  monthNewAmt: number;
  monthNewCnt: number;
  monthMaintainAmt: number;
  monthMaintainCnt: number;
};

type TeamMemberSchedule = {
  id: number;
  name: string;
  role: string;
  events: ScheduleEvent[];
  stats: MemberStats;
};

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

const parseSteps = (statusString: string | null): string[] => {
  if (!statusString) return [];
  try {
    const parsed = JSON.parse(statusString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getMonthString = (offsetMonths: number = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() - offsetMonths);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export default function SchedulePage() {
  // 기존 상태들 아래에 추가
  const [pendingModalState, setPendingModalState] = useState<{ isOpen: boolean; events: any[]; date: string }>({
    isOpen: false, events: [], date: ""
  });
  const openPendingModal = (events: any[], date: string) => setPendingModalState({ isOpen: true, events, date });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  
  const [teamSchedules, setTeamSchedules] = useState<TeamMemberSchedule[]>([]);
  const [companyNotices, setCompanyNotices] = useState<ScheduleEvent[]>([]);
  const [agencyNotices, setAgencyNotices] = useState<ScheduleEvent[]>([]);
  const [teamNotices, setTeamNotices] = useState<ScheduleEvent[]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<{ date: string; label: string; rawLabel: string; dayName: string }[]>([]);
  const [monthDays, setMonthDays] = useState<{ date: string; isCurrentMonth: boolean; raw: number; dayName: string }[]>([]);
  
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [selectedMobileDate, setSelectedMobileDate] = useState("");
  const [detailModalEvent, setDetailModalEvent] = useState<any | null>(null);
  const [modalState, setModalState] = useState<{ isOpen: boolean; editData: any; defaultDate: string }>({
    isOpen: false, editData: null, defaultDate: ""
  });
  
  const [myInfo, setMyInfo] = useState<{ id: number; name: string; agency_id: number; rank: string; corpName: string; branchName: string; teamNum: string } | null>(null);

  const [myMonthlyStats, setMyMonthlyStats] = useState({ newAmt: 0, newCnt: 0, maintainAmt: 0, maintainCnt: 0 });
  const [teamMonthlyStats, setTeamMonthlyStats] = useState({ newAmt: 0, newCnt: 0, maintainAmt: 0, maintainCnt: 0 });
  const [monthlyTarget, setMonthlyTarget] = useState(2000000);
  const [myRecruitStats, setMyRecruitStats] = useState({ scheduleCount: 0, candidateCount: 0 });
  
  const [companyStats, setCompanyStats] = useState<[string, number][]>([]);
  
  const [highlightedClientId, setHighlightedClientId] = useState<number | null>(null);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(true);

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
      days.push({ 
        date: formatDateStr(date), 
        label: `${dayNames[date.getDay()]} (${date.getMonth() + 1}/${date.getDate()})`, 
        rawLabel: dayNames[date.getDay()],
        dayName: dayNames[date.getDay()]
      });
    }
    return days;
  };

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: formatDateStr(d), isCurrentMonth: false, raw: d.getDate(), dayName: dayNames[d.getDay()] });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: formatDateStr(d), isCurrentMonth: true, raw: i, dayName: dayNames[d.getDay()] });
    }
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: formatDateStr(d), isCurrentMonth: false, raw: d.getDate(), dayName: dayNames[d.getDay()] });
    }
    return days;
  };

  const getCategoryColor = (category: string | undefined) => {
    if (category === "AP") return "bg-purple-100 text-purple-700 border border-purple-200";
    if (category === "상담") return "bg-blue-100 text-blue-700 border border-blue-200";
    if (category === "계약") return "bg-red-100 text-red-700 border border-red-200";
    if (category === "리쿠") return "bg-rose-100 text-rose-700 border border-rose-200";
    if (category === "청구") return "bg-orange-100 text-orange-700 border border-orange-200";
    if (category === "교육") return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (category === "회의") return "bg-teal-100 text-teal-700 border border-teal-200";
    if (category === "미팅") return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    if (category === "기타") return "bg-slate-200 text-slate-700 border border-slate-300";
    return "bg-slate-100 text-slate-600 border border-slate-200";
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

        const { data: info } = await supabase.from("agents").select("id, name, rank, agency_id, monthly_target, agencies(corporation_name, branch_name, team_number)").eq("auth_id", user.id).single();
        
        if (!info || !info.agencies) return;
        
        setMonthlyTarget(info.monthly_target || 2000000);
        
        const agencyData = Array.isArray(info.agencies) ? info.agencies[0] : info.agencies;
        setMyInfo({ 
          id: info.id, name: info.name, agency_id: info.agency_id, rank: info.rank || 'FC',
          corpName: agencyData?.corporation_name || "", branchName: agencyData?.branch_name || "", teamNum: agencyData?.team_number?.toString() || ""
        });

        const myAgencyId = info.agency_id; 
        const myRank = (info.rank || 'FC').toUpperCase();
        const { data: corpAgencies } = await supabase.from("agencies").select("id, branch_name").eq("corporation_name", agencyData.corporation_name);
        const corpAgencyIds = corpAgencies?.map(a => a.id) || [];
        const branchAgencyIds = corpAgencies?.filter(a => a.branch_name === agencyData.branch_name).map(a => a.id) || [];

        let membersQuery = supabase.from("agents").select("id, name, rank").order('id', { ascending: true });
        if (['SM', 'BM', 'RM'].includes(myRank)) membersQuery = membersQuery.eq('agency_id', myAgencyId);
        else membersQuery = membersQuery.eq('id', info.id);

        const [{ data: members }, { data: schedules }, { data: myClients }] = await Promise.all([
          membersQuery,
          supabase.from("schedules").select("*, clients(name)").in("agency_id", corpAgencyIds).gte("date", startDate).lte("date", endDate).order('time', { ascending: true }),
          supabase.from("clients").select("id, recruiting_status").eq("agent_id", info.id) 
        ]);

        if (!members || !schedules) return;

        const thisMonthStr = formatDateStr(currentDate).slice(0, 7);
        const myRecruitSchedules = schedules.filter(s => s.agent_id === info.id && s.category === '리쿠' && s.date.startsWith(thisMonthStr));
        const activeCandidates = (myClients || []).filter(c => {
          const steps = parseSteps(c.recruiting_status);
          return steps.length > 0 && steps.length < RECRUITING_STEPS.length;
        });
        setMyRecruitStats({ scheduleCount: myRecruitSchedules.length, candidateCount: activeCandidates.length });

        const memberNames = members.map(m => m.name);

        const { data: contracts } = await supabase.from("subscription_insurance")
          .select("id, client_id, subscription_date, insurance_company, product_name, monthly_premium, contractor_name, insured_name, agent_name, policy_status")
          .in("policy_status", ["maintain", "new"])
          .in("agent_name", memberNames)
          .gte("subscription_date", startDate)
          .lte("subscription_date", endDate);

        let myMonthNew = { amt: 0, cnt: 0 };
        let myMonthMaintain = { amt: 0, cnt: 0 };
        let teamMonthNew = { amt: 0, cnt: 0 };
        let teamMonthMaintain = { amt: 0, cnt: 0 };

        const statsMap: Record<string, MemberStats> = {};
        members.forEach(m => {
          statsMap[m.name] = { weekNewAmt: 0, weekNewCnt: 0, weekMaintainAmt: 0, weekMaintainCnt: 0, monthNewAmt: 0, monthNewCnt: 0, monthMaintainAmt: 0, monthMaintainCnt: 0 };
        });

        const currentMonthPrefix = formatDateStr(currentDate).slice(0, 7);
        const compStatsMap: Record<string, number> = {};

        const contractEvents: ScheduleEvent[] = (contracts || []).filter(c => c.subscription_date).map(c => {
          const premium = Number(c.monthly_premium || 0);
          const isThisMonth = c.subscription_date.startsWith(currentMonthPrefix);
          const isThisWeek = currentWeek.some(w => w.date === c.subscription_date);
          const isNew = c.policy_status === 'new';
          const isMaintain = c.policy_status === 'maintain';

          if (statsMap[c.agent_name]) {
            if (isThisMonth) {
              if (isNew) {
                statsMap[c.agent_name].monthNewAmt += premium;
                statsMap[c.agent_name].monthNewCnt += 1;
                teamMonthNew.amt += premium; teamMonthNew.cnt += 1;
                if (c.agent_name === info.name) { myMonthNew.amt += premium; myMonthNew.cnt += 1; }
              }
              if (isMaintain) {
                statsMap[c.agent_name].monthMaintainAmt += premium;
                statsMap[c.agent_name].monthMaintainCnt += 1;
                teamMonthMaintain.amt += premium; teamMonthMaintain.cnt += 1;
                if (c.agent_name === info.name) { myMonthMaintain.amt += premium; myMonthMaintain.cnt += 1; }
                
                if (['SM', 'BM', 'RM'].includes(myRank) || c.agent_name === info.name) {
                  const compName = c.insurance_company || '기타';
                  compStatsMap[compName] = (compStatsMap[compName] || 0) + premium;
                }
              }
            }
            if (isThisWeek) {
              if (isNew) {
                statsMap[c.agent_name].weekNewAmt += premium;
                statsMap[c.agent_name].weekNewCnt += 1;
              }
              if (isMaintain) {
                statsMap[c.agent_name].weekMaintainAmt += premium;
                statsMap[c.agent_name].weekMaintainCnt += 1;
              }
            }
          }

          return {
            id: `contract-${c.id}`,
            date: c.subscription_date,
            time: "23:59",
            content: `${c.insurance_company} ${c.product_name}`,
            category: isMaintain ? "계약체결" : "계약예정",
            schedule_type: "personal",
            color: isMaintain 
              ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-300"
              : "bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-300",
            agency_id: myAgencyId,
            agent_id: members.find(m => m.name === c.agent_name)?.id,
            client_id: c.client_id,
            ownerName: c.agent_name,
            clients: { contractor_name: c.contractor_name || "고객", insured_name: c.insured_name || "고객" },
            contractStatus: c.policy_status as 'new' | 'maintain',
            premium: premium,
            companyName: c.insurance_company || '기타' // ⭐️ 보험사 정보 저장
          };
        });

        setCompanyStats(Object.entries(compStatsMap).sort((a,b) => b[1] - a[1]));

        setMyMonthlyStats({ newAmt: myMonthNew.amt, newCnt: myMonthNew.cnt, maintainAmt: myMonthMaintain.amt, maintainCnt: myMonthMaintain.cnt });
        setTeamMonthlyStats({ newAmt: teamMonthNew.amt, newCnt: teamMonthNew.cnt, maintainAmt: teamMonthMaintain.amt, maintainCnt: teamMonthMaintain.cnt });

        setCompanyNotices(schedules.filter(s => s.schedule_type === 'company').map(e => ({ ...e, time: e.time.substring(0, 5), color: "bg-indigo-100 text-indigo-900 border-indigo-200" })));
        setAgencyNotices(schedules.filter(s => s.schedule_type === 'agency' && (myRank === 'RM' || branchAgencyIds.includes(s.agency_id))).map(e => ({ ...e, time: e.time.substring(0, 5), color: "bg-purple-100 text-purple-900 border-purple-200" })));
        setTeamNotices(schedules.filter(s => s.schedule_type === 'team' && (myRank === 'BM' ? branchAgencyIds.includes(s.agency_id) : s.agency_id === myAgencyId)).map(e => ({ ...e, time: e.time.substring(0, 5), color: "bg-emerald-100 text-emerald-900 border-emerald-200" })));
        
        const formattedMembers = members.map(member => {
          let memberEvents: ScheduleEvent[] = schedules.filter(s => s.agent_id === member.id && s.schedule_type === 'personal').map(evt => ({
            ...evt, 
            time: evt.time ? evt.time.substring(0, 5) : "", 
            color: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100", 
            ownerName: member.name
          }));

          const memberContracts = contractEvents.filter(ce => ce.ownerName === member.name);
          memberEvents = [...memberEvents, ...memberContracts];
          
          memberEvents.sort((a, b) => {
            if (a.time !== b.time) return a.time.localeCompare(b.time);
            const nameA = a.clients?.insured_name || a.clients?.contractor_name || a.clients?.name || "";
            const nameB = b.clients?.insured_name || b.clients?.contractor_name || b.clients?.name || "";
            return nameA.localeCompare(nameB, 'ko-KR');
          });

          return {
            id: member.id, 
            name: `${member.name} (${member.rank || 'FC'})`, 
            role: member.id === info.id ? "Me" : "Member",
            events: memberEvents,
            stats: statsMap[member.name]
          };
        }).sort((a, b) => a.role === "Me" ? -1 : b.role === "Me" ? 1 : a.name.localeCompare(b.name, 'ko-KR'));

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
  };

  const openModal = (defaultDate: string = "", editData: any = null) => {
    if (editData?.contractStatus) return; 
    setModalState({ isOpen: true, editData, defaultDate: defaultDate || formatDateStr(new Date()) });
  };

  const handleDeleteSchedule = async (id: number | string, contractStatus?: string | null) => {
    if (contractStatus) {
      alert("계약 내역은 계약 관리 메뉴에서 삭제/수정해야 합니다.");
      return;
    }
    if (!window.confirm("이 일정을 완전히 삭제하시겠습니까?")) return;
    try {
      await supabase.from('schedules').delete().eq('id', id);
      if (detailModalEvent?.id === id) setDetailModalEvent(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) { alert("삭제 실패: " + error.message); }
  };

  const handleTargetChange = async () => {
    if (!myInfo?.id) return;
    const input = prompt("이번 달 목표액(월납)을 숫자로만 입력해주세요.", String(monthlyTarget));
    if (input && !isNaN(Number(input))) {
      const newTarget = Number(input);
      try {
        const { error } = await supabase.from('agents').update({ monthly_target: newTarget }).eq('id', myInfo.id);
        if (error) throw error;
        setMonthlyTarget(newTarget);
      } catch (error: any) {
        alert("업데이트 실패: " + error.message);
      }
    }
  };

  // ⭐️ [수정] 렌더링 함수: 월간 달력에서는 주간 뷰의 디자인 컨테이너(css)를 유지한 채 핵심 정보만 렌더링
  const renderEvent = (evt: ScheduleEvent, isMonthlyView: boolean = false) => {
    const hasClient = !!evt.client_id;
    const isFaded = highlightedClientId !== null && (!hasClient || evt.client_id !== highlightedClientId);
    const isHighlighted = highlightedClientId !== null && hasClient && evt.client_id === highlightedClientId;
    
    const hoverEffectClass = isFaded 
      ? 'opacity-30' 
      : isHighlighted 
        ? 'ring-2 ring-blue-500 shadow-lg scale-[1.01] z-30 relative bg-opacity-100 transition-all duration-200' 
        : 'opacity-100 hover:shadow-md hover:z-20 relative transition-all duration-200';

    const clientName = evt.clients?.insured_name || evt.clients?.contractor_name || evt.clients?.name || "";

    // 🚀 [신규] 월간 뷰 전용 심플 UI (CSS 디자인은 주간 카드와 동일하게 유지)
    if (isMonthlyView) {
      let badgeText = evt.category || "일정";
      if (evt.contractStatus === 'maintain') badgeText = "계약체결";
      if (evt.contractStatus === 'new') badgeText = "계약예정";
      
      let badgeColor = getCategoryColor(evt.category);
      if (evt.contractStatus === 'maintain') badgeColor = "bg-yellow-100 text-yellow-700 border-yellow-200";
      if (evt.contractStatus === 'new') badgeColor = "bg-orange-100 text-orange-700 border-orange-200";

      const displayTime = evt.time && evt.time !== "23:59" ? evt.time : "";
      const isContract = evt.contractStatus === 'maintain' || evt.contractStatus === 'new';
      const borderColorClass = evt.contractStatus === 'maintain' ? 'border-yellow-200/50' : evt.contractStatus === 'new' ? 'border-orange-200/50' : 'border-black/10';

      return (
        <div 
          key={evt.id} 
          onMouseEnter={() => hasClient && setHighlightedClientId(evt.client_id!)}
          onMouseLeave={() => setHighlightedClientId(null)}
          onClick={(e) => { e.stopPropagation(); setDetailModalEvent(evt); }}
          className={`p-2 sm:p-2 rounded-xl sm:rounded-md border text-sm sm:text-xs flex flex-col gap-1.5 shadow-sm cursor-pointer ${evt.color} ${hoverEffectClass}`}
        >
          <div className={`flex items-center justify-between w-full`}>
            <div className="flex items-center gap-1.5 sm:gap-1 min-w-0 overflow-hidden pr-1">
              {isContract && evt.contractStatus === 'maintain' && <span className="shrink-0">🎉</span>}
              {isContract && evt.contractStatus === 'new' && <AlertCircle className="w-3 h-3 text-orange-600 shrink-0" />}
              
              {displayTime && !isContract && <span className="font-black sm:font-extrabold text-[13px] sm:text-xs shrink-0">{displayTime}</span>}
              
              {(clientName || (!isContract && evt.content)) && (
                <span className={`text-[10px] font-bold py-0.5 rounded ${isContract ? 'bg-white/60 px-1.5 text-slate-800' : 'text-slate-700'} truncate max-w-[80px]`}>
                  {clientName || evt.content}
                </span>
              )}
            </div>
            <span className={`font-extrabold text-[10px] shrink-0 px-1.5 py-0.5 rounded ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
          
          {isSM && evt.ownerName && (
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-[10px] opacity-70 truncate">{evt.ownerName} FC</span>
            </div>
          )}
        </div>
      );
    }

    // --- 주간 뷰 및 모바일 리스트용 상세 UI ---
    if (evt.contractStatus === 'maintain') {
      return (
        <div 
          key={evt.id} 
          onMouseEnter={() => hasClient && setHighlightedClientId(evt.client_id!)}
          onMouseLeave={() => setHighlightedClientId(null)}
          onClick={(e) => { e.stopPropagation(); setDetailModalEvent(evt); }}
          className={`p-2 rounded-xl sm:rounded-md border text-sm sm:text-xs flex flex-col gap-1.5 cursor-pointer shadow-sm ${evt.color} ${hoverEffectClass}`}
        >
          <div className="flex items-center justify-between border-b border-yellow-200/50 pb-1.5 sm:pb-1">
            <span className="flex items-center gap-1 truncate pr-1">
              🎉
              {evt.clients?.contractor_name === evt.clients?.insured_name ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60 text-yellow-800 whitespace-nowrap overflow-hidden text-ellipsis">
                  {evt.clients?.insured_name}
                </span>
              ) : (
                <div className="flex items-center gap-1 truncate">
                  {evt.clients?.insured_name && <span className="text-[10px] font-bold py-0.5 rounded bg-white/60 text-yellow-800 whitespace-nowrap overflow-hidden text-ellipsis">{evt.clients.insured_name}</span>}
                  {evt.clients?.contractor_name && <span className="text-[10px] font-bold py-0.5 rounded bg-white/60 text-yellow-800 whitespace-nowrap overflow-hidden text-ellipsis">{evt.clients.contractor_name}</span>}
                </div>
              )}
            </span>
            <span className="font-extrabold text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
              계약체결
            </span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-bold text-yellow-900 block truncate w-full" title={evt.content}>
              <span className="font-black text-sm text-red-600 tracking-tight">{evt.premium?.toLocaleString()}원</span><br/>
              {evt.content}
            </span>
            <div className="flex justify-between items-end pt-1">
              <span className="text-[10px] opacity-70 truncate">
                {isSM && evt.ownerName}
              </span>
              <span className="text-yellow-800 font-bold text-[11px] bg-white/60 px-2 py-0.5 rounded border border-yellow-300 shadow-xs shrink-0">상세</span>
            </div>
          </div>
        </div>
      );
    }

    if (evt.contractStatus === 'new') {
      return (
        <div 
          key={evt.id} 
          onMouseEnter={() => hasClient && setHighlightedClientId(evt.client_id!)}
          onMouseLeave={() => setHighlightedClientId(null)}
          onClick={(e) => { e.stopPropagation(); setDetailModalEvent(evt); }}
          className={`p-2 rounded-xl sm:rounded-md border text-sm sm:text-xs flex flex-col gap-1.5 cursor-pointer shadow-sm ${evt.color} ${hoverEffectClass}`}
        >
          <div className="flex items-center justify-between border-b border-orange-200/50 pb-1.5 sm:pb-1">
            <span className="flex items-center gap-1 truncate pr-1">
              <AlertCircle className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-orange-600 shrink-0" />
              {evt.clients?.contractor_name === evt.clients?.insured_name ? (
                <span className="text-[10px] font-bold py-0.5 rounded bg-white/60 text-orange-800 whitespace-nowrap overflow-hidden text-ellipsis">
                  {evt.clients?.insured_name}
                </span>
              ) : (
                <div className="flex items-center gap-1 truncate">
                  {evt.clients?.insured_name && <span className="text-[10px] font-bold py-0.5 rounded bg-white/60 text-orange-800 whitespace-nowrap overflow-hidden text-ellipsis">{evt.clients.insured_name}</span>}
                  {evt.clients?.contractor_name && <span className="text-[10px] font-bold py-0.5 rounded bg-white/60 text-orange-800 whitespace-nowrap overflow-hidden text-ellipsis">{evt.clients.contractor_name}</span>}
                </div>
              )}
            </span>
            <span className="font-extrabold text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
              계약예정
            </span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-bold text-orange-900 block truncate w-full" title={evt.content}>
              <span className="font-black text-sm text-orange-600 tracking-tight">{evt.premium?.toLocaleString()}원</span><br/>
              {evt.content}
            </span>
            <div className="flex justify-between items-end pt-1">
              <span className="text-[10px] opacity-70 truncate">
                {isSM && evt.ownerName}
              </span>
              <span className="text-orange-800 font-bold text-[11px] bg-white/60 px-2 py-0.5 rounded border border-orange-300 shadow-xs shrink-0">상세</span>
            </div>
          </div>
        </div>
      );
    }

    const catColor = getCategoryColor(evt.category);
    return (
      <div 
        key={evt.id} 
        onMouseEnter={() => hasClient && setHighlightedClientId(evt.client_id!)}
        onMouseLeave={() => setHighlightedClientId(null)}
        onClick={(e) => { e.stopPropagation(); setDetailModalEvent(evt); }}
        className={`p-3 sm:p-2 rounded-xl sm:rounded-md border text-sm sm:text-xs flex flex-col gap-1.5 shadow-sm cursor-pointer ${evt.color} ${hoverEffectClass}`}
      >
        <div className="items-center border-b border-black/10 pb-1.5 sm:pb-1 w-full">
          <span className="justify-between font-black sm:font-extrabold flex items-center gap-1.5 sm:gap-1 text-[13px] sm:text-xs whitespace-nowrap shrink-0">
            {evt.time}
            {evt.clients?.name && (<span className="text-[10px] font-bold px-1.5 py-0.5 text-slate-700 truncate max-w-[60px]">{evt.clients.name}</span>)}
            {evt.category && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${catColor}`}>{evt.category}</span>}
          </span>
        </div>
        
        <div className="flex items-center mt-0.5">
          <span className="font-medium block truncate w-full" title={evt.content}>{evt.content}</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-[10px] opacity-70 truncate">
            {isSM && evt.ownerName}
          </span>
          <span className="text-blue-600 font-bold text-[11px] bg-white/80 px-2 py-0.5 rounded border border-blue-200/50 shadow-xs shrink-0">상세</span>
        </div>
      </div>
    );
  };
  // ⭐️ 여러 개의 이벤트를 받아 '계약예정'만 추출해 요약 카드로 만들어주는 함수
  const renderDayEvents = (dayEvents: ScheduleEvent[], isMonthlyView: boolean, date: string, ownerNameForWeekly?: string) => {
    const normalEvents = dayEvents.filter(e => e.contractStatus !== 'new');
    const pendingEvents = dayEvents.filter(e => e.contractStatus === 'new');

    const renderedNormal = normalEvents.map(evt => renderEvent(evt, isMonthlyView));

    let renderedPending = null;
    if (pendingEvents.length > 0) {
      const totalPremium = pendingEvents.reduce((sum, e) => sum + (e.premium || 0), 0);
      
      if (isMonthlyView) {
        renderedPending = (
          <div 
            key={`pending-${date}`}
            onClick={(e) => { e.stopPropagation(); openPendingModal(pendingEvents, date); }}
            className="p-1.5 rounded-lg border border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 flex flex-col gap-1 cursor-pointer shadow-sm hover:ring-2 hover:ring-orange-400 transition-all mb-1"
          >
            <div className="flex items-center justify-between gap-1 w-full overflow-hidden">
              <span className="text-[11px] font-black text-orange-800 flex items-center gap-1 shrink-0"><AlertCircle className="w-3 h-3 text-orange-600"/>예정 건보기</span>
              <span className="text-[10px] font-bold text-orange-600 bg-white px-1 py-0.5 rounded border border-orange-200 shrink-0">{pendingEvents.length}건</span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-[11px] font-black text-orange-700">{totalPremium.toLocaleString()}원</span>
            </div>
          </div>
        );
      } else {
        renderedPending = (
          <div 
            key={`pending-${date}-${ownerNameForWeekly}`}
            onClick={(e) => { e.stopPropagation(); openPendingModal(pendingEvents, date); }}
            className="p-2 rounded-xl sm:rounded-md border border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 flex flex-col gap-1.5 cursor-pointer shadow-sm hover:shadow-md hover:ring-2 hover:ring-orange-400 transition-all mb-1"
          >
            <div className="flex items-center justify-between border-b border-orange-200/60 pb-1.5 sm:pb-1">
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-orange-800">
                <AlertCircle className="w-3.5 h-3.5" /> 계약 예정 ({pendingEvents.length}건)
              </span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-bold text-orange-900 block truncate w-full">
                총 <span className="font-black text-sm text-orange-700 tracking-tight">{totalPremium.toLocaleString()}원</span>
              </span>
              <div className="flex justify-between items-end pt-1">
                <span className="text-[10px] opacity-80 text-orange-800 truncate">{ownerNameForWeekly || '팀 전체'}</span>
                <span className="text-white font-bold text-[11px] bg-orange-500 hover:bg-orange-600 px-2 py-0.5 rounded shadow-xs shrink-0 transition-colors">상세보기</span>

              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <>
        {renderedPending}
        {renderedNormal}
      </>
    );
  };

  const isSM = ['SM', 'BM', 'RM'].includes(myInfo?.rank.toUpperCase() || '');

  const monthlyWeeks = [];
  for (let i = 0; i < monthDays.length; i += 7) {
    monthlyWeeks.push(monthDays.slice(i, i + 7));
  }

  // ⭐️ 1. 설계사 선택 상태 및 필터링 적용
  const [selectedAgentId, setSelectedAgentId] = useState<number | 'ALL'>('ALL');

  const displayMembers = selectedAgentId === 'ALL' 
    ? teamSchedules 
    : teamSchedules.filter(m => m.id === selectedAgentId);

  const allEventsForMonth = [
    ...companyNotices, 
    ...agencyNotices, 
    ...teamNotices, 
    ...displayMembers.flatMap(m => m.events)
  ];
  
  const progressPercent = Math.min(Math.round((myMonthlyStats.maintainAmt / monthlyTarget) * 100) || 0, 100);

  const currentMonthOnlyDays = monthDays.filter(d => d.isCurrentMonth);
  const displayDays = viewMode === 'weekly' ? weekDays : currentMonthOnlyDays;
  const desktopGridStyle = { gridTemplateColumns: `80px repeat(${displayDays.length}, minmax(120px, 1fr)) 160px` };

  const renderNoticeRowWeekly = (title: string, icon: any, events: any[], bgColor: string, textColor: string) => {
    if (events.length === 0) return null;
    return (
      <div className={`grid ${bgColor} border-b-2 border-white/50`} style={desktopGridStyle}>
        <div className="p-4 border-r border-slate-200/50 flex flex-col justify-center items-center text-center gap-1.5">{icon}<span className={`font-extrabold text-xs ${textColor}`}>{title}</span></div>
        {displayDays.map(({ date }) => (
          <div key={`${title}-${date}`} className="p-2 border-r border-slate-200/50 flex flex-col gap-2 min-h-[70px]">
            {events.filter(e => e.date === date).map(evt => renderEvent(evt, false))}
          </div>
        ))}
        <div className="p-2 bg-black/5 border-l border-slate-200/50"></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-0 sm:p-4 md:p-6 max-w-[1500px] mx-auto space-y-0 sm:space-y-4 md:space-y-6 relative min-h-screen pb-0 sm:pb-0 md:pb-20 bg-slate-50 sm:bg-transparent">
      
      <div className="shrink-0 bg-white p-4 sm:p-6 sm:rounded-3xl shadow-sm relative flex flex-col gap-4 sm:gap-5 border-b sm:border border-blue-100 z-20 transition-all duration-300">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-100 rounded-full filter blur-[80px] opacity-60 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-teal-50 rounded-full filter blur-[80px] opacity-60 pointer-events-none"></div>

        <div className="flex justify-between items-center xl:hidden relative z-20">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> 이번 달 실적 요약</span>
          <button
            onClick={() => setIsScoreboardOpen(!isScoreboardOpen)}
            className="text-blue-600 font-bold text-[11px] bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
          >
            {isScoreboardOpen ? '접어두기 ▲' : '펼쳐보기 ▼'}
          </button>
        </div>

        {!isScoreboardOpen && (
          <div className="xl:hidden flex justify-between items-center px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in relative z-20">
            <span className="text-[11px] font-bold text-slate-600">나의 체결 / 진행 후보자</span>
            <span className="text-sm font-black text-blue-600">{myMonthlyStats.maintainAmt.toLocaleString()}원 / {myRecruitStats.candidateCount}명</span>
          </div>
        )}

        <div className={`${isScoreboardOpen ? 'flex' : 'hidden'} xl:flex flex-col gap-5 relative overflow-hidden transition-all`}>
          <div className="relative z-10 flex flex-col xl:flex-row gap-4 xl:gap-6 xl:items-stretch justify-between">
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center xl:w-[45%]">
              {/* ① 영업 실적 요약 */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-slate-500 text-xs font-bold mb-1">나의 영업 실적 ({currentDate.getMonth() + 1}월)</p>
                  <div className="flex gap-4 sm:gap-6 items-center">
                    <div className="flex flex-col">
                      <span className="text-orange-500 text-[11px] font-bold mb-0.5 whitespace-nowrap">계약 예정 ({myMonthlyStats.newCnt}건)</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-800 whitespace-nowrap">{myMonthlyStats.newAmt.toLocaleString()}<span className="text-sm font-normal text-slate-500 ml-0.5">원</span></span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                      <span className="text-blue-600 text-[11px] font-bold mb-0.5 whitespace-nowrap">체결 완료 ({myMonthlyStats.maintainCnt}건)</span>
                      <span className="text-xl sm:text-2xl font-black text-blue-900 whitespace-nowrap">{myMonthlyStats.maintainAmt.toLocaleString()}<span className="text-sm font-normal text-slate-500 ml-0.5">원</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-px h-12 bg-slate-200"></div>
              <div className="md:hidden w-full h-px bg-slate-100"></div>

              {/* ② 리쿠르팅 현황 요약 */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-slate-500 text-xs font-bold mb-1">나의 리쿠르팅 현황 ({currentDate.getMonth() + 1}월)</p>
                  <div className="flex gap-4 sm:gap-6 items-center">
                    <div className="flex flex-col">
                      <span className="text-rose-500 text-[11px] font-bold mb-0.5 whitespace-nowrap">이번 달 리쿠 일정</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-800">{myRecruitStats.scheduleCount}<span className="text-sm font-normal text-slate-500 ml-0.5">건</span></span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                      <span className="text-purple-600 text-[11px] font-bold mb-0.5 whitespace-nowrap">진행중 후보자</span>
                      <span className="text-xl sm:text-2xl font-black text-purple-900">{myRecruitStats.candidateCount}<span className="text-sm font-normal text-slate-500 ml-0.5">명</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row xl:flex-row gap-4 w-full xl:w-[50%] xl:justify-end items-stretch">
              {/* 월간 보험사별 체결 내역 박스 */}
              <div className="flex flex-col w-full sm:w-[50%] xl:w-[260px] bg-slate-50/80 border border-slate-200 rounded-xl p-3 shadow-sm h-full max-h-[100px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1 sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10 pb-0.5">
                  <Building2 className="w-3 h-3 text-blue-500"/> 이번 달 보험사별 체결 (단위: 원)
                </span>
                <div className="flex flex-col gap-1.5">
                  {companyStats.length === 0 ? (
                    <span className="text-[11px] text-slate-400 py-1 font-medium">아직 체결 내역이 없습니다.</span>
                  ) : (
                    companyStats.map(([comp, amt]) => (
                      <div key={comp} className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-700 truncate pr-2">{comp}</span>
                        <span className="font-black text-blue-600 shrink-0">{amt.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 월간 목표 달성률 바 */}
              <div className="flex flex-col w-full sm:w-[50%] xl:w-[260px] gap-2 bg-slate-50/80 border border-slate-200 xl:border-none xl:bg-transparent p-3 xl:p-0 rounded-xl justify-center shadow-sm xl:shadow-none">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-500"/> 월간 목표: 
                    <button onClick={handleTargetChange} className="underline underline-offset-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                      {monthlyTarget.toLocaleString()}원
                    </button>
                  </span>
                  <span className="text-xs font-black text-blue-600 flex items-center gap-0.5">
                    {progressPercent}% 달성 <TrendingUp className="w-3.5 h-3.5"/>
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3.5 border border-slate-300 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3.5 rounded-full transition-all duration-1000 relative" 
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {isSM && (
            <div className="relative z-10 pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                <div className="flex gap-4 bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 shadow-sm shrink-0">
                  <div className="flex flex-col">
                    <span className="text-orange-500 text-xs font-bold">팀 총 예정 ({teamMonthlyStats.newCnt}건)</span>
                    <span className="text-lg font-black text-slate-800">{teamMonthlyStats.newAmt.toLocaleString()}원</span>
                  </div>
                  <div className="w-px bg-blue-200"></div>
                  <div className="flex flex-col">
                    <span className="text-blue-600 text-xs font-bold">팀 총 체결 ({teamMonthlyStats.maintainCnt}건)</span>
                    <span className="text-lg font-black text-blue-900">{teamMonthlyStats.maintainAmt.toLocaleString()}원</span>
                  </div>
                </div>
                
                <div className="flex gap-2.5 overflow-x-auto pb-2 md:pb-0 w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mask-edge">
                  {teamSchedules.filter(m => m.role !== 'Me').map(member => (
                    <div key={member.id} className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex flex-col min-w-[130px] shrink-0 hover:border-blue-300 hover:shadow-sm transition cursor-pointer">
                      <span className="font-bold text-slate-800 text-xs mb-1.5 truncate">{member.name}</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] text-slate-500 flex justify-between">예정 <strong className="text-orange-500">{member.stats.monthNewAmt.toLocaleString()}</strong></span>
                        <span className="text-[12px] text-slate-500 flex justify-between">체결 <strong className="text-blue-600">{member.stats.monthMaintainAmt.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-0 bg-white sm:bg-transparent z-10 border-b sm:border-0 border-slate-100">
      <div className="flex items-center gap-3 md:gap-4 justify-between w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-blue-600" /> 스케줄 보드</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* ⭐️ 2. 설계사 필터링 셀렉트박스 추가 */}
            {teamSchedules.length > 1 && (
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="ALL">전체 보기</option>
                {teamSchedules.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}

            
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button onClick={() => setViewMode('weekly')} className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${viewMode === 'weekly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>주간</button>
              <button onClick={() => setViewMode('monthly')} className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${viewMode === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>월간</button>
            </div>
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

      {isLoading && <div className="flex justify-center flex-1 items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}

      {!isLoading && (
        <>
          <div className="hidden md:block border border-slate-200 rounded-xl bg-white shadow-sm flex-1 overflow-hidden flex flex-col">
            {viewMode === 'weekly' ? (
              <div className="overflow-x-auto overflow-y-auto flex-1 min-w-[1200px]">
                <div className="grid border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 shadow-sm relative sticky top-0 z-20" style={desktopGridStyle}>
                  <div className="p-4 border-r border-slate-200 flex items-center justify-center">구분</div>
                  {weekDays.map(day => (
                    <div key={day.date} className="group relative p-4 border-r border-slate-200 text-center flex justify-center items-center gap-2 hover:bg-blue-50 transition-colors">
                      <span className={`${day.label.includes('일') ? 'text-red-500' : day.label.includes('토') ? 'text-blue-500' : ''}`}>{day.label}</span>
                      <button onClick={() => openModal(day.date)} className="opacity-0 group-hover:opacity-100 absolute right-2 p-1 bg-white border border-blue-200 text-blue-600 rounded-full shadow-sm hover:bg-blue-600 hover:text-white transition-all cursor-pointer"><Plus className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <div className="p-4 bg-slate-100/80 flex items-center justify-center border-l border-slate-200 shadow-inner">
                    <span className="text-slate-700">주간 요약 & 통계</span>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-200">
                  {renderNoticeRowWeekly("회사 공지", <Megaphone className="w-5 h-5 text-indigo-600" />, companyNotices, "bg-indigo-50/40", "text-indigo-800")}
                  {renderNoticeRowWeekly("지점 공지", <Building2 className="w-5 h-5 text-purple-600" />, agencyNotices, "bg-purple-50/40", "text-purple-800")}
                  {renderNoticeRowWeekly("팀 공지", <Users className="w-5 h-5 text-emerald-600" />, teamNotices, "bg-emerald-50/40", "text-emerald-800")}
                  
                  {displayMembers.map(member => {
                    // ⭐️ 주간 뷰: 현재 보고 있는 주(weekDays)에 해당하는 통계만 실시간 계산
                    const weekDates = weekDays.map(d => d.date);
                    const compStats: Record<string, { newAmt: number, maintainAmt: number }> = {}; 
                    
                    member.events.forEach(e => {
                      if (weekDates.includes(e.date)) {
                        if (e.contractStatus === 'new' || e.contractStatus === 'maintain') {
                          const comp = e.companyName || '기타';
                          if (!compStats[comp]) compStats[comp] = { newAmt: 0, maintainAmt: 0 };

                          if (e.contractStatus === 'new') { 
                            compStats[comp].newAmt += (e.premium || 0);
                          }
                          if (e.contractStatus === 'maintain') { 
                            compStats[comp].maintainAmt += (e.premium || 0);
                          }
                        }
                      }
                    });
                    
                    const sortedCompStats = Object.entries(compStats).sort((a,b) => (b[1].maintainAmt + b[1].newAmt) - (a[1].maintainAmt + a[1].newAmt));

                    return (
                      <div key={member.id} className="grid hover:bg-slate-50 transition-colors" style={desktopGridStyle}>
                        <div className="p-4 border-r border-slate-200 flex flex-col justify-center bg-white"><span className="font-bold text-sm text-center">{member.name}</span></div>
                        
                        {weekDays.map(({ date }) => (
                          <div key={date} className="group relative p-2 border-r border-slate-200 flex flex-col gap-2 min-h-[100px] bg-white/50 hover:bg-slate-50/50 transition-colors">
                            {renderDayEvents(member.events.filter(e => e.date === date), false, date, member.name)}
                          </div>
                        ))}

                        {/* ⭐️ 주간 요약 & 통계 렌더링 영역 */}
                        <div className="p-3 bg-slate-50/80 flex flex-col gap-2 border-l border-slate-200 shadow-inner min-w-[160px]">
                          {(member.stats.weekNewCnt > 0 || member.stats.weekMaintainCnt > 0) ? (
                            <div className="flex flex-col h-full">
                              {/* 총 예정/체결 요약 */}
                              <div className="flex flex-col gap-1.5 mb-2">
                                {member.stats.weekNewCnt > 0 && (
                                  <div className="bg-orange-100 text-orange-900 rounded-lg p-2 flex flex-col border border-orange-200">
                                    <span className="text-[10px] font-bold mb-0.5">예정 ({member.stats.weekNewCnt}건)</span>
                                    <span className="font-black text-sm">{member.stats.weekNewAmt.toLocaleString()}원</span>
                                  </div>
                                )}
                                {member.stats.weekMaintainCnt > 0 && (
                                  <div className="bg-blue-50 text-blue-900 rounded-lg p-2 flex flex-col border border-blue-200">
                                    <span className="text-[10px] font-bold mb-0.5">체결 ({member.stats.weekMaintainCnt}건)</span>
                                    <span className="font-black text-sm">{member.stats.weekMaintainAmt.toLocaleString()}원</span>
                                  </div>
                                )}
                              </div>

                              {/* ⭐️ 예정/체결 통합 보험사 통계 */}
                              {sortedCompStats.length > 0 && (
                                <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                                  {sortedCompStats.map(([comp, amts]) => (
                                    <div key={comp} className="flex flex-col gap-0.5 mb-1 border-b border-slate-200/50 pb-1.5 last:mb-0 last:pb-0 last:border-0">
                                      <span className="font-bold text-slate-500 text-[10px] truncate pr-1 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>{comp}
                                      </span>
                                      {amts.newAmt > 0 && (
                                        <div className="flex justify-between items-center text-[10px] pl-2">
                                          <span className="text-orange-500 font-bold">예정</span>
                                          <span className="text-slate-600 font-bold">{amts.newAmt.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {amts.maintainAmt > 0 && (
                                        <div className="flex justify-between items-center text-[10px] pl-2">
                                          <span className="text-blue-600 font-bold">체결</span>
                                          <span className="font-black text-blue-600">{amts.maintainAmt.toLocaleString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[11px] font-bold text-slate-400 text-center gap-2 py-4">
                              <Trophy className="w-6 h-6 opacity-20" />
                              예정/체결<br/>내역 없음
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-x-auto min-w-[1000px]">
                <div className="grid grid-cols-[repeat(7,minmax(120px,1fr))_minmax(180px,220px)] border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 shrink-0">
                  {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                    <div key={d} className={`p-3 text-center border-r border-slate-200 ${i===0?'text-red-500':i===6?'text-blue-500':''}`}>{d}</div>
                  ))}
                  <div className="p-3 text-center bg-slate-100/80 shadow-inner border-l border-slate-200">주간 요약 & 통계</div>
                </div>

                <div className="flex-1 bg-slate-200 flex flex-col gap-[1px] overflow-y-auto">
                  {monthlyWeeks.map((week, wIdx) => {
                    const weekDates = week.map(d => d.date);
                    
                    // ⭐️ displayMembers 사용 및 예정/체결 동시 집계 적용
                    const weekStats = displayMembers.map(member => {
                      let nAmt = 0, nCnt = 0, mAmt = 0, mCnt = 0;
                      const compStats: Record<string, { newAmt: number, maintainAmt: number }> = {}; 
                      
                      member.events.forEach(e => {
                        if (weekDates.includes(e.date)) {
                          if (e.contractStatus === 'new' || e.contractStatus === 'maintain') {
                            const comp = e.companyName || '기타';
                            if (!compStats[comp]) compStats[comp] = { newAmt: 0, maintainAmt: 0 };

                            if (e.contractStatus === 'new') { 
                              nAmt += (e.premium || 0); nCnt++; 
                              compStats[comp].newAmt += (e.premium || 0);
                            }
                            if (e.contractStatus === 'maintain') { 
                              mAmt += (e.premium || 0); mCnt++; 
                              compStats[comp].maintainAmt += (e.premium || 0);
                            }
                          }
                        }
                      });
                      
                      const sortedCompStats = Object.entries(compStats).sort((a,b) => (b[1].maintainAmt + b[1].newAmt) - (a[1].maintainAmt + a[1].newAmt));
                      
                      return { id: member.id, name: member.name, role: member.role, nAmt, nCnt, mAmt, mCnt, sortedCompStats };
                    }).filter(m => m.nCnt > 0 || m.mCnt > 0);

                    return (
                      <div key={`week-${wIdx}`} className="grid grid-cols-[repeat(7,minmax(120px,1fr))_minmax(180px,220px)] gap-[1px] min-h-[160px] xl:min-h-[200px]">
                        {week.map((day, idx) => {
                           const dayEvents = allEventsForMonth.filter(e => e.date === day.date);
                           
                           const sortedDayEvents = [...dayEvents].sort((a, b) => {
                             if (a.time !== b.time) return a.time.localeCompare(b.time);
                             const nameA = a.clients?.insured_name || a.clients?.contractor_name || a.clients?.name || "";
                             const nameB = b.clients?.insured_name || b.clients?.contractor_name || b.clients?.name || "";
                             return nameA.localeCompare(nameB, 'ko-KR');
                           });

                           return (
                            <div key={day.date} className={`group relative bg-white p-2 flex flex-col hover:bg-slate-50 ${day.isCurrentMonth ? '' : 'opacity-60 bg-slate-50'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${day.date === formatDateStr(new Date()) ? 'bg-blue-600 text-white' : idx%7===0 ? 'text-red-500' : idx%7===6 ? 'text-blue-500' : ''}`}>{day.raw}</span>
                                <button onClick={() => openModal(day.date)} className="opacity-0 group-hover:opacity-100 p-1 bg-white border border-blue-200 text-blue-600 rounded-full shadow-sm hover:bg-blue-600 hover:text-white transition-all cursor-pointer"><Plus className="w-3 h-3" /></button>
                              </div>
                              <div className="flex-1 overflow-y-auto space-y-1.5 px-1 -mx-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {renderDayEvents(sortedDayEvents, true, day.date)}
                              </div>
                            </div>
                           )
                        })}

                        <div className="bg-slate-50/90 p-2.5 flex flex-col gap-2 overflow-y-auto shadow-inner border-l border-slate-200">
                          {weekStats.length > 0 ? (
                            weekStats.map(stat => (
                              <div key={stat.id} className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm flex flex-col gap-1.5">
                                <span className="text-[12px] font-extrabold text-slate-800 border-b border-slate-100 pb-1 truncate">{stat.name}</span>
                                
                                <div className="flex flex-col gap-1">
                                  {(stat.nCnt > 0) && (
                                    <div className="flex justify-between items-center text-[12px]">
                                      <span className="text-orange-600 font-bold">예정 ({stat.nCnt}건)</span>
                                      <span className="font-black text-slate-700">{stat.nAmt.toLocaleString()}원</span>
                                    </div>
                                  )}
                                  {(stat.mCnt > 0) && (
                                    <div className="flex justify-between items-center text-[12px]">
                                      <span className="text-blue-600 font-bold">체결 ({stat.mCnt}건)</span>
                                      <span className="font-black text-slate-700">{stat.mAmt.toLocaleString()}원</span>
                                    </div>
                                  )}
                                </div>

                                {/* ⭐️ 예정/체결 통합 보험사 통계 */}
                                {stat.sortedCompStats.length > 0 && (
                                  <div className="mt-1 pt-1.5 border-t border-slate-100 flex flex-col gap-1.5">
                                    {stat.sortedCompStats.map(([comp, amts]) => (
                                      <div key={comp} className="flex flex-col gap-0.5 mb-1 border-b border-slate-50 pb-1.5 last:mb-0 last:pb-0 last:border-0">
                                        <span className="font-bold text-slate-500 text-[10px] truncate pr-1 flex items-center gap-1">
                                          <span className="w-1 h-1 rounded-full bg-slate-400"></span>{comp}
                                        </span>
                                        {amts.newAmt > 0 && (
                                          <div className="flex justify-between items-center text-[10px] pl-2">
                                            <span className="text-orange-500 font-bold">예정</span>
                                            <span className="text-slate-600 font-bold">{amts.newAmt.toLocaleString()}</span>
                                          </div>
                                        )}
                                        {amts.maintainAmt > 0 && (
                                          <div className="flex justify-between items-center text-[10px] pl-2">
                                            <span className="text-blue-600 font-bold">체결</span>
                                            <span className="font-black text-blue-600">{amts.maintainAmt.toLocaleString()}</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[11px] font-bold text-slate-400 text-center gap-2">
                              <Trophy className="w-6 h-6 opacity-20" />
                              예정/체결<br/>내역 없음
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="md:hidden flex flex-col bg-slate-50">
            {viewMode === 'weekly' ? (
              <div className="sticky top-[0px] z-30 shrink-0 flex overflow-x-auto bg-white border-b border-slate-200 px-2 py-3 gap-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {weekDays.map(day => {
                  const isSelected = selectedMobileDate === day.date;
                  const isToday = day.date === formatDateStr(new Date());
                  const dayNum = parseInt(day.date.slice(-2), 10);
                  
                  return (
                    <button 
                      key={day.date} 
                      onClick={() => setSelectedMobileDate(day.date)}
                      className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-2xl transition-all cursor-pointer ${isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                      <span className={`text-[10px] font-bold mb-1 ${isSelected ? 'text-blue-100' : day.rawLabel === '일' ? 'text-red-400' : day.rawLabel === '토' ? 'text-blue-400' : ''}`}>{day.rawLabel}</span>
                      <span className={`text-sm font-black ${isToday && !isSelected ? 'text-blue-600' : ''}`}>{dayNum}</span>
                      {isToday && <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-600'}`} />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="sticky top-[0px] z-30 shrink-0 bg-white border-b border-slate-200 px-2 py-3 shadow-sm">
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
                        className={`flex flex-col items-center justify-start py-1.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${!day.isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200 shadow-sm' : 'hover:bg-slate-50'}`}
                      >
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isSelected ? 'bg-blue-600 text-white' : isToday ? 'text-blue-600 bg-blue-100' : idx % 7 === 0 ? 'text-red-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-slate-700'}`}>
                          {day.raw}
                        </span>
                        <div className="flex gap-0.5 mt-0.5 h-1.5">
                          {dayEvents.slice(0, 3).map((e, i) => (
                            <span key={i} className={`w-1.5 h-1.5 rounded-full ${e.contractStatus === 'maintain' ? 'bg-yellow-400' : e.contractStatus === 'new' ? 'bg-orange-400' : e.schedule_type === 'company' ? 'bg-indigo-400' : e.schedule_type === 'agency' ? 'bg-purple-400' : e.schedule_type === 'team' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                          ))}
                          {dayEvents.length > 3 && <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="p-4 flex flex-col gap-4 pb-28">
              <div className="space-y-3">
                {companyNotices.filter(e => e.date === selectedMobileDate).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-black text-xs px-1"><Megaphone className="w-3.5 h-3.5" /> 회사 공지</div>
                    {companyNotices.filter(e => e.date === selectedMobileDate).map(evt => renderEvent(evt, false))}
                  </div>
                )}
                {agencyNotices.filter(e => e.date === selectedMobileDate).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-purple-700 font-black text-xs px-1"><Building className="w-3.5 h-3.5" /> 지점 공지</div>
                    {agencyNotices.filter(e => e.date === selectedMobileDate).map(evt => renderEvent(evt, false))}
                  </div>
                )}
                {teamNotices.filter(e => e.date === selectedMobileDate).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs px-1"><Users className="w-3.5 h-3.5" /> 팀 공지</div>
                    {teamNotices.filter(e => e.date === selectedMobileDate).map(evt => renderEvent(evt, false))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {displayMembers.map(member => {
                  const memberEvents = member.events.filter(e => e.date === selectedMobileDate).sort((a, b) => {
                    if (a.time !== b.time) return a.time.localeCompare(b.time);
                    const nameA = a.clients?.insured_name || a.clients?.contractor_name || a.clients?.name || "";
                    const nameB = b.clients?.insured_name || b.clients?.contractor_name || b.clients?.name || "";
                    return nameA.localeCompare(nameB, 'ko-KR');
                  });

                  if (memberEvents.length === 0) return null;
                  
                  const mobNewAmt = viewMode === 'weekly' ? member.stats.weekNewAmt : member.stats.monthNewAmt;
                  const mobMaintainAmt = viewMode === 'weekly' ? member.stats.weekMaintainAmt : member.stats.monthMaintainAmt;

                  return (
                    <div key={member.id} className="flex flex-col gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs px-1">
                          {member.role === 'Me' ? <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">내 일정</span> : <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">팀원</span>}
                          {member.name}
                        </div>
                        {(mobNewAmt > 0 || mobMaintainAmt > 0) && (
                          <div className="flex gap-2 text-[10px] font-bold">
                            <span className="text-orange-500">예: {mobNewAmt.toLocaleString()}</span>
                            <span className="text-blue-600">체: {mobMaintainAmt.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 mt-1">
                        {renderDayEvents(memberEvents, false, selectedMobileDate, member.name)}
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

            <button 
              onClick={() => openModal(selectedMobileDate)}
              className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40 border-2 border-white cursor-pointer"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </>
      )}

      {detailModalEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm md:p-4 pt-24 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                {detailModalEvent.contractStatus === 'maintain' ? (
                  <><Trophy className="w-5 h-5 text-yellow-500" /> 체결 상세 정보</>
                ) : detailModalEvent.contractStatus === 'new' ? (
                  <><AlertCircle className="w-5 h-5 text-orange-500" /> 예정 상세 정보</>
                ) : (
                  <><CalendarIcon className="w-5 h-5 text-blue-600" /> 일정 상세 정보</>
                )}
              </h3>
              <button onClick={() => setDetailModalEvent(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm px-5 py-4 overflow-y-auto flex-1 overscroll-contain pb-safe">
              <div className="flex justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-500">일시</span>
                <span className="font-bold text-slate-800">{detailModalEvent.date} {detailModalEvent.time !== "23:59" ? detailModalEvent.time : ""}</span>
              </div>
              
              {detailModalEvent.contractStatus ? (
                <div className={`flex justify-between items-center p-3 rounded-xl border ${detailModalEvent.contractStatus === 'maintain' ? 'bg-yellow-50/50 border-yellow-200' : 'bg-orange-50/50 border-orange-200'}`}>
                  <span className={`font-bold flex items-center gap-1 ${detailModalEvent.contractStatus === 'maintain' ? 'text-yellow-700' : 'text-orange-700'}`}>
                    <DollarSign className="w-4 h-4"/> 월납 보험료
                  </span>
                  <span className={`font-black text-lg ${detailModalEvent.contractStatus === 'maintain' ? 'text-red-600' : 'text-orange-600'}`}>
                    {detailModalEvent.premium?.toLocaleString()}원
                  </span>
                </div>
              ) : (
                detailModalEvent.category && (
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-500">카테고리</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${getCategoryColor(detailModalEvent.category)}`}>
                      {detailModalEvent.category}
                    </span>
                  </div>
                )
              )}

              {(detailModalEvent.clients?.name || detailModalEvent.clients?.contractor_name || detailModalEvent.clients?.insured_name) && (
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500">관련 고객</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1 border border-slate-300 bg-white px-2 py-0.5 rounded text-xs">
                      {detailModalEvent.clients.insured_name || detailModalEvent.clients.contractor_name || detailModalEvent.clients.name}
                      {detailModalEvent.clients.contractor_name && detailModalEvent.clients.contractor_name !== detailModalEvent.clients.insured_name && ` / 계약자:${detailModalEvent.clients.contractor_name}`}
                    </span>
                    {detailModalEvent.client_id && (
                      <Link 
                        href={`/clients/${detailModalEvent.client_id}`}
                        className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <User className="w-3.5 h-3.5" /> 프로필 이동
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-500 text-xs block">{detailModalEvent.contractStatus ? "가입 상품 내역" : "상세 내용"}</span>
                <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">{detailModalEvent.content}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t shrink-0 bg-white">
              {!detailModalEvent.contractStatus && (detailModalEvent.agent_id === myInfo?.id || !detailModalEvent.agent_id) && (
                <>
                  <button 
                    onClick={() => {
                      const evt = detailModalEvent;
                      setDetailModalEvent(null);
                      openModal("", evt);
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> 수정
                  </button>
                  <button 
                    onClick={() => {
                      const id = detailModalEvent.id;
                      setDetailModalEvent(null);
                      handleDeleteSchedule(id, detailModalEvent.contractStatus);
                    }}
                    className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 삭제
                  </button>
                </>
              )}
              <button 
                onClick={() => setDetailModalEvent(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      <PendingContractsModal 
        isOpen={pendingModalState.isOpen}
        onClose={() => setPendingModalState({ ...pendingModalState, isOpen: false })}
        events={pendingModalState.events}
        date={pendingModalState.date}
      />
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