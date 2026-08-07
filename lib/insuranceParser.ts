import { mapToStandardCoverage } from "@/lib/coverageMapper";

// 1. 공통 헬퍼 함수
export const formatAmountWithComma = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (!numericValue) return "";
  return Number(numericValue).toLocaleString("ko-KR");
};

const isHeaderOrJunk = (line: string) => {
  const s = line.trim();
  if (s.startsWith("※") || s.startsWith("■") || s.startsWith("-") || s.startsWith("*")) return true;

  const noSpace = s.replace(/\s+/g, "").toLowerCase();
  
  if (/^(보험료(\(원\))?|\(만원\)|구분|쪽|page|보험|기간|납입|주기|가입금액|계약사항|보장내용)$/.test(noSpace)) return true;
  
  if (/발행일시|가입안내서|페이지로|동일한번호|발행번호|fc:|tel:|page:|보험회사|미래에셋생명|보험상품명|주피보험자|보험계약의|계약체결시|수령하시기|할인전보험료|실납입보험료|합계|선택특약의|청약서를|기본계약|대상계약|가입특약|특약가입개요|소비자가직접|청약서발행|가입설계번호|대리점명|지점명|설계사명|www\.|라이나생명|chubb|가입설계용|보장내역|계약사항|계약자|지급사유|지급금액|보장합니다|가입기준|보험종류|보험가입금액|보험기간|납입기간|납입주기|의무부가특약|케어매칭서비스|암전장유전체|다수특약에|가입필요및/i.test(noSpace)) return true;
  
  return false;
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

// ➖➖➖➖➖➖ [모듈화] 1. 라이나생명 파서 ➖➖➖➖➖➖
const parseLina = (pasteText: string, lines: string[], contractorName: string) => {
  let product = "";
  let paymentPeriod = "";
  let mainInsTerm = "";
  const details: any[] = [];

  const productMatch = pasteText.match(/보험상품명\s*[|\s]?\s*([^\n]+)/);
  if (productMatch) product = productMatch[1].replace(/무배당/g, '').replace(/\|/g, '').replace(/청약번호.*/, '').trim();

  let tempBuffer: string[] = [];
  for (const line of lines) {
    if (isHeaderOrJunk(line)) {
      tempBuffer = [];
      continue;
    }

    tempBuffer.push(line);
    const fullLine = tempBuffer.join(" ");
    const fullParts = fullLine.split(/\s+/).filter(p => p && p !== "|");
    const len = fullParts.length;

    if (len >= 6) {
      const lastStr = fullParts[len - 1].replace(/,/g, '');
      const isPremium = /^\d+$/.test(lastStr);
      
      const payCandidate = fullParts[len - 2] || ""; 
      const payCandidate2 = fullParts[len - 3] || ""; 
      const isValidPayTerm = payCandidate.includes("납") || payCandidate.includes("년") || payCandidate2.includes("납") || payCandidate2.includes("년");

      if (isPremium && isValidPayTerm) {
        tempBuffer = []; 
        fullParts.pop(); 
        
        const peek = fullParts[fullParts.length - 1];
        if (peek === "월납" || peek === "연납" || peek === "일시납" || /^[월연]납$/.test(peek)) fullParts.pop();

        const payTerm = fullParts.pop() || "20년납";
        const insTerm = fullParts.pop() || "";
        let amount = fullParts.pop()?.replace(/,/g, '') || "0";
        
        const lastNamePart = fullParts[fullParts.length - 1];
        if (lastNamePart === contractorName || /^[가-힣]\*[가-힣]$/.test(lastNamePart || "")) fullParts.pop();

        let rawName = fullParts.join(" ");
        const mainIdx = rawName.indexOf("주계약");
        const subIdx = rawName.indexOf("특약");
        if (mainIdx !== -1 && subIdx !== -1) rawName = rawName.substring(Math.min(mainIdx, subIdx));
        else if (mainIdx !== -1) rawName = rawName.substring(mainIdx);
        else if (subIdx !== -1) rawName = rawName.substring(subIdx);

        let name = rawName.replace(new RegExp(contractorName, "g"), '').trim();
        name = name.replace(/^[^가-힣a-zA-Z0-9\[\(]+/, '');

        const isMain = rawName.includes("주계약");
        if (isMain) {
          if (!product) product = name.replace(/\[.*?\]/g, '').replace(/주계약|기본계약/g, "").trim();
          paymentPeriod = payTerm.includes("납") ? payTerm : payTerm + "납";
          mainInsTerm = insTerm; 
        }
        
        let renewal = "비갱신";
        if (name.includes("갱신형") || name.includes("갱신") || insTerm.includes("갱신")) {
          renewal = insTerm.includes("년") ? `${insTerm.replace(/[^0-9]/g, '')}년 갱신` : "갱신";
        }
        
        name = name.replace(/\([^)]*해약환급금[^)]*\)/g, '').replace(/\(갱신형\)/g, '').replace(/무배당/g, '').replace(/_갱신형/g, '').replace(/주계약\s*/, '').replace(/특약\s*/, '').trim();
        
        if (name.length > 0) {
          const mappedNames = mapToStandardCoverage(name).split("||");
          mappedNames.forEach(mName => details.push({ name: mName, amount: formatAmountWithComma(amount), renewal_type: renewal }));
        }
      }
    }
  }
  return { product, paymentPeriod, mainInsTerm, details };
};

// ➖➖➖➖➖➖ [모듈화] 2. 미래에셋생명 파서 ➖➖➖➖➖➖
const parseMirae = (pasteText: string, lines: string[], contractorName: string) => {
  let product = "";
  let paymentPeriod = "";
  let mainInsTerm = "";
  const details: any[] = [];

  // ⭐️ 1. '보험상품명' 이라는 명확한 키워드 옆의 텍스트를 최우선으로 긁어옵니다.
  const productMatch = pasteText.match(/보험상품명\s*([^\n]+)/);
  if (productMatch) {
    product = productMatch[1].replace(/무배당|\(무\)/g, '').trim();
  } else {
    // 2. 만약 복사 중 '보험상품명' 글자가 깨졌을 경우를 대비한 백업 정규식
    const backupMatch = pasteText.match(/([가-힣A-Za-z0-9-]+\s*건강보험[^\n]*무배당)/);
    if (backupMatch) product = backupMatch[1].replace("상령", "").replace(/무배당/g, '').trim();
  }

  let tempBuffer: string[] = [];
  for (const line of lines) {
    if (isHeaderOrJunk(line)) {
      tempBuffer = []; continue;
    }

    tempBuffer.push(line);
    const fullLine = tempBuffer.join(" ");
    const fullParts = fullLine.split(/\s+/).filter(p => p && p !== "|");
    const len = fullParts.length;

    if (len >= 4) {
      const lastStr = fullParts[len - 1].replace(/,/g, '');
      const isPremium = /^\d+$/.test(lastStr);
      const payCandidate = fullParts[len - 2] || "";
      const isValidPayTerm = payCandidate.includes("납") || payCandidate.includes("년") || payCandidate.includes("세") || payCandidate.includes("일시납");

      if (isPremium && isValidPayTerm) {
        tempBuffer = []; 
        fullParts.pop(); 
        
        let amount = "0", payTerm = "";
        let insTermArr: string[] = [], nameArr: string[] = [];
        let foundAmount = false;

        for (let i = fullParts.length - 1; i >= 0; i--) {
            const part = fullParts[i];
            const cleanPart = part.replace(/,/g, '').replace(/만원/g, '');
            if (!foundAmount && /^\d+$/.test(cleanPart)) {
                amount = cleanPart; foundAmount = true;
            } else if (!foundAmount) {
                if(part.includes("납")) payTerm = part;
                else insTermArr.unshift(part);
            } else nameArr.unshift(part);
        }

        let insTerm = insTermArr.join(" ");
        let rawName = nameArr.join(" ");

        let name = rawName.replace(new RegExp(contractorName, "g"), '').replace(/최초계약\s*\d+년/g, '').replace(/갱신계약\s*\d+년(\s*갱신)?/g, '').replace(/\(최대\s*\d+세\s*만기\)/g, '').replace(/무배\s*당/g, '').replace(/당\s*최초계약/g, '').replace(/최초계약/g, '').replace(/\[해약환급금이[^\]]+\]/g, '').replace(/\([^)]*해약환급금[^)]*\)/g, '').replace(/\[W\]/g, '').trim();
        name = name.replace(/^[^가-힣a-zA-Z0-9\[\(]+/, '');

        if (rawName.includes("주계약") || rawName.includes("기본계약")) {
            if (!product) product = name.replace(/\[.*?\]/g, '').replace(/주계약|기본계약/g, "").trim();
            if (payTerm) paymentPeriod = payTerm;
            mainInsTerm = insTerm; 
        }

        let renewal = "비갱신";
        if (name.includes("갱신형") || insTerm.includes("갱신") || rawName.includes("갱신")) {
            const renewMatch = insTerm.match(/(\d+)년\s*갱신/);
            renewal = renewMatch ? `${renewMatch[1]}년 갱신` : "갱신";
        }
        
        name = name.replace(/\(갱신형\)/g, '').trim();
        if (name.length > 0) {
          const mappedNames = mapToStandardCoverage(name).split("||");
          mappedNames.forEach(mName => details.push({ name: mName, amount: formatAmountWithComma(amount), renewal_type: renewal }));
        }
      }
    }
  }
  return { product, paymentPeriod, mainInsTerm, details };
};

// ➖➖➖➖➖➖ [모듈화] 3. 일반(디폴트) 파서 ➖➖➖➖➖➖
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

// 🌟 최종: 보험사 라우팅 및 종합 분석 실행 함수
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

  // 2. 전략 라우팅 (Strategy Routing)
  let parsedResult;
  if (company === "라이나생명" && (pasteText.includes("발행일시") || pasteText.includes("청약번호"))) {
    parsedResult = parseLina(pasteText, lines, contractorName);
  } else if (company === "미래에셋생명" && (pasteText.includes("발행일시") || pasteText.includes("가입안내서"))) {
    parsedResult = parseMirae(pasteText, lines, contractorName);
  } else {
    parsedResult = parseDefault(pasteText, lines, premium, subDate, matDate);
    if (parsedResult.premium) premium = parsedResult.premium; // 디폴트 파서는 자체 프리미엄 보정이 있음
  }

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