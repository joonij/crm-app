// components/RealtimeNotification.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, X } from "lucide-react";

export default function RealtimeNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // 1. clients 테이블에 새로운 데이터가 'INSERT' 될 때 감지하는 리스너
    const channel = supabase
      .channel('public:clients')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clients' },
        (payload) => {
          const newClient = payload.new;
          
          // 2. 누군가의 소개로 들어온 DB(introduce_client에 값이 있는 경우)만 필터링
          if (newClient.introduce_client) {
            const noti = {
              id: newClient.id,
              name: newClient.name,
              time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            };
            
            // 화면에 알림 추가
            setNotifications((prev) => [...prev, noti]);
            
            // 8초 후 알림 자동 삭제
            setTimeout(() => {
              setNotifications((prev) => prev.filter((n) => n.id !== noti.id));
            }, 8000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {notifications.map((noti) => (
        <div key={noti.id} className="bg-white border-l-4 border-indigo-500 shadow-2xl rounded-lg p-4 w-80 flex items-start gap-3 animate-in slide-in-from-right-8 duration-300">
          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full shrink-0 mt-0.5">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-indigo-500 mb-1">신규 소개 DB 접수! 🎉</p>
            <p className="text-sm font-black text-slate-800">
              <span className="text-indigo-600">{noti.name}</span> 고객님이 소개되었습니다.
            </p>
            <p className="text-[10px] text-slate-400 mt-1">{noti.time} · 고객 목록을 확인하세요.</p>
          </div>
          <button 
            onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== noti.id))}
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}