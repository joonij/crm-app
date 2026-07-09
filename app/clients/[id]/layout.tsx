// app/clients/[id]/layout.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function ClientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // ⭐️ 1. 내 정보 확실하게 불러오기 (숫자 id 포함)
      const { data: myAgent, error: agentError } = await supabase
        .from("agents")
        .select("id, rank, agency_id") // 👈 UUID와 매칭되는 내 숫자 'id'를 꼭 가져옵니다.
        .eq("auth_id", user.id)
        .single();

      if (agentError || !myAgent) {
        console.error("내 정보 불러오기 에러:", agentError);
        alert("설계사 정보를 찾을 수 없습니다.");
        router.push("/dashboard");
        return;
      }

      // 2. 고객 정보 불러오기 (고객을 담당하는 설계사의 숫자 ID)
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("agent_id") // 👈 숫자 형태
        .eq("id", clientId)
        .single();

      if (clientError || !client) {
        alert("존재하지 않는 고객입니다.");
        router.push("/dashboard");
        return;
      }

      // ⭐️ 3. 권한 체크 1: 내 고객인가? (내 숫자 id와 고객의 agent_id 비교)
      if (client.agent_id === myAgent.id) {
        setIsAuthorized(true);
        return;
      }

      // ⭐️ 4. 권한 체크 2: 내가 'SM(팀장)'이고, 같은 지점인가?
      if (myAgent.rank === "SM" && myAgent.agency_id) {
        // 고객 담당자(팀원)의 지점(agency_id) 확인
        const { data: clientAgent } = await supabase
          .from("agents")
          .select("agency_id")
          .eq("id", client.agent_id) // 👈 팀원 검색 시 숫자 id를 사용
          .single();

        // 내 지점과 팀원의 지점이 일치하면 통과!
        if (clientAgent?.agency_id === myAgent.agency_id) {
          setIsAuthorized(true);
          return;
        }
      }

      // 5. 조건에 맞지 않으면 차단
      alert("접근 권한이 없습니다. 본인의 고객이 아니거나 소속 지점이 다릅니다.");
      router.push("/dashboard"); 
    };

    checkAccess();
  }, [clientId, router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}