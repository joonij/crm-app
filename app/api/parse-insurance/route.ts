// app/api/parse-insurance/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

// 1. 날짜 정규화 함수
function sanitizeDate(val: any): string | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  if (trimmed.includes("종신") || trimmed.includes("9999")) {
    return "9999-12-31";
  }

  const match = trimmed.match(/(\d{4})[-./년\s]+(\d{1,2})[-./월\s]+(\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, "0");
    const day = match[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

// 2. 숫자 정규화 함수
function sanitizeNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : Math.floor(val);
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  return cleaned ? Math.floor(parseFloat(cleaned)) : 0;
}

// 3. 보험사명 정규화 함수
function sanitizeCompanyName(rawName: string): string {
  if (!rawName) return "미상";
  let name = rawName.trim();
  name = name.replace(/\(주\)|주식회사/g, "").trim();
  name = name.replace(/생명보험$/, "생명");
  name = name.replace(/손보$/, "손해");
  if (name.includes("우정사업본부")) return "우체국";
  return name;
}

// 4. 구글 서버에서 현재 API 키가 사용할 수 있는 최신 3.x 모델을 조회하여 정렬
async function getBestAvailableModels(apiKey: string): Promise<string[]> {
  const default3xModels = [
    "gemini-3.8-flash",
    "gemini-3.1-flash-preview",
    "gemini-3.1-pro-preview",
    "gemini-3.0-flash"
  ];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return default3xModels;
    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) return default3xModels;

    const validModels = data.models
      .filter((m: any) => {
        const name = (m.name || "").toLowerCase();
        const methods = m.supportedGenerationMethods || [];
        return (
          methods.includes("generateContent") &&
          name.includes("gemini") &&
          !name.includes("1.0") &&
          !name.includes("1.5") &&
          !name.includes("2.0") &&
          !name.includes("2.5") &&
          !name.includes("image") &&
          !name.includes("embedding") &&
          !name.includes("imagen") &&
          !name.includes("tts") &&
          !name.includes("audio") &&
          !name.includes("aqa") &&
          !name.includes("vision") &&
          !name.includes("thinking")
        );
      })
      .map((m: any) => m.name.replace("models/", ""));

    validModels.sort((a: string, b: string) => {
      const getVer = (str: string) => {
        const match = str.match(/gemini-(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
      };
      const verDiff = getVer(b) - getVer(a);
      if (verDiff !== 0) return verDiff;

      const getTypeScore = (str: string) => {
        if (str.includes("flash") && !str.includes("lite")) return 3;
        if (str.includes("pro")) return 2;
        return 1;
      };
      return getTypeScore(b) - getTypeScore(a);
    });

    return validModels.length > 0 ? validModels.slice(0, 4) : default3xModels;
  } catch (e) {
    console.warn("⚠️ 실시간 모델 목록 조회 실패, 기본 3.x 모델 사용:", e);
    return default3xModels;
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileBase64, storagePath, clientId } = body;

    let cleanBase64 = "";

    // ⭐️ Supabase Storage 경로(storagePath)가 넘어온 경우 서버에서 직접 다운로드하여 Base64로 변환
    if (storagePath) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: fileBlob, error: dlError } = await supabase.storage
        .from("support-files")
        .download(storagePath);

      if (dlError || !fileBlob) {
        throw new Error(`스토리지에서 PDF를 불러오지 못했습니다: ${dlError?.message || "파일 없음"}`);
      }

      const arrayBuffer = await fileBlob.arrayBuffer();
      cleanBase64 = Buffer.from(arrayBuffer).toString("base64");
    } else if (fileBase64) {
      cleanBase64 = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
    } else {
      return NextResponse.json(
        { error: "첨부된 파일 데이터가 없습니다." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const pdfPart = {
      inlineData: {
        data: cleanBase64,
        mimeType: "application/pdf",
      },
    };

    const prompt = `
당신은 대한민국 최고 수준의 보험 가입제안서, 가입안내서, 상품설명서 및 보장분석표 분석 전문가입니다.
첨부된 PDF는 다음 3가지 유형 중 하나입니다:
유형 A: '상품별 가입담보상세(축소본)' 또는 '종합 보장분석표(상세본)' (다건의 보험 계약 포함)
유형 B: 손해보험사의 단건 '가입제안서' (예: 주택화재보험, 운전자보험, 종합보험 등)
유형 C: 생명보험사의 단건 '가입안내서 / 상품설명서 / 상품제안서' (예: 미래에셋생명 M-케어 건강보험, 라이나생명 치아보험, 신한라이프 종신보험 등)

문서를 정확히 분석하여 아래 JSON '배열(Array)' 구조로 추출하세요.

[
  {
    "insurance_company": "보험사명 (예: 라이나생명, 미래에셋생명, DB손해, 메리츠화재, 라이나손해, 신한라이프생명)",
    "product_name": "보험 상품명",
    "payment_period": "주계약 납입기간 (예: 20년납, 10년납, 7년납, 전기납, 일시납 등. 표에 '10년'이라고만 적혀있어도 '10년납'으로 표기)",
    "subscription_date": "가입일자 또는 계약기간 시작일/발행일자 (형식: YYYY-MM-DD. 예: '2026-10-19 부터 2036-10-19 까지' -> '2026-10-19')",
    "maturity_date": "만기일자 (형식: YYYY-MM-DD. 예: '2026-10-19 부터 2036-10-19 까지' -> '2036-10-19', '종신'은 '9999-12-31', 특정 연도 계산이 불명확하면 빈칸 '')",
    "monthly_premium": 19000,
    "contractor_name": "계약자 이름 (표에 '신*주'처럼 * 마스킹이 되어 있다면 반드시 1페이지 표지나 마지막 서명란에서 마스킹되지 않은 실명 '신연주'를 찾아 기재)",
    "insured_name": "피보험자 이름 (계약자와 동일하게 * 마스킹이 되어 있다면 표지나 본문에서 실명을 찾아 기재)",
    "beneficiary_name": "수익자 이름 (명시되어 있지 않으면 계약자 이름과 동일하게 기재)",
    "details": [
      {
        "name": "특약명 또는 담보명 (아래 문서 유형별 추출 규칙 및 용어 치환 규칙 엄격 준수)",
        "kcredit_name": "신정원 담보명 (유형 A 보장분석표에 '신정원 담보명' 열이 있을 때만 기재, 유형 B/C 가입안내서·설명서는 빈칸 '')",
        "amount": "가입금액 숫자만 (단위: 만원 기준. 예: 1,000 -> 1000 / 300만원 -> 300 / 2억원 -> 20000)",
        "renewal_type": "납입/갱신 형태 (특약명 또는 상품명에 '갱신'이 포함되면 '갱신형', 그렇지 않으면 '비갱신')"
      }
    ]
  }
]

[문서 유형별 핵심 추출 규칙]
1. 유형 A (보장분석표) 분석 시:
   - 반드시 계약 건별 '상품별 가입담보상세' 표를 찾아 모든 정상 계약과 그 안의 특약(NO. 1번부터 끝까지)을 빠짐없이 추출하세요.
   - 한 칸에 두 개의 번호가 줄바꿈으로 겹쳐 있더라도 반드시 각각의 특약 객체로 분리하세요.
   - '회사 담보명'이 같더라도 옆의 '신정원 담보명'이 다르면 절대 합치지 말고 별개의 항목으로 모두 추출하세요.
   - '실효/해지 계약 현황' 페이지와 의무 가입 '자동차 보험 조회' 페이지는 무시하세요.

2. 유형 B (손해보험 가입제안서) 분석 시:
   - 앞부분의 '■ 가입사항' (또는 가입담보 요약표)에 기재된 기본계약 및 특약 리스트를 기준으로 details를 추출하세요.
   - 뒷부분의 '보장내역(지급사유 상세 설명)' 표를 중복해서 읽고 특약을 두 번씩 추출하지 마세요.

3. 유형 C (생명보험 가입안내서 / 상품설명서) 분석 시:
   - 반드시 앞부분(주로 3~5페이지)에 있는 **'보험계약의 개요 > 계약사항'** 또는 **'보험계약에 관한 사항 > 주계약 및 특약 보험료'** 표에 기재된 실제 가입 주계약 및 선택특약 리스트만 추출하세요.
   - 월 보험료(monthly_premium)는 해당 표 하단의 '실납입보험료', '납입보험료' 또는 '합계' 금액(원 단위 숫자)을 추출하세요.
   - ⭐️ [주계약 명칭 구체화 규칙]: 표에 '주계약'이라고 적혀 있거나 주계약란에 상품명(예: '무배당THE건강한치아보험V...')만 적혀 있는 경우, 바로 다음 페이지의 **'보장내역 안내' 또는 '보장내용'** 표를 확인하여 주계약의 실제 보장급부명(예: 재해사망보험금 / 일반사망보험금 / 보존치료보험금 등)을 찾은 뒤 특약명(name)에 반드시 결합하여 기재하세요!
     (예시 1: 주계약이 재해사망보험금을 보장하는 경우 -> "name": "주계약(재해사망보험금)")
     (예시 2: 주계약이 일반 사망보험금을 보장하는 경우 -> "name": "주계약(일반사망보험금)")
     (예시 3: 치아보험 주계약이 보존치료보험금을 보장하는 경우 -> "name": "주계약(보존치료보험금)")
   - ⭐️ [납입면제특약 제외 규칙]: 보험가입금액(만원)이 '0'으로 표기된 납입면제 전용 특약은 details 배열에 포함하지 마세요.
   - ⭐️ [세부 급부 및 비교 예시표 중복 추출 절대 금지]:
     1) '보장내용' 상세 설명 표에서 하나의 특약 내부의 세부 지급금액(예: 충전치료 30만원, 아말감 1만원, 크라운 40만원, 틀니 50만원, 브릿지 50만원, 임플란트 50만원, MRI 5만원 등)을 개별 특약으로 쪼개서 추출하지 마세요. 오직 앞쪽 '계약사항(보험계약의 개요)' 요약표에 적힌 주계약/특약 행과 가입금액(만원)만 1대1로 추출해야 합니다.
     2) 문서 중후반부에 나오는 '보장내용 및 보험료 비교(예시)', '갱신 시 보험료 예시', '해약환급금 예시표'는 절대 추출하지 마세요!

[공통 중요 규칙]
1. 보험사명에서 '(주)', '주식회사'를 제거하고, '라이나생명보험(주)'는 '라이나생명'으로, '미래에셋생명보험(주)'는 '미래에셋생명'으로, '손보'는 '손해'로, '우정사업본부'는 '우체국'으로 변경하세요.
2. 특약명(name)에 '소액암제외'가 있으면 '유사암제외'로 변경하세요.
3. 금액(amount)은 무조건 '만원' 단위의 순수 숫자로 변환하세요. (예: 1,000 -> 1000 / 30만원 -> 30 / 2억원 -> 20000)
4. 마크다운 기호(\`\`\`json)나 설명 없이 순수 JSON 배열 텍스트만 반환하세요.
`;

    const modelsToTry = await getBestAvailableModels(apiKey);
    console.log(`🎯 [확보된 3.x 모델 큐]: ${modelsToTry.join(" -> ")}`);

    let result = null;
    let lastError: any = null;

    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModelName = modelsToTry[i];
      try {
        const currentModel = genAI.getGenerativeModel({
          model: currentModelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        console.log(`🚀 [AI 파싱 시도 ${i + 1}/${modelsToTry.length}] 모델: ${currentModelName}`);
        result = await currentModel.generateContent([prompt, pdfPart]);

        console.log(`✅ [${currentModelName}] 파싱 완료!`);
        break;

      } catch (error: any) {
        lastError = error;
        const status = error.status;
        if (i === modelsToTry.length - 1) { // ⭐️ 마이너스(-) 연산자 복구
          throw error;
        }

        const delayMs = 1500 + i * 1000; // ⭐️ 곱하기(*) 연산자 복구
        const nextModel = modelsToTry[i + 1];
        console.warn(
          `⚠️ [${currentModelName} 실패 (코드: ${status || "기타"})] ${delayMs / 1000}초 대기 후 '${nextModel}' 모델로 재시도합니다...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    if (!result) {
      throw lastError || new Error("모든 AI 모델에서 응답을 받지 못했습니다.");
    }

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    const match = responseText.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error(
        `AI가 올바른 배열 형식을 반환하지 않았습니다. 응답 일부: ${responseText.substring(0, 100)}`
      );
    }

    const parsedArray = JSON.parse(match[0]);

    const finalData = (Array.isArray(parsedArray) ? parsedArray : [parsedArray]).map(
      (policy: any) => ({
        insurance_company: sanitizeCompanyName(policy.insurance_company),
        product_name: policy.product_name ? String(policy.product_name).trim() : "상품명 미상",
        payment_period: policy.payment_period ? String(policy.payment_period).trim() : null,
        subscription_date: sanitizeDate(policy.subscription_date),
        maturity_date: sanitizeDate(policy.maturity_date),
        monthly_premium: sanitizeNumber(policy.monthly_premium),
        contractor_name: policy.contractor_name ? String(policy.contractor_name).replace(/님$/, "").trim() : null,
        insured_name: policy.insured_name ? String(policy.insured_name).replace(/\(.*\)/, "").replace(/님$/, "").trim() : null,
        beneficiary_name: policy.beneficiary_name
          ? String(policy.beneficiary_name).replace(/님$/, "").trim()
          : policy.contractor_name
          ? String(policy.contractor_name).replace(/님$/, "").trim()
          : null,
        client_id: Number(clientId),
        agent_name: "",
        policy_status: "maintain",
        details: Array.isArray(policy.details)
          ? policy.details
              .map((d: any) => ({
                name: d.name ? String(d.name).trim() : "",
                kcredit_name: d.kcredit_name ? String(d.kcredit_name).trim() : "",
                amount: String(sanitizeNumber(d.amount)),
                renewal_type: d.renewal_type || "비갱신",
              }))
              .filter((d: any) => d.name !== "" && Number(d.amount) > 0)
          : [],
      })
    );

    return NextResponse.json({ parsedData: finalData }, { status: 200 });

  } catch (error: any) {
    console.error("\n=== [PDF Parsing Error] ===");
    console.error(error);
    return NextResponse.json(
      { error: error.message || "서버 데이터 처리 오류" },
      { status: 500 }
    );
  }
}