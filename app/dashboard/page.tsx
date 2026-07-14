// app/dashboard/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Car, FileText, CheckCircle2, 
  ChevronRight, Calendar, Clock, Loader2, TrendingUp, Users, Gift, Bell, Check, Presentation, Kanban, BarChart
} from "lucide-react";

// ⭐️ 강력한 날짜 계산 헬퍼 함수 (마침표, 공백이 섞여도 완벽하게 계산)
const calculateDDay = (targetDateStr: string | null) => {
  if (!targetDateStr) return null;
  
  // "2026. 08. 15." 같은 포맷을 "2026-08-15"로 강제 변환
  let cleanStr = targetDateStr.replace(/\./g, '-').replace(/\s/g, '');
  if (cleanStr.endsWith('-')) cleanStr = cleanStr.slice(0, -1);

  const target = new Date(cleanStr);
  if (isNaN(target.getTime())) return null;

  // 자정(0시 0분 0초) 기준으로 세팅하여 시간 오차 방지
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 상령일(보험나이 변경일) 계산 헬퍼 함수
const calculateSangryungDDay = (birthDateStr: string | null) => {
  if (!birthDateStr) return null;
  
  let cleanStr = birthDateStr.replace(/\./g, '-').replace(/\s/g, '');
  if (cleanStr.endsWith('-')) cleanStr = cleanStr.slice(0, -1);

  const birth = new Date(cleanStr);
  if (isNaN(birth.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let sangryung = new Date(today.getFullYear(), birth.getMonth() + 6, birth.getDate());

  if (sangryung.getTime() < today.getTime()) {
    sangryung = new Date(today.getFullYear() + 1, birth.getMonth() + 6, birth.getDate());
  }

  const diffTime = sangryung.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 금액 포맷팅 헬퍼
const formatMoney = (val: number) => {
  if (val === 0) return "0원";
  return `${val.toLocaleString()}원`;
};

// YYYY-MM 문자열 생성 헬퍼
const getMonthString = (offsetMonths: number = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() - offsetMonths);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// 재터치 뱃지 테마 계산 헬퍼
const getRetouchTheme = (days: number) => {
  if (days >= 180) return { bg: "bg-rose-100", text: "text-rose-700", label: "180일+" };
  if (days >= 90) return { bg: "bg-orange-100", text: "text-orange-700", label: "90일+" };
  if (days >= 60) return { bg: "bg-amber-100", text: "text-amber-700", label: "60일+" };
  return { bg: "bg-blue-100", text: "text-blue-700", label: "30일+" };
};

type Notification = {
  id: string;
  type: 'retouch' | 'sangryung';
  title: string;
  desc: string;
  date: Date;
  clientId: number;
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgentName, setCurrentAgentName] = useState("");
  
  const [oldClients, setOldClients] = useState<any[]>([]);
  const [sangryungClients, setSangryungClients] = useState<any[]>([]);
  const [autoRenewals, setAutoRenewals] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);

  const [totalInProgressPremium, setTotalInProgressPremium] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({ thisMonth: 0, lastMonth: 0, twoMonthsAgo: 0 });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      let myName = "";
      let validAgentIds: number[] = [];

      // 1. 로그인 유저 정보 및 열람 권한 범위(validAgentIds) 획득
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agentData } = await supabase.from("agents").select("*").eq("auth_id", user.id).single();
        if (agentData) {
          myName = agentData.name;
          setCurrentAgentName(myName);
          validAgentIds.push(agentData.id); // 내 숫자 ID 추가

          // 팀장(SM)인 경우 같은 지점 팀원의 ID도 권한 목록에 추가
          if (agentData.rank === "SM" && agentData.agency_id) {
            const { data: teamAgents } = await supabase.from("agents").select("id").eq("agency_id", agentData.agency_id);
            if (teamAgents) {
              teamAgents.forEach(a => {
                if (!validAgentIds.includes(a.id)) validAgentIds.push(a.id);
              });
            }
          }
        }
      }

      const fetchSchedulesSafe = async () => {
        try {
          const res = await supabase.from("schedules").select("*");
          if (res.error) return { data: [] }; 
          return res;
        } catch (error) {
          return { data: [] };
        }
      };

      // 2. 전체 데이터 호출
      const [clientsRes, insRes, schedulesRes] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("subscription_insurance").select("*"),
        fetchSchedulesSafe() 
      ]);

      const allClients = clientsRes.data || [];
      const allInsurances = insRes.data || [];
      const allSchedules = schedulesRes.data || [];

      // ⭐️ 3. 보안 로직: 내가 열람할 수 있는 고객 데이터만 남기기
      const myClients = allClients.filter(c => validAgentIds.includes(Number(c.agent_id)));
      const myClientIds = myClients.map(c => Number(c.id));
      const clientMap = new Map(myClients.map(c => [Number(c.id), c.name]));

      // ⭐️ 4. 내 고객의 보험과 일정만 남기기 (원천 차단)
      const myInsurances = allInsurances.filter(ins => myClientIds.includes(Number(ins.client_id)));
      const mySchedules = allSchedules.filter(sch => myClientIds.includes(Number(sch.client_id)));

      const generatedNotis: Notification[] = [];

      // ----------------------------------------------------
      // ① 재터치 리스트 (스케줄 포함 30일 이상 경과)
      // ----------------------------------------------------
      const retouchList = myClients
        .map(c => {
          const clientInsurances = myInsurances.filter(ins => Number(ins.client_id) === Number(c.id));
          const clientSchedules = mySchedules.filter(sch => Number(sch.client_id) === Number(c.id));

          const insDates = clientInsurances.map(i => new Date(i.created_at || 0).getTime());
          const schDates = clientSchedules.map(s => new Date(s.schedule_date || s.created_at || 0).getTime()); 

          const allDates = [new Date(c.created_at || 0).getTime(), ...insDates, ...schDates];
          const lastUpdate = new Date(Math.max(...allDates)); 
          
          const daysSinceUpdate = Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
          return { ...c, lastUpdate, daysSinceUpdate };
        })
        .filter(c => c.daysSinceUpdate >= 30) 
        .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate); 

      setOldClients(retouchList);

      retouchList.forEach(c => {
        let bucket = c.daysSinceUpdate >= 180 ? 180 : c.daysSinceUpdate >= 90 ? 90 : c.daysSinceUpdate >= 60 ? 60 : 30;
        generatedNotis.push({
          id: `retouch_${c.id}_${bucket}`,
          type: 'retouch',
          title: `재터치 알림 (${bucket}일 경과)`,
          desc: `${c.name} 고객님과 마지막 활동 후 ${c.daysSinceUpdate}일이 지났습니다.`,
          date: new Date(),
          clientId: c.id
        });
      });

      // ----------------------------------------------------
      // ② 상령일 임박 리스트 (D-30 이내)
      // ----------------------------------------------------
      const sangryungList = myClients
        .map(c => {
          const dDay = calculateSangryungDDay(c.birth_date);
          return { ...c, dDay };
        })
        .filter(c => c.dDay !== null && c.dDay >= 0 && c.dDay <= 30)
        .sort((a, b) => a.dDay - b.dDay);
      setSangryungClients(sangryungList);

      sangryungList.forEach(c => {
        generatedNotis.push({
          id: `sangryung_${c.id}_${new Date().getFullYear()}`, 
          type: 'sangryung',
          title: `상령일 임박 (D-${c.dDay})`,
          desc: `${c.name} 고객님의 보험나이가 곧 인상됩니다.`,
          date: new Date(),
          clientId: c.id
        });
      });

      const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
      const unreadCount = generatedNotis.filter(n => !readNotiIds.includes(n.id)).length;
      
      setNotifications(generatedNotis);
      setUnreadCount(unreadCount);

      // ----------------------------------------------------
      // ④ 자동차보험 갱신 리스트 (D-60 이내, 오직 내 고객만)
      // ----------------------------------------------------
      const autoList = myInsurances // 👈 이제 myInsurances를 사용하므로 남의 고객은 절대 안 뜸
        .filter(ins => ins.product_name && ins.product_name.includes("자동차") && ins.maturity_date)
        .map(ins => ({ 
          ...ins, 
          dDay: calculateDDay(ins.maturity_date), 
          clientName: clientMap.get(Number(ins.client_id)) 
        }))
        // D-Day가 null이 아니고 0 이상 60 이하인 것들만 렌더링
        .filter(ins => ins.dDay !== null && ins.dDay >= 0 && ins.dDay <= 60)
        .sort((a, b) => (a.dDay || 0) - (b.dDay || 0));
        
      setAutoRenewals(autoList);

      // ----------------------------------------------------
      // ⑤ 진행 중인 계약 리스트 (new 상태 + 내 실적만)
      // ----------------------------------------------------
      const newPolicies = myInsurances
        .filter(ins => ins.policy_status === "new" && ins.agent_name === myName)
        .map(ins => ({ ...ins, clientName: clientMap.get(Number(ins.client_id)) }))
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setInProgress(newPolicies);
      
      const totalNewPremium = newPolicies.reduce((acc, curr) => acc + (curr.monthly_premium || 0), 0);
      setTotalInProgressPremium(totalNewPremium);

      // ----------------------------------------------------
      // ⑥ 최근 체결한 보험 & 통계 (maintain 상태 + 최근 30일 + 내 실적만)
      // ----------------------------------------------------
      const thisMonthStr = getMonthString(0);
      const lastMonthStr = getMonthString(1);
      const twoMonthsAgoStr = getMonthString(2);

      let statThisMonth = 0, statLastMonth = 0, statTwoMonthsAgo = 0;

      const completedPolicies = myInsurances
        .filter(ins => ins.policy_status === "maintain" && ins.subscription_date && ins.agent_name === myName)
        .map(ins => {
          let cleanSubDate = ins.subscription_date!.replace(/\./g, '-').replace(/\s/g, '');
          if (cleanSubDate.endsWith('-')) cleanSubDate = cleanSubDate.slice(0, -1);

          if (cleanSubDate.startsWith(thisMonthStr)) statThisMonth += (ins.monthly_premium || 0);
          else if (cleanSubDate.startsWith(lastMonthStr)) statLastMonth += (ins.monthly_premium || 0);
          else if (cleanSubDate.startsWith(twoMonthsAgoStr)) statTwoMonthsAgo += (ins.monthly_premium || 0);
          
          return { ...ins, clientName: clientMap.get(Number(ins.client_id)) };
        })
        .sort((a, b) => new Date(b.subscription_date || 0).getTime() - new Date(a.subscription_date || 0).getTime())
        .slice(0, 10); 

      setCompleted(completedPolicies);
      setMonthlyStats({ thisMonth: statThisMonth, lastMonth: statLastMonth, twoMonthsAgo: statTwoMonthsAgo });

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const markAsRead = (id: string) => {
    const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
    if (!readNotiIds.includes(id)) {
      readNotiIds.push(id);
      localStorage.setItem('readNotis', JSON.stringify(readNotiIds));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
    const merged = Array.from(new Set([...readNotiIds, ...allIds]));
    localStorage.setItem('readNotis', JSON.stringify(merged));
    setUnreadCount(0);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-bold text-sm">대시보드 데이터를 분석 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      
      {/* 상단 타이틀 및 알림 센터(Bell) */}
      <div className="flex justify-between items-end mb-2 relative">
        <div>
        
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Presentation className="w-5 h-5 text-blue-600" />영업 현황 보드</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            <strong className="text-blue-600">{currentAgentName}</strong> 님의 오늘 챙겨야 할 핵심 업무 현황입니다.
          </p>
        </div>

        <div className="relative" ref={notiRef}>
          <button 
            onClick={() => setIsNotiOpen(!isNotiOpen)} 
            className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors relative"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 알림 드롭다운 패널 */}
          {isNotiOpen && (
            <div className="absolute right-0 mt-3 w-[320px] max-h-[400px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-gray-50 border-b border-gray-100 p-3 flex justify-between items-center shrink-0">
                <span className="font-bold text-sm text-gray-800">새로운 알림</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                    <Check className="w-3 h-3"/> 모두 읽음
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {notifications.length > 0 ? (
                  notifications.map(noti => {
                    const isRead = JSON.parse(localStorage.getItem('readNotis') || '[]').includes(noti.id);
                    return (
                      <Link 
                        key={noti.id} 
                        href={`/clients/${noti.clientId}`}
                        onClick={() => markAsRead(noti.id)}
                        className={`flex flex-col p-3 rounded-xl transition-colors ${isRead ? 'opacity-50 hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {noti.type === 'retouch' ? <Clock className="w-3.5 h-3.5 text-rose-500" /> : <Gift className="w-3.5 h-3.5 text-purple-500" />}
                          <span className={`text-xs font-bold ${noti.type === 'retouch' ? 'text-rose-700' : 'text-purple-700'}`}>{noti.title}</span>
                          {!isRead && <span className="w-1.5 h-1.5 bg-red-500 rounded-full ml-auto"></span>}
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{noti.desc}</p>
                      </Link>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs font-medium">새로운 알림이 없습니다.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* =========================================================================
            왼쪽 구역: 재터치 필요 고객 + 상령일 리스트 (세로 분할)
        ========================================================================= */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-[800px]">
          
          {/* ① 재터치 필요 고객 (30일 이상) */}
          <div className="flex-[1.5] bg-white border border-rose-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-rose-50/80 p-4 border-b border-rose-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-rose-900 flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5 text-rose-500" /> 재터치 필요
                </h3>
                <p className="text-[10px] text-rose-600/80 font-bold mt-0.5">30일 이상 업데이트 없음 (오래된 순)</p>
              </div>
              <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0">
                {oldClients.length}명
              </span>
            </div>
            <div className="p-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-rose-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {oldClients.length > 0 ? (
                <ul className="space-y-1">
                  {oldClients.map(client => {
                    const theme = getRetouchTheme(client.daysSinceUpdate);
                    return (
                      <li key={client.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${theme.bg} ${theme.text}`}>
                              {theme.label}
                            </span>
                            <p className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">{client.name}</p>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">최근 이력: {client.lastUpdate.toLocaleDateString('ko-KR')}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-black text-gray-500 bg-white border border-gray-200 shadow-sm px-1.5 py-0.5 rounded-md">D+{client.daysSinceUpdate}</span>
                          <Link href={`/clients/${client.id}`} className="text-slate-300 group-hover:text-blue-500 transition-colors"><ChevronRight className="w-4 h-4" /></Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users className="w-8 h-8 mb-2 opacity-20 text-rose-500" />
                  <p className="text-xs font-semibold">재터치가 필요한 고객이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 상령일(보험나이) 임박 고객 */}
          <div className="flex-1 bg-white border border-purple-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-purple-50/80 p-4 border-b border-purple-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-purple-900 flex items-center gap-2 text-base">
                  <Gift className="w-5 h-5 text-purple-500" /> 상령일 임박
                </h3>
                <p className="text-[10px] text-purple-600/80 font-bold mt-0.5">보험나이 인상 D-30 이내</p>
              </div>
              <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0">
                {sangryungClients.length}명
              </span>
            </div>
            <div className="p-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-purple-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {sangryungClients.length > 0 ? (
                <ul className="space-y-1">
                  {sangryungClients.map(client => (
                    <li key={client.id} className="flex justify-between items-center p-3 hover:bg-purple-50/50 rounded-xl transition-colors group">
                      <div>
                        <p className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">{client.name} 고객님</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">생년월일: {client.birth_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white bg-purple-500 shadow-sm px-1.5 py-0.5 rounded-md">D-{client.dDay}</span>
                        <Link href={`/clients/${client.id}`} className="text-slate-300 group-hover:text-purple-500 transition-colors"><ChevronRight className="w-4 h-4" /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Gift className="w-8 h-8 mb-2 opacity-20 text-purple-500" />
                  <p className="text-xs font-semibold">상령일이 다가오는 고객이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* =========================================================================
            오른쪽 구역: 3개 분할 (자동차, 진행중, 완료)
        ========================================================================= */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-[800px]">
          
          {/* ② 자동차 갱신 리스트 */}
          <div className="flex-1 bg-white border border-amber-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex justify-between items-center">
              <h3 className="font-bold text-amber-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-500" /> 자동차보험 갱신 리스트
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">만기 D-60 이내</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {autoRenewals.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {autoRenewals.map(ins => (
                    <li key={ins.id} className="flex justify-between items-center p-3 hover:bg-amber-50/30 rounded-xl border border-gray-100 transition-colors group">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm text-gray-900 truncate">{ins.clientName}</p>
                          <span className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold truncate">{ins.insurance_company}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium truncate">만기일: {ins.maturity_date}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-black px-2 py-1.5 rounded-md shadow-sm border ${ins.dDay <= 30 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-amber-600 border-amber-100'}`}>
                          D-{ins.dDay}
                        </span>
                        <Link href={`/clients/${ins.client_id}`} className="text-gray-300 group-hover:text-amber-500 transition-colors"><ChevronRight className="w-5 h-5" /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                  <p className="text-xs font-semibold">다가오는 자동차 갱신건이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* ③ 진행 중인 계약 리스트 (내 계약만) */}
          <div className="flex-1 bg-white border border-blue-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> 진행 중인 계약 (내 제안건)
              </h3>
              <div className="flex items-center gap-2 text-sm bg-white border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-gray-500 font-semibold text-xs">예상 합산 월납액</span>
                <span className="font-black text-blue-600">{formatMoney(totalInProgressPremium)}</span>
              </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {inProgress.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {inProgress.map(ins => (
                    <li key={ins.id} className="flex justify-between items-center p-3 hover:bg-blue-50/30 rounded-xl border border-gray-100 transition-colors group">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-sm text-gray-900 truncate">{ins.clientName} <span className="text-xs font-semibold text-gray-400 ml-1">{ins.insurance_company}</span></p>
                        <p className="text-[11px] text-gray-500 font-medium truncate mt-1">{ins.product_name}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-sm font-black text-blue-600">{formatMoney(ins.monthly_premium)}</p>
                        <Link href={`/clients/${ins.client_id}/analysis`} className="text-gray-300 group-hover:text-blue-500 transition-colors"><ChevronRight className="w-5 h-5" /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                  <p className="text-xs font-semibold">새로 제안 중인 내역이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* ④ 최근 체결한 보험 리스트 & 통계 (내 실적만) */}
          <div className="flex-[1.5] bg-white border border-emerald-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 나의 최근 체결 완료 현황
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                <div className="flex flex-col items-end bg-white border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm flex-1 xl:flex-none">
                  <span className="text-[10px] text-gray-400 font-bold mb-0.5">저저번달 ({getMonthString(2).slice(5)}월)</span>
                  <span className="font-bold text-slate-700 text-xs">{formatMoney(monthlyStats.twoMonthsAgo)}</span>
                </div>
                <div className="flex flex-col items-end bg-white border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm flex-1 xl:flex-none">
                  <span className="text-[10px] text-gray-400 font-bold mb-0.5">저번달 ({getMonthString(1).slice(5)}월)</span>
                  <span className="font-bold text-slate-700 text-xs">{formatMoney(monthlyStats.lastMonth)}</span>
                </div>
                <div className="flex flex-col items-end bg-emerald-600 text-white border border-emerald-700 px-3 py-1.5 rounded-lg shadow-sm flex-1 xl:flex-none relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full"></div>
                  <span className="text-[10px] text-emerald-100 font-bold mb-0.5">이번달 ({getMonthString(0).slice(5)}월)</span>
                  <span className="font-black text-white text-sm flex items-center gap-1">
                    {formatMoney(monthlyStats.thisMonth)} <TrendingUp className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-emerald-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {completed.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {completed.map(ins => (
                    <li key={ins.id} className="flex justify-between items-center p-3 hover:bg-emerald-50/30 rounded-xl border border-gray-100 transition-colors group">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-sm text-gray-900 truncate">{ins.clientName} <span className="text-xs font-semibold text-gray-400 ml-1">{ins.insurance_company}</span></p>
                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> {ins.subscription_date} 체결
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-sm font-black text-gray-700">{formatMoney(ins.monthly_premium)}</p>
                        <Link href={`/clients/${ins.client_id}`} className="text-gray-400 group-hover:text-emerald-500 transition-colors"><ChevronRight className="w-5 h-5" /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <p className="text-xs font-semibold">최근 체결된 내역이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}