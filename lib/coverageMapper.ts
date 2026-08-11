// 자동완성을 위한 옵션 리스트 정의 (이곳에서 한 번만 관리하면 모든 곳에 반영됩니다)
export const COVERAGE_OPTIONS = [
    // --- 사망 ---
    "일반사망 진단비", "재해사망 진단비", "상해사망 진단비", "질병사망 진단비", 
  
    // --- 후유장해 ---
    "재해 후유장해3%↑", "상해 후유장해3%↑", "질병 후유장해3%↑", 
    "재해 후유장해50%↑", "상해 후유장해50%↑", "질병 후유장해50%↑", 
    "재해 후유장해80%↑", "상해 후유장해80%↑", "질병 후유장해80%↑", 
  
    // --- 암 진단/치료/수술 ---
    "일반암 진단비", "고액암 진단비", "유사암 진단비", "통합암 진단비",
    "암통원 치료비", "하이클래스암 치료비", "암주요 치료비", "통합암 치료비",
    "항암방사선약물 치료비", "표적항암약물 치료비", "카티항암약물 치료비", "면역항암약물 치료비", "호르몬항암약물 치료비", "항암약물 치료비",
    "항암양성자방사선 치료비", "항암세기조절방사선 치료비", "항암중입자방사선 치료비", "항암방사선 치료비",
    "다빈치로봇일반암 수술비", "다빈치로봇유사암 수술비", "다빈치로봇암 수술비", "로봇암 수술비",
    "일반암 수술비", "유사암 수술비", "암 수술비",
  
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
    "골절철심제거 수술비", "골절 수술비", "화상 수술비",
    "재해 수술비", "상해 수술비", "질병 수술비",
  
    // --- 종수술비 ---
    "재해1종 수술비", "재해2종 수술비", "재해3종 수술비", "재해4종 수술비", "재해5종 수술비",
    "상해1종 수술비", "상해2종 수술비", "상해3종 수술비", "상해4종 수술비", "상해5종 수술비",
    "질병1종 수술비", "질병2종 수술비", "질병3종 수술비", "질병4종 수술비", "질병5종 수술비",
  
    // --- 입원비 ---
    "재해 입원비(3일이상)", "상해 입원비(3일이상)", "질병 입원비(3일이상)",
    "재해중환자실 입원비", "상해중환자실 입원비", "질병중환자실 입원비", 
    "재해 입원비", "상해 입원비", "질병 입원비",
  
    // --- 상해/골절/화상 진단 및 치료 ---
    "골절 진단비(치아파절제외)", "골절 진단비(치아파절포함)", "골절 진단비", "5대골절 진단비", "화상 진단비",
    "통합상해 진단비(중증)", "통합상해 진단비(중등증)", "통합상해 진단비(경증)",
    "도수정복술 치료비", "깁스 치료비", "골절부목 치료비", "상해재활 치료비",
  
    // --- 응급실 ---
    "응급실내원비(비응급)", "응급실내원비(응급)",
  
    // --- 실손의료비 ---
    "상해입원 실손의료비", "질병입원 실손의료비", 
    "상해통원 실손의료비", "질병통원 실손의료비",
    "상해약제 실손의료비", "질병약제 실손의료비",
  
    // --- 장기요양 (진단비, 재가/시설 급여) ---
    "장기요양 1~2등급 진단비", "장기요양 1~3등급 진단비", "장기요양 1~4등급 진단비", "장기요양 1~5등급 진단비", "장기요양 1~인지지원등급 진단비", 
    "장기요양 1~2등급 재가급여", "장기요양 1~3등급 재가급여", "장기요양 1~4등급 재가급여", "장기요양 1~5등급 재가급여", "장기요양 1~인지지원등급 재가급여", 
    "장기요양 1~2등급 시설급여", "장기요양 1~3등급 시설급여", "장기요양 1~4등급 시설급여", "장기요양 1~5등급 시설급여", "장기요양 1~인지지원등급 시설급여"
  ];
  
  
  // 특약명 매핑(변환) 함수
  export const mapToStandardCoverage = (rawName: string) => {
    let displayRawName = rawName
      .replace(/\(?\s*[0-9]+\.[0-9]+(\.[0-9]+)?\s*(간\s*편\s*(고\s*지|심\s*사|가\s*입)?)?\s*\)?/g, '')
      .replace(/\(?\s*[0-9]{3}\s*간\s*편\s*(고\s*지|심\s*사|가\s*입)?\s*\)?/g, '')
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
      
      .replace(/\(\s*[,:|&/ ]+/g, '(') 
      .replace(/[,:|&/ ]+\s*\)/g, ')') 
      .replace(/\[\s*[,:|&/ ]+/g, '[') 
      .replace(/[,:|&/ ]+\s*\]/g, ']')
      .replace(/[,:|&/]\s*[,:|&/]+/g, ',') 
  
      .replace(/\(\s*\)/g, '')
      .replace(/\[\s*\]/g, '')
      .trim()
      .replace(/^[-_]+\s*/, '')
      .replace(/\s{2,}/g, ' ');
  
    if (!displayRawName) displayRawName = rawName;
  
    let extraTags = "";
    const tagsMatch = displayRawName.match(/\([^)]+\)/g);
    if (tagsMatch) {
      extraTags = tagsMatch.join("");
    }
  
    const getMappedName = () => {
  
      const name = displayRawName.replace(/\s+/g, ""); 


      
    // 미래에셋생명 특약
    if (name.includes("특정순환계질환") && name.includes("진단")) return "특정순환계질환 진단비";
    if (name.includes("특정순환계질환") && name.includes("통합치료비")) return "특정순환계질환통합 치료비";
    // 미래에셋생명 특약

    if (name.includes("납입") && (name.includes("면제"))) return "납입면제";
    if (name.includes("납입") && (name.includes("지원"))) return "납입지원";
      
    if ((name.includes("처방") || name.includes("약제") || name.includes("조제")) && name.includes("상해")) return "상해약제 실손의료비";
    if ((name.includes("처방") || name.includes("약제") || name.includes("조제")) && name.includes("질병")) return "질병약제 실손의료비";
    if ((name.includes("실손") || name.includes("의료") || name.includes("외래")) && name.includes("상해")) return "상해통원 실손의료비";
    if ((name.includes("실손") || name.includes("의료") || name.includes("외래")) && name.includes("질병")) return "질병통원 실손의료비";
    if (name.includes("입통원") && name.includes("상해")) return "상해입원 실손의료비";
    if (name.includes("입통원") && name.includes("질병")) return "질병입원 실손의료비";
    if (!name.includes("왜래") && !name.includes("통원") && (name.includes("실손") || name.includes("의료")) && name.includes("상해") && name.includes("입원")) return "상해입원 실손의료비";
    if (!name.includes("왜래") && !name.includes("통원") && (name.includes("실손") || name.includes("의료")) && name.includes("질병") && name.includes("입원")) return "질병입원 실손의료비";
    
    if (name.includes("특정") && (name.includes("후유") || name.includes("장해"))) return displayRawName;
    if (name.includes("교통") && (name.includes("후유") || name.includes("장해"))) return displayRawName;
    if (name.includes("고도") && name.includes("재해") && (name.includes("후유") || name.includes("장해"))) return "재해 후유장해80%↑";
    if (name.includes("재해") && name.includes("고도") && (name.includes("후유") || name.includes("장해"))) return "재해 후유장해80%↑";
    if (name.includes("고도") && name.includes("상해") && (name.includes("후유") || name.includes("장해"))) return "상해 후유장해80%↑";
    if (name.includes("상해") && name.includes("고도") && (name.includes("후유") || name.includes("장해"))) return "상해 후유장해80%↑";
    if (name.includes("고도") && name.includes("질병") && (name.includes("후유") || name.includes("장해"))) return "질병 후유장해80%↑";
    if (name.includes("질병") && name.includes("고도") && (name.includes("후유") || name.includes("장해"))) return "질병 후유장해80%↑";
    if (name.includes("재해") && (name.includes("후유") || name.includes("장해")) && name.includes("80")) return "재해 후유장해80%↑";
    if (name.includes("상해") && (name.includes("후유") || name.includes("장해")) && name.includes("80")) return "상해 후유장해80%↑";
    if (name.includes("질병") && (name.includes("후유") || name.includes("장해")) && name.includes("80")) return "질병 후유장해80%↑";
    if (name.includes("재해") && (name.includes("후유") || name.includes("장해")) && name.includes("50")) return "재해 후유장해50%↑";
    if (name.includes("상해") && (name.includes("후유") || name.includes("장해")) && name.includes("50")) return "상해 후유장해50%↑";
    if (name.includes("질병") && (name.includes("후유") || name.includes("장해")) && name.includes("50")) return "질병 후유장해50%↑";
    if (name.includes("재해") && (name.includes("후유") || name.includes("장해"))) return "재해 후유장해3%↑";
    if (name.includes("상해") && (name.includes("후유") || name.includes("장해"))) return "상해 후유장해3%↑";
    if (name.includes("질병") && (name.includes("후유") || name.includes("장해"))) return "질병 후유장해3%↑";

    if (name.includes("소아") && name.includes("암") && name.includes("진단")) return displayRawName;
    if (name.includes("재진단") && name.includes("암") && name.includes("진단")) return displayRawName;
    if (name.includes("특정") && name.includes("암") && name.includes("진단")) return displayRawName;
    if (name.includes("통합") && name.includes("암") && name.includes("진단")) return "통합암 진단비";
    // if (name.includes("유사암제외") && name.includes("소액암제외") && name.includes("암") && name.includes("진단")) return "일반암 진단비(소액암유사암제외)";
    // if (name.includes("소액암제외") && name.includes("암") && name.includes("진단")) return "일반암 진단비(유사암제외)";
    // if (name.includes("유사암제외") && name.includes("암") && name.includes("진단")) return "일반암 진단비(유사암제외)";
    // if (name.includes("제외") && name.includes("암") && name.includes("진단")) return "일반암 진단비(유사암제외)";
    if (name.includes("제외") && name.includes("암") && name.includes("진단")) return "일반암 진단비";
    if (name.includes("고액암") && name.includes("진단")) return "고액암 진단비";
    if (name.includes("소액암") && name.includes("진단")) return "유사암 진단비";
    if (name.includes("유사암") && name.includes("진단")) return "유사암 진단비";
    // if (name.includes("암") && name.includes("진단")) return "일반암 진단비(유사암제외)";
    if (name.includes("암") && name.includes("진단")) return "일반암 진단비";

    if (name.includes("암") && name.includes("입원")) return "암 입원비";
    if (name.includes("암") && name.includes("통원")) return "암통원 치료비";
    if (name.includes("암") && name.includes("특정") && name.includes("치료")) return displayRawName;
    if (name.includes("암") && name.includes("하이") && name.includes("치료")) return displayRawName;
    if (name.includes("비급여") && name.includes("암") && name.includes("주요") && name.includes("치료")) return displayRawName;
    if (name.includes("암") && name.includes("주요") && name.includes("치료")) return displayRawName;
    if (name.includes("암") && name.includes("통합") && name.includes("치료")) return displayRawName;

    if (name.includes("방사선") && name.includes("약물") && name.includes("치료")) return "항암방사선약물 치료비";

    if (name.includes("표적") && name.includes("암") && name.includes("치료")) return "표적항암약물 치료비";
    if ((name.includes("C") || name.includes("카티")) && name.includes("암") && name.includes("치료")) return "카티항암약물 치료비";
    if (name.includes("면역") && name.includes("암") && name.includes("치료")) return "면역항암약물 치료비";
    if (name.includes("호르몬") && name.includes("암") && name.includes("치료")) return "호르몬항암약물 치료비";
    if (name.includes("암") && name.includes("약물") && name.includes("치료")) return "항암약물 치료비";

    if (name.includes("양성자") && name.includes("치료")) return "항암양성자방사선 치료비";
    if (name.includes("세기") && name.includes("치료")) return "항암세기조절방사선 치료비";
    if (name.includes("중입자") && name.includes("치료")) return "항암중입자방사선 치료비";
    if (name.includes("암") && name.includes("방사선") && name.includes("치료")) return "항암방사선 치료비";

    // if (name.includes("다빈치") && name.includes("제외") && name.includes("수술")) return "다빈치로봇일반암 수술비(유사암제외)";
    if (name.includes("다빈치") && name.includes("제외") && name.includes("수술")) return "다빈치로봇일반암 수술비";
    if (name.includes("다빈치") && (name.includes("소액") || name.includes("유사")) && name.includes("수술")) return "다빈치로봇유사암 수술비";
    if (name.includes("다빈치") && name.includes("수술")) return "다빈치로봇암 수술비";
    if (name.includes("로봇") && name.includes("수술")) return "로봇암 수술비";
    // if (name.includes("제외") && name.includes("암") && name.includes("수술")) return "일반암 수술비(유사암제외)";
    if (name.includes("제외") && name.includes("암") && name.includes("수술")) return "일반암 수술비";
    if (name.includes("소액암") && name.includes("수술")) return "유사암 수술비";
    if (name.includes("유사암") && name.includes("수술")) return "유사암 수술비";
    if (name.includes("암") && name.includes("수술")) return "암 수술비";

    if (name.includes("대") && name.includes("혈관") && name.includes("진단")) return displayRawName;
    if (name.includes("대") && name.includes("순환") && name.includes("진단")) return displayRawName;
    if (name.includes("특정") && name.includes("혈관") && name.includes("진단")) return displayRawName;
    if (name.includes("특정") && name.includes("순환") && name.includes("진단")) return displayRawName;
    if (name.includes("순환") && name.includes("진단")) return "순환계질환 진단비";

    if (name.includes("특정") && name.includes("순환") && name.includes("통합") && name.includes("치료")) return displayRawName;
    if (name.includes("특정") && name.includes("순환") && name.includes("주요") && name.includes("치료")) return displayRawName;
    if (name.includes("대") && name.includes("순환") && name.includes("통합") && name.includes("치료")) return displayRawName;
    if (name.includes("대") && name.includes("순환") && name.includes("주요") && name.includes("치료")) return displayRawName;
    if (name.includes("순환") && name.includes("통합") && name.includes("치료")) return "순환계통합 치료비";
    if (name.includes("순환") && name.includes("주요") && name.includes("치료")) return "순환계주요 치료비";
    
    if (name.includes("뇌") && (name.includes("산정") || name.includes("특례"))) return "뇌산정특례대상 진단비";
    if (name.includes("특정") && name.includes("뇌") && name.includes("진단")) return displayRawName;
    if (name.includes("대") && name.includes("뇌") && name.includes("진단")) return displayRawName;
    if (name.includes("뇌혈관") && name.includes("진단")) return "뇌혈관질환 진단비";
    if (name.includes("뇌졸중") && name.includes("진단")) return "뇌졸중 진단비";
    if (name.includes("뇌출혈") && name.includes("진단")) return "뇌출혈 진단비";
    
    if (name.includes("심") && (name.includes("산정") || name.includes("특례"))) return "심장산정특례대상 진단비";
    if (name.includes("특정") && name.includes("심") && name.includes("진단")) return displayRawName;
    if (name.includes("대") && name.includes("심") && name.includes("진단")) return displayRawName;
    if (name.includes("허혈") && name.includes("진단")) return "허혈성심장질환 진단비";
    if (name.includes("급성심근") && name.includes("진단")) return "급성심근경색 진단비";
    if (name.includes("제외") && name.includes("부정맥") && name.includes("진단")) return "부정맥 진단비(기타부정맥제외)";
    if (!name.includes("+") && (name.includes("특정") || (name.includes("기타"))) && name.includes("부정맥") && name.includes("진단")) return "기타부정맥 진단비";
    if (name.includes("부정맥") && name.includes("진단")) return "부정맥 진단비";
    if (name.includes("심부전") && name.includes("진단")) return "심부전 진단비";
    if (name.includes("심근염") && name.includes("진단")) return "심근염 진단비";
    if (name.includes("심") && name.includes("판막") && name.includes("진단")) return "심장판막증 진단비";

    if (name.includes("특정") && name.includes("사망")) return displayRawName;
    if (name.includes("교통") && name.includes("사망")) return displayRawName;
    if (name.includes("암") && name.includes("사망")) return displayRawName;
    if (name.includes("재해") && name.includes("사망")) return "재해사망 진단비";
    if (name.includes("상해") && name.includes("사망")) return "상해사망 진단비";
    if (name.includes("질병") && name.includes("사망")) return "질병사망 진단비";
    
    if (name.includes("입원제외") && name.includes("재해") && name.includes("수술")) return "재해입원 수술비(당일입원제외)";
    if (name.includes("입원포함") && name.includes("재해") && name.includes("수술")) return "재해통원 수술비(당일입원포함)";
    if (name.includes("입원제외") && name.includes("상해") && name.includes("수술")) return "상해입원 수술비(당일입원제외)";
    if (name.includes("입원포함") && name.includes("상해") && name.includes("수술")) return "상해통원 수술비(당일입원포함)";
    if (name.includes("입원제외") && name.includes("질병") && name.includes("수술")) return "질병입원 수술비(당일입원제외)";
    if (name.includes("입원포함") && name.includes("질병") && name.includes("수술")) return "질병통원 수술비(당일입원포함)";
    if (name.includes("질환") && name.includes("수술")) return displayRawName;
    if (name.includes("이식") && name.includes("수술")) return displayRawName;
    if (name.includes("중증") && name.includes("수술")) return displayRawName;
    if (name.includes("손상") && name.includes("수술")) return displayRawName;
    if (name.includes("복원") && name.includes("수술")) return displayRawName;
    if (name.includes("흉터") && name.includes("수술")) return displayRawName;
    if (name.includes("대") && name.includes("수술")) return displayRawName;
    if (name.includes("관련") && name.includes("수술")) return displayRawName;
    if (name.includes("특정") && name.includes("수술")) return displayRawName;
    if (name.includes("중대") && name.includes("수술")) return displayRawName;
    if (name.includes("심한") && name.includes("수술")) return displayRawName;
    if (name.includes("개흉") && name.includes("수술")) return displayRawName;
    if (name.includes("개흉") && name.includes("수술")) return displayRawName;
    if (name.includes("철심") && name.includes("수술")) return "골절철심제거 수술비";
    if (name.includes("골절") && name.includes("수술")) return "골절 수술비";
    if (name.includes("화상") && name.includes("수술")) return "화상 수술비";

    if (name.includes("심뇌혈관")) return displayRawName;
    
    if (name.includes("뇌") && name.includes("통원") && name.includes("치료")) return "뇌혈관통원 치료비";
    if (name.includes("뇌") && name.includes("통합") && name.includes("치료")) return "뇌혈관통합 치료비";
    if (name.includes("뇌") && name.includes("주요") && name.includes("치료")) return "뇌혈관주요 치료비";
    if (name.includes("뇌출") && name.includes("혈전") && name.includes("치료")) return "뇌출혈혈전용해 치료비";
    if (name.includes("뇌졸") && name.includes("혈전") && name.includes("치료")) return "뇌졸중혈전용해 치료비";
    if (name.includes("뇌") && name.includes("혈전") && name.includes("치료")) return "뇌혈관혈전용해 치료비";
    if (name.includes("특정") && name.includes("뇌") && name.includes("수술")) return displayRawName;
    if (name.includes("대") && name.includes("뇌") && name.includes("수술")) return displayRawName;
    if (name.includes("뇌출") && name.includes("수술")) return "뇌출혈 수술비";
    if (name.includes("뇌졸") && name.includes("수술")) return "뇌졸중 수술비";
    if (name.includes("뇌") && name.includes("수술")) return "뇌혈관질환 수술비";
    
    if (name.includes("심") && name.includes("통원") && name.includes("치료")) return "심혈관통원 치료비";
    if (name.includes("심") && name.includes("통합") && name.includes("치료")) return "심혈관통합 치료비";
    if (name.includes("심") && name.includes("주요") && name.includes("치료")) return "심혈관주요 치료비";
    if (name.includes("급성") && name.includes("혈전") && name.includes("치료")) return "급성심근경색혈전용해 치료비";
    if (name.includes("허혈") && name.includes("혈전") && name.includes("치료")) return "허혈성심장질환혈전용해 치료비";
    if (name.includes("심") && name.includes("혈전") && name.includes("치료")) return "심혈관혈전용해 치료비";
    if (name.includes("허혈") && name.includes("심") && name.includes("수술")) return "허혈성심장질환 수술비";
    if (name.includes("특정") && name.includes("심") && name.includes("수술")) return displayRawName;
    if (name.includes("대") && name.includes("심") && name.includes("수술")) return displayRawName;
    if (name.includes("허혈") && name.includes("수술")) return "허혈성심장질환 수술비";
    if (name.includes("심") && name.includes("수술")) return "심혈관질환 수술비";
    
    if (name.includes("1종") && name.includes("재해")) return "재해1종 수술비";
    if (name.includes("2종") && name.includes("재해")) return "재해2종 수술비";
    if (name.includes("3종") && name.includes("재해")) return "재해3종 수술비";
    if (name.includes("4종") && name.includes("재해")) return "재해4종 수술비";
    if (name.includes("5종") && name.includes("재해")) return "재해5종 수술비";
    if (name.includes("6종") && name.includes("재해")) return "재해6종 수술비";
    if (name.includes("7종") && name.includes("재해")) return "재해7종 수술비";
    if (name.includes("8종") && name.includes("재해")) return "재해8종 수술비";

    if (name.includes("1종") && name.includes("상해")) return "상해1종 수술비";
    if (name.includes("2종") && name.includes("상해")) return "상해2종 수술비";
    if (name.includes("3종") && name.includes("상해")) return "상해3종 수술비";
    if (name.includes("4종") && name.includes("상해")) return "상해4종 수술비";
    if (name.includes("5종") && name.includes("상해")) return "상해5종 수술비";
    if (name.includes("6종") && name.includes("상해")) return "상해6종 수술비";
    if (name.includes("7종") && name.includes("상해")) return "상해7종 수술비";
    if (name.includes("8종") && name.includes("상해")) return "상해8종 수술비";

    if (name.includes("1종") && name.includes("질병")) return "질병1종 수술비";
    if (name.includes("2종") && name.includes("질병")) return "질병2종 수술비";
    if (name.includes("3종") && name.includes("질병")) return "질병3종 수술비";
    if (name.includes("4종") && name.includes("질병")) return "질병4종 수술비";
    if (name.includes("5종") && name.includes("질병")) return "질병5종 수술비";
    if (name.includes("6종") && name.includes("질병")) return "질병6종 수술비";
    if (name.includes("7종") && name.includes("질병")) return "질병7종 수술비";
    if (name.includes("8종") && name.includes("질병")) return "질병8종 수술비";

    if (!name.includes("1~8") && !name.includes("1~7") && !name.includes("1~5") && !name.includes("8종") && !name.includes("7종") && name.includes("1종") && name.includes("수술")) return "상해1종 수술비||질병1종 수술비";
    if (!name.includes("1~8") && !name.includes("1~7") && !name.includes("1~5") && !name.includes("8종") && !name.includes("7종") && name.includes("2종") && name.includes("수술")) return "상해2종 수술비||질병2종 수술비";
    if (!name.includes("1~8") && !name.includes("1~7") && !name.includes("1~5") && !name.includes("8종") && !name.includes("7종") && name.includes("3종") && name.includes("수술")) return "상해3종 수술비||질병3종 수술비";
    if (!name.includes("1~8") && !name.includes("1~7") && !name.includes("1~5") && !name.includes("8종") && !name.includes("7종") && name.includes("4종") && name.includes("수술")) return "상해4종 수술비||질병4종 수술비";
    if (!name.includes("1~8") && !name.includes("1~7") && !name.includes("1~5") && !name.includes("8종") && !name.includes("7종") && name.includes("5종") && name.includes("수술")) return "상해5종 수술비||질병5종 수술비";

    if (!name.includes("종") && name.includes("재해") && name.includes("수술")) return "재해 수술비";
    if (!name.includes("종") && name.includes("상해") && name.includes("수술")) return "상해 수술비";
    if (!name.includes("종") && name.includes("질병") && name.includes("수술")) return "질병 수술비";

    if (name.includes("간병") && name.includes("입원")) return displayRawName;
    if (name.includes("특정") && name.includes("입원")) return displayRawName;
    if (name.includes("교통") && name.includes("입원")) return displayRawName;
    if ((name.includes("이상") || name.includes("초과")) && (name.includes("3") || name.includes("4")) && name.includes("재해") && name.includes("입원")) return "재해 입원비(3일이상)";
    if ((name.includes("이상") || name.includes("초과")) && (name.includes("3") || name.includes("4")) && name.includes("상해") && name.includes("입원")) return "상해 입원비(3일이상)";
    if ((name.includes("이상") || name.includes("초과")) && (name.includes("3") || name.includes("4")) && name.includes("질병") && name.includes("입원")) return "질병 입원비(3일이상)";
    if (name.includes("중환자") && name.includes("재해") && name.includes("입원")) return "재해중환자실 입원비";
    if (name.includes("중환자") && name.includes("상해") && name.includes("입원")) return "상해중환자실 입원비";
    if (name.includes("중환자") && name.includes("질병") && name.includes("입원")) return "질병중환자실 입원비";
    if (name.includes("재해") && name.includes("입원")) return "재해 입원비";
    if (name.includes("상해") && name.includes("입원")) return "상해 입원비";
    if (name.includes("질병") && name.includes("입원")) return "질병 입원비";
    
    if (name.includes("대") && name.includes("골절") && name.includes("진단")) return displayRawName;
    if (name.includes("특정") && name.includes("골절") && name.includes("진단")) return displayRawName;
    if (name.includes("골절") && name.includes("진단") && name.includes("제외")) return "골절 진단비(치아파절제외)";
    if (name.includes("골절") && name.includes("진단") && name.includes("포함")) return "골절 진단비(치아파절포함)";
    if (name.includes("골절") && name.includes("진단")) return "골절 진단비";
    if (name.includes("화상") && name.includes("진단")) return "화상 진단비";
    if (name.includes("통합") && name.includes("상해") && name.includes("중증") && name.includes("진단")) return "통합상해 진단비(중증)";
    if (name.includes("통합") && name.includes("상해") && name.includes("중등증") && name.includes("진단")) return "통합상해 진단비(중등증)";
    if (name.includes("통합") && name.includes("상해") && name.includes("진단")) return "통합상해 진단비(경증)";

    if (name.includes("도수정복") && name.includes("치료")) return "도수정복술 치료비";
    if (name.includes("깁스") && name.includes("치료")) return "깁스 치료비";
    if (name.includes("부목") && name.includes("치료")) return "골절부목 치료비";
    if (name.includes("재활") && name.includes("치료")) return "상해재활 치료비";
    
    if (name.includes("응급실")) return "응급실내원비";

    if (name.includes("요양") && name.includes("1~2") && name.includes("진단")) return "장기요양 1~2등급 진단비";
    if (name.includes("요양") && name.includes("1~3") && name.includes("진단")) return "장기요양 1~3등급 진단비";
    if (name.includes("요양") && name.includes("1~4") && name.includes("진단")) return "장기요양 1~4등급 진단비";
    if (name.includes("요양") && name.includes("1~5") && name.includes("진단")) return "장기요양 1~5등급 진단비";
    if (name.includes("요양") && name.includes("1~인지") && name.includes("진단")) return "장기요양 1~인지지원등급 진단비";

    if (name.includes("요양") && name.includes("1~2") && name.includes("재가")) return "장기요양 1~2등급 재가급여";
    if (name.includes("요양") && name.includes("1~3") && name.includes("재가")) return "장기요양 1~3등급 재가급여";
    if (name.includes("요양") && name.includes("1~4") && name.includes("재가")) return "장기요양 1~4등급 재가급여";
    if (name.includes("요양") && name.includes("1~5") && name.includes("재가")) return "장기요양 1~5등급 재가급여";
    if (name.includes("요양") && name.includes("1~인지") && name.includes("재가")) return "장기요양 1~인지지원등급 재가급여";

    if (name.includes("요양") && name.includes("1~2") && name.includes("시설")) return "장기요양 1~2등급 시설급여";
    if (name.includes("요양") && name.includes("1~3") && name.includes("시설")) return "장기요양 1~3등급 시설급여";
    if (name.includes("요양") && name.includes("1~4") && name.includes("시설")) return "장기요양 1~4등급 시설급여";
    if (name.includes("요양") && name.includes("1~5") && name.includes("시설")) return "장기요양 1~5등급 시설급여";
    if (name.includes("요양") && name.includes("1~인지") && name.includes("시설")) return "장기요양 1~인지지원등급 시설급여";
  
      return null; 
    };
  
    let finalName = getMappedName();
  
    if (finalName === null || finalName === displayRawName) {
      return displayRawName;
    }
  
    if (extraTags) {
      if (finalName.includes("||")) {
        finalName = finalName.split("||").map(n => {
          return n.includes(extraTags) ? n : n + extraTags;
        }).join("||");
      } else {
        if (!finalName.includes(extraTags)) {
          finalName += extraTags;
        }
      }
    }
  
    return finalName;
  };



  
  // ============================================================================
// 📊 보장 분석표 데이터 집계 및 필터링 엔진 (Aggregation Engine)
// ============================================================================

export const ALLOWED_COVERAGES = COVERAGE_OPTIONS.map(name => name.replace(/\s+/g, ""));

// 1. 보장 공백 진단용 "카테고리 점수" 계산
export const calculateCoverageScores = (name: string, beforeVal: number, afterVal: number, isBefore: boolean, isAfter: boolean, scores: any) => {
  if (!name.includes("소액") && !name.includes("유사") && !name.includes("고액") && name.includes("암")) {
    if (isBefore) scores.cancer.before += beforeVal;
    if (isAfter) scores.cancer.after += afterVal;
  }
  if (!name.includes("제외") && name.includes("유사암") || name.includes("소액암")) {
    if (isBefore) scores.similarCancer.before += beforeVal;
    if (isAfter) scores.similarCancer.after += afterVal;
  }
  if (name.includes("뇌")) {
    if (isBefore) scores.brain.before += beforeVal;
    if (isAfter) scores.brain.after += afterVal;
  }
  if (name.includes("심장")) {
    if (isBefore) scores.heart.before += beforeVal;
    if (isAfter) scores.heart.after += afterVal;
  }
  if (name.includes("순환")) {
    if (isBefore) scores.circulatory.before += beforeVal;
    if (isAfter) scores.circulatory.after += afterVal;
  }
  if (name.includes("사망")) {
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

// 2 & 3. 불필요한 특약 걸러내기 및 명칭 통일
export const getStandardCoverageInfo = (normalizedName: string) => {
  const matchedIndex = ALLOWED_COVERAGES.findIndex(allowed => normalizedName.includes(allowed));
  if (matchedIndex === -1) return null; // 목록에 없으면 버림

  // 예외 조건 필터링
  if (normalizedName.includes("암주요") && !normalizedName.includes("제외")) return null; 
  if (ALLOWED_COVERAGES[matchedIndex] === "재해수술비" && (normalizedName.includes("대") || normalizedName.includes("특정") || normalizedName.includes("제외") || normalizedName.includes("병원"))) return null;
  if (ALLOWED_COVERAGES[matchedIndex] === "상해수술비" && (normalizedName.includes("대") || normalizedName.includes("특정") || normalizedName.includes("제외") || normalizedName.includes("병원"))) return null;
  if (ALLOWED_COVERAGES[matchedIndex] === "질병수술비" && (normalizedName.includes("대") || normalizedName.includes("특정") || normalizedName.includes("제외") || normalizedName.includes("병원"))) return null;
  if (ALLOWED_COVERAGES[matchedIndex] === "재해입원비" && (normalizedName.includes("대") || normalizedName.includes("특정") || normalizedName.includes("제외") || normalizedName.includes("병원"))) return null;
  if (ALLOWED_COVERAGES[matchedIndex] === "상해입원비" && (normalizedName.includes("대") || normalizedName.includes("특정") || normalizedName.includes("제외") || normalizedName.includes("병원"))) return null;
  if (ALLOWED_COVERAGES[matchedIndex] === "질병입원비" && (normalizedName.includes("대") || normalizedName.includes("특정") || normalizedName.includes("제외") || normalizedName.includes("병원"))) return null;
  if (ALLOWED_COVERAGES[matchedIndex] === "자동차사고부상치료비" && (normalizedName.includes("7급") || normalizedName.includes("4급") || normalizedName.includes("3급") || normalizedName.includes("2급"))) return null;
  if (ALLOWED_COVERAGES[matchedIndex] === "자동차부상치료비" && (normalizedName.includes("7급") || normalizedName.includes("4급") || normalizedName.includes("3급") || normalizedName.includes("2급"))) return null;
  if (ALLOWED_COVERAGES[matchedIndex] === "골절진단비" && (normalizedName.includes("제외") || normalizedName.includes("대"))) return null;

  let standardDisplayName = COVERAGE_OPTIONS[matchedIndex];
  let standardKey = ALLOWED_COVERAGES[matchedIndex];

  // 명칭 통일 (과거 명칭 -> 최신 표준 명칭)
  if (standardDisplayName === "재해사망 진단비") { standardDisplayName = "상해사망 진단비"; standardKey = "상해사망진단비"; }
  else if (standardDisplayName === "재해 후유장해3%↑") { standardDisplayName = "상해 후유장해3%↑"; standardKey = "상해후유장해3%↑"; }
  else if (standardDisplayName === "통합암 진단비") { standardDisplayName = "일반암 진단비"; standardKey = "일반암진단비"; }
  else if (standardDisplayName === "항암약물 치료비" || standardDisplayName === "항암방사선 치료비") { standardDisplayName = "항암약물방사선 치료비"; standardKey = "항암약물방사선치료비"; }
  else if (normalizedName.includes("암주요") && normalizedName.includes("제외")) { standardDisplayName = "암주요 치료비"; standardKey = "암주요치료비"; }
  else if (normalizedName.includes("암통합") && normalizedName.includes("제외")) { standardDisplayName = "암통합 치료비"; standardKey = "암통합치료비"; }
  else if (standardDisplayName === "순환계통합 진단비" || standardDisplayName === "순환계질환 진단비" || standardDisplayName === "순환계 진단비" || standardDisplayName === "순환계질환통합 진단비") { standardDisplayName = "순환계질환통합 진단비"; standardKey = "순환계질환통합진단비"; }
  else if (standardDisplayName === "재해 수술비" || standardDisplayName === "재해수술비") { standardDisplayName = "상해 수술비"; standardKey = "상해수술비"; }
  else if (standardDisplayName === "재해1종 수술비" || standardDisplayName === "재해1종수술비") { standardDisplayName = "상해1종 수술비"; standardKey = "상해1종수술비"; }
  else if (standardDisplayName === "재해2종 수술비" || standardDisplayName === "재해2종수술비") { standardDisplayName = "상해2종 수술비"; standardKey = "상해2종수술비"; }
  else if (standardDisplayName === "재해3종 수술비" || standardDisplayName === "재해3종수술비") { standardDisplayName = "상해3종 수술비"; standardKey = "상해3종수술비"; }
  else if (standardDisplayName === "재해4종 수술비" || standardDisplayName === "재해4종수술비") { standardDisplayName = "상해4종 수술비"; standardKey = "상해4종수술비"; }
  else if (standardDisplayName === "재해5종 수술비" || standardDisplayName === "재해5종수술비") { standardDisplayName = "상해5종 수술비"; standardKey = "상해5종수술비"; }
  else if (standardDisplayName === "재해 입원비" || standardDisplayName === "재해입원비") { standardDisplayName = "상해 입원비"; standardKey = "상해입원비"; }
  else if (standardDisplayName === "자동차사고부상치료비" || standardDisplayName === "자동차사고부상 치료비" || standardDisplayName === "자동차부상치료비" || standardDisplayName === "자동차부상 치료비") { standardDisplayName = "자동차부상 치료비"; standardKey = "자동차부상치료비"; }
  else if (standardDisplayName === "자동차사고벌금" || standardDisplayName === "자동차사고 벌금") { standardDisplayName = "자동차사고 벌금"; standardKey = "자동차사고벌금"; }
  else if (standardDisplayName === "교통사고처리지원금" || standardDisplayName === "교통사고 처리지원금") { standardDisplayName = "교통사고 처리지원금"; standardKey = "교통사고처리지원금"; }
  else if (standardDisplayName === "골절 진단비" || standardDisplayName === "골절진단비") { standardDisplayName = "골절 진단비"; standardKey = "골절진단비"; }

  return { standardDisplayName, standardKey };
};

// 4. 일반사망 특수 처리 및 맵(Map) 금액 합산
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