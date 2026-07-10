// app/api/generate-claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

// ⭐️ 각 보험사별 PDF 템플릿 파일명 및 텍스트 좌표(X, Y) 설정
const getTemplateConfig = (insuranceCompany: string) => {
  // 오늘 날짜 문자열 포맷팅 (청구일자 기입용)
  const today = new Date();
  const year = String(today.getFullYear());
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  // 보험사 이름에 특정 키워드가 포함되어 있으면 해당 양식 반환
  // if (insuranceCompany.includes("삼성화재")) {
  //   return {
  //     fileName: "samsungfire_claim_health.pdf",
  //     coords: {
  //       // ... (1페이지 기본 좌표들) ...
        
  //       // ⭐️ [2페이지]
  //       page2Checks: [
  //         { x: 120, y: 650 }, { x: 120, y: 500 } // V 체크할 좌표들
  //       ],
  //       page2Names: [
  //         { x: 300, y: 150 }, { x: 450, y: 150 } // 서명란(이름) 찍을 좌표들
  //       ],

  //       // ⭐️ [3페이지]
  //       page3Checks: [
  //         { x: 150, y: 700 }, { x: 150, y: 600 }
  //       ],
  //       page3Names: [
  //         { x: 450, y: 100 }
  //       ]
  //     }
  //   };
  // }
  
  // if (insuranceCompany.includes("DB손해")) {
  //   return {
  //     fileName: "dbins_claim_health.pdf", // DB손보 양식
  //     coords: {
  //       policyholderName: { x: 140, y: 715 }, policyholderRrn: { x: 300, y: 715 }, policyholderPhone: { x: 450, y: 715 },
  //       insuredName: { x: 140, y: 685 }, insuredRrn: { x: 300, y: 685 }, insuredPhone: { x: 450, y: 685 },
  //       beneficiaryName: { x: 140, y: 460 }, beneficiaryRrn: { x: 300, y: 460 }, beneficiaryPhone: { x: 450, y: 460 },
  //       bankName: { x: 140, y: 420 }, accountNumber: { x: 300, y: 420 },
  //       accidentDesc: { x: 140, y: 540 },
  //       dateYear: { x: 390, y: 160 }, dateMonth: { x: 450, y: 160 }, dateDay: { x: 490, y: 160 },
  //       todayYear: year, todayMonth: month, todayDay: day
  //     }
  //   };
  // }

  // 매칭되는 게 없거나 메리츠화재일 경우 (기본값)
  return {
    fileName: "meritzfire_claim_health.pdf", 
    coords: {
      // ⚠️ 아래 좌표값은 예시이므로, 실제 PDF 파일의 빈칸 위치에 맞게 x, y 숫자를 세부 조절하셔야 합니다.
      policyholderName: { x: 150, y: 730 },
      policyholderRrn: { x: 300, y: 730 },
      policyholderPhone: { x: 450, y: 730 },

      insuredName: { x: 150, y: 700 },
      insuredRrn: { x: 300, y: 700 },
      insuredPhone: { x: 450, y: 700 },

      beneficiaryName: { x: 150, y: 450 },
      beneficiaryRrn: { x: 300, y: 450 },
      beneficiaryPhone: { x: 450, y: 450 },

      bankName: { x: 150, y: 400 },
      accountNumber: { x: 300, y: 400 },
      accidentDesc: { x: 150, y: 550 },

      dateYear: { x: 350, y: 180 },
      dateMonth: { x: 410, y: 180 },
      dateDay: { x: 450, y: 180 },
      todayYear: year, todayMonth: month, todayDay: day,
      
      // ⭐️ [2페이지]
      page2Checks: [
        { x: 120, y: 650 },
        { x: 120, y: 500 } // V 체크할 좌표들
      ],
      page2Names: [
        { x: 120, y: 650 },
        { x: 120, y: 500 } // 서명란(이름) 찍을 좌표들
      ],

      // ⭐️ [3페이지]
      page3Checks: [
        { x: 150, y: 700 },
        { x: 150, y: 600 }
      ],
      page3Names: [
        { x: 450, y: 100 }
      ]
    }
  };
};

export async function POST(req: NextRequest) {
  try {
    console.log("\n========== [PDF 생성 API 시작] ==========");
    const formData = await req.formData();
    
    // 1. 프론트엔드에서 넘어온 모든 데이터 추출
    const insuranceCompany = formData.get("insuranceCompany") as string || "메리츠화재";
    
    const policyholderName = formData.get("policyholderName") as string || "";
    const policyholderRrn = formData.get("policyholderRrn") as string || "";
    const policyholderPhone = formData.get("policyholderPhone") as string || "";

    const insuredName = formData.get("insuredName") as string || "";
    const insuredRrn = formData.get("insuredRrn") as string || "";
    const insuredPhone = formData.get("insuredPhone") as string || "";

    const beneficiaryName = formData.get("beneficiaryName") as string || "";
    const beneficiaryRrn = formData.get("beneficiaryRrn") as string || "";
    const beneficiaryPhone = formData.get("beneficiaryPhone") as string || "";

    const bankName = formData.get("bankName") as string || "";
    const accountNumber = formData.get("accountNumber") as string || "";
    const accidentDesc = formData.get("accidentDesc") as string || "";
    
    const receipts = formData.getAll("receipts") as File[];

    console.log(`📌 선택된 보험사: ${insuranceCompany}`);

    // 2. 보험사 이름에 맞는 템플릿 설정 가져오기
    const templateConfig = getTemplateConfig(insuranceCompany);
    const { fileName, coords } = templateConfig;

    // 3. 알맞은 PDF 양식 로드
    const templatePath = path.join(process.cwd(), "public", "templates", fileName);
    const templateBytes = await fs.readFile(templatePath);
    console.log(`✅ 양식 로드 완료: ${fileName} (${Math.round(templateBytes.length / 1024)} KB)`);

    // 4. 안전한 한글 폰트 실시간 다운로드 (CDN)
    console.log("⏳ 한글 폰트 실시간 다운로드 중...");
    const fontUrl = "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf";
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error("폰트 다운로드 실패");
    const fontBytes = await fontRes.arrayBuffer();
    
    // 5. PDF 로드 및 폰트 세팅
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; // 1페이지
    const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지 (있을 경우만)
    const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지 (있을 경우만)

    // 일반 텍스트 입력 헬퍼 함수
    const draw = (text: string, x: number, y: number, size = 18) => { // 전체폰트크기
      if (!text) return;
      firstPage.drawText(text, { x, y, size, font: customFont, color: rgb(0, 0, 0) });
    };

    // ⭐️ 체크박스(V) 입력 헬퍼 함수
    const drawCheck = (page: any, x: number, y: number) => {
      if (!page) return;
      // 대문자 V 또는 ✔ 사용 (글씨 크기를 살짝 키워 14 정도로 주면 펜으로 체크한 것처럼 보입니다)
      page.drawText("V", { x, y, size: 14, font: customFont, color: rgb(0, 0, 0) }); // 전체체크박스크기
    };

    // 6. 설정된 좌표(coords)를 이용해 1페이지에 데이터 찍기
    draw(policyholderName, coords.policyholderName.x, coords.policyholderName.y);
    draw(policyholderRrn, coords.policyholderRrn.x, coords.policyholderRrn.y);
    draw(policyholderPhone, coords.policyholderPhone.x, coords.policyholderPhone.y);
    
    draw(insuredName, coords.insuredName.x, coords.insuredName.y);
    draw(insuredRrn, coords.insuredRrn.x, coords.insuredRrn.y);
    draw(insuredPhone, coords.insuredPhone.x, coords.insuredPhone.y);
    
    draw(beneficiaryName, coords.beneficiaryName.x, coords.beneficiaryName.y);
    draw(beneficiaryRrn, coords.beneficiaryRrn.x, coords.beneficiaryRrn.y);
    draw(beneficiaryPhone, coords.beneficiaryPhone.x, coords.beneficiaryPhone.y);
    
    draw(bankName, coords.bankName.x, coords.bankName.y);
    draw(accountNumber, coords.accountNumber.x, coords.accountNumber.y);
    draw(accidentDesc, coords.accidentDesc.x, coords.accidentDesc.y);
    
    draw(coords.todayYear, coords.dateYear.x, coords.dateYear.y);
    draw(coords.todayMonth, coords.dateMonth.x, coords.dateMonth.y);
    draw(coords.todayDay, coords.dateDay.x, coords.dateDay.y);

    
    // 2페이지 체크박스 자동 입력
    if (secondPage && coords.page2Checks) {
      coords.page2Checks.forEach((pos) => drawCheck(secondPage, pos.x, pos.y));
    }
    
    // ⭐️ 2페이지 서명(이름) 자동 입력 응용
    if (secondPage && coords.page2Names) {
      coords.page2Names.forEach((pos) => draw(insuredName, pos.x, pos.y));
    }

    console.log("✅ 양식 텍스트 및 체크박스 입력 성공");

    // 7. 영수증 이미지 첨부 (이하 기존과 동일)
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
    console.log(`✅ 이미지 병합 성공 (첨부: ${receipts.length}장)`);

    // 8. 최종 PDF 파일 저장 및 반환
    const pdfBytesOut = await pdfDoc.save();
    console.log("🎉 PDF 최종 생성 완료!!");

    // Vercel Edge Runtime 등 호환성을 위해 Uint8Array 사용
    return new NextResponse(new Uint8Array(pdfBytesOut), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=claim_${encodeURIComponent(insuranceCompany)}.pdf`,
      },
    });

  } catch (error: any) {
    console.error("\n❌ [PDF 생성 백엔드 에러] ❌", error.message || error);
    return NextResponse.json({ error: error.message || "PDF 생성 실패" }, { status: 500 });
  }
}