// app/actions/auth.ts
"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const name = formData.get("name") as string;
  const agency_id = formData.get("agency_id") as string;
  const agent_code = formData.get("agent_code") as string;
  const manager_code = formData.get("manager_code") as string;
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
        agency_id, 
        agent_code, 
        manager_code: manager_code || null, // 빈 값은 확실하게 null 처리
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