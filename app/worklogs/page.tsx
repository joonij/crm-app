"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, CalendarDays, Plus, MessageSquare, Clock, Trash2, Check, X, FileText, ChevronDown, ChevronUp, User, Users, PenTool, Info, Loader2, MessageCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- 타입 및 상수 정의 ---
interface TeamMember {
  id: number;
  name: string;
  rank: string;
  newAmt: number;
  maintainAmt: number;
  pendingCount: number; 
}

interface WorkLog {
  id: number;
  authorId: number;   
  authorName: string; 
  authorRank: string; 
  category: string;
  scheduleContent: string | null; 
  content: string; 
  time: string;
  date: string;
  clientName?: string;
  clientId?: number;
  readBy: number[]; 
}

interface PendingSchedule {
  id: number;
  date: string;
  time: string;
  category: string;
  content: string;
  client_id: number | null;
  clients?: { name: string };
  agent_id: number; 
}

const CATEGORY_OPTIONS = ["AP", "상담", "계약", "리쿠", "청구", "미팅", "기타"];

const getCategoryColor = (category: string) => {
  if (category === "AP") return "bg-purple-100 text-purple-700 border-purple-200";
  if (category === "상담") return "bg-blue-100 text-blue-700 border-blue-200";
  if (category === "계약") return "bg-red-100 text-red-700 border-red-200";
  if (category === "리쿠") return "bg-rose-100 text-rose-700 border-rose-200";
  if (category === "청구") return "bg-orange-100 text-orange-700 border-orange-200";
  if (category === "미팅") return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (category === "기타") return "bg-slate-200 text-slate-700 border-slate-300";
  return "bg-slate-100 text-slate-600 border-slate-200"; 
};

// 개별 로그 컴포넌트
const LogItem = ({ log, selectedMemberId, onDelete, myAgentId, onAddFeedback, onMarkAsRead, teamMembers }: { 
  log: WorkLog; 
  selectedMemberId: number | 'ALL'; 
  onDelete: (id: number) => void; 
  myAgentId: number | null; 
  onAddFeedback: (id: number, feedback: string) => Promise<void>;
  onMarkAsRead: (id: number, currentReadBy: number[]) => void;
  teamMembers: TeamMember[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const splitContent = log.content ? log.content.split('\n\n---피드백---\n') : [""];
  const mainContent = splitContent[0];
  const feedbacks = splitContent.length > 1 ? splitContent.slice(1) : [];

  const isUnreadByMe = myAgentId ? (log.authorId !== myAgentId && !log.readBy.includes(myAgentId)) : false;

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > 48); 
    }
  }, [mainContent]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && isUnreadByMe) {
      onMarkAsRead(log.id, log.readBy);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmitting(true);
    await onAddFeedback(log.id, feedbackText);
    setFeedbackText("");
    setIsFeedbackOpen(false);
    setIsSubmitting(false);
  };

  const readMembers = teamMembers.filter(m => log.readBy.includes(m.id) && m.id !== log.authorId);
  const unreadMembers = teamMembers.filter(m => !log.readBy.includes(m.id) && m.id !== log.authorId);

  const showToggleButton = isUnreadByMe || isOverflowing;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
      <div className="absolute top-6 md:top-7 -left-[31px] md:-left-[47px] w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white z-10 group-hover:scale-125 transition-transform" />
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedMemberId === 'ALL' && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-700">
              {log.authorName} <span className="text-slate-400 font-medium">{log.authorRank}</span>
            </div>
          )}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${getCategoryColor(log.category)}`}>
            {log.category}
          </span>
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {log.time.substring(0, 5)}
          </span>
          {log.clientName && (
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <User className="w-3 h-3" /> {log.clientName}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {log.authorId === myAgentId && (
            <button onClick={() => onDelete(log.id)} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer p-1.5 bg-white rounded-md hover:bg-red-50 shrink-0" title="일지 삭제">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative">
        {log.scheduleContent && (
          <p className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <CalendarDays className="w-3.5 h-3.5" /> {log.scheduleContent}
          </p>
        )}
        <p 
          ref={contentRef}
          className={`text-[13px] md:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-2' : ''}`}
        >
          {mainContent}
        </p>
        
        {showToggleButton && (
          <button 
            onClick={handleToggleExpand}
            className={`mt-2 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              isUnreadByMe && !isExpanded 
                ? 'text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg shadow-sm animate-pulse' 
                : 'text-slate-500 hover:text-blue-700 mt-1'
            }`}
          >
            {isExpanded ? (
              <><ChevronUp className="w-3.5 h-3.5" /> 내용 접기</>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> 
                {isUnreadByMe ? "내용 확인하기 (더보기)" : "본문 더보기"}
              </>
            )}
          </button>
        )}
      </div>

      {feedbacks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 space-y-2">
          {feedbacks.map((fb, i) => (
            <div key={i} className="flex gap-2.5 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-indigo-600 mb-0.5 block">익명 피드백</span>
                <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{fb}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group/read cursor-help flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors">읽음 {readMembers.length}</span>
            {readMembers.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 hidden group-hover/read:flex flex-col bg-gray-800 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-20">
                {readMembers.map(m => <span key={`r-${m.id}`}>{m.name}</span>)}
              </div>
            )}
          </div>
          
          <div className="relative group/unread cursor-help flex items-center gap-1">
            <EyeOff className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors">안읽음 {unreadMembers.length}</span>
            {unreadMembers.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 hidden group-hover/unread:flex flex-col bg-gray-800 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-20">
                {unreadMembers.map(m => <span key={`u-${m.id}`}>{m.name}</span>)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-end">
          {!isFeedbackOpen ? (
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-100 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" /> 피드백(댓글) 남기기
            </button>
          ) : (
            <div className="w-full max-w-sm flex items-end gap-2 bg-slate-50 border border-indigo-200 p-2 rounded-xl focus-within:border-indigo-400 transition-colors shadow-inner">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="따뜻한 조언이나 익명 피드백을 남겨주세요."
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 resize-none h-12 p-1 font-medium"
                autoFocus
              />
              <div className="flex flex-col gap-1 shrink-0 pb-1">
                <button 
                  onClick={handleFeedbackSubmit}
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                >
                  {isSubmitting ? '등록중' : '등록'}
                </button>
                <button 
                  onClick={() => setIsFeedbackOpen(false)}
                  className="bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default function WorklogsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [myInfo, setMyInfo] = useState<{ id: number; agency_id: number; branch_name: string; name: string; rank: string } | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [pendingSchedules, setPendingSchedules] = useState<PendingSchedule[]>([]); 
  const [clientsList, setClientsList] = useState<{ id: number; name: string; phone?: string }[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | 'ALL'>('ALL');
  
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logTime, setLogTime] = useState("");
  const [logCategory, setLogCategory] = useState("AP"); 
  const [logContent, setLogContent] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isClientSearchFocused, setIsClientSearchFocused] = useState(false);

  const [visibleCount, setVisibleCount] = useState(10);
  const observerTarget = useRef(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: agent } = await supabase.from("agents").select("id, name, rank, agency_id, agencies(branch_name)").eq("auth_id", user.id).single();
      if (!agent || !agent.agencies) return;
      
      const agencyData = Array.isArray(agent.agencies) ? agent.agencies[0] : agent.agencies;
      const myBranchName = agencyData.branch_name;

      setMyInfo({ 
        id: agent.id, 
        agency_id: agent.agency_id, 
        branch_name: myBranchName, 
        name: agent.name, 
        rank: agent.rank || 'FC' 
      });

      const { data: branchAgencies } = await supabase.from("agencies").select("id").eq("branch_name", myBranchName);
      const branchAgencyIds = branchAgencies?.map(a => a.id) || [agent.agency_id];

      const { data: membersData } = await supabase.from("agents").select("id, name, rank").in("agency_id", branchAgencyIds);
      
      const { data: rawPending } = await supabase.from("schedules")
        .select(`id, date, time, category, content, worklog, client_id, agent_id, clients(name)`)
        .in("agency_id", branchAgencyIds)
        .in("category", CATEGORY_OPTIONS)
        .gte("date", "2026-09-14")
        .is("worklog", null); 

      const pendingArr = (rawPending || []) as PendingSchedule[];
      setPendingSchedules(pendingArr.filter(p => p.agent_id === agent.id).sort((a,b) => b.date.localeCompare(a.date)));

      const now = new Date();
      const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      if (membersData) {
        const memberNames = membersData.map(m => m.name);
        const { data: contracts } = await supabase.from("subscription_insurance")
          .select("monthly_premium, agent_name, policy_status")
          .in("agent_name", memberNames)
          .gte("subscription_date", startOfMonthStr)
          .in("policy_status", ["new", "maintain"]);

        const formattedMembers = membersData.map(m => {
          let newAmt = 0;
          let maintainAmt = 0;
          if (contracts) {
            contracts.forEach(c => {
              if (c.agent_name === m.name) {
                if (c.policy_status === 'new') newAmt += (c.monthly_premium || 0);
                if (c.policy_status === 'maintain') maintainAmt += (c.monthly_premium || 0);
              }
            });
          }
          const pCount = pendingArr.filter(p => p.agent_id === m.id).length;
          return { ...m, rank: m.rank || 'FC', newAmt, maintainAmt, pendingCount: pCount };
        }).sort((a, b) => a.id === agent.id ? -1 : b.id === agent.id ? 1 : a.name.localeCompare(b.name));

        setTeamMembers(formattedMembers);
      }

      const { data: myClients } = await supabase.from("clients").select("id, name, phone").eq("agent_id", agent.id).order("name");
      if (myClients) setClientsList(myClients);

      const { data: logsData } = await supabase.from("schedules")
        .select(`
          id, date, time, category, content, worklog, read_by,
          agent_id, 
          agents(name, rank),
          client_id,
          clients(name)
        `)
        .in("agency_id", branchAgencyIds)
        .not("worklog", "is", null) 
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (logsData) {
        const formattedLogs: WorkLog[] = logsData.map(l => ({
          id: l.id,
          authorId: l.agent_id,
          authorName: l.agents?.name || "알 수 없음",
          authorRank: l.agents?.rank || "FC",
          category: l.category || "일반",
          scheduleContent: l.content, 
          content: l.worklog,         
          time: l.time,
          date: l.date,
          clientName: l.clients?.name,
          clientId: l.client_id,
          readBy: Array.isArray(l.read_by) ? l.read_by : [] 
        }));
        setLogs(formattedLogs);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fcMembers = teamMembers.filter(m => m.rank?.toUpperCase() === 'FC');
  const filteredMembers = fcMembers.filter(m => m.name.includes(searchTerm));
  const isManager = myInfo?.rank.toUpperCase().includes('SM');

  const displayLogs = useMemo(() => {
    let filtered = logs;
    if (selectedMemberId !== 'ALL') {
      filtered = logs.filter(log => log.authorId === selectedMemberId);
    }
    return [...filtered].sort((a, b) => {
      if(a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });
  }, [logs, selectedMemberId]);

  const visibleLogs = useMemo(() => {
    return displayLogs.slice(0, visibleCount);
  }, [displayLogs, visibleCount]);

  const groupedLogs = visibleLogs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, WorkLog[]>);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < displayLogs.length) {
          setVisibleCount(prev => prev + 10);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [visibleCount, displayLogs.length]);

  useEffect(() => {
    setVisibleCount(10);
  }, [selectedMemberId]);

  const handleSelectSchedule = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    if (scheduleId === "") {
      setLogDate(new Date().toISOString().split('T')[0]);
      setLogTime("");
      setSelectedClientName("");
      setSelectedClientId(null);
    } else {
      const target = pendingSchedules.find(p => p.id === parseInt(scheduleId));
      if (target) {
        setLogDate(target.date);
        setLogTime(target.time);
        if (target.category) setLogCategory(target.category);
        if (target.clients?.name) {
          setSelectedClientName(target.clients.name);
          setSelectedClientId(target.client_id);
        } else {
          setSelectedClientName("");
          setSelectedClientId(null);
        }
      }
    }
  };

  const handleAddLog = async () => {
    if (!myInfo) return;
    if (!logContent.trim()) {
      alert("업무 상세 내용을 입력해주세요.");
      return;
    }

    try {
      if (selectedScheduleId) {
        const { error } = await supabase.from("schedules")
          .update({ worklog: logContent })
          .eq("id", parseInt(selectedScheduleId));
        if (error) throw error;
      } else {
        const { error } = await supabase.from("schedules").insert({
          agent_id: myInfo.id,
          agency_id: myInfo.agency_id,
          client_id: selectedClientId,
          date: logDate,
          time: logTime || '00:00',
          category: logCategory,
          content: "업무일지 즉시 등록건", 
          worklog: logContent,
          schedule_type: 'personal'
        });
        if (error) throw error;
      }
      
      setLogContent("");
      setSelectedScheduleId("");
      setSelectedClientName("");
      setSelectedClientId(null);
      setIsWriteModalOpen(false); 
      fetchData(); 

    } catch (error: any) {
      alert("일지 저장에 실패했습니다. " + error.message);
    }
  };

  const handleDeleteLog = async (id: number) => {
    if(!window.confirm("이 업무 일지를 삭제하시겠습니까? (연결된 일정은 유지됩니다)")) return;
    try {
      const { error } = await supabase.from("schedules").update({ worklog: null }).eq("id", id);
      if (error) throw error;
      
      setLogs(logs.filter(log => log.id !== id));
      fetchData(); 
    } catch(err: any) {
      alert("삭제 실패: " + err.message);
    }
  };

  const handleAddFeedback = async (id: number, feedback: string) => {
    try {
      const { data: sch } = await supabase.from("schedules").select("worklog").eq("id", id).single();
      if (!sch) throw new Error("스케줄을 찾을 수 없습니다.");
      
      const updatedWorklog = `${sch.worklog || ""}\n\n---피드백---\n${feedback}`;
      
      const { error } = await supabase.from("schedules").update({ worklog: updatedWorklog }).eq("id", id);
      if (error) throw error;

      setLogs(logs.map(log => {
        if (log.id === id) {
          return { ...log, content: updatedWorklog };
        }
        return log;
      }));
    } catch (error: any) {
      alert("피드백 등록에 실패했습니다. " + error.message);
    }
  };

  const handleMarkAsRead = async (logId: number, currentReadBy: number[]) => {
    if (!myInfo) return;
    if (currentReadBy.includes(myInfo.id)) return;
    
    const newReadBy = [...currentReadBy, myInfo.id];
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, readBy: newReadBy } : l));
    
    try {
      await supabase.from("schedules").update({ read_by: newReadBy }).eq("id", logId);
    } catch (err) {
      console.error("읽음 처리 실패", err);
    }
  };

  const cleanSearchInput = selectedClientName.replace(/\s+/g, "").toLowerCase();
  const filteredClientsForSearch = selectedClientName && isClientSearchFocused
    ? clientsList.filter(c => {
        const matchName = c.name ? c.name.replace(/\s+/g, "").toLowerCase().includes(cleanSearchInput) : false;
        const matchPhone = c.phone ? c.phone.replace(/[^0-9]/g, "").includes(cleanSearchInput) : false;
        return matchName || matchPhone;
      })
    : clientsList;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-64px)] pb-20 relative">
      
      {/* 🟢 상단 헤더 영역 */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Team Worklogs</p>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  업무 일지 
                  {myInfo && <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 mt-1">{myInfo.branch_name}</span>}
                </h1>
              </div>
              
              {!isManager && pendingSchedules.length > 0 && (
                <div className="ml-2 mt-4 flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 px-2.5 py-1 rounded-lg shadow-sm animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[11px] font-black">내 미작성 {pendingSchedules.length}건</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setIsWriteModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> 새 업무일지 작성
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* 🟢 좌측: 팀원 리스트 패널 */}
        <div className="w-full lg:w-[320px] bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0 flex flex-col overflow-hidden h-[auto] lg:h-[calc(100vh-220px)] lg:sticky lg:top-[90px]">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="지점 팀원 검색 (FC)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[320px] lg:max-h-full">
            <button
              onClick={() => setSelectedMemberId('ALL')}
              className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer flex items-center justify-between mb-2 ${
                selectedMemberId === 'ALL' 
                  ? 'bg-gray-900 border-gray-900 shadow-sm text-white' 
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${selectedMemberId === 'ALL' ? 'text-gray-300' : 'text-slate-400'}`} />
                <span className={`text-sm font-black ${selectedMemberId === 'ALL' ? 'text-white' : 'text-slate-800'}`}>
                  지점 전체보기
                </span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedMemberId === 'ALL' ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-500'}`}>
                {fcMembers.length}명
              </span>
            </button>

            {filteredMembers.map(member => {
              const isSelected = selectedMemberId === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-500/20' 
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {member.name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {member.rank}
                      </span>
                    </div>
                    {isManager && member.pendingCount > 0 && (
                      <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                        미작성 {member.pendingCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-medium">
                    <span className="text-orange-500">예정 <strong className="font-bold">{member.newAmt.toLocaleString()}</strong></span>
                    <span className="text-blue-600">체결 <strong className="font-bold">{member.maintainAmt.toLocaleString()}</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🟢 우측: 타임라인 리스트 */}
        <div className="flex-1 w-full flex flex-col gap-6 h-[auto] lg:h-[calc(100vh-220px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              {selectedMemberId === 'ALL' ? (
                <span>지점 <span className="text-blue-600">전체</span> 업무 히스토리</span>
              ) : (
                <span><span className="text-blue-600">{teamMembers.find(m => m.id === selectedMemberId)?.name}</span>님의 업무 히스토리</span>
              )}
            </h3>
            <span className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md shadow-sm">
              총 {displayLogs.length}건
            </span>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {Object.keys(groupedLogs).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
                <FileText className="w-12 h-12 opacity-20" />
                <p className="text-sm font-bold">선택한 조건의 업무 일지가 없습니다.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-3 md:ml-4 space-y-10 pb-8">
                {Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="relative">
                    {/* 타임라인 날짜 뱃지 */}
                    <div className="absolute -left-[45px] md:-left-[54px] bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-3 py-1 text-[11px] font-black shadow-sm z-10 flex items-center justify-center">
                       {date.substring(5).replace('-', '/')}
                    </div>

                    <div className="pl-6 md:pl-10 space-y-4 pt-1">
                      {dateLogs.map((log) => (
                        <LogItem 
                          key={log.id} 
                          log={log} 
                          selectedMemberId={selectedMemberId} 
                          onDelete={handleDeleteLog} 
                          myAgentId={myInfo?.id || null}
                          onAddFeedback={handleAddFeedback}
                          onMarkAsRead={handleMarkAsRead} 
                          teamMembers={fcMembers} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {visibleCount < displayLogs.length && (
                  <div ref={observerTarget} className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 🟢 새 업무일지 작성 모달창 (모바일 풀스크린 + textarea 남은 공간 꽉 채움) */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm md:p-4 animate-in fade-in" onClick={() => setIsWriteModalOpen(false)}>
          <div 
            className="bg-white md:rounded-2xl w-full h-full md:h-auto md:max-h-[90vh] max-w-2xl md:shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-50 px-5 md:px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0 mt-safe">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-600" />
                새 업무일지 작성
              </h3>
              <button onClick={() => setIsWriteModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors rounded-full hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1 flex flex-col">
              <div className="shrink-0">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1 flex justify-between items-center">
                  <span>연동할 스케줄 불러오기 (선택)</span>
                  {!isManager && pendingSchedules.length > 0 && <span className="text-red-500 text-[10px]">미작성 {pendingSchedules.length}건</span>}
                </label>
                <select 
                  value={selectedScheduleId}
                  onChange={(e) => handleSelectSchedule(e.target.value)}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-3 py-3 md:py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer appearance-none"
                >
                  <option value="">-- 기존 스케줄 연동 없이 즉시 등록 --</option>
                  {pendingSchedules.map(sch => (
                    <option key={sch.id} value={sch.id}>
                      {sch.date} {sch.time.substring(0, 5)} | [{sch.category}] {sch.clients?.name ? `${sch.clients.name} - ` : ''} {sch.content}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                <div className="relative flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1">관련 고객 (선택)</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-3 md:py-2.5 text-sm font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white placeholder:text-slate-300 placeholder:font-medium"
                      placeholder="고객 이름 또는 연락처 검색"
                      value={selectedClientName}
                      onChange={(e) => setSelectedClientName(e.target.value)}
                      onFocus={() => setIsClientSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsClientSearchFocused(false), 200)}
                    />
                  </div>
                  {isClientSearchFocused && filteredClientsForSearch.length > 0 && (
                    <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1" onMouseDown={(e) => e.preventDefault()}>
                      {filteredClientsForSearch.map(c => (
                        <li
                          key={c.id}
                          onClick={() => {
                            setSelectedClientName(c.name);
                            setSelectedClientId(c.id);
                            setIsClientSearchFocused(false);
                          }}
                          className="px-4 py-3 md:py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <span>{c.name}</span>
                          {c.phone && <span className="text-[11px] font-medium text-slate-400 tracking-tight">{c.phone}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1">업무 카테고리</label>
                  <select 
                    value={logCategory}
                    onChange={(e) => setLogCategory(e.target.value)}
                    className="w-full text-sm font-bold border border-slate-200 rounded-xl px-3 py-3 md:py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer appearance-none"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 shrink-0">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1">날짜 (필수)</label>
                  <input 
                    type="date" 
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full text-sm font-bold border border-slate-200 rounded-xl px-3 py-3 md:py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1">시간 (선택)</label>
                  <input 
                    type="time" 
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="w-full text-sm font-bold border border-slate-200 rounded-xl px-3 py-3 md:py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                </div>
              </div>

              {/* ⭐️ 텍스트 영역: flex-1과 min-h-[180px]로 모바일에서 남은 공간을 꽉 채우도록 설정 */}
              <div className="flex-1 flex flex-col min-h-[180px]">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1">업무 상세 내용</label>
                <textarea 
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  placeholder="진행하신 업무 내역이나 메모를 상세히 남겨주세요."
                  className="w-full flex-1 text-sm font-medium border border-slate-200 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white resize-none leading-relaxed"
                />
              </div>

            </div>

            <div className="bg-white border-t border-slate-200 px-5 md:px-6 py-4 pb-safe flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setIsWriteModalOpen(false)}
                className="px-5 py-3 md:py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button 
                onClick={handleAddLog}
                className="flex items-center gap-1.5 px-6 py-3 md:py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" /> 일지 등록
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}