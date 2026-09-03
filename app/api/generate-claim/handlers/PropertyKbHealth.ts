import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillPropertyKbHealth = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];  // 1페이지: 보험금 청구서
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지: 동의서 (1)
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지: 동의서 (2)
  const fourthPage = pages.length > 3 ? pages[3] : null; // 4페이지: 동의서 (3) 및 최종 서명

  // ==========================================
  // ⭐️ [좌표 튜닝용] 모눈종이(Grid) 그리기 함수
  // 완료 후 주석 처리하거나 지워주세요!
  // ==========================================
  const drawGrid = (page: any) => {
    if (!page) return;
    const { width, height } = page.getSize();
    for (let x = 0; x < width; x += 50) {
      page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
      page.drawText(`${x}`, { x: x + 2, y: 15, size: 8, font, color: rgb(1, 0, 0) });
    }
    for (let y = 0; y < height; y += 50) {
      page.drawLine({ start: { x: 0, y }, end: { x: width, y }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
      page.drawText(`${y}`, { x: 15, y: y + 2, size: 8, font, color: rgb(1, 0, 0) });
    }
  };

  // 튜닝 시 아래 주석을 풀고 확인하세요.
  // if (firstPage) drawGrid(firstPage);
  // if (secondPage) drawGrid(secondPage);
  // if (thirdPage) drawGrid(thirdPage);
  // if (fourthPage) drawGrid(fourthPage);

  // ==========================================
  // 헬퍼 함수 모음
  // ==========================================
  const drawText = (page: any, text: string, x: number, y: number, size = 10, spacing = 0) => {
    if (!text || !page) return;
    if (spacing === 0) {
      page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
      return;
    }
    let currentX = x;
    for (const char of text) {
      page.drawText(char, { x: currentX, y, size, font, color: rgb(0, 0, 0) });
      const charWidth = font.widthOfTextAtSize(char, size);
      currentX += charWidth + spacing; 
    }
  };

// 가운데 정렬 텍스트 그리기 헬퍼 함수 (자간 조절 완벽 지원)
const drawCenterText = (page: any, text: string, centerX: number, y: number, size = 10, spacing = 0) => {
  if (!text || !page) return;
  
  const rawTextWidth = font.widthOfTextAtSize(text, size);
  const totalSpacing = spacing > 0 ? (text.length - 1) * spacing : 0;
  const totalWidth = rawTextWidth + totalSpacing;
  const startX = centerX - (totalWidth / 2);
  drawText(page, text, startX, y, size, spacing);
};

  const drawCheck = (page: any, x: number, y: number, size = 12) => {
    if (!page) return;
    page.drawText("V", { x, y, size, font, color: rgb(0, 0, 0) });
  };

  const sigDims = { width: 60, height: 20 }; // 서명 크기 조정
  // ==========================================
  // [서명 이미지 삽입 로직]
  // ==========================================
  let signatureImg: any = null;

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
    // 1. 피보험자 인적사항 (좌표는 임시 추정치이므로 drawGrid로 미세 조정 필요)
    drawCenterText(firstPage, data.insuredName,     145, 731, 11); // 성명
    drawCenterText(firstPage, data.insuredRrn,      391, 731, 11, 17.5); // 주민번호
    drawText(firstPage,       data.insuredPhone,    137, 700, 11, 17); // 휴대전화
    drawText(firstPage,       data.insuredAddress,  120, 675, 11); // 주소

    // 2. 계약자 인적사항
    drawCenterText(firstPage, data.policyholderName, 145, 644, 11); // 성명
    drawCenterText(firstPage, data.policyholderRrn,  391, 644, 11, 17.5); // 주민번호
    drawText(firstPage,       data.policyholderPhone,137, 585, 11, 17); // 휴대전화

    // 보상안내 받으실 분 (기본 피보험자 체크)
    drawCheck(firstPage, 95, 615); 

    // 3. 사고사항
    drawText(firstPage, data.accidentDesc, 80, 380, 11); // 사고 경위

    // 4. 보험금 수령 계좌
    if (data.useSavedAccount === true || data.useSavedAccount === "true") {
      drawCheck(firstPage, 90, 205);
    } else {
      drawCenterText(firstPage, data.bankName,        150, 175, 11); // 은행명
      drawText(firstPage,       data.accountNumber,   270, 175, 11); // 계좌번호
      drawCenterText(firstPage, data.beneficiaryName, 540, 175, 11); // 예금주
    }
    
    // 작성일자 및 청구인 서명
    drawText(firstPage, data.todayYear,   40, 75, 11);
    drawText(firstPage, data.todayMonth,  90, 75, 11);
    drawText(firstPage, data.todayDay,    125, 75, 11);

    drawCenterText(firstPage, data.insuredName, 480, 75, 11); // 청구인 성명
    if (signatureImg) {
      firstPage.drawImage(signatureImg, { x: 530, y: 70, ...sigDims });
    }
  }

  // ==========================================
  // [2페이지] 필수 동의서 (1)
  // ==========================================
  if (secondPage) {
    drawCheck(secondPage, 527, 510); // 고유식별정보 수집/이용 동의
    drawCheck(secondPage, 527, 433); // 민감정보 수집/이용 동의
    drawCheck(secondPage, 527, 345); // 개인(신용)정보 수집/이용 동의
  }

  // ==========================================
  // [3페이지] 필수 동의서 (2)
  // ==========================================
  if (thirdPage) {
    drawCheck(thirdPage, 527, 695); // 고유식별정보 제공
    drawCheck(thirdPage, 527, 620); // 민감정보 제공
    drawCheck(thirdPage, 527, 530); // 개인(신용)정보 제공
    
    drawCheck(thirdPage, 527, 195); // 민감정보 제공 (국외)
    drawCheck(thirdPage, 527, 120); // 개인(신용)정보 제공 (국외)
  }

  // ==========================================
  // [4페이지] 필수 동의서 (3) 및 최종 서명
  // ==========================================
  if (fourthPage) {
    drawCheck(fourthPage, 525, 585); // 고유식별정보 조회
    drawCheck(fourthPage, 525, 557); // 민감정보 조회
    drawCheck(fourthPage, 525, 445); // 개인(신용)정보 조회

    // 하단 날짜 및 서명
    drawText(fourthPage, data.todayYear, 391, 225, 14);
    drawText(fourthPage, data.todayMonth, 470, 225, 14);
    drawText(fourthPage, data.todayDay, 530, 225, 14);

    drawCenterText(fourthPage, data.insuredName, 70, 300, 11); // 동의자 성명
    
    if (signatureImg) {
      fourthPage.drawImage(signatureImg, { x: 150, y: 300, ...sigDims }); // 최종 서명
    }
  }
};