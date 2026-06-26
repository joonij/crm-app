"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Calendar, Users, TrendingUp, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";

type Schedule = {
  id: number;
  client_id: number;
  time: string;
  content: string;
  clients: { name: string };
};

export default function DashboardPage() {
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [pipelineStats, setPipelineStats] = useState<Record<string, number>>({});
  const [monthlyStats, setMonthlyStats] = useState({ newClients: 0, closedContracts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);

      // 1. 오늘 날짜 구하기 (YYYY-MM-DD)
      const today = new Date();
      // 한국 시간(KST) 기준으로 날짜 문자열 생성 (timezone offset 보정)
      const kstOffset = 9 * 60 * 60 * 1000; 
      const todayStr = new Date(today.getTime() + kstOffset).toISOString().split('T')[0];

      // 이번 달의 시작일 구하기 (YYYY-MM-01)
      const firstDayOfMonth = `${todayStr.substring(0, 8)}01`;

      // 2. 오늘의 일정 가져오기 (고객 이름 포함)
      const { data: schedulesData } = await supabase
        .from("schedules")
        .select(`
          id, client_id, time, content,
          clients ( name )
        `)
        .eq("date", todayStr)
        .order("time", { ascending: true });

      if (schedulesData) setTodaySchedules(schedulesData as any[]);

      // 3. 파이프라인(진행 상태) 및 이번 달 통계용 고객 데이터 가져오기
      const { data: clientsData } = await supabase
        .from("clients")
        .select("created_at, progress_status, contract_status");

      if (clientsData) {
        const stats: Record<string, number> = {};
        let newClients = 0;
        let closedContracts = 0;

        clientsData.forEach((client) => {
          // 파이프라인 카운트
          const status = client.progress_status || "상태 미지정";
          stats[status] = (stats[status] || 0) + 1;

          // 이번 달 신규 고객
          if (client.created_at && client.created_at.startsWith(todayStr.substring(0, 7))) {
            newClients++;
          }

          // 계약 완료 고객 (단순 카운트, 필요시 날짜 로직 추가)
          if (client.contract_status === "계약 완료") {
            closedContracts++;
          }
        });

        setPipelineStats(stats);
        setMonthlyStats({ newClients, closedContracts });
      }

      setIsLoading(false);
    }

    void fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">대시보드를 불러오는 중입니다...</div>;
  }

  // 표시할 핵심 파이프라인 단계 (순서대로 정렬)
  const corePipelines = ["TA(전화응대)", "1차 미팅(AP)", "2차 미팅(PT)", "3차 미팅(클로징)", "청약 진행"];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      
      {/* 1. 상단 환영 메시지 */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          한강 6팀 정준희 팀장님, 환영합니다!
        </h1>
        <p className="text-gray-300 text-sm md:text-base">
          이번 달도 부지점장 달성을 향해 화이팅입니다. 오늘의 영업 일정을 확인해 보세요.
        </p>
      </section>

      {/* 2. 핵심 지표 요약 카드 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">오늘의 미팅 및 일정</p>
            <p className="text-2xl font-bold text-gray-900">{todaySchedules.length}건</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">이번 달 신규 발굴 고객</p>
            <p className="text-2xl font-bold text-gray-900">{monthlyStats.newClients}명</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">이번 달 체결(계약 완료)</p>
            <p className="text-2xl font-bold text-gray-900">{monthlyStats.closedContracts}건</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. 오늘의 일정 리스트 */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" /> 오늘의 일정
            </h2>
          </div>
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            {todaySchedules.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <CheckCircle className="w-10 h-10 mb-2 opacity-20" />
                <p>오늘 예정된 일정이 없습니다.</p>
              </div>
            ) : (
              todaySchedules.map((schedule) => (
                <Link 
                  href={`/clients/${schedule.client_id}`} 
                  key={schedule.id}
                  className="block p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-blue-600 mb-1">{schedule.time.substring(0, 5)}</p>
                      <h3 className="font-bold text-gray-900 text-base">{schedule.clients?.name} 고객님</h3>
                      <p className="text-sm text-gray-600 mt-1">{schedule.content}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 4. 영업 퍼널 현황 (Sales Pipeline) */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" /> 영업 퍼널 (진행 상태)
            </h2>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {corePipelines.map((stage, index) => {
                const count = pipelineStats[stage] || 0;
                // 임의의 최대값(예: 20명)을 기준으로 게이지 바 비율 계산
                const percentage = Math.min((count / 20) * 100, 100); 
                
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span className="text-gray-700">{index + 1}. {stage}</span>
                      <span className={count > 0 ? "text-blue-600 font-bold" : "text-gray-400"}>{count}명</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${count > 0 ? 'bg-blue-600' : 'bg-gray-200'}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 mt-2 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-500">
                <AlertCircle className="w-4 h-4 shrink-0 text-gray-400" />
                <p>진행 상태가 위 핵심 파이프라인에 해당하는 고객들만 게이지로 표시됩니다. (기준: 최대 20명)</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}