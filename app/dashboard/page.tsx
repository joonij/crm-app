// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Car, FileText, CheckCircle2, 
  ChevronRight, Calendar, Clock, Loader2, TrendingUp, Users 
} from "lucide-react";

// 날짜 계산 헬퍼 함수
const calculateDDay = (targetDateStr: string | null) => {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 금액 포맷팅 헬퍼
const formatMoney = (val: number) => {
  if (val === 0) return "0원";
  return `${val.toLocaleString()}원`;
};

// YYYY-MM 문자열 생성 헬퍼 (이번달, 저번달, 저저번달 추출용)
const getMonthString = (offsetMonths: number = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() - offsetMonths);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [oldClients, setOldClients] = useState<any[]>([]);
  const [autoRenewals, setAutoRenewals] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);

  // ⭐️ 통계용 상태
  const [totalInProgressPremium, setTotalInProgressPremium] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    twoMonthsAgo: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      const [clientsRes, insRes] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("subscription_insurance").select("*")
      ]);

      const clients = clientsRes.data || [];
      const insurances = insRes.data || [];

      const clientMap = new Map(clients.map(c => [c.id, c.name]));

      // ----------------------------------------------------
      // ① [왼쪽] 오래된 고객 재터치 리스트 (180일 이상)
      // ----------------------------------------------------
      const retouchList = clients
        .map(c => {
          const clientInsurances = insurances.filter(ins => ins.client_id === c.id);
          const lastUpdate = clientInsurances.length > 0 
            ? new Date(Math.max(...clientInsurances.map(i => new Date(i.created_at || 0).getTime())))
            : new Date(c.created_at || 0); 
          
          return { ...c, lastUpdate, daysSinceUpdate: Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24)) };
        })
        .filter(c => c.daysSinceUpdate >= 180)
        .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate); // 가장 오래된 순
      setOldClients(retouchList);

      // ----------------------------------------------------
      // ② [오른쪽 1] 자동차보험 갱신 리스트 (D-60 이내)
      // ----------------------------------------------------
      const autoList = insurances
        .filter(ins => ins.product_name?.includes("자동차") && ins.maturity_date)
        .map(ins => ({ ...ins, dDay: calculateDDay(ins.maturity_date), clientName: clientMap.get(ins.client_id) }))
        .filter(ins => ins.dDay !== null && ins.dDay >= 0 && ins.dDay <= 60)
        .sort((a, b) => a.dDay - b.dDay);
      setAutoRenewals(autoList);

      // ----------------------------------------------------
      // ③ [오른쪽 2] 진행 중인 계약 리스트 (new 상태)
      // ----------------------------------------------------
      const newPolicies = insurances
        .filter(ins => ins.policy_status === "new")
        .map(ins => ({ ...ins, clientName: clientMap.get(ins.client_id) }))
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setInProgress(newPolicies);
      
      // 진행중 총 보험료 합산
      const totalNewPremium = newPolicies.reduce((acc, curr) => acc + (curr.monthly_premium || 0), 0);
      setTotalInProgressPremium(totalNewPremium);

      // ----------------------------------------------------
      // ④ [오른쪽 3] 최근 체결한 보험 리스트 및 월별 통계
      // ----------------------------------------------------
      const thisMonthStr = getMonthString(0);
      const lastMonthStr = getMonthString(1);
      const twoMonthsAgoStr = getMonthString(2);

      let statThisMonth = 0;
      let statLastMonth = 0;
      let statTwoMonthsAgo = 0;

      const completedPolicies = insurances
        .filter(ins => ins.policy_status === "maintain" && ins.subscription_date)
        .map(ins => {
          // 통계 합산 로직
          const subDate = ins.subscription_date!;
          if (subDate.startsWith(thisMonthStr)) statThisMonth += (ins.monthly_premium || 0);
          else if (subDate.startsWith(lastMonthStr)) statLastMonth += (ins.monthly_premium || 0);
          else if (subDate.startsWith(twoMonthsAgoStr)) statTwoMonthsAgo += (ins.monthly_premium || 0);
          
          return { ...ins, clientName: clientMap.get(ins.client_id) };
        })
        .sort((a, b) => new Date(b.subscription_date!).getTime() - new Date(a.subscription_date!).getTime())
        .slice(0, 10); // 최근 체결 내역은 리스트에 10개까지만 노출

      setCompleted(completedPolicies);
      setMonthlyStats({ thisMonth: statThisMonth, lastMonth: statLastMonth, twoMonthsAgo: statTwoMonthsAgo });

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

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
      
      {/* 타이틀 */}
      <div className="mb-2">
        <h1 className="text-2xl font-black text-slate-800">영업 현황 보드</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">집중해야 할 핵심 고객과 계약 진행 현황입니다.</p>
      </div>

      {/* 1:2 비율 레이아웃 (lg 이상 화면에서 분할) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* =========================================================================
            왼쪽 구역: 재터치 필요 고객 (세로로 길게 배치)
        ========================================================================= */}
        <div className="lg:col-span-1 bg-white border border-rose-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[800px]">
          <div className="bg-rose-50/80 p-5 border-b border-rose-100 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-black text-rose-900 flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-rose-500" /> 재터치 필요 고객
              </h3>
              <p className="text-xs text-rose-600/80 font-bold mt-1">180일 이상 업데이트가 없는 가망고객</p>
            </div>
            <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-black shrink-0">
              총 {oldClients.length}명
            </span>
          </div>
          <div className="p-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-rose-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {oldClients.length > 0 ? (
              <ul className="space-y-1">
                {oldClients.map(client => (
                  <li key={client.id} className="flex justify-between items-center p-3.5 hover:bg-rose-50/50 rounded-xl transition-colors group">
                    <div>
                      <p className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">{client.name} 고객님</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">최근 이력: {client.lastUpdate.toLocaleDateString('ko-KR')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-rose-500 bg-white border border-rose-100 shadow-sm px-2 py-1 rounded-md">D+{client.daysSinceUpdate}일</span>
                      <Link href={`/clients/${client.id}`} className="text-slate-300 group-hover:text-rose-500 transition-colors"><ChevronRight className="w-5 h-5" /></Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users className="w-10 h-10 mb-3 opacity-20 text-rose-500" />
                <p className="text-sm font-semibold">재터치가 필요한 고객이 없습니다.</p>
              </div>
            )}
          </div>
        </div>


        {/* =========================================================================
            오른쪽 구역: 3개 분할 (자동차, 진행중, 완료)
        ========================================================================= */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          
          {/* ① 자동차 갱신 리스트 */}
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex justify-between items-center">
              <h3 className="font-bold text-amber-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-500" /> 자동차보험 갱신 리스트
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">만기 D-60 이내</span>
            </div>
            <div className="p-3">
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
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <p className="text-xs font-semibold">다가오는 자동차 갱신건이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* ② 진행 중인 계약 리스트 */}
          <div className="bg-white border border-blue-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> 진행 중인 계약 (제안중)
              </h3>
              {/* ⭐️ 제안 중인 총 보험료 합산 표시 */}
              <div className="flex items-center gap-2 text-sm bg-white border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-gray-500 font-semibold text-xs">예상 합산 월납액</span>
                <span className="font-black text-blue-600">{formatMoney(totalInProgressPremium)}</span>
              </div>
            </div>
            <div className="p-3">
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
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <p className="text-xs font-semibold">새로 제안 중인 내역이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* ③ 최근 체결한 보험 리스트 & 월별 통계 */}
          <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 최근 체결 완료 현황
              </h3>
              
              {/* ⭐️ 월별 체결 금액 통계 바 */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex flex-col items-end bg-white border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm flex-1 md:flex-none">
                  <span className="text-[10px] text-gray-400 font-bold mb-0.5">저저번달 ({getMonthString(2).slice(5)}월)</span>
                  <span className="font-bold text-slate-700 text-xs">{formatMoney(monthlyStats.twoMonthsAgo)}</span>
                </div>
                <div className="flex flex-col items-end bg-white border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm flex-1 md:flex-none">
                  <span className="text-[10px] text-gray-400 font-bold mb-0.5">저번달 ({getMonthString(1).slice(5)}월)</span>
                  <span className="font-bold text-slate-700 text-xs">{formatMoney(monthlyStats.lastMonth)}</span>
                </div>
                <div className="flex flex-col items-end bg-emerald-600 text-white border border-emerald-700 px-3 py-1.5 rounded-lg shadow-sm flex-1 md:flex-none relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full"></div>
                  <span className="text-[10px] text-emerald-100 font-bold mb-0.5">이번달 ({getMonthString(0).slice(5)}월)</span>
                  <span className="font-black text-white text-sm flex items-center gap-1">
                    {formatMoney(monthlyStats.thisMonth)} <TrendingUp className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3">
              {completed.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {completed.map(ins => (
                    <li key={ins.id} className="flex justify-between items-center p-3 hover:bg-emerald-50/30 rounded-xl border border-gray-100 transition-colors group">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-sm text-gray-900 truncate">{ins.clientName} <span className="text-xs font-semibold text-gray-400 ml-1">{ins.insurance_company}</span></p>
                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> {ins.subscription_date} 가입
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-sm font-black text-emerald-600">{formatMoney(ins.monthly_premium)}</p>
                        <Link href={`/clients/${ins.client_id}`} className="text-gray-300 group-hover:text-emerald-500 transition-colors"><ChevronRight className="w-5 h-5" /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <p className="text-xs font-semibold">최근 체결된 계약이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}