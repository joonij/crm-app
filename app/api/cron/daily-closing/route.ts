import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:joonij93@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. 푸시 알림을 켜둔(토큰이 있는) 전체 인원 조회
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, push_subscription, last_closing_time')
      .not('push_subscription', 'is', null);
      
    if (!agents || agents.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "알림 수신자가 없습니다." });
    }

    // 2. 한국 시간(KST) 기준 오늘 날짜 구하기
    const todayKstString = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
      
    // 3. 오늘 마감을 아직 안 한 사람만 정확히 필터링
    const targetAgents = agents.filter(a => {
      if (!a.last_closing_time) return true; // 한 번도 마감을 안 한 사람 포함
      
      const hasClosedToday = a.last_closing_time.startsWith(todayKstString);
      return !hasClosedToday; // 오늘 마감한 사람은 발송 명단에서 제외
    });

    // 4. 필터링된 대상자(미마감자)에게 실전 알림 쏘기

    let successCount = 0;
    for (const agent of targetAgents) {
      const payload = JSON.stringify({
        title: '⏰ 영업 마감 시간입니다!',
        body: `${agent.name}님, 일일 마감 보고를 완료해주세요!`,
        url: '/daily-closing' 
      });
      
      // ⭐️ 단일 객체든 배열이든 무조건 배열로 묶어서 반복 처리 (다중 기기 발송)
      const subs = Array.isArray(agent.push_subscription) ? agent.push_subscription : [agent.push_subscription];
      
      for (const sub of subs) {
        if (!sub) continue;
        try {
          await webpush.sendNotification(sub, payload);
          successCount++;
        } catch (e) {
          console.error(`알림 발송 실패 (${agent.name}):`, e);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      targets: targetAgents.map(a => a.name) 
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}