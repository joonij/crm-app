// app/actions/auth.ts
"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const agency_id = formData.get("agency_id") as string;
  const agent_code = formData.get("agent_code") as string;
  const rawManagerCode = formData.get("manager_code") as string;
  const manager_code = rawManagerCode.trim() === "" ? null : rawManagerCode;
  const rank = formData.get("rank") as string;
  const phone = formData.get("phone") as string;
  const fax = formData.get("fax") as string;
  const office_address = formData.get("office_address") as string;

  if (!email || !password || !name || !agency_id || !agent_code) {
    return { error: "필수 항목(이름, 이메일, 비밀번호, 소속 지점 ID, 사번)을 모두 입력해 주세요." };
  }

  const supabase = await getSupabaseServer();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        name, 
        agency_id: parseInt(agency_id, 10),  
        agent_code, 
        manager_code: manager_code || null, 
        rank, 
        phone, 
        fax,
        office_address 
      },
    },
  });

  if (error) {
    return { error: error.message };
  }
  redirect("/portals");
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const supabase = await getSupabaseServer();

  // 1. Supabase Auth를 통한 기본 인증 (이메일, 비밀번호)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "이메일 또는 비밀번호가 일치하지 않습니다." };
  }

  let isOS = false;
  
  if (data.user) {
    // ⭐️ 2. 추가 정보(직급, 재직 상태) 확인 (is_active 컬럼 추가 조회)
    const { data: agentData } = await supabase
      .from("agents")
      .select("rank, is_active") 
      .eq("auth_id", data.user.id)
      .single();
      
    // ⭐️ 3. 퇴사자(비활성화 계정) 로그인 차단 방어 로직
    if (agentData && agentData.is_active === false) {
      // 이미 위에서 발급된 인증 세션(쿠키)을 즉시 강제 파기합니다.
      await supabase.auth.signOut();
      return { error: "정지되거나 퇴사 처리된 계정입니다. 관리자에게 문의하세요." };
    }

    // 4. OS 직급 확인
    if (agentData && agentData.rank) {
      const userRank = String(agentData.rank).toUpperCase();
      if (userRank.includes("OS")) {
        isOS = true;
      }
    }
  }

  // 5. 직급에 따른 리다이렉트 분기 (향후 OS와 일반 영업조직의 랜딩 페이지가 다를 경우를 대비한 구조)
  if (isOS) {
    redirect("/portals"); // OS 직급 전용 페이지가 있다면 경로 수정 필요
  } else {
    redirect("/portals");
  }
}

export async function signOutAction() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function findEmailAction(name: string, phone: string) {
  const supabaseAdmin = getAdminSupabase();

  const { data, error } = await supabaseAdmin
    .from("agents")
    .select("email")
    .eq("name", name)
    .eq("phone", phone)
    .single();

  if (error || !data) {
    return { error: "입력하신 정보와 일치하는 계정이 없습니다." };
  }
  return { email: data.email };
}

export async function directResetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const newPassword = formData.get("newPassword") as string;
  const supabaseAdmin = getAdminSupabase();
  const { data: agent, error: agentError } = await supabaseAdmin
    .from("agents")
    .select("auth_id") // auth.users 테이블과 매핑되는 키
    .eq("email", email)
    .eq("name", name)
    .eq("phone", phone)
    .single();

  if (agentError || !agent) {
    return { error: "입력하신 정보와 일치하는 계정이 없습니다." };
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    agent.auth_id,
    { password: newPassword }
  );

  if (updateError) {
    return { error: "비밀번호 변경에 실패했습니다. 시스템 관리자에게 문의하세요." };
  }

  return { success: true };
}