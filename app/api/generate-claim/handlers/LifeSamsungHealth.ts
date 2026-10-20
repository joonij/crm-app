import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillLifeSamsungHealth = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  
  // ⭐️ [페이지 인덱스 주의] 라이나생명 폼의 실제 시작 페이지에 맞춰 배열 인덱스를 조절하세요.
  // 다운로드 후 1페이지가 청구서가 맞다면 그대로 두시고, 안내장이라면 pages[1]로 변경하시면 됩니다.
  const firstPage = pages.length > 0 ? pages[0] : null;  // 1페이지
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지
  const fourthPage = pages.length > 3 ? pages[3] : null; // 4페이지

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

  // if (firstPage) drawGrid(firstPage);
  // if (secondPage) drawGrid(secondPage);
  // if (thirdPage) drawGrid(thirdPage);
  // if (fourthPage) drawGrid(fourthPage); 

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
    drawText(firstPage, data.insuredName,  120, 714.5, 10); // 성명
    drawText(firstPage, data.insuredRrn,   235, 714.5, 10); // 주민번호
    drawText(firstPage, data.insuredPhone, 380, 714.5, 10); // 연락처

    drawText(firstPage, data.accidentDesc, 193, 636, 10); // 사고경위

    // 2. 계약의 수익자 인적사항
    drawText(firstPage,       data.beneficiaryName,  120, 497, 10); // 성명
    drawText(firstPage,       data.beneficiaryRrn,   235, 497, 10); // 주민번호
    drawText(firstPage,       data.beneficiaryPhone, 380, 497, 10); // 연락처
    drawText(firstPage,       data.beneficiaryAddress,120, 465, 10); // 주소

    // 3. 보험금 수령계좌
    drawText(firstPage,      data.bankName,        156, 379, 10); // 은행명
    drawText(firstPage,      data.beneficiaryName,  280, 379, 10); // 성명
    drawText(firstPage,      data.accountNumber,   407, 379, 10); // 계좌번호


    drawCheck(firstPage, 121.5, 312);
    drawCheck(firstPage, 239.5, 303);
    drawCheck(firstPage, 490, 214);

    // 4. 보험금 청구 세부내용

    // 하단 날짜 및 서명
    drawText(firstPage, data.todayYear,   280, 113, 10);
    drawText(firstPage, data.todayMonth,  315, 113, 10);
    drawText(firstPage, data.todayDay,    340, 113, 10);

    // 수익자 서명
    drawText(firstPage, data.beneficiaryName, 438, 113, 10); 
    if (signatureImg) {
      firstPage.drawImage(signatureImg, { x: 508, y: 105, ...sigDims }); 
    }
  }

  // ==========================================
  // [2페이지] 
  // ==========================================

  if (secondPage) {
    drawCheck(secondPage, 480, 653);
    drawCheck(secondPage, 520, 425);
    drawCheck(secondPage, 520, 364);
    drawCheck(secondPage, 520, 280);
  }
  // ==========================================
  // [3페이지] 
  // ==========================================
  if (thirdPage) {
    drawCheck(thirdPage, 520, 695);
    drawCheck(thirdPage, 520, 637);
    drawCheck(thirdPage, 520, 555);
    drawCheck(thirdPage, 520, 179);
    drawCheck(thirdPage, 520, 98);
  }
  // ==========================================
  // [4페이지]
  // ==========================================
  
  if (fourthPage) {
    drawCheck(fourthPage, 520, 559);
    drawCheck(fourthPage, 520, 514);
    drawCheck(fourthPage, 520, 433);


    // 피보험자 최종 서명
    drawText(fourthPage, data.insuredName, 105, 166, 10); 

    // 수익자 최종 서명
    drawText(fourthPage, data.beneficiaryName, 105, 137, 10); 

    // 하단 날짜 및 서명
    drawText(fourthPage, data.todayYear,  270, 87, 10);
    drawText(fourthPage, data.todayMonth, 318, 87, 10);
    drawText(fourthPage, data.todayDay,   354, 87, 10);
  }
};