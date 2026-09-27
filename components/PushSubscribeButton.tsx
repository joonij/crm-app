'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase"; // ✅ 프로젝트의 인증된 DB 클라이언트 사용

export default function PushSubscribeButton() {
  const [status, setStatus] = useState('영업 마감 알림 켜기 🔔');

  // 컴포넌트 실행 시 서비스 워커 자동 등록
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      setStatus('설정 중...');
      
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('푸시 알림을 지원하지 않는 기기/브라우저입니다.');
        setStatus('지원하지 않음');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
        setStatus('권한 거부됨');
        return;
      }

      // ✅ 서비스 워커 강제 호출 (무한 로딩 방지)
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error('VAPID 공개키가 환경변수에 없습니다.');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // ✅ DB 업데이트 (기기 토큰 저장)
      const { error } = await supabase
        .from('agents')
        .update({ push_subscription: JSON.parse(JSON.stringify(subscription)) })
        .eq('name', '정준희');

      if (error) throw error;

      setStatus('✅ 알림 설정 완료');
      alert('스마트폰 알림 설정이 완료되었습니다! 이제 테스트를 진행해보세요.');

    } catch (error) {
      console.error('푸시 등록 에러:', error);
      setStatus('❌ 오류 발생');
      alert('알림 설정 중 문제가 발생했습니다.');
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

  return (
    <button 
      onClick={handleSubscribe}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors shrink-0"
    >
      {status}
    </button>
  );
}