import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillLifeHeungkukHealth = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];  // 1페이지: 보험금 청구서
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지: 필수 동의서(1) - 수집/이용
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지: 필수 동의서(2) - 제공
  const fourthPage = pages.length > 3 ? pages[3] : null; // 4페이지: 필수 동의서(3) - 국외/조회 및 최종 서명
  const fifthPage = pages.length > 4 ? pages[4] : null; // 4페이지: 필수 동의서(3) - 국외/조회 및 최종 서명

  // ==========================================
  // ⭐️ [좌표 튜닝용] 모눈종이(Grid) 그리기 함수
  // 완료 후 주석 처리하거나 지워주세요!
  // ==========================================
  const drawGrid = (page: any) => {
    if (!page) return;
    const { width, height } = page.getSize();
    
    // 1. 회색 선 긋기 (50픽셀 간격)
    for (let x = 0; x < width; x += 50) {
      page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
    }
    for (let y = 0; y < height; y += 50) {
      page.drawLine({ start: { x: 0, y }, end: { x: width, y }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
    }

    // 2. 모든 칸(교차점)마다 빨간색으로 x, y 좌표 숫자 찍기
    for (let x = 0; x < width; x += 50) {
      for (let y = 0; y < height; y += 50) {
        // 선에 안 가려지게 교차점에서 우측 상단으로 2픽셀씩 띄워서 글씨를 씁니다.
        page.drawText(`${x},${y}`, { 
          x: x + 2, 
          y: y + 2, 
          size: 7, // 글씨가 너무 겹치지 않게 크기를 7로 살짝 줄임
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
  const sigDims = { width: 180, height: 60 };
  let insuredSignatureImg: any = null; // 피보험자 서명
  let signatureImg: any = null;        // 수익자(청구인) 서명

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
    // 1. 피보험자 인적사항 (좌표 추정치 - drawGrid로 미세조정 필요)
    drawCenterText(firstPage, data.insuredName,  540, 3080, 46); // 성명
    drawCenterText(firstPage, data.insuredRrn,   1715,3080, 52, 65); // 주민번호
    drawText(firstPage,       data.insuredPhone, 1225,2960, 52, 62.5); // 휴대전화

    // 2. 수익자(청구인) 인적사항
    drawCenterText(firstPage, data.beneficiaryName,  540, 2590,46); // 성명
    drawCenterText(firstPage, data.beneficiaryRrn,   1715,2590,52, 65); // 주민번호
    drawText(firstPage,       data.beneficiaryPhone, 1225,2470,52 ,62.5); // 휴대전화
    drawText(firstPage,       data.beneficiaryAddress,400,2375,46); // 주소

    drawText(firstPage, data.bankName,        400, 2070, 46); // 은행명
    drawText(firstPage, data.beneficiaryName, 1800,2070, 46); // 예금주명
    drawText(firstPage, data.accountNumber,   440, 1965, 52, 67.1); // 계좌번호 (숫자만)

    // 일시금 신청
    drawCheck(firstPage, 1880,1840, 46); 
    drawCheck(firstPage, 475, 1550, 46); 

    // 3. 사고사항
    drawText(firstPage, data.accidentDesc, 430, 1040, 50); // 사고 경위

    // 안내방법 (문자메세지 동의 기본 체크)
    drawCheck(firstPage, 975,785, 46); 
    drawCheck(firstPage, 2025,785, 46); 
    drawCheck(firstPage, 975,675, 46); 

    // 하단 날짜 및 서명
    drawText(firstPage, data.todayYear,   175, 295, 46);
    drawText(firstPage, data.todayMonth,  440, 295, 46);
    drawText(firstPage, data.todayDay,    600, 295, 46);

    drawCenterText(firstPage, data.beneficiaryName, 1650,290, 46); // 수익자(청구인) 성명
    if (signatureImg) {
      firstPage.drawImage(signatureImg, { x: 2150, y: 285, ...sigDims }); // 수익자 서명
    }
  }

  // ==========================================
  // [2페이지] 필수 동의서 (1)
  // ==========================================
  if (secondPage) {
    drawCheck(secondPage, 2350,1625, 46); // 고유식별정보 수집/이용 동의
    drawCheck(secondPage, 2350,1090, 46); // 민감정보 수집/이용 동의
    drawCheck(secondPage, 2350, 350, 46); // 개인(신용)정보 수집/이용 동의
  }

  // ==========================================
  // [3페이지] 필수 동의서 (2)
  // ==========================================
  if (thirdPage) {
    drawCheck(thirdPage, 2350,1300, 46); // 고유식별정보 제공
    drawCheck(thirdPage, 2350,890, 46); // 민감정보 제공
    drawCheck(thirdPage, 2350,340, 46); // 개인(신용)정보 제공
  }

  // ==========================================
  // [4페이지] 필수 동의서 (3) 및 최종 서명
  // ==========================================
  if (fourthPage) {
    // 국외 제공 동의
    drawCheck(fourthPage, 2350,1940, 46); // 민감정보 국외 제공 동의
    drawCheck(fourthPage, 2350,1200, 46); // 개인(신용)정보 국외 제공 동의

  // ==========================================
  // [5페이지] 필수 동의서 (3) 및 최종 서명
  // ==========================================
    // 조회 동의
    drawCheck(fifthPage, 2350,2095, 46); // 고유식별정보 조회
    drawCheck(fifthPage, 2350,1780, 46); // 민감정보 조회
    drawCheck(fifthPage, 2350,1195, 46); // 개인(신용)정보 조회

    // 하단 날짜 및 서명
    drawText(fifthPage, data.todayYear, 800, 890, 52);
    drawText(fifthPage, data.todayMonth, 1300,890, 52);
    drawText(fifthPage, data.todayDay, 1600,890, 52);

    // 1) 피보험자 서명
    drawCenterText(fifthPage, data.insuredName, 550, 700, 46); 
    if (insuredSignatureImg) {
      fifthPage.drawImage(insuredSignatureImg, { x: 990, y: 700, ...sigDims }); 
    }

    // 2) 수익자(청구인) 서명
    drawCenterText(fifthPage, data.beneficiaryName, 550, 480, 46); 
    if (signatureImg) {
      fifthPage.drawImage(signatureImg, { x: 990, y: 480, ...sigDims }); 
    }
  }
};