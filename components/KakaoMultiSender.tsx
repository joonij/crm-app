// components/KakaoMultiSender.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, Gift, FileText, ShieldCheck, PenTool, Image as ImageIcon, Loader2, Send, X, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function KakaoMultiSender({ profileName }: { profileName: string }) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customLink, setCustomLink] = useState(""); 
  const [customImageUrl, setCustomImageUrl] = useState("https://images.unsplash.com/photo-1612222869049-d8ec83637a3c?auto=format&fit=crop&q=80&w=800"); 
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ⭐️ 접속한 설계사의 연락처를 저장할 상태
  const [agentPhone, setAgentPhone] = useState("");

  useEffect(() => {
    // 1. 카카오 SDK 초기화
    const initKakao = () => {
      const globalWindow = window as any;
      if (globalWindow.Kakao && !globalWindow.Kakao.isInitialized()) {
        globalWindow.Kakao.init("ccb428fb9e389bec1c8579c12828fd97"); 
      }
    };
    const timer = setTimeout(initKakao, 1000);

    // 2. ⭐️ 내 연락처(phone) DB에서 가져오기
    const fetchMyPhone = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // agents 테이블에서 내 번호 가져오기 (DB에 phone 컬럼이 존재해야 함)
        const { data } = await supabase.from('agents').select('phone').eq('auth_id', user.id).single();
        if (data?.phone) setAgentPhone(data.phone);
      }
    };
    fetchMyPhone();

    return () => clearTimeout(timer);
  }, []);

  const sendKakaoMessage = (type: string) => {
    const globalWindow = window as any;
    if (!globalWindow.Kakao || !globalWindow.Kakao.isInitialized()) {
      return alert("카카오톡 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }

    let msgTitle = "";
    let msgDesc = "";
    let msgImage = "";
    let btnText = "확인하기";
    let linkUrl = window.location.origin; 

    switch (type) {
      case "greeting":
        msgTitle = `[감사 인사] ${profileName} 올림`;
        msgDesc = "항상 믿고 맡겨주셔서 감사합니다. 변함없는 마음으로 곁에서 든든한 금융 파트너가 되겠습니다.";
        msgImage = "https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&q=80&w=800";
        btnText = "모바일 명함 보기";
        break;
      case "claim":
        msgTitle = `[청구 완료 안내] ${profileName} 설계사`;
        msgDesc = "요청하신 보험금 청구 접수가 완료되었습니다. 추가 문의사항이 있으시면 언제든 연락 부탁드립니다.";
        msgImage = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800";
        btnText = "담당자에게 연락하기";
        break;
      case "review":
        msgTitle = `[보장 분석 안내] ${profileName} 설계사`;
        msgDesc = "고객님께 딱 맞는 맞춤형 보장 분석이 준비되었습니다. 불필요한 보험료는 줄이고 보장은 든든하게 채워보세요!";
        msgImage = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800";
        btnText = "무료 보장분석 받기";
        break;
    }

    executeKakaoShare(msgTitle, msgDesc, msgImage, linkUrl, btnText);
  };

  const sendCustomMessage = () => {
    if (!customTitle.trim()) return alert("메시지 제목을 입력해주세요.");
    if (!customDesc.trim()) return alert("메시지 내용을 입력해주세요.");
    
    const finalLink = customLink.trim() ? customLink.trim() : window.location.origin;

    executeKakaoShare(
      customTitle, 
      customDesc, 
      customImageUrl, 
      finalLink, 
      "자세히 보기"
    );
  };

  const executeKakaoShare = (title: string, desc: string, imageUrl: string, link: string, btnText: string) => {
    const globalWindow = window as any;
    if (!globalWindow.Kakao || !globalWindow.Kakao.isInitialized()) return;

    globalWindow.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title,
        description: desc,
        imageUrl: imageUrl,
        link: { mobileWebUrl: link, webUrl: link },
      },
      buttons: [
        { title: btnText, link: { mobileWebUrl: link, webUrl: link } },
      ],
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `kakao_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('kakao_images')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('kakao_images').getPublicUrl(fileName);
      setCustomImageUrl(data.publicUrl);
    } catch (error) {
      console.error(error);
      alert("이미지 업로드에 실패했습니다. 버킷(kakao_images) 설정을 확인해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  // ⭐️ 담당자 연락처를 포함하여 링크 생성
  const copyPromoLink = (promoId: number) => {
    // URL 끝에 파라미터로 담당자 이름과 폰번호를 숨겨서 보냅니다.
    const url = `${window.location.origin}/promo/${promoId}?name=${encodeURIComponent(profileName)}&phone=${encodeURIComponent(agentPhone || "01000000000")}`;
    setCustomLink(url);
    alert(`${promoId}번 홍보 페이지 주소가 링크 칸에 셋팅되었습니다.\n(고객이 버튼 클릭 시 대표님 번호로 연결됩니다)`);
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
      
      {!isCustomMode ? (
        <>
          <p className="text-xs text-gray-500 mb-4 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            원하시는 템플릿을 누른 뒤, 카카오톡 앱에서 보낼 고객을 <b>최대 10명씩</b> 체크하세요.<br/>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

            <button onClick={() => setIsCustomMode(true)} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer group">
              <PenTool className="w-6 h-6 text-slate-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">직접 작성하기</span>
            </button>
          </div>
        </>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-blue-600" /> 나만의 메시지 만들기
            </h4>
            <button onClick={() => setIsCustomMode(false)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">메시지 썸네일</label>
              <div className="flex items-center gap-3">
                <img src={customImageUrl} alt="썸네일 미리보기" className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <ImageIcon className="w-4 h-4 text-blue-500" />}
                  {isUploading ? "업로드 중..." : "사진 변경하기"}
                </button>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">메시지 제목</label>
              <input 
                type="text" 
                placeholder="예: 당신의 미래를 지키는 든든한 달러 연금" 
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">메시지 내용</label>
              <textarea 
                rows={3}
                placeholder="간략한 설명을 적어주세요." 
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white resize-none"
              />
            </div>

            <div>
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="block text-xs font-bold text-gray-600">연결할 링크 (자세히 보기)</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => copyPromoLink(1)} className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                    + [1번] 달러 연금 플랜
                  </button>
                </div>
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white"
                />
              </div>
            </div>

            <button 
              onClick={sendCustomMessage}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 py-3 rounded-xl font-black text-sm transition-colors shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" /> 작성한 메시지로 10명씩 카톡 보내기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}