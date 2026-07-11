// app/api/generate-claim/handlers/meritz.ts
import { PDFDocument, PDFFont, rgb } from "pdf-lib";

export const fillMeritz = async (pdfDoc: PDFDocument, data: any, font: PDFFont) => {
  const pages = pdfDoc.getPages();
  const firstPage = pages[0]; // 1페이지
  const secondPage = pages.length > 1 ? pages[1] : null; // 2페이지 (있을 경우)
  const thirdPage = pages.length > 2 ? pages[2] : null;  // 3페이지 (있을 경우)
  const fourthPage = pages.length > 3 ? pages[3] : null;  // 4페이지 (있을 경우)

  // 메리츠 전용 텍스트 그리기 함수 (글자 크기 조절 자유)
    // ⭐️ spacing(자간) 파라미터가 추가되었습니다. (기본값 0)
  const drawText = (page: any, text: string, x: number, y: number, size = 18, spacing = 0) => {
    if (!text || !page) return;

    // 자간 설정이 0이면 기존처럼 한 번에 통째로 그립니다 (속도 최적화)
    if (spacing === 0) {
      page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
      return;
    }

    // 자간 설정이 있으면 한 글자씩 쪼개서 간격을 벌리며 그립니다.
    let currentX = x;
    for (const char of text) {
      page.drawText(char, { x: currentX, y, size, font, color: rgb(0, 0, 0) });
      
      // 방금 그린 글자의 실제 너비를 계산한 뒤, 원하는 자간(spacing)만큼 X 좌표를 우측으로 밀어줍니다.
      const charWidth = font.widthOfTextAtSize(char, size);
      currentX += charWidth + spacing; 
    }
  };
  
  // ⭐️ 가운데 정렬 텍스트 그리기 헬퍼 함수
  const drawCenterText = (page: any, text: string, centerX: number, y: number, size = 18) => {
    if (!text || !page) return;

    // 1. 현재 폰트와 글자 크기를 기준으로 텍스트가 차지하는 실제 너비 계산
    const textWidth = font.widthOfTextAtSize(text, size);

    // 2. 기준점(centerX)에서 텍스트 너비의 절반을 빼서 진짜 시작 X 좌표 구하기
    const startX = centerX - (textWidth / 2);

    // 3. 계산된 위치에 텍스트 그리기
    page.drawText(text, { x: startX, y, size, font, color: rgb(0, 0, 0) });
  };

  // 메리츠 전용 체크박스 그리기 함수
  const drawCheck = (page: any, x: number, y: number, size = 14) => {
    if (!page) return;
    page.drawText("V", { x, y, size, font, color: rgb(0, 0, 0) });
  };

  // ----------------------------------------------------
  // [1페이지] 데이터 입력 (메리츠 좌표)
  // ----------------------------------------------------
  drawCenterText(firstPage, data.policyholderName, 140, 728);
  drawText(firstPage, data.policyholderRrn, 237, 728, 18, 12.7);

  drawCenterText(firstPage, data.insuredName, 140, 701);
  drawText(firstPage, data.insuredRrn, 237, 701, 18, 12.7);

  drawCenterText(firstPage, data.beneficiaryName, 140, 620);
  drawText(firstPage, data.beneficiaryPhone, 237, 620, 18, 12.3);

  drawText(firstPage, data.bankName, 72, 216, 12);
  drawText(firstPage, data.accountNumber, 87, 187, 18, 12.9);

  drawText(firstPage, data.accidentDesc, 72, 367, 12);

  drawText(firstPage, data.todayYear, 133, 72, 14);
  drawText(firstPage, data.todayMonth, 183, 72, 14);
  drawText(firstPage, data.todayDay, 213, 72, 14);
  
  drawCenterText(firstPage, data.beneficiaryName, 405, 72);

  if (secondPage) {
    // 체크박스 위치
    drawCheck(secondPage, 478, 553);
    drawCheck(secondPage, 478, 480);
    drawCheck(secondPage, 478, 390);

  }
  if (thirdPage) {
    drawCheck(thirdPage, 487, 760);
    drawCheck(thirdPage, 487, 694);
    drawCheck(thirdPage, 487, 613);
    drawCheck(thirdPage, 487, 220);
    drawCheck(thirdPage, 487, 121);
  }
  if (fourthPage) {
    drawCheck(fourthPage, 487, 638);
    drawCheck(fourthPage, 487, 586);
    drawCheck(fourthPage, 487, 504);
    drawText(fourthPage, data.todayYear, 53, 442, 14);
    drawText(fourthPage, data.todayMonth, 132, 442, 14);
    drawText(fourthPage, data.todayDay, 195, 442, 14);
    drawCenterText(fourthPage, data.beneficiaryName, 432, 440);
  }
};