import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:joonij93@gmail.com', // 👈 대표님 이메일 그대로 유지
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

    // ⭐️ URL 끝에 &test=true 가 붙어있는지 확인
    const isTest = searchParams.get('test') === 'true';

    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, push_subscription')
      .not('push_subscription', 'is', null);
      
    if (!agents) return NextResponse.json({ success: true });

    const todayKst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: schedules } = await supabase
      .from('schedules')
      .select('agent_id')
      .gte('created_at', `${todayKst}T00:00:00Z`);
      
    let targetAgents = [];

    if (isTest) {
      // 🧪 테스트 모드: 오늘 마감을 했든 안 했든 정준희 대표님에게만 무조건 발송
      targetAgents = agents.filter(a => a.name === '정준희');
    } else {
      // ⏰ 일반 모드 (cron-job.org 호출용): 마감을 안 한 사람만 추려내기
      const completedAgentIds = new Set(schedules?.map(s => s.agent_id) || []);
      targetAgents = agents.filter(a => !completedAgentIds.has(a.id));
    }

    for (const agent of targetAgents) {
      const payload = JSON.stringify({
        title: isTest ? '🧪 [테스트] 영업 마감 알림' : '⏰ 영업 마감 시간입니다!',
        body: `${agent.name} 대표님, 퇴근 전 1분 마감을 완료해주세요!`,
        url: '/dashboard'
      });
      await webpush.sendNotification(agent.push_subscription, payload).catch(e => console.error(e));
    }

    return NextResponse.json({ success: true, isTest, sent: targetAgents.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}