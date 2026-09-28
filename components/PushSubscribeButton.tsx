'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Bell, BellRing, AlertCircle } from "lucide-react";

export default function PushSubscribeButton() {
  const [permission, setPermission] = useState<string>('loading');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }
    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // 이미 허용한 기기라면 조용히 토큰 갱신
    if (currentPermission === 'granted') {
      handleSubscribe(true);
    }
  }, []);

  const handleSubscribe = async (isSilent = false) => {
    try {
      setIsSubscribing(true);
      
      if (!isSilent) {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') throw new Error('권한 거부됨');
      }

      const registration = await navigator.serviceWorker.register('/sw.js?v=4');
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error('VAPID 키 누락');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // ⭐️ 핵심: 기존에 등록된 다른 기기(PC 등)의 토큰 목록을 먼저 불러옴
        const { data: agent } = await supabase.from('agents').select('push_subscription').eq('auth_id', user.id).single();
        
        let existingSubs = agent?.push_subscription || [];
        // (과거의 단일 객체 데이터를 배열로 변환하는 호환성 처리)
        if (!Array.isArray(existingSubs)) {
          existingSubs = Object.keys(existingSubs).length > 0 ? [existingSubs] : [];
        }

        const newSub = JSON.parse(JSON.stringify(subscription));
        // 현재 기기가 이미 목록에 있는지 중복 검사
        const isDuplicate = existingSubs.some((sub: any) => sub.endpoint === newSub.endpoint);

        if (!isDuplicate) {
          // 중복이 아니면 기존 목록에 현재 기기 추가
          const updatedSubs = [...existingSubs, newSub];
          await supabase
            .from('agents')
            .update({ push_subscription: updatedSubs })
            .eq('auth_id', user.id);
        }
      }

      if (!isSilent) {
        alert('이 기기에서 알림 설정이 완료되었습니다.');
      }
    } catch (error) {
      console.error('Push Setup Error:', error);
      if (!isSilent) alert('알림 설정 중 문제가 발생했습니다.');
    } finally {
      setIsSubscribing(false);
    }
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 로딩중이거나, 지원안하거나, 이미 허용한 기기(PC)에서는 화면에 안 보임
  if (permission === 'loading' || permission === 'unsupported' || permission === 'granted') {
    return null; 
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-rose-500 text-sm font-semibold bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6 shrink-0">
        <AlertCircle className="w-5 h-5" />
        이 기기에서 알림이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.
      </div>
    );
  }

  // 권한이 없는 새 기기(모바일 등)에서만 나타나는 배너
  return (
    <section className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between shadow-sm mb-6 shrink-0">
      <div>
        <h2 className="text-base font-bold text-blue-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" /> 기기 알림 켜기
        </h2>
        <p className="text-xs text-blue-700 mt-1 font-medium">
          현재 접속하신 기기에 마감 푸시 알림을 받으시려면 버튼을 눌러 기기를 등록해주세요.
        </p>
      </div>
      <div className="mt-3 sm:mt-0 shrink-0">
        <button 
          onClick={() => handleSubscribe(false)}
          disabled={isSubscribing}
          className="flex items-center justify-between gap-4 w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">알림 허용하기</p>
            </div>
          </div>
          <span className="text-xs font-black bg-white text-indigo-600 px-3 py-1.5 rounded-lg">
            {isSubscribing ? '연동 중...' : '등록'}
          </span>
        </button>
      </div>
    </section>
  );
}