// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Car, FileText, CheckCircle2, ChevronLeft,
  ChevronRight, Calendar, Clock, Loader2, TrendingUp, Users, Gift, Bell, Presentation, Kanban, UserPlus, X, Plus, BarChart3, Edit3, DollarSign
} from "lucide-react";
import PushSubscribeButton from '@/components/PushSubscribeButton';

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

// ⭐️ 진행 상태(Status)에 따라 색상을 통일되게 입혀주는 함수 추가
const getStatusColor = (status: string | undefined) => {
  if (!status) return "bg-slate-50 text-slate-500 border-slate-200";
  // ⭐️ 미진행: 눈에 띄지 않게 흐리게
  if (status.includes("미진행")) return "bg-slate-50 text-slate-400 border-slate-200 font-medium";
  if (status.includes("거절")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (status.includes("보류")) return "bg-gray-100 text-gray-500 border-gray-200";
  if (status.includes("계약") || status.includes("증권") || status.includes("청약 완료")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status.includes("픽스") || status.includes("TA")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (status.includes("진행") || status.includes("작성") || status.includes("비교")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [agentId, setAgentId] = useState<number | null>(null);
  const [currentAgentName, setCurrentAgentName] = useState("");
  const [activeTab, setActiveTab] = useState<'personal' | 'team'>('personal');
  const [completedTab, setCompletedTab] = useState<0 | 1 | 2>(0); 
  const [animateBar, setAnimateBar] = useState(false);
  
  const [oldClients, setOldClients] = useState<any[]>([]);
  const [sangryungClients, setSangryungClients] = useState<any[]>([]);
  const [autoRenewals, setAutoRenewals] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({ thisMonth: 0, lastMonth: 0, twoMonthsAgo: 0 });
  const [myTargetAmount, setMyTargetAmount] = useState(800000); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [isManager, setIsManager] = useState(false);
  const [teamContractsByAgent, setTeamContractsByAgent] = useState<any[]>([]);

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

  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ client_name: '', contract_details: '', expected_amount: '', expected_date: '' });

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

      const [clientsRes, insRes, pipelineRes] = await Promise.all([
        supabase.from("clients").select("*").eq("agent_id", myAgentId),
        supabase.from("subscription_insurance").select("*").eq("agent_name", myName),
        supabase.from("sales_pipelines").select("*").eq("agent_id", myAgentId) 
      ]);

      const myClients = clientsRes.data || [];
      setClientsList(myClients);
      setPipelines((pipelineRes.data || []).filter(p => !["계약", "거절", "증권 전달"].includes(p.status)));

      const myInsurances = insRes.data || [];
      const myClientIds = myClients.map(c => Number(c.id));
      const clientMap = new Map(myClients.map(c => [Number(c.id), c.name]));

      const orFilter = myClientIds.length > 0 
        ? `agent_id.eq.${myAgentId},client_id.in.(${myClientIds.join(',')})` 
        : `agent_id.eq.${myAgentId}`;

      const { data: mySchedulesData } = await supabase
        .from("schedules")
        .select("*")
        .or(orFilter)
        .order("date", { ascending: false })
        .limit(1000);

      const mySchedules = mySchedulesData || [];
      setSchedules(mySchedules);
      
      const generatedNotis: any[] = [];

      const retouchList = myClients
        .map(c => {
          const clientInsurances = myInsurances.filter(ins => Number(ins.client_id) === Number(c.id));
          const clientSchedules = mySchedules.filter(sch => Number(sch.client_id) === Number(c.id));
          const insDates = clientInsurances.map(i => new Date(i.created_at || 0).getTime());
          const schDates = clientSchedules.map(s => new Date(s.date || s.created_at || 0).getTime()); 
          const allDates = [new Date(c.created_at || 0).getTime(), ...insDates, ...schDates];
          const lastUpdate = new Date(Math.max(...allDates)); 
          const daysSinceUpdate = Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
          return { ...c, lastUpdate, daysSinceUpdate };
        })
        .filter(c => c.daysSinceUpdate >= 60) 
        .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate); 

      setOldClients(retouchList);

      const sangryungList = myClients
        .map(c => {
          const dDay = calculateSangryungDDay(c.birth_date);
          return { ...c, dDay };
        })
        .filter(c => c.dDay !== null && c.dDay >= 0 && c.dDay <= 30)
        .sort((a, b) => (a.dDay || 0) - (b.dDay || 0));
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
        .filter(ins => ins.product_name && (ins.product_name.includes("자동차") || ins.product_name.includes("다이렉트")) && ins.maturity_date)
        .map(ins => ({ 
          ...ins, 
          dDay: calculateDDay(ins.maturity_date), 
          clientName: clientMap.get(Number(ins.client_id)) || ins.contractor_name 
        }))
        .filter(ins => ins.dDay !== null && ins.dDay >= 1 && ins.dDay <= 60)
        .sort((a, b) => (a.dDay || 0) - (b.dDay || 0));
      setAutoRenewals(autoList);

      const thisMonthStr = getMonthString(0);
      const lastMonthStr = getMonthString(1);
      const twoMonthsAgoStr = getMonthString(2);
      let statThisMonth = 0, statLastMonth = 0, statTwoMonthsAgo = 0;

      const completedPolicies = myInsurances
        .filter(ins => ins.policy_status === "maintain" && ins.subscription_date)
        .map(ins => {
          let cleanSubDate = ins.subscription_date!.replace(/\./g, '-').replace(/\s/g, '');
          if (cleanSubDate.endsWith('-')) cleanSubDate = cleanSubDate.slice(0, -1);

          let tabIndex = -1;
          if (cleanSubDate.startsWith(thisMonthStr)) { tabIndex = 0; statThisMonth += (ins.monthly_premium || 0); }
          else if (cleanSubDate.startsWith(lastMonthStr)) { tabIndex = 1; statLastMonth += (ins.monthly_premium || 0); }
          else if (cleanSubDate.startsWith(twoMonthsAgoStr)) { tabIndex = 2; statTwoMonthsAgo += (ins.monthly_premium || 0); }
          
          return { ...ins, clientName: clientMap.get(Number(ins.client_id)) || ins.contractor_name, tabIndex };
        })
        .filter(ins => ins.tabIndex !== -1)
        .sort((a, b) => new Date(b.subscription_date || 0).getTime() - new Date(a.subscription_date || 0).getTime());

      setCompleted(completedPolicies);
      setMonthlyStats({ thisMonth: statThisMonth, lastMonth: statLastMonth, twoMonthsAgo: statTwoMonthsAgo });

      if (managerAuth && myAgencyId) {
        const { data: members } = await supabase.from("agents").select("id, name, rank, monthly_target").eq("agency_id", myAgencyId);
        
        if (members && members.length > 0) {
          const memberIds = members.map(m => m.id);
          const memberNames = members.map(m => m.name);

          const [tClientsRes, tInsRes, tPipelinesRes] = await Promise.all([
             supabase.from("clients").select("*, agents(name)").in("agent_id", memberIds),
             supabase.from("subscription_insurance").select("*").in("agent_name", memberNames),
             supabase.from("sales_pipelines").select("*").in("agent_id", memberIds).not('status', 'in', '("계약","거절","증권 전달")')
          ]);

          const tClients = tClientsRes.data || [];
          const tIns = tInsRes.data || [];
          const tPipelines = tPipelinesRes.data || [];
          
          const sortedMembers = [...members].sort((a, b) => {
            const aIsSM = (a.rank || '').toUpperCase().includes('SM');
            const bIsSM = (b.rank || '').toUpperCase().includes('SM');
            if (aIsSM && !bIsSM) return -1;
            if (!aIsSM && bIsSM) return 1;
            return a.name.localeCompare(b.name, 'ko-KR');
          });
          
          const tCont = tIns
             .filter(ins => ins.policy_status === "new" || ins.policy_status === "maintain")
             .map(ins => {
                const isCompleted = ins.policy_status === "maintain";
                let dateStr = isCompleted ? ins.subscription_date : (ins.created_at ? ins.created_at.slice(0, 10) : '-');
                if (!dateStr) dateStr = '-';
                const cName = tClients.find(c => Number(c.id) === Number(ins.client_id))?.name || ins.contractor_name;
                return { ...ins, isCompleted, dateStr, clientName: cName };
             });

          const groupedContracts = sortedMembers.map(member => {
            const memberContracts = tCont.filter(ins => ins.agent_name === member.name && ins.dateStr.replace(/\./g, '-').replace(/\s/g, '').startsWith(thisMonthStr)).sort((a, b) => new Date(b.dateStr === '-' ? 0 : b.dateStr).getTime() - new Date(a.dateStr === '-' ? 0 : a.dateStr).getTime());
            const memberPipes = tPipelines.filter(p => p.agent_id === member.id).sort((a, b) => parseLocalDate(a.expected_date).getTime() - parseLocalDate(b.expected_date).getTime());
            
            const inProgressAmt = memberContracts.filter(i => !i.isCompleted).reduce((sum, i) => sum + (i.monthly_premium || 0), 0) + 
                                  memberPipes.reduce((sum, p) => sum + ((p.expected_date === '9999-12-31' || p.status === '보류') ? 0 : (p.expected_amount || 0)), 0);
            
            const completedAmt = memberContracts.filter(i => i.isCompleted).reduce((sum, i) => sum + (i.monthly_premium || 0), 0);

            return {
                agentName: member.name,
                rank: member.rank,
                targetAmount: member.monthly_target || 800000, 
                inProgressAmount: inProgressAmt,
                completedAmount: completedAmt,
                contracts: memberContracts,
                pipelines: memberPipes
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

  const totalPipelineAmount = pipelines.reduce((sum, p) => sum + ((p.expected_date === '9999-12-31' || p.status === '보류') ? 0 : (p.expected_amount || 0)), 0);

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

  const handleDeletePipeline = async (id: number) => {
    if(!confirm("리스트에서 완전히 삭제하시겠습니까?")) return;
    
    const { error } = await supabase.from('sales_pipelines').delete().eq('id', id);
    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      setPipelines(pipelines.filter(p => p.id !== id));
    }
  };

  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) setEditForm({ ...editForm, expected_amount: '' });
    else setEditForm({ ...editForm, expected_amount: Number(val).toLocaleString() });
  };

  const handleSaveEdit = async (id: number) => {
    const amountNum = Number(editForm.expected_amount.replace(/,/g, ''));
    if (!editForm.client_name || !editForm.contract_details || !editForm.expected_date) {
      return alert("모든 항목을 입력해주세요.");
    }
    
    const updatePayload = {
      client_name: editForm.client_name,
      contract_details: editForm.contract_details,
      expected_amount: amountNum,
      expected_date: editForm.expected_date,
    };
    
    const { error } = await supabase.from('sales_pipelines').update(updatePayload).eq('id', id);
    if (error) {
      alert("수정 실패: " + error.message);
    } else {
      setPipelines(pipelines.map(p => p.id === id ? { ...p, ...updatePayload } : p));
      setEditingPipelineId(null);
    }
  };

  const handleTargetChange = async () => {
    if (!agentId) return;
    const input = prompt("이번 달 목표액(월납)을 숫자로만 입력해주세요.", String(myTargetAmount));
    if (input && !isNaN(Number(input))) {
      const newTarget = Number(input);
      try {
        const { error } = await supabase.from('agents').update({ monthly_target: newTarget }).eq('id', agentId);
        if (error) throw error;
        setMyTargetAmount(newTarget);
      } catch (error: any) {
        alert("목표 금액 변경 실패: " + error.message);
      }
    }
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

  const filteredCompleted = completed.filter(c => c.tabIndex === completedTab);
  const currentTabTotalAmount = filteredCompleted.reduce((sum, item) => sum + (item.monthly_premium || 0), 0);

  const totalTeamInProgress = teamContractsByAgent.reduce((sum, m) => sum + m.inProgressAmount, 0);
  const totalTeamCompleted = teamContractsByAgent.reduce((sum, m) => sum + m.completedAmount, 0);

  return (
    <div className="w-full max-w-[1500px] mx-auto p-4 md:p-8 bg-gray-50/50 min-h-screen flex flex-col">
      <div className="flex justify-between items-end mb-4 relative shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Presentation className="w-5 h-5 text-blue-600" />영업 현황 보드</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            <strong className="text-blue-600">{currentAgentName}</strong> 님의 오늘 챙겨야 할 핵심 업무 현황입니다.
          </p>
        </div>
      </div>

      {/* ⭐️ 모바일용 최상단 목표/합산액 박스 */}
      <div className="sm:hidden flex flex-col gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-600">이번 달 영업 목표</span>
          <button onClick={handleTargetChange} className="text-sm font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors">
            {myTargetAmount.toLocaleString()}원 <Edit3 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-xs font-bold text-slate-600">진행 파이프라인 합산</span>
          <span className="text-sm font-black text-indigo-700">{totalPipelineAmount.toLocaleString()}원</span>
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
        <div className="flex flex-col gap-6 w-full">
          
          <div className="block sm:hidden">
            <PushSubscribeButton />
          </div>

          <div className="bg-white border border-indigo-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-3 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                
                <h3 className="font-black text-indigo-900 flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center gap-1.5"><BarChart3 className="w-5 h-5 text-indigo-600" /> 현재 진행 사항</div>
                  <Link href="/daily-closing" className="sm:hidden bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                    마감 작성
                  </Link>
                </h3>
                
                <div className="hidden sm:flex items-center bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm shrink-0">
                  <span className="text-[11px] font-bold text-indigo-500 mr-2">목표 설정</span>
                  <button onClick={handleTargetChange} className="text-sm font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors border-r border-indigo-200 pr-3 mr-3">
                    {myTargetAmount.toLocaleString()} <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-indigo-500 mr-2">예상 합산</span>
                  <span className="text-sm font-black text-indigo-700">{totalPipelineAmount.toLocaleString()}원</span>
                </div>
              </div>

              <Link href="/daily-closing" className="hidden sm:flex bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors items-center gap-1 shadow-sm shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 일일 마감 보고 작성
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
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
              
              <div className="flex items-center gap-2 w-full text-sm rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100">
                <input type="date" value={pipelineForm.date === '9999-12-31' ? '' : pipelineForm.date} disabled={pipelineForm.date === '9999-12-31'} onChange={(e) => setPipelineForm({...pipelineForm, date: e.target.value})} className="w-full outline-none text-gray-600 disabled:opacity-50 bg-transparent" />
                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 cursor-pointer shrink-0 border-l border-slate-200 pl-2">
                  <input type="checkbox" checked={pipelineForm.date === '9999-12-31'} onChange={(e) => setPipelineForm({...pipelineForm, date: e.target.checked ? '9999-12-31' : getLocalString(new Date(Date.now() + 86400000 * 3))})} className="cursor-pointer" />
                  보류
                </label>
              </div>

              <button onClick={handleAddPipeline} className="min-h-[42px] sm:min-h-[32px] sm:col-span-2 md:col-span-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"><Plus className="w-4 h-4"/> 리스트 추가</button>
            </div>

            <div className="w-full overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
              <div className="min-w-[1000px] flex flex-col relative">
                
                <div className="sticky top-0 z-40 flex bg-slate-50 border-b border-slate-200 shadow-sm">
                  <div className="w-[280px] shrink-0 border-r border-slate-200 p-3 flex items-center justify-between bg-slate-50">
                    <span className="font-bold text-xs text-slate-500">계약별 진행 현황</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setTimelineOffset(p => p - 1)} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer"><ChevronLeft className="w-4 h-4 text-slate-500"/></button>
                      <button onClick={() => setTimelineOffset(0)} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm text-slate-600 hover:text-indigo-600 cursor-pointer">오늘</button>
                      <button onClick={() => setTimelineOffset(p => p + 1)} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer"><ChevronRight className="w-4 h-4 text-slate-500"/></button>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid bg-slate-50" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                    {timelineDays.map((d, i) => {
                      const isToday = d.getTime() === today.getTime();
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <div key={i} className={`flex flex-col items-center justify-center py-2 border-r border-slate-200 last:border-r-0 ${isToday ? 'bg-indigo-50 text-indigo-700' : isWeekend ? 'text-rose-400' : 'text-slate-500'}`}>
                          <span className="text-[10px] font-bold">{['일','월','화','수','목','금','토'][d.getDay()]}</span>
                          <span className={`text-xs font-black mt-0.5 ${isToday ? 'bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-sm' : ''}`}>{d.getDate()}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-col relative pb-4">
                  <div className="flex border-b border-slate-200 bg-slate-50/80 relative z-20">
                    <div className="w-[280px] shrink-0 border-r border-slate-200 p-3 relative flex items-start pt-4 bg-slate-50/80">
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-[13px] text-slate-800 flex items-center gap-1.5"><Edit3 className="w-4 h-4 text-emerald-600"/> 활동 내역</span>
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
                          const daySchedules = schedules
                            .filter(s => s.date === dateStr)
                            .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
                            
                          return (
                            <div key={i} className="p-1.5 flex flex-col gap-1.5">
                              {daySchedules.map(sch => {
                                const client = sch.client_id ? clientsList.find(c => Number(c.id) === Number(sch.client_id)) : null;
                                const displayTitle = (sch.category || '일정');
                                
                                return (
                                  <div key={sch.id} className="bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-1.5 shadow-sm flex flex-col hover:bg-emerald-100 transition-colors group/tag cursor-pointer">
                                    <span className="text-[10px] font-black text-emerald-800 truncate leading-tight flex items-center gap-1 mb-0.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                      {displayTitle}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {pipelines.sort((a,b) => parseLocalDate(a.expected_date).getTime() - parseLocalDate(b.expected_date).getTime()).map(p => {
                    const pStart = p.created_at ? parseLocalDate(p.created_at) : today; 
                    const pStartMs = pStart.getTime();
                    const pEndMs = Math.max(pStartMs, today.getTime()); 
                    
                    const tlStartMs = timelineStart.getTime();
                    const tlEndMs = tlStartMs + TOTAL_TIMELINE_MS;

                    const isOutOfView = pEndMs < tlStartMs || pStartMs >= tlEndMs;
                    const barStart = Math.max(pStartMs, tlStartMs);
                    const barEnd = Math.min(pEndMs + 86400000, tlEndMs); 

                    const leftPercent = ((barStart - tlStartMs) / TOTAL_TIMELINE_MS) * 100;
                    const widthPercent = ((barEnd - barStart) / TOTAL_TIMELINE_MS) * 100;

                    const progress = 100;
                    
                    // ⭐️ 상태값 기반 컬러 시스템 연동
                    const statusColor = getStatusColor(p.status);
                    const isHold = p.expected_date === '9999-12-31' || p.status === '보류';

                    return (
                      <div key={p.id} className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                        
                        <div className="w-[280px] shrink-0 border-r border-slate-100 p-3 relative z-20 bg-white group-hover:bg-slate-50/50">
                          
                          {editingPipelineId === p.id ? (
                            <div className="flex flex-col gap-2 p-1">
                              <input type="text" value={editForm.client_name} onChange={e => setEditForm({...editForm, client_name: e.target.value})} className="border border-indigo-200 p-1.5 text-xs rounded outline-none focus:ring-1 focus:ring-indigo-400 font-bold" placeholder="고객명"/>
                              <input type="text" value={editForm.contract_details} onChange={e => setEditForm({...editForm, contract_details: e.target.value})} className="border border-indigo-200 p-1.5 text-[11px] rounded outline-none focus:ring-1 focus:ring-indigo-400" placeholder="계약 내용"/>
                              <input type="text" value={editForm.expected_amount} onChange={handleEditAmountChange} className="border border-indigo-200 p-1.5 text-xs rounded outline-none focus:ring-1 focus:ring-indigo-400 font-bold text-indigo-600" placeholder="예상 금액"/>
                              
                              <div className="flex items-center gap-1.5">
                                <input type="date" value={editForm.expected_date === '9999-12-31' ? '' : editForm.expected_date} disabled={editForm.expected_date === '9999-12-31'} onChange={e => setEditForm({...editForm, expected_date: e.target.value})} className="flex-1 border border-indigo-200 p-1.5 text-xs rounded outline-none focus:ring-1 focus:ring-indigo-400 text-slate-600 disabled:bg-slate-50 disabled:opacity-50"/>
                                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 cursor-pointer shrink-0 bg-white border border-indigo-200 px-1.5 py-1.5 rounded">
                                  <input type="checkbox" checked={editForm.expected_date === '9999-12-31'} onChange={(e) => setEditForm({...editForm, expected_date: e.target.checked ? '9999-12-31' : getLocalString(new Date(Date.now() + 86400000 * 3))})} />
                                  보류
                                </label>
                              </div>
                              
                              <div className="flex gap-1.5 mt-1">
                                <button onClick={() => handleSaveEdit(p.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded cursor-pointer transition-colors shadow-sm">저장</button>
                                <button onClick={() => setEditingPipelineId(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-1.5 rounded cursor-pointer transition-colors shadow-sm">취소</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => {
                                setEditingPipelineId(p.id);
                                setEditForm({
                                  client_name: p.client_name,
                                  contract_details: p.contract_details,
                                  expected_amount: p.expected_amount.toLocaleString(),
                                  expected_date: p.expected_date
                                });
                              }} className="absolute top-3 right-8 text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Edit3 className="w-3.5 h-3.5"/>
                              </button>
                              <button onClick={() => handleDeletePipeline(p.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <X className="w-3.5 h-3.5"/>
                              </button>
                              
                              <div className="flex items-center gap-1.5 mb-1.5 pr-4">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded shadow-sm whitespace-nowrap ${statusColor}`}>{p.status}</span>
                                <span className="font-bold text-sm text-slate-800 truncate">{p.client_name}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mb-1.5 pr-4">{p.contract_details}</p>
                              
                              <div className="flex justify-between items-center pr-4 mt-auto">
                                <p className={`text-xs font-black ${isHold ? 'text-slate-400 line-through decoration-slate-300' : 'text-indigo-600'}`}>{p.expected_amount.toLocaleString()}원</p>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                  {p.expected_date === '9999-12-31' ? '일정 보류' : `${p.expected_date.slice(5).replace('-', '/')} 예정`}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex-1 relative">
                          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                            {timelineDays.map((d, i) => (
                              <div key={i} className={`border-r border-slate-100/50 h-full ${d.getTime() === today.getTime() ? 'bg-indigo-50/30' : ''}`}></div>
                            ))}
                          </div>

                          {!isOutOfView && (
                            <div className="absolute top-[60%] -translate-y-1/2 h-5 z-10" style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}>
                              <div className={`w-full h-full bg-slate-200 overflow-hidden relative shadow-sm flex items-center border border-slate-300/50
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
                            
                            // ⭐️ 타임라인 도트 및 히스토리 툴팁 색상 연동
                            let tagClass = getStatusColor(h.status);
                            let dotClass = "border-slate-400";
                            if (h.status.includes('거절')) dotClass = "border-rose-500";
                            else if (h.status.includes('보류') || h.status.includes('미진행')) dotClass = "border-slate-300";
                            else if (h.status.includes('계약') || h.status.includes('증권') || h.status.includes('청약 완료')) dotClass = "border-emerald-500";
                            else if (h.status.includes('픽스') || h.status.includes('TA')) dotClass = "border-indigo-500";
                            else dotClass = "border-blue-500";

                            return (
                              <div key={idx} className="absolute z-20 flex flex-col items-center top-[60%] -translate-y-1/2" style={{ left: `${hLeft}%`, transform: 'translate(-50%, -50%)' }}>
                                <div className={`absolute bottom-full mb-1 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm border ${tagClass} z-10`}>
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
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-emerald-100 pb-3 gap-3">
              <h3 className="font-black text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 체결 완료 현황
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <div className="flex items-center gap-2 text-sm bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-emerald-700 font-bold text-xs">선택월 합산</span>
                    <span className="font-black text-emerald-700">{formatMoney(currentTabTotalAmount)}</span>
                  </div>
                  <button 
                    onClick={() => setCompletedTab(0)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 cursor-pointer sm:flex-none ${completedTab === 0 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                  >
                    당월
                  </button>
                  <button 
                    onClick={() => setCompletedTab(1)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 cursor-pointer sm:flex-none ${completedTab === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                  >
                    전월
                  </button>
                  <button 
                    onClick={() => setCompletedTab(2)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 cursor-pointer sm:flex-none ${completedTab === 2 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                  >
                    전전월
                  </button>
                </div>
              </div>
            </div>
            
            <div className="w-full overflow-x-auto border sm:border-none border-slate-200 rounded-xl sm:rounded-none">
              {filteredCompleted.length > 0 ? (
                <table className="w-full min-w-[700px] text-left text-sm text-slate-600">
                  <thead className="bg-emerald-50/50 text-emerald-800 text-[11px] font-black uppercase border-b border-emerald-100">
                    <tr>
                      <th className="px-4 py-3 w-[15%]">고객명</th>
                      <th className="px-4 py-3 w-[20%]">보험사</th>
                      <th className="px-4 py-3 w-[30%]">상품명</th>
                      <th className="px-4 py-3 w-[20%]">월납 보험료</th>
                      <th className="px-4 py-3 w-[15%]">체결일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {filteredCompleted.map(ins => (
                      <tr key={ins.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">{ins.clientName}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                          <span className="border border-slate-200 bg-white px-1.5 py-0.5 rounded shadow-sm">{ins.insurance_company}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-700">{ins.product_name}</td>
                        <td className="px-4 py-3 font-black text-blue-600 flex items-center gap-1"><DollarSign className="w-3 h-3"/>{formatMoney(ins.monthly_premium)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/>{ins.subscription_date}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8 opacity-20 mb-2" />
                  <span className="text-sm font-bold">선택하신 월에 체결된 내역이 없습니다.</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-rose-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
              <div className="bg-rose-50/80 p-4 border-b border-rose-100 flex justify-between items-center shrink-0 rounded-t-2xl">
                <div>
                  <h3 className="font-black text-rose-900 flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5 text-rose-500" /> 재터치 필요
                  </h3>
                  <p className="text-[10px] text-rose-600/80 font-bold mt-0.5">60일 이상 업데이트 없음</p>
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

            <div className="bg-white border border-purple-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
              <div className="bg-purple-50/80 p-4 border-b border-purple-100 flex justify-between items-center shrink-0 rounded-t-2xl">
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

            <div className="bg-white border border-amber-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
              <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex justify-between items-center shrink-0 rounded-t-2xl">
                <h3 className="font-bold text-amber-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-500" /> 자동차/다이렉트 갱신
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">만기 60일 이내</span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {autoRenewals.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-2">
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
                    <p className="text-xs font-semibold">다가오는 자동차/다이렉트 갱신건이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⭐️ 팀장용 '팀 관리 보드' 탭 */}
      {isManager && activeTab === 'team' && (
        <div className="flex flex-col gap-6 w-full">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 sm:p-5 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-lg font-black text-blue-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600"/> 팀 전체 실적 요약
              </h2>
              <p className="text-xs text-blue-700 font-bold mt-1">우리 팀의 진행 중인 현황과 이번 달 달성 금액입니다.</p>
            </div>
            <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-blue-100 rounded-xl shadow-sm flex-1 sm:flex-none">
                <span className="text-[10px] font-bold text-orange-500">진행 합산</span>
                <span className="font-black text-orange-600 text-base sm:text-lg">{formatMoney(totalTeamInProgress)}</span>
              </div>
              <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-blue-100 rounded-xl shadow-sm flex-1 sm:flex-none">
                <span className="text-[10px] font-bold text-emerald-600">이번 달 체결</span>
                <span className="font-black text-emerald-600 text-base sm:text-lg">{formatMoney(totalTeamCompleted)}</span>
              </div>
            </div>
          </div>

          {teamContractsByAgent.map(member => (
            <div key={member.agentName} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 mb-4 gap-3">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-500" /> {member.agentName} FC
                  </span>
                  {(member.rank || '').toUpperCase().includes('SM') && <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">팀장(SM)</span>}
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <span className="text-[11px] sm:text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 border border-orange-100 rounded flex-1 sm:flex-none text-center">진행 합산: {formatMoney(member.inProgressAmount)}</span>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-100 rounded flex-1 sm:flex-none text-center">체결 (당월): {formatMoney(member.completedAmount)}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-700 mb-2 border-l-2 border-indigo-500 pl-2">현재 진행 리스트</h4>
                {member.pipelines.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {member.pipelines.map((p: any) => {
                      const isHold = p.expected_date === '9999-12-31' || p.status === '보류';
                      return (
                        <div key={p.id} className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2 sm:gap-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                            <span className="font-bold text-slate-800 text-[13px] flex items-center gap-1.5 sm:w-32 shrink-0">
                              <span className="truncate max-w-[80px] sm:max-w-full">{p.client_name}</span>
                              <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded whitespace-nowrap ${getStatusColor(p.status)}`}>{p.status}</span>
                            </span>
                            <span className="text-xs text-slate-500 font-medium truncate sm:max-w-[250px]">{p.contract_details}</span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto shrink-0 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/50">
                            <span className="text-[11px] text-slate-500 font-bold bg-white px-2 py-1 border border-slate-200 rounded whitespace-nowrap">
                              {p.expected_date === '9999-12-31' ? '일정 보류' : `${p.expected_date.slice(5).replace('-', '/')} 예정`}
                            </span>
                            <span className={`font-black text-sm sm:w-28 text-right whitespace-nowrap ${isHold ? 'text-slate-400 line-through decoration-slate-300' : 'text-indigo-600'}`}>{formatMoney(p.expected_amount)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-400 py-2">진행 중인 계약이 없습니다.</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2 border-l-2 border-emerald-500 pl-2">이번 달 체결 리스트</h4>
                {member.contracts.filter((c: any) => c.isCompleted).length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {member.contracts.filter((c: any) => c.isCompleted).map((c: any) => (
                      <div key={c.id} className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2 sm:gap-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                          <span className="font-bold text-slate-800 text-[13px] flex items-center gap-1.5 sm:w-32 shrink-0">
                            <span className="truncate max-w-[80px] sm:max-w-full">{c.clientName}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-white border border-emerald-200 px-1.5 py-0.5 rounded whitespace-nowrap">{c.insurance_company}</span>
                          </span>
                          <span className="text-xs text-slate-500 font-medium truncate sm:max-w-[250px]">{c.product_name}</span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto shrink-0 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-emerald-200/50">
                          <span className="text-[11px] text-slate-500 font-bold bg-white px-2 py-1 border border-slate-200 rounded whitespace-nowrap">{c.dateStr} 체결</span>
                          <span className="font-black text-emerald-700 text-sm sm:w-28 text-right flex items-center justify-end gap-0.5 whitespace-nowrap"><DollarSign className="w-3.5 h-3.5"/>{formatMoney(c.monthly_premium)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-400 py-2">이번 달 체결 완료 내역이 없습니다.</p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}