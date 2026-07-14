// app/api/generate-claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js"; // ⭐️ Supabase 추가

// ⭐️ Supabase 클라이언트 초기화 (백엔드용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ⭐️ 분리해둔 보험사별 모듈 불러오기
import { fillMeritzHealth } from "./handlers/MeritzHealth";
import { fillHyundaiMarineHealth } from "./handlers/HyundaiMarineHealth";
import { fillDbPropertyHealth } from "./handlers/DbPropertyHealth";
import { fillSamsungFireHealth } from "./handlers/SamsungFireHealth";
import { fillHanwhaPropertyHealth } from "./handlers/HanwhaPropertyHealth";
import { fillHeungkukLifeHealth } from "./handlers/HeungkukLifeHealth";

export async function POST(req: NextRequest) {
  try {
    console.log("\n========== [PDF 생성 API 시작] ==========");
    const formData = await req.formData();
    
    const today = new Date();
    const claimData = {
      insuranceCompany: formData.get("insuranceCompany") as string || "",
      
      policyholderName: formData.get("policyholderName") as string || "",
      policyholderRrn: formData.get("policyholderRrn") as string || "",
      policyholderPhone: formData.get("policyholderPhone") as string || "",

      insuredName: formData.get("insuredName") as string || "",
      insuredRrn: formData.get("insuredRrn") as string || "",
      insuredPhone: formData.get("insuredPhone") as string || "",

      useSavedAccount: formData.get("useSavedAccount") as string || "",
      beneficiaryName: formData.get("beneficiaryName") as string || "",
      beneficiaryRrn: formData.get("beneficiaryRrn") as string || "",
      beneficiaryPhone: formData.get("beneficiaryPhone") as string || "",

      bankName: formData.get("bankName") as string || "",
      accountNumber: formData.get("accountNumber") as string || "",
      accidentDesc: formData.get("accidentDesc") as string || "",
      
      signatureImage: formData.get("signatureImage") as string || "",
      insuredSignatureImage: formData.get("insuredSignatureImage") as string || "",
      
      todayYear: String(today.getFullYear()),
      todayMonth: String(today.getMonth() + 1).padStart(2, '0'),
      todayDay: String(today.getDate()).padStart(2, '0'),
    };
    
    // ⭐️ 프론트엔드에서 넘어온 식별자 변수
    const agentIdStr = formData.get("agentId") as string;
    const clientNameStr = formData.get("clientName") as string || claimData.policyholderName;

    const receipts = formData.getAll("receipts") as File[];
    console.log(`📌 선택된 보험사: ${claimData.insuranceCompany}`);

    // 2. 보험사별 매핑 로직
    let fileName = "";
    let fillFunction: any = null; 

    if (claimData.insuranceCompany.includes("메리츠화재")) {
      fileName = "meritzfire_health.pdf";
      fillFunction = fillMeritzHealth;
    } 
    if (claimData.insuranceCompany.includes("현대해상")) {
      fileName = "hyundaimarine_health.pdf";
      fillFunction = fillHyundaiMarineHealth;
    } 
    if (claimData.insuranceCompany.includes("DB손해")) {
      fileName = "dbproperty_health.pdf";
      fillFunction = fillDbPropertyHealth;
    } 
    if (claimData.insuranceCompany.includes("삼성화재")) {
      fileName = "samsungfire_health.pdf";
      fillFunction = fillSamsungFireHealth;
    } 
    if (claimData.insuranceCompany.includes("흥국생명")) {
      fileName = "hanwhaproperty_health.pdf";
      fillFunction = fillHanwhaPropertyHealth;
    } 
    if (claimData.insuranceCompany.includes("흥국생명")) {
      fileName = "heungkuklife_health.pdf";
      fillFunction = fillHeungkukLifeHealth;
    } 

    if (!fileName || !fillFunction) {
      return NextResponse.json(
        { error: "UNSUPPORTED_INSURANCE" }, 
        { status: 400 }
      );
    }

    // 3. PDF 양식 로드
    const templatePath = path.join(process.cwd(), "public", "templates", fileName);
    const templateBytes = await fs.readFile(templatePath);

    // 4. 폰트 로드
    const fontUrl = "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf";
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error("폰트 다운로드 실패");
    const fontBytes = await fontRes.arrayBuffer();
    
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBytes);
    
    // 5. 보험사별 전용 함수 실행
    await fillFunction(pdfDoc, claimData, customFont);
    console.log(`✅ ${claimData.insuranceCompany} 템플릿 데이터 작성 완료`);

    // 6. 영수증 이미지 첨부 (공통 로직)
    for (const file of receipts) {
      const arrayBuffer = await file.arrayBuffer();
      const fileType = file.type;

      if (fileType === "application/pdf") {
        const attachedPdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await pdfDoc.copyPages(attachedPdf, attachedPdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      } else if (fileType === "image/jpeg" || fileType === "image/jpg" || fileType === "image/png") {
        let image;
        if (fileType === "image/jpeg" || fileType === "image/jpg") {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (fileType === "image/png") {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue; 
        }

        const A4_WIDTH = 595;
        const A4_HEIGHT = 842;
        const { width, height } = image.scaleToFit(A4_WIDTH - 40, A4_HEIGHT - 40);
        
        const newPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        newPage.drawImage(image, {
          x: (A4_WIDTH - width) / 2,
          y: (A4_HEIGHT - height) / 2,
          width,
          height,
        });
      } else {
        continue; 
      }
    }

    // 7. 최종 저장 (바이트 추출)
    const pdfBytesOut = await pdfDoc.save();

    // ⭐️ 8. [신규] PDF 생성 직후 Supabase에 바로 저장하고 기록하기!
    try {
      if (agentIdStr && clientNameStr) {
        // ⭐️ [버그 해결] 스토리지(DB) 에러를 막기 위해 파일명을 100% 영문+숫자 난수로 생성합니다.
        // (고객이 화면에서 다운로드할 때는 정상적으로 'OO고객_DB손해_청구서.pdf'로 다운받아집니다.)
        const randomStr = Math.random().toString(36).substring(2, 8);
        const storageFileName = `claim_${Date.now()}_${randomStr}.pdf`;

        // ① Storage 업로드

        // ① Storage 업로드
        const { error: uploadError } = await supabase.storage
          .from('claims_pdf')
          .upload(storageFileName, pdfBytesOut, {
            contentType: 'application/pdf',
            upsert: false
          });

        if (uploadError) {
          console.error("❌ Supabase 스토리지 업로드 실패:", uploadError.message);
        } else {
          // ② 퍼블릭 URL 가져오기
          const { data: publicUrlData } = supabase.storage
            .from('claims_pdf')
            .getPublicUrl(storageFileName);
          
          // ③ Claims 테이블에 한 줄 기록 남기기
          const { error: dbError } = await supabase.from('claims').insert({
            agent_id: parseInt(agentIdStr, 10),
            client_name: clientNameStr,
            insurance_company: claimData.insuranceCompany,
            reason: claimData.accidentDesc || "보험금 청구",
            status: 'pending',
            pdf_url: publicUrlData.publicUrl
          });

          if (dbError) console.error("❌ Claims DB 기록 실패:", dbError.message);
          else console.log("✅ Supabase PDF 스토리지 및 DB 청구 이력 자동 저장 완료!");
        }
      } else {
        console.warn("⚠️ 프론트엔드에서 담당자 ID(agentId)가 오지 않아 DB 기록은 건너뜁니다.");
      }
    } catch (supaErr) {
      console.error("❌ Supabase 연동 중 예외 발생:", supaErr);
      // 저장이 실패해도 고객에게 보내는 PDF 자체는 정상적으로 생성되도록 throw하지 않습니다.
    }

    // 완성된 PDF 클라이언트로 쏴주기
    return new NextResponse(new Uint8Array(pdfBytesOut), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=claim_${encodeURIComponent(claimData.insuranceCompany)}.pdf`,
      },
    });

  } catch (error: any) {
    console.error("\n❌ [PDF 생성 백엔드 에러] ❌", error.message || error);
    return NextResponse.json({ error: error.message || "PDF 생성 실패" }, { status: 500 });
  }
}