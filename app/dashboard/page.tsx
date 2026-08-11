"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Car, FileText, CheckCircle2, 
  ChevronRight, Calendar, Clock, Loader2, TrendingUp, Users, Gift, Bell, Presentation, Kanban, UserPlus, Target
} from "lucide-react";

// ⭐️ FC별 도입 목표는 아직 DB에 없으므로 유지
const MOCK_TARGET_RECRUIT_PER_FC = 2; 

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

const calculateDDay = (targetDateStr: string | null) => {
  if (!targetDateStr) return null;
  let cleanStr = targetDateStr.replace(/\./g, '-').replace(/\s/g, '');
  if (cleanStr.endsWith('-')) cleanStr = cleanStr.slice(0, -1);
  const target = new Date(cleanStr);
  if (isNaN(target.getTime())) return null;
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

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
  return Math.ceil((sangryung.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatMoney = (val: number) => {
  if (val === 0) return "0원";
  return `${val.toLocaleString()}원`;
};

const getMonthString = (offsetMonths: number = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() - offsetMonths);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getRetouchTheme = (days: number) => {
  if (days >= 180) return { bg: "bg-rose-100", text: "text-rose-700", label: "180일+" };
  if (days >= 90) return { bg: "bg-orange-100", text: "text-orange-700", label: "90일+" };
  if (days >= 60) return { bg: "bg-amber-100", text: "text-amber-700", label: "60일+" };
  return { bg: "bg-blue-100", text: "text-blue-700", label: "30일+" };
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgentName, setCurrentAgentName] = useState("");
  
  // 탭 상태 관리 (매니저용)
  const [activeTab, setActiveTab] = useState<'personal' | 'team'>('personal');

  // 내 데이터
  const [oldClients, setOldClients] = useState<any[]>([]);
  const [sangryungClients, setSangryungClients] = useState<any[]>([]);
  const [autoRenewals, setAutoRenewals] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [totalInProgressPremium, setTotalInProgressPremium] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({ thisMonth: 0, lastMonth: 0, twoMonthsAgo: 0 });
  
  // ⭐️ 나의 월간 목표 금액 (DB에서 불러옴)
  const [myTargetAmount, setMyTargetAmount] = useState(800000); 

  // 알림 센터
  const [unreadCount, setUnreadCount] = useState(0);

  // 팀장(매니저) 전용 데이터 상태
  const [isManager, setIsManager] = useState(false);
  const [teamRecruitingByAgent, setTeamRecruitingByAgent] = useState<any[]>([]);
  const [teamContractsByAgent, setTeamContractsByAgent] = useState<any[]>([]);

  // ⭐️ 그래프 애니메이션 렌더링 스위치
  const [animateBar, setAnimateBar] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      let myName = "";
      let myAgentId = null;
      let myAgencyId = null;
      let managerAuth = false;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // ⭐️ DB에서 monthly_target 도 같이 꺼내옵니다
        const { data: agentData } = await supabase.from("agents").select("id, name, rank, agency_id, monthly_target").eq("auth_id", user.id).single();
        if (agentData) {
          myName = agentData.name;
          myAgentId = agentData.id;
          myAgencyId = agentData.agency_id;
          setCurrentAgentName(myName);
          
          // ⭐️ 나의 목표 금액 세팅
          setMyTargetAmount(agentData.monthly_target || 800000); 
          
          managerAuth = !!agentData.rank && agentData.rank !== "FC";
          setIsManager(managerAuth);
        }
      }

      if (!myAgentId) {
        setIsLoading(false);
        return;
      }

      // 1. 내 데이터 호출
      const [clientsRes, insRes, schedulesRes] = await Promise.all([
        supabase.from("clients").select("*").eq("agent_id", myAgentId),
        supabase.from("subscription_insurance").select("*").eq("agent_name", myName),
        supabase.from("schedules").select("*") 
      ]);

      const myClients = clientsRes.data || [];
      const myInsurances = insRes.data || [];
      const myClientIds = myClients.map(c => Number(c.id));
      const clientMap = new Map(myClients.map(c => [Number(c.id), c.name]));
      const allSchedules = schedulesRes.data || [];
      const mySchedules = allSchedules.filter(sch => sch.agent_id === myAgentId || myClientIds.includes(Number(sch.client_id)));
      
      const generatedNotis: any[] = [];

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
        generatedNotis.push({ id: `retouch_${c.id}_${bucket}` });
      });

      const sangryungList = myClients
        .map(c => {
          const dDay = calculateSangryungDDay(c.birth_date);
          return { ...c, dDay };
        })
        .filter(c => c.dDay !== null && c.dDay >= 0 && c.dDay <= 30)
        .sort((a, b) => a.dDay - b.dDay);
      setSangryungClients(sangryungList);

      sangryungList.forEach(c => {
        generatedNotis.push({ id: `sangryung_${c.id}_${new Date().getFullYear()}` });
      });

      const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
      const unreadLocalCount = generatedNotis.filter(n => !readNotiIds.includes(n.id)).length;

      const { count: dbUnreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', myAgentId)
        .eq('is_read', false);

      setUnreadCount(unreadLocalCount + (dbUnreadCount || 0));

      const autoList = myInsurances 
        .filter(ins => ins.product_name && ins.product_name.includes("자동차") && ins.maturity_date)
        .map(ins => ({ 
          ...ins, 
          dDay: calculateDDay(ins.maturity_date), 
          clientName: clientMap.get(Number(ins.client_id)) || ins.contractor_name 
        }))
        .filter(ins => ins.dDay !== null && ins.dDay >= 0 && ins.dDay <= 60)
        .sort((a, b) => (a.dDay || 0) - (b.dDay || 0));
      setAutoRenewals(autoList);

      const newPolicies = myInsurances
        .filter(ins => ins.policy_status === "new")
        .map(ins => ({ ...ins, clientName: clientMap.get(Number(ins.client_id)) || ins.contractor_name }))
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setInProgress(newPolicies);
      
      const totalNewPremium = newPolicies.reduce((acc, curr) => acc + (curr.monthly_premium || 0), 0);
      setTotalInProgressPremium(totalNewPremium);

      const thisMonthStr = getMonthString(0);
      const lastMonthStr = getMonthString(1);
      const twoMonthsAgoStr = getMonthString(2);
      let statThisMonth = 0, statLastMonth = 0, statTwoMonthsAgo = 0;

      const completedPolicies = myInsurances
        .filter(ins => ins.policy_status === "maintain" && ins.subscription_date)
        .map(ins => {
          let cleanSubDate = ins.subscription_date!.replace(/\./g, '-').replace(/\s/g, '');
          if (cleanSubDate.endsWith('-')) cleanSubDate = cleanSubDate.slice(0, -1);

          if (cleanSubDate.startsWith(thisMonthStr)) statThisMonth += (ins.monthly_premium || 0);
          else if (cleanSubDate.startsWith(lastMonthStr)) statLastMonth += (ins.monthly_premium || 0);
          else if (cleanSubDate.startsWith(twoMonthsAgoStr)) statTwoMonthsAgo += (ins.monthly_premium || 0);
          
          return { ...ins, clientName: clientMap.get(Number(ins.client_id)) || ins.contractor_name };
        })
        .sort((a, b) => new Date(b.subscription_date || 0).getTime() - new Date(a.subscription_date || 0).getTime())
        .slice(0, 10); 

      setCompleted(completedPolicies);
      setMonthlyStats({ thisMonth: statThisMonth, lastMonth: statLastMonth, twoMonthsAgo: statTwoMonthsAgo });

      // -------------------------------------------------------------------
      // 2. 팀장(매니저) 전용 팀 데이터 호출
      // -------------------------------------------------------------------
      if (managerAuth && myAgencyId) {
        const { data: members } = await supabase.from("agents").select("id, name, monthly_target").eq("agency_id", myAgencyId);
        
        if (members && members.length > 0) {
          const memberIds = members.map(m => m.id);
          const memberNames = members.map(m => m.name);

          const [tClientsRes, tInsRes] = await Promise.all([
             supabase.from("clients").select("*, agents(name)").in("agent_id", memberIds),
             supabase.from("subscription_insurance").select("*").in("agent_name", memberNames)
          ]);

          const tClients = tClientsRes.data || [];
          const tIns = tInsRes.data || [];

          const sortByName = (a: any, b: any) => a.name.localeCompare(b.name, 'ko-KR');
          const sortedMembers = [...members].sort(sortByName);

          // ① 팀 리쿠르팅 진행 현황
          const groupedRecruiting = sortedMembers.map(member => {
            const memberClients = tClients
              .filter(c => c.agent_id === member.id && parseSteps(c.recruiting_status).length > 0)
              .map(c => {
                 const steps = parseSteps(c.recruiting_status);
                 const percent = Math.round((steps.length / RECRUITING_STEPS.length) * 100);
                 return { ...c, recSteps: steps.length, recPercent: percent };
              })
              .sort((a, b) => b.recPercent - a.recPercent);
            
            return {
              agentName: member.name,
              targetCount: MOCK_TARGET_RECRUIT_PER_FC,
              currentCount: memberClients.length,
              clients: memberClients
            };
          });
          setTeamRecruitingByAgent(groupedRecruiting);

          // ② 이번 달 팀 계약 현황
          const tCont = tIns
             .filter(ins => ins.policy_status === "new" || ins.policy_status === "maintain")
             .map(ins => {
                const isCompleted = ins.policy_status === "maintain";
                let dateStr = isCompleted ? ins.subscription_date : (ins.created_at ? ins.created_at.slice(0, 10) : '-');
                if (!dateStr) dateStr = '-';
                const cName = tClients.find(c => Number(c.id) === Number(ins.client_id))?.name || ins.contractor_name;
                return { ...ins, isCompleted, dateStr, clientName: cName };
             })
             .filter(ins => {
                let cleanDate = ins.dateStr.replace(/\./g, '-').replace(/\s/g, '');
                return cleanDate.startsWith(thisMonthStr);
             });

          const groupedContracts = sortedMembers.map(member => {
            const memberContracts = tCont
              .filter(ins => ins.agent_name === member.name)
              .sort((a, b) => new Date(b.dateStr === '-' ? 0 : b.dateStr).getTime() - new Date(a.dateStr === '-' ? 0 : a.dateStr).getTime());
            
            const inProgressAmt = memberContracts.filter(i => !i.isCompleted).reduce((sum, i) => sum + (i.monthly_premium || 0), 0);
            const completedAmt = memberContracts.filter(i => i.isCompleted).reduce((sum, i) => sum + (i.monthly_premium || 0), 0);

            return {
                agentName: member.name,
                targetAmount: member.monthly_target || 800000, 
                inProgressAmount: inProgressAmt,
                completedAmount: completedAmt,
                contracts: memberContracts
            };
          }); 

          setTeamContractsByAgent(groupedContracts);
        }
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  // ⭐️ 데이터 로딩이 끝나면 애니메이션 0% -> 목표치% 로 발동
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setAnimateBar(true), 150); // 살짝 딜레이를 줘서 애니메이션 효과를 극대화
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const totalTeamTargetAmount = teamContractsByAgent.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalTeamInProgressAmount = teamContractsByAgent.reduce((acc, curr) => acc + curr.inProgressAmount, 0);
  const totalTeamCompletedAmount = teamContractsByAgent.reduce((acc, curr) => acc + curr.completedAmount, 0);

  const totalTeamTargetRecruit = teamRecruitingByAgent.reduce((acc, curr) => acc + curr.targetCount, 0);
  const totalTeamCurrentRecruit = teamRecruitingByAgent.reduce((acc, curr) => acc + curr.currentCount, 0);

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
    <div className="w-full max-w-[1500px] mx-auto p-4 md:p-8 bg-gray-50/50 min-h-screen flex flex-col overflow-hidden">
      
      {/* 상단 타이틀 및 알림 센터 */}
      <div className="flex justify-between items-end mb-4 relative shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Presentation className="w-5 h-5 text-blue-600" />영업 현황 보드</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            <strong className="text-blue-600">{currentAgentName}</strong> 님의 오늘 챙겨야 할 핵심 업무 현황입니다.
          </p>
        </div>

        <div>
          <Link 
            href="/notifications"
            className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors relative cursor-pointer flex items-center justify-center group"
            title="알림 센터 가기"
          >
            <Bell className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 border border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 상단 탭 UI (매니저 권한이 있을 경우에만 표시) */}
      {isManager && (
        <div className="flex items-center gap-6 border-b border-gray-200 shrink-0 mb-6 px-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={`cursor-pointer pb-3 text-sm font-black transition-all relative ${activeTab === 'personal' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            내 영업 보드
            {activeTab === 'personal' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>}
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`cursor-pointer pb-3 text-sm font-black transition-all relative ${activeTab === 'team' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            팀 관리 보드
            {activeTab === 'team' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>}
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          ⭐️ 첫 번째 탭 화면: 나(Agent)의 개인 현황
      ------------------------------------------------------------------------- */}
      {(!isManager || activeTab === 'personal') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 lg:h-[calc(100vh-190px)] w-full lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)]">
          
          {/* ① 재터치 필요 고객 */}
          <div className="lg:col-start-1 lg:col-span-1 lg:row-start-1 lg:row-span-2 h-[400px] lg:h-full bg-white border border-rose-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-rose-50/80 p-4 border-b border-rose-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-rose-900 flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5 text-rose-500" /> 재터치 필요
                </h3>
                <p className="text-[10px] text-rose-600/80 font-bold mt-0.5">30일 이상 업데이트 없음</p>
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

          {/* 상령일 임박 고객 */}
          <div className="lg:col-start-1 lg:col-span-1 lg:row-start-3 lg:row-span-1 h-[300px] lg:h-full bg-white border border-purple-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
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

          {/* ② 자동차 갱신 리스트 */}
          <div className="lg:col-start-2 lg:col-span-2 lg:row-start-1 lg:row-span-1 h-[300px] lg:h-full bg-white border border-amber-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex justify-between items-center shrink-0">
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

          {/* ③ 진행 중인 계약 리스트 */}
          <div className="lg:col-start-2 lg:col-span-2 lg:row-start-2 lg:row-span-1 h-[300px] lg:h-full bg-white border border-blue-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
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
                        <Link href={`/clients/${ins.client_id}`} className="text-gray-300 group-hover:text-blue-500 transition-colors"><ChevronRight className="w-5 h-5" /></Link>
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

          {/* ④ 최근 체결한 보험 리스트 & 통계 */}
          <div className="lg:col-start-2 lg:col-span-2 lg:row-start-3 lg:row-span-1 h-[400px] lg:h-full bg-white border border-emerald-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
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
              
              {/* ⭐️ 내 개인 달성률(게이지 바) 렌더링 영역 */}
              {(() => {
                const safeTarget = myTargetAmount > 0 ? myTargetAmount : 1;
                const myAchievementRate = Math.min(100, Math.round((monthlyStats.thisMonth / safeTarget) * 100)) || 0;
                
                return (
                  <div className="flex flex-col gap-2 mb-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-between gap-4">
                      <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm shrink-0 whitespace-nowrap">나의 이번 달 달성률</span>
                      <div className="flex items-center gap-2 flex-1 w-full">
                        <div className="flex-1 w-full bg-white border border-emerald-200 rounded-full h-1.5 overflow-hidden shadow-inner">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${myAchievementRate >= 100 ? 'bg-blue-500' : 'bg-emerald-500'}`} 
                            style={{ width: animateBar ? `${myAchievementRate}%` : '0%' }}
                          ></div>
                        </div>
                        <span className={`text-[10px] font-black shrink-0 ${myAchievementRate >= 100 ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {animateBar ? myAchievementRate : 0}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400">목표</span>
                        <span className="text-[11px] font-black text-slate-600">{formatMoney(myTargetAmount)}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-amber-500">진행 중</span>
                        <span className="text-[11px] font-black text-amber-600">{formatMoney(totalInProgressPremium)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-emerald-500">체결 완료</span>
                        <span className="text-[11px] font-black text-emerald-700">{formatMoney(monthlyStats.thisMonth)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 체결된 고객 리스트 영역 */}
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
      )}

      {/* -------------------------------------------------------------------------
          ⭐️ 두 번째 탭 화면: 매니저(팀장/지점장) 전용 팀 전체 현황
      ------------------------------------------------------------------------- */}
      {isManager && activeTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0 lg:h-[calc(100vh-190px)] w-full">
          
          {/* 팀 리쿠르팅 파이프라인 (좌측) */}
          <div className="bg-white border border-purple-300 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[400px] lg:h-full min-h-0">
            <div className="bg-purple-100/50 p-4 border-b border-purple-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
              <div>
                <h3 className="font-black text-purple-900 flex items-center gap-2 text-base">
                  <UserPlus className="w-5 h-5 text-purple-600" /> 팀 리쿠르팅 파이프라인
                </h3>
                <p className="text-[10px] text-purple-700/80 font-bold mt-0.5">FC별 도입 진행 현황 (가나다순)</p>
              </div>
              <div className="flex gap-2">
                <div className="bg-white border border-purple-200 px-3 py-1.5 rounded-lg shadow-sm flex flex-col items-end">
                  <span className="text-[10px] text-purple-500 font-bold">팀 총 목표</span>
                  <span className="text-xs font-black text-purple-800">{totalTeamTargetRecruit}명</span>
                </div>
                <div className="bg-purple-600 border border-purple-700 px-3 py-1.5 rounded-lg shadow-sm flex flex-col items-end">
                  <span className="text-[10px] text-purple-200 font-bold">진행 중</span>
                  <span className="text-xs font-black text-white">{totalTeamCurrentRecruit}명</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-purple-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="space-y-6">
                {teamRecruitingByAgent.map(group => (
                  <div key={group.agentName}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="bg-purple-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">{group.agentName} FC</span>
                      <span className="text-[10px] text-purple-400 font-bold border border-purple-100 px-1.5 py-0.5 rounded">
                        목표 {group.targetCount}명
                      </span>
                    </div>
                    
                    {group.clients.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.clients.map((c: any) => (
                          <li key={c.id} className="relative p-3 hover:bg-purple-50/40 rounded-xl border border-purple-100 bg-white transition-colors shadow-sm group/card">
                            <Link href={`/clients/${c.id}`} className="absolute inset-0 z-10"></Link>
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-bold text-sm text-gray-900 group-hover/card:text-purple-600 transition-colors">{c.name} 후보자</p>
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-bold text-purple-600">{c.recPercent}%</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 group-hover/card:text-purple-400" />
                              </div>
                            </div>
                            <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                              <div className="h-1.5 rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${c.recPercent}%` }}></div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="w-full p-4 border border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50 shadow-sm">
                        <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5" /> 진행 중인 도입 건이 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 이번 달 팀 계약 현황 (우측) */}
          <div className="bg-white border border-blue-300 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[400px] lg:h-full min-h-0">
            <div className="bg-blue-100/50 p-4 border-b border-blue-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
              <div>
                <h3 className="font-black text-blue-900 flex items-center gap-2 text-base">
                  <Kanban className="w-5 h-5 text-blue-600" /> 이번 달 팀 계약 현황
                </h3>
                <p className="text-[10px] text-blue-700/80 font-bold mt-0.5">FC별 이번 달 진행 및 체결 건 (가나다순)</p>
              </div>
              
              <div className="flex gap-2 w-full xl:w-auto">
                <div className="bg-white border border-blue-200 px-2.5 py-1 rounded-lg shadow-sm flex flex-col items-end flex-1 xl:flex-none">
                  <span className="text-[9px] text-blue-500 font-bold">팀 총 목표</span>
                  <span className="text-[11px] font-black text-blue-800">{formatMoney(totalTeamTargetAmount)}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg shadow-sm flex flex-col items-end flex-1 xl:flex-none">
                  <span className="text-[9px] text-amber-600 font-bold">진행 중</span>
                  <span className="text-[11px] font-black text-amber-700">{formatMoney(totalTeamInProgressAmount)}</span>
                </div>
                <div className="bg-blue-600 border border-blue-700 px-2.5 py-1 rounded-lg shadow-sm flex flex-col items-end flex-1 xl:flex-none">
                  <span className="text-[9px] text-blue-200 font-bold">체결 완료</span>
                  <span className="text-[11px] font-black text-white">{formatMoney(totalTeamCompletedAmount)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-blue-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="space-y-6">
                {teamContractsByAgent.map(group => {
                  const safeTarget = group.targetAmount > 0 ? group.targetAmount : 1;
                  const achievementRate = Math.min(100, Math.round((group.completedAmount / safeTarget) * 100)) || 0;
                  
                  return (
                    <div key={group.agentName}>
                      {/* ⭐️ 팀원별 목표/진행률 요약 그래프 영역 */}
                      <div className="flex flex-col gap-2 mb-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between gap-4">
                          <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm shrink-0 whitespace-nowrap">{group.agentName} FC</span>
                          <div className="flex items-center gap-2 flex-1 w-full">
                            <div className="flex-1 w-full bg-white border border-blue-200 rounded-full h-1.5 overflow-hidden shadow-inner">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${achievementRate >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                style={{ width: animateBar ? `${achievementRate}%` : '0%' }}
                              ></div>
                            </div>
                            <span className={`text-[10px] font-black shrink-0 ${achievementRate >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                              {animateBar ? achievementRate : 0}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400">목표</span>
                            <span className="text-[11px] font-black text-slate-600">{formatMoney(group.targetAmount)}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-amber-500">진행 중</span>
                            <span className="text-[11px] font-black text-amber-600">{formatMoney(group.inProgressAmount)}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-blue-500">체결 완료</span>
                            <span className="text-[11px] font-black text-blue-700">{formatMoney(group.completedAmount)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {group.contracts.length > 0 ? (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.contracts.map((ins: any) => (
                            <li key={ins.id} className="relative p-3 hover:bg-blue-50/40 rounded-xl border border-blue-100 bg-white transition-colors shadow-sm group/card">
                              <Link href={`/clients/${ins.client_id}`} className="absolute inset-0 z-10"></Link>
                              
                              <div className="flex justify-between items-start mb-1.5">
                                <p className="font-bold text-sm text-gray-900 truncate pr-1 group-hover/card:text-blue-600 transition-colors">{ins.clientName}</p>
                                <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm ${ins.isCompleted ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                  {ins.isCompleted ? '체결완료' : '진행중'}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium truncate mb-2">{ins.product_name} <span className="text-[10px] text-gray-400">({ins.insurance_company})</span></p>
                              <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-50">
                                <p className="text-[10px] text-gray-400 font-medium">{ins.dateStr}</p>
                                <div className="flex items-center gap-1">
                                  <p className={`text-sm font-black ${ins.isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>{formatMoney(ins.monthly_premium)}</p>
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover/card:text-blue-400" />
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="w-full p-4 border border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50 shadow-sm">
                          <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                            <Kanban className="w-3.5 h-3.5" /> 이번 달 내역이 없습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}