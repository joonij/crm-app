// components/QuickClaimModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Upload, CheckCircle, FileText, Printer, Share2, Send, Loader2, Users } from "lucide-react";

// 타입 정의 (부모 컴포넌트에서 넘겨받을 데이터)
type QuickClaimModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: any;      // 고객 정보
  insurance: any;   // 클릭한 해당 보험 정보
};

export default function QuickClaimModal({ isOpen, onClose, client, insurance }: QuickClaimModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // ⭐️ 3주체(계약자, 피보험자, 수익자) 정보 상태 관리
  const [policyholder, setPolicyholder] = useState({ name: "", rrn: "", phone: "" });
  const [insured, setInsured] = useState({ name: "", rrn: "", phone: "" });
  const [beneficiary, setBeneficiary] = useState({ name: "", rrn: "", phone: "" });

  const [accidentDesc, setAccidentDesc] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // 모달이 열릴 때, 현재 고객 정보를 기본적으로 '피보험자'와 '수익자'에 자동 채워주기 (편의성)
  useEffect(() => {
    if (isOpen && client) {
      const defaultInfo = {
        name: client.name || "",
        rrn: client.registration_number ? `${client.registration_number.slice(0, 6)}-` : "",
        phone: client.phone || ""
      };
      setPolicyholder(defaultInfo);
      setInsured(defaultInfo);
      setBeneficiary(defaultInfo);
    }
  }, [isOpen, client]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFiles(Array.from(e.target.files));
  };

// 발송 액션들
const handleAction = async (type: string) => {
  // 1. 필수값 검사
  if (!accidentDesc) {
    return alert("청구 사유(진단명 및 내용)는 필수입니다.");
  }
  
  setIsLoading(true);
  try {
    // 2. 서버로 보낼 폼 데이터 구성
    const formData = new FormData();
    formData.append("insuredName", insured.name);
    formData.append("insuredRrn", insured.rrn);
    formData.append("insuredPhone", insured.phone);
    formData.append("bankName", bankName);
    formData.append("accountNumber", accountNumber);
    formData.append("accidentDesc", accidentDesc);
    
    uploadedFiles.forEach(file => {
      formData.append("receipts", file);
    });

    // 3. 백엔드 PDF 생성 API 호출
    const res = await fetch("/api/generate-claim", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("서버에서 PDF를 만들지 못했습니다.");
    const blob = await res.blob();

    // 4. 버튼 타입에 따른 분기 처리
    if (type === "pdf") {
      // [PDF 인쇄] 버튼: 새 탭에서 열기
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, "_blank");

    } else if (type === "mobile") {
      // ⭐️ [모바일 팩스] 버튼: 스마트폰 공유 화면 호출
      const pdfFile = new File([blob], `${client.name}_보험금청구서.pdf`, { type: "application/pdf" });

      // 브라우저가 파일 공유 기능을 지원하는지 검사
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `${client.name} 고객 보험금 청구 서류`,
          text: `다이렉트 모바일 팩스 전송을 위한 PDF 파일입니다.`,
          files: [pdfFile]
        });
      } else {
        // PC 브라우저이거나 구형 브라우저일 경우 예외 처리
        alert("현재 기기(또는 브라우저)에서는 모바일 공유 기능을 지원하지 않습니다. 스마트폰에서 실행하거나 PDF 인쇄 버튼을 이용해 주세요.");
      }
    }
  } catch (error) {
    console.error(error);
    alert("처리 중 에러가 발생했습니다.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-slate-50">
          <div>
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> 다이렉트 보험금 청구
            </h3>
            <p className="text-xs font-bold text-gray-500 mt-1">
              <span className="text-blue-600">{insurance?.insurance_company}</span> - {insurance?.product_name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 스크롤 가능한 본문 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* ⭐️ 계약 관계자 3주체 입력 폼 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 border-b border-gray-200 pb-2">
              <Users className="w-4 h-4 text-indigo-500" /> 계약 관계자 정보 (다를 경우 수정)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. 계약자 */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-indigo-700">① 계약자</p>
                <input type="text" placeholder="이름" value={policyholder.name} onChange={e => setPolicyholder({...policyholder, name: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="주민번호 (예: 900101-1)" value={policyholder.rrn} onChange={e => setPolicyholder({...policyholder, rrn: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="연락처" value={policyholder.phone} onChange={e => setPolicyholder({...policyholder, phone: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
              </div>

              {/* 2. 피보험자 */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-emerald-700">② 피보험자 (사고자)</p>
                <input type="text" placeholder="이름" value={insured.name} onChange={e => setInsured({...insured, name: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="주민번호 (예: 900101-1)" value={insured.rrn} onChange={e => setInsured({...insured, rrn: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="연락처" value={insured.phone} onChange={e => setInsured({...insured, phone: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
              </div>

              {/* 3. 수익자 */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-amber-700">③ 수익자 (수령인)</p>
                <input type="text" placeholder="이름" value={beneficiary.name} onChange={e => setBeneficiary({...beneficiary, name: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="주민번호 (예: 900101-1)" value={beneficiary.rrn} onChange={e => setBeneficiary({...beneficiary, rrn: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="연락처" value={beneficiary.phone} onChange={e => setBeneficiary({...beneficiary, phone: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* 청구 내용 및 계좌 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">수익자 계좌 정보 (수령인 명의)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="은행명" value={bankName} onChange={e => setBankName(e.target.value)} className="w-1/3 border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none" />
                <input type="text" placeholder="계좌번호 (숫자만)" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-2/3 border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">청구 사유 (진단명 및 내용)</label>
              <input type="text" placeholder="예: 위염 통원치료 및 약제비" value={accidentDesc} onChange={e => setAccidentDesc(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none" />
            </div>
          </div>

          {/* 영수증 업로드 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">진료비 영수증 첨부</label>
            <div className="border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl p-4 text-center relative cursor-pointer bg-slate-50/50 transition-colors">
              <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-600">클릭하여 영수증 사진 업로드</p>
            </div>
            {uploadedFiles.length > 0 && (
              <p className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> {uploadedFiles.length}장 첨부됨</p>
            )}
          </div>
        </div>

        {/* ⭐️ 하단 액션 버튼 3종 세트 */}
        <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => handleAction('pdf')} disabled={isLoading} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm transition-colors">
            <Printer className="w-4 h-4" /> PDF 인쇄
          </button>
          
          <button onClick={() => handleAction('mobile')} disabled={isLoading} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-sm transition-colors">
            <Share2 className="w-4 h-4" /> 모바일 팩스
          </button>
          
          {/* <button onClick={() => handleAction('popbill')} disabled={isLoading} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
            팝빌 자동 접수
          </button> */}
        </div>

      </div>
    </div>
  );
}