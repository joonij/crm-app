import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillLifeHanaHealth = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];  // 1페이지: 보험금 청구서
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지: 필수 동의서(1) - 수집/이용
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지: 필수 동의서(2) - 제공
  const fourthPage = pages.length > 3 ? pages[3] : null; // 4페이지: 필수 동의서(3) - 국외/조회 및 최종 서명
  const fifthPage = pages.length > 4 ? pages[4] : null; // 4페이지: 필수 동의서(3) - 국외/조회 및 최종 서명
  const sixthPage = pages.length > 5 ? pages[5] : null; // 4페이지: 필수 동의서(3) - 국외/조회 및 최종 서명

  // ==========================================
  // ⭐️ [좌표 튜닝용] 모눈종이(Grid) 그리기 함수
  // 완료 후 주석 처리하거나 지워주세요!
  // ==========================================
  const drawGrid = (page: any) => {
    if (!page) return;
    const { width, height } = page.getSize();
    
    // 1. 회색 선 긋기 (20픽셀 간격)
    for (let x = 0; x < width; x += 20) {
      page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, color: rgb(0.9, 0.9, 0.9), thickness: 1 });
    }
    for (let y = 0; y < height; y += 20) {
      page.drawLine({ start: { x: 0, y }, end: { x: width, y }, color: rgb(0.9, 0.9, 0.9), thickness: 1 });
    }

    // 2. 모든 칸(교차점)마다 빨간색으로 x, y 좌표 숫자 찍기
    for (let x = 0; x < width; x += 20) {
      for (let y = 0; y < height; y += 20) {
        // 선에 안 가려지게 교차점에서 우측 상단으로 2픽셀씩 띄워서 글씨를 씁니다.
        page.drawText(`${x},${y}`, { 
          x: x, 
          y: y, 
          size: 4, // 글씨가 너무 겹치지 않게 크기를 7로 살짝 줄임
          font, 
          color: rgb(1, 0, 0) 
        });
      }
    }
  };

  // 튜닝 시 아래 주석을 풀고 확인하세요.
  // if (firstPage) drawGrid(firstPage);
  // if (secondPage) drawGrid(secondPage);
  // if (thirdPage) drawGrid(thirdPage);
  // if (fourthPage) drawGrid(fourthPage);
  // if (fifthPage) drawGrid(fifthPage);
  // if (sixthPage) drawGrid(sixthPage);

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

  // ==========================================
  // [서명 이미지 렌더링 로직]
  // ==========================================
  const sigDims = { width: 45, height: 15 };
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
    // 피보험자 인적사항
    drawText(firstPage,       data.insuredName,  97, 595, 9); // 성명
    drawText(firstPage,       data.insuredRrn,   320, 595, 9, 10); // 주민번호
    drawText(firstPage,       data.insuredPhone, 320, 575, 9, 9.5); // 연락처

    // 수익자 인적사항
    drawText(firstPage,       data.beneficiaryName,  97, 519, 9); // 성명
    drawText(firstPage,       data.beneficiaryRrn,   320, 519, 9, 10); // 주민번호
    drawText(firstPage,       data.beneficiaryPhone, 320, 499, 9, 9.5); // 연락처
    drawText(firstPage,       data.beneficiaryAddress,140, 439, 9); // 주소

    drawCheck(firstPage, 149, 260);

    drawText(firstPage, data.beneficiaryName, 137, 220, 9);
    drawText(firstPage, data.beneficiaryRrn,  320, 220, 9, 10); // 주민번호

    drawText(firstPage, data.bankName, 137, 160, 9);
    drawText(firstPage, data.beneficiaryName, 365, 160, 9);
    drawText(firstPage, data.accountNumber, 150, 140, 9, 10.5);
  }

  // ==========================================
  // [2페이지] 동의서 (1/3)
  // ==========================================
  if (secondPage) {
    drawCheck(secondPage, 110, 678);

    drawText(secondPage, data.accidentDesc, 137, 502, 10); // 사고경위

    drawCheck(secondPage, 214, 398);
    drawCheck(secondPage, 214, 378);
    drawCheck(secondPage, 416, 358);
    
    // 날짜
    drawText(secondPage, data.todayYear,   107, 214, 9, 10);
    drawText(secondPage, data.todayMonth,  180, 214, 9, 10);
    drawText(secondPage, data.todayDay,    218, 214, 9, 10);

    // // 피보험자 서명
    // drawCenterText(firstPage, data.insuredName, 150, 63, 9); 
    // if (insuredSignatureImg) {
    //   firstPage.drawImage(insuredSignatureImg, { x: 225, y: 62, ...sigDims }); 
    // }

    // 수익자 서명
    drawText(secondPage, data.beneficiaryName, 330, 214, 9); 
    if (signatureImg) {
      secondPage.drawImage(signatureImg, { x: 410, y: 210, ...sigDims }); 
    }
  }

  // ==========================================
  // [3페이지] 동의서 (2/3)
  // ==========================================
  if (thirdPage) {
    drawCheck(thirdPage, 498, 361);
    drawCheck(thirdPage, 498, 262);
    drawCheck(thirdPage, 498, 162);
  }

  // ==========================================
  // [4페이지] 동의서 (3/3) 및 최종 서명
  // ==========================================
  
  if (fourthPage) {
    drawCheck(fourthPage, 498, 295);
    drawCheck(fourthPage, 498, 218);
    drawCheck(fourthPage, 498, 118);
  }
  
  // ==========================================
  // [5페이지] 
  // ==========================================
  if (fifthPage) {
    drawCheck(fifthPage, 498, 490);
    drawCheck(fifthPage, 498, 422);
    drawCheck(fifthPage, 498, 335);
    
    // 날짜
    drawText(fifthPage, data.todayYear,  80, 202, 9);
    drawText(fifthPage, data.todayMonth, 125, 202, 9);
    drawText(fifthPage, data.todayDay,   160, 202, 9);

    // 피보험자 최종 서명
    drawText(fifthPage, data.insuredName, 325, 293, 9); 
    if (insuredSignatureImg) {
      fifthPage.drawImage(insuredSignatureImg, { x: 510, y: 288, ...sigDims }); 
    }

    // 수익자 최종 서명
    drawText(fifthPage, data.beneficiaryName, 325, 268, 9); 
    if (signatureImg) {
      fifthPage.drawImage(signatureImg, { x: 510, y: 263, ...sigDims }); 
    }

  }

  // ==========================================
  // [6페이지] 
  // ==========================================
  if (sixthPage) {
    drawCheck(sixthPage, 498, 282);
    drawCheck(sixthPage, 498, 210);

    // 피보험자 최종 서명
    drawText(sixthPage, data.insuredName, 370, 167, 9); 
    if (insuredSignatureImg) {
      sixthPage.drawImage(insuredSignatureImg, { x: 515, y: 162, ...sigDims }); 
    }

    // 날짜
    drawText(sixthPage, data.todayYear,  90, 160, 9);
    drawText(sixthPage, data.todayMonth, 135, 160, 9);
    drawText(sixthPage, data.todayDay,   165, 160, 9);
  }
};