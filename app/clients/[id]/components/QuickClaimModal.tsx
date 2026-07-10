// components/QuickClaimModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Upload, CheckCircle, FileText, Printer, Share2, Send, Loader2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import { decryptRegNumber } from "@/app/actions/crypto"; 
import imageCompression from 'browser-image-compression';

type QuickClaimModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  insurance: any;
};

export default function QuickClaimModal({ isOpen, onClose, client, insurance }: QuickClaimModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 3주체 상태 관리
  const [policyholder, setPolicyholder] = useState({ id: null as number | null, name: "", rrn: "", phone: "" });
  const [insured, setInsured] = useState({ id: null as number | null, name: "", rrn: "", phone: "" });
  const [beneficiary, setBeneficiary] = useState({ id: null as number | null, name: "", rrn: "", phone: "" });

  const [accidentDesc, setAccidentDesc] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // ⭐️ 검색용 전체 고객 및 은행 리스트 상태
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [bankLists, setBankLists] = useState<{ id: number; bank: string }[]>([]);
  const [focusedClientField, setFocusedClientField] = useState<'policyholder' | 'insured' | 'beneficiary' | null>(null);

  // 1. 전체 고객 및 은행 리스트 사전 조회
  useEffect(() => {
    const fetchLookups = async () => {
      // 은행 목록 조회
      const { data: banks } = await supabase.from("bank_lists").select("id, bank").order("bank");
      if (banks) setBankLists(banks);

      // 담당 설계사의 전체 고객 조회 (주민번호, 계좌번호 포함)
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

  // 2. 모달 열릴 때 기본 정보 세팅
  useEffect(() => {
    const loadClaimDefaults = async () => {
      if (!isOpen || !client || !insurance) return;

      const clientName = client.name || "";
      const clientPhone = client.phone || "";
      
      let clientRrn = "";
      if (client.registration_number) {
        try {
          const decrypted = await decryptRegNumber(client.registration_number);
          if (decrypted) {
            clientRrn = decrypted.includes("-") ? decrypted : `${decrypted.slice(0, 6)}-${decrypted.slice(6)}`;
          }
        } catch (e) {
          const raw = client.registration_number;
          clientRrn = raw.includes("-") ? raw : `${raw.slice(0, 6)}-${raw.slice(6)}`;
        }
      }

      const currentClientId = parseInt(client.id, 10);

      const getPartyInfo = (partyName?: string | null) => {
        if (!partyName || partyName === clientName) {
          return { id: currentClientId, name: clientName, rrn: clientRrn, phone: clientPhone };
        }
        return { id: null, name: partyName, rrn: "", phone: "" };
      };

      const newPolicyholder = getPartyInfo(insurance.contractor_name);
      const newInsured = getPartyInfo(insurance.insured_name);
      const newBeneficiary = getPartyInfo(insurance.beneficiary_name);

      setPolicyholder(newPolicyholder);
      setInsured(newInsured);
      setBeneficiary(newBeneficiary);

      // 본인이 수익자일 때 은행 세팅
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
    };

    loadClaimDefaults();
  }, [isOpen, client, insurance]);

  if (!isOpen) return null;

  // ⭐️ 3. 검색 리스트에서 고객을 클릭했을 때 모든 정보를 스윽 낚아채는 마법의 함수
  const handleSelectClient = async (role: 'policyholder' | 'insured' | 'beneficiary', selectedClient: any) => {
    // 1) 주민등록번호 복호화 처리
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

    // 2) 선택한 역할에 데이터 통째로 밀어넣기
    if (role === 'policyholder') setPolicyholder(newData);
    else if (role === 'insured') setInsured(newData);
    else if (role === 'beneficiary') {
      setBeneficiary(newData);
      
      // ⭐️ 수익자일 경우에만! 계좌번호와 은행명까지 연쇄적으로 자동 세팅
      setAccountNumber(selectedClient.bank_info || "");
      const bankId = selectedClient.bank_lists?.id || selectedClient.bank_lists;
      if (bankId) {
        const matchedBank = bankLists.find(b => String(b.id) === String(bankId));
        if (matchedBank) setBankName(matchedBank.bank);
        else setBankName("");
      } else {
        setBankName("");
      }
    }
    setFocusedClientField(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsLoading(true); // 압축하는 동안 버튼 비활성화 (UX 처리)
      try {
        const files = Array.from(e.target.files);
        
        // 압축 옵션: 최대 1MB, 최대 해상도 1200px (이 정도면 PDF에서 글씨가 선명하게 다 보입니다)
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };

        const compressedFiles = await Promise.all(
          files.map(async (file) => {
            // 이미지가 아닌 파일(PDF 등)이 섞여 있으면 압축하지 않고 원본 그대로 패스
            if (!file.type.startsWith('image/')) return file;
            return await imageCompression(file, options);
          })
        );

        // 덮어쓰지 않고 기존 파일에 누적해서 추가되도록 개선
        setUploadedFiles((prev) => [...prev, ...compressedFiles]);
      } catch (error) {
        console.error("이미지 압축 에러:", error);
        alert("이미지 처리 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
    // 같은 파일을 지웠다가 다시 올릴 때 반응하도록 input 초기화
    e.target.value = ''; 
  };

  const handleAction = async (type: string) => {
    if (!accidentDesc) return alert("청구 사유(진단명 및 내용)는 필수입니다.");
    
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
      
      uploadedFiles.forEach(file => formData.append("receipts", file));

      // 3. 백엔드 PDF 생성 API 호출
      const res = await fetch("/api/generate-claim", {
        method: "POST",
        body: formData,
      });

      // ⭐️ 서버에서 넘어온 실제 에러 메시지를 읽어서 화면에 띄우도록 수정
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API 오류(${res.status}): ${errorText}`);
      }
      
      const blob = await res.blob();

      if (type === "pdf") {
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, "_blank");
      } else if (type === "mobile") {
        const pdfFile = new File([blob], `${client.name}_${insurance?.insurance_company || '보험금'}_청구서.pdf`, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            title: `${client.name} 고객 ${insurance?.insurance_company || ''} 보험금 청구 서류`,
            text: `다이렉트 모바일 팩스 전송을 위한 PDF 파일입니다.`,
            files: [pdfFile]
          });
        } else {
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

  // ⭐️ 4. 하이브리드 검색창 렌더링 엔진 (이름/연락처 동시 검색 지원)
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
          className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" 
        />
        {focusedClientField === role && filteredClients.length > 0 && (
          <ul 
            className="absolute z-50 left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg py-1"
            onMouseDown={(e) => e.preventDefault()}
          >
            {filteredClients.map(c => (
              <li
                key={c.id}
                onClick={() => handleSelectClient(role, c)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>{c.name}</span>
                {c.phone && <span className="text-[10px] text-gray-400 tracking-tight">{c.phone}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
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
          
          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 border-b border-gray-200 pb-2">
              <Users className="w-4 h-4 text-indigo-500" /> 계약 관계자 정보 (검색하여 불러오거나 직접 수정)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. 계약자 */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-indigo-700">① 계약자</p>
                {renderClientSearchInput('policyholder', '이름 (검색 또는 직접입력)')}
                <input type="text" placeholder="주민번호 (예: 900101-1XXXXXX)" value={policyholder.rrn} onChange={e => setPolicyholder({...policyholder, rrn: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="연락처" value={policyholder.phone} onChange={e => setPolicyholder({...policyholder, phone: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
              </div>

              {/* 2. 피보험자 */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-emerald-700">② 피보험자 (사고자)</p>
                {renderClientSearchInput('insured', '이름 (검색 또는 직접입력)')}
                <input type="text" placeholder="주민번호 (예: 900101-1XXXXXX)" value={insured.rrn} onChange={e => setInsured({...insured, rrn: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="연락처" value={insured.phone} onChange={e => setInsured({...insured, phone: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
              </div>

              {/* 3. 수익자 */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-amber-700">③ 수익자 (수령인)</p>
                {renderClientSearchInput('beneficiary', '이름 (검색 또는 직접입력)')}
                <input type="text" placeholder="주민번호 (예: 900101-1XXXXXX)" value={beneficiary.rrn} onChange={e => setBeneficiary({...beneficiary, rrn: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
                <input type="text" placeholder="연락처" value={beneficiary.phone} onChange={e => setBeneficiary({...beneficiary, phone: e.target.value})} className="w-full border border-gray-200 rounded p-1.5 text-xs focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">수익자 계좌 정보 (수령인 명의)</label>
              <div className="flex gap-2">
                {/* ⭐️ 5. 직접 입력에서 DB 연동 셀렉트 박스로 교체된 은행명 선택란 */}
                <select 
                  value={bankName} 
                  onChange={e => setBankName(e.target.value)} 
                  className="w-1/3 border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">은행 선택</option>
                  {bankLists.map(b => (
                    <option key={b.id} value={b.bank}>{b.bank}</option>
                  ))}
                </select>
                <input type="text" placeholder="계좌번호 (숫자만)" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-2/3 border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">청구 사유 (진단명 및 내용)</label>
              <input type="text" placeholder="예: 위염 통원치료 및 약제비" value={accidentDesc} onChange={e => setAccidentDesc(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none" />
            </div>
          </div>

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

        <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => handleAction('pdf')} disabled={isLoading} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm transition-colors">
            <Printer className="w-4 h-4" /> PDF 인쇄
          </button>
          
          <button onClick={() => handleAction('mobile')} disabled={isLoading} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-sm transition-colors">
            <Share2 className="w-4 h-4" /> 모바일 팩스
          </button>
        </div>

      </div>
    </div>
  );
}