"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell, UserPlus, Calendar, Info, CheckCircle2, ChevronRight, Clock, Gift } from "lucide-react";

// ⭐️ 상령일 계산 헬퍼 함수
const calculateSangryungDDay = (birthDateStr: string | null) => {
  if (!birthDateStr) return null;
  
  let cleanStr = birthDateStr.replace(/\./g, '-').replace(/\s/g, '');
  if (cleanStr.endsWith('-')) cleanStr = cleanStr.slice(0, -1);

  const birth = new Date(cleanStr);
  if (isNaN(birth.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let sangryung = new Date(today.getFullYear(), birth.getMonth() + 6, birth.getDate());

  if (sangryung.getTime() < today.getTime()) {
    sangryung = new Date(today.getFullYear() + 1, birth.getMonth() + 6, birth.getDate());
  }

  const diffTime = sangryung.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

type Notification = {
  id: string;
  agent_id: number;
  title: string;
  message: string;
  type: string;
  link_url: string;
  is_read: boolean;
  created_at: string;
  is_local?: boolean; // ⭐️ 대시보드에서 계산된 로컬 알림 여부 구분
};

const getIcon = (type: string) => {
  switch (type) {
    case 'referral': return <UserPlus className="w-5 h-5 text-indigo-500" />;
    case 'schedule': return <Calendar className="w-5 h-5 text-amber-500" />;
    case 'retouch': return <Clock className="w-5 h-5 text-rose-500" />;     // ⭐️ 추가
    case 'sangryung': return <Gift className="w-5 h-5 text-purple-500" />; // ⭐️ 추가
    default: return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentId, setAgentId] = useState<number | null>(null);

  useEffect(() => {
    let channel: any;

    const initialize = async () => {
      setIsLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setIsLoading(false);
        return;
      }

      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id, name')
        .eq('email', user.email)
        .single();

      if (agentError || !agentData) {
        setIsLoading(false);
        return;
      }

      const currentAgentId = agentData.id;
      const currentAgentName = agentData.name;
      setAgentId(currentAgentId);

      // 데이터 불러오기 및 ⭐️ 대시보드 알림 병합 함수
      const fetchNotifications = async () => {
        const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');

        // 1. 기존 DB 알림 불러오기
        const { data: dbData } = await supabase
          .from('notifications')
          .select('*')
          .eq('agent_id', currentAgentId)
          .order('created_at', { ascending: false });

        // 2. 고객 및 스케줄, 보험 데이터를 불러와 재터치/상령일 알림 계산
        const [clientsRes, insRes, schedulesRes] = await Promise.all([
          supabase.from("clients").select("*").eq("agent_id", currentAgentId),
          supabase.from("subscription_insurance").select("*").eq("agent_name", currentAgentName),
          supabase.from("schedules").select("*") 
        ]);

        const myClients = clientsRes.data || [];
        const myInsurances = insRes.data || [];
        const myClientIds = myClients.map(c => Number(c.id));
        const mySchedules = (schedulesRes.data || []).filter(sch => sch.agent_id === currentAgentId || myClientIds.includes(Number(sch.client_id)));

        const generatedNotis: Notification[] = [];
        const todayIso = new Date().toISOString();

        // [계산] 재터치 알림
        myClients.forEach(c => {
          const clientInsurances = myInsurances.filter(ins => Number(ins.client_id) === Number(c.id));
          const clientSchedules = mySchedules.filter(sch => Number(sch.client_id) === Number(c.id));

          const insDates = clientInsurances.map(i => new Date(i.created_at || 0).getTime());
          const schDates = clientSchedules.map(s => new Date(s.schedule_date || s.created_at || 0).getTime()); 
          const allDates = [new Date(c.created_at || 0).getTime(), ...insDates, ...schDates];
          
          const lastUpdate = new Date(Math.max(...allDates)); 
          const daysSinceUpdate = Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
          
          if (daysSinceUpdate >= 30) {
            let bucket = daysSinceUpdate >= 180 ? 180 : daysSinceUpdate >= 90 ? 90 : daysSinceUpdate >= 60 ? 60 : 30;
            const notiId = `retouch_${c.id}_${bucket}`;
            generatedNotis.push({
              id: notiId,
              agent_id: currentAgentId,
              title: `재터치 알림 (${bucket}일 경과)`,
              message: `${c.name} 고객님과 마지막 활동 후 ${daysSinceUpdate}일이 지났습니다.`,
              type: 'retouch',
              link_url: `/clients/${c.id}`,
              is_read: readNotiIds.includes(notiId),
              created_at: todayIso,
              is_local: true // 로컬 알림 표시
            });
          }
        });

        // [계산] 상령일 알림
        myClients.forEach(c => {
          const dDay = calculateSangryungDDay(c.birth_date);
          if (dDay !== null && dDay >= 0 && dDay <= 30) {
            const notiId = `sangryung_${c.id}_${new Date().getFullYear()}`;
            generatedNotis.push({
              id: notiId,
              agent_id: currentAgentId,
              title: `상령일 임박 (D-${dDay})`,
              message: `${c.name} 고객님의 보험나이가 곧 인상됩니다.`,
              type: 'sangryung',
              link_url: `/clients/${c.id}`,
              is_read: readNotiIds.includes(notiId),
              created_at: todayIso,
              is_local: true // 로컬 알림 표시
            });
          }
        });

        // 3. DB 알림과 로컬(자동계산) 알림을 합치고 시간순(최신순) 정렬
        const allNotifications = [...(dbData || []), ...generatedNotis].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNotifications(allNotifications);
      };

      await fetchNotifications();
      setIsLoading(false);

      const uniqueChannelName = `notifications-page-${currentAgentId}-${Date.now()}`;

      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `agent_id=eq.${currentAgentId}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
    };

    initialize();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = async (noti: Notification) => {
    // 1. 화면 즉시 반영
    if (!noti.is_read) {
      setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, is_read: true } : n));
      
      // 2. 백그라운드 처리 (로컬 vs DB)
      if (noti.is_local) {
        const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
        if (!readNotiIds.includes(noti.id)) {
          readNotiIds.push(noti.id);
          localStorage.setItem('readNotis', JSON.stringify(readNotiIds));
        }
      } else {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', noti.id);
      }
    }

    // 3. 페이지 이동
    if (noti.link_url) {
      router.push(noti.link_url);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!agentId) return;

    // 화면 즉시 반영
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    // 1. 로컬 알림들 모두 읽음 처리
    const localNotis = notifications.filter(n => n.is_local);
    const localIds = localNotis.map(n => n.id);
    const readNotiIds = JSON.parse(localStorage.getItem('readNotis') || '[]');
    const mergedLocalIds = Array.from(new Set([...readNotiIds, ...localIds]));
    localStorage.setItem('readNotis', JSON.stringify(mergedLocalIds));

    // 2. DB 알림들 모두 읽음 처리
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('agent_id', agentId)
      .eq('is_read', false);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold">알림을 불러오는 중...</div>;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> 알림 센터
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">새로운 소식과 진행 상황을 확인하세요.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg border shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> 모두 읽음 처리
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100 pb-20">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            새로운 알림이 없습니다.
          </div>
        ) : (
          notifications.map((noti) => (
            <div 
              key={noti.id}
              onClick={() => handleNotificationClick(noti)}
              className={`p-5 flex items-start gap-4 cursor-pointer transition-colors hover:bg-slate-50 ${noti.is_read ? 'opacity-60 bg-transparent' : 'bg-blue-50/30'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${noti.is_read ? 'bg-slate-100 grayscale' : 'bg-white shadow-sm border border-slate-100'}`}>
                {getIcon(noti.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!noti.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                  <h3 className={`text-sm font-bold truncate ${noti.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                    {noti.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-auto">
                    {/* 당일 생성된 로컬 알림은 "오늘"로 표시하거나 날짜로 표시합니다. */}
                    {noti.is_local ? '오늘' : new Date(noti.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{noti.message}</p>
              </div>

              <div className="shrink-0 self-center text-slate-300">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}