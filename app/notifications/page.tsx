// app/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell, ArrowLeft, Gift, Clock, Car, Edit3, Info, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { getSecureClientsData } from "@/app/actions/dashboard";
import { calculateDDay, calculateSangryungDDay } from "@/app/dashboard/utils";

// ⭐️ 알림 객체 타입 정의 (DB 알림과 생성형 알림을 통합하기 위함)
type UnifiedNotification = {
  id: string | number;
  type: 'sangryung' | 'retouch' | 'auto_renewal' | 'closing' | 'system';
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  link: string;
  icon: any;
  colorClass: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: agentData } = await supabase.from("agents").select("id, last_closing_time").eq("auth_id", user.id).single();
      if (!agentData) return;
      const myAgentId = agentData.id;

      // 1. 서버 액션으로 고객 정보(주민번호 복호화 포함) 안전하게 불러오기
      const myClients = await getSecureClientsData(myAgentId);
      const clientIdsStr = myClients.map((c: any) => c.id).join(',');

      // 2. 고객 관련 보험 및 일정 데이터 불러오기
      const insOrFilter = clientIdsStr ? `client_id.in.(${clientIdsStr})` : `agent_name.eq.none`;
      const schOrFilter = clientIdsStr ? `client_id.in.(${clientIdsStr})` : `agent_id.eq.${myAgentId}`;

      const [insRes, schedulesRes, dbNotiRes] = await Promise.all([
        supabase.from("subscription_insurance").select("*").or(insOrFilter),
        supabase.from("schedules").select("*").or(schOrFilter),
        supabase.from("notifications").select("*").eq("agent_id", myAgentId).order("created_at", { ascending: false }) // DB 저장 알림
      ]);

      const myInsurances = insRes.data || [];
      const mySchedules = schedulesRes.data || [];
      const dbNotis = dbNotiRes.data || [];

      // 이미 읽은 동적 알림 ID들 가져오기 (localStorage)
      const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
      const unifiedList: UnifiedNotification[] = [];

      // --- [알림 생성 1] 상령일 임박 (D-30) ---
      myClients.forEach((c: any) => {
        const dDay = calculateSangryungDDay(c.derivedBirthDate);
        if (dDay !== null && dDay >= 0 && dDay <= 30) {
          const notiId = `sangryung_${c.id}_${new Date().getFullYear()}`;
          unifiedList.push({
            id: notiId,
            type: 'sangryung',
            title: "상령일 임박 안내",
            message: `${c.name} 고객님의 보험나이 인상(상령일)이 D-${dDay} 남았습니다. 보장 분석 및 터치를 진행해보세요!`,
            date: new Date(),
            isRead: readNotiIds.includes(notiId),
            link: `/clients/${c.id}`,
            icon: Gift,
            colorClass: "bg-purple-100 text-purple-600 border-purple-200"
          });
        }
      });

      // --- [알림 생성 2] 장기 미관리 고객 (60일) ---
      myClients.forEach((c: any) => {
        const insDates = myInsurances.filter((ins: any) => Number(ins.client_id) === Number(c.id)).map((i: any) => new Date(i.created_at || 0).getTime());
        const schDates = mySchedules.filter((sch: any) => Number(sch.client_id) === Number(c.id)).map((s: any) => new Date(s.date || s.created_at || 0).getTime()); 
        const lastUpdate = new Date(Math.max(new Date(c.created_at || 0).getTime(), ...insDates, ...schDates)); 
        const daysSinceUpdate = Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
        
        if (daysSinceUpdate >= 60) {
          const notiId = `retouch_${c.id}_${Math.floor(Date.now() / (1000 * 3600 * 24 * 30))}`; // 한 달에 한 번만 갱신되도록 ID 생성
          unifiedList.push({
            id: notiId,
            type: 'retouch',
            title: "고객 재터치 필요",
            message: `${c.name} 고객님과 소통한 지 ${daysSinceUpdate}일이 지났습니다. 안부 연락을 남겨보세요.`,
            date: lastUpdate,
            isRead: readNotiIds.includes(notiId),
            link: `/clients/${c.id}`,
            icon: Clock,
            colorClass: "bg-rose-100 text-rose-600 border-rose-200"
          });
        }
      });

      // --- [알림 생성 3] 자동차/다이렉트 만기 임박 (60일) ---
      myInsurances.forEach((ins: any) => {
        if (ins.product_name && (ins.product_name.includes("자동차") || ins.product_name.includes("다이렉트")) && ins.maturity_date) {
          const dDay = calculateDDay(ins.maturity_date);
          if (dDay !== null && dDay >= 1 && dDay <= 60) {
            const notiId = `auto_${ins.id}_${ins.maturity_date}`;
            const clientName = myClients.find((c:any) => c.id === ins.client_id)?.name || ins.contractor_name;
            unifiedList.push({
              id: notiId,
              type: 'auto_renewal',
              title: "자동차보험 갱신 안내",
              message: `${clientName} 고객님의 자동차보험 만기가 D-${dDay} 남았습니다.`,
              date: new Date(),
              isRead: readNotiIds.includes(notiId),
              link: `/clients/${ins.client_id || ''}`,
              icon: Car,
              colorClass: "bg-amber-100 text-amber-600 border-amber-200"
            });
          }
        }
      });

      // --- [알림 생성 4] 일일 마감 작성 리마인더 ---
      const now = new Date();
      const todaySixAM = new Date();
      todaySixAM.setHours(6, 0, 0, 0);
      
      const isPastSixAM = now >= todaySixAM;
      const lastClosing = agentData.last_closing_time ? new Date(agentData.last_closing_time) : new Date(0);
      
      // 오늘 오전 6시가 지났는데, 마지막 마감 시간이 오늘 오전 6시 이전이라면 알림 생성
      if (isPastSixAM && lastClosing < todaySixAM) {
        const notiId = `closing_${todaySixAM.getTime()}`;
        unifiedList.push({
          id: notiId,
          type: 'closing',
          title: "일일 마감 보고 안내",
          message: `오늘의 활동 내역과 내일 일정을 마감 보드에 업데이트 해주세요!`,
          date: now,
          isRead: readNotiIds.includes(notiId),
          link: `/daily-closing`,
          icon: Edit3,
          colorClass: "bg-indigo-100 text-indigo-600 border-indigo-200"
        });
      }

      // --- [알림 생성 5] 기존 DB 알림 합치기 ---
      dbNotis.forEach((dbNoti: any) => {
        unifiedList.push({
          id: dbNoti.id,
          type: 'system',
          title: dbNoti.title || "시스템 알림",
          message: dbNoti.content,
          date: new Date(dbNoti.created_at),
          isRead: dbNoti.is_read,
          link: dbNoti.link_url || "#",
          icon: Info,
          colorClass: "bg-slate-100 text-slate-600 border-slate-200"
        });
      });

      // 통합된 알림 리스트를 최신순(우선순위)으로 정렬
      unifiedList.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      // 안 읽은 알림을 위로 올림
      unifiedList.sort((a, b) => (a.isRead === b.isRead) ? 0 : a.isRead ? 1 : -1);

      setNotifications(unifiedList);
      setIsLoading(false);
    };

    fetchAllNotifications();
  }, [router]);

  // 알림 읽음 처리 로직 (DB 업데이트 및 로컬스토리지 저장 동시 처리)
  const handleMarkAsRead = async (noti: UnifiedNotification) => {
    if (noti.isRead) return;

    if (typeof noti.id === 'string') {
      // 실시간 생성 알림 (localStorage 처리)
      const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
      if (!readNotiIds.includes(noti.id)) {
        readNotiIds.push(noti.id);
        localStorage.setItem('readNotis', JSON.stringify(readNotiIds));
      }
    } else {
      // DB 알림 (Supabase 업데이트)
      await supabase.from('notifications').update({ is_read: true }).eq('id', noti.id);
    }

    setNotifications(notifications.map(n => n.id === noti.id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    const unreadDBIds = notifications.filter(n => !n.isRead && typeof n.id === 'number').map(n => n.id);
    const unreadLocalIds = notifications.filter(n => !n.isRead && typeof n.id === 'string').map(n => n.id);

    // DB 전체 읽음 처리
    if (unreadDBIds.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadDBIds);
    }

    // 로컬 전체 읽음 처리
    if (unreadLocalIds.length > 0) {
      const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
      localStorage.setItem('readNotis', JSON.stringify([...readNotiIds, ...unreadLocalIds]));
    }

    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-bold text-sm">알림을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
            알림 센터
            {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 모두 읽음
          </button>
        )}
      </div>

      {/* 알림 리스트 */}
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((noti) => (
            <div 
              key={noti.id} 
              onClick={() => {
                handleMarkAsRead(noti);
                if (noti.link !== "#") router.push(noti.link);
              }}
              className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer shadow-sm group ${noti.isRead ? 'bg-white border-gray-100 opacity-70' : 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-md'}`}
            >
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border shadow-inner ${noti.colorClass}`}>
                <noti.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-black text-[15px] truncate pr-4 ${noti.isRead ? 'text-gray-600' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                    {noti.title}
                  </h3>
                  {!noti.isRead && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5 shadow-sm"></span>}
                </div>
                <p className={`text-[13px] leading-relaxed break-keep mb-2 ${noti.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                  {noti.message}
                </p>
                <div className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                  {noti.date.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Bell className="w-12 h-12 mb-4 opacity-20 text-indigo-500" />
            <p className="text-sm font-bold text-gray-500">새로운 알림이 없습니다.</p>
            <p className="text-xs font-medium mt-1">오늘도 화이팅 넘치는 하루 되세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}