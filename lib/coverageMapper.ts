// lib/coverageMapper.ts

export const COVERAGE_OPTIONS = [
  // --- 사망 ---
  "일반사망 진단비", "재해사망 진단비", "상해사망 진단비", "질병사망 진단비", 

  // --- 후유장해 ---
  "재해 후유장해3%↑", "상해 후유장해3%↑", "질병 후유장해3%↑", 
  "재해 후유장해50%↑", "상해 후유장해50%↑", "질병 후유장해50%↑", 
  "재해 후유장해80%↑", "상해 후유장해80%↑", "질병 후유장해80%↑", 

  // --- 암 진단/치료/수술 ---
  "일반암 진단비(유사암제외)", "고액암 진단비", "소액암 진단비", "유사암 진단비", "통합암 진단비",
  "암통원 치료비", "암입원 치료비", "하이클래스암 치료비", "암주요 치료비", "통합암 치료비",
  "항암방사선약물 치료비", "표적항암약물 치료비", "카티항암약물 치료비", "면역항암약물 치료비", "호르몬항암약물 치료비", "항암약물 치료비",
  "항암양성자방사선 치료비", "항암세기조절방사선 치료비", "항암중입자방사선 치료비", "항암방사선 치료비",
  "다빈치로봇일반암 수술비", "다빈치로봇유사암 수술비", "다빈치로봇암 수술비", "로봇암 수술비",
  "암 수술비",

  // --- 뇌/심장/순환계 진단 및 치료 ---
  "뇌산정특례대상 진단비", "뇌혈관질환 진단비", "뇌졸중 진단비", "뇌출혈 진단비",
  "뇌혈관통원 치료비", "뇌혈관통합 치료비", "뇌혈관주요 치료비", 
  "뇌출혈혈전용해 치료비", "뇌졸중혈전용해 치료비", "뇌혈관혈전용해 치료비",
  "뇌출혈 수술비", "뇌졸중 수술비", "뇌혈관질환 수술비",
  
  "심장산정특례대상 진단비", "허혈성심장질환 진단비", "급성심근경색 진단비",
  "부정맥 진단비(기타부정맥제외)", "기타부정맥 진단비", "부정맥 진단비",
  "심부전 진단비", "심근염 진단비", "심장판막증 진단비",
  "심혈관통원 치료비", "심혈관통합 치료비", "심혈관주요 치료비", 
  "급성심근경색혈전용해 치료비", "허혈성심장질환혈전용해 치료비", "심혈관혈전용해 치료비",
  "허혈성심장질환 수술비", "심혈관질환 수술비",

  "순환계질환 진단비", "순환계통합 치료비", "순환계주요 치료비",
  "특정순환계질환 진단비",
  "특정순환계질환 진단비(뇌혈관질환 및 허혈성심장질환 제외)",

  // --- 수술비 (입통원, 철심 포함) ---
  "재해입원 수술비(당일입원제외)", "재해통원 수술비(당일입원포함)",
  "상해입원 수술비(당일입원제외)", "상해통원 수술비(당일입원포함)",
  "질병입원 수술비(당일입원제외)", "질병통원 수술비(당일입원포함)",
  "골절철심제거 수술비", "5대골절 수술비", "골절 수술비", "화상 수술비",
  "재해 수술비", "상해 수술비", "질병 수술비",

  // --- 종수술비 ---
  "재해1종 수술비", "재해2종 수술비", "재해3종 수술비", "재해4종 수술비", "재해5종 수술비",
  "상해1종 수술비", "상해2종 수술비", "상해3종 수술비", "상해4종 수술비", "상해5종 수술비",
  "질병1종 수술비", "질병2종 수술비", "질병3종 수술비", "질병4종 수술비", "질병5종 수술비",

  // --- 입원비 ---
  "재해 입원비(4일이상)", "상해 입원비(4일이상)", "질병 입원비(4일이상)",
  "재해중환자실 입원비", "상해중환자실 입원비", "질병중환자실 입원비", 
  "재해 입원비", "상해 입원비", "질병 입원비",

  // --- 상해/골절/화상 진단 및 치료 ---
  "골절 진단비(치아파절제외)", "골절 진단비(치아파절포함)", "5대골절 진단비", "화상 진단비",
  "통합상해 진단비(중증)", "통합상해 진단비(중등증)", "통합상해 진단비(경증)", "통합상해 진단비",
  "도수정복술 치료비", "깁스 치료비", "골절부목 치료비(치아파절제외)", "골절부목 치료비", "상해재활 치료비",

  // --- 간병인 ---
  "상해간병인 사용비", "질병간병인 사용비", "상해간병인 지원비", "질병간병인 지원비",

  // --- 응급실 ---
  "응급실내원비(비응급)", "응급실내원비(응급)",

  // --- 치아 ---
  "레진", "인레이", "크라운", "임플란트", "보존치료", "보철치료",

  // --- 운전자 및 배상책임 (누락 방지를 위해 기본 옵션에 정식 등록) ---
  "교통사고 처리지원금", "자동차사고 변호사선임비용", "자동차사고 벌금", "자동차부상 치료비", "가족일상생활배상책임", "화재벌금",

  // --- 실손의료비 ---
  "상해입원 실손의료비", "질병입원 실손의료비", 
  "상해통원 실손의료비", "질병통원 실손의료비",
  "상해약제 실손의료비", "질병약제 실손의료비",
  "상해급여 의료비", "질병급여 의료비", "중증상해비급여 의료비", "중증질병비급여 의료비", "중증3대비급여 의료비", "비중증상해비급여 의료비", "비중증질병비급여 의료비", "비중증3대비급여 의료비",

  // --- 장기요양 (진단비, 재가/시설 급여) ---
  "장기요양 1~2등급 진단비", "장기요양 1~3등급 진단비", "장기요양 1~4등급 진단비", "장기요양 1~5등급 진단비", "장기요양 1~인지지원등급 진단비", 
  "장기요양 1~2등급 재가급여", "장기요양 1~3등급 재가급여", "장기요양 1~4등급 재가급여", "장기요양 1~5등급 재가급여", "장기요양 1~인지지원등급 재가급여", 
  "장기요양 1~2등급 시설급여", "장기요양 1~3등급 시설급여", "장기요양 1~4등급 시설급여", "장기요양 1~5등급 시설급여", "장기요양 1~인지지원등급 시설급여"
];

// 띄어쓰기 제거된 비교용 배열
export const ALLOWED_COVERAGES = COVERAGE_OPTIONS.map(name => name.replace(/\s+/g, ""));

// 화면 표출을 위해 잡다한 글자만 자르는 함수
export const mapToStandardCoverage = (rawName: string) => {
  let displayRawName = rawName
    .replace(/\(?\s*[0-9]+\.[0-9]+(\.[0-9]+)?\s*(간\s*편\s*(고\s*지\vert{}심\s*사\vert{}가\s*입)?)?\s*\)?/g, '')
    .replace(/\(?\s*[0-9]{3}\s*간\s*편\s*(고\s*지\vert{}심\s*사\vert{}가\s*입)?\s*\)?/g, '')
    .replace(/\(\s*[0-9]{3}\s*\)/g, '')
    .replace(/\(\s*[IVXⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]+\s*\)/gi, '')
    .replace(/\[?\s*해\s*[지약]\s*환\s*급\s*금\s*이?\s*없\s*는\s*유\s*형\s*\]?/g, '')
    .replace(/간\s*편\s*고\s*지|간\s*편\s*심\s*사|간\s*편\s*가\s*입|간\s*편|특\s*약\s*W?|특\s*약|기\s*본\s*계\s*약/g, '')
    .replace(/\[\s*W\s*\]/g, '')
    .replace(/_?비갱신형?|_?갱신형?/g, '')
    .replace(/무배당|\(무\)/g, '')
    .replace(/해[지약]환급금/g, '')
    .replace(/[무저]해지환급형?|[무저]해지/g, '')
    .replace(/미지급형?|일부지급형?/g, '')
    .replace(/\(\s*[,:\vert{}&/ ]+/g, '(') .replace(/[,:\vert{}&/ ]+\s*\)/g, ')') 
    .replace(/\[\s*[,:\vert{}&/ ]+/g, '[') .replace(/[,:\vert{}&/ ]+\s*\]/g, ']')
    .replace(/[,:|&/]\s*[,:|&/]+/g, ',') 
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .trim()
    .replace(/^[-_]+\s*/, '')
    .replace(/\s{2,}/g, ' ');

  return displayRawName || rawName;
};

// ⭐️ [1순위] 신정원 담보명(kcredit_name)을 COVERAGE_OPTIONS 항목과 1:1 직결하는 함수
export const mapKcreditToStandard = (kcreditRaw: string, rawName: string = ""): { standardDisplayName: string; standardKey: string } | null => {
  if (!kcreditRaw) return null;
  const k = kcreditRaw.replace(/\s+/g, "");
  const r = rawName.replace(/\s+/g, "");

  // '기타'로 뭉뚱그려진 신정원 담보명은 2순위(원본 특약명 분석)로 넘김
  if (k.includes("기타")) return null;

  // 보수적 제외: '교통', '대중교통', '휴일' 등이 붙은 특수 사망/후유장해는 기본 항목에 합산하지 않음
  if (k.includes("교통") || r.includes("교통") || k.includes("휴일") || r.includes("휴일")) {
    if (k.includes("사망") || k.includes("후유장해") || k.includes("수술") || k.includes("입원")) {
      return null;
    }
  }

  let target = "";

  // 1. 사망
  if (k === "질병사망") target = "질병사망 진단비";
  else if (k === "상해사망" || k === "재해사망") target = r.includes("재해") ? "재해사망 진단비" : "상해사망 진단비";
  else if (k === "일반사망") target = "일반사망 진단비";

  // 2. 후유장해 (3%, 50%, 80% 엄격 분리)
  else if (k.includes("후유장해")) {
    const isDisease = k.includes("질병");
    const isDisaster = r.includes("재해") || k.includes("재해");
    const prefix = isDisease ? "질병" : isDisaster ? "재해" : "상해";

    if (k.includes("50%")) target = `${prefix} 후유장해50%↑`;
    else if (k.includes("80%") || r.includes("80%")) target = `${prefix} 후유장해80%↑`;
    else if (k.includes("3%") || r.includes("3%") || k.includes("80%미만")) target = `${prefix} 후유장해3%↑`;
    else return null; // 퍼센트 기준이 불명확하면 함부로 합치지 않음
  }

  // 3. 암 진단/치료/수술
  else if (k === "암진단" || k === "일반암" || k === "일반암진단") target = "일반암 진단비(유사암제외)";
  else if (k.includes("소액암진단") || k.includes("유사암진단") || k === "유사암") target = "유사암 진단비";
  else if (k.includes("고액암")) target = "고액암 진단비";
  else if (k === "항암방사선약물치료비") target = "항암방사선약물 치료비";
  else if (k === "고액항암치료비" || k.includes("표적항암")) {
    if (r.includes("양성자")) target = "항암양성자방사선 치료비";
    else if (r.includes("세기조절")) target = "항암세기조절방사선 치료비";
    else if (r.includes("중입자")) target = "항암중입자방사선 치료비";
    else if (r.includes("표적")) target = "표적항암약물 치료비";
    else if (r.includes("면역")) target = "면역항암약물 치료비";
    else if (r.includes("카티")) target = "카티항암약물 치료비";
    else target = "암주요 치료비";
  }
  else if (k === "암수술" || k === "암수술비") target = "암 수술비";

  // 4. 뇌/심장 질환
  else if (k === "뇌혈관질환진단" || k === "뇌혈관질환") target = "뇌혈관질환 진단비";
  else if (k === "뇌졸중진단" || k === "뇌졸중") target = "뇌졸중 진단비";
  else if (k === "뇌출혈진단" || k === "뇌출혈") target = "뇌출혈 진단비";
  else if (k === "뇌혈관질환수술" || k === "뇌혈관질환수술비") target = "뇌혈관질환 수술비";
  else if (k === "허혈성심장질환진단" || k === "허혈성심장질환") target = "허혈성심장질환 진단비";
  else if (k === "급성심근경색진단" || k === "급성심근경색증") target = "급성심근경색 진단비";
  else if (k === "허혈성심장질환수술" || k === "허혈성심장질환수술비") target = "허혈성심장질환 수술비";

  // 5. 수술 및 입원/간병
  else if (k === "질병수술" || k === "질병수술비") target = "질병 수술비";
  else if (k === "상해수술" || k === "상해수술비") target = "상해 수술비";
  else if (k === "질병종수술") target = "질병5종 수술비";
  else if (k === "상해종수술") target = r.includes("재해") ? "재해5종 수술비" : "상해5종 수술비";
  else if (k === "질병입원일당") target = r.includes("4일") ? "질병 입원비(4일이상)" : "질병 입원비";
  else if (k === "상해입원일당") target = r.includes("4일") ? "상해 입원비(4일이상)" : (r.includes("재해") ? "재해 입원비" : "상해 입원비");
  else if (k.includes("간병인") && k.includes("일당")) target = r.includes("지원") ? "간병인 지원비" : "간병인 사용비";
  else if (k.includes("간호·간병통합") || k.includes("간호간병")) return null; // 간호간병통합은 일반 간병인 사용비와 섞이지 않게 분리

  // 6. 실손의료비
  else if (k.includes("상해") && k.includes("입원의료비")) target = "상해입원 실손의료비";
  else if (k.includes("상해") && (k.includes("외래의료비") || k.includes("통원의료비"))) target = "상해통원 실손의료비";
  else if (k.includes("상해") && k.includes("처방조제")) target = "상해약제 실손의료비";
  else if (k.includes("질병") && k.includes("입원의료비")) target = "질병입원 실손의료비";
  else if (k.includes("질병") && (k.includes("외래의료비") || k.includes("통원의료비"))) target = "질병통원 실손의료비";
  else if (k.includes("질병") && k.includes("처방조제")) target = "질병약제 실손의료비";

  // 7. 운전자 및 일상배상
  else if (k.includes("교통사고처리지원금")) target = "교통사고 처리지원금";
  else if (k.includes("변호사선임비용")) target = "자동차사고 변호사선임비용";
  else if (k.includes("교통사고벌금") || k.includes("벌금(대인")) target = "자동차사고 벌금";
  else if (k.includes("가족생활배상") || k.includes("일상생활배상") || k.includes("가족/일상")) target = "가족일상생활배상책임";
  else if (k.includes("화재벌금")) target = "화재벌금";

  if (target && COVERAGE_OPTIONS.includes(target)) {
    return {
      standardDisplayName: target,
      standardKey: target.replace(/\s+/g, "")
    };
  }

  return null;
};

// ⭐️ [매칭용 엔진] 복잡한 특약명을 표준어로 세탁해주는 함수
export const normalizeCoverageName = (rawName: string) => {
  let n = rawName.replace(/\s+/g, "");

  // 1. 불필요한 기간/조건 괄호 태그 제거
  n = n.replace(/\(\d+년\)/g, "");
  n = n.replace(/\(\d+일이상\)/g, "");
  n = n.replace(/\(갱신형\)/g, "");
  n = n.replace(/\(비갱신형\)/g, "");
  n = n.replace(/\(무배당\)/g, "");
  n = n.replace(/\(무\)/g, "");
  n = n.replace(/무배당/g, "");

  // 2. 명칭 표준화
  n = n.replace(/입원일당/g, "입원비");
  n = n.replace(/입원급여금?/g, "입원비");
  n = n.replace(/수술급여금?/g, "수술비");
  n = n.replace(/진단금/g, "진단비");
  n = n.replace(/진단특약/g, "진단비");
  n = n.replace(/치료특약/g, "치료비");
  n = n.replace(/수술특약/g, "수술비");
  n = n.replace(/허혈심장/g, "허혈성심장");

  // 3. 치아제외 텍스트 교정
  n = n.replace(/\(치아제외\)/g, "(치아파절제외)");
  n = n.replace(/\(치아포함\)/g, "(치아파절포함)");

  // 4. 후유장해 퍼센트 치환 (50%, 80%가 3%로 잘못 빨려들어가는 현상 완벽 차단)
  if (n.includes("후유장해")) {
    if (n.includes("50%")) {
      n = n.replace(/50%이상후유장해|후유장해\(50[~-]100\%\)|후유장해50%이상/g, "후유장해50%↑");
      if (!n.includes("50%↑")) n += "50%↑";
    } else if (n.includes("80%") || n.includes("고도")) {
      n = n.replace(/80%이상후유장해|후유장해\(80[~-]100\%\)|고도후유장해/g, "후유장해80%↑");
      if (!n.includes("80%↑")) n += "80%↑";
    } else if (n.includes("3%")) {
      n = n.replace(/3%이상후유장해|후유장해\(3[~-]100\%\)|후유장해3%이상/g, "후유장해3%↑");
      if (!n.includes("3%↑")) n += "3%↑";
    }
  }

  // 5. 화상부식 -> 화상으로 통일
  n = n.replace(/화상부식/g, "화상");

  return n;
};

// ⭐️ [2순위 필터 엔진] kcredit_name과 rawName을 모두 받아 가장 알맞은 COVERAGE_OPTIONS 항목 추출
export const getStandardCoverageInfo = (rawName: string, kcreditName: string = "") => {
  // 1단계: 신정원 담보명(kcreditName)이 있으면 최우선으로 직결 매칭 시도
  if (kcreditName) {
    const kcreditMatched = mapKcreditToStandard(kcreditName, rawName);
    if (kcreditMatched) return kcreditMatched;
  }

  const normalizedName = normalizeCoverageName(rawName);

  // 보수적 방어막: '교통', '대중교통', '휴일', '자전거'가 들어간 상해/재해 특약은 일반 상해 항목에 합산 금지
  if (normalizedName.includes("교통") || normalizedName.includes("휴일") || normalizedName.includes("자전거")) {
    if (!normalizedName.includes("교통사고처리") && !normalizedName.includes("벌금") && !normalizedName.includes("변호사") && !normalizedName.includes("자동차부상")) {
      return null;
    }
  }

  // 신정원 담보명이 '기타'였을 때의 대표 특수 케이스 구출 (자동차부상, 다빈치로봇 등)
  if (normalizedName.includes("자동차부상")) {
    return { standardDisplayName: "자동차부상 치료비", standardKey: "자동차부상치료비" };
  }
  if (normalizedName.includes("다빈치") || normalizedName.includes("로봇")) {
    if (normalizedName.includes("제외")) return { standardDisplayName: "다빈치로봇일반암 수술비", standardKey: "다빈치로봇일반암수술비" };
    return { standardDisplayName: "다빈치로봇암 수술비", standardKey: "다빈치로봇암수술비" };
  }
  if (normalizedName === "수술비" || rawName.replace(/\s+/g, "") === "수술급여금") {
    return { standardDisplayName: "질병 수술비", standardKey: "질병수술비" };
  }

  // ALLOWED_COVERAGES에서 해당 텍스트를 포함하는 모든 항목 찾기
  const matches = ALLOWED_COVERAGES.filter(allowed => normalizedName.includes(allowed));
  if (matches.length === 0) return null;

  // 문법 오류 수정 완료: 가장 길게 매칭된 항목을 선택
  const bestMatchKey = matches.sort((a, b) => b.length - a.length)[0];
  const matchedIndex = ALLOWED_COVERAGES.indexOf(bestMatchKey);

  // 예외 1: 암 주요 치료비 예외 처리
  if (normalizedName.includes("암주요") && !normalizedName.includes("제외") && bestMatchKey === "암주요치료비") return null; 
  
  // 예외 2: 중대한/특정/대수술 등은 일반 수술비 합산에서 제외
  if (["재해수술비", "상해수술비", "질병수술비"].includes(bestMatchKey)) {
    if (/\d+대/.test(normalizedName) || normalizedName.includes("특정") || normalizedName.includes("중대") || normalizedName.includes("제외") || normalizedName.includes("병원") || normalizedName.includes("외모")) return null;
  }
  // 예외 3: 중환자/특정/요양병원 입원은 일반 입원비 합산에서 제외
  if (["재해입원비", "상해입원비", "질병입원비"].includes(bestMatchKey)) {
    if (/\d+대/.test(normalizedName) || normalizedName.includes("특정") || normalizedName.includes("중대") || normalizedName.includes("제외") || normalizedName.includes("병원") || normalizedName.includes("중환자") || normalizedName.includes("간병")) return null;
  }
  // 예외 4: 골절진단비 예외
  if (bestMatchKey === "골절진단비") {
    if (normalizedName.includes("제외") || /\d+대/.test(normalizedName)) return null;
  }

  // ⚠️ 중요: COVERAGE_OPTIONS에 있는 원본 이름을 그대로 유지해야 표에서 증발하지 않음!
  const standardDisplayName = COVERAGE_OPTIONS[matchedIndex];
  const standardKey = bestMatchKey;

  return { standardDisplayName, standardKey };
};

// 보장 밸런스 레이더 차트 및 12대 공백 진단을 위한 점수 계산 함수
export const calculateCoverageScores = (name: string, beforeVal: number, afterVal: number, isBefore: boolean, isAfter: boolean, scores: any) => {
  if (!name.includes("소액") && !name.includes("유사") && !name.includes("고액") && name.includes("암")) {
    if (isBefore) scores.cancer.before += beforeVal;
    if (isAfter) scores.cancer.after += afterVal;
  }
  if ((!name.includes("제외") && name.includes("유사암")) || name.includes("소액암")) {
    if (isBefore) scores.similarCancer.before += beforeVal;
    if (isAfter) scores.similarCancer.after += afterVal;
  }
  if (name.includes("뇌")) {
    if (isBefore) scores.brain.before += beforeVal;
    if (isAfter) scores.brain.after += afterVal;
  }
  if (name.includes("심장") || name.includes("심근")) {
    if (isBefore) scores.heart.before += beforeVal;
    if (isAfter) scores.heart.after += afterVal;
  }
  if (name.includes("순환")) {
    if (isBefore) scores.circulatory.before += beforeVal;
    if (isAfter) scores.circulatory.after += afterVal;
  }
  if (name.includes("사망") && !name.includes("교통")) {
    if (isBefore) scores.death.before += beforeVal;
    if (isAfter) scores.death.after += afterVal;
  }
  if (name.includes("연금")) {
    if (isBefore) scores.pension.before += beforeVal;
    if (isAfter) scores.pension.after += afterVal;
  }
  if (name.includes("수술")) {
    if (isBefore) scores.surgery.before += beforeVal;
    if (isAfter) scores.surgery.after += afterVal;
    if (isAfter && (name.includes("종") || name.includes("1-5종") || name.includes("1-6종") || name.includes("1-7종") || name.includes("1-8종"))) {
      scores.hasJongSurgery = true;
    }
  }
  if (name.includes("재가") || name.includes("치매")) {
    if (isBefore) scores.homeCare.before += beforeVal;
    if (isAfter) scores.homeCare.after += afterVal;
  }
  if (name.includes("입원") && !name.includes("진단") && !name.includes("간병") && !name.includes("중환자") && !name.includes("제외") && !name.includes("실손") && !name.includes("의료")) {
    if (isBefore) scores.hospitalization.before += beforeVal;
    if (isAfter) scores.hospitalization.after += afterVal;
  }
  if (name.includes("통합상해") || (name.includes("상해") && name.includes("진단"))) {
    if (isBefore) scores.injury.before += beforeVal;
    if (isAfter) scores.injury.after += afterVal;
  }
  if (isAfter) {
    if (name.includes("교통사고처리") || name.includes("변호사선임") || name.includes("자동차부상")) scores.hasDriver = true;
    if (name.includes("임플란트") || name.includes("크라운") || name.includes("보철")) scores.hasDental = true;
  }
};

// 일반사망 등 특수 처리를 포함하여 Map에 금액을 합산하는 함수
export const applyCoverageToMap = (
  standardKey: string, 
  standardDisplayName: string, 
  normalizedName: string, 
  beforeVal: number, 
  afterVal: number, 
  isBefore: boolean, 
  isAfter: boolean, 
  coverageMap: any
) => {
  if (!coverageMap[standardKey]) {
    coverageMap[standardKey] = { displayName: standardDisplayName, before: 0, after: 0, rawNames: [] };
  }
  
  if (isBefore) coverageMap[standardKey].before += beforeVal;
  if (isAfter) coverageMap[standardKey].after += afterVal;

  if (!coverageMap[standardKey].rawNames.includes(normalizedName)) {
    coverageMap[standardKey].rawNames.push(normalizedName);
  }

  // 💀 일반사망 특수 처리 (상해/질병 양쪽에 자동 분배)
  if (standardKey === "일반사망진단비") {
    if (!coverageMap["상해사망진단비"]) coverageMap["상해사망진단비"] = { displayName: "상해사망 진단비", before: 0, after: 0, rawNames: [] };
    if (isBefore) coverageMap["상해사망진단비"].before += beforeVal;
    if (isAfter) coverageMap["상해사망진단비"].after += afterVal;

    if (!coverageMap["질병사망진단비"]) coverageMap["질병사망진단비"] = { displayName: "질병사망 진단비", before: 0, after: 0, rawNames: [] };
    if (isBefore) coverageMap["질병사망진단비"].before += beforeVal;
    if (isAfter) coverageMap["질병사망진단비"].after += afterVal;
  }
};