// app/api/generate-claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    console.log("\n========== [PDF 생성 API 시작] ==========");
    const formData = await req.formData();
    
    const insuredName = formData.get("insuredName") as string || "";
    const insuredRrn = formData.get("insuredRrn") as string || "";
    const insuredPhone = formData.get("insuredPhone") as string || "";
    const bankName = formData.get("bankName") as string || "";
    const accountNumber = formData.get("accountNumber") as string || "";
    const accidentDesc = formData.get("accidentDesc") as string || "";
    const receipts = formData.getAll("receipts") as File[];

    // 1. PDF 양식 로드
    const templatePath = path.join(process.cwd(), "public", "templates", "meritzfire_claim_health.pdf");
    const templateBytes = await fs.readFile(templatePath);
    console.log(`✅ 1. PDF 양식 로드 완료 (크기: ${Math.round(templateBytes.length / 1024)} KB)`);

    // ⭐️ 2. 폰트를 로컬 파일이 아닌 인터넷(CDN)에서 실시간으로 안전하게 가져옵니다! (에러 원천 차단)
    console.log("⏳ 2. 안전한 한글 폰트 실시간 다운로드 중...");
    const fontUrl = "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf";
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error("폰트 다운로드 실패");
    const fontBytes = await fontRes.arrayBuffer();
    console.log(`✅ 3. 한글 폰트 준비 완료 (크기: ${Math.round(fontBytes.byteLength / 1024)} KB)`);

    // 3. PDF 로드 및 폰트 세팅
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBytes);
    console.log("✅ 4. PDF에 폰트 내장 성공");

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const draw = (text: string, x: number, y: number, size = 10) => {
      if (!text) return;
      firstPage.drawText(text, { x, y, size, font: customFont, color: rgb(0, 0, 0) });
    };

    draw(insuredName, 150, 700);
    draw(insuredRrn, 300, 700);
    draw(insuredPhone, 450, 700);
    draw(accidentDesc, 150, 550);
    draw(bankName, 150, 400);
    draw(accountNumber, 300, 400);

    console.log("✅ 5. 텍스트 입력 성공");

    for (const file of receipts) {
      const arrayBuffer = await file.arrayBuffer();
      const fileType = file.type;

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
    }
    console.log(`✅ 6. 이미지 병합 성공 (첨부: ${receipts.length}장)`);

    // 여기서 가장 많이 뻗었었습니다.
    console.log("⏳ 7. 최종 PDF 파일 저장 중...");
    const pdfBytesOut = await pdfDoc.save();
    console.log("🎉 8. PDF 최종 생성 완료!!");

    return new NextResponse(pdfBytesOut, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=claim.pdf",
      },
    });

  } catch (error) {
    console.error("\n❌ [PDF 생성 백엔드 에러] ❌", error);
    return NextResponse.json({ error: "PDF 생성 실패" }, { status: 500 });
  }
}