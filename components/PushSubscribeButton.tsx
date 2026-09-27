'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Bell, BellRing, AlertCircle } from "lucide-react";

export default function PushSubscribeManager() {
  const [permission, setPermission] = useState<string>('loading');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // 1. 브라우저 지원 여부 확인
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // 2. 이미 권한을 허용한 유저라면, 화면에 띄우지 않고 백그라운드에서 조용히 DB 토큰만 최신화 (자동화)
    if (currentPermission === 'granted') {
      handleSubscribe(true);
    }
  }, []);

  const handleSubscribe = async (isSilent = false) => {
    try {
      setIsSubscribing(true);
      
      // 권한 요청 (최초 클릭 시에만 팝업 뜸, silent 모드일 땐 무시됨)
      if (!isSilent) {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') throw new Error('권한 거부됨');
      }

      // 서비스 워커 등록 및 VAPID 키 세팅
      const registration = await navigator.serviceWorker.register('/sw.js?v=3');
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error('VAPID 키 누락');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // 현재 로그인한 유저 DB에 토큰 갱신
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('agents')
          .update({ push_subscription: JSON.parse(JSON.stringify(subscription)) })
          .eq('auth_id', user.id);
      }

      if (!isSilent) {
        alert('알림 설정이 완료되었습니다.');
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

  // 화면 렌더링 분기 처리
  if (permission === 'loading') return null;
  if (permission === 'unsupported') return null;

  // ⭐️ 이미 허용된 상태라면 화면에 버튼이나 배너를 아예 그리지 않음 (투명화)
  if (permission === 'granted') {
    return null; 
  }

  // ⭐️ 차단한 유저에게 보여줄 안내
  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-rose-500 text-sm font-semibold bg-rose-50 p-3 rounded-lg border border-rose-100 shrink-0">
        <AlertCircle className="w-5 h-5" />
        알림이 차단되었습니다. 브라우저 주소창 왼쪽의 설정에서 알림을 허용해주세요.
      </div>
    );
  }

  // ⭐️ 최초 접속 유저에게 보여줄 눈에 띄는 배너
  return (
    <button 
      onClick={() => handleSubscribe(false)}
      disabled={isSubscribing}
      className="flex items-center justify-between gap-4 w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all shrink-0 text-left group cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform">
          <BellRing className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm">영업 마감 리마인드 켜기</p>
          <p className="text-[11px] text-indigo-100 mt-0.5">매일 20시, 22시에 알림을 보내드립니다.</p>
        </div>
      </div>
      <span className="text-xs font-black bg-white text-indigo-600 px-3 py-1.5 rounded-lg">
        {isSubscribing ? '연동 중...' : '허용하기'}
      </span>
    </button>
  );
}