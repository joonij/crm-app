"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Users, ChevronLeft, ChevronRight, MapPin, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Supabase 클라이언트 임포트 필수

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<"personal" | "team">("team");
  
  // DB에서 불러온 스케줄을 담을 상태 변수
  const [teamSchedules, setTeamSchedules] = useState<any[]>([]);

  useEffect(() => {
    // 비동기 함수 선언
    const fetchSchedules = async () => {
      try {
        // 0. 현재 로그인한 내 정보(Auth) 먼저 확인
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 0-1. 내 agents 테이블 정보(id, agent_code) 가져오기
        const { data: myInfo } = await supabase
          .from('agents')
          .select('id, agent_code')
          .eq('email', user.email) // 또는 user_id 등 매칭되는 컬럼
          .single();
          
        if (!myInfo) return;

        const myId = myInfo.id;
        const myAgentCode = myInfo.agent_code;

        // ==========================================
        // 💡 질문하신 코드 적용 부분 시작
        // ==========================================
        
        // 1. 내 정보 및 내 직속 하급자(FC) 목록 조회
        const { data: teamMembers, error: memberError } = await supabase
          .from('agents')
          .select('id, name, agent_code')
          .or(`id.eq.${myId},manager_code.eq.${myAgentCode}`); 

        if (memberError || !teamMembers) throw memberError;

        const memberIds = teamMembers.map(m => m.id);

        // 주간 날짜 범위 설정 (실제로는 날짜 계산 함수 적용 필요)
        const startOfWeek = '2026-06-29'; 
        const endOfWeek = '2026-07-03';

        // 2. 조회된 ID 배열을 기반으로 해당 주차의 일정 데이터 추출
        const { data: schedules, error: scheduleError } = await supabase
          .from('schedules')
          .select('*')
          .in('agent_id', memberIds)
          .gte('date', startOfWeek)
          .lte('date', endOfWeek);

        if (scheduleError) throw scheduleError;

        // ==========================================
        // 💡 질문하신 코드 적용 부분 끝
        // ==========================================


        // 3. 불러온 DB 데이터를 UI 컴포넌트가 읽을 수 있는 형태로 가공(Grouping)
        const formattedData = teamMembers.map(member => {
          // 이 멤버의 스케줄만 필터링
          const memberEvents = schedules?.filter(s => s.agent_id === member.id) || [];
          
          return {
            id: member.id,
            name: member.name,
            role: member.id === myId ? "Manager" : "FC",
            events: memberEvents.map(evt => ({
              date: evt.date,
              type: evt.type, // 예: '상담', '계약'
              title: evt.title,
              color: evt.type === "상담" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
            }))
          };
        });

        // 4. State 업데이트하여 화면 렌더링
        setTeamSchedules(formattedData);

      } catch (error) {
        console.error("스케줄 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    // 함수 실행
    fetchSchedules();
  }, []); // 빈 배열을 넣어 페이지가 처음 켜질 때 딱 한 번만 실행되게 함

  return (
    // ... 이전 답변의 렌더링 UI 코드 (return 괄호 안의 내용) 그대로 유지 ...
    <div className="flex h-full flex-col p-6 max-w-7xl mx-auto space-y-6">
       {/* UI 코드 생략 */}
    </div>
  );
}