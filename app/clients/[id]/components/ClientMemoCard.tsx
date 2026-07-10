"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  clientId: string;
  initialNote: string | null;
};

export default function ClientMemoCard({ clientId, initialNote }: Props) {
  const [noteContent, setNoteContent] = useState(initialNote || "");
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [noteSaveSuccess, setNoteSaveSuccess] = useState(false);

  const handleSaveNote = async () => {
    setIsNoteSaving(true);
    setNoteSaveSuccess(false);

    try {
      const { error } = await supabase
        .from("clients")
        .update({ notes: noteContent })
        .eq("id", parseInt(clientId, 10));
      
      if (error) throw error;

      setNoteSaveSuccess(true);
      setTimeout(() => setNoteSaveSuccess(false), 2000);
    } catch (error: any) {
      alert(`메모 저장 실패 원인: ${error.message}`);
    } finally {
      setIsNoteSaving(false);
    }
  };

  return (
    // ⭐️ h-full과 min-h-0을 적용하여 부모 높이를 꽉 채우게 합니다.
    <div className="w-full flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm min-h-0">
      
      {/* 상단 헤더 영역 */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <FileText className="h-4 w-4" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">상담 통합 메모</h2>
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-4 relative min-h-0">
        {/* ⭐️ textarea 영역이 남은 공간을 모두 차지하도록 flex-1 flex flex-col 구조를 적용합니다. */}
        <div className="relative flex-1 flex flex-col min-h-0">
          <textarea
            className={`w-full flex-1 p-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 leading-relaxed resize-none transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              isNoteSaving || noteSaveSuccess ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-80" : ""
            }`}
            placeholder="여기에 메모를 입력하고 저장 버튼을 누르세요"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            disabled={isNoteSaving || noteSaveSuccess}
          />
          {isNoteSaving && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-lg">
              <span className="font-semibold text-gray-600 animate-pulse">저장 중...</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSaveNote}
          disabled={isNoteSaving || noteSaveSuccess}
          className={`w-full shrink-0 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-100 ${
            noteSaveSuccess 
              ? "bg-green-600 cursor-not-allowed" 
              : isNoteSaving 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gray-900 hover:bg-gray-800 cursor-pointer"
          }`}
        >
          {isNoteSaving ? "저장 중..." : noteSaveSuccess ? "✓ 저장 완료" : "메모 전체 저장"}
        </button>
      </div>
    </div>
  );
}