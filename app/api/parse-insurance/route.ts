// app/api/parse-insurance/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 대용량 PDF 처리 및 재시도 대기 시간을 고려하여 최대 실행 시간 60초 설정
export const maxDuration = 60;

// ⭐️ 안전장치 1: PostgreSQL date 컬럼 오류 방지를 위한 날짜 정규화 함수
function sanitizeDate(val: any): string | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  // '종신' 또는 '9999'가 포함된 만기는 9999-12-31로 통일
  if (trimmed.includes("종신") || trimmed.includes("9999")) {
    return "9999-12-31";
  }

  // "2026년 10월 13일" 또는 "2026.10.13" 형태에서 숫자만 추출하여 YYYY-MM-DD로 변환
  const match = trimmed.match(/(\d{4})[-./년\s]+(\d{1,2})[-./월\s]+(\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, "0");
    const day = match[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 이미 YYYY-MM-DD 형식인 경우 그대로 반환, 그 외("83세만기", "10년만기" 등)는 DB 에러 방지를 위해 null 반환
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

// ⭐️ 안전장치 2: 월 보험료 및 가입금액 숫자 정규화 함수
function sanitizeNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

// ⭐️ 핵심 해결책: 503 에러 발생 시 구글 서버에서 현재 사용 가능한 모델 목록을 실시간 조회
async function getAvailableFallbackModels(apiKey: string, primaryModel: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) return [];

    // generateContent를 지원하는 순수 텍스트/멀티모달 Gemini 모델만 필터링
    const validModels = data.models
      .filter((m: any) => {
        const name = (m.name || "").toLowerCase();
        const methods = m.supportedGenerationMethods || [];
        return (
          methods.includes("generateContent") &&
          name.includes("gemini") &&
          !name.includes("embedding") &&
          !name.includes("imagen") &&
          !name.includes("tts") &&
          !name.includes("audio") &&
          !name.includes("aqa") &&
          !name.includes("vision")
        );
      })
      .map((m: any) => m.name.replace("models/", ""));

    // 최신 flash 모델 및 pro 모델을 우선순위로 정렬 (primaryModel 제외)
    const otherModels = validModels.filter((name: string) => name !== primaryModel);
    otherModels.sort((a: string, b: string) => {
      const aScore = (a.includes("3.8") ? 4 : a.includes("3.") ? 3 : a.includes("2.") ? 2 : 1) + (a.includes("flash") ? 0.5 : 0);
      const bScore = (b.includes("3.8") ? 4 : b.includes("3.") ? 3 : b.includes("2.") ? 2 : 1) + (b.includes("flash") ? 0.5 : 0);
      return bScore - aScore;
    });

    return otherModels.slice(0, 3); // 상위 3개 대체 모델 반환
  } catch (e) {
    console.warn("⚠️ 대체 모델 목록 조회 실패:", e);
    return [];
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
    const { fileBase64, clientId } = body;

    if (!fileBase64) {
      return NextResponse.json(
        { error: "첨부된 파일 데이터가 없습니다." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const pdfPart = {
      inlineData: {
        data: fileBase64,
        mimeType: "application/pdf",
      },
    };

    // 4종 PDF(간략 보장분석, 상세 보장분석, 손보 가입제안서, 생보 상품설명서) 완벽 대응 프롬프트
    const prompt = `
당신은 대한민국 최고 수준의 보험 가입제안서, 상품설명서 및 보장분석표 분석 전문가입니다.
첨부된 PDF는 다음 3가지 유형 중 하나입니다:
유형 A: '상품별 가입담보상세(축소본)' 또는 '종합 보장분석표(상세본)' (다건의 보험 계약 포함)
유형 B: 손해보험사의 단건 '가입제안서' (예: 주택화재보험, 운전자보험 등)
유형 C: 생명보험사의 단건 '상품설명서 / 상품제안서' (예: 종신보험, 건강보험 등)

문서를 정확히 분석하여 아래 JSON '배열(Array)' 구조로 추출하세요.

[
  {
    "insurance_company": "보험사명 (예: DB손해, 메리츠화재, 라이나손해, 신한라이프생명)",
    "product_name": "보험 상품명",
    "payment_period": "납입기간 (예: 20년납, 10년납, 7년납, 전기납, 일시납 등)",
    "subscription_date": "가입일자 또는 설계/발행일자 (형식: YYYY-MM-DD. 없으면 빈칸)",
    "maturity_date": "만기일자 (형식: YYYY-MM-DD. '종신' 또는 '9999세만기'는 '9999-12-31', 특정 나이 만기여서 연도 계산 불가 시 빈칸)",
    "monthly_premium": 48000,
    "contractor_name": "계약자 이름 (생년월일 숫자만 적혀있다면 그 숫자를 그대로 기재)",
    "insured_name": "피보험자 이름 (생년월일 숫자만 적혀있다면 그 숫자를 그대로 기재)",
    "beneficiary_name": "수익자 이름 (명시되어 있지 않으면 계약자 이름과 동일하게 기재)",
    "details": [
      {
        "name": "특약명 또는 담보명 (원문 그대로 기재하되 아래 용어 치환 규칙 준수)",
        "kcredit_name": "신정원 담보명 (문서 표에 '신정원 담보명' 열이 있을 때만 기재, 가입제안서/상품설명서 등 해당 열이 없는 문서는 빈칸 '')",
        "amount": "가입금액 숫자만 (단위: 만원 기준. 예: 3,500만원 -> 3500 / 2억원 -> 20000 / 20억원 -> 200000 / 5만 -> 5)",
        "renewal_type": "비갱신, 1년 갱신 등 (특약명에 '갱신형'이 포함되면 '갱신형', 유추 불가 시 '비갱신')"
      }
    ]
  }
]

[문서 유형별 핵심 추출 규칙]
1. 유형 A (보장분석표) 분석 시:
   - 반드시 계약 건별 '상품별 가입담보상세' 표를 찾아 모든 정상 계약과 그 안의 특약(NO. 1번부터 끝까지)을 빠짐없이 추출하세요.
   - PDF 줄바꿈 깨짐으로 인해 한 칸에 두 개의 번호(예: 3번 뇌혈관질환진단특약 500만, 4번 허혈심장질환진단특약 1,000만)가 겹쳐 있더라도 반드시 각각의 특약 객체로 분리하세요.
   - '회사 담보명'이 같더라도(예: 성인병진단금 2개, 입원비 2개) 옆의 '신정원 담보명'이 다르면 절대 합치지 말고 별개의 항목으로 모두 추출하세요.
   - '실효/해지 계약 현황' 페이지와 의무 가입 '자동차 보험 조회(애니카 자동차 등)' 페이지는 절대 추출하지 말고 무시하세요.

2. 유형 B (손해보험 가입제안서) 분석 시:
   - 앞부분의 '■ 가입사항' (또는 가입담보 요약표)에 기재된 기본계약 및 특약 리스트를 기준으로 details를 추출하세요.
   - 뒷부분의 '보장내역(지급사유 상세 설명)' 표를 중복해서 읽고 특약을 두 번씩 추출하는 실수를 절대 하지 마세요.
   - 계약기간이 '2026년 10월 13일부터 2036년 10월 13일까지'와 같이 적혀 있다면 subscription_date는 '2026-10-13', maturity_date는 '2036-10-13'으로 추출하세요.

3. 유형 C (생명보험 상품설명서) 분석 시:
   - '보험계약에 관한 사항 > 주계약 및 특약 보험료' 표에 있는 실제 가입 주계약 및 유료 특약만 추출하세요.
   - 주계약만 단독 설계된 종신보험(예: 신한든든한실속종신보험 3,500만원)인 경우, details 배열에 주계약(또는 사망보험금 3500)을 반드시 1개 이상 포함시키세요.
   - ⭐️ 주의: 보험료가 부과되지 않는 '제도성 특약'(선지급서비스, 대리청구, 사후 사망보험금 신속지급, 표준하체인수, 계약승계, 장애인전용보험전환, 연금전환, 추가납입, 건강나이보험료적용, 신탁변경 등)과 '해약환급금 예시표', '납입면제 예시표'에 나오는 예시 특약은 실제 가입 담보가 아니므로 details에 절대 포함하지 마세요.

[공통 중요 규칙]
1. 보험사명에 '손보'가 포함되면 '손해'로 변경하세요. (예: DB손보 -> DB손해, 라이나손보 -> 라이나손해)
2. 보험사명에 '우정사업본부'가 포함되면 '우체국'로 변경하세요.
3. 생명보험사('신한라이프', 'ABL생명', 'KDB생명' 등)의 경우 보험사명 끝에 '생명'이 빠져있다면(예: '신한라이프') 문맥상 생명보험이므로 특약명(name)에 기재된 '상해'라는 단어는 모두 '재해'로 변경하세요.
4. 특약명(name)에 '소액암제외'가 있으면 '유사암제외'로 변경하세요.
5. 금액(amount)은 무조건 '만원' 단위의 순수 숫자로 변환하세요. (예: 30만원 -> 30 / 3,000만원 -> 3000 / 1억 5,000만원 -> 15000 / 2억원 -> 20000 / 20억원 -> 200000)
6. 마크다운 기호(\`\`\`json)나 인사말 없이 순수 JSON 배열 텍스트만 반환하세요.
`;

    // 1차 시도: 기본 모델(gemini-3.8-flash)을 먼저 시도하고, 503 과부하 시 동적 대체 모델 탐색
    const primaryModel = "gemini-3.8-flash";
    let modelsToTry = [primaryModel, primaryModel]; // 1순위 모델은 최소 2회 기회 부여
    let dynamicModelsFetched = false;

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
        break; // 성공 시 즉시 루프 종료

      } catch (error: any) {
        lastError = error;
        const status = error.status;
        const msg = error.message || "";

        const isOverloadedOrNotFound =
          status === 503 ||
          status === 429 ||
          status === 404 ||
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("404") ||
          msg.includes("overloaded") ||
          msg.includes("high demand") ||
          msg.includes("not found");

        // 최초 실패 시 구글 API에서 현재 활성화된 실제 모델 리스트를 동적으로 가져와 큐에 추가
        if (isOverloadedOrNotFound && !dynamicModelsFetched) {
          dynamicModelsFetched = true;
          const liveModels = await getAvailableFallbackModels(apiKey, primaryModel);
          if (liveModels.length > 0) {
            console.log(`🔍 [실시간 대체 모델 확보]: ${liveModels.join(", ")}`);
            modelsToTry.push(...liveModels);
          } else {
            // 만약 목록 조회마저 실패했다면 기본 모델을 한 번 더 시도하도록 추가
            modelsToTry.push(primaryModel);
          }
        }

        if (i === modelsToTry.length - 1 || !isOverloadedOrNotFound) {
          throw error;
        }

        // 대기 시간을 점진적으로 늘림 (2초 -> 3초 -> 4초...)
        const delayMs = 2000 + i * 1000;
        const nextModel = modelsToTry[i + 1];
        console.warn(
          `⚠️ [${currentModelName} 지연/실패 (코드: ${status || "기타"})] ${delayMs / 1000}초 대기 후 '${nextModel}' 모델로 재시도합니다...`
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

    // DB 저장 전 날짜(YYYY-MM-DD) 및 숫자 포맷을 엄격하게 정제하여 Supabase 에러 원천 차단
    const finalData = (Array.isArray(parsedArray) ? parsedArray : [parsedArray]).map(
      (policy: any) => ({
        insurance_company: policy.insurance_company || "미상",
        product_name: policy.product_name || "상품명 미상",
        payment_period: policy.payment_period || null,
        subscription_date: sanitizeDate(policy.subscription_date),
        maturity_date: sanitizeDate(policy.maturity_date),
        monthly_premium: sanitizeNumber(policy.monthly_premium),
        contractor_name: policy.contractor_name ? String(policy.contractor_name) : null,
        insured_name: policy.insured_name ? String(policy.insured_name) : null,
        beneficiary_name: policy.beneficiary_name
          ? String(policy.beneficiary_name)
          : policy.contractor_name
          ? String(policy.contractor_name)
          : null,
        client_id: Number(clientId),
        agent_name: "",
        policy_status: "maintain",
        details: Array.isArray(policy.details)
          ? policy.details.map((d: any) => ({
              name: d.name ? String(d.name).trim() : "",
              kcredit_name: d.kcredit_name ? String(d.kcredit_name).trim() : "",
              amount: String(sanitizeNumber(d.amount)),
              renewal_type: d.renewal_type || "비갱신",
            }))
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