"use client";

import { useEffect } from "react";
import { MessageCircle, Gift, FileText, ShieldCheck } from "lucide-react";

export default function KakaoMultiSender({ profileName }: { profileName: string }) {
  
  // ⭐️ 1. 컴포넌트가 켜질 때 카카오 시스템 초기화
  useEffect(() => {
    const initKakao = () => {
      const globalWindow = window as any;
      if (globalWindow.Kakao && !globalWindow.Kakao.isInitialized()) {
        // 🚨 주의: 아래 문자열에 카카오 디벨로퍼스에서 발급받은 'JavaScript 키'를 넣으세요!
        globalWindow.Kakao.init("ccb428fb9e389bec1c8579c12828fd97"); 
      }
    };
    
    // 스크립트가 로드될 시간을 약간 주기 위해 setTimeout 사용
    const timer = setTimeout(initKakao, 1000);
    return () => clearTimeout(timer);
  }, []);

  // ⭐️ 2. 카카오톡 전송 실행 함수
  const sendKakaoMessage = (type: string) => {
    const globalWindow = window as any;
    if (!globalWindow.Kakao || !globalWindow.Kakao.isInitialized()) {
      return alert("카카오톡 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }

    let msgTitle = "";
    let msgDesc = "";
    let msgImage = "";
    let btnText = "확인하기";
    // 버튼을 눌렀을 때 고객이 이동할 웹사이트 주소 (명함, 블로그, 홈 등)
    let linkUrl = window.location.origin; 

    // 상황별 템플릿 설정
    switch (type) {
      case "greeting":
        msgTitle = `[감사 인사] ${profileName} 올림`;
        msgDesc = "항상 믿고 맡겨주셔서 감사합니다. 변함없는 마음으로 곁에서 든든한 금융 파트너가 되겠습니다.";
        msgImage = "https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&q=80&w=800"; // 예쁜 풍경 이미지
        btnText = "모바일 명함 보기";
        break;
      case "claim":
        msgTitle = `[청구 완료 안내] ${profileName} 설계사`;
        msgDesc = "요청하신 보험금 청구 접수가 완료되었습니다. 추가 문의사항이 있으시면 언제든 연락 부탁드립니다.";
        msgImage = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"; // 서류 이미지
        btnText = "담당자에게 연락하기";
        break;
      case "review":
        msgTitle = `[보장 분석 안내] ${profileName} 설계사`;
        msgDesc = "고객님께 딱 맞는 맞춤형 보장 분석이 준비되었습니다. 불필요한 보험료는 줄이고 보장은 든든하게 채워보세요!";
        msgImage = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"; // 분석 차트 이미지
        btnText = "무료 보장분석 받기";
        break;
    }

    // ⭐️ 카카오톡 공유 API 호출 (여기서 카톡 앱이 열림)
    globalWindow.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: msgTitle,
        description: msgDesc,
        imageUrl: msgImage,
        link: { mobileWebUrl: linkUrl, webUrl: linkUrl },
      },
      buttons: [
        { title: btnText, link: { mobileWebUrl: linkUrl, webUrl: linkUrl } },
      ],
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
          <MessageCircle className="w-5 h-5 text-yellow-400 fill-yellow-400" /> 
          고객 단체 카톡 발송 (무료)
        </h3>
        <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">※ 1회 최대 10명 선택</span>
      </div>
      
      <p className="text-xs text-gray-500 mb-4 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
        원하시는 템플릿을 누른 뒤, 카카오톡 앱에서 보낼 고객을 <b>최대 10명씩</b> 체크하세요.<br/>
        (예: 40명에게 보내려면 버튼 누르고 10명 체크하는 과정을 4번 반복하시면 됩니다.)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => sendKakaoMessage("greeting")} className="flex flex-col items-center justify-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer group">
          <Gift className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-amber-900">감사/안부 인사</span>
        </button>
        
        <button onClick={() => sendKakaoMessage("claim")} className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer group">
          <FileText className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-emerald-900">청구 접수 완료</span>
        </button>

        <button onClick={() => sendKakaoMessage("review")} className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer group">
          <ShieldCheck className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-blue-900">보장 분석 제안</span>
        </button>
      </div>
    </div>
  );
}