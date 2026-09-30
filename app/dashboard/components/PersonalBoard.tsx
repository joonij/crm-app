// app/dashboard/components/PersonalBoard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Car, FileText, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Clock, Users, Gift, Plus, BarChart3, Edit3, DollarSign, X
} from "lucide-react";
import PushSubscribeButton from '@/components/PushSubscribeButton';
import { getLocalString, parseLocalDate, formatMoney, getRetouchTheme, getStatusColor } from "../utils";

export default function PersonalBoard({ data, actions }: any) {
  const { agentId, myTargetAmount, pipelines, schedules, clientsList, oldClients, sangryungClients, autoRenewals, completed } = data;
  const { setPipelines, setMyTargetAmount } = actions;

  const [completedTab, setCompletedTab] = useState<0 | 1 | 2>(0); 
  const [timelineOffset, setTimelineOffset] = useState(0); 
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ client_name: '', contract_details: '', expected_amount: '', expected_date: '' });
  const [pipelineForm, setPipelineForm] = useState({ 
    client_id: null as number | null, 
    client_name: '', 
    details: '', 
    amount: '', 
    date: getLocalString(new Date(Date.now() + 86400000 * 3))
  });

  const safePipelines = pipelines || [];
  const safeCompleted = completed || [];

  const totalPipelineAmount = safePipelines.reduce((sum: number, p: any) => {
    return sum + ((p.expected_date === '9999-12-31' || p.status === '보류') ? 0 : (p.expected_amount || 0));
  }, 0);

  const filteredCompleted = safeCompleted.filter((c: any) => c.tabIndex === completedTab);
  const currentTabTotalAmount = filteredCompleted.reduce((sum: number, item: any) => sum + (item.monthly_premium || 0), 0);

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

  const handleTargetChange = async () => {
    if (!agentId) return;
    const input = prompt("이번 달 목표액(월납)을 숫자로만 입력해주세요.", String(myTargetAmount));
    if (input && !isNaN(Number(input))) {
      const newTarget = Number(input);
      const { error } = await supabase.from('agents').update({ monthly_target: newTarget }).eq('id', agentId);
      if (!error) setMyTargetAmount(newTarget);
    }
  };

  const handleAmountChange = (e: any) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPipelineForm({ ...pipelineForm, amount: val ? Number(val).toLocaleString() : '' });
  };

  const handleAddPipeline = async () => {
    if (!pipelineForm.client_name || !pipelineForm.details || !pipelineForm.amount || !pipelineForm.date) {
      return alert("모든 항목을 입력해주세요.");
    }
    const insertPayload = {
      agent_id: agentId, 
      client_id: pipelineForm.client_id || null, 
      client_name: pipelineForm.client_name,
      contract_details: pipelineForm.details, 
      expected_amount: Number(pipelineForm.amount.replace(/,/g, '')), 
      expected_date: pipelineForm.date, 
      status: '미진행', 
      history: []
    };
    const { data: resData } = await supabase.from('sales_pipelines').insert(insertPayload).select();
    if (resData) {
      setPipelines([...safePipelines, resData[0]]);
      setPipelineForm({ 
        client_id: null, client_name: '', details: '', amount: '', 
        date: getLocalString(new Date(Date.now() + 86400000 * 3)) 
      });
    }
  };

  const handleDeletePipeline = async (id: number) => {
    if(!confirm("완전히 삭제하시겠습니까?")) return;
    await supabase.from('sales_pipelines').delete().eq('id', id);
    setPipelines(safePipelines.filter((p: any) => p.id !== id));
  };

  const handleEditAmountChange = (e: any) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setEditForm({ ...editForm, expected_amount: val ? Number(val).toLocaleString() : '' });
  };

  const handleSaveEdit = async (id: number) => {
    const updatePayload = {
      client_name: editForm.client_name, 
      contract_details: editForm.contract_details,
      expected_amount: Number(editForm.expected_amount.replace(/,/g, '')), 
      expected_date: editForm.expected_date,
    };
    await supabase.from('sales_pipelines').update(updatePayload).eq('id', id);
    setPipelines(safePipelines.map((p: any) => p.id === id ? { ...p, ...updatePayload } : p));
    setEditingPipelineId(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="block sm:hidden"><PushSubscribeButton /></div>

      {/* 모바일 상단 요약 박스 */}
      <div className="sm:hidden flex flex-col gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-600">이번 달 영업 목표</span>
          <button onClick={handleTargetChange} className="text-sm font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors">
            {myTargetAmount.toLocaleString()}원 <Edit3 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-xs font-bold text-slate-600">진행사항 합산</span>
          <span className="text-sm font-black text-indigo-700">{totalPipelineAmount.toLocaleString()}원</span>
        </div>
      </div>

      {/* 계약 진행사항 파이프라인 영역 */}
      <div className="bg-white border border-indigo-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <h3 className="font-black text-indigo-900 flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5"><BarChart3 className="w-5 h-5 text-indigo-600" /> 계약 진행사항 리스트</div>
              <Link href="/daily-closing" className="sm:hidden bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">마감 작성</Link>
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
        
        {/* 파이프라인 입력 폼 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
          <div className="relative">
            <input type="text" placeholder="고객 이름 검색" value={pipelineForm.client_name} onChange={(e) => setPipelineForm({ ...pipelineForm, client_name: e.target.value, client_id: null })} onFocus={() => setShowClientDropdown(true)} onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)} className="w-full text-sm p-2.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"/>
            {showClientDropdown && pipelineForm.client_name && (
              <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                {clientsList.filter((c: any) => c.name.includes(pipelineForm.client_name)).map((c: any) => (
                  <li key={c.id} onClick={() => setPipelineForm({ ...pipelineForm, client_name: c.name, client_id: c.id })} className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer">{c.name}</li>
                ))}
              </ul>
            )}
          </div>
          <input type="text" placeholder="계약 내용" value={pipelineForm.details} onChange={(e) => setPipelineForm({...pipelineForm, details: e.target.value})} className="w-full text-sm p-2.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-400" />
          <input type="text" placeholder="예상 금액" value={pipelineForm.amount} onChange={handleAmountChange} className="w-full text-sm p-2.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 font-bold text-indigo-700" />
          <div className="flex items-center gap-2 w-full text-sm rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100">
            <input type="date" value={pipelineForm.date === '9999-12-31' ? '' : pipelineForm.date} disabled={pipelineForm.date === '9999-12-31'} onChange={(e) => setPipelineForm({...pipelineForm, date: e.target.value})} className="w-full outline-none text-gray-600 disabled:opacity-50 bg-transparent" />
            <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 cursor-pointer shrink-0 border-l border-slate-200 pl-2">
              <input type="checkbox" checked={pipelineForm.date === '9999-12-31'} onChange={(e) => setPipelineForm({...pipelineForm, date: e.target.checked ? '9999-12-31' : getLocalString(new Date(Date.now() + 86400000 * 3))})} className="cursor-pointer" />보류
            </label>
          </div>
          <button onClick={handleAddPipeline} className="min-h-[42px] sm:min-h-[32px] sm:col-span-2 md:col-span-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"><Plus className="w-4 h-4"/> 추가</button>
        </div>

        {/* 파이프라인 목록 및 타임라인 */}
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
              
              {/* 활동 내역 라인 */}
              <div className="flex border-b border-slate-200 bg-slate-50/80 relative z-20">
                <div className="w-[280px] shrink-0 border-r border-slate-200 p-3 relative flex items-start pt-4 bg-slate-50/80">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-[13px] text-slate-800 flex items-center gap-1.5"><Edit3 className="w-4 h-4 text-emerald-600"/> 활동 내역</span>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                    {timelineDays.map((d, i) => (<div key={i} className={`border-r border-slate-200/60 h-full ${d.getTime() === today.getTime() ? 'bg-indigo-50/50' : ''}`}></div>))}
                  </div>
                  <div className="relative z-10 grid h-full" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                    {timelineDays.map((d, i) => {
                      const dateStr = getLocalString(d); 
                      const daySchedules = schedules.filter((s: any) => s.date === dateStr).sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));
                      return (
                        <div key={i} className="p-1.5 flex flex-col gap-1.5">
                          {daySchedules.map((sch: any) => {
                            const displayTitle = (sch.category || '일정');
                            return (
                              <div key={sch.id} className="bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-1.5 shadow-sm flex flex-col hover:bg-emerald-100 transition-colors group/tag cursor-pointer">
                                <span className="text-[10px] font-black text-emerald-800 truncate leading-tight flex items-center gap-1 mb-0.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>{displayTitle}
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

              {/* 진행사항 아이템 렌더링 */}
              {safePipelines.sort((a:any, b:any) => parseLocalDate(a.expected_date).getTime() - parseLocalDate(b.expected_date).getTime()).map((p: any) => {
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
                    <div className="w-[280px] shrink-0 border-r border-slate-100 p-3 relative z-20 bg-white group-hover:bg-slate-50/50">
                      {editingPipelineId === p.id ? (
                        <div className="flex flex-col gap-2 p-1">
                          <input type="text" value={editForm.client_name} onChange={e => setEditForm({...editForm, client_name: e.target.value})} className="border border-indigo-200 p-1.5 text-xs rounded outline-none focus:ring-1 focus:ring-indigo-400 font-bold" placeholder="고객명"/>
                          <input type="text" value={editForm.contract_details} onChange={e => setEditForm({...editForm, contract_details: e.target.value})} className="border border-indigo-200 p-1.5 text-[11px] rounded outline-none focus:ring-1 focus:ring-indigo-400" placeholder="계약 내용"/>
                          <input type="text" value={editForm.expected_amount} onChange={handleEditAmountChange} className="border border-indigo-200 p-1.5 text-xs rounded outline-none focus:ring-1 focus:ring-indigo-400 font-bold text-indigo-600" placeholder="예상 금액"/>
                          <div className="flex items-center gap-1.5">
                            <input type="date" value={editForm.expected_date === '9999-12-31' ? '' : editForm.expected_date} disabled={editForm.expected_date === '9999-12-31'} onChange={e => setEditForm({...editForm, expected_date: e.target.value})} className="flex-1 border border-indigo-200 p-1.5 text-xs rounded outline-none focus:ring-1 focus:ring-indigo-400 text-slate-600 disabled:bg-slate-50 disabled:opacity-50"/>
                            <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 cursor-pointer shrink-0 bg-white border border-indigo-200 px-1.5 py-1.5 rounded">
                              <input type="checkbox" checked={editForm.expected_date === '9999-12-31'} onChange={(e) => setEditForm({...editForm, expected_date: e.target.checked ? '9999-12-31' : getLocalString(new Date(Date.now() + 86400000 * 3))})} />보류
                            </label>
                          </div>
                          <div className="flex gap-1.5 mt-1">
                            <button onClick={() => handleSaveEdit(p.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded shadow-sm cursor-pointer">저장</button>
                            <button onClick={() => setEditingPipelineId(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-1.5 rounded shadow-sm cursor-pointer">취소</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => { setEditingPipelineId(p.id); setEditForm({ client_name: p.client_name, contract_details: p.contract_details, expected_amount: p.expected_amount.toLocaleString(), expected_date: p.expected_date }); }} className="absolute top-3 right-8 text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3.5 h-3.5"/></button>
                          <button onClick={() => handleDeletePipeline(p.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5"/></button>
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
                        {timelineDays.map((d, i) => (<div key={i} className={`border-r border-slate-100/50 h-full ${d.getTime() === today.getTime() ? 'bg-indigo-50/30' : ''}`}></div>))}
                      </div>
                      {!isOutOfView && (
                        <div className="absolute top-[60%] -translate-y-1/2 h-5 z-10" style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}>
                          <div className={`w-full h-full bg-slate-200 overflow-hidden relative shadow-sm flex items-center border border-slate-300/50 ${pStartMs < tlStartMs ? 'rounded-r-md border-l-0' : 'rounded-l-md'} ${pEndMs >= tlEndMs ? 'rounded-l-md border-r-0' : 'rounded-r-md'} ${pStartMs >= tlStartMs && pEndMs < tlEndMs ? 'rounded-md' : ''}`}>
                            <div className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-1000" style={{ width: `100%` }}><div className="absolute inset-0 bg-white/10 w-full -skew-x-12 translate-x-2"></div></div>
                          </div>
                        </div>
                      )}
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
                          <div key={idx} className="absolute z-20 flex flex-col items-center top-[60%] -translate-y-1/2" style={{ left: `${hLeft}%`, transform: 'translate(-50%, -50%)' }}>
                            <div className={`absolute bottom-full mb-1 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm border ${tagClass} z-10`}>{h.status}</div>
                            <div className={`w-2.5 h-2.5 rounded-full bg-white border-[2.5px] shadow-sm mt-3 relative z-0 ${dotClass}`}></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              })}
              {safePipelines.length === 0 && <div className="flex items-center justify-center h-32 text-sm text-slate-400 font-bold">진행 중인 진행사항 내역이 없습니다.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* 체결 완료 현황 블럭 */}
      <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-emerald-100 pb-3 gap-3">
          <h3 className="font-black text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 체결 완료 현황
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-emerald-700 font-bold text-xs">월 계약금액</span>
              <span className="font-black text-emerald-700">{formatMoney(currentTabTotalAmount)}</span>
            </div>
            <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button onClick={() => setCompletedTab(0)} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 sm:flex-none ${completedTab === 0 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}>당월</button>
              <button onClick={() => setCompletedTab(1)} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 sm:flex-none ${completedTab === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}>전월</button>
              <button onClick={() => setCompletedTab(2)} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 sm:flex-none ${completedTab === 2 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}>전전월</button>
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
                {filteredCompleted.map((ins: any) => (
                  <tr key={ins.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{ins.clientName}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                      <span className="border border-slate-200 bg-white px-1.5 py-0.5 rounded shadow-sm">{ins.insurance_company}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{ins.product_name}</td>
                    <td className="px-4 py-3 font-black text-blue-600 flex items-center gap-1">{formatMoney(ins.monthly_premium)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500"><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/>{ins.subscription_date}</span></td>
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

      {/* 하단 3개 알림 그리드 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 재터치 필요 */}
        <div className="bg-white border border-rose-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="bg-rose-50/80 p-4 border-b border-rose-100 flex justify-between items-center shrink-0 rounded-t-2xl">
            <div>
              <h3 className="font-black text-rose-900 flex items-center gap-2 text-base"><Clock className="w-5 h-5 text-rose-500" /> 재터치 필요</h3>
              <p className="text-[10px] text-rose-600/80 font-bold mt-0.5">60일 이상 업데이트 없음</p>
            </div>
            <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0">{(oldClients || []).length}명</span>
          </div>
          <div className="p-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-rose-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {(oldClients || []).length > 0 ? (
              <ul className="space-y-1">
                {oldClients.map((client: any) => {
                  const theme = getRetouchTheme(client.daysSinceUpdate);
                  return (
                    <li key={client.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${theme.bg} ${theme.text}`}>{theme.label}</span>
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

        {/* 상령일 임박 */}
        <div className="bg-white border border-purple-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="bg-purple-50/80 p-4 border-b border-purple-100 flex justify-between items-center shrink-0 rounded-t-2xl">
            <div>
              <h3 className="font-black text-purple-900 flex items-center gap-2 text-base"><Gift className="w-5 h-5 text-purple-500" /> 상령일 임박</h3>
              <p className="text-[10px] text-purple-600/80 font-bold mt-0.5">보험나이 인상 D-30 이내</p>
            </div>
            <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0">{(sangryungClients || []).length}명</span>
          </div>
          <div className="p-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-purple-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {(sangryungClients || []).length > 0 ? (
              <ul className="space-y-1">
                {sangryungClients.map((client: any) => (
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

        {/* 자동차 보험 갱신 */}
        <div className="bg-white border border-amber-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex justify-between items-center shrink-0 rounded-t-2xl">
            <h3 className="font-bold text-amber-900 flex items-center gap-2"><Car className="w-5 h-5 text-amber-500" /> 자동차/다이렉트 갱신</h3>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">만기 60일 이내</span>
          </div>
          <div className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {(autoRenewals || []).length > 0 ? (
              <ul className="grid grid-cols-1 gap-2">
                {autoRenewals.map((ins: any) => (
                  <li key={ins.id} className="flex justify-between items-center p-3 hover:bg-amber-50/30 rounded-xl border border-gray-100 transition-colors group">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-gray-900 truncate">{ins.clientName}</p>
                        <span className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold truncate">{ins.insurance_company}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium truncate">만기일: {ins.maturity_date}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-black px-2 py-1.5 rounded-md shadow-sm border ${ins.dDay <= 30 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-amber-600 border-amber-100'}`}>D-{ins.dDay}</span>
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
  );
}