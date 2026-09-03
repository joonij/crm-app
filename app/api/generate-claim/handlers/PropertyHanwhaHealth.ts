import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillPropertyHanwhaHealth = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];  // 1페이지: 보험금 청구서
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지: 필수 동의서(1)
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지: 필수 동의서(2)

  // 텍스트 그리기 함수 (자간 조절 포함)
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

  // 가운데 정렬 텍스트 그리기 헬퍼 함수
  const drawCenterText = (page: any, text: string, centerX: number, y: number, size = 10) => {
    if (!text || !page) return;
    const textWidth = font.widthOfTextAtSize(text, size);
    const startX = centerX - (textWidth / 2);
    page.drawText(text, { x: startX, y, size, font, color: rgb(0, 0, 0) });
  };

  // 체크박스 그리기 함수 (체크 표시 'V')
  const drawCheck = (page: any, x: number, y: number, size = 12) => {
    if (!page) return;
    page.drawText("V", { x, y, size, font, color: rgb(0, 0, 0) });
  };

  

  // ==========================================
  // [서명 이미지 삽입 로직] - ⭐️ 피보험자 서명으로 수정됨
  // ==========================================
  const sigDims = { width: 60, height: 20 }; // 서명 크기 조정
  let insuredSignatureImg: any = null; // 변수명 변경

  // ⭐️ data.signatureImage -> data.insuredSignatureImage 로 변경
  if (data.insuredSignatureImage) {
    const base64Data = data.insuredSignatureImage.includes('base64,') 
      ? data.insuredSignatureImage.split('base64,')[1] 
      : data.insuredSignatureImage;
    insuredSignatureImg = await pdfDoc.embedPng(base64Data);
  }

  // ==========================================
  // [1페이지] 보험금 청구서 작성
  // ==========================================
  if (firstPage) {
    // 1. 피보험자 인적사항
    drawCenterText(firstPage,   data.insuredName,     182, 710, 11); // 성명
    drawText(firstPage,         data.insuredAddress,  310, 710, 10); // 주소
    drawText(firstPage,         data.insuredRrn,      122, 689, 11, 11.5); // 주민번호 (자간 약간 넓게)
    drawText(firstPage,         data.insuredPhone,    122, 666, 11, 11); // 휴대전화
    
    // 알림톡(문자) 수신 체크
    drawCheck(firstPage, 129, 619); 

    // 사고(내원) 경위 및 치료병원
    drawText(firstPage, data.accidentDesc, 125, 440, 10); 

    // 3. 보험금 입금 요청계좌
    if (data.useSavedAccount === true || data.useSavedAccount === "true") {
      drawCheck(firstPage, 145, 340);
    } else {
      drawCenterText(firstPage, data.bankName,        160, 320, 11); // 은행명
      drawText(firstPage, data.accountNumber,         304, 320, 11, 12); // 계좌번호
      drawCenterText(firstPage, data.beneficiaryName, 160, 298, 11); // 예금주
      drawText(firstPage, data.beneficiaryRrn,        304, 298, 11, 12); // 예금주 주민번호
    }
    
    // 작성일자 및 청구인 서명
    drawText(firstPage, data.todayYear,   130, 125, 11);
    drawText(firstPage, data.todayMonth,  195, 125, 11);
    drawText(firstPage, data.todayDay,    240, 125, 11);

    drawCenterText(firstPage, data.insuredName, 470, 125, 11); // 청구인 성명
    if (insuredSignatureImg) {
      firstPage.drawImage(insuredSignatureImg, { x: 520, y: 125, ...sigDims }); // 서명 이미지
    }
  }

  // ==========================================
  // [2페이지] 필수 동의서 (1) - 수집/이용
  // ==========================================
  if (secondPage) {
    // 동의함 체크박스 좌표 (우측 정렬된 체크박스)
    drawCheck(secondPage, 522, 522); // 1. 고유식별정보 수집/이용 동의
    drawCheck(secondPage, 522, 475); // 2. 민감정보 수집/이용 동의
    drawCheck(secondPage, 522, 415); // 3. 개인(신용)정보 수집/이용 동의
  }

  // ==========================================
  // [3페이지] 필수 동의서 (2) - 제공/조회 및 최종 서명
  // ==========================================
  if (thirdPage) {
    // 2. 제공에 관한 사항 (동의함)
    drawCheck(thirdPage, 522, 725); // 고유식별정보 제공
    drawCheck(thirdPage, 522, 678); // 민감정보 제공
    drawCheck(thirdPage, 522, 610); // 개인(신용)정보 제공 (국내)
    drawCheck(thirdPage, 522, 525); // 개인(신용)정보 제공 (국외)

    // 3. 조회에 관한 사항 (동의함)
    drawCheck(thirdPage, 522, 300); // 고유식별정보 조회
    drawCheck(thirdPage, 522, 267); // 민감정보 조회
    drawCheck(thirdPage, 522, 215); // 개인(신용)정보 조회

    // 하단 날짜 및 서명
    drawText(thirdPage, data.todayYear, 205, 125, 11);
    drawText(thirdPage, data.todayMonth, 260, 125, 11);
    drawText(thirdPage, data.todayDay, 305, 125, 11);

    drawCenterText(thirdPage, data.insuredName, 470, 145, 11); // 피보험자 성명
    if (insuredSignatureImg) {
      thirdPage.drawImage(insuredSignatureImg, { x: 520, y: 145, ...sigDims }); // 최종 서명
    }
  }
};