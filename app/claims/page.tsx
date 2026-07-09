// app/claims/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileText, Printer, Share2, Send, Loader2, 
  Upload, CheckCircle, AlertTriangle, CreditCard,
  History, PlusCircle, RefreshCw, Eye, X, Image as ImageIcon
} from "lucide-react";

export default function ClaimCenterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [myAgentId, setMyAgentId] = useState<number | null>(null);
  
  // ⭐️ 탭 상태 관리 ('new' = 새 청구 작성, 'history' = 청구 내역)
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [claimsHistory, setClaimsHistory] = useState<any[]>([]);

  // 폼 입력 상태값
  const [selectedClientId, setSelectedClientId] = useState("");
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [accidentDesc, setAccidentDesc] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // 문서 뷰어 모달 상태
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerDocs, setViewerDocs] = useState<string[]>([]);

  const [popbillBalance, setPopbillBalance] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 내 정보(agent_id) 가져오기
    const { data: agentData } = await supabase.from("agents").select("id").eq("auth_id", user.id).single();
    if (agentData) setMyAgentId(agentData.id);

    // 고객 목록 가져오기
    const { data: clientsData } = await supabase.from("clients").select("id, name, phone, registration_number, agent_id");
    if (clientsData && agentData) {
      // 내 고객만 필터링 (팀장 로직은 필요시 추가)
      setClients(clientsData.filter(c => c.agent_id === agentData.id));
    }

    // 팝빌 잔액 (Mock)
    setPopbillBalance(12500); 

    // 과거 청구 내역 가져오기
    if (agentData) {
      const { data: historyData } = await supabase
        .from("claims_history")
        .select(`*, clients(name)`)
        .eq("agent_id", agentData.id)
        .order("created_at", { ascending: false });
      
      if (historyData) setClaimsHistory(historyData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const selectedClient = clients.find(c => String(c.id) === selectedClientId);

  // ⭐️ 재청구 기능: 내역에서 데이터 복사 후 폼으로 이동
  const handleReclaim = (historyItem: any) => {
    setSelectedClientId(String(historyItem.client_id));
    setInsuranceCompany(historyItem.insurance_company || "");
    setAccidentDesc(historyItem.accident_desc || "");
    setBankName(historyItem.bank_name || "");
    setAccountNumber(historyItem.account_number || "");
    
    setUploadedFiles([]); // 파일은 새로 올려야 하므로 비움
    alert(`${historyItem.clients.name} 고객님의 기존 청구 데이터를 불러왔습니다.\n영수증만 새로 업로드 후 발송하세요.`);
    setActiveTab('new');
  };

  // ⭐️ 문서 보기 모달 열기
  const handleViewDocs = (urls: string[]) => {
    if (!urls || urls.length === 0) {
      alert("업로드된 문서가 없습니다.");
      return;
    }
    setViewerDocs(urls);
    setIsViewerOpen(true);
  };

  // DB에 청구 기록 저장 헬퍼 (실제 발송 성공 시 호출)
  const saveClaimHistory = async (method: string) => {
    if (!myAgentId || !selectedClientId) return;
    await supabase.from("claims_history").insert({
      agent_id: myAgentId,
      client_id: Number(selectedClientId),
      insurance_company: insuranceCompany,
      accident_desc: accidentDesc,
      bank_name: bankName,
      account_number: accountNumber,
      send_method: method,
      status: "완료",
      document_urls: [] // 차후 스토리지 연동 시 업로드된 URL 배열 삽입
    });
    fetchInitialData(); // 내역 리프레시
  };

  // 발송 로직들
  const handlePdfPrint = async () => {
    if (!selectedClientId) return alert("고객을 먼저 선택해 주세요.");
    setIsLoading(true);
    try {
      window.print();
      await saveClaimHistory("PDF 로컬출력");
    } finally { setIsLoading(false); }
  };

  const handleMobileFaxShare = async () => {
    if (!selectedClientId || uploadedFiles.length === 0) return alert("고객 선택 및 영수증 업로드가 필수입니다.");
    if (!navigator.share) return alert("모바일 기기에서만 지원됩니다.");
    setIsLoading(true);
    try {
      await navigator.share({
        title: `${selectedClient?.name} 보험금 청구 서류`,
        text: `모바일 팩스 앱을 선택해 전송하세요.`,
        files: uploadedFiles.length > 0 ? [uploadedFiles[0]] : []
      });
      await saveClaimHistory("모바일팩스");
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handlePopbillSend = async () => {
    if (!selectedClientId) return alert("고객을 선택해 주세요.");
    if (popbillBalance < 500) return alert("잔액이 부족합니다.");
    if (!confirm("팝빌 API를 통해 자동 발송하시겠습니까?")) return;

    setIsLoading(true);
    try {
      // 팝빌 연동 시뮬레이션
      await new Promise(r => setTimeout(r, 1500)); 
      await saveClaimHistory("팝빌 전송");
      alert("발송 성공!");
      
      // 발송 후 폼 초기화 및 내역 탭으로 이동
      setSelectedClientId(""); setInsuranceCompany(""); setAccidentDesc(""); setBankName(""); setAccountNumber(""); setUploadedFiles([]);
      setActiveTab('history');
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-gray-50/50 min-h-screen relative">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">원클릭 보험금 청구 센터</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">청구서 발송부터 과거 청구 내역 관리 및 재청구까지 한 곳에서.</p>
        </div>

        {/* ⭐️ 탭 네비게이션 버튼 */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button onClick={() => setActiveTab('new')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'new' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            <PlusCircle className="w-4 h-4" /> 새 청구 작성
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            <History className="w-4 h-4" /> 내역 및 재청구
          </button>
        </div>
      </div>

      {/* =========================================================
          [탭 1] 새 청구 작성 폼
      ========================================================= */}
      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* 폼 영역 (이전 코드와 거의 동일) */}
          <div className="lg:col-span-2 space-y-4 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
            <h2 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b pb-3 border-gray-100">
              <FileText className="w-5 h-5 text-blue-600" /> 청구서 기본 데이터 입력
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">고객 선택</label>
                <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:border-blue-500">
                  <option value="">-- 고객을 선택하세요 --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">보험사</label>
                <input type="text" placeholder="예: 메리츠화재" value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">지급받을 은행</label>
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">계좌 번호</label>
                <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">사고 및 진단 내용</label>
              <textarea rows={3} value={accidentDesc} onChange={(e) => setAccidentDesc(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">영수증 첨부</label>
              <div className="border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-4 text-center relative cursor-pointer bg-slate-50/50">
                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-gray-600">영수증 사진을 선택하세요</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 총 {uploadedFiles.length}장 확인됨
                </div>
              )}
            </div>
          </div>

          {/* 발송 옵션 제어 패널 (이전 코드 동일) */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-700 relative overflow-hidden">
              <CreditCard className="absolute right-4 bottom-4 w-12 h-12 opacity-10 text-white" />
              <span className="text-[10px] bg-blue-500/30 text-blue-300 font-bold px-2 py-0.5 rounded">내 전용 충전 계정</span>
              <h3 className="font-bold text-sm text-slate-300 mt-2">팝빌 충전 잔액</h3>
              <p className="text-2xl font-black mt-1 text-white">{popbillBalance.toLocaleString()}원</p>
            </div>

            <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-bold text-sm text-gray-800 mb-3 px-1">2. 청구서 발송 방식 선택</h3>
              <button onClick={handlePdfPrint} disabled={isLoading} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-all">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><Printer className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-800">PDF 저장/로컬 인쇄</p>
                </div>
              </button>
              <button onClick={handleMobileFaxShare} disabled={isLoading} className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-200 hover:bg-amber-50 text-left transition-all">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Share2 className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-amber-800">모바일 무료 팩스 공유</p>
                </div>
              </button>
              <button onClick={handlePopbillSend} disabled={isLoading} className="w-full flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-all">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-blue-800">팝빌 API 자동 접수</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          [탭 2] 청구 내역 및 관리 (리스트 뷰)
      ========================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">날짜</th>
                  <th className="p-4">고객명</th>
                  <th className="p-4">보험사</th>
                  <th className="p-4 hidden md:table-cell">청구 사유</th>
                  <th className="p-4">전송 방식</th>
                  <th className="p-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claimsHistory.length > 0 ? (
                  claimsHistory.map(item => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 text-xs font-semibold text-gray-500">{new Date(item.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="p-4 text-sm font-black text-gray-900">{item.clients?.name}</td>
                      <td className="p-4 text-sm font-bold text-blue-700">{item.insurance_company || "-"}</td>
                      <td className="p-4 text-xs text-gray-600 truncate max-w-[200px] hidden md:table-cell">{item.accident_desc}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                          {item.send_method}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDocs(item.document_urls)} 
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> 문서보기
                        </button>
                        <button 
                          onClick={() => handleReclaim(item)}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> 재청구
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm font-medium text-gray-400">
                      최근 청구 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          문서 뷰어 모달 (과거 청구된 파일/사진을 화면에 띄움)
      ========================================================= */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" /> 제출 서류 뷰어
              </h3>
              <button onClick={() => setIsViewerOpen(false)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-md border border-slate-200 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex flex-col gap-4">
              {viewerDocs && viewerDocs.length > 0 ? (
                viewerDocs.map((url, idx) => (
                  <div key={idx} className="w-full bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden p-2">
                    {url.endsWith('.pdf') ? (
                      <iframe src={url} className="w-full h-[600px] border-none" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={`서류 ${idx+1}`} className="w-full h-auto object-contain max-h-[600px] rounded-lg" />
                    )}
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <FileText className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-semibold">첨부된 파일이 없거나 링크가 만료되었습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}