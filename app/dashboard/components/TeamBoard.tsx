// app/dashboard/components/TeamBoard.tsx
"use client";

import { useState } from "react";
import { Users, UserPlus, DollarSign, Calendar, Trophy, Medal, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney, formatAmtShort, getStatusColor, parseLocalDate, getLocalString } from "../utils";

export default function TeamBoard({ data }: any) {
  const { 
    teamName, teamTotalMembers, teamYearlyStats, teamTopFCs, 
    teamContractsByAgent, totalTeamInProgress, totalTeamCompleted 
  } = data;

  // 팀원별 타임라인 이동 상태 (agentName을 key로 사용하여 각각 개별 이동 가능)
  const [timelineOffsets, setTimelineOffsets] = useState<Record<string, number>>({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const TOTAL_TIMELINE_MS = 14 * 86400000;

  // 선그래프 차트를 위한 값 계산
  const maxYearlyAmt = Math.max(...(teamYearlyStats || []).map((s: any) => s.amount), 1000000);
  const maxYearlyAct = Math.max(...(teamYearlyStats || []).map((s: any) => s.activeCount), 5);
  const chartH = 140;
  const paddingX = 40;
  const paddingY = 20;
  const xStep = (1000 - 2 * paddingX) / 11;
  const scaleAmt = (chartH - 2 * paddingY) / maxYearlyAmt;
  const scaleAct = (chartH - 2 * paddingY) / maxYearlyAct;
  const pointsAmt = (teamYearlyStats || []).map((s: any, i: number) => `${paddingX + i * xStep},${chartH - paddingY - (s.amount * scaleAmt)}`).join(' ');
  const pointsAct = (teamYearlyStats || []).map((s: any, i: number) => `${paddingX + i * xStep},${chartH - paddingY - (s.activeCount * scaleAct)}`).join(' ');

  // 팀 전체 목표 금액 계산
  const totalTeamTarget = (teamContractsByAgent || []).reduce((sum: number, m: any) => sum + (m.targetAmount || 0), 0);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      
      {/* ⭐️ 연간 누적 실적 및 가동 현황 (선그래프 포함) */}
      {teamYearlyStats && (
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-slate-100 pb-3 mb-4 gap-2">
            <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> {new Date().getFullYear()}년 연간 실적 및 가동 현황
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span><span className="text-xs font-bold text-slate-600">실적</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span><span className="text-xs font-bold text-slate-600">가동인원</span></div>
              <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full ml-2">{teamName} (총 {teamTotalMembers}명)</span>
            </div>
          </div>

          <div className="w-full h-[160px] relative mb-6">
            <svg viewBox={`0 0 1000 ${chartH}`} className="w-full h-full overflow-visible">
              <line x1={paddingX} y1={chartH - paddingY} x2={1000 - paddingX} y2={chartH - paddingY} stroke="#e2e8f0" strokeWidth="1" />
              <line x1={paddingX} y1={(chartH - paddingY)/2} x2={1000 - paddingX} y2={(chartH - paddingY)/2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <polyline fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pointsAmt} />
              <polyline fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" points={pointsAct} />
              {teamYearlyStats.map((s: any, i: number) => {
                const cx = paddingX + i * xStep;
                const cyAmt = chartH - paddingY - (s.amount * scaleAmt);
                const cyAct = chartH - paddingY - (s.activeCount * scaleAct);
                return (
                  <g key={i}>
                    <circle cx={cx} cy={cyAmt} r="4" fill="white" stroke="#6366f1" strokeWidth="2" />
                    {s.amount > 0 && <text x={cx} y={cyAmt - 12} textAnchor="middle" fill="#4f46e5" fontSize="10" fontWeight="bold">{formatAmtShort(s.amount)}</text>}
                    <circle cx={cx} cy={cyAct} r="3.5" fill="white" stroke="#10b981" strokeWidth="2" />
                    {s.activeCount > 0 && <text x={cx} y={cyAct + 14} textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">{s.activeCount}명</text>}
                    <text x={cx} y={chartH} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">{s.month}월</text>
                  </g>
                )
              })}
            </svg>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2 mt-2">
            {teamYearlyStats.map((y: any) => (
              <div key={y.month} title={`[디버깅] 포함된 계약 ID:\n${y.contractIds.join(', ') || '없음'}`} className="bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-help">
                <span className="text-[11px] font-bold text-slate-500 mb-1.5">{y.month}월</span>
                <span className={`text-xs font-black mb-2 ${y.amount > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {y.amount > 0 ? formatAmtShort(y.amount) : '-'}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-full ${y.activeCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {y.activeCount > 0 ? `가동 ${y.activeCount}명` : '가동 0명'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⭐️ 팀 TOP 3 명예의 전당 */}
      {teamTopFCs && teamTopFCs.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-4 sm:p-5 rounded-2xl shadow-md flex flex-col xl:flex-row xl:items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-yellow-200/30">
            <Trophy className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-2 font-black text-yellow-800 shrink-0 border-b xl:border-b-0 xl:border-r border-yellow-200/60 pb-3 xl:pb-0 pr-0 xl:pr-5 w-full xl:w-auto justify-start z-10">
            <Medal className="w-6 h-6 text-yellow-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-yellow-700 uppercase tracking-widest leading-tight">Team Honor</span>
              <span className="text-lg leading-tight">이달의 팀 TOP 3</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1 z-10">
            {teamTopFCs.map((fc: any, idx: number) => (
              <div key={idx} className="flex-1 bg-white border border-yellow-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-sm hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shadow-inner ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 'bg-gradient-to-br from-amber-600 to-amber-800'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-800 flex flex-col sm:block">
                    {fc.name} <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded ml-0 sm:ml-1 mt-0.5 sm:mt-0 inline-block">{fc.rank}</span>
                  </span>
                </div>
                <span className="font-black text-emerald-600 text-sm tracking-tight">{formatMoney(fc.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 팀원별 현황 상세 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-black text-blue-900 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600"/> 팀 실적 현황</h2>
          <p className="text-xs text-blue-700 font-bold mt-1">우리 팀원들이 진행 중인 현황과 이번 달 달성 금액입니다.</p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-blue-100 rounded-xl shadow-sm flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-slate-500">이번 달 목표</span>
            <span className="font-black text-slate-700 text-base sm:text-lg">{formatMoney(totalTeamTarget)}</span>
          </div>
          <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-blue-100 rounded-xl shadow-sm flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-orange-500">진행사항 합산</span>
            <span className="font-black text-orange-600 text-base sm:text-lg">{formatMoney(totalTeamInProgress)}</span>
          </div>
          <div className="flex flex-col items-end bg-white px-3 sm:px-4 py-2 border border-blue-100 rounded-xl shadow-sm flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-emerald-600">이번 달 체결</span>
            <span className="font-black text-emerald-600 text-base sm:text-lg">{formatMoney(totalTeamCompleted)}</span>
          </div>
        </div>
      </div>

      {(teamContractsByAgent || []).map((member: any) => {
        
        // ⭐️ 해당 팀원의 타임라인 날짜 계산
        const offset = timelineOffsets[member.agentName] || 0;
        const timelineStart = new Date(today);
        timelineStart.setDate(today.getDate() - 3 + (offset * 7));
        const timelineDays = Array.from({length: 14}, (_, i) => {
          const d = new Date(timelineStart);
          d.setDate(d.getDate() + i);
          return d;
        });

        return (
          <div key={member.agentName} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 mb-4 gap-3">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <span className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-500" /> {member.agentName} <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{member.rank || 'FC'}</span></span>
                {(member.rank || '').toUpperCase().includes('SM') && <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">팀장(SM)</span>}
              </h3>
              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 border border-slate-200 rounded flex-1 sm:flex-none text-center">
                  목표: {formatMoney(member.targetAmount)}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 border border-orange-100 rounded flex-1 sm:flex-none text-center">
                  진행 합산: {formatMoney(member.inProgressAmount)}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-100 rounded flex-1 sm:flex-none text-center">
                  체결 (당월): {formatMoney(member.completedAmount)}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-700 mb-2 border-l-2 border-indigo-500 pl-2">현재 진행사항 리스트</h4>
              {member.pipelines.length > 0 ? (
                
                // ⭐️ 개인 영업 보드와 완벽히 동일한 타임라인/막대그래프 구조
                <div className="w-full overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm mt-3">
                  <div className="min-w-[1000px] flex flex-col relative">
                    
                    {/* 타임라인 헤더부 */}
                    <div className="sticky top-0 z-40 flex bg-slate-50 border-b border-slate-200 shadow-sm">
                      <div className="w-[280px] shrink-0 border-r border-slate-200 p-3 flex items-center justify-between bg-slate-50">
                        <span className="font-bold text-xs text-slate-500">진행 현황 막대그래프</span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setTimelineOffsets(p => ({...p, [member.agentName]: (p[member.agentName] || 0) - 1}))} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer">
                            <ChevronLeft className="w-4 h-4 text-slate-500"/>
                          </button>
                          <button onClick={() => setTimelineOffsets(p => ({...p, [member.agentName]: 0}))} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm text-slate-600 hover:text-indigo-600 cursor-pointer">
                            오늘
                          </button>
                          <button onClick={() => setTimelineOffsets(p => ({...p, [member.agentName]: (p[member.agentName] || 0) + 1}))} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer">
                            <ChevronRight className="w-4 h-4 text-slate-500"/>
                          </button>
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

                    {/* 타임라인 바디부 (그래프 및 히스토리 점) */}
                    <div className="flex flex-col relative pb-4 pt-1">
                      {member.pipelines.map((p: any) => {
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
                        const statusColor = getStatusColor(p.status);
                        const isHold = p.expected_date === '9999-12-31' || p.status === '보류';

                        return (
                          <div key={p.id} className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                            
                            {/* 좌측 고객 및 계약 정보 영역 */}
                            <div className="w-[280px] shrink-0 border-r border-slate-100 p-3 relative z-20 bg-white group-hover:bg-slate-50/50 flex flex-col justify-center">
                              <div className="flex items-center gap-1.5 mb-1.5 pr-4">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded shadow-sm whitespace-nowrap ${statusColor}`}>{p.status}</span>
                                <span className="font-bold text-sm text-slate-800 truncate">{p.client_name}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mb-1.5 pr-4">{p.contract_details}</p>
                              <div className="flex justify-between items-center pr-4 mt-auto">
                                <p className={`text-xs font-black ${isHold ? 'text-slate-400 line-through decoration-slate-300' : 'text-indigo-600'}`}>{formatMoney(p.expected_amount)}</p>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                  {p.expected_date === '9999-12-31' ? '일정 보류' : `${p.expected_date.slice(5).replace('-', '/')} 예정`}
                                </span>
                              </div>
                            </div>

                            {/* 우측 진행 바 및 점찍기 영역 */}
                            <div className="flex-1 relative min-h-[64px]">
                              {/* 배경 세로선 */}
                              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                                {timelineDays.map((d, i) => (<div key={i} className={`border-r border-slate-100/50 h-full ${d.getTime() === today.getTime() ? 'bg-indigo-50/30' : ''}`}></div>))}
                              </div>
                              
                              {/* 가로 진행 바 */}
                              {!isOutOfView && (
                                <div className="absolute top-[50%] -translate-y-1/2 h-5 z-10" style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}>
                                  <div className={`w-full h-full bg-slate-200 overflow-hidden relative shadow-sm flex items-center border border-slate-300/50 ${pStartMs < tlStartMs ? 'rounded-r-md border-l-0' : 'rounded-l-md'} ${pEndMs >= tlEndMs ? 'rounded-l-md border-r-0' : 'rounded-r-md'} ${pStartMs >= tlStartMs && pEndMs < tlEndMs ? 'rounded-md' : ''}`}>
                                    <div className="absolute left-0 top-0 h-full bg-indigo-400 transition-all duration-1000" style={{ width: `100%` }}><div className="absolute inset-0 bg-white/10 w-full -skew-x-12 translate-x-2"></div></div>
                                  </div>
                                </div>
                              )}

                              {/* 날짜별 히스토리 마커(점) */}
                              {p.history && p.history.map((h: any, idx: number) => {
                                const hTime = parseLocalDate(h.date).getTime();
                                if (hTime < tlStartMs || hTime >= tlEndMs) return null;
                                const hLeft = ((hTime - tlStartMs + 43200000) / TOTAL_TIMELINE_MS) * 100;
                                let tagClass = getStatusColor(h.status);
                                let dotClass = "border-slate-400";
                                if (h.status.includes('거절')) dotClass = "border-rose-500";
                                else if (h.status.includes('보류') || h.status.includes('미진행')) dotClass = "border-slate-300";
                                else if (h.status.includes('계약') || h.status.includes('증권') || h.status.includes('청약 완료')) dotClass = "border-emerald-500";
                                else if (h.status.includes('픽스') || h.status.includes('TA')) dotClass = "border-indigo-500";
                                else dotClass = "border-blue-500";

                                return (
                                  <div key={idx} className="absolute z-20 flex flex-col items-center top-[50%] -translate-y-1/2" style={{ left: `${hLeft}%`, transform: 'translate(-50%, -50%)' }}>
                                    <div className={`absolute bottom-full mb-1 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm border ${tagClass}`}>{h.status}</div>
                                    <div className={`w-2.5 h-2.5 rounded-full bg-white border-[2.5px] shadow-sm mt-3 relative ${dotClass}`}></div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-400 py-2">진행 중인 진행사항 내역이 없습니다.</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2 border-l-2 border-emerald-500 pl-2">이번 달 체결 완료</h4>
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
        )
      })}
    </div>
  );
}