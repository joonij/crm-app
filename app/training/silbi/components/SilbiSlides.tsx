import { ShieldAlert, TrendingDown, FileSearch, BriefcaseMedical, Home, Globe, MessageSquare } from "lucide-react";
  
  export function SlideIntro() {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-gray-100">
          <ShieldAlert className="w-96 h-96" />
        </div>
        <div className="px-8 py-3 bg-blue-50 text-blue-700 rounded-full font-bold text-xl tracking-widest z-10">
          사내 마스터 교육 과정 (바른금융파트너스)
        </div>
        <h1 className="text-7xl font-black text-gray-900 leading-tight mb-8 z-10 tracking-tight">
        실손의료비 교육<br />
          <span className="text-blue-600">실손의료비보험 미래 전략</span>
        </h1>
        <p className="text-3xl text-gray-500 mt-6 font-medium z-10">실손보험 변천사와 포트폴리오 리빌딩</p>
      </div>
    );
  }
  
  export function SlideCh1() {
    return (
        <div className="h-full flex flex-col gap-4 py-2 overflow-hidden">
          <p className="text-gray-500 text-lg font-bold shrink-0">
            신입 FC 필드 배치 즉시 고객 대면 상담용 공인 팩트 시트 <span className="text-blue-600">(4세대 규칙 정정 반영 완료)</span>
          </p>
    
          <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white flex flex-col">
            <table className="w-full text-center border-collapse flex-1 h-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-4 border-b border-r border-gray-700 w-[15%]">구분</th>
                  <th className="p-4 border-b border-r border-gray-700">1세대 (구실손)<br/><span className="inline-block mt-2 bg-gray-700 text-white text-[11px] px-2 py-1 rounded">~ 2009.09</span></th>
                  <th className="p-4 border-b border-r border-gray-700">2세대 (표준화)<br/><span className="inline-block mt-2 bg-teal-600 text-white text-[11px] px-2 py-1 rounded">2009.10 ~ 2017.03</span></th>
                  <th className="p-4 border-b border-r border-gray-700">3세대 (착한실손)<br/><span className="inline-block mt-2 bg-amber-600 text-white text-[11px] px-2 py-1 rounded">2017.04 ~ 2021.06</span></th>
                  <th className="p-4 border-b border-r border-gray-700">4세대 실손<br/><span className="inline-block mt-2 bg-red-600 text-white text-[11px] px-2 py-1 rounded">2021.07 ~ 2026.04</span></th>
                  <th className="p-4 border-b bg-blue-600 text-white">5세대 실손 (최신)<br/><span className="inline-block mt-2 bg-indigo-600 text-white text-[11px] px-2 py-1 rounded">2026.05 ~ 현재</span></th>
                </tr>
              </thead>
              <tbody className="text-base text-gray-700">
                <tr className="border-b border-gray-200">
                  <td className="p-3 bg-gray-100 font-bold text-left pl-6 border-r border-gray-200">자기부담금</td>
                  <td className="p-3 border-r border-gray-200 font-black text-blue-600">0% (공짜 치료 보장)</td>
                  <td className="p-3 border-r border-gray-200">급여/비급여 10% ~ 20%</td>
                  <td className="p-3 border-r border-gray-200">급여 10~20% / 비급여 20%</td>
                  <td className="p-3 border-r border-gray-200">급여 20% / 비급여 30%</td>
                  <td className="p-3 bg-blue-50/50 font-black text-blue-700">급여 20~30% / 비중증 비급여 50%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3 bg-gray-100 font-bold text-left pl-6 border-r border-gray-200">보장 한도/구조</td>
                  <td className="p-3 border-r border-gray-200">제한 없이 일괄 보장</td>
                  <td className="p-3 border-r border-gray-200">입원 5천만 / 통원 30만</td>
                  <td className="p-3 border-r border-gray-200">3대 비급여 특약 분리</td>
                  <td className="p-3 border-r border-gray-200">비급여 청구액 연동 할증</td>
                  <td className="p-3 bg-blue-50/50 font-black text-blue-700">도수·주사 제외 / 중증 상한 500만 신설</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3 bg-gray-100 font-bold text-left pl-6 border-r border-gray-200">갱신 / 재가입</td>
                  <td className="p-3 border-r border-gray-200">3/5년 갱신 / 재가입 없음</td>
                  <td className="p-3 border-r border-gray-200">1~3년 갱신 / 15년 재가입</td>
                  <td className="p-3 border-r border-gray-200">1년 갱신 / 15년 재가입</td>
                  <td className="p-3 border-r border-gray-200 font-black text-red-600">1년 갱신 / 5년 재가입</td>
                  <td className="p-3 bg-blue-50/50 font-black text-blue-700">1년 갱신 / 5년 재가입 유지</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3 bg-gray-100 font-bold text-left pl-6 border-r border-gray-200">보험료 수준</td>
                  <td className="p-3 border-r border-gray-200 font-black text-red-600">최고치 (갱신 폭탄)</td>
                  <td className="p-3 border-r border-gray-200">높음 (연대 인상)</td>
                  <td className="p-3 border-r border-gray-200">보통 (-35% 감소)</td>
                  <td className="p-3 border-r border-gray-200">낮음 (-70% 감소)</td>
                  <td className="p-3 bg-blue-50/50 font-black text-blue-600">최저가 수준 (-80% 절감)</td>
                </tr>
                <tr>
                  <td className="p-3 bg-gray-100 font-bold text-left pl-6 border-r border-gray-200">필드 셀링 포인트</td>
                  <td className="p-3 border-r border-gray-200 font-bold text-red-600">노후 유지 원천 불가</td>
                  <td className="p-3 border-r border-gray-200 font-bold text-gray-700">과잉 이용 연대 수렁</td>
                  <td className="p-3 border-r border-gray-200 font-bold text-gray-700">의료 남용 통제 과도기</td>
                  <td className="p-3 border-r border-gray-200 font-bold text-gray-700">개인 할증 리스크 개방</td>
                  <td className="p-3 bg-blue-100/50 font-black text-blue-700">최소 안전망 (정액 사보험 연계 필연)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    );
  }
  
  export function SlideCh2() {
    return (
        <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
          <p className="text-gray-500 text-lg font-bold shrink-0">
            국민건강보험의 빈틈을 메우려 탄생했으나 <strong className="text-red-500">'밑 빠진 독'</strong>이 된 근본 원인
          </p>
    
          <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
            <div className="bg-white border-l-[6px] border-gray-800 rounded-2xl p-8 flex flex-col shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3">실손의료보험의 한계</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                1999년 비급여 리스크 방어를 위해 탄생한 실손보험은 '자기부담금 0원'이라는 과당 경쟁으로 인해 가입자의 도덕적 해이와 병원의 과잉 진료(의료 쇼핑)를 통제하지 못하게 되었습니다. 그 결과 선량한 가입자들까지 엄청난 갱신 폭탄을 맞게 되었습니다.
              </p>
            </div>
            <div className="bg-white border-l-[6px] border-red-500 rounded-2xl p-8 flex flex-col shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3">의존도 하락의 실체</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                금융당국이 개입하여 실손보험 제도를 대대적으로 개편할 수밖에 없었던 수치적 명분이 존재합니다. 실손보험만 믿고 노후를 준비하는 것은 수학적으로 불가능하다는 것이 공식 문서로 증명되었습니다.
              </p>
            </div>
          </div>
    
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative mt-4 shrink-0 shadow-sm">
            <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm">
              📌 금융위원회 공식 보도자료/Q&A
            </div>
            <div className="mt-2 text-blue-900 font-semibold text-base leading-relaxed">
              "지속적인 실손보험금 증가: '18년 8.4조원 → <strong className="text-red-600">'24년 15.2조원 (6년간 81% 증가)</strong>"<br />
              "가파른 보험료 상승: <strong className="text-red-600">25년 2세대 보험료는 13년 대비 약 4배 수준</strong> 폭등"<br />
              <span className="text-sm text-gray-500 font-normal mt-3 block">- 금융위원회, 중증질환 보장관련 보도자료 (26.05.04) 2p 발췌</span>
            </div>
          </div>
        </div>
    );
  }
  
  export function SlideCh3() {
    return (
      <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
        <p className="text-gray-500 text-lg font-bold shrink-0">
          "실비 있으면 다 되는 거 아니야?" 고객의 착각을 깨부수는 공식 약관 팩트
        </p>
  
        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
          <div className="bg-white border-l-[6px] border-gray-800 rounded-2xl p-8 flex flex-col shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3 flex items-center gap-2">
              <FileSearch className="w-6 h-6 text-gray-500" /> 실비가 거절하는 면책 영역
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              예방 목적의 접종, 미용 목적의 피부과 시술, 치료 효능이 입증되지 않은 신데렐라/마늘 주사 등 비급여 영양제는 전액 실비 청구에서 면책(거절) 당합니다. 자잘한 비급여는 고객이 온전히 부담해야 하는 시대로 넘어왔습니다.
            </p>
          </div>
          <div className="bg-white border-l-[6px] border-blue-500 rounded-2xl p-8 flex flex-col shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-blue-500" /> 과잉 진료의 종말
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              도수·체외충격파·증식치료 등 근골격계 물리치료와 비급여 주사제는 비중증 환자를 대상으로 한 과잉진료의 대표 항목으로, 5세대 실손 특약2 보장대상에서 완전히 제외 및 제한되었습니다.
            </p>
          </div>
        </div>
  
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative mt-4 shrink-0 shadow-sm">
          <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm">
            📌 금융위원회 공식 보도자료/Q&A
          </div>
          <div className="mt-2 text-blue-900 font-semibold text-base leading-relaxed">
            "보건당국에서 <strong className="text-red-600">도수치료의 관리급여화를 추진...</strong> 관리급여로 지정시 건강보험만 적용되어 <strong className="text-red-600">95% 본인부담률이 적용</strong>"<br />
            "도수치료 등 근골격계 치료는 과잉진료 우려가 큰 대표적인 비급여 항목으로서, 보험금 누수의 큰 원인"<br />
            <span className="text-sm text-gray-500 font-normal mt-3 block">- 금융위원회, 5세대 실손보험 출시관련 Q&A 2p, 4p 발췌</span>
          </div>
        </div>
      </div>
    );
  }
  
  export function SlideCh4() {
    return (
      <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
        <p className="text-gray-500 text-lg font-bold shrink-0">
          신포괄수가제 개편과 암 비급여 치료, 그리고 1·2세대 맹신에 대한 경고
        </p>
  
        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
          <div className="bg-white border-l-[6px] border-red-500 rounded-2xl p-8 flex flex-col shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3 flex items-center gap-2">
              <BriefcaseMedical className="w-6 h-6 text-red-500" /> 신포괄수가제(DRG)와 비급여 항암제
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              포괄 보상 제도의 확대로 수천만 원이 깨지는 표적/면역 항암제 등 최신 암 치료가 실비 보상 범위를 이탈하고 있습니다. 치료비 통장 잔고가 없으면 최신 치료 기회 자체가 박탈됩니다. 또한 장기생존 시대의 핵심 리스크인 '간병비/장기요양비'는 애초에 실비 100% 면책 영역입니다. 정액 진단비 방화벽 구축은 필수입니다.
            </p>
          </div>
          <div className="bg-white border-l-[6px] border-gray-800 rounded-2xl p-8 flex flex-col shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-gray-500" /> 구실손(1·2세대)은 절대 무적이 아니다
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              과거의 넓은 보장이 현재의 의료 환경과 나의 노후 소득 수준에 맞지 않는다면, 그것은 나를 지켜주는 방패가 아니라 내 목을 조르는 갱신 폭탄의 족쇄일 뿐입니다. 국가 역시 이를 명확히 경고하고 있습니다.
            </p>
          </div>
        </div>
  
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative mt-4 shrink-0 shadow-sm">
          <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm">
            📌 금융위원회 공식 보도자료/Q&A
          </div>
          <div className="mt-2 text-blue-900 font-semibold text-base leading-relaxed">
            "보장이 넓은 1·2세대 등 기존 실손보험상품은... <strong className="text-red-600">일반적인 소비자에게 무조건 유리하다고 보기는 어려움.</strong> 과잉 의료이용을 유발하여 보험료 인상의 큰 원인"<br />
            <span className="text-sm text-gray-500 font-normal mt-3 block">- 금융위원회, 5세대 실손보험 출시관련 Q&A 3p 발췌</span>
          </div>
        </div>
      </div>
    );
  }
  
  export function SlideCh5() {
    return (
      <div className="h-full flex flex-col justify-center gap-8 py-2 overflow-hidden">
        <p className="text-gray-600 text-center text-xl font-bold shrink-0">
          1~4세대 무조건적 해지가 아닌, 부당한 월세에서 '내 집 마련'으로의 자연스러운 유도
        </p>
  
        <div className="bg-gray-900 text-white p-10 rounded-[2rem] shadow-2xl flex flex-col gap-6 relative overflow-hidden transform scale-[1.02]">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Home className="w-64 h-64 text-blue-400" />
          </div>
          
          <h3 className="text-blue-400 text-3xl font-black flex items-center gap-3 z-10 border-b border-gray-700 pb-5">
            🏠 월세 계약(구실손)을 끝내고 자가 매매(5세대+정액)로 갈아타는 흐름
          </h3>
          
          <div className="z-10 space-y-6 text-xl text-gray-300 leading-relaxed font-medium">
            <p>
              구세대 실비를 쥐고 매달 수십만 원씩 내는 것은, 집주인(보험사)이 언제든 월세를 무자비하게 올릴 수 있는 불안정한 전월세 살이와 같습니다. 소득이 단절되는 노후에는 월 30~40만 원을 초과하는 갱신 폭탄을 이기지 못하고 계약을 강제 해지당하게 됨을 안내해야 합니다.
            </p>
            <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700">
              <p>
                5세대 실손으로 전환하는 것은 월세를 최소한의 관리비(월 2~3만 원) 수준으로 낮추는 작업입니다. 그리고 그 아낀 돈을 고스란히 저축하여 나만의 확실한 자산인 <strong className="text-white bg-blue-600/50 px-2 py-1 rounded">'정액 담보(진단비/수술비)'를 분양받아 내 집 마련</strong>을 시켜주는 논리입니다. 5세대 전환은 강제가 아니라, 고객의 고정 지출을 진짜 자산으로 이전시키는 지극히 자연스럽고 현명한 재테크 흐름입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export function SlideCh6() {
    return (
      <div className="h-full flex flex-col gap-6 py-2 overflow-hidden">
        <p className="text-gray-500 text-lg font-bold shrink-0">
          해외 선진국의 사보험 환경과 고령층을 위한 최소한의 방어선 가이드
        </p>
  
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white flex flex-col">
          <table className="w-full text-left border-collapse flex-1 h-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-5 border-b border-gray-700 text-center w-[20%] text-lg">대분류 영역</th>
                <th className="p-5 border-b border-gray-700 text-center w-[40%] text-lg">해외 선진국의 의료보장 및 사보험 체계 실체</th>
                <th className="p-5 border-b border-gray-700 text-center w-[40%] text-lg">노후/간편 실손의 명확한 가이드라인 (개념 요약)</th>
              </tr>
            </thead>
            <tbody className="text-lg text-gray-700">
              <tr className="border-b border-gray-200">
                <td className="p-6 bg-gray-100 font-black text-center border-r border-gray-200 flex flex-col items-center justify-center h-full gap-2">
                  <Globe className="w-8 h-8 text-blue-600"/>
                  글로벌 해외 사례<br/>(미국 vs 일본)
                </td>
                <td className="p-6 border-r border-gray-200 leading-relaxed">
                  <ul className="space-y-4">
                    <li>• <strong>🇺🇸 미국 (Medigap):</strong> 공적 메디케어의 한계를 메우기 위해 민간 사보험 보충형인 '메디갭' 결합이 필수. 사보험 없이는 치료 즉시 파산.</li>
                    <li>• <strong>🇯🇵 일본 (고액요양비):</strong> 국가가 월 부담 상한선을 통제하므로 실비 대신 간병/장기요양 정액 보험 시장이 세계 최고 수준으로 발달.</li>
                  </ul>
                </td>
                <td className="p-6 bg-blue-50/50 font-bold text-blue-900 leading-relaxed">
                  선진국일수록 공적 제도의 축소를 민간 정액 사보험의 확대로 방어하고 있습니다. 대한민국 역시 동일한 진화 궤도에 진입했습니다.
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-6 bg-gray-100 font-black text-center border-r border-gray-200 flex flex-col items-center justify-center h-full gap-2">
                  <BriefcaseMedical className="w-8 h-8 text-blue-600"/>
                  노후 / 간편 실손<br/>기준점 분해
                </td>
                <td className="p-6 border-r border-gray-200 leading-relaxed font-medium">
                  일반 실손 가입 연령(만 60~65세)을 초과한 고령자나 유병자를 위해 만 50세~최대 80세까지 문턱 개방.
                </td>
                <td className="p-6 leading-relaxed font-medium">
                  일반 5세대 실비와 달리 통원 한도가 회당 최대 100만 원으로 거대 질병 방어에 유리하나, <strong className="text-red-600">입원 건당 30만원 / 통원 건당 3만원의 고액 공제금액이 선적용</strong>되어 자잘한 소액 의료 쇼핑을 차단함.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  export function SlideCh7() {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl p-12 text-gray-900 relative overflow-hidden border border-gray-200 shadow-sm">
        <h2 className="text-gray-900 text-4xl font-black text-center mb-8 flex items-center gap-3">
          <MessageSquare className="w-10 h-10 text-blue-600" /> 바른금융파트너스 표준 록인(Lock-in) 클로징 RP
        </h2>
        
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-4xl text-gray-100 text-2xl leading-relaxed shadow-lg mb-8 font-medium">
          "고객님, 언제 쫓겨날지 모르는 15만 원짜리 월세(구실비) 살이는 이제 끝내셔야 합니다. 관리비 수준인 3만 원(5세대 실비)으로 갈아타시고, 아낀 12만 원으로 신포괄수가제 암 치료비와 간병 공백을 메울 <strong className="text-blue-400">'나만의 자가 주택(정액 진단비/수술비)'</strong>을 분양받으십시오.<br/><br/>
          고객님, 5세대로 실비를 바꾸면 보험사만 좋은 일 시키는 거 아니냐고요? 절대 아닙니다. 이것은 국가 금융위원회가 보장 축소만큼 보험료를 대폭 인하하여, 국민들이 아낀 돈으로 진짜 노후 위험에 대비하도록 의도한 완벽한 정책 방향입니다."
        </div>
  
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 relative w-full max-w-4xl shadow-md">
          <div className="absolute -top-4 left-6 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm">
            📌 금융위원회 공식 보도자료/Q&A
          </div>
          <div className="mt-2 text-blue-900 font-semibold text-base leading-relaxed">
            Q. 보장범위 축소 등으로 가입자 부담이 늘어나는 것 아닌지? <br/>
            A. "<strong className="text-red-600">상대적으로 낮은 보험료로 보장이 제공되므로 전반적으로는 소비자에게 긍정적인 효과를 제공</strong>할 것으로 기대"<br/><br/>
            Q. 5세대 실손 보장범위 축소 등은 보험사 이익을 위한 것 아닌지? <br/>
            A. "보험금 지급이 줄어들면 보험료도 인하되므로 보장 합리화로 인해 <strong className="text-red-600">보험사 이익이 늘어나지 않음</strong>"<br/>
            <span className="text-sm text-gray-500 font-normal mt-3 block">- 금융위원회, 5세대 실손보험 출시관련 Q&A 2p, 3p 발췌</span>
          </div>
        </div>
      </div>
    );
  }