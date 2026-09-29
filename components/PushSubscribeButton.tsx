// components/PushSubscribeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Bell, BellRing, AlertCircle, Info } from "lucide-react";

export default function PushSubscribeButton() {
  const [permission, setPermission] = useState<string>('loading');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // ⭐️ 아이폰(iOS) 기기 및 홈 화면 추가(PWA) 상태 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone === true);
    
    if (isIOSDevice && !isStandalone) {
      setPermission('unsupported_ios');
      return;
    }

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
      
      const registration = await navigator.serviceWorker.register('/sw.js?v=6'); // 서비스워커 버전업
      
      if (!isSilent) {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') throw new Error('알림 권한이 거부되었습니다.');
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error('서버 VAPID 키 설정이 누락되었습니다.');
      
      let subscription;
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      } catch (subError) {
        // ⭐️ 핵심 에러 픽스: 과거의 푸시 구독 정보가 충돌할 경우 강제로 해지 후 재시도
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          await existingSub.unsubscribe();
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });
        } else {
          throw subError;
        }
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('사용자 정보를 찾을 수 없습니다.');

      const { data: agent, error: fetchError } = await supabase.from('agents').select('push_subscription').eq('auth_id', user.id).single();
      if (fetchError) throw new Error('DB 조회 실패');

      // ⭐️ DB 파싱 에러 방지용 강력한 예외 처리
      let existingSubs = agent?.push_subscription;
      if (typeof existingSubs === 'string') {
         try { existingSubs = JSON.parse(existingSubs); } catch(e) { existingSubs = []; }
      }
      if (!Array.isArray(existingSubs)) {
        if (existingSubs && typeof existingSubs === 'object' && existingSubs.endpoint) {
          existingSubs = [existingSubs];
        } else {
          existingSubs = [];
        }
      }

      // 혹시 모를 null 값 제거
      existingSubs = existingSubs.filter((s: any) => s && s.endpoint);
      const newSub = JSON.parse(JSON.stringify(subscription));
      const isDuplicate = existingSubs.some((sub: any) => sub.endpoint === newSub.endpoint);

      if (!isDuplicate) {
        const updatedSubs = [...existingSubs, newSub];
        const { error: updateError } = await supabase
          .from('agents')
          .update({ push_subscription: updatedSubs })
          .eq('auth_id', user.id);
        
        if (updateError) throw new Error('DB 저장 실패: ' + updateError.message);
      }

      if (!isSilent) {
        alert('이 기기에서 마감 알림 설정이 정상적으로 완료되었습니다.');
      }
    } catch (error: any) {
      console.error('Push Setup Error:', error);
      if (!isSilent) alert(`알림 등록 실패: ${error.message || '알 수 없는 오류'}\n\n(일시적인 오류일 수 있으니 페이지 새로고침 후 다시 시도해주세요.)`);
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

  // 로딩중이거나, 이미 허용되었거나, 애초에 지원 안하는 기기(PC 사파리 구버전 등)에서는 숨김
  if (permission === 'loading' || permission === 'granted' || permission === 'unsupported') {
    return null; 
  }

  // ⭐️ 아이폰에서 홈 화면에 추가하지 않고 들어온 경우 뜨는 안내 배너
  if (permission === 'unsupported_ios') {
    return (
      <div className="flex items-start sm:items-center gap-3 text-blue-800 text-sm font-semibold bg-blue-50/80 p-4 sm:p-5 rounded-2xl border border-blue-200 mb-6 shrink-0 shadow-sm flex-col sm:flex-row">
        <Info className="w-5 h-5 shrink-0 text-blue-500 mt-0.5 sm:mt-0" />
        <div className="flex-1 leading-relaxed break-keep">
          아이폰(iOS)에서 마감 알림을 받으시려면, 브라우저 하단의 <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-xs shadow-sm mx-1">공유(↑) 버튼</span>을 누르고 <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-xs shadow-sm mx-1">홈 화면에 추가</span>를 하신 뒤, 생성된 바탕화면 앱으로 접속해주세요.
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-rose-500 text-sm font-semibold bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6 shrink-0">
        <AlertCircle className="w-5 h-5" />
        알림이 차단되었습니다. 기기(브라우저) 설정에서 알림을 허용으로 변경해주세요.
      </div>
    );
  }

  return (
    <section className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between shadow-sm mb-6 shrink-0">
      <div>
        <h2 className="text-base font-bold text-blue-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" /> 기기 알림 켜기
        </h2>
        <p className="text-xs text-blue-700 mt-1 font-medium break-keep">
          마감 리마인드 알림을 받으시려면 버튼을 눌러 기기를 등록해주세요.
        </p>
      </div>
      <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto">
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