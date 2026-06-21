"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";
import { encryptRegNumber } from "@/app/actions/crypto"; // ⭐️ 새로 만든 서버 액션 import

// 모바일 터치를 고려해 py-3으로 상하 여백을 늘렸습니다.
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

const initialFormState: FormState = {
  name: "",
  phone: "",
  regFront: "",
  regBack: "",
  job: "",
  address: "",
  client_source: "",   // ⭐️ 수정: "" 로 변경 (기존 "1")
  contract_status: "", // ⭐️ 수정: "" 로 변경 (기존 "2")
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
          // ⭐️ 제공된 스키마 컬럼명에 맞춰 데이터를 불러옵니다.
          const [resSource, resStatus, resTelecom, resDriving, resBank, resClients] = await Promise.all([
            supabase.from("client_source").select("id, source"),
            supabase.from("contract_status").select("id, status"),
            supabase.from("telecom_carriers").select("id, telecom"),
            supabase.from("driving_statuses").select("id, status"),
            supabase.from("bank_lists").select("id, bank"),
            supabase.from("clients").select("id, name, phone").eq("agent_id", agent.id)
          ]);

          // 컴포넌트에서 렌더링하기 쉽게 { id, name } 형태로 통일하여 매핑합니다.
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
    // ⭐️ 1. 필수값 유효성 검사 추가
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
      // 1. 유저 및 담당자 인증 로직 (기존과 동일)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("로그인이 필요합니다.");

      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (agentError || !agent) throw new Error("담당자 정보를 찾을 수 없습니다.");

      // ⭐️ 2. 주민등록번호 안전하게 암호화 처리
      let registrationNumber = null;
      if (form.regFront && form.regBack) {
        const rawReg = `${form.regFront}-${form.regBack}`;
        // 서버 액션을 호출하여 브라우저 몰래 암호화된 문자열을 받아옴
        registrationNumber = await encryptRegNumber(rawReg); 
      }

      // 3. 암호화된 registrationNumber를 DB에 Insert
      const parseId = (val: string) => (val === "" ? null : parseInt(val, 10));

      const { error: insertError } = await supabase.from("clients").insert({
        agent_id: agent.id,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        registration_number: registrationNumber, // ⭐️ DB에는 "5b3a4f...:8c2e1..." 같은 외계어만 저장됩니다.
        job: form.job.trim() || null,
        address: form.address.trim() || null,
        // ... (나머지 필드 기존과 동일)
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

  const formatPhoneNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";

    // 서울 지역번호(02) 처리
    if (num.startsWith("02")) {
      if (num.length <= 2) return num;
      if (num.length <= 5) return `${num.slice(0, 2)}-${num.slice(2)}`;
      if (num.length <= 9) return `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
      return `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6, 10)}`;
    }

    // 휴대폰 및 일반 지역번호 처리
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    if (num.length <= 10) return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  return (
    // 모바일에서는 inset-0 으로 꽉 차게, 데스크탑에서는 중앙 정렬
    <div className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center bg-white md:bg-black/60 md:backdrop-blur-sm md:p-4">
      {/* 데스크탑용 배경 닫기 영역 */}
      <div className="hidden md:block absolute inset-0" onClick={handleClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        // 모바일: 둥근 모서리 없음, 높이 100% / 데스크탑: 둥근 모서리, 최대 높이 90vh
        className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl flex flex-col bg-white md:rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
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
                <input 
                  id="client-phone" 
                  type="tel" 
                  maxLength={13} // ⭐️ 최대 길이 제한 (010-0000-0000 기준 13자)
                  value={form.phone} 
                  onChange={(e) => updateField("phone", formatPhoneNumber(e.target.value))} // ⭐️ 포맷 함수 적용
                  placeholder="010-0000-0000" 
                  className={inputClassName} 
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName}>주민등록번호</label>
                <div className="flex items-center gap-2 w-full md:w-1/2">
                  <input type="tel" maxLength={6} placeholder="YYMMDD" value={form.regFront} onChange={(e) => updateField("regFront", e.target.value.replace(/[^0-9]/g, ''))} className={inputClassName} />
                  <span className="text-gray-400 font-bold">-</span>
                  <input type="tel" maxLength={7} placeholder="*******" value={form.regBack} onChange={(e) => updateField("regBack", e.target.value.replace(/[^0-9]/g, ''))} className={inputClassName} />
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

              {/* ⭐️ 수정: 필수 표시(*) 및 기본 선택창 추가 */}
              <div>
                <label className={labelClassName}>계약 상태 <span className="text-red-500">*</span></label>
                <select value={form.contract_status} onChange={(e) => updateField("contract_status", e.target.value)} className={inputClassName}>
                  <option value="">-- 선택 --</option>
                  {statuses.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>

              {/* ⭐️ 수정: 필수 표시(*) 및 기본 선택창 추가 */}
              <div>
                <label className={labelClassName}>가입 경로 <span className="text-red-500">*</span></label>
                <select value={form.client_source} onChange={(e) => updateField("client_source", e.target.value)} className={inputClassName}>
                  <option value="">-- 선택 --</option>
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
                  <option value="">-- 선택 --</option>
                  {telecoms.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>

              <div>
                <label className={labelClassName}>운전 여부</label>
                <select value={form.driving_statuses} onChange={(e) => updateField("driving_statuses", e.target.value)} className={inputClassName}>
                  <option value="">-- 선택 --</option>
                  {drivings.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>

              <div>
                <label className={labelClassName}>주거래 은행</label>
                <select value={form.bank_lists} onChange={(e) => updateField("bank_lists", e.target.value)} className={inputClassName}>
                  <option value="">-- 선택 --</option>
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

            {/* 하단 고정 버튼 영역 (모바일에서 키보드가 올라와도 접근 가능하도록) */}
            <div className="sticky bg-white border-t border-gray-100 pt-4 pb-safe mt-8 flex flex-col-reverse md:flex-row items-center justify-end gap-3 z-10">
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