// app/schedule/components/ScheduleModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, X, Loader2, Save, Edit2, Search, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ScheduleType = 'company' | 'agency' | 'team' | 'personal';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  myInfo: { id: number; agency_id: number; rank: string; corpName: string; branchName: string; teamNum: string } | null;
  editData?: any; 
  defaultDate?: string;
}

const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "연락처없음";
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.length === 11) return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  if (clean.length === 10) return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  return phone;
};

// ⭐️ 카테고리 분리 정의
const PERSONAL_CATEGORIES = ["신규고객AP", "업셀링AP", "상담", "청약", "증권전달", "소개요청", "리쿠", "청구", "미팅", "교육", "기타"];
const TEAM_CATEGORIES = ["공지", "회의", "교육", "워크샵", "회식", "행사", "기타"];

export default function ScheduleModal({ isOpen, onClose, onSuccess, myInfo, editData, defaultDate }: ScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateMode, setDateMode] = useState<'single' | 'range' | 'weekly'>('single');
  
  const [clients, setClients] = useState<{ id: number; name: string; phone: string | null }[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false); 

  const [form, setForm] = useState({
    date: defaultDate || "",
    endDate: "", 
    time: "09:00",
    category: "신규고객AP", 
    content: "",
    schedule_type: "personal" as ScheduleType,
    client_id: "", 
  });

  const dayNamesShort = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const selectedDayName = form.date ? dayNamesShort[new Date(form.date).getDay()] : "";

  useEffect(() => {
    if (!myInfo?.id || !isOpen) return;

    const fetchClients = async () => {
      const { data } = await supabase.from("clients").select("id, name, phone").eq("agent_id", myInfo.id);

      if (data) {
        const sortedClients = data.sort((a, b) => a.name.localeCompare(b.name));
        setClients(sortedClients);

        if (editData && editData.client_id) {
          const matched = sortedClients.find(c => c.id === editData.client_id);
          if (matched) {
            setClientSearch(`${matched.name} (${formatPhoneNumber(matched.phone)})`);
          }
        }
      }
    };
    fetchClients();
  }, [myInfo?.id, isOpen, editData]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // 기존 'AP' 텍스트를 '신규고객AP'로 자동 호환 처리
        const initCategory = editData.category === "AP" ? "신규고객AP" : (editData.category || "신규고객AP");
        
        setForm({
          date: editData.date,
          endDate: editData.date,
          time: editData.time ? editData.time.substring(0, 5) : "09:00",
          category: initCategory, 
          content: editData.content,
          schedule_type: editData.schedule_type,
          client_id: editData.client_id ? String(editData.client_id) : "",
        });
        setDateMode('single'); 
      } else {
        setForm({
          date: defaultDate || "",
          endDate: "",
          time: "09:00",
          category: "신규고객AP", 
          content: "",
          schedule_type: "personal",
          client_id: "",
        });
        setDateMode('single');
        setClientSearch(""); 
      }
    }
  }, [isOpen, editData, defaultDate]);

  const cleanSearchInput = clientSearch.replace(/\s+/g, "").toLowerCase();
  const cleanPhoneSearch = clientSearch.replace(/[^0-9]/g, "");

  const filteredClients = clientSearch
    ? clients.filter(c => {
        const matchName = c.name ? c.name.replace(/\s+/g, "").toLowerCase().includes(cleanSearchInput) : false;
        const matchPhone = cleanPhoneSearch && c.phone ? c.phone.replace(/[^0-9]/g, "").includes(cleanPhoneSearch) : false;
        return matchName || matchPhone;
      })
    : clients;

  if (!isOpen) return null;

  const currentRank = (myInfo?.rank || 'FC').toUpperCase();
  const canPostCompany = ['BM', 'RM'].includes(currentRank);
  const canPostAgency = ['SM', 'BM', 'RM'].includes(currentRank);
  
  const companyLabel = myInfo?.corpName ? `${myInfo.corpName} 공지` : "회사 공지";
  const agencyLabel = myInfo?.branchName ? `${myInfo.branchName} 공지` : "지점 공지";
  const teamLabel = myInfo?.teamNum ? `${myInfo.branchName} ${myInfo.teamNum}팀 공지` : "팀 공지";

  const formatDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // ⭐️ 일정 구분이 변경될 때 알맞은 카테고리 배열로 전환
  const handleTypeChange = (newType: ScheduleType) => {
    const newCategories = newType === 'personal' ? PERSONAL_CATEGORIES : TEAM_CATEGORIES;
    setForm(prev => ({
      ...prev,
      schedule_type: newType,
      category: newCategories.includes(prev.category) ? prev.category : newCategories[0] // 변경 시 카테고리도 알맞게 초기화
    }));
  };

  const handleSave = async () => {
    if (!form.date || !form.time) return alert("필수 항목(날짜, 시간)을 입력해주세요.");
    if (dateMode !== 'single' && !form.endDate) return alert("종료일을 선택해주세요.");
    if (!myInfo) return alert("사용자 정보 오류");

    setIsSubmitting(true);
    try {
      const basePayload = {
        agent_id: myInfo.id,
        agency_id: myInfo.agency_id,
        time: form.time + ":00",
        category: form.category || null, 
        content: form.content || null,
        schedule_type: form.schedule_type,
        repeat: dateMode !== 'single', 
        client_id: form.client_id ? Number(form.client_id) : null 
      };

      if (editData) {
        const { error } = await supabase.from('schedules').update({ ...basePayload, date: form.date }).eq('id', editData.id);
        if (error) throw error;
      } else {
        const datesToInsert: string[] = [];
        const start = new Date(form.date);
        const end = dateMode === 'single' ? start : new Date(form.endDate);

        if (dateMode === 'single') {
          datesToInsert.push(form.date);
        } else if (dateMode === 'range') {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            datesToInsert.push(formatDateStr(new Date(d)));
          }
        } else if (dateMode === 'weekly') {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
            datesToInsert.push(formatDateStr(new Date(d)));
          }
        }

        const payloads = datesToInsert.map(d => ({ ...basePayload, date: d }));
        const { error } = await supabase.from('schedules').insert(payloads);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`저장 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col pb-safe">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {editData ? <><Edit2 className="w-4 h-4 text-blue-600" /> 일정 수정</> : <><CalendarIcon className="w-4 h-4 text-blue-600" /> 새 일정 추가</>}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">일정 구분</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer text-xs font-bold ${form.schedule_type === 'personal' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                <input type="radio" value="personal" className="hidden" checked={form.schedule_type === 'personal'} onChange={(e) => handleTypeChange(e.target.value as ScheduleType)} />
                개별 일정
              </label>
              <label className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer text-xs font-bold ${form.schedule_type === 'team' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                <input type="radio" value="team" className="hidden" checked={form.schedule_type === 'team'} onChange={(e) => handleTypeChange(e.target.value as ScheduleType)} />
                {teamLabel.replace(" 공지", "")}
              </label>
              <label className={`flex items-center justify-center p-2.5 border rounded-lg text-xs font-bold ${!canPostAgency ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' : form.schedule_type === 'agency' ? 'bg-purple-50 border-purple-500 text-purple-700 cursor-pointer' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer'}`}>
                <input type="radio" value="agency" className="hidden" disabled={!canPostAgency} checked={form.schedule_type === 'agency'} onChange={(e) => handleTypeChange(e.target.value as ScheduleType)} />
                {agencyLabel.replace(" 공지", "")}
              </label>
              <label className={`flex items-center justify-center p-2.5 border rounded-lg text-xs font-bold ${!canPostCompany ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' : form.schedule_type === 'company' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 cursor-pointer' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer'}`}>
                <input type="radio" value="company" className="hidden" disabled={!canPostCompany} checked={form.schedule_type === 'company'} onChange={(e) => handleTypeChange(e.target.value as ScheduleType)} />
                {companyLabel.replace(" 공지", "")}
              </label>
            </div>
          </div>

          {!editData && (
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              {[
                { id: 'single', label: '단일 일정' },
                { id: 'range', label: '기간 지정 (연속)' },
                { id: 'weekly', label: '매주 반복' }
              ].map(mode => (
                <button 
                  key={mode.id}
                  onClick={() => setDateMode(mode.id as any)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${dateMode === mode.id ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">{dateMode === 'single' ? '날짜' : '시작일'}</label>
                <input 
                  type="date" 
                  max="9999-12-31" 
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              {dateMode !== 'single' && (
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">종료일</label>
                  <input 
                    type="date" 
                    max="9999-12-31" 
                    value={form.endDate}
                    min={form.date} 
                    onChange={e => setForm({...form, endDate: e.target.value})}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              )}
              <div className={`${dateMode === 'single' ? 'flex-1' : 'w-24 shrink-0'}`}>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">시간</label>
                <input 
                  type="time" 
                  value={form.time}
                  onChange={e => setForm({...form, time: e.target.value})}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>

            {dateMode === 'weekly' && form.date && (
              <div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-1">
                🔄 시작일 기준 조율: <span className="underline underline-offset-2 text-blue-700">{form.date}</span>부터 종료일까지 <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-extrabold mx-0.5">{selectedDayName}</span>마다 일정이 자동으로 반복 생성됩니다.
              </div>
            )}
          </div>

          {form.schedule_type === 'personal' && (
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-2">
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
                  className="w-full text-sm p-2 border border-blue-200 rounded-lg focus:ring-2 outline-none bg-white"
                  placeholder="성함 또는 전화번호 검색"
                />
                
                {isClientDropdownOpen && filteredClients.length > 0 && (
                  <ul 
                    className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white border border-blue-200 rounded-lg shadow-xl py-1"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredClients.map(c => {
                      const displayText = `${c.name} (${formatPhoneNumber(c.phone)})`;
                      return (
                        <li
                          key={c.id}
                          onClick={() => {
                            setClientSearch(displayText);
                            setForm(prev => ({ ...prev, client_id: String(c.id) }));
                            setIsClientDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <span>{c.name}</span>
                          <span className="text-xs text-slate-400">{formatPhoneNumber(c.phone)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ⭐️ 스케줄 타입에 맞춰 동적 렌더링 되는 카테고리 옵션 */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">카테고리</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-sm font-bold p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
              >
                {(form.schedule_type === 'personal' ? PERSONAL_CATEGORIES : TEAM_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">상세 내용</label>
            {/* ⭐️ value의 null 방지 처리 */}
            <textarea 
              placeholder="세부 일정 내용"
              value={form.content || ""}
              onChange={e => setForm({...form, content: e.target.value})}
              rows={4}
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer">취소</button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editData ? "수정 완료" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}