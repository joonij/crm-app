// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Bell, Presentation, Loader2 } from "lucide-react";
import { parseLocalDate, calculateDDay, calculateSangryungDDay, getMonthString } from "./utils";
import PersonalBoard from "./components/PersonalBoard";
import TeamBoard from "./components/TeamBoard";
import BranchBoard from "./components/BranchBoard";
import { getSecureClientsData } from "@/app/actions/dashboard";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'team' | 'branch'>('personal');
  const [isManager, setIsManager] = useState(false);
  const [isBranchManager, setIsBranchManager] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [personalData, setPersonalData] = useState<any>({});
  const [teamData, setTeamData] = useState<any>({});
  const [branchData, setBranchData] = useState<any>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: agentData } = await supabase
        .from("agents")
        .select(`id, name, rank, agency_id, monthly_target, agencies(corporation_name, branch_name, team_number)`)
        .eq("auth_id", user.id).single();

      if (!agentData) return;

      const myName = agentData.name;
      const myAgentId = agentData.id;
      const myAgencyId = agentData.agency_id;
      const myTargetAmount = agentData.monthly_target || 800000; 

      const userRank = agentData.rank ? String(agentData.rank).toUpperCase() : "";
      const isTeamAuth = userRank.includes("SM") || userRank.includes("BM") || userRank.includes("RM");
      const isBranchAuth = userRank.includes("BM") || userRank.includes("RM") || userRank.includes("SM"); 
      setIsManager(isTeamAuth);
      setIsBranchManager(isBranchAuth);

      const agencyData = Array.isArray(agentData.agencies) ? agentData.agencies[0] : agentData.agencies;
      const myBranch = agencyData?.branch_name || "";

      // 1. 개인 데이터 페칭
      const processedClients = await getSecureClientsData(myAgentId);
      const myClients = processedClients; 
      const clientMap = new Map(myClients.map((c: any) => [Number(c.id), c.name]));
      const clientIdsStr = myClients.map((c: any) => c.id).join(',');

      const insOrFilter = clientIdsStr ? `agent_name.eq.${myName},client_id.in.(${clientIdsStr})` : `agent_name.eq.${myName}`;
      const schOrFilter = clientIdsStr ? `agent_id.eq.${myAgentId},client_id.in.(${clientIdsStr})` : `agent_id.eq.${myAgentId}`;

      const [insRes, pipelineRes, schedulesRes] = await Promise.all([
        supabase.from("subscription_insurance").select("*").or(insOrFilter),
        supabase.from("sales_pipelines").select("*").eq("agent_id", myAgentId).not('status', 'in', '("계약","거절","증권 전달")'),
        supabase.from("schedules").select("*").or(schOrFilter).order("date", { ascending: false }).limit(1000)
      ]);

      const myInsurances = insRes.data || [];
      const myPipelines = pipelineRes.data || [];
      const mySchedules = schedulesRes.data || [];

      // ⭐️ 개인 활동내역: 개인일정 및 팀일정만 필터링
      const filteredMySchedules = mySchedules.filter((s: any) => 
        s.schedule_type === "personal" || s.schedule_type === "team"
      );

      const generatedNotis: any[] = [];
      const retouchList = myClients.map((c: any) => {
        const insDates = myInsurances.filter((ins: any) => Number(ins.client_id) === Number(c.id)).map((i: any) => new Date(i.created_at || 0).getTime());
        const schDates = filteredMySchedules.filter((sch: any) => Number(sch.client_id) === Number(c.id)).map((s: any) => new Date(s.date || s.created_at || 0).getTime()); 
        const lastUpdate = new Date(Math.max(new Date(c.created_at || 0).getTime(), ...insDates, ...schDates)); 
        const daysSinceUpdate = Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
        return { ...c, lastUpdate, daysSinceUpdate };
      }).filter((c: any) => c.daysSinceUpdate >= 60).sort((a: any, b: any) => b.daysSinceUpdate - a.daysSinceUpdate); 

      const sangryungList = processedClients
        .map((c: any) => ({ ...c, dDay: calculateSangryungDDay(c.derivedBirthDate) }))
        .filter((c: any) => c.dDay !== null && c.dDay >= 0 && c.dDay <= 30)
        .sort((a: any, b: any) => (a.dDay || 0) - (b.dDay || 0));

      sangryungList.forEach((c: any) => generatedNotis.push({ id: `sangryung_${c.id}_${new Date().getFullYear()}` }));

      const autoList = myInsurances.filter((ins: any) => ins.product_name && (ins.product_name.includes("자동차") || ins.product_name.includes("다이렉트")) && ins.maturity_date)
        .map((ins: any) => ({ ...ins, dDay: calculateDDay(ins.maturity_date), clientName: clientMap.get(Number(ins.client_id)) || ins.contractor_name }))
        .filter((ins: any) => ins.dDay !== null && ins.dDay >= 1 && ins.dDay <= 60).sort((a: any, b: any) => (a.dDay || 0) - (b.dDay || 0));

      const thisMonthStr = getMonthString(0);
      const lastMonthStr = getMonthString(1);
      const twoMonthsAgoStr = getMonthString(2);

      const completedPolicies = myInsurances.filter((ins: any) => ins.policy_status === "maintain" && ins.subscription_date)
        .map((ins: any) => {
          let cleanSubDate = ins.subscription_date!.replace(/\./g, '-').replace(/\s/g, '');
          if (cleanSubDate.endsWith('-')) cleanSubDate = cleanSubDate.slice(0, -1);
          let tabIndex = -1;
          if (cleanSubDate.startsWith(thisMonthStr)) tabIndex = 0; 
          else if (cleanSubDate.startsWith(lastMonthStr)) tabIndex = 1; 
          else if (cleanSubDate.startsWith(twoMonthsAgoStr)) tabIndex = 2; 
          return { ...ins, clientName: clientMap.get(Number(ins.client_id)) || ins.contractor_name, tabIndex };
        }).filter((ins: any) => ins.tabIndex !== -1).sort((a: any, b: any) => new Date(b.subscription_date || 0).getTime() - new Date(a.subscription_date || 0).getTime());

      // ⭐️ 개인 연간 통계 계산 (장기/일반 분리)
      const currentYear = new Date().getFullYear();
      const myYearlyStats = Array.from({length: 12}, (_, i) => ({ 
        month: i+1, monthStr: `${currentYear}-${String(i+1).padStart(2, '0')}`, 
        amount: 0, longTermAmount: 0, generalAmount: 0, contractIds: [] as number[] 
      }));

      // ⭐️ 1W 3A 달성 현황 (이번주 일요일 ~ 토요일 기준 장기보험 체결 건수)
      const now = new Date();
      const currentDay = now.getDay(); // 0(일요일) ~ 6(토요일)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - currentDay);
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      const thisWeekLongTermContracts = completedPolicies.filter((ins: any) => {
        if (ins.insurance_type === '일반보험' || !ins.subscription_date) return false;
        const subDate = new Date(ins.subscription_date.replace(/\./g, '-'));
        return subDate >= startOfWeek && subDate <= endOfWeek;
      });

      // 이번주 요일별 장기보험 체결 카운트
      const weeklyCounts = [0, 0, 0, 0, 0, 0, 0]; // 일~토
      thisWeekLongTermContracts.forEach((ins: any) => {
         const dayIndex = new Date(ins.subscription_date.replace(/\./g, '-')).getDay();
         weeklyCounts[dayIndex]++;
      });

      completedPolicies.forEach((ins: any) => {
          let dateStr = ins.subscription_date || '-';
          const cleanDate = dateStr.replace(/\./g, '-').replace(/\s/g, '').slice(0, 7);
          const yMatch = myYearlyStats.find(y => y.monthStr === cleanDate);
          if (yMatch) {
              const amt = ins.monthly_premium || 0;
              yMatch.amount += amt;
              if (ins.insurance_type === '일반보험') yMatch.generalAmount += amt;
              else yMatch.longTermAmount += amt;
              yMatch.contractIds.push(ins.id);
          }
      });

      setPersonalData({ 
        agentId: myAgentId, currentAgentName: myName, myTargetAmount, 
        pipelines: myPipelines, schedules: filteredMySchedules, clientsList: myClients, 
        oldClients: retouchList, sangryungClients: sangryungList, autoRenewals: autoList, 
        completed: completedPolicies,
        yearlyStats: myYearlyStats,      // ⭐️ 추가
        weeklyCounts: weeklyCounts       // ⭐️ 추가
      });

      const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
      const unreadLocalCount = generatedNotis.filter(n => !readNotiIds.includes(n.id)).length;
      const { count: dbUnreadCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('agent_id', myAgentId).eq('is_read', false);
      setUnreadCount(unreadLocalCount + (dbUnreadCount || 0));

      // 2. 팀 관리 보드 데이터 세팅
      if (isTeamAuth && myAgencyId) {
        const { data: membersRaw } = await supabase.from("agents").select("id, name, rank, monthly_target").eq("agency_id", myAgencyId);
        if (membersRaw && membersRaw.length > 0) {
          const members = membersRaw.filter((m: any) => (m.rank || '').toUpperCase().trim() !== 'OS');
          const memberIds = members.map(m => m.id);
          const memberNames = members.map(m => m.name);
          const [tClientsRes, tInsRes, tPipelinesRes] = await Promise.all([
             supabase.from("clients").select("*, agents(name)").in("agent_id", memberIds),
             supabase.from("subscription_insurance").select("*").in("agent_name", memberNames),
             supabase.from("sales_pipelines").select("*").in("agent_id", memberIds).not('status', 'in', '("계약","거절","증권 전달")')
          ]);

          const tCont = (tInsRes.data || []).filter(ins => ins.policy_status === "new" || ins.policy_status === "maintain").map(ins => {
            let dateStr = (ins.policy_status === "maintain" ? ins.subscription_date : ins.created_at?.slice(0, 10)) || '-';
            const cName = (tClientsRes.data || []).find(c => Number(c.id) === Number(ins.client_id))?.name || ins.contractor_name;
            return { ...ins, isCompleted: ins.policy_status === "maintain", dateStr, clientName: cName };
          });

          const sortedMembers = [...members].sort((a, b) => {
            const aIsSM = (a.rank || '').toUpperCase().includes('SM');
            const bIsSM = (b.rank || '').toUpperCase().includes('SM');
            if (aIsSM && !bIsSM) return -1; if (!aIsSM && bIsSM) return 1;
            return a.name.localeCompare(b.name, 'ko-KR');
          });

          const groupedContracts = sortedMembers.map(member => {
            const memberContracts = tCont.filter((ins: any) => ins.agent_name === member.name && ins.dateStr.replace(/\./g, '-').replace(/\s/g, '').startsWith(thisMonthStr)).sort((a: any, b: any) => new Date(b.dateStr === '-' ? 0 : b.dateStr).getTime() - new Date(a.dateStr === '-' ? 0 : a.dateStr).getTime());
            const memberPipes = (tPipelinesRes.data || []).filter((p: any) => p.agent_id === member.id).sort((a: any, b: any) => parseLocalDate(a.expected_date).getTime() - parseLocalDate(b.expected_date).getTime());
            const inProgressAmt = memberContracts.filter((i: any) => !i.isCompleted).reduce((sum: number, i: any) => sum + (i.monthly_premium || 0), 0) + memberPipes.reduce((sum: number, p: any) => sum + ((p.expected_date === '9999-12-31' || p.status === '보류') ? 0 : (p.expected_amount || 0)), 0);
            
            const completedList = memberContracts.filter((i: any) => i.isCompleted);
            const longTermCompleted = completedList.filter((i:any) => i.insurance_type !== '일반보험').reduce((sum: number, i: any) => sum + (i.monthly_premium || 0), 0);
            const generalCompleted = completedList.filter((i:any) => i.insurance_type === '일반보험').reduce((sum: number, i: any) => sum + (i.monthly_premium || 0), 0);
            const completedAmt = longTermCompleted + generalCompleted;

            return { agentName: member.name, rank: member.rank, targetAmount: member.monthly_target || 800000, inProgressAmount: inProgressAmt, completedAmount: completedAmt, longTermCompleted, generalCompleted, contracts: memberContracts, pipelines: memberPipes };
          }); 

          const yStats = Array.from({length: 12}, (_, i) => ({ month: i+1, monthStr: `${currentYear}-${String(i+1).padStart(2, '0')}`, amount: 0, longTermAmount: 0, generalAmount: 0, activeSet: new Set(), contractIds: [] as number[] }));
          const fcStats = new Map();
          members.forEach(m => { fcStats.set(m.name, { name: m.name, rank: m.rank || 'FC', amount: 0 }); });

          (tInsRes.data || []).forEach(ins => {
              if (ins.policy_status === "maintain") {
                  let dateStr = ins.subscription_date || (ins.created_at ? ins.created_at.slice(0, 10) : '-');
                  if (!dateStr) dateStr = '-';
                  const cleanDate = dateStr.replace(/\./g, '-').replace(/\s/g, '').slice(0, 7);
                  const yyyymm = cleanDate.slice(0, 7);
                  
                  const m = members.find((member: any) => member.name === ins.agent_name);
                  if (m) {
                      const amt = ins.monthly_premium || 0;
                      const yMatch = yStats.find(y => y.monthStr === yyyymm);
                      if (yMatch) {
                          yMatch.amount += amt;
                          if (ins.insurance_type === '일반보험') yMatch.generalAmount += amt;
                          else yMatch.longTermAmount += amt;
                          yMatch.activeSet.add(m.name);
                          yMatch.contractIds.push(ins.id);
                      }
                      if (yyyymm === thisMonthStr) {
                          if (fcStats.has(m.name) && ins.insurance_type !== '일반보험') {
                              fcStats.get(m.name).amount += amt;
                          }
                      }
                  }
              }
          });

          const teamYearlyStats = yStats.map(y => ({ month: y.month, amount: y.amount, longTermAmount: y.longTermAmount, generalAmount: y.generalAmount, activeCount: y.activeSet.size, contractIds: y.contractIds }));
          const teamTopFCs = Array.from(fcStats.values()).filter((fc: any) => fc.amount > 0).sort((a: any, b: any) => b.amount - a.amount).slice(0, 3);
          const teamNameStr = agencyData?.team_number ? `${agencyData.team_number}팀` : '직할팀';

          setTeamData({ 
            teamName: teamNameStr,
            teamTotalMembers: members.length,
            teamYearlyStats,
            teamTopFCs,
            teamContractsByAgent: groupedContracts, 
            totalTeamInProgress: groupedContracts.reduce((sum, m) => sum + m.inProgressAmount, 0), 
            totalTeamLongTerm: groupedContracts.reduce((sum, m) => sum + m.longTermCompleted, 0), 
            totalTeamGeneral: groupedContracts.reduce((sum, m) => sum + m.generalCompleted, 0),
            totalTeamCompleted: groupedContracts.reduce((sum, m) => sum + m.completedAmount, 0) 
          });
        }
      }

      // 3. 지사 관리 보드 데이터 세팅
      if (isBranchAuth && myBranch) {
        const { data: bAgencies } = await supabase.from("agencies").select("id, team_number").eq("branch_name", myBranch);
        if (bAgencies && bAgencies.length > 0) {
          const bAgencyIds = bAgencies.map(a => a.id);
          const agencyMap = new Map(bAgencies.map(a => [a.id, a.team_number]));
          const { data: bMembersRaw } = await supabase.from("agents").select("id, name, rank, agency_id, monthly_target").in("agency_id", bAgencyIds);
          
          if (bMembersRaw && bMembersRaw.length > 0) {
            
            const bMembers = bMembersRaw.filter((m: any) => (m.rank || '').toUpperCase().trim() !== 'OS');
            const bMemberIds = bMembers.map(m => m.id);
            const bMemberNames = bMembers.map(m => m.name);
            const [bInsRes, bPipelinesRes] = await Promise.all([
               supabase.from("subscription_insurance").select("id, client_id, agent_name, monthly_premium, policy_status, subscription_date, created_at, insurance_type").in("agent_name", bMemberNames),
               supabase.from("sales_pipelines").select("agent_id, expected_amount, expected_date, status").in("agent_id", bMemberIds).not('status', 'in', '("계약","거절","증권 전달")')
            ]);

            const currentYear = new Date().getFullYear();
            const yStats = Array.from({length: 12}, (_, i) => ({ month: i+1, monthStr: `${currentYear}-${String(i+1).padStart(2, '0')}`, amount: 0, longTermAmount: 0, generalAmount: 0, activeSet: new Set(), contractIds: [] as number[] }));
            const teamMap = new Map();
            bAgencies.forEach(a => teamMap.set(a.team_number ? `${a.team_number}팀` : '직할팀', { teamName: a.team_number ? `${a.team_number}팀` : '직할팀', teamSM: '공석', targetAmount: 0, inProgressAmount: 0, completedAmount: 0, longTermCompleted: 0, generalCompleted: 0, fcs: {}, thisMonthAmt: 0, thisMonthActive: new Set(), lastMonthAmt: 0, lastMonthLongTerm: 0, lastMonthGeneral: 0, lastMonthActive: new Set(), twoMonthsAgoAmt: 0, twoMonthsAgoLongTerm: 0, twoMonthsAgoGeneral: 0, twoMonthsAgoActive: new Set() }));

            bMembers.forEach(m => {
              const tName = agencyMap.get(m.agency_id) ? `${agencyMap.get(m.agency_id)}팀` : '직할팀';
              const team = teamMap.get(tName);
              if (team) {
                  team.targetAmount += (m.monthly_target || 800000);
                  team.fcs[m.name] = { amount: 0, rank: m.rank || 'FC' };
                  const rankUpper = (m.rank || '').toUpperCase();
                  if (tName === '직할팀' && rankUpper.includes('BM')) team.teamSM = `${m.name} 지사장(BM)`;
                  else if (tName !== '직할팀' && rankUpper.includes('SM')) team.teamSM = `${m.name} 팀장(SM)`;
              }
            });

            (bInsRes.data || []).forEach(ins => {
                if (ins.policy_status === "maintain") {
                    let dateStr = ins.subscription_date || (ins.created_at ? ins.created_at.slice(0, 10) : '-');
                    const yyyymm = (dateStr || '-').replace(/\./g, '-').replace(/\s/g, '').slice(0, 7);
                    const m = bMembers.find(member => member.name === ins.agent_name);
                    
                    if (m) {
                        const amt = ins.monthly_premium || 0;
                        const yMatch = yStats.find(y => y.monthStr === yyyymm);
                        if (yMatch) {
                            yMatch.amount += amt;
                            if (ins.insurance_type === '일반보험') yMatch.generalAmount += amt;
                            else yMatch.longTermAmount += amt;
                            yMatch.activeSet.add(m.name);
                            yMatch.contractIds.push(ins.id);
                        }
                        const tName = agencyMap.get(m.agency_id) ? `${agencyMap.get(m.agency_id)}팀` : '직할팀';
                        const team = teamMap.get(tName);
                        if (team) {
                            if (yyyymm === thisMonthStr) {
                                team.thisMonthAmt += amt; 
                                team.completedAmount += amt;
                                if (ins.insurance_type === '일반보험') team.generalCompleted += amt;
                                else team.longTermCompleted += amt;
                                team.thisMonthActive.add(m.name); 
                                if (ins.insurance_type !== '일반보험') team.fcs[m.name].amount += amt; 
                            } else if (yyyymm === lastMonthStr) {
                                team.lastMonthAmt += amt; team.lastMonthActive.add(m.name);
                                if (ins.insurance_type === '일반보험') team.lastMonthGeneral += amt;
                                else team.lastMonthLongTerm += amt;
                            } else if (yyyymm === twoMonthsAgoStr) {
                                team.twoMonthsAgoAmt += amt; team.twoMonthsAgoActive.add(m.name);
                                if (ins.insurance_type === '일반보험') team.twoMonthsAgoGeneral += amt;
                                else team.twoMonthsAgoLongTerm += amt;
                            }
                        }
                    }
                }
            });

            const fcStats = new Map();
            bMembers.forEach(m => { fcStats.set(m.name, { name: m.name, rank: m.rank || 'FC', amount: 0 }); });
            teamMap.forEach(team => { Object.entries(team.fcs).forEach(([name, data]: any) => { if (fcStats.has(name)) fcStats.get(name).amount += data.amount; }); });
            const branchTopFCs = Array.from(fcStats.values()).filter((fc: any) => fc.amount > 0).sort((a: any, b: any) => b.amount - a.amount).slice(0, 3);

            (bPipelinesRes.data || []).forEach(p => {
              const m = bMembers.find(member => member.id === p.agent_id);
              if (m && p.expected_date !== '9999-12-31' && p.status !== '보류') {
                  const tName = agencyMap.get(m.agency_id) ? `${agencyMap.get(m.agency_id)}팀` : '직할팀';
                  if (teamMap.has(tName)) teamMap.get(tName).inProgressAmount += (p.expected_amount || 0);
              }
            });

            teamMap.forEach(team => {
              team.topFCs = Object.entries(team.fcs).map(([name, data]: any) => ({ name, amount: data.amount, rank: data.rank })).filter(fc => fc.amount > 0).sort((a: any, b: any) => b.amount - a.amount).slice(0, 3);
              team.totalMembers = Object.keys(team.fcs).length;
              team.thisMonthActiveCount = team.thisMonthActive.size;
              team.lastMonthActiveCount = team.lastMonthActive.size;
              team.twoMonthsAgoActiveCount = team.twoMonthsAgoActive.size;
            });

            setBranchData({ 
              branchName: myBranch, 
              branchTotalMembers: bMembers.length, 
              totalBranchInProgress: Array.from(teamMap.values()).reduce((sum:any, t:any) => sum + t.inProgressAmount, 0), 
              totalBranchLongTerm: Array.from(teamMap.values()).reduce((sum:any, t:any) => sum + t.longTermCompleted, 0), 
              totalBranchGeneral: Array.from(teamMap.values()).reduce((sum:any, t:any) => sum + t.generalCompleted, 0), 
              totalBranchCompleted: Array.from(teamMap.values()).reduce((sum:any, t:any) => sum + t.completedAmount, 0),
              branchYearlyStats: yStats.map(y => ({ month: y.month, amount: y.amount, longTermAmount: y.longTermAmount, generalAmount: y.generalAmount, activeCount: y.activeSet.size, contractIds: y.contractIds })), 
              branchTopFCs, 
              branchStatsByTeam: Array.from(teamMap.values()).sort((a:any, b:any) => { if (a.teamName === '직할팀') return -1; if (b.teamName === '직할팀') return 1; return a.teamName.localeCompare(b.teamName); })
            });
          }
        }
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []); 

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-bold text-sm">대시보드 데이터를 분석 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto p-4 md:p-8 bg-gray-50/50 min-h-screen flex flex-col">
      <div className="flex justify-between items-end mb-4 relative shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Presentation className="w-5 h-5 text-indigo-600" />영업 현황 보드</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            <strong className="text-indigo-600">{personalData.currentAgentName}</strong> 님의 오늘 챙겨야 할 핵심 업무 현황입니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notifications" className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors relative cursor-pointer flex items-center justify-center group">
            <Bell className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 border border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {isManager && (
        <div className="flex items-center gap-6 border-b border-gray-200 shrink-0 mb-6 px-1 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setActiveTab('personal')} className={`cursor-pointer pb-3 text-sm font-black transition-all relative ${activeTab === 'personal' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
            내 영업 보드
            {activeTab === 'personal' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></span>}
          </button>
          <button onClick={() => setActiveTab('team')} className={`cursor-pointer pb-3 text-sm font-black transition-all relative ${activeTab === 'team' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
            팀 관리 보드
            {activeTab === 'team' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></span>}
          </button>
          {isBranchManager && (
            <button onClick={() => setActiveTab('branch')} className={`cursor-pointer pb-3 text-sm font-black transition-all relative ${activeTab === 'branch' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
              지사 관리 보드
              {activeTab === 'branch' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></span>}
            </button>
          )}
        </div>
      )} 

      {(!isManager || activeTab === 'personal') && (
        <PersonalBoard 
          data={personalData} 
          actions={{ 
            setPipelines: (newP: any) => setPersonalData({...personalData, pipelines: newP}), 
            setMyTargetAmount: (newA: number) => setPersonalData({...personalData, myTargetAmount: newA})
          }} 
        />
      )}
      {isManager && activeTab === 'team' && <TeamBoard data={teamData} />}
      {isBranchManager && activeTab === 'branch' && <BranchBoard data={branchData} />}
      
    </div>
  );
}