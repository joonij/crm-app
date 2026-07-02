"use client";

import { useState, useEffect } from "react";
import { User, CreditCard, X, ShieldAlert, FileText, MapPin, Briefcase, Edit2, Save } from "lucide-react";
import { decryptRegNumber, encryptRegNumber } from "@/app/actions/crypto";
import { supabase } from "@/lib/supabase";

const contractStatusStyleMap: Record<string, string> = {
  "계약완료": "bg-blue-50 text-blue-700 border-blue-200/80",
  "계약진행": "bg-green-50 text-green-700 border-green-200/80",
  "계약보류": "bg-amber-50 text-amber-700 border-amber-200/80",
  "계약거절": "bg-zinc-50 text-zinc-600 border-zinc-200",
  "계약해지": "bg-red-50 text-red-700 border-red-200/80",
};

const inputClass = "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium shadow-sm";

type LookupItem = { id: number; name: string };

export default function ClientDetailModal({ client, onClose, onRefresh }: { client: any, onClose: () => void, onRefresh?: () => void }) {
  const [decryptedReg, setDecryptedReg] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 소개자 검색을 위한 상태
  const [referrerSearch, setReferrerSearch] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    registration_number: "", 
    job: "",
    address: "",
    bank_info: "",
    card_withdrawal_date: "",
    notes: "",
    client_source: "",
    introduce_client: "", 
    contract_status: "",
    telecom_carriers: "",
    driving_statuses: "",
    bank_lists: "",
  });

  const [lookups, setLookups] = useState({
    sources: [] as LookupItem[],
    statuses: [] as LookupItem[],
    telecoms: [] as LookupItem[],
    drivings: [] as LookupItem[],
    banks: [] as LookupItem[],
    clients: [] as { id: number; name: string; phone: string | null }[], 
  });

  useEffect(() => {
    async function getDecryptedData() {
      if (client?.registration_number) {
        const decrypted = await decryptRegNumber(client.registration_number);
        setDecryptedReg(decrypted);
        setFormData(prev => ({ ...prev, registration_number: decrypted || "" }));
      }
    }
    getDecryptedData();

    setFormData(prev => ({
      ...prev,
      name: client?.name || "",
      phone: client?.phone || "",
      job: client?.job || "",
      address: client?.address || "",
      bank_info: client?.bank_info || "",
      card_withdrawal_date: client?.card_withdrawal_date || "",
      notes: client?.notes || "",
      client_source: client?.client_source?.id || client?.client_source_id || "",
      introduce_client: client?.introduce_client || "", 
      contract_status: client?.contract_status?.id || client?.contract_status_id || "",
      telecom_carriers: client?.telecom_carriers?.id || client?.telecom_carriers_id || "",
      driving_statuses: client?.driving_statuses?.id || client?.driving_statuses_id || "",
      bank_lists: client?.bank_lists?.id || client?.bank_lists_id || "",
    }));
  }, [client]);

  useEffect(() => {
    if (isEditing && lookups.sources.length === 0) {
      async function fetchLookups() {
        // ⭐️ 해당 담당자(agent_id)의 고객만 불러오도록 .eq("agent_id", client.agent_id) 필터 추가
        const clientQuery = client?.agent_id 
          ? supabase.from("clients").select("id, name, phone").eq("agent_id", client.agent_id)
          : supabase.from("clients").select("id, name, phone");

        const [resSource, resStatus, resTelecom, resDriving, resBank, resClients] = await Promise.all([
          supabase.from("client_source").select("id, source"),
          supabase.from("contract_status").select("id, status"),
          supabase.from("telecom_carriers").select("id, telecom"),
          supabase.from("driving_statuses").select("id, status"),
          supabase.from("bank_lists").select("id, bank"),
          clientQuery, // ⭐️ 수정된 필터 적용
        ]);

        const fetchedClients = resClients.data || [];

        setLookups({
          sources: resSource.data?.map(d => ({ id: d.id, name: d.source })) || [],
          statuses: resStatus.data?.map(d => ({ id: d.id, name: d.status })) || [],
          telecoms: resTelecom.data?.map(d => ({ id: d.id, name: d.telecom })) || [],
          drivings: resDriving.data?.map(d => ({ id: d.id, name: d.status })) || [],
          banks: resBank.data?.map(d => ({ id: d.id, name: d.bank })) || [],
          clients: fetchedClients,
        });

        // 이미 소개자가 등록되어 있다면 검색창에 이름(연락처) 세팅
        if (client?.introduce_client && fetchedClients.length > 0) {
          const matched = fetchedClients.find(c => c.id === client.introduce_client);
          if (matched) {
            setReferrerSearch(`${matched.name} (${matched.phone || '연락처없음'})`);
          }
        }
      }
      fetchLookups();
    }
  }, [isEditing, lookups.sources.length, client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("고객 이름은 필수입니다.");
      return;
    }
    if (!formData.client_source) {
      alert("가입 경로는 필수 항목입니다. 반드시 선택해 주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const parseId = (val: string | number) => val ? parseInt(String(val), 10) : null;
      
      let finalRegNumber = client.registration_number; 
      
      if (formData.registration_number !== decryptedReg) {
        if (formData.registration_number.trim() !== "") {
          finalRegNumber = await encryptRegNumber(formData.registration_number); 
        } else {
          finalRegNumber = null; 
        }
      }

      const { error } = await supabase
        .from("clients")
        .update({
          name: formData.name,
          phone: formData.phone || null,
          registration_number: finalRegNumber,
          job: formData.job || null,
          address: formData.address || null,
          bank_info: formData.bank_info || null,
          card_withdrawal_date: formData.card_withdrawal_date || null,
          notes: formData.notes || null,
          client_source: parseId(formData.client_source),
          introduce_client: parseId(formData.introduce_client),
          contract_status: parseId(formData.contract_status),
          telecom_carriers: parseId(formData.telecom_carriers),
          driving_statuses: parseId(formData.driving_statuses),
          bank_lists: parseId(formData.bank_lists),
        })
        .eq("id", client.id);

      if (error) throw error;

      setIsEditing(false);
      if (onRefresh) onRefresh(); 
      else window.location.reload(); 
    } catch (error: any) {
      alert(`저장 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!client) return null;

  const selectedSourceName = lookups.sources.find(s => String(s.id) === String(formData.client_source))?.name || "";
  const isReferral = selectedSourceName.includes("소개");

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/10 backdrop-blur-sm p-0 md:p-4 transition-opacity"
      onClick={!isEditing ? onClose : undefined}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 md:zoom-in-95 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-xl text-gray-900">고객 상세 프로필</h3>
            <div className="flex items-center gap-2 mt-1">
              {!isEditing ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${contractStatusStyleMap[client.contract_status?.status] || "bg-gray-50 text-gray-400 border-gray-200 border-dashed"}`}>
                  {client.contract_status?.status || "상태 없음"}
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md border border-blue-200 animate-pulse">
                  수정 모드
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                  <Edit2 className="w-4 h-4" /> 수정
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 text-sm font-bold px-3 py-1.5 bg-gray-100 rounded-lg">
                취소
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 pb-24">
          
          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 mb-4">
              <User className="w-4 h-4 text-blue-600" /> 기본 정보
            </h4>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">이름 <span className="text-red-500">*</span></span>
                {isEditing ? <input name="name" value={formData.name} onChange={handleChange} className={inputClass} /> : <span className="text-sm font-black text-gray-900">{client.name || "-"}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">연락처</span>
                {isEditing ? <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} /> : <span className="text-sm font-black text-gray-900">{client.phone || "-"}</span>}
              </div>
              
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1">주민등록번호</span>
                
                {isEditing ? (
                  <input 
                    name="registration_number" 
                    value={formData.registration_number || ""} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="번호 입력 (예: 000000-0000000)" 
                  />
                ) : (
                  <span className="text-sm font-black text-gray-900 tracking-widest bg-white px-3 py-1.5 rounded-md border border-gray-200 inline-block w-fit">
                    {decryptedReg ? decryptedReg : "미등록"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">직업</span>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-gray-400 shrink-0" />
                  {isEditing ? <input name="job" value={formData.job} onChange={handleChange} className={inputClass} /> : <span className="text-sm font-black text-gray-900">{client.job || "-"}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">통신사</span>
                {isEditing ? (
                  <select name="telecom_carriers" value={formData.telecom_carriers} onChange={handleChange} className={inputClass}>
                    <option value="">선택 안함</option>
                    {lookups.telecoms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                ) : <span className="text-sm font-black text-gray-900">{client.telecom_carriers?.telecom || "-"}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">운전여부</span>
                {isEditing ? (
                  <select name="driving_statuses" value={formData.driving_statuses} onChange={handleChange} className={inputClass}>
                    <option value="">선택 안함</option>
                    {lookups.drivings.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                ) : <span className="text-sm font-black text-gray-900">{client.driving_statuses?.status || "-"}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">가입경로 <span className="text-red-500">*</span></span>
                {isEditing ? (
                  <select name="client_source" value={formData.client_source} onChange={handleChange} className={inputClass}>
                    <option value="">선택 안함</option>
                    {lookups.sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : <span className="text-sm font-black text-blue-600">{client.client_source?.source || "-"}</span>}
              </div>
              
              {isEditing && isReferral && (
                <div className="col-span-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200 mt-1 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-600 uppercase">소개해준 기존 고객 검색</span>
                  <input
                    list="client-list"
                    value={referrerSearch}
                    onChange={(e) => {
                      setReferrerSearch(e.target.value);
                      const matched = lookups.clients.find(c => `${c.name} (${c.phone || '연락처없음'})` === e.target.value);
                      setFormData(prev => ({ ...prev, introduce_client: matched ? String(matched.id) : "" }));
                    }}
                    className={`${inputClass} border-blue-200 focus:ring-blue-400 placeholder:text-blue-300`}
                    placeholder="고객 이름 검색 및 선택..."
                  />
                  <datalist id="client-list">
                    {lookups.clients.map(c => (
                      <option key={c.id} value={`${c.name} (${c.phone || '연락처없음'})`} />
                    ))}
                  </datalist>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">계약 상태</span>
                {isEditing ? (
                  <select name="contract_status" value={formData.contract_status} onChange={handleChange} className={inputClass}>
                    <option value="">선택 안함</option>
                    {lookups.statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : <span className="text-sm font-black text-gray-900">{client.contract_status?.status || "-"}</span>}
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase">주소</span>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                  {isEditing ? <input name="address" value={formData.address} onChange={handleChange} className={inputClass} /> : <span className="text-sm font-black text-gray-900 leading-relaxed">{client.address || "-"}</span>}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 mb-4">
              <CreditCard className="w-4 h-4 text-blue-600" /> 금융 및 결제 정보
            </h4>
            <div className="bg-slate-900 rounded-2xl p-5 grid grid-cols-2 gap-y-6 gap-x-4 shadow-lg">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">주거래 은행</span>
                {isEditing ? (
                  <select name="bank_lists" value={formData.bank_lists} onChange={handleChange} className={`${inputClass} bg-slate-800 border-slate-700`}>
                    <option value="">선택 안함</option>
                    {lookups.banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                ) : <span className="text-sm font-black text-white">{client.bank_lists?.bank || "-"}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">결제일</span>
                {isEditing ? <input type="date" name="card_withdrawal_date" value={formData.card_withdrawal_date} onChange={handleChange} className={`${inputClass} bg-slate-800 border-slate-700 [color-scheme:dark]`} /> : <span className="text-sm font-black text-white">{client.card_withdrawal_date || "-"}</span>}
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">계좌번호</span>
                {isEditing ? <input name="bank_info" value={formData.bank_info} onChange={handleChange} className={`${inputClass} bg-slate-800 border-slate-700`} placeholder="- 없이 숫자만" /> : <span className="text-sm font-black text-white tracking-widest">{client.bank_info || "-"}</span>}
              </div>
            </div>
          </section>

        </div>

        {isEditing && (
          <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 rounded-b-3xl">
            <button 
              onClick={handleSave} 
              disabled={isSaving || !formData.name}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "저장 중..." : "변경 사항 저장하기"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}