import { mapToStandardCoverage } from "@/lib/coverageMapper";

// 1. 공통 헬퍼 함수
export const formatAmountWithComma = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (!numericValue) return "";
  return Number(numericValue).toLocaleString("ko-KR");
};

export interface ParsedInsuranceData {
  company: string;
  product: string;
  premium: string;
  subDate: string;
  matDate: string;
  paymentPeriod: string;
  details: { name: string; amount: string; renewal_type: string }[];
}

// ➖➖➖➖➖➖ [모듈화] 일반(디폴트) 텍스트 파서 ➖➖➖➖➖➖
const parseDefault = (pasteText: string, lines: string[], extractedPremium: string, extractedSubDate: string, extractedMatDate: string) => {
  let product = "";
  let paymentPeriod = "";
  let premium = extractedPremium;
  const details: any[] = [];

  const policyNumIndex = lines.findIndex(l => l.includes("증권번호"));
  if (policyNumIndex > 0) product = lines[policyNumIndex - 1];

  const periodMatch = pasteText.match(/\((?:.*?납)?[,\s]*([0-9]+(?:년|세납|세|년납)|전기납|일시납)\)/) || pasteText.match(/([0-9]+(?:년납|세납|년|세)|전기납|일시납)/);
  if (periodMatch) {
    let p = periodMatch[1];
    if (!p.includes("납") && !p.includes("일시") && !p.includes("전기")) p += "납";
    paymentPeriod = p;
  }

  let isPeriodSame = false;
  if (paymentPeriod.includes("전기납")) {
    isPeriodSame = true;
  } else if (extractedSubDate && extractedMatDate && paymentPeriod) {
    const subYear = parseInt(extractedSubDate.split("-")[0], 10);
    const matYear = parseInt(extractedMatDate.split("-")[0], 10);
    const payMatch = paymentPeriod.match(/([0-9]+)년/);
    if (payMatch && !isNaN(subYear) && !isNaN(matYear)) {
      if (matYear - subYear === parseInt(payMatch[1], 10)) isPeriodSame = true;
    }
  }

  const premiumRegex = /([0-9,]+)원\s*(?:약관조회|상품공시실)/;
  const premiumMatch = pasteText.match(premiumRegex);
  if (premiumMatch) {
    premium = premiumMatch[1].replace(/,/g, "");
  } else {
    const termsIndex = lines.findIndex(l => l.includes("약관조회") || l.includes("상품공시실"));
    if (termsIndex > 0) {
      const backupMatch = lines[termsIndex - 1].match(/([0-9,]+)/);
      if (backupMatch) premium = backupMatch[1].replace(/,/g, "");
    }
  }
  
  const expectedMatch = pasteText.match(/납입예정\s*([0-9,]+)원/);
  if (expectedMatch && parseInt(expectedMatch[1].replace(/,/g, ""), 10) === 0) premium = "0";

  for (const line of lines) {
    if (line.includes("보장구분") || line.includes("보장명") || line.includes("실손구분")) continue;

    const coverageRegex = /^(.*?)\s+((?:\d+,?)+\s*(?:억\s*(?:\d+,?)*\s*만원|억원|만원|원))(?:\s+(.*?))?\s+(정상|소멸|유지|해지)$/;
    const match = line.match(coverageRegex);
    
    if (match) {
      let rawName = match[1].trim();
      let amountStr = match[2].trim();
      let periodStr = match[3] ? match[3].trim() : ""; 
      let status = match[4].trim();

      if (status === "소멸" || status === "해지") continue;

      let name = rawName;
      if (rawName.includes("\t")) {
        const parts = rawName.split("\t").filter(t => t.trim() !== "");
        name = parts[parts.length - 1]; 
      } else {
        const parts = rawName.split(/\s+/);
        if (parts.length > 1) {
          if (parts[1].includes(parts[0]) || parts[0].includes(parts[1])) {
            if (parts[0] !== "기타") parts.shift();
          }
        }
        name = parts.join(" ");
      }

      let cleanAmount = amountStr.replace(/,/g, "").replace(/\s/g, "");
      let parsedAmountNum = 0;

      if (cleanAmount.includes("억")) {
        const parts = cleanAmount.split("억");
        parsedAmountNum += (parseInt(parts[0].replace(/[^0-9]/g, ""), 10) || 0) * 10000;
        if (parts[1] && parts[1].includes("만")) parsedAmountNum += parseInt(parts[1].replace(/[^0-9]/g, ""), 10) || 0;
      } else {
        parsedAmountNum = parseInt(cleanAmount.replace(/[^0-9]/g, ""), 10) || 0;
      }

      let renewalType = "비갱신";
      if (periodStr.includes("갱신")) {
        const cycleMatch = periodStr.match(/([0-9]+년)\s*갱신/);
        renewalType = cycleMatch ? `${cycleMatch[1]} 갱신` : "갱신형";
      } else if (name.includes("갱신")) {
        const cycleMatch = name.match(/([0-9]+년)\s*갱신/);
        renewalType = cycleMatch ? `${cycleMatch[1]} 갱신` : "갱신형";
      } else {
        renewalType = isPeriodSame && paymentPeriod ? paymentPeriod : "비갱신";
      }

      details.push({
        name: mapToStandardCoverage(name),
        amount: formatAmountWithComma(parsedAmountNum.toString()),
        renewal_type: renewalType
      });
    }
  }
  return { product, paymentPeriod, premium, mainInsTerm: "", details };
};

// 🌟 최종: 종합 텍스트 분석 실행 함수
export const analyzeInsuranceEngine = (pasteText: string, contractorName: string): ParsedInsuranceData => {
  const lines = pasteText.split('\n').map(l => l.trim()).filter(l => l);

  // 1. 공통 추출: 보험사, 프리미엄, 날짜
  let company = "";
  if (pasteText.includes("라이나생명")) company = "라이나생명";
  else if (pasteText.includes("미래에셋생명")) company = "미래에셋생명";
  else {
    for (const line of lines) {
      const companyMatch = line.match(/([가-힣]+(?:생명|화재|해상|손해|보험|공제))/);
      if (companyMatch && (line.includes("보험") || line.includes("생명") || line.includes("화재") || line.includes("해상") || line.includes("공제"))) {
        company = companyMatch[1]; break;
      }
    }
  }

  let premium = "";
  const premiumMatches = pasteText.match(/(합\s*계|납입보험료|실납입보험료|합계보험료|납입예정)\s*[:|]?\s*([\d,]+)/g);
  if (premiumMatches) {
    const numOnly = premiumMatches[premiumMatches.length - 1].match(/([\d,]+)/);
    if (numOnly) premium = numOnly[1].replace(/,/g, '');
  }

  let subDate = "", matDate = "";
  const dateMatch = pasteText.match(/(\d{4})[./-](\d{2})[./-](\d{2})\s*(?:~|부터|~)\s*(\d{4})[./-](\d{2})[./-](\d{2})/);
  if (dateMatch) {
    subDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    matDate = `${dateMatch[4]}-${dateMatch[5]}-${dateMatch[6]}`;
  }

  // 2. 단일 범용 파서 실행 (복잡했던 라이나/미래에셋 분기 삭제 완료)
  const parsedResult = parseDefault(pasteText, lines, premium, subDate, matDate);
  if (parsedResult.premium) premium = parsedResult.premium;

  // 3. 만기일 스마트 계산
  let calculatedMatDate = matDate;
  const defaultTodayStr = new Date().toISOString().split("T")[0];
  const baseDateStr = subDate || defaultTodayStr;
  
  if (!calculatedMatDate && parsedResult.mainInsTerm) {
    const baseYear = parseInt(baseDateStr.split("-")[0], 10);
    const baseMonthDay = baseDateStr.substring(4); 
    
    if (parsedResult.mainInsTerm.includes("종신")) {
      calculatedMatDate = "9999-12-31";
    } else if (parsedResult.mainInsTerm.includes("년")) {
      const yearMatch = parsedResult.mainInsTerm.match(/(\d+)년/);
      if (yearMatch) calculatedMatDate = `${baseYear + parseInt(yearMatch[1], 10)}${baseMonthDay}`;
    } else if (parsedResult.mainInsTerm.includes("세")) {
      const targetAgeMatch = parsedResult.mainInsTerm.match(/(\d+)세/);
      const currentAgeMatch = pasteText.match(/(\d+)세/); 
      if (targetAgeMatch && currentAgeMatch) {
        const yearsToAdd = parseInt(targetAgeMatch[1], 10) - parseInt(currentAgeMatch[1], 10);
        if (yearsToAdd > 0) calculatedMatDate = `${baseYear + yearsToAdd}${baseMonthDay}`;
      }
    }
  }

  return {
    company,
    product: parsedResult.product,
    premium,
    subDate,
    matDate: calculatedMatDate || "",
    paymentPeriod: parsedResult.paymentPeriod,
    details: parsedResult.details
  };
};