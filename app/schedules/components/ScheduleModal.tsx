"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, X, Loader2, Save, Edit2, Search } from "lucide-react";
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

// ⭐️ 연락처 하이픈 자동 포맷팅 헬퍼 함수
const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "연락처없음";
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.length === 11) return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  if (clean.length === 10) return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  return phone;
};

export default function ScheduleModal({ isOpen, onClose, onSuccess, myInfo, editData, defaultDate }: ScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateMode, setDateMode] = useState<'single' | 'range' | 'weekly'>('single');
  
  // ⭐️ 고객 목록 및 검색어 상태 추가
  const [clients, setClients] = useState<{ id: number; name: string; phone: string | null }[]>([]);
  const [clientSearch, setClientSearch] = useState("");

  const [form, setForm] = useState({
    date: defaultDate || "",
    endDate: "", 
    time: "09:00",
    content: "",
    schedule_type: "personal" as ScheduleType,
    client_id: "", // ⭐️ 스케줄에 연동할 고객 ID 필드 추가
  });

  const dayNamesShort = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const selectedDayName = form.date ? dayNamesShort[new Date(form.date).getDay()] : "";

  // ⭐️ 1. 담당자의 고객 리스트 불러오기 (가나다순 정렬)
  useEffect(() => {
    if (!myInfo?.id || !isOpen) return;

    const fetchClients = async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, name, phone")
        .eq("agent_id", myInfo.id);

      if (data) {
        const sortedClients = data.sort((a, b) => a.name.localeCompare(b.name));
        setClients(sortedClients);

        // 수정 모드일 때, 기존에 연결된 고객이 있으면 검색창(input)에 이름 자동 세팅
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

  // 수정 모드일 때 기존 데이터 폼에 세팅
  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date,
        endDate: editData.date,
        time: editData.time ? editData.time.substring(0, 5) : "09:00",
        content: editData.content,
        schedule_type: editData.schedule_type,
        client_id: editData.client_id ? String(editData.client_id) : "", // 고객 연동 세팅
      });
      setDateMode('single'); 
    } else {
      setForm(prev => ({ ...prev, date: defaultDate || prev.date }));
    }
  }, [editData, defaultDate]);

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

  const handleSave = async () => {
    if (!form.date || !form.time || !form.content) return alert("필수 항목(날짜, 시간, 내용)을 입력해주세요.");
    if (dateMode !== 'single' && !form.endDate) return alert("종료일을 선택해주세요.");
    if (!myInfo) return alert("사용자 정보 오류");

    setIsSubmitting(true);
    try {
      const basePayload = {
        agent_id: myInfo.id,
        agency_id: myInfo.agency_id,
        time: form.time + ":00",
        content: form.content,
        schedule_type: form.schedule_type,
        repeat: dateMode !== 'single', 
        client_id: form.client_id ? Number(form.client_id) : null // ⭐️ DB 저장 페이로드에 client_id 추가
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
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {editData ? <><Edit2 className="w-4 h-4 text-blue-600" /> 일정 수정</> : <><CalendarIcon className="w-4 h-4 text-blue-600" /> 새 일정 추가</>}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1"><X className="w-5 h-5" /></button>
        </div>
        
        {/* 본문 폼 */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          
          {/* 일정 구분 */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">일정 구분</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer text-xs font-bold ${form.schedule_type === 'personal' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                <input type="radio" value="personal" className="hidden" checked={form.schedule_type === 'personal'} onChange={(e) => setForm({...form, schedule_type: e.target.value as ScheduleType})} />
                개별 일정
              </label>
              <label className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer text-xs font-bold ${form.schedule_type === 'team' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                <input type="radio" value="team" className="hidden" checked={form.schedule_type === 'team'} onChange={(e) => setForm({...form, schedule_type: e.target.value as ScheduleType})} />
                {teamLabel.replace(" 공지", "")}
              </label>
              <label className={`flex items-center justify-center p-2.5 border rounded-lg text-xs font-bold ${!canPostAgency ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' : form.schedule_type === 'agency' ? 'bg-purple-50 border-purple-500 text-purple-700 cursor-pointer' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer'}`}>
                <input type="radio" value="agency" className="hidden" disabled={!canPostAgency} checked={form.schedule_type === 'agency'} onChange={(e) => setForm({...form, schedule_type: e.target.value as ScheduleType})} />
                {agencyLabel.replace(" 공지", "")}
              </label>
              <label className={`flex items-center justify-center p-2.5 border rounded-lg text-xs font-bold ${!canPostCompany ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' : form.schedule_type === 'company' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 cursor-pointer' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer'}`}>
                <input type="radio" value="company" className="hidden" disabled={!canPostCompany} checked={form.schedule_type === 'company'} onChange={(e) => setForm({...form, schedule_type: e.target.value as ScheduleType})} />
                {companyLabel.replace(" 공지", "")}
              </label>
            </div>
          </div>

          {/* 등록 방식 (신규 추가 시에만 노출) */}
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

          {/* ⭐️ 고객 연동 Datalist (개별 일정일 때만 노출) */}
          {form.schedule_type === 'personal' && (
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-2">
                <Search className="w-3.5 h-3.5" /> 관련 고객 선택 (선택 사항)
              </label>
              <input
                list="client-list"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  const matched = clients.find(c => `${c.name} (${formatPhoneNumber(c.phone)})` === e.target.value);
                  setForm(prev => ({ ...prev, client_id: matched ? String(matched.id) : "" }));
                }}
                className="w-full text-sm p-2 border border-blue-200 rounded-lg focus:ring-2 outline-none  bg-white"
                placeholder="성함 또는 전화번호 검색"
              />
              <datalist id="client-list">
                {clients.map(c => (
                  <option key={c.id} value={`${c.name} (${formatPhoneNumber(c.phone)})`} />
                ))}
              </datalist>
            </div>
          )}
          {/* 내용 입력 */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">상세 내용</label>
            <textarea 
              placeholder="일정 내용을 입력하세요"
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})}
              rows={4}
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
            />
          </div>
        </div>

        {/* 푸터 버튼 */}
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