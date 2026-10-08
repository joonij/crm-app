import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillLifeMiraeAssetHealth = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];  // 1페이지: 보험금 청구서
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지: 필수 동의서(1) - 수집/이용
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지: 필수 동의서(2) - 제공
  const fourthPage = pages.length > 3 ? pages[3] : null; // 4페이지: 필수 동의서(3) - 국외/조회 및 최종 서명

  // ==========================================
  // ⭐️ [좌표 튜닝용] 모눈종이(Grid) 그리기 함수
  // 완료 후 주석 처리하거나 지워주세요!
  // ==========================================
  const drawGrid = (page: any) => {
    if (!page) return;
    const { width, height } = page.getSize();
    
    // 1. 회색 선 긋기 (20픽셀 간격)
    for (let x = 0; x < width; x += 20) {
      page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
    }
    for (let y = 0; y < height; y += 20) {
      page.drawLine({ start: { x: 0, y }, end: { x: width, y }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
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
    drawText(firstPage,       data.insuredName,  137, 732, 9); // 성명
    drawText(firstPage,       data.insuredRrn,   245, 732, 9); // 주민번호
    drawText(firstPage,       data.insuredPhone, 365, 732, 9); // 연락처

    // 수익자 인적사항
    drawText(firstPage,       data.beneficiaryName,  137, 687, 9); // 성명
    drawText(firstPage,       data.beneficiaryRrn,   245, 687, 9); // 주민번호
    drawText(firstPage,       data.beneficiaryPhone, 365, 687, 9); // 연락처
    drawText(firstPage,       data.beneficiaryAddress,137, 667, 9); // 주소

    // 보험금 수령계좌
    drawText(firstPage,       data.bankName,        137, 586, 9); // 은행명
    drawText(firstPage,       data.beneficiaryName, 245, 586, 9); // 수익자성명
    drawText(firstPage,       data.accountNumber,   365, 586, 9); // 계좌번호

    drawCheck(firstPage, 145, 570);

    // 보험금 청구 세부내용
    drawText(firstPage, data.accidentDesc, 140, 450, 9); // 사고경위

    drawCheck(firstPage, 99, 365);
    drawCheck(firstPage, 278, 354);
    drawCheck(firstPage, 448, 365);

    // 날짜
    drawText(firstPage, data.todayYear,   85.5, 201.5, 9);
    drawText(firstPage, data.todayMonth,  140, 201.5, 9);
    drawText(firstPage, data.todayDay,    180, 201.5, 9);

    // // 피보험자 서명
    // drawCenterText(firstPage, data.insuredName, 150, 63, 9); 
    // if (insuredSignatureImg) {
    //   firstPage.drawImage(insuredSignatureImg, { x: 225, y: 62, ...sigDims }); 
    // }

    // 수익자 서명
    drawText(firstPage, data.beneficiaryName, 290, 200, 9); 
    if (signatureImg) {
      firstPage.drawImage(signatureImg, { x: 395, y: 195, ...sigDims }); 
    }
  }

  // ==========================================
  // [2페이지] 동의서 (1/3)
  // ==========================================
  if (secondPage) {
    drawCheck(secondPage, 510, 375);
    drawCheck(secondPage, 510, 265);
    drawCheck(secondPage, 510, 155);
  }


  // ==========================================
  // [3페이지] 동의서 (2/3)
  // ==========================================
  if (thirdPage) {
    drawCheck(thirdPage, 510, 330);
    drawCheck(thirdPage, 510, 225);
    drawCheck(thirdPage, 510, 110);
  }

  // ==========================================
  // [4페이지] 동의서 (3/3) 및 최종 서명
  // ==========================================
  
  if (fourthPage) {
    drawCheck(fourthPage, 510, 540);
    drawCheck(fourthPage, 510, 415);
    drawCheck(fourthPage, 510, 325);

    // 날짜
    drawText(fourthPage, data.todayYear,  225, 289, 10.5);
    drawText(fourthPage, data.todayMonth, 295, 289, 10.5);
    drawText(fourthPage, data.todayDay,   340, 289, 10.5);

    // 피보험자 최종 서명
    drawText(fourthPage, data.insuredName, 90, 190, 10); 
    if (insuredSignatureImg) {
      fourthPage.drawImage(insuredSignatureImg, { x: 175, y: 185, ...sigDims }); 
    }

    // 수익자 최종 서명
    drawText(fourthPage, data.beneficiaryName, 90, 140, 10); 
    if (signatureImg) {
      fourthPage.drawImage(signatureImg, { x: 175, y: 135, ...sigDims }); 
    }
  }
};