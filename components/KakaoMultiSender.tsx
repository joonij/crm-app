// components/KakaoMultiSender.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, Gift, FileText, ShieldCheck, PenTool, Image as ImageIcon, Loader2, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase"; // ⭐️ Supabase 기능 추가

export default function KakaoMultiSender({ profileName }: { profileName: string }) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  // 기본 썸네일 이미지 세팅
  const [customImageUrl, setCustomImageUrl] = useState("https://images.unsplash.com/photo-1612222869049-d8ec83637a3c?auto=format&fit=crop&q=80&w=800"); 
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 카카오 시스템 초기화
  useEffect(() => {
    const initKakao = () => {
      const globalWindow = window as any;
      if (globalWindow.Kakao && !globalWindow.Kakao.isInitialized()) {
        // 🚨 대표님의 JavaScript 키가 맞습니다.
        globalWindow.Kakao.init("ccb428fb9e389bec1c8579c12828fd97"); 
      }
    };
    const timer = setTimeout(initKakao, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 2. 템플릿 기반 발송 (기존 기능)
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

  // 3. ⭐️ 직접 작성(Custom) 발송 기능
  const sendCustomMessage = () => {
    if (!customTitle.trim()) return alert("메시지 제목을 입력해주세요.");
    if (!customDesc.trim()) return alert("메시지 내용을 입력해주세요.");
    
    executeKakaoShare(
      customTitle, 
      customDesc, 
      customImageUrl, 
      window.location.origin, 
      "자세히 보기"
    );
  };

  // 공통 카카오 API 호출 함수
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

  // 4. ⭐️ 이미지 업로드 기능 (Supabase 연동)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `kakao_${Date.now()}.${fileExt}`;

      // kakao_images 버킷에 업로드
      const { error: uploadError } = await supabase.storage
        .from('kakao_images')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 퍼블릭 URL 가져와서 상태에 저장
      const { data } = supabase.storage.from('kakao_images').getPublicUrl(fileName);
      setCustomImageUrl(data.publicUrl);
    } catch (error) {
      console.error(error);
      alert("이미지 업로드에 실패했습니다. 버킷(kakao_images) 설정을 확인해주세요.");
    } finally {
      setIsUploading(false);
    }
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

            {/* ⭐️ 직접 작성하기 토글 버튼 */}
            <button onClick={() => setIsCustomMode(true)} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer group">
              <PenTool className="w-6 h-6 text-slate-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">직접 작성하기</span>
            </button>
          </div>
        </>
      ) : (
        // ⭐️ 직접 작성 모드 UI
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
            {/* 사진 업로드 영역 */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">썸네일 이미지</label>
              <div className="flex items-center gap-3">
                <img src={customImageUrl} alt="썸네일 미리보기" className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <ImageIcon className="w-4 h-4 text-blue-500" />}
                  {isUploading ? "사진 올리는 중..." : "사진 변경하기"}
                </button>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              </div>
            </div>

            {/* 제목/내용 입력 영역 */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">메시지 제목</label>
              <input 
                type="text" 
                placeholder="예: [10월 이벤트] 암보험 점검 안내" 
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">메시지 내용</label>
              <textarea 
                rows={3}
                placeholder="고객님께 전달할 내용을 자유롭게 적어주세요." 
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white resize-none"
              />
            </div>

            {/* 발송 버튼 */}
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