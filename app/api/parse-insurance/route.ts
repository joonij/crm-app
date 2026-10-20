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

// 3. 보험사명 정규화 함수 ('라이나(에이스)손보' -> '라이나손해' 등 예외 처리 보강)
function sanitizeCompanyName(rawName: string): string {
  if (!rawName) return "미상";
  let name = rawName.trim();
  name = name.replace(/\(주\)|주식회사|\(에이스\)/g, "").trim();
  name = name.replace(/생명보험$/, "생명");
  name = name.replace(/손해보험$/, "손해");
  name = name.replace(/손보$/, "손해");
  if (name.includes("우정사업본부")) return "우체국";
  return name;
}

// ⭐️ 핵심 해결: 503(특정 모델 과부하) 발생 시 다른 서버 클러스터(flash -> flash-lite -> pro)로 즉시 우회하도록 다중 큐 구성
async function getBestAvailableModels(apiKey: string): Promise<string[]> {
  const defaultFallbackModels = [
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.1-pro-preview",
    "gemini-2.5-flash"
  ];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return defaultFallbackModels;
    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) return defaultFallbackModels;

    const allValidModels = data.models
      .filter((m: any) => {
        const name = (m.name || "").toLowerCase();
        const methods = m.supportedGenerationMethods || [];
        return (
          methods.includes("generateContent") &&
          name.includes("gemini") &&
          !name.includes("1.0") &&
          !name.includes("1.5") &&
          !name.includes("image") &&
          !name.includes("embedding") &&
          !name.includes("imagen") &&
          !name.includes("tts") &&
          !name.includes("audio") &&
          !name.includes("aqa") &&
          !name.includes("vision") &&
          !name.includes("thinking") &&
          !name.includes("robotics") &&
          !name.includes("computer-use") &&
          !name.includes("customtools")
        );
      })
      .map((m: any) => m.name.replace("models/", ""));

    const getVer = (str: string) => {
      const match = str.match(/gemini-(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : 0;
    };

    // 버전이 높은 순(3.x 우선)으로 정렬
    allValidModels.sort((a: string, b: string) => getVer(b) - getVer(a));

    // 서버 과부하(503)가 동시에 겹치지 않도록 3가지 서로 다른 체급(Pool)으로 분리
    const flashModels = allValidModels.filter((m: string) => m.includes("flash") && !m.includes("lite"));
    const liteModels = allValidModels.filter((m: string) => m.includes("flash") && m.includes("lite"));
    const proModels = allValidModels.filter((m: string) => m.includes("pro"));

    // 교차 배치: 1순위 Flash -> 2순위 Flash-Lite -> 3순위 다른 Flash -> 4순위 Pro -> 5순위 예비 Lite
    const diverseQueue: string[] = [];
    const addUnique = (modelName?: string) => {
      if (modelName && !diverseQueue.includes(modelName)) {
        diverseQueue.push(modelName);
      }
    };

    addUnique(flashModels[0]);
    addUnique(liteModels[0]);
    addUnique(flashModels[1]);
    addUnique(proModels[0]);
    addUnique(liteModels[1]);

    return diverseQueue.length > 0 ? diverseQueue.slice(0, 5) : defaultFallbackModels;
  } catch (e) {
    console.warn("⚠️ 실시간 모델 목록 조회 실패, 기본 모델 사용:", e);
    return defaultFallbackModels;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, modelName: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[${modelName}] 응답 시간 초과 (${ms / 1000}초)`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
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
    const { extractedText, fileBase64, storagePath, clientId } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    let contentPayload: any[] = [];

    const prompt = `
당신은 대한민국 최고 수준의 보험 가입제안서, 가입안내서, 상품설명서 및 보장분석표 분석 전문가입니다.
제공된 보험 문서는 다음 3가지 유형 중 하나입니다:
유형 A: '상품별 가입담보상세(축소본)' 또는 '종합 보장분석표(상세본)' (다건의 보험 계약 포함)
유형 B: 손해보험사의 단건 '가입제안서' (예: 주택화재보험, 운전자보험, 종합보험 등)
유형 C: 생명보험사의 단건 '가입안내서 / 상품설명서 / 상품제안서' (예: 미래에셋생명 M-케어 건강보험, 라이나생명 치아보험, 신한라이프 종신보험 등)

문서를 정확히 분석하여 아래 JSON '배열(Array)' 구조로 추출하세요.

[
  {
    "doc_type": "유형 A 보장분석표이면 'analysis', 유형 B/C 단건 가입제안서·가입안내서·상품설명서이면 'proposal'",
    "insurance_company": "보험사명 (예: 현대해상, 라이나손해, 삼성생명, 흥국생명, 라이나생명, 미래에셋생명, DB손해, 메리츠화재)",
    "product_name": "보험 상품명",
    "payment_period": "주계약 납입기간 (예: 20년납, 15년납, 10년납, 전기납, 일시납 등. 표에 '월납/20년/58세만기'라고 적혀있으면 '20년납'으로 표기)",
    "subscription_date": "가입일자 또는 계약기간 시작일/발행일자 (형식: YYYY-MM-DD)",
    "maturity_date": "만기일자 (형식: YYYY-MM-DD. 예: '2022-12-30~2042-12-30' -> '2042-12-30', '종신'은 '9999-12-31')",
    "monthly_premium": 29910,
    "contractor_name": "계약자 이름 (예: '허신/허신' -> '허신')",
    "insured_name": "피보험자 이름 (예: '허신/허신' -> '허신')",
    "beneficiary_name": "수익자 이름 (명시되어 있지 않으면 계약자 이름과 동일하게 기재)",
    "details": [
      {
        "name": "특약명 또는 회사 담보명 (아래 문서 유형별 추출 규칙 및 용어 치환 규칙 엄격 준수)",
        "kcredit_name": "신정원 담보명 (유형 A 보장분석표에 '신정원 담보명' 열이 있을 때 그대로 기재, 유형 B/C 가입안내서·설명서는 빈칸 '')",
        "amount": "가입금액 숫자만 (단위: 만원 기준. 예: 1억 -> 10000 / 2억 -> 20000 / 9,020만 -> 9020 / 50만 -> 50 / 3만 -> 3)",
        "renewal_type": "납입/갱신 형태 (특약명 또는 상품명에 '갱신'이 포함되면 '갱신형', 그렇지 않으면 '비갱신')"
      }
    ]
  }
]

[문서 유형별 핵심 추출 규칙]
1. 유형 A (보장분석표) 분석 시:
   - 계약 건별 '상품별 가입담보상세' 표를 찾아 모든 정상 계약과 그 안의 특약(NO. 1번부터 끝까지)을 빠짐없이 추출하세요.
   - '회사 담보명'이 같더라도 옆의 '신정원 담보명'이 다르면(예: 질병·재해수술보장 -> 질병수술 20만 / 상해수술 20만) 절대 합치지 말고 별개의 항목으로 모두 추출하세요.
   - '실효/해지 계약 현황' 페이지와 의무 가입 '자동차 보험 조회' 페이지는 무시하세요.

2. 유형 B (손해보험 가입제안서) 분석 시:
   - 앞부분의 '■ 가입사항' (또는 가입담보 요약표)에 기재된 기본계약 및 특약 리스트를 기준으로 details를 추출하세요.
   - 뒷부분의 '보장내역(지급사유 상세 설명)' 표를 중복해서 읽지 마세요.

3. 유형 C (생명보험 가입안내서 / 상품설명서) 분석 시:
   - 앞부분(주로 3~5페이지)에 있는 **'보험계약의 개요'** 또는 **'계약사항'** 표에 기재된 실제 가입 주계약 및 선택특약 리스트만 1대1로 추출하세요.
   - 표에 '주계약'이라고만 적혀 있거나 상품명만 적혀 있는 경우, 바로 뒤의 **'보장내역 안내 > [주계약 보장내역]'** 표를 확인하여 주계약의 실제 보장급부명(예: 재해사망보험금 / 일반사망보험금 / 보존치료보험금 등)을 찾은 뒤 특약명(name)에 결합하여 기재하세요!
   - 보험가입금액(만원)이 '0'으로 표기된 납입면제 전용 특약 및 후반부 비교/갱신/해약환급금 예시표는 절대 추출하지 마세요.

[공통 중요 규칙]
1. 보험사명에서 '(주)', '주식회사', '(에이스)'를 제거하고, '라이나(에이스)손보'는 '라이나손해'로, '손보'는 '손해'로, '우정사업본부'는 '우체국'으로 변경하세요.
2. 특약명(name)에 '소액암제외'가 있으면 '유사암제외'로 변경하세요.
3. 금액(amount)은 무조건 '만원' 단위의 순수 숫자로 변환하세요. (예: 1억 -> 10000 / 1,000만 -> 1000)
4. 마크다운 기호(\`\`\`json)나 설명 없이 순수 JSON 배열 텍스트만 반환하세요.
`;

    if (extractedText && typeof extractedText === "string" && extractedText.trim().length > 100) {
      console.log(`⚡ [초고속 텍스트 파싱 모드] 텍스트 길이: ${extractedText.length}자`);
      contentPayload = [prompt, `\n\n[추출된 PDF 문서 전체 텍스트]\n${extractedText}`];
    } else {
      let cleanBase64 = "";
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

      contentPayload = [
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: "application/pdf",
          },
        },
      ];
    }

    const modelsToTry = await getBestAvailableModels(apiKey);
    console.log(`🎯 [확보된 다중 서버 풀 모델 큐]: ${modelsToTry.join(" -> ")}`);

    let result: any = null;
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
        result = await withTimeout(
          currentModel.generateContent(contentPayload),
          20000,
          currentModelName
        );

        console.log(`✅ [${currentModelName}] 파싱 완료!`);
        break;

      } catch (error: any) {
        lastError = error;
        const status = error.status;
        if (i === modelsToTry.length - 1) {
          throw error;
        }

        // 503 과부하 시에는 0.8초 대기 후 다른 체급 모델로 즉시 전환
        const delayMs = status === 503 || String(error.message).includes("503") ? 800 : 400;
        const nextModel = modelsToTry[i + 1];
        console.warn(
          `⚠️ [${currentModelName} 지연/과부하 (${status || error.message})] ${delayMs / 1000}초 후 '${nextModel}' 모델로 우회합니다...`
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
      (policy: any) => {
        const cleanedDetails = Array.isArray(policy.details)
          ? policy.details
              .map((d: any) => ({
                name: d.name ? String(d.name).trim() : "",
                kcredit_name: d.kcredit_name ? String(d.kcredit_name).trim() : "",
                amount: String(sanitizeNumber(d.amount)),
                renewal_type: d.renewal_type || "비갱신",
              }))
              .filter((d: any) => d.name !== "" && Number(d.amount) > 0)
          : [];

        const hasKcreditName = cleanedDetails.some((d: any) => d.kcredit_name !== "");
        const isSingleProposal = !hasKcreditName && (policy.doc_type === "proposal" || parsedArray.length === 1);

        return {
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
          policy_status: isSingleProposal ? "new" : "maintain",
          details: cleanedDetails,
        };
      }
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