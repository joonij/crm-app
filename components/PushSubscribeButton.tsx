// components/PushSubscribeButton.tsx
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
        if (perm !== 'granted') throw new Error('알림 권한이 거부되었습니다.');
      }

      const registration = await navigator.serviceWorker.register('/sw.js?v=5'); // 버전업
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error('서버 VAPID 키 설정이 누락되었습니다.');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('사용자 로그인 정보를 찾을 수 없습니다.');

      const { data: agent, error: fetchError } = await supabase.from('agents').select('push_subscription').eq('auth_id', user.id).single();
      if (fetchError) throw new Error('DB 정보 조회에 실패했습니다.');

      // ⭐️ 기존 토큰 객체 호환성 및 배열 파싱 에러 완벽 해결
      let existingSubs = agent?.push_subscription;
      if (!existingSubs) {
        existingSubs = [];
      } else if (!Array.isArray(existingSubs)) {
        if (typeof existingSubs === 'object' && existingSubs.endpoint) {
          existingSubs = [existingSubs];
        } else {
          existingSubs = [];
        }
      }

      const newSub = JSON.parse(JSON.stringify(subscription));
      const isDuplicate = existingSubs.some((sub: any) => sub.endpoint === newSub.endpoint);

      if (!isDuplicate) {
        const updatedSubs = [...existingSubs, newSub];
        const { error: updateError } = await supabase
          .from('agents')
          .update({ push_subscription: updatedSubs })
          .eq('auth_id', user.id);
        
        if (updateError) throw new Error('DB 토큰 저장 실패: ' + updateError.message);
      }

      if (!isSilent) {
        alert('이 기기에서 마감 알림 설정이 정상적으로 완료되었습니다.');
      }
    } catch (error: any) {
      console.error('Push Setup Error:', error);
      if (!isSilent) alert(`알림 등록 실패: ${error.message || '알 수 없는 오류'}`);
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

  if (permission === 'loading' || permission === 'unsupported' || permission === 'granted') {
    return null; 
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-rose-500 text-sm font-semibold bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6 shrink-0">
        <AlertCircle className="w-5 h-5" />
        알림이 차단되었습니다. 기기 설정에서 허용으로 변경해주세요.
      </div>
    );
  }

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