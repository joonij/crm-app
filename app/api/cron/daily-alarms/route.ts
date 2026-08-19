// app/api/cron/daily-alarms/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // ⭐️ Vercel Cron Job 인증 (보안)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ⭐️ 서버 전용 권한(Service Role Key)으로 Supabase 연결 (RLS 무시하고 전체 데이터 조회)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // .env 파일에 이 키가 있어야 작동합니다.
  );

  try {
    // 1. 고객, 보험, 스케줄 데이터를 한 번에 모두 불러옵니다. (서버라 속도가 매우 빠름)
    const [clientsRes, insRes, schedulesRes] = await Promise.all([
      supabase.from("clients").select("id, name, agent_id, created_at, updated_at, contract_status"),
      supabase.from("subscription_insurance").select("client_id, created_at"),
      supabase.from("schedules").select("client_id, schedule_date, created_at")
    ]);

    const clients = clientsRes.data || [];
    const insurances = insRes.data || [];
    const schedules = schedulesRes.data || [];

    const notificationsToInsert: any[] = [];
    const todayIso = new Date().toISOString();
    const nowTime = new Date().getTime();

    clients.forEach(c => {
      // ==========================================
      // [로직 1] 재터치 계산 (정확히 30, 60, 90, 180일째 되는 날 알림 전송)
      // ==========================================
      const clientInsurances = insurances.filter(ins => Number(ins.client_id) === Number(c.id));
      const clientSchedules = schedules.filter(sch => Number(sch.client_id) === Number(c.id));

      const insDates = clientInsurances.map(i => new Date(i.created_at || 0).getTime());
      const schDates = clientSchedules.map(s => new Date(s.schedule_date || s.created_at || 0).getTime()); 
      const allDates = [new Date(c.created_at || 0).getTime(), ...insDates, ...schDates];
      
      const lastUpdate = new Date(Math.max(...allDates)); 
      const daysSinceUpdate = Math.floor((nowTime - lastUpdate.getTime()) / (1000 * 3600 * 24));
      
      // ⭐️ 매일 알림이 가는 것을 방지하기 위해, 정확히 지정된 일수에만 알림 생성
      if ([30, 60, 90, 180].includes(daysSinceUpdate)) {
        notificationsToInsert.push({
          agent_id: c.agent_id,
          title: `고객 재터치 알림 (${daysSinceUpdate}일 경과)`,
          message: `${c.name} 고객님과 마지막 활동 후 정확히 ${daysSinceUpdate}일이 지났습니다. 안부 연락을 권장합니다.`,
          type: 'retouch',
          link_url: `/clients/${c.id}`,
          is_read: false,
          created_at: todayIso
        });
      }

      // ==========================================
      // [로직 2] 계약 진행(2) 상태로 정확히 7일 경과 시 알림 전송
      // ==========================================
      if (String(c.contract_status) === "2") {
        const updatedAt = new Date(c.updated_at || c.created_at).getTime();
        const daysSinceStatusUpdate = Math.floor((nowTime - updatedAt) / (1000 * 3600 * 24));
        
        // ⭐️ 계약 진행 상태가 된 지 정확히 7일째 되는 날만 알림 생성
        if (daysSinceStatusUpdate === 7) {
          notificationsToInsert.push({
            agent_id: c.agent_id,
            title: `계약 진행 지연 알림 (7일 경과)`,
            message: `${c.name} 고객님의 계약 진행 상태가 7일간 멈춰있습니다. 팔로우업이 필요합니다.`,
            type: 'contract_delay',
            link_url: `/clients/${c.id}`,
            is_read: false,
            created_at: todayIso
          });
        }
      }
    });

    // 2. 모아둔 알림들을 DB 'notifications' 테이블에 일괄 발송(Insert)
    if (notificationsToInsert.length > 0) {
      const { error } = await supabase.from('notifications').insert(notificationsToInsert);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, sent_count: notificationsToInsert.length });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}