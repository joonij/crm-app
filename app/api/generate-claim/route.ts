// app/api/generate-claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib"; // ⭐️ rgb 추가
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

import { fillLifeAblHealth } from "./handlers/LifeAblHealth";
import { fillLifeLinaHealth } from "./handlers/LifeLinaHealth";
import { fillLifeHeungkukHealth } from "./handlers/LifeHeungkukHealth";
import { fillPropertyDbHealth } from "./handlers/PropertyDbHealth";
import { fillPropertyKbHealth } from "./handlers/PropertyKbHealth";
import { fillPropertyLinaHealth } from "./handlers/PropertyLinaHealth";
import { fillPropertyMeritzHealth } from "./handlers/PropertyMeritzHealth";
import { fillPropertSamsungHealth } from "./handlers/PropertSamsungHealth";
import { fillPropertyHanwhaHealth } from "./handlers/PropertyHanwhaHealth";
import { fillPropertyHyundaiHealth } from "./handlers/PropertyHyundaiHealth";

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
      insuredAddress: formData.get("insuredAddress") as string || "",

      useSavedAccount: formData.get("useSavedAccount") as string || "",
      beneficiaryName: formData.get("beneficiaryName") as string || "",
      beneficiaryRrn: formData.get("beneficiaryRrn") as string || "",
      beneficiaryPhone: formData.get("beneficiaryPhone") as string || "",
      beneficiaryAddress: formData.get("beneficiaryAddress") as string || "",

      bankName: formData.get("bankName") as string || "",
      accountNumber: formData.get("accountNumber") as string || "",
      accidentDesc: formData.get("accidentDesc") as string || "",
      
      signatureImage: formData.get("signatureImage") as string || "",
      insuredSignatureImage: formData.get("insuredSignatureImage") as string || "",
      
      // ⭐️ 프론트엔드에서 넘긴 팩스 번호 받기
      faxNumber: formData.get("faxNumber") as string || "",
      
      todayYear: String(today.getFullYear()),
      todayMonth: String(today.getMonth() + 1).padStart(2, '0'),
      todayDay: String(today.getDate()).padStart(2, '0'),
    };
    
    const agentIdStr = formData.get("agentId") as string;
    const clientNameStr = formData.get("clientName") as string || claimData.policyholderName;

    const receipts = formData.getAll("receipts") as File[];
    console.log(`📌 선택된 보험사: ${claimData.insuranceCompany}`);

    let fileName = "";
    let fillFunction: any = null; 

    if (claimData.insuranceCompany.includes("ABL생명")) {
      fileName = "lifeabl_health.pdf";
      fillFunction = fillLifeAblHealth;
    } 
    if (claimData.insuranceCompany.includes("라이나생명")) {
      fileName = "lifelina_health.pdf";
      fillFunction = fillLifeLinaHealth;
    } 
    if (claimData.insuranceCompany.includes("흥국생명")) {
      fileName = "lifeheungkuk_health.pdf";
      fillFunction = fillLifeHeungkukHealth;
    } 
    if (claimData.insuranceCompany.includes("DB손해")) {
      fileName = "propertydb_health.pdf";
      fillFunction = fillPropertyDbHealth;
    } 
    if (claimData.insuranceCompany.includes("KB손해")) {
      fileName = "propertykb_health.pdf";
      fillFunction = fillPropertyKbHealth;
    } 
    if (claimData.insuranceCompany.includes("라이나손해")) {
      fileName = "propertylina_health.pdf";
      fillFunction = fillPropertyLinaHealth;
    } 
    if (claimData.insuranceCompany.includes("메리츠화재")) {
      fileName = "propertymeritz_health.pdf";
      fillFunction = fillPropertyMeritzHealth;
    } 
    if (claimData.insuranceCompany.includes("삼성화재")) {
      fileName = "propertsamsung_health.pdf";
      fillFunction = fillPropertSamsungHealth;
    } 
    if (claimData.insuranceCompany.includes("한화손해")) {
      fileName = "propertyhanwha_health.pdf";
      fillFunction = fillPropertyHanwhaHealth;
    } 
    if (claimData.insuranceCompany.includes("현대해상")) {
      fileName = "propertyhyundai_health.pdf";
      fillFunction = fillPropertyHyundaiHealth;
    } 

    if (!fileName || !fillFunction) {
      return NextResponse.json(
        { error: "UNSUPPORTED_INSURANCE" }, 
        { status: 400 }
      );
    }

    const templatePath = path.join(process.cwd(), "public", "templates", fileName);
    const templateBytes = await fs.readFile(templatePath);

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

    // ⭐️ [신규] 모든 청구서 1페이지 우측 상단에 팩스번호 공통으로 찍기
    if (claimData.faxNumber) {
      const pages = pdfDoc.getPages();
      if (pages.length > 0) {
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize(); 
        
        firstPage.drawText(`[팩스 수신처: ${claimData.faxNumber}]`, {
          x: width - 160, // 우측 여백
          y: height - 10, // 상단 여백
          size: 11,
          font: customFont,
          color: rgb(0.1, 0.4, 0.8), // 시인성 높은 파란색 텍스트
        });
        console.log(`✅ 팩스번호 우측 상단 인쇄 완료: ${claimData.faxNumber}`);
      }
    }

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

        const { width, height } = image.scale(1);
        const newPage = pdfDoc.addPage([width, height]);
        
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      } else {
        continue; 
      }
    }

    // 7. 최종 저장 (바이트 추출)
    const pdfBytesOut = await pdfDoc.save();

    // 8. Supabase 저장 로직
    try {
      if (agentIdStr && clientNameStr) {
        const randomStr = Math.random().toString(36).substring(2, 8);
        const storageFileName = `claim_${Date.now()}_${randomStr}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from('claims_pdf')
          .upload(storageFileName, pdfBytesOut, {
            contentType: 'application/pdf',
            upsert: false
          });

        if (uploadError) {
          console.error("❌ Supabase 스토리지 업로드 실패:", uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('claims_pdf')
            .getPublicUrl(storageFileName);
          
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
    }

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