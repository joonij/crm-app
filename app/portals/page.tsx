"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import CompanyPortalModal, { CompanyData } from "@/components/CompanyPortalModal";

const COMPANIES: CompanyData[] = [
  // ==========================================
  // [1] 손해보험사 (14개)
  // ==========================================
  { id: "kb_sonhae", name: "KB손해보험", type: "손해보험", logoUrl: "/logos/kb.png", phones: { customer: "1544-0114", inbound: "1544-0019", helpdesk: "1544-8119", fax: "0505-136-6500" }, cardInfo: { inquiry: "초회, 계속분 가능", method: "계속분 : 설계사 수납", target: "계약자, 배우자, 직계가족", partners: "KB, 롯데, BC, 삼성, 신한, 우리, 농협, 씨티, 현대, 하나" } },
  { id: "heungkuk_fire", name: "흥국화재", type: "손해보험", logoUrl: "/logos/heungkuk_fire.png", phones: { customer: "1688-1688", inbound: "-", helpdesk: "-", fax: "0505-135-3344" }, cardInfo: { inquiry: "가능", method: "고객센터 수납", target: "계약자 본인", partners: "전 카드사 가능" } },
  { id: "samsung_fire", name: "삼성화재", type: "손해보험", logoUrl: "/logos/samsung_fire.png", phones: { customer: "1588-5114", inbound: "-", helpdesk: "-", fax: "0505-116-1600" }, cardInfo: { inquiry: "가능", method: "설계사 및 고객센터", target: "계약자", partners: "삼성, KB, 신한" } },
  { id: "meritz", name: "메리츠화재", type: "손해보험", logoUrl: "/logos/meritz.png", phones: { customer: "1566-7711", inbound: "-", helpdesk: "-", fax: "0505-021-3400" }, cardInfo: { inquiry: "가능", method: "설계사 수납", target: "계약자 및 가족", partners: "전 카드사" } },
  { id: "db_sonhae", name: "DB손해보험", type: "손해보험", logoUrl: "/logos/db_sonhae.png", phones: { customer: "1588-0100", inbound: "-", helpdesk: "-", fax: "0505-181-4861" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "hyundai_marine", name: "현대해상", type: "손해보험", logoUrl: "/logos/hyundai_marine.png", phones: { customer: "1588-5656", inbound: "-", helpdesk: "-", fax: "0507-774-6060" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "lotte_sonhae", name: "롯데손해보험", type: "손해보험", logoUrl: "/logos/lotte_sonhae.png", phones: { customer: "1588-3344", inbound: "-", helpdesk: "-", fax: "0505-134-0077" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "hanwha_sonhae", name: "한화손해보험", type: "손해보험", logoUrl: "/logos/hanwha_sonhae.png", phones: { customer: "1566-8000", inbound: "-", helpdesk: "-", fax: "0505-154-2062" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "mg_sonhae", name: "MG손해보험", type: "손해보험", logoUrl: "/logos/mg_sonhae.png", phones: { customer: "1588-5959", inbound: "-", helpdesk: "-", fax: "0505-081-1983" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "nh_sonhae", name: "NH농협손해보험", type: "손해보험", logoUrl: "/logos/nh_sonhae.png", phones: { customer: "1644-9000", inbound: "-", helpdesk: "-", fax: "0505-136-4100" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "aig_sonhae", name: "AIG손해보험", type: "손해보험", logoUrl: "/logos/aig_sonhae.png", phones: { customer: "1544-2792", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "hana_sonhae", name: "하나손해보험", type: "손해보험", logoUrl: "/logos/hana_sonhae.png", phones: { customer: "1566-3000", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "lina_sonhae", name: "라이나손해보험", type: "손해보험", logoUrl: "/logos/lina_sonhae.png", phones: { customer: "1566-5800", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "axa_sonhae", name: "AXA손해보험", type: "손해보험", logoUrl: "/logos/axa_sonhae.png", phones: { customer: "1566-1566", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },

  // ==========================================
  // [2] 생명보험사 (20개)
  // ==========================================
  { id: "samsung_life", name: "삼성생명", type: "생명보험", logoUrl: "/logos/samsung_life.png", phones: { customer: "1588-3114", inbound: "-", helpdesk: "-", fax: "0505-116-2200" }, cardInfo: { inquiry: "초회만 가능", method: "고객센터", target: "계약자", partners: "삼성카드 전용" } },
  { id: "hanwha_life", name: "한화생명", type: "생명보험", logoUrl: "/logos/hanwha_life.png", phones: { customer: "1588-6363", inbound: "-", helpdesk: "-", fax: "0505-154-2062" }, cardInfo: { inquiry: "가능", method: "설계사 수납", target: "계약자 본인", partners: "한화, 국민, 신한" } },
  { id: "kyobo_life", name: "교보생명", type: "생명보험", logoUrl: "/logos/kyobo_life.png", phones: { customer: "1588-1001", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "metlife", name: "메트라이프", type: "생명보험", logoUrl: "/logos/metlife.png", phones: { customer: "1588-9600", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "mirae_asset", name: "미래에셋생명", type: "생명보험", logoUrl: "/logos/mirae_asset.png", phones: { customer: "1588-0220", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "db_life", name: "DB생명", type: "생명보험", logoUrl: "/logos/db_life.png", phones: { customer: "1588-3131", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "heungkuk_life", name: "흥국생명", type: "생명보험", logoUrl: "/logos/heungkuk_life.png", phones: { customer: "1588-2288", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "nh_life", name: "NH농협생명", type: "생명보험", logoUrl: "/logos/nh_life.png", phones: { customer: "1544-4000", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "hana_life", name: "하나생명", type: "생명보험", logoUrl: "/logos/hana_life.png", phones: { customer: "1577-1112", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "kb_life", name: "KB라이프", type: "생명보험", logoUrl: "/logos/kb_life.png", phones: { customer: "1588-3374", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "shinhan_life", name: "신한라이프", type: "생명보험", logoUrl: "/logos/shinhan_life.png", phones: { customer: "1588-5580", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "im_life", name: "iM라이프", type: "생명보험", logoUrl: "/logos/im_life.png", phones: { customer: "1588-4770", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "kdb_life", name: "KDB생명", type: "생명보험", logoUrl: "/logos/kdb_life.png", phones: { customer: "1588-4040", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "bnp_life", name: "BNP파리바카디프", type: "생명보험", logoUrl: "/logos/bnp_life.png", phones: { customer: "1688-1118", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "lina_life", name: "라이나생명", type: "생명보험", logoUrl: "/logos/lina_life.png", phones: { customer: "1588-0058", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "dongyang_life", name: "동양생명", type: "생명보험", logoUrl: "/logos/dongyang_life.png", phones: { customer: "1577-1004", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "abl_life", name: "ABL생명", type: "생명보험", logoUrl: "/logos/abl_life.png", phones: { customer: "1588-6500", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "fubon_life", name: "푸본현대생명", type: "생명보험", logoUrl: "/logos/fubon_life.png", phones: { customer: "1577-3311", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "aia_life", name: "AIA생명", type: "생명보험", logoUrl: "/logos/aia_life.png", phones: { customer: "1588-9898", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "chubb_life", name: "처브생명", type: "생명보험", logoUrl: "/logos/chubb_life.png", phones: { customer: "1566-5005", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },

  // ==========================================
  // [3] 기타보험/공제 (6개)
  // ==========================================
  { id: "ibk_pension", name: "IBK연금보험", type: "기타", logoUrl: "/logos/ibk_pension.png", phones: { customer: "1577-4117", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "post_office", name: "우체국보험", type: "기타", logoUrl: "/logos/post_office.png", phones: { customer: "1599-0100", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "teachers_credit", name: "교직원공제회", type: "기타", logoUrl: "/logos/teachers_credit.png", phones: { customer: "1577-3400", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "mg_saemaul", name: "MG새마을금고", type: "기타", logoUrl: "/logos/mg_saemaul.png", phones: { customer: "1599-9000", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "suhyup", name: "수협", type: "기타", logoUrl: "/logos/suhyup.png", phones: { customer: "1588-1515", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } },
  { id: "shinhyup", name: "신협", type: "기타", logoUrl: "/logos/shinhyup.png", phones: { customer: "1566-6000", inbound: "-", helpdesk: "-", fax: "-" }, cardInfo: { inquiry: "확인필요", method: "-", target: "-", partners: "-" } }
];

export default function PortalsPage() {
  // ⭐️ 핵심 변경점: null 대신 COMPANIES 배열에서 ABL생명을 찾아 기본값으로 지정합니다.
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    COMPANIES.find(c => c.name === "ABL생명") || null
  );

  const nonLifeCompanies = COMPANIES.filter(c => c.type === "손해보험");
  const lifeCompanies = COMPANIES.filter(c => c.type === "생명보험");
  const otherCompanies = COMPANIES.filter(c => c.type === "기타");

  const renderCompanyCard = (company: CompanyData) => {
    const isSelected = selectedCompany?.id === company.id;

    return (
      <div 
        key={company.id}
        onClick={() => setSelectedCompany(company)}
        className={`bg-white border rounded-[24px] transition-all duration-300 flex flex-col items-center justify-center p-5 aspect-[5/4] cursor-pointer group ${
          isSelected 
            ? "border-blue-500 ring-2 ring-blue-100 shadow-md bg-blue-50/10 scale-[1.02]" 
            : "border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1"
        }`}
      >
        <div className="w-14 h-14 bg-white rounded-2xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={`${company.name} 로고`} className="w-full h-full object-contain p-1" />
          ) : (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-2xl">
              <span className={`text-lg font-black ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>{company.name.substring(0, 1)}</span>
            </div>
          )}
        </div>
        <h4 className={`font-bold text-[13px] text-center tracking-tight ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{company.name}</h4>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
      
      {/* 👈 좌측: 리스트 영역 */}
      <div className="flex-1 w-full min-w-0 space-y-10">
        <div className="mb-2">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ExternalLink className="w-7 h-7 text-blue-600" /> 전산망 및 업무 지원
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            각 보험사의 전산망 접속 및 고객센터, 팩스번호, 결제 정보를 한곳에서 확인하세요.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-black text-slate-800 mb-4 ml-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 손해보험사
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {nonLifeCompanies.map(renderCompanyCard)}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-800 mb-4 ml-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 생명보험사
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {lifeCompanies.map(renderCompanyCard)}
          </div>
        </section>

        {otherCompanies.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-slate-800 mb-4 ml-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 기타 보험 및 공제
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
              {otherCompanies.map(renderCompanyCard)}
            </div>
          </section>
        )}
      </div>

      {/* 👉 우측: 실시간 분할 패널 영역 */}
      {selectedCompany && (
        <div className="w-[360px] xl:w-[400px] shrink-0 sticky top-6 h-[calc(100vh-3rem)] z-40 animate-in fade-in slide-in-from-right-8 duration-300 hidden lg:block">
          <CompanyPortalModal 
            isOpen={!!selectedCompany} 
            onClose={() => setSelectedCompany(null)} 
            company={selectedCompany} 
          />
        </div>
      )}

      {/* 📱 모바일 환경에서는 화면을 덮는 모달로 작동 */}
      <div className="lg:hidden">
        <CompanyPortalModal 
          isOpen={!!selectedCompany} 
          onClose={() => setSelectedCompany(null)} 
          company={selectedCompany} 
        />
      </div>

    </div>
  );
}