import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillLifeLinaHealth = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  
  // ⭐️ [페이지 인덱스 주의] 라이나생명 폼의 실제 시작 페이지에 맞춰 배열 인덱스를 조절하세요.
  // 다운로드 후 1페이지가 청구서가 맞다면 그대로 두시고, 안내장이라면 pages[1]로 변경하시면 됩니다.
  const firstPage = pages.length > 0 ? pages[0] : null;  // 1페이지: 보험금 청구서
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지: 동의서 (1/3)
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지: 동의서 (2/3)
  const fourthPage = pages.length > 3 ? pages[3] : null; // 4페이지: 동의서 (3/3) 및 최종 서명

  // ==========================================
  // ⭐️ [좌표 튜닝용] 촘촘한 모눈종이(Grid) 그리기 함수
  // ==========================================
  const drawGrid = (page: any) => {
    if (!page) return;
    const { width, height } = page.getSize();
    for (let x = 0; x < width; x += 50) {
      page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
    }
    for (let y = 0; y < height; y += 50) {
      page.drawLine({ start: { x: 0, y }, end: { x: width, y }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
    }
    for (let x = 0; x < width; x += 50) {
      for (let y = 0; y < height; y += 50) {
        page.drawText(`${x},${y}`, { x: x + 2, y: y + 2, size: 7, font, color: rgb(1, 0, 0) });
      }
    }
  };

  // 튜닝 시 아래 주석을 풀고 확인하세요.
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
  const sigDims = { width: 30, height: 10 };
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
    drawCenterText(firstPage, data.insuredName,  115, 660, 11); // 성명
    drawText(firstPage,       data.insuredRrn,   220, 660, 11); // 주민번호
    drawText(firstPage,       data.insuredPhone, 410, 660, 11); // 연락처

    // 2. 계약의 수익자 인적사항
    drawCenterText(firstPage, data.beneficiaryName,  115, 597, 11); // 성명
    drawText(firstPage,       data.beneficiaryRrn,   220, 597, 11); // 주민번호
    drawText(firstPage,       data.beneficiaryPhone, 410, 597, 11); // 연락처
    drawText(firstPage,       data.beneficiaryAddress,90, 550, 11); // 주소

    // 3. 보험금 수령계좌
    drawCenterText(firstPage, data.bankName,        150, 505, 11); // 은행명
    drawText(firstPage,       data.accountNumber,   245, 505, 11); // 계좌번호

    drawCheck(secondPage, 160, 470); // 고유식별정보

    // 4. 보험금 청구 세부내용
    drawText(firstPage, data.accidentDesc, 160, 295, 10); // 사고경위

    // 하단 날짜 및 서명
    drawText(firstPage, data.todayYear,   435, 90, 11);
    drawText(firstPage, data.todayMonth,  488, 90, 11);
    drawText(firstPage, data.todayDay,    522, 90, 11);

    // 피보험자 서명
    drawCenterText(firstPage, data.insuredName, 150, 63, 11); 
    if (insuredSignatureImg) {
      firstPage.drawImage(insuredSignatureImg, { x: 235, y: 62, ...sigDims }); 
    }

    // 수익자 서명
    drawCenterText(firstPage, data.beneficiaryName, 150, 45, 11); 
    if (signatureImg) {
      firstPage.drawImage(signatureImg, { x: 235, y: 45, ...sigDims }); 
    }
  }

  // ==========================================
  // [2페이지] 동의서 (1/3)
  // ==========================================
  // 라이나생명은 피보험자와 수익자의 동의칸이 분리되어 있습니다.
  drawCenterText(secondPage, data.insuredName, 200, 611, 11); // 상단 피보험자 성명
  drawCenterText(secondPage, data.insuredRrn, 470, 611, 11); // 상단 피보험자 성명
  
  // 피보험자 동의 (X좌표 대략 430 추정)
  drawCheck(secondPage, 343, 345); // 고유식별정보
  drawCheck(secondPage, 343, 245); // 민감정보
  drawCheck(secondPage, 343, 140); // 개인(신용)정보

  // 수익자 동의 (X좌표 대략 510 추정)
  drawCheck(secondPage, 505, 345); // 고유식별정보
  drawCheck(secondPage, 505, 245); // 민감정보
  drawCheck(secondPage, 505, 140); // 개인(신용)정보

  // ==========================================
  // [3페이지] 동의서 (2/3)
  // ==========================================
  // 피보험자 동의
  drawCheck(thirdPage, 343, 263); // 고유식별정보
  drawCheck(thirdPage, 343, 165); // 민감정보
  drawCheck(thirdPage, 343, 70); // 개인(신용)정보

  // 수익자 동의
  drawCheck(thirdPage, 505, 263); // 고유식별정보
  drawCheck(thirdPage, 505, 165); // 민감정보
  drawCheck(thirdPage, 505, 70); // 개인(신용)정보

  // ==========================================
  // [4페이지] 동의서 (3/3) 및 최종 서명
  // ==========================================
  
  if (fourthPage) {
    // 피보험자 동의
    drawCheck(fourthPage, 343, 487); // 고유식별정보 조회
    drawCheck(fourthPage, 343, 437); // 민감정보 조회
    drawCheck(fourthPage, 343, 332); // 개인(신용)정보 조회

    // 수익자 동의
    drawCheck(fourthPage, 505, 487); // 고유식별정보 조회
    drawCheck(fourthPage, 505, 437); // 민감정보 조회
    drawCheck(fourthPage, 505, 332); // 개인(신용)정보 조회

    // 하단 날짜 및 서명
    drawText(fourthPage, data.todayYear,  209, 161, 11);
    drawText(fourthPage, data.todayMonth, 300, 161, 11);
    drawText(fourthPage, data.todayDay,   350, 161, 11);

    // 피보험자 최종 서명
    drawCenterText(fourthPage, data.insuredName, 190, 110, 11); 
    if (insuredSignatureImg) {
      fourthPage.drawImage(insuredSignatureImg, { x: 255, y: 110, ...sigDims }); 
    }

    // 수익자 최종 서명
    drawCenterText(fourthPage, data.beneficiaryName, 190, 87, 11); 
    if (signatureImg) {
      fourthPage.drawImage(signatureImg, { x: 255, y: 87, ...sigDims }); 
    }
  }
};