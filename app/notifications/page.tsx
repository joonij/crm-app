"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell, UserPlus, Calendar, Info, CheckCircle2, ChevronRight } from "lucide-react";

type Notification = {
  id: string;
  agent_id: number;
  title: string;
  message: string;
  type: string;
  link_url: string;
  is_read: boolean;
  created_at: string;
};

const getIcon = (type: string) => {
  switch (type) {
    case 'referral': return <UserPlus className="w-5 h-5 text-indigo-500" />;
    case 'schedule': return <Calendar className="w-5 h-5 text-amber-500" />;
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
        .select('id')
        .eq('email', user.email)
        .single();

      if (agentError || !agentData) {
        setIsLoading(false);
        return;
      }

      const currentAgentId = agentData.id;
      setAgentId(currentAgentId);

      // 데이터 불러오기 함수
      const fetchNotifications = async () => {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('agent_id', currentAgentId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNotifications(data);
        }
      };

      await fetchNotifications();
      setIsLoading(false);

      // ⭐️ 핵심 해결법: 채널 이름 끝에 Date.now()를 붙여 기존 채널과 절대 겹치지 않게 만듭니다.
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

    // 컴포넌트 언마운트 시 채널 연결 해제 (메모리 누수 방지)
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = async (noti: Notification) => {
    if (!noti.is_read) {
      setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, is_read: true } : n));
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', noti.id);
    }
    if (noti.link_url) {
      router.push(noti.link_url);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!agentId) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg border shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" /> 모두 읽음 처리
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
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
                    {new Date(noti.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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