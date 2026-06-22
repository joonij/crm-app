"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";
// ⭐️ 이전에 생성한 암호화 서버 액션을 불러옵니다. (경로가 다르면 수정해주세요)
import { encryptRegNumber } from "@/app/actions/crypto"; 

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-gray-50 md:bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const labelClassName = "mb-1.5 block text-sm font-bold text-gray-700";

type FormState = {
  name: string;
  phone: string;
  regFront: string;
  regBack: string;
  job: string;
  address: string;
  client_source: string;
  contract_status: string;
  introduce_client: string;
  telecom_carriers: string;
  driving_statuses: string;
  bank_lists: string;
  bank_info: string;
  card_withdrawal_date: string;
  notes: string;
};

// ⭐️ 초기값을 모두 비워두어 사용자가 명시적으로 선택하게 만듭니다.
const initialFormState: FormState = {
  name: "",
  phone: "",
  regFront: "",
  regBack: "",
  job: "",
  address: "",
  client_source: "", 
  contract_status: "", 
  introduce_client: "",
  telecom_carriers: "",
  driving_statuses: "",
  bank_lists: "",
  bank_info: "",
  card_withdrawal_date: "",
  notes: "",
};

type LookupItem = { id: string | number; name: string };
type ClientItem = { id: number; name: string; phone: string };

type ClientModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function ClientModal({ onClose, onSuccess }: ClientModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);

  const [sources, setSources] = useState<LookupItem[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [telecoms, setTelecoms] = useState<LookupItem[]>([]);
  const [drivings, setDrivings] = useState<LookupItem[]>([]);
  const [banks, setBanks] = useState<LookupItem[]>([]);
  const [existingClients, setExistingClients] = useState<ClientItem[]>([]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ⭐️ 연락처 자동 하이픈 변환 함수
  const formatPhoneNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    if (num.startsWith("02")) {
      if (num.length <= 2) return num;
      if (num.length <= 5) return `${num.slice(0, 2)}-${num.slice(2)}`;
      if (num.length <= 9) return `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
      return `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6, 10)}`;
    }
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    if (num.length <= 10) return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: agent } = await supabase
          .from("agents")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        if (agent) {
          const [resSource, resStatus, resTelecom, resDriving, resBank, resClients] = await Promise.all([
            supabase.from("client_source").select("id, source"),
            supabase.from("contract_status").select("id, status"),
            supabase.from("telecom_carriers").select("id, telecom"),
            supabase.from("driving_statuses").select("id, status"),
            supabase.from("bank_lists").select("id, bank"),
            supabase.from("clients").select("id, name, phone").eq("agent_id", agent.id)
          ]);

          if (resSource.data) setSources(resSource.data.map(d => ({ id: d.id, name: d.source })));
          if (resStatus.data) setStatuses(resStatus.data.map(d => ({ id: d.id, name: d.status })));
          if (resTelecom.data) setTelecoms(resTelecom.data.map(d => ({ id: d.id, name: d.telecom })));
          if (resDriving.data) setDrivings(resDriving.data.map(d => ({ id: d.id, name: d.status })));
          if (resBank.data) setBanks(resBank.data.map(d => ({ id: d.id, name: d.bank })));
          if (resClients.data) setExistingClients(resClients.data);
        }
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
      } finally {
        setIsLoadingLookups(false);
      }
    };

    fetchLookupData();
  }, []);

  const handleClose = () => {
    setForm(initialFormState);
    onClose();
  };

  const handleSave = async () => {
    // ⭐️ 1. 필수값 유효성 검사 (저장 전 확실하게 차단)
    if (!form.name.trim()) {
      alert("고객 이름을 입력해 주세요.");
      return;
    }
    if (!form.contract_status) {
      alert("계약 상태를 선택해 주세요.");
      return;
    }
    if (!form.client_source) {
      alert("가입 경로를 선택해 주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("로그인이 필요합니다.");

      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (agentError || !agent) throw new Error("담당자 정보를 찾을 수 없습니다.");

      // ⭐️ 2. 주민등록번호 DB 암호화
      let registrationNumber = null;
      if (form.regFront && form.regBack) {
        const rawReg = `${form.regFront}-${form.regBack}`;
        registrationNumber = await encryptRegNumber(rawReg); 
      }

      const parseId = (val: string) => (val === "" ? null : parseInt(val, 10));

      const { error: insertError } = await supabase.from("clients").insert({
        agent_id: agent.id,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        registration_number: registrationNumber,
        job: form.job.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
        bank_info: form.bank_info.trim() || null,
        card_withdrawal_date: form.card_withdrawal_date || null,
        client_source: parseInt(form.client_source, 10), // 무조건 값이 있음을 위에서 보장함
        contract_status: parseInt(form.contract_status, 10), // 무조건 값이 있음을 위에서 보장함
        introduce_client: parseId(form.introduce_client),
        telecom_carriers: parseId(form.telecom_carriers),
        driving_statuses: parseId(form.driving_statuses),
        bank_lists: parseId(form.bank_lists),
      });

      if (insertError) throw insertError;

      setForm(initialFormState);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(`고객 등록 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center bg-white md:bg-black/60 md:backdrop-blur-sm md:p-4">
      <div className="hidden md:block absolute inset-0" onClick={handleClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl flex flex-col bg-white md:rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 shrink-0 bg-white md:rounded-t-3xl">
          <div>
            <h2 id="client-modal-title" className="text-xl font-black text-gray-900">새 고객 상세 등록</h2>
            <p className="mt-1 text-sm text-gray-500 hidden md:block">고객의 상세 정보를 입력하여 CRM에 추가합니다.</p>
          </div>
          <button onClick={handleClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoadingLookups ? (
          <div className="flex-1 flex items-center justify-center p-10 text-gray-500 font-medium">
            설정 데이터를 불러오는 중입니다...
          </div>
        ) : (
          <form className="flex-1 overflow-y-auto px-6 py-6" onSubmit={(e) => { e.preventDefault(); void handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              
              {/* --- 기본 정보 --- */}
              <div className="md:col-span-2 pb-2 mb-2 border-b border-gray-100">
                <h3 className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">1. 기본 정보</h3>
              </div>

              <div>
                <label htmlFor="client-name" className={labelClassName}>이름 <span className="text-red-500">*</span></label>
                <input id="client-name" type="text" required value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="홍길동" className={inputClassName} />
              </div>

              <div>
                <label htmlFor="client-phone" className={labelClassName}>연락처</label>
                {/* ⭐️ 하이픈 자동 생성 로직 적용 */}
                <input id="client-phone" type="tel" maxLength={13} value={form.phone} onChange={(e) => updateField("phone", formatPhoneNumber(e.target.value))} placeholder="010-0000-0000" className={inputClassName} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName}>주민등록번호</label>
                <div className="flex items-center gap-2 w-full md:w-1/2">
                  <input type="tel" maxLength={6} placeholder="YYMMDD" value={form.regFront} onChange={(e) => updateField("regFront", e.target.value.replace(/[^0-9]/g, ''))} className={inputClassName} />
                  <span className="text-gray-400 font-bold">-</span>
                  <input type="password" maxLength={7} placeholder="*******" value={form.regBack} onChange={(e) => updateField("regBack", e.target.value.replace(/[^0-9]/g, ''))} className={inputClassName} />
                </div>
              </div>

              <div>
                <label className={labelClassName}>직업</label>
                <input type="text" value={form.job} onChange={(e) => updateField("job", e.target.value)} placeholder="직업 입력" className={inputClassName} />
              </div>

              <div>
                <label className={labelClassName}>주소</label>
                <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="거주지 주소" className={inputClassName} />
              </div>

              {/* --- 관리 정보 --- */}
              <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-gray-100">
                <h3 className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">2. 계약 및 유입 경로</h3>
              </div>

              <div>
                <label className={labelClassName}>계약 상태 <span className="text-red-500">*</span></label>
                {/* ⭐️ 기본 선택 옵션 명시 */}
                <select value={form.contract_status} onChange={(e) => updateField("contract_status", e.target.value)} className={inputClassName}>
                  <option value="" disabled>-- 필수 선택 --</option>
                  {statuses.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>

              <div>
                <label className={labelClassName}>가입 경로 <span className="text-red-500">*</span></label>
                {/* ⭐️ 기본 선택 옵션 명시 */}
                <select value={form.client_source} onChange={(e) => updateField("client_source", e.target.value)} className={inputClassName}>
                  <option value="" disabled>-- 필수 선택 --</option>
                  {sources.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>

              {/* DB 상 '소개'의 ID가 3이라고 가정 */}
              {form.client_source === "3" && (
                <div className="md:col-span-2 bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                  <label className={labelClassName}>소개해준 고객 (소개 원수)</label>
                  <select value={form.introduce_client} onChange={(e) => updateField("introduce_client", e.target.value)} className={`${inputClassName} bg-white`}>
                    <option value="">-- 기존 고객 검색/선택 --</option>
                    {existingClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.phone ? `(${client.phone.slice(-4)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* --- 부가 정보 --- */}
              <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-gray-100">
                <h3 className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">3. 상세 부가 정보</h3>
              </div>

              <div>
                <label className={labelClassName}>통신사</label>
                <select value={form.telecom_carriers} onChange={(e) => updateField("telecom_carriers", e.target.value)} className={inputClassName}>
                  <option value="">-- 선택 안함 --</option>
                  {telecoms.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>

              <div>
                <label className={labelClassName}>운전 여부</label>
                <select value={form.driving_statuses} onChange={(e) => updateField("driving_statuses", e.target.value)} className={inputClassName}>
                  <option value="">-- 선택 안함 --</option>
                  {drivings.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>

              <div>
                <label className={labelClassName}>주거래 은행</label>
                <select value={form.bank_lists} onChange={(e) => updateField("bank_lists", e.target.value)} className={inputClassName}>
                  <option value="">-- 선택 안함 --</option>
                  {banks.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>

              <div>
                <label className={labelClassName}>계좌 번호</label>
                <input type="tel" value={form.bank_info} onChange={(e) => updateField("bank_info", e.target.value.replace(/[^0-9]/g, ''))} placeholder="- 없이 숫자만 입력" className={inputClassName} />
              </div>

              <div>
                <label className={labelClassName}>결제 출금일</label>
                <input type="date" value={form.card_withdrawal_date} onChange={(e) => updateField("card_withdrawal_date", e.target.value)} className={inputClassName} />
              </div>

              <div className="md:col-span-2 mt-2">
                <label className={labelClassName}>메모 (Notes)</label>
                <textarea rows={4} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="기타 특이사항을 기록하세요." className={`${inputClassName} resize-none`} />
              </div>
            </div>

            {/* 하단 고정 버튼 영역 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 pb-safe mt-8 flex flex-col-reverse md:flex-row items-center justify-end gap-3 z-10">
              <button type="button" onClick={handleClose} disabled={isSaving} className="w-full md:w-auto rounded-xl px-6 py-3.5 text-sm font-bold text-gray-600 bg-gray-100 transition-colors hover:bg-gray-200 disabled:opacity-50">
                취소
              </button>
              <button type="submit" disabled={isSaving} className="w-full md:w-auto rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 shadow-md disabled:opacity-50">
                {isSaving ? "저장 중..." : "고객 정보 저장"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}