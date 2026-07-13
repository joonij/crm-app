// app/api/generate-claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

// ⭐️ 분리해둔 보험사별 모듈 불러오기
import { fillMeritzHealth } from "./handlers/MeritzHealth";
import { fillHyundaiMarineHealth } from "./handlers/HyundaiMarineHealth";
import { fillDbPropertyHealth } from "./handlers/DbPropertyHealth";
import { fillSamsungFireHealth } from "./handlers/SamsungFireHealth";

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
    
    const receipts = formData.getAll("receipts") as File[];
    console.log(`📌 선택된 보험사: ${claimData.insuranceCompany}`);

    // 2. 보험사별 매핑 로직 (어떤 양식을 열고, 어떤 함수를 실행할지 결정)
    let fileName = "";
    let fillFunction: any = null; // ⭐️ 타입 에러 방지를 위해 null로 초기화

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
    
    // ⭐️ 5. 보험사별 전용 함수 실행! (PDF 문서와 데이터, 폰트를 넘겨줍니다)
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

    // 7. 최종 저장
    const pdfBytesOut = await pdfDoc.save();
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