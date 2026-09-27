"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PushNotificationManager() {
  useEffect(() => {
    async function setupPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        }

        if (Notification.permission === 'granted') {
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });
          }
          
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('agents').update({ 
              push_subscription: JSON.parse(JSON.stringify(subscription)) 
            }).eq('auth_id', user.id);
          }
        }
      } catch (error) {
        console.error("푸시 설정 실패:", error);
      }
    }
    setupPush();
  }, []);

  return null;
}