// app/dashboard/components/BranchBoard.tsx
"use client";

import { Building2, Calendar, Trophy, Medal } from "lucide-react";
import { formatMoney, formatAmtShort } from "../utils";

export default function BranchBoard({ data }: any) {
  const { 
    branchName, branchTotalMembers, 
    totalBranchInProgress, totalBranchCompleted, totalBranchLongTerm, totalBranchGeneral,
    branchYearlyStats, branchTopFCs, branchStatsByTeam 
  } = data;

  const maxYearlyAmt = Math.max(...(branchYearlyStats || []).map((s: any) => Math.max(s.longTermAmount || 0, s.generalAmount || 0)), 1000000);
  const maxYearlyAct = Math.max(...(branchYearlyStats || []).map((s: any) => s.activeCount), 5);
  const chartH = 140;
  const paddingX = 40;
  const paddingY = 20;
  const xStep = (1000 - 2 * paddingX) / 11;
  const scaleAmt = (chartH - 2 * paddingY) / maxYearlyAmt;
  const scaleAct = (chartH - 2 * paddingY) / maxYearlyAct;
  const pointsLong = (branchYearlyStats || []).map((s: any, i: number) => `${paddingX + i * xStep},${chartH - paddingY - ((s.longTermAmount || 0) * scaleAmt)}`).join(' ');
  const pointsGen = (branchYearlyStats || []).map((s: any, i: number) => `${paddingX + i * xStep},${chartH - paddingY - ((s.generalAmount || 0) * scaleAmt)}`).join(' ');
  const pointsAct = (branchYearlyStats || []).map((s: any, i: number) => `${paddingX + i * xStep},${chartH - paddingY - (s.activeCount * scaleAct)}`).join(' ');

  const totalBranchTarget = (branchStatsByTeam || []).reduce((sum: number, t: any) => sum + (t.targetAmount || 0), 0);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      
      {/* ⭐️ 연간 누적 실적 및 가동 현황 (선그래프 2줄) */}
      <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-slate-100 pb-3 mb-4 gap-2">
          <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" /> {new Date().getFullYear()}년 연간 지사 실적 및 가동 현황
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span><span className="text-xs font-bold text-slate-600">장기실적</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 rounded-full"></span><span className="text-xs font-bold text-slate-600">일반실적</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span><span className="text-xs font-bold text-slate-600">가동인원</span></div>
          </div>
        </div>

        <div className="w-full h-[160px] relative mb-6">
          <svg viewBox={`0 0 1000 ${chartH}`} className="w-full h-full overflow-visible">
            <line x1={paddingX} y1={chartH - paddingY} x2={1000 - paddingX} y2={chartH - paddingY} stroke="#e2e8f0" strokeWidth="1" />
            <line x1={paddingX} y1={(chartH - paddingY)/2} x2={1000 - paddingX} y2={(chartH - paddingY)/2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <polyline fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pointsLong} />
            <polyline fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" points={pointsGen} />
            <polyline fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" strokeLinecap="round" strokeLinejoin="round" points={pointsAct} />
            {branchYearlyStats.map((s: any, i: number) => {
              const cx = paddingX + i * xStep;
              const cyLong = chartH - paddingY - ((s.longTermAmount || 0) * scaleAmt);
              const cyGen = chartH - paddingY - ((s.generalAmount || 0) * scaleAmt);
              const cyAct = chartH - paddingY - (s.activeCount * scaleAct);
              return (
                <g key={i}>
                  <circle cx={cx} cy={cyLong} r="4" fill="white" stroke="#6366f1" strokeWidth="2" />
                  <circle cx={cx} cy={cyGen} r="3" fill="white" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx={cx} cy={cyAct} r="3.5" fill="white" stroke="#10b981" strokeWidth="2" />
                  {s.activeCount > 0 && <text x={cx} y={cyAct + 14} textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">{s.activeCount}명</text>}
                  <text x={cx} y={chartH} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">{s.month}월</text>
                </g>
              )
            })}
          </svg>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2 mt-2">
          {branchYearlyStats.map((y: any) => (
            <div key={y.month} className="bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100 rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-help">
              <span className="text-[10px] font-bold text-slate-500 mb-1">{y.month}월</span>
              <div className="flex flex-col gap-0.5 mb-1.5 w-full">
                <span className={`text-[11px] font-black ${y.longTermAmount > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>{y.longTermAmount > 0 ? formatAmtShort(y.longTermAmount) : '-'}</span>
                <span className={`text-[9px] font-bold ${y.generalAmount > 0 ? 'text-amber-500' : 'text-slate-300'}`}>{y.generalAmount > 0 ? `일 ${formatAmtShort(y.generalAmount)}` : ''}</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-full ${y.activeCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {y.activeCount > 0 ? `가동 ${y.activeCount}명` : '가동 0명'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐️ 지사 TOP 3 명예의 전당 (장기보험 기준 타이틀 추가) */}
      {branchTopFCs && branchTopFCs.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-4 sm:p-5 rounded-2xl shadow-md flex flex-col xl:flex-row xl:items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-yellow-200/30"><Trophy className="w-48 h-48" /></div>
          <div className="flex items-center gap-2 font-black text-yellow-800 shrink-0 border-b xl:border-b-0 xl:border-r border-yellow-200/60 pb-3 xl:pb-0 pr-0 xl:pr-5 w-full xl:w-auto justify-start z-10">
            <Medal className="w-6 h-6 text-yellow-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-yellow-700 uppercase tracking-widest leading-tight">Branch Honor</span>
              <span className="text-lg leading-tight">이달의 {branchName} TOP 3 <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded align-middle ml-1">장기보험 기준</span></span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1 z-10">
            {branchTopFCs.map((fc: any, idx: number) => (
              <div key={idx} className="flex-1 bg-white border border-yellow-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-sm hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shadow-inner ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 'bg-gradient-to-br from-amber-600 to-amber-800'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-800 flex flex-col sm:block">{fc.name} <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded ml-0 sm:ml-1 mt-0.5 sm:mt-0 inline-block">{fc.rank}</span></span>
                </div>
                <span className="font-black text-emerald-600 text-sm tracking-tight">{formatMoney(fc.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 지사 실적 요약 (장기/일반 분리) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600"/> {branchName} 실적 요약
          </h2>
          <p className="text-xs text-indigo-700 font-bold mt-1">지사 내 각 팀의 목표 달성 현황과 당월 체결액입니다.</p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-indigo-100 rounded-xl shadow-sm flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-slate-500">이번 달 목표</span>
            <span className="font-black text-slate-700 text-base sm:text-lg">{formatMoney(totalBranchTarget)}</span>
          </div>
          <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-indigo-100 rounded-xl shadow-sm flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-orange-500">지사 진행총합</span>
            <span className="font-black text-orange-600 text-base sm:text-lg">{formatMoney(totalBranchInProgress)}</span>
          </div>
          <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-indigo-100 rounded-xl shadow-sm flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-emerald-600">지사 장기합산</span>
            <span className="font-black text-emerald-600 text-base sm:text-lg">{formatMoney(totalBranchLongTerm)}</span>
          </div>
          <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-indigo-100 rounded-xl shadow-sm flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-amber-500">지사 일반합산</span>
            <span className="font-black text-amber-500 text-base sm:text-lg">{formatMoney(totalBranchGeneral)}</span>
          </div>
        </div>
      </div>

      {/* 팀별 상세 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {branchStatsByTeam.map((team: any) => {
          const achievementRate = Math.min(100, Math.round((team.completedAmount / (team.targetAmount || 1)) * 100));
          return (
            <div key={team.teamName} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-indigo-300 transition-colors flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${achievementRate}%` }}></div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 mt-2">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                    {team.teamName} <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{team.totalMembers}명</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">리더: <span className="text-indigo-600">{team.teamSM}</span></span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-black text-indigo-600">{achievementRate}% 달성</span>
                  <span className="block text-[10px] text-slate-400 font-bold">목표 {formatMoney(team.targetAmount)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 mt-1">
                {/* 진행사항 합산 */}
                <div className="flex justify-between items-center bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                  <span className="text-[11px] font-bold text-orange-700">진행사항 합산</span>
                  <span className="text-sm font-black text-orange-600">{formatMoney(team.inProgressAmount)}</span>
                </div>

                {/* ⭐️ 당월 체결 (장기/일반 분할) */}
                <div className="flex flex-col border border-indigo-100 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-indigo-50/50 px-2.5 py-2 flex justify-between items-center border-b border-indigo-100">
                    <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1.5">
                      당월 총 체결 <span className="text-[10px] bg-white border border-indigo-100 text-indigo-600 px-1 py-0.5 rounded shadow-sm leading-none">가동 {team.thisMonthActiveCount}명</span>
                    </span>
                    <span className="text-sm font-black text-indigo-700">{formatMoney(team.completedAmount)}</span>
                  </div>
                  <div className="flex bg-white">
                    <div className="flex-1 flex flex-col p-2 border-r border-indigo-100 items-center justify-center">
                      <span className="text-[10px] font-bold text-emerald-600 mb-0.5">장기실적</span>
                      <span className="text-[13px] font-black text-emerald-600">{formatMoney(team.longTermCompleted)}</span>
                    </div>
                    <div className="flex-1 flex flex-col p-2 items-center justify-center">
                      <span className="text-[10px] font-bold text-amber-600 mb-0.5">일반실적</span>
                      <span className="text-[13px] font-black text-amber-600">{formatMoney(team.generalCompleted)}</span>
                    </div>
                  </div>
                </div>

                {/* ⭐️ 전월 체결 (장기/일반 분할) */}
                <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden shadow-sm mt-1">
                  <div className="bg-slate-50 px-2.5 py-1.5 flex justify-between items-center border-b border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      전월 총 체결 <span className="text-[9px] bg-white border border-slate-200 text-slate-500 px-1 py-0.5 rounded shadow-sm leading-none">가동 {team.lastMonthActiveCount}명</span>
                    </span>
                    <span className="text-xs font-black text-slate-700">{formatMoney(team.lastMonthAmt)}</span>
                  </div>
                  <div className="flex bg-white">
                    <div className="flex-1 flex justify-between items-center px-2.5 py-1 border-r border-slate-100">
                      <span className="text-[9px] font-bold text-emerald-600/80">장기</span>
                      <span className="text-[11px] font-black text-emerald-600">{formatMoney(team.lastMonthLongTerm)}</span>
                    </div>
                    <div className="flex-1 flex justify-between items-center px-2.5 py-1">
                      <span className="text-[9px] font-bold text-amber-600/80">일반</span>
                      <span className="text-[11px] font-black text-amber-600">{formatMoney(team.lastMonthGeneral)}</span>
                    </div>
                  </div>
                </div>

                {/* ⭐️ 전전월 체결 (장기/일반 분할) */}
                <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden shadow-sm mt-1">
                  <div className="bg-slate-50 px-2.5 py-1.5 flex justify-between items-center border-b border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      전전월 총 체결 <span className="text-[9px] bg-white border border-slate-200 text-slate-500 px-1 py-0.5 rounded shadow-sm leading-none">가동 {team.twoMonthsAgoActiveCount}명</span>
                    </span>
                    <span className="text-xs font-black text-slate-700">{formatMoney(team.twoMonthsAgoAmt)}</span>
                  </div>
                  <div className="flex bg-white">
                    <div className="flex-1 flex justify-between items-center px-2.5 py-1 border-r border-slate-100">
                      <span className="text-[9px] font-bold text-emerald-600/80">장기</span>
                      <span className="text-[11px] font-black text-emerald-600">{formatMoney(team.twoMonthsAgoLongTerm)}</span>
                    </div>
                    <div className="flex-1 flex justify-between items-center px-2.5 py-1">
                      <span className="text-[9px] font-bold text-amber-600/80">일반</span>
                      <span className="text-[11px] font-black text-amber-600">{formatMoney(team.twoMonthsAgoGeneral)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {team.topFCs && team.topFCs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 mb-0.5">이달의 팀 상위 3명</span>
                  {team.topFCs.map((fc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 p-2 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 'bg-gradient-to-br from-amber-600 to-amber-800'}`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800 text-[13px] flex items-center gap-1">
                          {fc.name} <span className="text-[9px] text-slate-400 bg-white border border-slate-200 px-1 rounded">{fc.rank}</span>
                        </span>
                      </div>
                      <span className="font-black text-emerald-600 text-[13px]">{formatMoney(fc.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}