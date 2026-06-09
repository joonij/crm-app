"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-gray-700";

type FormState = {
  name: string;
  phone: string;
  client_source: string;
  contract_status: string; // ⭐️ 1. 타입에 계약상태 추가
};

const initialFormState: FormState = {
  name: "",
  phone: "",
  client_source: "1", // 기본값 '본인(1)'
  contract_status: "2", // ⭐️ 2. 기본값 '계약진행(2)' 설정
};

type ClientModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function ClientModal({ onClose, onSuccess }: ClientModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    setForm(initialFormState);
    onClose();
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    setIsSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError.message);
        alert("로그인이 필요합니다.");
        return;
      }

      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (agentError || !agent) {
        if (agentError) {
          console.error(agentError.message);
        }
        alert("담당자 프로필이 연결되지 않았습니다.");
        return;
      }

      // ⭐️ 3. clients 테이블에 등록할 때 contract_status 도 같이 포함하여 insert
      const { error: insertError } = await supabase.from("clients").insert({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        client_source: parseInt(form.client_source, 10), 
        contract_status: form.contract_status, // "2" (계약진행)이 기본 저장됩니다.
        agent_id: agent.id,
      });

      if (insertError) {
        console.error(insertError.message);
        alert(`고객 등록 실패: ${insertError.message}`);
        return;
      }

      setForm(initialFormState);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("고객 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-6 py-5">
          <h2
            id="client-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            새 고객 등록
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            고객 이름, 연락처, 가입경로를 입력하세요.
          </p>
        </div>

        <form
          className="space-y-4 px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div>
            <label htmlFor="client-name" className={labelClassName}>
              이름
            </label>
            <input
              id="client-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="고객 이름"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="client-phone" className={labelClassName}>
              연락처
            </label>
            <input
              id="client-phone"
              type="text"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="010-0000-0000"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="client-source" className={labelClassName}>
              가입경로
            </label>
            <select
              id="client-source"
              value={form.client_source}
              onChange={(e) => updateField("client_source", e.target.value)}
              className={inputClassName}
            >
              <option value="1">본인</option>
              <option value="2">지인</option>
              <option value="3">소개</option>
              <option value="4">DB</option>
              <option value="5">돌방</option>
              <option value="6">소모임</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}