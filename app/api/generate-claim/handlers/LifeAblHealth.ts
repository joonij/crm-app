import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillLifeAblHealth = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  
  // ⭐️ [페이지 인덱스 주의] 라이나생명 폼의 실제 시작 페이지에 맞춰 배열 인덱스를 조절하세요.
  // 다운로드 후 1페이지가 청구서가 맞다면 그대로 두시고, 안내장이라면 pages[1]로 변경하시면 됩니다.
  const firstPage = pages.length > 0 ? pages[0] : null;  // 1페이지
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지
  const fourthPage = pages.length > 3 ? pages[3] : null; // 4페이지
  const fifthPage = pages.length > 4 ? pages[4] : null; // 5페이지

  // ==========================================
  // ⭐️ [좌표 튜닝용] 촘촘한 모눈종이(Grid) 그리기 함수
  // ==========================================
  // const drawGrid = (page: any) => {
  //   if (!page) return;
  //   const { width, height } = page.getSize();
  //   for (let x = 0; x < width; x += 20) {
  //     page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
  //   }
  //   for (let y = 0; y < height; y += 20) {
  //     page.drawLine({ start: { x: 0, y }, end: { x: width, y }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
  //   }
  //   for (let x = 0; x < width; x += 20) {
  //     for (let y = 0; y < height; y += 20) {
  //       page.drawText(`${x},${y}`, { x: x, y: y, size: 3, font, color: rgb(1, 0, 0) });
  //     }
  //   }
  // };

  // 튜닝 시 아래 주석을 풀고 확인하세요.
  // if (firstPage) drawGrid(firstPage);
  // if (secondPage) drawGrid(secondPage);
  // if (thirdPage) drawGrid(thirdPage);
  // if (fourthPage) drawGrid(fourthPage); 
  // if (fifthPage) drawGrid(fifthPage); 

  // ==========================================
  // 헬퍼 함수 모음 (안전장치 포함)
  // ==========================================
  const drawText = (page: any, text: string, x: number, y: number, size = 10, spacing = 0) => {
    if (!text || !page) return;
    const safeText = String(text);
    if (spacing === 0) {
      page.drawText(safeText, { x, y, size, font, color: rgb(0, 0, 0) });
      return;
    }
    let currentX = x;
    for (const char of safeText) {
      page.drawText(char, { x: currentX, y, size, font, color: rgb(0, 0, 0) });
      const charWidth = font.widthOfTextAtSize(char, size);
      currentX += charWidth + spacing; 
    }
  };

  const drawCenterText = (page: any, text: string, centerX: number, y: number, size = 10, spacing = 0) => {
    if (!text || !page) return;
    const safeText = String(text);
    const rawTextWidth = font.widthOfTextAtSize(safeText, size);
    const totalSpacing = spacing > 0 ? (safeText.length - 1) * spacing : 0;
    const totalWidth = rawTextWidth + totalSpacing;
    const startX = centerX - (totalWidth / 2);
    drawText(page, safeText, startX, y, size, spacing);
  };

  const drawCheck = (page: any, x: number, y: number, size = 12) => {
    if (!page) return;
    page.drawText("V", { x, y, size, font, color: rgb(0, 0, 0) });
  };

  // ==========================================
  // [서명 이미지 렌더링 로직]
  // ==========================================
  const sigDims = { width: 60, height: 20 };
  let insuredSignatureImg: any = null;
  let signatureImg: any = null;        

  if (data.insuredSignatureImage) {
    const base64Data = data.insuredSignatureImage.includes('base64,') 
      ? data.insuredSignatureImage.split('base64,')[1] 
      : data.insuredSignatureImage;
    insuredSignatureImg = await pdfDoc.embedPng(base64Data);
  }

  if (data.signatureImage) {
    const base64Data = data.signatureImage.includes('base64,') 
      ? data.signatureImage.split('base64,')[1] 
      : data.signatureImage;
    signatureImg = await pdfDoc.embedPng(base64Data);
  }

  // ==========================================
  // [1페이지] 보험금 청구서 작성
  // ==========================================
  if (firstPage) {
    // 1. 피보험자 인적사항
    drawCenterText(firstPage, data.insuredName,  177, 737, 11); // 성명
    drawText(firstPage,       data.insuredRrn,   285, 737, 11); // 주민번호
    drawText(firstPage,       data.insuredPhone, 470, 737, 11); // 연락처

    // 2. 계약의 수익자 인적사항
    drawCenterText(firstPage, data.beneficiaryName,  172, 687, 11); // 성명
    drawText(firstPage,       data.beneficiaryRrn,   285, 687, 11); // 주민번호
    drawText(firstPage,       data.beneficiaryPhone, 470, 687, 11); // 연락처
    drawText(firstPage,       data.beneficiaryAddress,135, 652, 11); // 주소

    // 3. 보험금 수령계좌
    drawText(firstPage,      data.bankName,        180, 613, 10); // 은행명
    drawText(firstPage,      data.beneficiaryName,  275, 613, 10); // 성명
    drawText(firstPage,      data.accountNumber,   395, 613, 10); // 계좌번호

    drawCheck(firstPage, 108, 582); // 일시금
    drawCheck(firstPage, 129, 482); // 진행단계
    drawCheck(firstPage, 154, 462); // 지급지연안내
    drawCheck(firstPage, 154, 437); // 지급내역

    // 4. 보험금 청구 세부내용

    // 하단 날짜 및 서명
    drawText(firstPage, data.todayYear,   84.5, 217.5, 10.7);
    drawText(firstPage, data.todayMonth,  130, 217.5, 10.7);
    drawText(firstPage, data.todayDay,    165, 217.5, 10.7);

    // 수익자 서명
    drawCenterText(firstPage, data.beneficiaryName, 355, 215, 11); 
    if (signatureImg) {
      firstPage.drawImage(signatureImg, { x: 485, y: 210, ...sigDims }); 
    }
  }

  // ==========================================
  // [2페이지] 
  // ==========================================

  if (secondPage) {
    drawText(secondPage, data.accidentDesc, 325, 640, 11); // 사고경위
  }
  // ==========================================
  // [3페이지] 
  // ==========================================
  if (thirdPage) {
    drawCheck(thirdPage, 290, 385);
    drawCheck(thirdPage, 502, 385);

    drawCheck(thirdPage, 460, 249);

    drawCheck(thirdPage, 290, 92);
    drawCheck(thirdPage, 502, 92);
  }
  // ==========================================
  // [4페이지]
  // ==========================================
  
  if (fourthPage) {
    drawCheck(fourthPage, 292, 372);
    drawCheck(fourthPage, 508, 372);

    drawCheck(fourthPage, 463, 252);

    drawCheck(fourthPage, 292, 116);
    drawCheck(fourthPage, 508, 116);
  }
  // ==========================================
  // [5페이지]
  // ==========================================
  
  if (fifthPage) {
    drawCheck(fifthPage, 290, 562);
    drawCheck(fifthPage, 502, 562);

    drawCheck(fifthPage, 460, 480);

    drawCheck(fifthPage, 290, 387);
    drawCheck(fifthPage, 502, 387);

    drawCheck(fifthPage, 290, 173);
    drawCheck(fifthPage, 502, 173);


    // 피보험자 최종 서명
    drawCenterText(fifthPage, data.insuredName, 138, 117, 11); 
    if (insuredSignatureImg) {
      fifthPage.drawImage(insuredSignatureImg, { x: 222, y: 112, ...sigDims }); 
    }

    // 수익자 최종 서명
    drawCenterText(fifthPage, data.beneficiaryName, 138, 85, 11); 
    if (signatureImg) {
      fifthPage.drawImage(signatureImg, { x: 222, y: 80, ...sigDims }); 
    }
    // 하단 날짜 및 서명
    drawText(fifthPage, data.todayYear,  118.7, 59, 11.5);
    drawText(fifthPage, data.todayMonth, 195, 59, 11.5);
    drawText(fifthPage, data.todayDay,   242, 59, 11.5);
  }
};