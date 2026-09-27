'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";

export default function PushSubscribeButton() {
  const [status, setStatus] = useState('영업 마감 알림 켜기 🔔');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      setStatus('설정 중... (1/4)');
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('푸시 알림을 지원하지 않는 기기입니다.');
      }

      setStatus('설정 중... (2/4)');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('알림 권한이 거부되었습니다.');
      }

      setStatus('설정 중... (3/4)');
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error('VAPID 공개키가 없습니다. Vercel 환경변수를 확인하세요.');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setStatus('설정 중... (4/4)');
      const { error } = await supabase
        .from('agents')
        .update({ push_subscription: JSON.parse(JSON.stringify(subscription)) })
        .eq('name', '정준희');

      if (error) throw new Error('DB 저장 실패: ' + error.message);

      setStatus('✅ 알림 설정 완료');
      alert('스마트폰 알림 설정이 완료되었습니다! 이제 테스트를 진행해보세요.');

    } catch (error: any) {
      console.error(error);
      setStatus('❌ 오류 발생');
      alert('에러 상세 원인: ' + (error.message || '알 수 없는 오류'));
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