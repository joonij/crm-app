// app/daily-closing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Loader2, Save, 
  CalendarDays, Edit3, Plus, Search, ChevronDown, X
} from "lucide-react";

// ⭐️ 1. SALES_STEPS 객체 배열로 변경 및 "미진행" 추가
const SALES_STEPS = [
  { id: "step00", label: "미진행" },
  { id: "step01", label: "첫 연락 (TA)" },
  { id: "step02", label: "1차 미팅 픽스" },
  { id: "step03", label: "1차 미팅 진행" },
  { id: "step04", label: "기본 인적사항 확보" },
  { id: "step05", label: "보험심사평가원 확보" },
  { id: "step06", label: "상담 요청" },
  { id: "step07", label: "비교분석표 작성" },
  { id: "step08", label: "고등요청" },
  { id: "step09", label: "설계요청" },
  { id: "step10", label: "추가 미팅 픽스" },
  { id: "step11", label: "추가 미팅 진행" },
  { id: "step12", label: "청약 진행" },
  { id: "step13", label: "비교안내확인서 진행" },
  { id: "step14", label: "모니터링 처리" },
  { id: "step15", label: "소개 요청" },
  { id: "step16", label: "증권 전달" },
];

const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "연락처없음";
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.length === 11) return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  if (clean.length === 10) return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  return phone;
};

const getLocalString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DailyClosingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentId, setAgentId] = useState<number | null>(null);
  
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [tomorrowSchedules, setTomorrowSchedules] = useState<any[]>([]); 
  const [clients, setClients] = useState<any[]>([]);

  const tomorrowStr = getLocalString(new Date(Date.now() + 86400000));
  const [form, setForm] = useState({
    date: tomorrowStr,
    time: "09:00",
    category: "AP", 
    content: "",
    client_id: "", 
  });
  
  const [clientSearch, setClientSearch] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchClosingData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      
      const { data: agentData } = await supabase.from('agents').select('id').eq('auth_id', user.id).single();
      if (!agentData) return;
      const myAgentId = agentData.id;
      setAgentId(myAgentId);

      // ⭐️ 고객 목록 로드
      const { data: cData } = await supabase.from('clients').select('id, name, phone').eq('agent_id', myAgentId);
      if(cData) setClients(cData);

      // 임시저장 데이터 로드 
      const draft = localStorage.getItem("dailyClosingDraft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setPipelines(parsed.pipelines || []);
          setTodaySchedules(parsed.todaySchedules || []);
          setTomorrowSchedules(parsed.tomorrowSchedules || []);
          if (parsed.form) setForm(parsed.form);
          setIsLoading(false);
          return;
        } catch(e) {}
      }

      // ⭐️ 실제 DB 데이터 로드 (draft가 없을 때만)
      const todayStr = getLocalString(new Date());

      // 1. 진행중인 파이프라인 가져오기 (거절/계약/증권전달 제외)
      const { data: pData } = await supabase.from('sales_pipelines')
        .select('*')
        .eq('agent_id', myAgentId)
        .not('status', 'in', '("계약","거절","증권 전달")')
        .order('expected_date', { ascending: true });
      if(pData) setPipelines(pData);

      // 2. 오늘 일정 가져오기
      const { data: sData } = await supabase.from('schedules')
        .select('*')
        .eq('agent_id', myAgentId)
        .eq('schedule_date', todayStr);
      if(sData) setTodaySchedules(sData);

      setIsLoading(false);
    };

    fetchClosingData();

    if (!window.location.search.includes('step=')) {
      window.history.replaceState(null, '', '?step=1');
    }
    
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const currentStep = parseInt(params.get('step') || '1', 10);
      setStep(currentStep);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isLoading && step !== 4) {
      localStorage.setItem("dailyClosingDraft", JSON.stringify({
        pipelines, todaySchedules, tomorrowSchedules, form
      }));
    }
  }, [pipelines, todaySchedules, tomorrowSchedules, form, isLoading, step]);

  const cleanSearchInput = clientSearch.replace(/\s+/g, "").toLowerCase();
  const cleanPhoneSearch = clientSearch.replace(/[^0-9]/g, "");
  const filteredClients = clientSearch
    ? clients.filter(c => {
        const matchName = c.name ? c.name.replace(/\s+/g, "").toLowerCase().includes(cleanSearchInput) : false;
        const matchPhone = cleanPhoneSearch && c.phone ? c.phone.replace(/[^0-9]/g, "").includes(cleanPhoneSearch) : false;
        return matchName || matchPhone;
      })
    : clients;

  const handleStatusChange = (id: number, newStatus: string) => {
    const todayStr = getLocalString(new Date());
    
    setPipelines(pipelines.map(p => {
      if (p.id === id) {
        const updatedHistory = p.history ? [...p.history] : [];
        const todayIdx = updatedHistory.findIndex((h: any) => h.date === todayStr);
        
        if (todayIdx >= 0) {
          updatedHistory[todayIdx] = { date: todayStr, status: newStatus };
        } else {
          updatedHistory.push({ date: todayStr, status: newStatus });
        }

        return { ...p, status: newStatus, history: updatedHistory };
      }
      return p;
    }));
  };

  const handleWorklogChange = (id: number, text: string) => {
    setTodaySchedules(todaySchedules.map(s => s.id === id ? { ...s, description: text } : s));
  };

  const handleAddSchedule = () => {
    if (!form.content.trim()) return alert("상세 내용을 입력해주세요.");
    
    const clientName = clients.find(c => String(c.id) === form.client_id)?.name || "";
    
    setTomorrowSchedules([
      ...tomorrowSchedules, 
      { 
        id: Date.now(),
        isNew: true, // DB 신규 삽입 식별용
        time: form.time + ":00", 
        category: form.category, 
        content: form.content, 
        client_name: clientName,
        client_id: form.client_id
      }
    ]);

    setForm(prev => ({ ...prev, content: "", client_id: "", category: "AP" }));
    setClientSearch("");
  };

  const handleDeleteSchedule = (id: number) => {
    setTomorrowSchedules(tomorrowSchedules.filter(s => s.id !== id));
  };

  const handleBack = () => {
    if (step > 1) {
      window.history.back(); 
    } else {
      router.push("/dashboard");
    }
  };

  // ⭐️ 3. 실제 DB 업데이트 연동 (Mock 데이터 처리 제거)
  const nextStep = async () => {
    setIsSaving(true);
    try {
      if (step === 1) {
        for (const p of pipelines) {
          await supabase.from('sales_pipelines').update({ status: p.status, history: p.history }).eq('id', p.id);
        }
      } else if (step === 2) {
        for (const s of todaySchedules) {
          await supabase.from('schedules').update({ description: s.description }).eq('id', s.id);
        }
      } else if (step === 3) {
        let finalTomorrowSchedules = [...tomorrowSchedules];
        if (form.content.trim()) {
          const clientName = clients.find(c => String(c.id) === form.client_id)?.name || "";
          finalTomorrowSchedules.push({ 
            id: Date.now(), isNew: true, time: form.time + ":00", category: form.category, content: form.content, client_name: clientName, client_id: form.client_id 
          });
        }
        
        // 내일 일정 일괄 삽입
        const newSchedules = finalTomorrowSchedules.filter(s => s.isNew).map(s => ({
          agent_id: agentId,
          client_id: s.client_id ? Number(s.client_id) : null,
          schedule_date: tomorrowStr,
          schedule_time: s.time,
          category: s.category,
          title: s.client_name ? `${s.client_name} ${s.category}` : s.category,
          description: s.content,
          type: "personal"
        }));

        if (newSchedules.length > 0) {
          await supabase.from('schedules').insert(newSchedules);
        }
        
        localStorage.removeItem("dailyClosingDraft");
        
        const next = 4;
        window.history.pushState(null, '', `?step=${next}`);
        setStep(next);
        window.scrollTo(0, 0); 
        return;
      }
      
      const next = step + 1;
      window.history.pushState(null, '', `?step=${next}`);
      setStep(next);
      window.scrollTo(0, 0); 
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="fixed inset-0 z-[100] w-full h-full min-h-screen bg-white sm:bg-slate-50 flex flex-col pb-24 sm:pb-8 sm:p-8 overflow-y-auto">
      <div className="bg-white sm:rounded-3xl sm:shadow-lg sm:border border-slate-200 flex-1 flex flex-col overflow-hidden max-w-2xl mx-auto w-full relative">
        
        <div className="sticky top-0 z-50 bg-slate-900 p-4 sm:p-6 text-white shadow-md">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              {step !== 4 && (
                <button onClick={handleBack} className="p-1 -ml-1 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10">
                  <ChevronLeft className="w-6 h-6"/>
                </button>
              )}
              <h2 className="text-lg sm:text-xl font-black">일일 마감 보고</h2>
            </div>
            <div className="text-lg sm:text-2xl font-black text-indigo-400">
              {step === 4 ? '마감 완료 🎉' : `Step ${step}/3`}
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-300 ml-8">
            {step === 1 ? '1. 파이프라인 진도 체크' : 
             step === 2 ? '2. 오늘의 업무 후기' : 
             step === 3 ? '3. 내일의 일정(스케줄) 관리' : 
             '오늘 하루도 정말 고생 많으셨습니다!'}
          </p>
          <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-500 transition-all duration-500" style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}></div>
        </div>

        <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
          
          {/* 1단계: 파이프라인 마감 */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-black text-slate-800 mb-3 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-indigo-600" /> 현재 진행중인 계약 리스트</h3>
              <p className="text-xs text-slate-500 mb-5 bg-indigo-50 p-3 rounded-lg border border-indigo-100 break-keep leading-relaxed font-medium">
                고객별로 오늘의 최종 진행 상태를 터치해 주세요. (대시보드 차트에 태그로 기록됩니다)
              </p>
              
              <div className="space-y-5">
                {pipelines.map(p => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-black text-lg text-slate-800">{p.client_name}</span>
                        <span className="text-[11px] font-bold text-slate-400 ml-2">{p.expected_date} 예상</span>
                      </div>
                      <span className="font-black text-indigo-600 text-base">{p.expected_amount.toLocaleString()}원</span>
                    </div>
                    <p className="text-[13px] text-slate-600 mb-4 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">{p.contract_details}</p>
                    
                    {/* ⭐️ SALES_STEPS 객체 맵핑 적용 */}
                    <div className="flex flex-wrap gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {SALES_STEPS.map(stepObj => (
                        <button
                          key={stepObj.id}
                          onClick={() => handleStatusChange(p.id, stepObj.label)}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all border cursor-pointer flex-grow sm:flex-grow-0 text-center ${
                            p.status === stepObj.label 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-indigo-50'
                          }`}
                        >
                          {stepObj.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {pipelines.length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-bold text-sm">진행 중인 계약 내역이 없습니다.</div>
                )}
              </div>
            </div>
          )}

          {/* 2단계: 업무일지 */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-black text-slate-800 mb-4 flex items-center gap-2"><Edit3 className="w-5 h-5 text-emerald-600" /> 오늘 진행한 일정의 결과 (업무일지)</h3>
              
              <div className="space-y-4">
                {todaySchedules.map(s => (
                  <div key={s.id} className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">{s.schedule_time?.substring(0,5) || s.time?.substring(0,5)}</span>
                      <span className="font-black text-slate-800 text-[15px]">{s.title || s.content}</span>
                    </div>
                    <textarea
                      placeholder="상담 결과나 특이사항을 이곳에 기록하세요."
                      value={s.description || ""}
                      onChange={(e) => handleWorklogChange(s.id, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-3.5 text-[15px] focus:ring-2 focus:ring-emerald-200 outline-none resize-none h-32 shadow-inner"
                    />
                  </div>
                ))}
                {todaySchedules.length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-bold text-sm">오늘 등록된 일정이 없습니다.</div>
                )}
              </div>
            </div>
          )}

          {/* 3단계: 내일 일정 작성 */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[17px] font-black text-slate-800 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-rose-500" /> 내일의 일정(스케줄) 관리</h3>
              <p className="text-[11px] text-slate-500 mb-5 break-keep leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                내일({tomorrowStr}) 예정된 일정을 확인하고, 누락된 활동들을 폼에 작성한 뒤 <span className="font-bold text-indigo-600">[+ 목록에 추가]</span> 버튼을 눌러 등록하세요.
              </p>
              
              <div className="mb-6">
                <h4 className="text-xs font-black text-slate-600 mb-2 px-1">등록된 내일 일정 ({tomorrowSchedules.length}건)</h4>
                <div className="space-y-2">
                  {tomorrowSchedules.map(s => (
                    <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm group">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="bg-slate-100 text-slate-600 text-xs font-black px-2 py-1 rounded-lg shrink-0">{s.time?.substring(0,5)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded font-bold shrink-0">{s.category}</span>
                            <span className="text-sm font-bold text-slate-800 truncate">{s.client_name || '일반 일정'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{s.content || s.title}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSchedule(s.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                  {tomorrowSchedules.length === 0 && (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center text-xs text-slate-400 font-bold">등록된 일정이 없습니다. 아래 폼에서 추가해주세요.</div>
                  )}
                </div>
              </div>

              <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100">
                <h4 className="text-sm font-black text-indigo-900 mb-4 flex items-center gap-1.5"><Plus className="w-4 h-4"/> 새 일정 작성</h4>
                
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">날짜</label>
                      <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">시간</label>
                      <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
                      <Search className="w-3.5 h-3.5" /> 관련 고객 선택 (선택 사항)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          const matched = clients.find(c => `${c.name} (${formatPhoneNumber(c.phone)})` === e.target.value);
                          setForm(prev => ({ ...prev, client_id: matched ? String(matched.id) : "" }));
                        }}
                        onFocus={() => setIsClientDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 150)}
                        className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                        placeholder="성함 또는 전화번호 검색"
                      />
                      {isClientDropdownOpen && filteredClients.length > 0 && (
                        <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border border-blue-200 rounded-lg shadow-xl py-1">
                          {filteredClients.map(c => {
                            const displayText = `${c.name} (${formatPhoneNumber(c.phone)})`;
                            return (
                              <li key={c.id} onClick={() => {
                                setClientSearch(displayText);
                                setForm(prev => ({ ...prev, client_id: String(c.id) }));
                                setIsClientDropdownOpen(false);
                              }} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between">
                                <span>{c.name}</span><span className="text-xs text-slate-400">{formatPhoneNumber(c.phone)}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">카테고리</label>
                    <div className="relative">
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full text-sm font-bold p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white shadow-sm cursor-pointer">
                        <option value="AP">AP</option>
                        <option value="상담">상담</option>
                        <option value="계약">계약</option>
                        <option value="리쿠">리쿠</option>
                        <option value="청구">청구</option>
                        <option value="교육">교육</option>
                        <option value="회의">회의</option>
                        <option value="미팅">미팅</option>
                        <option value="기타">기타</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">상세 내용 (누구를, 왜 만나는지)</label>
                    <textarea 
                      placeholder="세부 일정 내용"
                      value={form.content}
                      onChange={e => setForm({...form, content: e.target.value})}
                      className="w-full text-[15px] p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20 shadow-sm" 
                    />
                  </div>
                  
                  <button 
                    onClick={handleAddSchedule}
                    className="mt-1 w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> 내일 일정 목록에 추가하기
                  </button>

                </div>
              </div>
            </div>
          )}

          {/* ⭐️ 4단계: 마감 완료 화면 (대시보드 복귀 버튼 없음) */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">일일 마감이 완료되었습니다!</h2>
              <p className="text-sm font-medium text-slate-500 mb-8 break-keep leading-relaxed">
                업데이트된 계약 진행 상황과 내일의 일정이 성공적으로 등록되었습니다.<br/>오늘 하루도 정말 고생 많으셨습니다.
              </p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 w-full max-w-sm mb-8 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>진도 업데이트 건수</span>
                  <span className="text-indigo-600">{pipelines.length}건</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                  <span>내일 일정 추가</span>
                  <span className="text-indigo-600">{tomorrowSchedules.length}건</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ⭐️ 2. step === 4 일 때 하단 고정 버튼을 숨김 처리 */}
      {step !== 4 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 sm:static sm:bg-transparent sm:border-t-0 sm:backdrop-blur-none sm:p-0 sm:mt-6 sm:max-w-2xl sm:mx-auto w-full">
          <button 
            onClick={nextStep} 
            disabled={isSaving}
            className={`w-full flex items-center justify-center gap-2 text-white font-black px-6 py-4 sm:py-3.5 rounded-xl transition-colors shadow-lg cursor-pointer text-[17px] sm:text-base active:scale-[0.98] ${step === 3 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (step === 3 ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
            {step === 3 ? "마감 완료 & 퇴근하기" : "저장 후 다음 단계로"}
          </button>
        </div>
      )}

    </div>
  );
}