// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Car, FileText, CheckCircle2, ChevronLeft,
  ChevronRight, Calendar, Clock, Loader2, TrendingUp, Users, Gift, Bell, Presentation, Kanban, UserPlus, X, Plus, BarChart3, Edit3
} from "lucide-react";

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

const getLocalString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
};

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
  const target = parseLocalDate(cleanStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateSangryungDDay = (birthDateStr: string | null) => {
  if (!birthDateStr) return null;
  let cleanStr = birthDateStr.replace(/\./g, '-').replace(/\s/g, '');
  if (cleanStr.endsWith('-')) cleanStr = cleanStr.slice(0, -1);
  const birth = parseLocalDate(cleanStr);
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
  const [agentId, setAgentId] = useState<number | null>(null);
  const [currentAgentName, setCurrentAgentName] = useState("");
  const [activeTab, setActiveTab] = useState<'personal' | 'team'>('personal');
  const [oldClients, setOldClients] = useState<any[]>([]);
  const [sangryungClients, setSangryungClients] = useState<any[]>([]);
  const [autoRenewals, setAutoRenewals] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [totalInProgressPremium, setTotalInProgressPremium] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({ thisMonth: 0, lastMonth: 0, twoMonthsAgo: 0 });
  const [myTargetAmount, setMyTargetAmount] = useState(800000); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [isManager, setIsManager] = useState(false);
  const [teamRecruitingByAgent, setTeamRecruitingByAgent] = useState<any[]>([]);
  const [teamContractsByAgent, setTeamContractsByAgent] = useState<any[]>([]);
  const [animateBar, setAnimateBar] = useState(false);

  // 파이프라인 전용 상태
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [timelineOffset, setTimelineOffset] = useState(0); 
  const [pipelineForm, setPipelineForm] = useState({ 
    client_id: null as number | null, 
    client_name: '', 
    details: '', 
    amount: '', 
    date: getLocalString(new Date(Date.now() + 86400000 * 3))
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      let myName = "";
      let myAgentId = null;
      let myAgencyId = null;
      let managerAuth = false;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agentData } = await supabase.from("agents").select("id, name, rank, agency_id, monthly_target").eq("auth_id", user.id).single();
        if (agentData) {
          myName = agentData.name;
          myAgentId = agentData.id;
          myAgencyId = agentData.agency_id;
          setAgentId(myAgentId);
          setCurrentAgentName(myName);
          setMyTargetAmount(agentData.monthly_target || 800000); 
          const userRank = agentData.rank ? String(agentData.rank).toUpperCase() : "";
          managerAuth = userRank.includes("SM");
          setIsManager(managerAuth);
        }
      }

      if (!myAgentId) {
        setIsLoading(false);
        return;
      }

      // ⭐️ 1. DB에서 모든 실데이터 병렬로 가져오기 (파이프라인 포함)
      const [clientsRes, insRes, schedulesRes, pipelineRes] = await Promise.all([
        supabase.from("clients").select("*").eq("agent_id", myAgentId),
        supabase.from("subscription_insurance").select("*").eq("agent_name", myName),
        supabase.from("schedules").select("*"),
        supabase.from("sales_pipelines").select("*").eq("agent_id", myAgentId) // 실제 DB 호출
      ]);

      const myClients = clientsRes.data || [];
      setClientsList(myClients);
      
      // ⭐️ 2. 파이프라인 세팅 (Mock 제거)
      setPipelines(pipelineRes.data || []);

      const myInsurances = insRes.data || [];
      const myClientIds = myClients.map(c => Number(c.id));
      const clientMap = new Map(myClients.map(c => [Number(c.id), c.name]));
      const allSchedules = schedulesRes.data || [];
      const mySchedules = allSchedules.filter(sch => sch.agent_id === myAgentId || myClientIds.includes(Number(sch.client_id)));
      
      // ⭐️ 3. 스케줄 세팅 (태그 렌더링용)
      setSchedules(mySchedules);
      
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

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setAnimateBar(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const timelineStart = new Date(today);
  timelineStart.setDate(today.getDate() - 3 + (timelineOffset * 7)); 

  const timelineDays = Array.from({length: 14}, (_, i) => {
    const d = new Date(timelineStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  
  const TOTAL_TIMELINE_MS = 14 * 86400000;

  // ⭐️ 4. 파이프라인 실제 DB 삽입 로직
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) setPipelineForm({ ...pipelineForm, amount: '' });
    else setPipelineForm({ ...pipelineForm, amount: Number(val).toLocaleString() });
  };

  const handleAddPipeline = async () => {
    if (!pipelineForm.client_name || !pipelineForm.details || !pipelineForm.amount || !pipelineForm.date) {
      return alert("모든 항목을 입력해주세요.");
    }
    const amountNum = Number(pipelineForm.amount.replace(/,/g, ''));
    
    const insertPayload = {
      agent_id: agentId,
      client_id: pipelineForm.client_id || null,
      client_name: pipelineForm.client_name,
      contract_details: pipelineForm.details,
      expected_amount: amountNum,
      expected_date: pipelineForm.date,
      status: '미진행',
      history: []
    };

    const { data, error } = await supabase.from('sales_pipelines').insert(insertPayload).select();
    
    if (error) {
      alert("리스트 추가 실패: " + error.message);
    } else if (data) {
      setPipelines([...pipelines, data[0]]);
      setPipelineForm({ client_id: null, client_name: '', details: '', amount: '', date: getLocalString(new Date(Date.now() + 86400000 * 3)) });
    }
  };

  // ⭐️ 5. 파이프라인 실제 DB 삭제 로직
  const handleDeletePipeline = async (id: number) => {
    if(!confirm("리스트에서 완전히 삭제하시겠습니까?")) return;
    
    const { error } = await supabase.from('sales_pipelines').delete().eq('id', id);
    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      setPipelines(pipelines.filter(p => p.id !== id));
    }
  };

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

      {(!isManager || activeTab === 'personal') && (
        <div className="flex flex-col gap-6 w-full shrink-0 lg:h-[calc(100vh-190px)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">
          
          {/* <div className="bg-white border border-indigo-200 rounded-2xl shadow-sm p-5 shrink-0 flex flex-col min-h-[450px] overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="font-black text-indigo-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" /> 계약 진행 파이프라인
              </h3>
              <Link href="/daily-closing" className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 일일 마감 보고 작성하기
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="고객 이름 검색/입력" 
                  value={pipelineForm.client_name} 
                  onChange={(e) => setPipelineForm({ ...pipelineForm, client_name: e.target.value, client_id: null })}
                  onFocus={() => setShowClientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                  className="w-full text-sm p-2.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                />
                {showClientDropdown && pipelineForm.client_name && (
                  <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    {clientsList.filter(c => c.name.includes(pipelineForm.client_name)).map(c => (
                      <li key={c.id} onClick={() => setPipelineForm({ ...pipelineForm, client_name: c.name, client_id: c.id })} className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer">{c.name}</li>
                    ))}
                  </ul>
                )}
              </div>
              <input type="text" placeholder="계약 내용 (예: 종신 10만)" value={pipelineForm.details} onChange={(e) => setPipelineForm({...pipelineForm, details: e.target.value})} className="w-full text-sm p-2.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-400" />
              <input type="text" placeholder="예상 금액" value={pipelineForm.amount} onChange={handleAmountChange} className="w-full text-sm p-2.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 font-bold text-indigo-700" />
              <input type="date" value={pipelineForm.date} onChange={(e) => setPipelineForm({...pipelineForm, date: e.target.value})} className="w-full text-sm p-2.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-gray-600" />
              <button onClick={handleAddPipeline} className="bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"><Plus className="w-4 h-4"/> 리스트 추가</button>
            </div>

            <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col flex-1 overflow-x-auto min-w-[800px]">
              <div className="flex bg-slate-50 border-b border-slate-200 shrink-0">
                <div className="w-[280px] shrink-0 border-r border-slate-200 p-3 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-500">계약별 진행 현황</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setTimelineOffset(p => p - 1)} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer"><ChevronLeft className="w-4 h-4 text-slate-500"/></button>
                    <button onClick={() => setTimelineOffset(0)} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm text-slate-600 hover:text-indigo-600 cursor-pointer">오늘</button>
                    <button onClick={() => setTimelineOffset(p => p + 1)} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer"><ChevronRight className="w-4 h-4 text-slate-500"/></button>
                  </div>
                </div>
                
                <div className="flex-1 grid" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                  {timelineDays.map((d, i) => {
                    const isToday = d.getTime() === today.getTime();
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <div key={i} className={`flex flex-col items-center justify-center py-2 border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-indigo-50 text-indigo-700' : isWeekend ? 'text-rose-400' : 'text-slate-500'}`}>
                        <span className="text-[10px] font-bold">{['일','월','화','수','목','금','토'][d.getDay()]}</span>
                        <span className={`text-xs font-black mt-0.5 ${isToday ? 'bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full' : ''}`}>{d.getDate()}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[350px] relative pb-4">
                <div className="flex border-b border-slate-200 bg-slate-50/80 relative z-20">
                  <div className="w-[280px] shrink-0 border-r border-slate-200 p-3 relative flex items-start pt-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-[13px] text-slate-800 flex items-center gap-1.5"><Edit3 className="w-4 h-4 text-emerald-600"/> 일일 활동 / 마감 내역</span>
                      <span className="text-[10px] text-slate-500 font-medium break-keep">일일마감에서 작성한 업무일지와 일정이 달력 하단에 표시됩니다.</span>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                      {timelineDays.map((d, i) => (
                        <div key={i} className={`border-r border-slate-200/60 h-full ${d.getTime() === today.getTime() ? 'bg-indigo-50/50' : ''}`}></div>
                      ))}
                    </div>
                    <div className="relative z-10 grid h-full" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                      {timelineDays.map((d, i) => {
                        const dateStr = getLocalString(d); 
                        const daySchedules = schedules.filter(s => s.schedule_date === dateStr);
                        return (
                          <div key={i} className="p-1.5 flex flex-col gap-1.5 min-h-[70px]">
                            {daySchedules.map(sch => (
                              <div key={sch.id} className="bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-1.5 shadow-sm flex flex-col hover:bg-emerald-100 transition-colors group/tag cursor-pointer">
                                <span className="text-[10px] font-black text-emerald-800 truncate leading-tight flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                  {sch.title || sch.content}
                                </span>
                                {sch.description && <span className="text-[9px] text-emerald-600/90 truncate leading-tight mt-1 pl-2.5">{sch.description}</span>}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {pipelines.sort((a,b) => parseLocalDate(a.expected_date).getTime() - parseLocalDate(b.expected_date).getTime()).map(p => {
                  const pStart = p.created_at ? parseLocalDate(p.created_at) : today; 
                  const pEnd = parseLocalDate(p.expected_date); 
                  
                  const pStartMs = pStart.getTime();
                  const pEndMs = pEnd.getTime();
                  const tlStartMs = timelineStart.getTime();
                  const tlEndMs = tlStartMs + TOTAL_TIMELINE_MS;

                  const isOutOfView = pEndMs < tlStartMs || pStartMs >= tlEndMs;
                  const barStart = Math.max(pStartMs, tlStartMs);
                  const barEnd = Math.min(pEndMs + 86400000, tlEndMs); 

                  const leftPercent = ((barStart - tlStartMs) / TOTAL_TIMELINE_MS) * 100;
                  const widthPercent = ((barEnd - barStart) / TOTAL_TIMELINE_MS) * 100;

                  const totalDuration = pEndMs - pStartMs + 86400000;
                  const passedDuration = today.getTime() - pStartMs + 86400000;
                  let progress = (passedDuration / totalDuration) * 100;
                  if (progress < 0) progress = 0;
                  if (progress > 100) progress = 100;
                  
                  const statusColor = p.status === '계약' || p.status === '증권 전달' ? 'bg-emerald-100 text-emerald-700' : p.status === '거절' ? 'bg-rose-100 text-rose-700' : p.status === '보류' || p.status === '미진행' ? 'bg-gray-200 text-gray-700' : 'bg-indigo-100 text-indigo-700';

                  return (
                    <div key={p.id} className="flex border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors group">
                      
                      <div className="w-[280px] shrink-0 border-r border-slate-100 p-3 relative z-20 bg-white group-hover:bg-slate-50/50">
                        <button onClick={() => handleDeletePipeline(p.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-3.5 h-3.5"/></button>
                        <div className="flex items-center gap-1.5 mb-1.5 pr-4">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${statusColor}`}>{p.status}</span>
                          <span className="font-bold text-sm text-slate-800">{p.client_name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mb-1.5 pr-4">{p.contract_details}</p>
                        <div className="flex justify-between items-center pr-4 mt-auto">
                          <p className="text-xs font-black text-indigo-600">{p.expected_amount.toLocaleString()}원</p>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">{totalDuration / 86400000}일 소요</span>
                        </div>
                      </div>

                      <div className="flex-1 relative">
                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                          {timelineDays.map((d, i) => (
                            <div key={i} className={`border-r border-slate-100/50 h-full ${d.getTime() === today.getTime() ? 'bg-indigo-50/30' : ''}`}></div>
                          ))}
                        </div>

                        {!isOutOfView && (
                          <div className="absolute top-[60%] -translate-y-1/2 h-5 z-10" style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}>
                            <div className={`w-full h-full bg-slate-200 overflow-hidden relative shadow-sm border border-slate-300/50 flex items-center
                              ${pStartMs < tlStartMs ? 'rounded-r-md border-l-0' : 'rounded-l-md'}
                              ${pEndMs >= tlEndMs ? 'rounded-l-md border-r-0' : 'rounded-r-md'}
                              ${pStartMs >= tlStartMs && pEndMs < tlEndMs ? 'rounded-md' : ''}
                            `}>
                              <div className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}>
                                <div className="absolute inset-0 bg-white/10 w-full -skew-x-12 translate-x-2"></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {p.history && p.history.map((h: any, idx: number) => {
                          const hTime = parseLocalDate(h.date).getTime();
                          if (hTime < tlStartMs || hTime >= tlEndMs) return null;
                          
                          const hLeft = ((hTime - tlStartMs + 43200000) / TOTAL_TIMELINE_MS) * 100;
                          
                          let tagClass = "bg-white text-slate-600 border-slate-300";
                          let dotClass = "border-slate-400";
                          if (h.status.includes('거절')) { tagClass = "bg-rose-50 text-rose-700 border-rose-300"; dotClass = "border-rose-500"; }
                          else if (h.status.includes('보류') || h.status.includes('미진행')) { tagClass = "bg-gray-100 text-gray-700 border-gray-300"; dotClass = "border-gray-500"; }
                          else if (h.status.includes('계약') || h.status.includes('증권')) { tagClass = "bg-emerald-50 text-emerald-700 border-emerald-300"; dotClass = "border-emerald-500"; }
                          else if (h.status.includes('픽스')) { tagClass = "bg-indigo-50 text-indigo-700 border-indigo-300"; dotClass = "border-indigo-500"; }

                          return (
                            <div key={idx} className="absolute z-20 flex flex-col items-center top-[60%] -translate-y-1/2" style={{ left: `${hLeft}%`, transform: 'translate(-50%, -50%)' }}>
                              <div className={`absolute bottom-full mb-1 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-black shadow-sm border ${tagClass} z-10`}>
                                {h.status}
                              </div>
                              <div className={`w-2.5 h-2.5 rounded-full bg-white border-[2.5px] shadow-sm mt-3 relative z-0 ${dotClass}`}></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                })}
                {pipelines.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-sm text-slate-400 font-bold">진행 중인 계약 내역이 없습니다.</div>
                )}
              </div>
            </div>
          </div> */}

          {/* 기존 3분할 대시보드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 lg:h-[calc(100vh-620px)] min-h-[400px]">
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

            <div className="lg:col-start-2 lg:col-span-2 lg:row-start-2 lg:row-span-1 h-[300px] lg:h-full bg-white border border-blue-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> 진행 중 계약
                </h3>
                <div className="flex items-center gap-2 text-sm bg-white border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-gray-500 font-semibold text-xs">합산 월납액</span>
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

            <div className="lg:col-start-2 lg:col-span-2 lg:row-start-3 lg:row-span-1 h-[400px] lg:h-full bg-white border border-emerald-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 체결 완료 현황
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                  <div className="flex flex-col items-end bg-emerald-600 text-white border border-emerald-700 px-3 py-1.5 rounded-lg shadow-sm flex-1 xl:flex-none relative overflow-hidden">
                    <span className="text-[10px] text-emerald-100 font-bold mb-0.5">이번달 ({getMonthString(0).slice(5)}월)</span>
                    <span className="font-black text-white text-sm flex items-center gap-1">
                      {formatMoney(monthlyStats.thisMonth)} <TrendingUp className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-emerald-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {(() => {
                  const safeTarget = myTargetAmount > 0 ? myTargetAmount : 1;
                  const myAchievementRate = Math.min(100, Math.round((monthlyStats.thisMonth / safeTarget) * 100)) || 0;
                  
                  return (
                    <div className="flex flex-col gap-2 mb-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between gap-4">
                        <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm shrink-0 whitespace-nowrap">이번 달 달성률</span>
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
                    </div>
                  );
                })()}
                {completed.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {completed.map(ins => (
                      <li key={ins.id} className="flex justify-between items-center p-3 hover:bg-emerald-50/30 rounded-xl border border-gray-100 transition-colors group">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-sm text-gray-900 truncate">{ins.clientName}</p>
                          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" /> {ins.subscription_date} 체결
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-sm font-black text-gray-700">{formatMoney(ins.monthly_premium)}</p>
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
      )}
    </div>
  );
}