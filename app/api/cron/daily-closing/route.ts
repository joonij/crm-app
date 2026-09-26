// app/api/cron/daily-closing/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 백엔드용 서비스 키 사용 (권한 우회)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(req: Request) {
  try {
    // 1. 보안 체크 (외부에서 아무나 이 주소를 실행하지 못하도록 Vercel Cron 시크릿 키 확인)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. 전체 FC(설계사) 목록 가져오기
    const { data: agents } = await supabase.from('agents').select('id, name, phone');
    if (!agents) return NextResponse.json({ success: true, message: "No agents found." });

    // 3. 오늘 자정(00:00)부터 현재까지 등록된 '내일 일정' 스케줄 조회 (마감 완료의 증거)
    const today = new Date();
    const todayKstString = new Date(today.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    const { data: todaySchedules } = await supabase
      .from('schedules')
      .select('agent_id')
      .gte('created_at', `${todayKstString}T00:00:00Z`);

    // 마감 완료한 FC의 ID 목록 추출
    const completedAgentIds = new Set(todaySchedules?.map(s => s.agent_id) || []);

    // 4. 마감하지 않은 FC 필터링
    const targetAgents = agents.filter(agent => !completedAgentIds.has(agent.id));

    if (targetAgents.length === 0) {
      return NextResponse.json({ success: true, message: "All agents have completed the closing." });
    }

    // 5. 알리고(또는 솔라피) API를 통해 카카오 알림톡 발송
    for (const agent of targetAgents) {
      // 💡 실제로는 솔라피(Solapi)나 알리고(Aligo)의 발송 API 규격에 맞춰 POST 요청을 보냅니다.
      console.log(`[알림톡 발송 대상] ${agent.name} (${agent.phone}) - 마감 미완료`);
      
      /* (솔라피 발송 예시 코드)
      await fetch("https://api.solapi.com/messages/v4/send", {
        method: "POST",
        headers: { "Authorization": `HMAC-SHA256 ...`, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: {
            to: agent.phone,
            from: "대표님_발신번호",
            kakaoOptions: {
              pfId: "카카오톡채널ID",
              templateId: "승인받은_템플릿_아이디",
              variables: { "#{이름}": agent.name } // 템플릿 변수 치환
            }
          }
        })
      });
      */
    }

    return NextResponse.json({ success: true, sentCount: targetAgents.length });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}