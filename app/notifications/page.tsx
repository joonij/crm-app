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
    const initializeNotifications = async () => {
      setIsLoading(true);
      
      // 1. Supabase Auth에서 현재 로그인한 유저 객체 획득
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("🔴 인증 세션을 확인할 수 없습니다:", authError);
        setIsLoading(false);
        return;
      }

      // 2. 로그인한 유저의 이메일을 기반으로 agents 테이블에서 내부 고유 ID(숫자) 조회
      // (만약 테이블 구조가 이메일 매핑이 아닌 auth_user_id 컬럼에 user.id를 저장하는 방식이라면 조건절을 .eq('auth_user_id', user.id)로 수정하십시오)
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('email', user.email)
        .single();

      if (agentError || !agentData) {
        console.error("🔴 담당자(Agent) 매핑 실패:", agentError);
        setIsLoading(false);
        return;
      }

      const currentAgentId = agentData.id;
      setAgentId(currentAgentId);

      // 3. 획득한 고유 ID에 해당하는 알림 레코드만 조건 조회
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('agent_id', currentAgentId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
      setIsLoading(false);
    };

    initializeNotifications();
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
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6" /> 알림 센터
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