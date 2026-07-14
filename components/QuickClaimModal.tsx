// components/QuickClaimModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle, FileText, Printer, Share2, Send, Loader2, Users, Edit3, Eraser, Ban, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import { decryptRegNumber } from "@/app/actions/crypto"; 
import imageCompression from 'browser-image-compression';

type QuickClaimModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  insurance: any;
};

const FAX_NUMBERS: Record<string, string> = {
  "메리츠화재": "0505-021-3400",
  "현대해상": "0507-774-6060",
  "DB손해": "0505-181-4861",
  "삼성화재": "0505-116-1600",
  "KB손해": "0505-136-6500",
  "한화손해": "0505-154-2062",
  "흥국화재": "0505-135-3344",
  "롯데손해": "0505-134-0077",
  "농협손해": "0505-136-4100",
  "MG손해": "0505-081-1983",
};

export default function QuickClaimModal({ isOpen, onClose, client, insurance }: QuickClaimModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [policyholder, setPolicyholder] = useState({ id: null as number | null, name: "", rrn: "", phone: "" });
  const [insured, setInsured] = useState({ id: null as number | null, name: "", rrn: "", phone: "" });
  const [beneficiary, setBeneficiary] = useState({ id: null as number | null, name: "", rrn: "", phone: "" });

  const [accidentDesc, setAccidentDesc] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  
  const [useSavedAccount, setUseSavedAccount] = useState(false);
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [bankLists, setBankLists] = useState<{ id: number; bank: string }[]>([]);
  const [focusedClientField, setFocusedClientField] = useState<'policyholder' | 'insured' | 'beneficiary' | null>(null);
  const [readyToShareFile, setReadyToShareFile] = useState<File | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const insuredCanvasRef = useRef<HTMLCanvasElement>(null);
  const beneficiaryCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isInsuredDrawing, setIsInsuredDrawing] = useState(false);
  const [isBeneficiaryDrawing, setIsBeneficiaryDrawing] = useState(false);
  const [hasInsuredSignature, setHasInsuredSignature] = useState(false); 
  const [hasBeneficiarySignature, setHasBeneficiarySignature] = useState(false);

  // 보험사별 제어 로직
  const companyName = insurance?.insurance_company || "";
  let needsInsuredSignature = true; 
  let needsBeneficiarySignature = true; 

  let supportsSavedAccount = true; 
  const currentFaxNumber = Object.entries(FAX_NUMBERS).find(([key]) => companyName.includes(key))?.[1] || "번호 확인 필요";

  if (companyName.includes("메리츠화재")) {
    needsInsuredSignature = false; // 피보험자
    supportsSavedAccount = true; // 자동청구
  } 
  if (companyName.includes("현대해상")) {
    needsInsuredSignature = false; 
  }
  if (companyName.includes("DB손해")) {
  }
  if (companyName.includes("삼성화재")) {
    supportsSavedAccount = false;
  }
  if (companyName.includes("한화손해")) {
    needsBeneficiarySignature = false;
  }
  if (companyName.includes("흥국생명")) {
    needsInsuredSignature = false;
    supportsSavedAccount = false;
  }

  useEffect(() => {
    if (!supportsSavedAccount) {
      setUseSavedAccount(false);
    }
  }, [supportsSavedAccount]);

  useEffect(() => {
    const fetchLookups = async () => {
      const { data: banks } = await supabase.from("bank_lists").select("id, bank").order("bank");
      if (banks) setBankLists(banks);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agentData } = await supabase.from("agents").select("id").eq("auth_id", user.id).single();
        if (agentData) {
          const { data: myClients } = await supabase
            .from("clients")
            .select("id, name, phone, registration_number, bank_info, bank_lists")
            .eq("agent_id", agentData.id)
            .order("name");
          if (myClients) setClientsList(myClients);
        }
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    const loadClaimDefaults = async () => {
      if (!isOpen || !client || !insurance) return;

      const clientName = client.name || "";
      const clientPhone = client.phone || "";
      let clientRrn = "";
      if (client.registration_number) {
        try {
          const decrypted = await decryptRegNumber(client.registration_number);
          if (decrypted) clientRrn = decrypted.includes("-") ? decrypted : `${decrypted.slice(0, 6)}-${decrypted.slice(6)}`;
        } catch (e) {
          const raw = client.registration_number;
          clientRrn = raw.includes("-") ? raw : `${raw.slice(0, 6)}-${raw.slice(6)}`;
        }
      }

      const currentClientId = parseInt(client.id, 10);
      const getPartyInfo = (partyName?: string | null) => {
        if (!partyName || partyName === clientName) return { id: currentClientId, name: clientName, rrn: clientRrn, phone: clientPhone };
        return { id: null, name: partyName, rrn: "", phone: "" };
      };

      setPolicyholder(getPartyInfo(insurance.contractor_name));
      setInsured(getPartyInfo(insurance.insured_name));
      
      const newBeneficiary = getPartyInfo(insurance.beneficiary_name);
      setBeneficiary(newBeneficiary);

      if (newBeneficiary.name === clientName) {
        setAccountNumber(client.bank_info || ""); 
        if (client.bank_lists) {
          const { data } = await supabase.from("bank_lists").select("bank").eq("id", client.bank_lists).single();
          if (data) setBankName(data.bank);
        }
      } else {
        setBankName("");
        setAccountNumber("");
      }

      setUseSavedAccount(false);
      setReadyToShareFile(null);
      clearSignature('insured');
      clearSignature('beneficiary');
    };
    loadClaimDefaults();
  }, [isOpen, client, insurance]);

  useEffect(() => {
    [insuredCanvasRef.current, beneficiaryCanvasRef.current].forEach(canvas => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.strokeStyle = "#000000"; 
          ctx.lineWidth = 6;          
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
        }
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSavedAccount = () => {
    if (!supportsSavedAccount || isLoading) return;
    setUseSavedAccount((prev) => !prev);
  };
  
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent, type: 'insured' | 'beneficiary') => {
    const canvas = type === 'insured' ? insuredCanvasRef.current : beneficiaryCanvasRef.current;
    if (!canvas) return;
    if (type === 'insured') { setIsInsuredDrawing(true); setHasInsuredSignature(true); } 
    else { setIsBeneficiaryDrawing(true); setHasBeneficiarySignature(true); }
    const { x, y } = getCoordinates(e, canvas);
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.beginPath(); ctx.moveTo(x, y); }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent, type: 'insured' | 'beneficiary') => {
    const isDrawing = type === 'insured' ? isInsuredDrawing : isBeneficiaryDrawing;
    if (!isDrawing) return;
    const canvas = type === 'insured' ? insuredCanvasRef.current : beneficiaryCanvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e, canvas);
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.lineTo(x, y); ctx.stroke(); }
  };

  const stopDrawing = (type: 'insured' | 'beneficiary') => {
    if (type === 'insured') setIsInsuredDrawing(false);
    else setIsBeneficiaryDrawing(false);
  };

  const clearSignature = (type: 'insured' | 'beneficiary') => {
    const canvas = type === 'insured' ? insuredCanvasRef.current : beneficiaryCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (type === 'insured') setHasInsuredSignature(false);
      else setHasBeneficiarySignature(false);
    }
  };

  const handleSelectClient = async (role: 'policyholder' | 'insured' | 'beneficiary', selectedClient: any) => {
    let rrn = "";
    if (selectedClient.registration_number) {
      try {
        const decrypted = await decryptRegNumber(selectedClient.registration_number);
        if (decrypted) rrn = decrypted.includes("-") ? decrypted : `${decrypted.slice(0, 6)}-${decrypted.slice(6)}`;
      } catch (e) {
        const raw = selectedClient.registration_number;
        rrn = raw.includes("-") ? raw : `${raw.slice(0, 6)}-${raw.slice(6)}`;
      }
    }

    const newData = { id: selectedClient.id, name: selectedClient.name, rrn, phone: selectedClient.phone || "" };

    if (role === 'policyholder') setPolicyholder(newData);
    else if (role === 'insured') setInsured(newData);
    else if (role === 'beneficiary') {
      setBeneficiary(newData);
      setAccountNumber(selectedClient.bank_info || "");
      const bankId = selectedClient.bank_lists?.id || selectedClient.bank_lists;
      if (bankId) {
        const matchedBank = bankLists.find(b => String(b.id) === String(bankId));
        if (matchedBank) setBankName(matchedBank.bank);
        else setBankName("");
      } else setBankName("");
    }
    setFocusedClientField(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsLoading(true);
      try {
        const files = Array.from(e.target.files);
        const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1000, useWebWorker: false };
        const processedFiles = await Promise.all(
          files.map(async (file) => {
            if (!file.type.startsWith('image/')) return file;
            try {
              return await imageCompression(file, options);
            } catch (compressError) {
              return file; 
            }
          })
        );
        setUploadedFiles((prev) => {
          const newFiles = [...prev, ...processedFiles];
          const totalSizeBytes = newFiles.reduce((acc, file) => acc + file.size, 0);
          const totalSizeMB = totalSizeBytes / (1024 * 1024);
          if (totalSizeMB > 4.0) {
            alert(`첨부파일 총 용량이 서버 제한(4.5MB)을 초과합니다. (현재: ${totalSizeMB.toFixed(1)}MB)\n\n영수증 사진을 줄이거나, 서류를 나누어서 청구해 주세요.`);
            return prev;
          }
          return newFiles;
        });
      } catch (error) {
        alert("파일을 첨부하는 중 문제가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
    e.target.value = ''; 
  };

  const handleAction = async (type: string) => {
    if (needsInsuredSignature && !hasInsuredSignature) return alert("피보험자 서명을 기재해 주세요.");
    if (needsBeneficiarySignature && !hasBeneficiarySignature) return alert("수익자(청구인) 서명을 기재해 주세요.");
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("insuranceCompany", insurance?.insurance_company || "");
      formData.append("productName", insurance?.product_name || "");
      
      formData.append("policyholderName", policyholder.name);
      formData.append("policyholderRrn", policyholder.rrn);
      formData.append("policyholderPhone", policyholder.phone);

      formData.append("insuredName", insured.name);
      formData.append("insuredRrn", insured.rrn);
      formData.append("insuredPhone", insured.phone);

      formData.append("beneficiaryName", beneficiary.name);
      formData.append("beneficiaryRrn", beneficiary.rrn);
      formData.append("beneficiaryPhone", beneficiary.phone);
      
      formData.append("bankName", bankName);
      formData.append("accountNumber", accountNumber);
      formData.append("accidentDesc", accidentDesc);

      formData.append("useSavedAccount", String(useSavedAccount));

      // ⭐️ [버그 수정 완료] 빈 문자열 대신 확실하게 입력된 이름을 찾아서 넘김
      const actualClientName = client?.name || insured.name || policyholder.name || "미지정고객";
      formData.append("clientName", actualClientName);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agentData } = await supabase.from("agents").select("id").eq("auth_id", user.id).single();
        if (agentData) formData.append("agentId", String(agentData.id));
      }
      
      if (needsBeneficiarySignature && hasBeneficiarySignature && beneficiaryCanvasRef.current) {
        formData.append("signatureImage", beneficiaryCanvasRef.current.toDataURL("image/png")); 
      }
      if (needsInsuredSignature && hasInsuredSignature && insuredCanvasRef.current) {
        formData.append("insuredSignatureImage", insuredCanvasRef.current.toDataURL("image/png"));
      }
      
      uploadedFiles.forEach(file => formData.append("receipts", file));

      const res = await fetch("/api/generate-claim", { method: "POST", body: formData });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData?.error === "UNSUPPORTED_INSURANCE") {
          setIsLoading(false); 
          return alert("아직 작성되지 않은 청구서 양식입니다. 관리자에게 문의 남겨주세요.");
        }
        throw new Error("서버에서 PDF를 만들지 못했습니다.");
      }

      const blob = await res.blob();
      const fileName = `${actualClientName}_${insurance?.insurance_company || '보험금'}_청구서.pdf`;
      
      if (type === "pdf") {
        const pdfUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName; 
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (type === "mobile") {
        const pdfFile = new File([blob], fileName, { type: "application/pdf" });
        setReadyToShareFile(pdfFile);
      }
    } catch (error: any) {
      console.error(error);
      alert("처리 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeDirectShare = async () => {
    if (!readyToShareFile) return;
    try {
      await navigator.share({
        title: `${client?.name || insured.name || policyholder.name || '고객'} 보험금 청구 서류`,
        text: `다이렉트 모바일 팩스 전송을 위한 PDF 파일입니다.`,
        files: [readyToShareFile]
      });
    } catch (shareError: any) {
      if (shareError.name === "AbortError" || shareError.message?.includes("Share canceled")) {
        return;
      }
      alert("공유 기능이 차단된 브라우저입니다. 화면 우측 상단의 다른 브라우저로 열기를 이용해주세요.");
    }
  };

  const copyFaxNumber = async () => {
    if (currentFaxNumber === "번호 확인 필요") return;
    try {
      await navigator.clipboard.writeText(currentFaxNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      alert("복사 기능이 지원되지 않는 브라우저입니다. 팩스 번호를 직접 꾹 눌러 복사해주세요.");
    }
  };

  const renderClientSearchInput = (role: 'policyholder' | 'insured' | 'beneficiary', placeholderText: string) => {
    const currentState = role === 'policyholder' ? policyholder : role === 'insured' ? insured : beneficiary;
    const setState = role === 'policyholder' ? setPolicyholder : role === 'insured' ? setInsured : setBeneficiary;
    const currentValue = currentState.name;
    const cleanNameInput = currentValue.replace(/\s+/g, "").toLowerCase();
    const cleanPhoneInput = currentValue.replace(/[^0-9]/g, "");

    const filteredClients = currentValue
      ? clientsList.filter(c => {
          const matchName = c.name ? c.name.replace(/\s+/g, "").toLowerCase().includes(cleanNameInput) : false;
          const matchPhone = cleanPhoneInput && c.phone ? c.phone.replace(/[^0-9]/g, "").includes(cleanPhoneInput) : false;
          return matchName || matchPhone;
        })
      : clientsList;

    return (
      <div className="relative w-full">
        <input 
          type="text" 
          placeholder={placeholderText}
          value={currentValue} 
          onChange={(e) => setState({ ...currentState, name: e.target.value, id: null })}
          onFocus={() => setFocusedClientField(role)}
          onBlur={() => setTimeout(() => setFocusedClientField(null), 150)}
          className="w-full border border-gray-200 rounded-xl p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm" 
        />
        {focusedClientField === role && filteredClients.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl py-1" onMouseDown={(e) => e.preventDefault()}>
            {filteredClients.map(c => (
              <li key={c.id} onClick={() => handleSelectClient(role, c)} className="px-4 py-3 sm:px-3 sm:py-2 text-[15px] sm:text-sm font-medium text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between border-b border-gray-50 last:border-0">
                <span>{c.name}</span>
                {c.phone && <span className="text-xs text-gray-400 tracking-tight">{c.phone}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* 진행중 레이어 */}
        {isLoading && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm sm:rounded-2xl">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-black text-slate-800">데이터 처리 중</h3>
            <p className="text-base font-bold text-gray-500 mt-2">잠시만 기다려주세요...</p>
          </div>
        )}

        {/* ⭐️ 공유 대기 화면 (팩스 번호 복사 UI 추가) */}
        {readyToShareFile && (
          <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md sm:rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="bg-green-100 p-5 rounded-full mb-5 shadow-sm border border-green-200">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">청구서 준비 완료!</h3>
            <p className="text-base font-medium text-gray-600 mb-6 max-w-sm">
              서류 병합이 완료되었습니다. 아래 팩스번호를 복사한 뒤 앱으로 전송하세요.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 w-full max-w-[320px] flex items-center justify-between shadow-sm">
              <div className="text-left">
                <p className="text-xs font-bold text-gray-500 mb-1">{companyName} 팩스 수신처</p>
                <p className="text-xl font-black text-blue-600 tracking-wider">{currentFaxNumber}</p>
              </div>
              <button
                onClick={copyFaxNumber}
                disabled={currentFaxNumber === "번호 확인 필요"}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isCopied ? "bg-green-100 text-green-700 border border-green-200" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm"
                }`}
              >
                {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopied ? "복사완료" : "복사하기"}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md">
              <button 
                onClick={executeDirectShare} 
                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-lg font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-6 h-6" /> 팩스 앱 열기
              </button>
              <button 
                onClick={() => {
                  setReadyToShareFile(null);
                  onClose(); // 공유 창 닫을 때 모달도 같이 닫히게 처리
                }} 
                className="w-full sm:w-auto py-4 sm:px-6 bg-gray-100 text-gray-600 rounded-2xl text-lg font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 bg-slate-50 shrink-0">
          <div>
            <h3 className="font-black text-xl sm:text-lg text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600" /> 보험금 청구
            </h3>
            <p className="text-sm sm:text-xs font-bold text-gray-500 mt-1">
              <span className="text-blue-600">{insurance?.insurance_company}</span> - {insurance?.product_name}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer p-3 sm:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl sm:rounded-xl transition-colors bg-white shadow-sm border border-gray-200 sm:border-transparent sm:bg-transparent sm:shadow-none">
            <X className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          
          <div className="bg-slate-50 p-5 sm:p-5 rounded-2xl border border-gray-200 space-y-5">
            <h4 className="font-black text-base sm:text-sm text-gray-800 flex items-center gap-1.5 border-b border-gray-200 pb-3">
              <Users className="w-5 h-5 sm:w-4 sm:h-4 text-indigo-500" /> 계약 관계자 정보
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div className="space-y-3 sm:space-y-2 bg-white p-4 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm sm:text-xs font-black text-indigo-700">① 계약자</p>
                {renderClientSearchInput('policyholder', '이름 검색 또는 직접입력')}
                <input type="text" placeholder="주민번호" value={policyholder.rrn} onChange={e => setPolicyholder({...policyholder, rrn: e.target.value})} className="w-full border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all" />
                <input type="text" placeholder="연락처" value={policyholder.phone} onChange={e => setPolicyholder({...policyholder, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all" />
              </div>
              <div className="space-y-3 sm:space-y-2 bg-white p-4 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm sm:text-xs font-black text-emerald-700">② 피보험자</p>
                {renderClientSearchInput('insured', '이름 검색 또는 직접입력')}
                <input type="text" placeholder="주민번호" value={insured.rrn} onChange={e => setInsured({...insured, rrn: e.target.value})} className="w-full border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all" />
                <input type="text" placeholder="연락처" value={insured.phone} onChange={e => setInsured({...insured, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all" />
              </div>
              <div className="space-y-3 sm:space-y-2 bg-white p-4 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm sm:text-xs font-black text-amber-700">③ 수익자 (청구인)</p>
                {renderClientSearchInput('beneficiary', '이름 검색 또는 직접입력')}
                <input type="text" placeholder="주민번호" value={beneficiary.rrn} onChange={e => setBeneficiary({...beneficiary, rrn: e.target.value})} className="w-full border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all" />
                <input type="text" placeholder="연락처" value={beneficiary.phone} onChange={e => setBeneficiary({...beneficiary, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-5">
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-2 sm:mb-1">
                <label className="block text-sm sm:text-xs font-bold text-gray-600">수익자 계좌 정보 (수령인 명의)</label>
                <div 
                  onClick={handleToggleSavedAccount} 
                  className={`flex items-center gap-2 py-1 select-none ${supportsSavedAccount ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                >
                  <span className={`text-xs sm:text-[10px] font-bold ${useSavedAccount ? 'text-blue-600' : 'text-gray-400'}`}>
                    기등록 계좌로 입금
                  </span>
                  <button
                    type="button"
                    disabled={!supportsSavedAccount}
                    className={`relative inline-flex h-5 w-10 sm:h-4 sm:w-8 items-center rounded-full transition-colors pointer-events-none ${
                      !supportsSavedAccount ? 'bg-gray-200 opacity-50' :
                      useSavedAccount ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 sm:h-3 sm:w-3 transform rounded-full bg-white transition-transform duration-200 ${
                      useSavedAccount ? 'translate-x-5 sm:translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 relative">
                {useSavedAccount && (
                  <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] rounded-xl border border-blue-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">기등록된 계좌로 입금 처리됩니다</span>
                  </div>
                )}
                <select 
                  disabled={useSavedAccount}
                  value={bankName} 
                  onChange={e => setBankName(e.target.value)} 
                  className="w-1/3 border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white shadow-sm"
                >
                  <option value="">은행 선택</option>
                  {bankLists.map(b => (<option key={b.id} value={b.bank}>{b.bank}</option>))}
                </select>
                <input 
                  disabled={useSavedAccount}
                  type="text" 
                  placeholder="계좌번호 (숫자만)" 
                  value={accountNumber} 
                  onChange={e => setAccountNumber(e.target.value)} 
                  className="w-2/3 border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm sm:text-xs font-bold text-gray-600 mb-2 sm:mb-1">청구 사유 (진단명 및 내용)</label>
              <input type="text" placeholder="예: 위염 통원치료 및 약제비" value={accidentDesc} onChange={e => setAccidentDesc(e.target.value)} className="w-full border border-gray-200 rounded-xl sm:rounded-lg p-3 sm:p-2.5 text-[16px] sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-5">
            <div className={`relative bg-emerald-50/50 p-5 sm:p-4 rounded-2xl sm:rounded-xl border border-emerald-100 transition-all ${!needsInsuredSignature ? 'pointer-events-none' : ''}`}>
              {!needsInsuredSignature && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl sm:rounded-xl border border-gray-200">
                  <Ban className="w-8 h-8 sm:w-6 sm:h-6 text-gray-400 mb-2 sm:mb-1" />
                  <span className="bg-gray-800 text-white text-sm sm:text-xs font-bold px-4 py-2 sm:px-3 sm:py-1.5 rounded-xl shadow-sm">이 보험사는 서명이 불필요합니다</span>
                </div>
              )}
              <div className="flex justify-between items-end mb-3 sm:mb-2">
                <label className="block text-sm sm:text-xs font-bold text-emerald-800 flex items-center gap-1.5"><Edit3 className="w-4 h-4" /> 피보험자 자필 서명</label>
                <button onClick={() => clearSignature('insured')} className="text-xs sm:text-[10px] flex items-center gap-1 bg-white border border-gray-200 text-gray-500 px-3 py-1.5 sm:px-2 sm:py-1 rounded-lg hover:bg-gray-50 hover:text-red-500 transition-colors shadow-sm cursor-pointer"><Eraser className="w-3 h-3" /> 지우기</button>
              </div>
              <div className="relative border-2 border-dashed border-emerald-200 bg-white rounded-xl overflow-hidden touch-none h-[140px] sm:h-[120px]">
                {!hasInsuredSignature && needsInsuredSignature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40"><p className="text-sm sm:text-[11px] font-bold text-gray-400">피보험자 서명</p></div>}
                <canvas ref={insuredCanvasRef} width={600} height={200} className="w-full h-full cursor-crosshair" onMouseDown={(e) => startDrawing(e, 'insured')} onMouseMove={(e) => draw(e, 'insured')} onMouseUp={() => stopDrawing('insured')} onMouseLeave={() => stopDrawing('insured')} onTouchStart={(e) => startDrawing(e, 'insured')} onTouchMove={(e) => draw(e, 'insured')} onTouchEnd={() => stopDrawing('insured')}/>
              </div>
            </div>

            <div className={`relative bg-amber-50/50 p-5 sm:p-4 rounded-2xl sm:rounded-xl border border-amber-100 transition-all ${!needsBeneficiarySignature ? 'pointer-events-none' : ''}`}>
              {!needsBeneficiarySignature && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl sm:rounded-xl border border-gray-200">
                  <Ban className="w-8 h-8 sm:w-6 sm:h-6 text-gray-400 mb-2 sm:mb-1" />
                  <span className="bg-gray-800 text-white text-sm sm:text-xs font-bold px-4 py-2 sm:px-3 sm:py-1.5 rounded-xl shadow-sm">이 보험사는 서명이 불필요합니다</span>
                </div>
              )}
              <div className="flex justify-between items-end mb-3 sm:mb-2">
                <label className="block text-sm sm:text-xs font-bold text-amber-800 flex items-center gap-1.5"><Edit3 className="w-4 h-4" /> 수익자(청구인) 자필 서명</label>
                <button onClick={() => clearSignature('beneficiary')} className="text-xs sm:text-[10px] flex items-center gap-1 bg-white border border-gray-200 text-gray-500 px-3 py-1.5 sm:px-2 sm:py-1 rounded-lg hover:bg-gray-50 hover:text-red-500 transition-colors shadow-sm cursor-pointer"><Eraser className="w-3 h-3" /> 지우기</button>
              </div>
              <div className="relative border-2 border-dashed border-amber-200 bg-white rounded-xl overflow-hidden touch-none h-[140px] sm:h-[120px]">
                {!hasBeneficiarySignature && needsBeneficiarySignature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40"><p className="text-sm sm:text-[11px] font-bold text-gray-400">수익자 서명</p></div>}
                <canvas ref={beneficiaryCanvasRef} width={600} height={200} className="w-full h-full cursor-crosshair" onMouseDown={(e) => startDrawing(e, 'beneficiary')} onMouseMove={(e) => draw(e, 'beneficiary')} onMouseUp={() => stopDrawing('beneficiary')} onMouseLeave={() => stopDrawing('beneficiary')} onTouchStart={(e) => startDrawing(e, 'beneficiary')} onTouchMove={(e) => draw(e, 'beneficiary')} onTouchEnd={() => stopDrawing('beneficiary')} />
              </div>
            </div>
          </div>

          <div className="space-y-2 pb-4 sm:pb-0">
            <label className="block text-sm sm:text-xs font-bold text-gray-600 mb-2 sm:mb-1">진료비 영수증 첨부</label>
            <div className="border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl sm:rounded-xl p-6 sm:p-4 text-center relative cursor-pointer bg-slate-50/50 transition-colors">
              <input type="file" multiple accept="image/*, application/pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload className="w-8 h-8 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-2 sm:mb-1" />
              <p className="text-sm sm:text-xs font-bold text-gray-600">클릭하여 영수증 사진 또는 PDF 업로드</p>
            </div>
            {uploadedFiles.length > 0 && <p className="mt-3 sm:mt-2 text-sm sm:text-xs font-bold text-blue-600 flex items-center gap-1.5 sm:gap-1"><CheckCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5"/> {uploadedFiles.length}건 첨부됨</p>}
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 pb-8 sm:pb-5">
          <button onClick={() => handleAction('pdf')} disabled={isLoading} className="cursor-pointer flex items-center justify-center gap-2 p-4 sm:p-3.5 rounded-2xl sm:rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-black text-base sm:text-sm transition-colors shadow-sm">
            <Printer className="w-5 h-5 sm:w-4 sm:h-4" /> PDF 인쇄
          </button>
          <button onClick={() => handleAction('mobile')} disabled={isLoading} className="cursor-pointer flex items-center justify-center gap-2 p-4 sm:p-3.5 rounded-2xl sm:rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-base sm:text-sm transition-colors shadow-sm">
            <Share2 className="w-5 h-5 sm:w-4 sm:h-4" /> 모바일 팩스 전송
          </button>
        </div>

      </div>
    </div>
  );
}