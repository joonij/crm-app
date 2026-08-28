// app/api/parse-insurance-pdf/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: '파일이 없습니다.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const pdfPart = {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf",
      },
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash", 
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // ⭐️ 핵심 수정: 만기일자(maturityDate) 구조 추가 및 종신/0원 규칙 명시
    const prompt = `
당신은 대한민국 최고 수준의 보험 가입제안서 분석 전문가입니다.
첨부된 가입제안서(PDF) 문서를 완벽하게 분석하여 다음 구조의 JSON을 정확히 추출하세요.

{
  "company": "보험사명 (예: DB손해보험, 삼성생명, 메리츠화재 등)",
  "productName": "보험 상품명 (예: 무배당 내맘같은 자녀보험)",
  "paymentPeriod": "납입기간 (예: 20년납, 전기납, 일시납 등)",
  "maturityDate": "만기일자 (형식: YYYY-MM-DD. 문서상 만기가 '종신'으로 표기되어 있다면 반드시 '9999-12-31'로 출력. 그 외에는 유추하여 YYYY-MM-DD 형식으로 작성하되 모르면 빈칸)",
  "monthlyPremium": "월 납입 보험료 (숫자만 추출, 예: 48000. 없으면 0)",
  "coverages": [
    {
      "name": "특약명 (예: 일반암진단비)",
      "amount": "가입금액 숫자만 (단위: 만원 기준. 예: 5000만 원이면 5000. 가입금액이 0원이면 반드시 숫자 0을 입력)",
      "renewal_type": "비갱신, 1년 갱신, 3년 갱신 등 (문서에서 유추 불가 시 '비갱신')"
    }
  ]
}

[중요 규칙]
1. 특약명 추출 시 '(1일이상)', '(치아제외)' 같은 불필요한 조건이나 숫자는 가급적 지우고 핵심 명칭만 남기세요.
2. 금액은 무조건 '만원' 단위의 순수 숫자로 변환하세요. (예: 1,000만원 -> 1000 / 1억 -> 10000 / 500,000원 -> 50)
3. 문서상 보장 만기기간(보험기간)이 '종신'인 경우 "maturityDate"를 "9999-12-31"로 설정하세요.
4. 특약의 가입금액이 0원(또는 공란)인 경우 "amount"에 숫자 0을 입력하세요.
5. 응답은 오직 위 JSON 포맷으로만 반환해야 합니다.
`;

    const result = await model.generateContent([prompt, pdfPart]);
    const responseText = result.response.text();
    
    if (!responseText) throw new Error("제미나이 응답이 비어있습니다.");
    
    const parsedJson = JSON.parse(responseText);
    return NextResponse.json({ success: true, data: parsedJson });

  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}