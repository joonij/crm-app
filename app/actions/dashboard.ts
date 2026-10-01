// app/actions/dashboard.ts
"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { decryptRegNumber } from "@/app/actions/crypto";

// 주민번호 평문에서 생년월일(YYYY-MM-DD)을 추출하는 함수 (서버 내에서만 동작)
function extractBirthDateFromJumin(jumin: string | null | undefined): string | null {
  if (!jumin) return null;
  const cleanJumin = jumin.replace(/[^0-9]/g, "");
  
  if (cleanJumin.length < 6) return null; 

  const yy = cleanJumin.substring(0, 2);
  const mm = cleanJumin.substring(2, 4);
  const dd = cleanJumin.substring(4, 6);
  
  if (Number(mm) < 1 || Number(mm) > 12 || Number(dd) < 1 || Number(dd) > 31) return null; 

  let yearPrefix = "19"; 
  
  if (cleanJumin.length >= 7) {
    const genderDigit = cleanJumin.charAt(6);
    if (["3", "4", "7", "8"].includes(genderDigit)) yearPrefix = "20"; 
    else if (["1", "2", "5", "6"].includes(genderDigit)) yearPrefix = "19"; 
    else if (["9", "0"].includes(genderDigit)) yearPrefix = "18"; 
  } else {
    const currentYearShort = new Date().getFullYear() % 100;
    if (Number(yy) <= currentYearShort) yearPrefix = "20";
  }

  return `${yearPrefix}${yy}-${mm}-${dd}`;
}

export async function getSecureClientsData(agentId: number) {
  const supabase = await getSupabaseServer();

  // 1. 서버가 직접 DB에서 클라이언트 목록을 한 번에 가져옵니다.
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("agent_id", agentId);

  if (error || !clients) return [];

  // 2. 서버의 강력한 처리 속도로 한 번에 복호화 및 생년월일 추출을 진행합니다.
  const processedClients = await Promise.all(clients.map(async (c: any) => {
    let derivedBirthDate = c.birth_date;

    if (!derivedBirthDate && c.registration_number) {
      try {
        const decrypted = await decryptRegNumber(c.registration_number);
        derivedBirthDate = extractBirthDateFromJumin(decrypted);
      } catch (e) {
        console.error("복호화 에러 (고객 ID:", c.id, ")");
      }
    }

    // ⭐️ 핵심 보안: 민감한 주민번호 컬럼(registration_number)은 여기서 완전히 삭제합니다. 
    // 프론트(브라우저)로는 아예 전송조차 되지 않습니다.
    const { registration_number, ...safeClientData } = c;

    return {
      ...safeClientData,
      derivedBirthDate,
    };
  }));

  return processedClients;
}