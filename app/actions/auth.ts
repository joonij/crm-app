// app/actions/auth.ts
"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js"; // ⭐️ 관리자 권한용 모듈 추가

// ==========================================
// 기존 가입 / 로그인 / 로그아웃 로직 (유지)
// ==========================================
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

  redirect("/clients");
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const supabase = await getSupabaseServer();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "이메일 또는 비밀번호가 일치하지 않습니다." };
  }

  redirect("/clients");
}

export async function signOutAction() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

// ==========================================
// ⭐️ 신규 추가: 계정 찾기 & 비밀번호 재설정 로직
// ==========================================

/**
 * 관리자 권한 클라이언트 생성 
 * (로그아웃 상태인 유저의 요청을 처리하고, RLS 제약을 무시하기 위해 사용)
 */
const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 반드시 .env.local에 설정되어 있어야 함
  );
};

// 1. 아이디(이메일) 찾기 로직
export async function findEmailAction(name: string, phone: string) {
  const supabaseAdmin = getAdminSupabase();

  const { data, error } = await supabaseAdmin
    .from("agents") // 설계사 테이블 조회
    .select("email")
    .eq("name", name)
    .eq("phone", phone)
    .single();

  if (error || !data) {
    return { error: "입력하신 정보와 일치하는 계정이 없습니다." };
  }

  // 개인정보 보호를 위한 이메일 마스킹 처리 (예: abcdef@gmail.com -> abc***@gmail.com)
  const [localPart, domain] = data.email.split("@");
  const maskedLocal = localPart.length > 3 
    ? localPart.slice(0, 3) + "***" 
    : localPart.slice(0, 1) + "***";

  return { email: `${maskedLocal}@${domain}` };
}

// 2. 이메일 인증 없는 비밀번호 강제 변경 로직
export async function directResetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const newPassword = formData.get("newPassword") as string;

  const supabaseAdmin = getAdminSupabase();

  // 1단계: 입력한 정보(이름, 연락처, 이메일)가 실제 DB(agents 테이블)와 완벽히 일치하는지 검증
  const { data: agent, error: agentError } = await supabaseAdmin
    .from("agents")
    .select("auth_id") // auth.users 테이블과 매핑되는 키
    .eq("email", email)
    .eq("name", name)
    .eq("phone", phone)
    .single();

  // 정보가 하나라도 틀리면 차단 (보안 강화)
  if (agentError || !agent) {
    return { error: "입력하신 정보와 일치하는 계정이 없습니다." };
  }

  // 2단계: 인증 시스템(Auth)에서 해당 유저의 비밀번호를 관리자 권한으로 강제 업데이트
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    agent.auth_id,
    { password: newPassword }
  );

  if (updateError) {
    return { error: "비밀번호 변경에 실패했습니다. 시스템 관리자에게 문의하세요." };
  }

  return { success: true };
}