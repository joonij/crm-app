'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function PushSubscribeButton() {
  const [status, setStatus] = useState('영업 마감 알림 켜기 🔔');

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
        alert('알림 권한이 거부되었습니다. 기기 설정에서 알림을 허용해주세요.');
        setStatus('권한 거부됨');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error('VAPID 공개키가 없습니다.');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('agents')
        .update({ push_subscription: JSON.parse(JSON.stringify(subscription)) })
        .eq('name', '정준희');

      if (error) throw error;

      setStatus('✅ 알림 설정 완료');
      alert('스마트폰 알림 설정이 완료되었습니다!');

    } catch (error) {
      console.error(error);
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