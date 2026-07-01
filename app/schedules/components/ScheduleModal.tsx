"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, X, Loader2, Save, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ScheduleType = 'company' | 'agency' | 'team' | 'personal';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  myInfo: { id: number; agency_id: number; rank: string; corpName: string; branchName: string; teamNum: string } | null;
  editData?: any; // 수정 시 전달받을 기존 데이터
  defaultDate?: string;
}

export default function ScheduleModal({ isOpen, onClose, onSuccess, myInfo, editData, defaultDate }: ScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateMode, setDateMode] = useState<'single' | 'range' | 'weekly'>('single');
  
  const [form, setForm] = useState({
    date: defaultDate || "",
    endDate: "", // 기간/반복일 때 사용할 종료일
    time: "09:00",
    content: "",
    schedule_type: "personal" as ScheduleType,
  });

  // ⭐️ 요일 한글 표시를 위한 배열 정의
  const dayNamesShort = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  
  // ⭐️ 현재 입력된 시작일(form.date)이 무슨 요일인지 계산
  const selectedDayName = form.date ? dayNamesShort[new Date(form.date).getDay()] : "";

  // 수정 모드일 때 기존 데이터 세팅
  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date,
        endDate: editData.date,
        time: editData.time.substring(0, 5),
        content: editData.content,
        schedule_type: editData.schedule_type,
      });
      setDateMode('single'); // 수정은 단일 건만 가능하도록 제한 (안전성)
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

  // 날짜 포맷팅 헬퍼 (YYYY-MM-DD)
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
        repeat: dateMode !== 'single' // 기간/반복 여부를 repeat 컬럼에 마킹
      };

      if (editData) {
        // 단일 수정 로직
        const { error } = await supabase.from('schedules').update({ ...basePayload, date: form.date }).eq('id', editData.id);
        if (error) throw error;
      } else {
        // 다중 일자 생성 로직 (기간 지정 또는 매주 반복)
        const datesToInsert: string[] = [];
        const start = new Date(form.date);
        const end = dateMode === 'single' ? start : new Date(form.endDate);

        if (dateMode === 'single') {
          datesToInsert.push(form.date);
        } else if (dateMode === 'range') {
          // 하루씩 증가
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            datesToInsert.push(formatDateStr(new Date(d)));
          }
        } else if (dateMode === 'weekly') {
          // 7일씩 증가
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
            datesToInsert.push(formatDateStr(new Date(d)));
          }
        }

        // Supabase 다중 Insert
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
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${dateMode === mode.id ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}

          {/* ⭐️ 날짜/시간 입력 영역 구조 변경 및 뱃지 추가 */}
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
                    min={form.date} // 시작일 이전 선택 방지
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

            {/* ⭐️ 매주 반복 선택 시 요일 매칭 안내 뱃지 */}
            {dateMode === 'weekly' && form.date && (
              <div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-1">
                🔄 시작일 기준 조율: <span className="underline underline-offset-2 text-blue-700">{form.date}</span>부터 종료일까지 <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-extrabold mx-0.5">{selectedDayName}</span>마다 일정이 자동으로 반복 생성됩니다.
              </div>
            )}
          </div>

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
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition">취소</button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editData ? "수정 완료" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}