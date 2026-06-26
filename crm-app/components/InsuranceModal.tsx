"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, X, Plus } from "lucide-react";

// 재사용할 input 스타일
const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type CoverageDetail = {
  name: string;
  amount: string;
};

// ⭐️ 기본 담보 세팅 (대표님이 작성하신 내역 그대로 반영)
const defaultDetails: CoverageDetail[] = [
  { name: "일반암 진단금", amount: "" },
  { name: "유사암 진단금", amount: "" },
  { name: "항암방사선치료비", amount: "" },
  { name: "항암약물물치료비", amount: "" },
  { name: "암수술비", amount: "" },
  { name: "뇌혈관 진단금", amount: "" },
  { name: "허혈성 진단금", amount: "" },
  { name: "상해수술비", amount: "" },
  { name: "1종 상해수술비", amount: "" },
  { name: "2종 상해수술비", amount: "" },
  { name: "3종 상해수술비", amount: "" },
  { name: "4종 상해수술비", amount: "" },
  { name: "5종 상해수술비", amount: "" },
  { name: "질병수술비", amount: "" },
  { name: "1종 질병수술비", amount: "" },
  { name: "2종 질병수술비", amount: "" },
  { name: "3종 질병수술비", amount: "" },
  { name: "4종 질병수술비", amount: "" },
  { name: "5종 질병수술비", amount: "" },
  { name: "상해입원비", amount: "" },
  { name: "질병입원비", amount: "" },
];

export default function InsuranceModal({
  clientId,
  onClose,
  onSuccess,
}: {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  // ⭐️ policy_status 컬럼 추가 반영
  const [covForm, setCovForm] = useState({
    policy_status: "maintain", // 기본값: 유지
    company: "",
    product: "",
    premium: "",
    indemnityGen: "",
  });

  const [covDetails, setCovDetails] = useState<CoverageDetail[]>(defaultDetails);
  const [isSaving, setIsSaving] = useState(false);

  // 세부 항목 업데이트
  const updateCovDetail = (index: number, field: keyof CoverageDetail, value: string) => {
    const newDetails = [...covDetails];
    newDetails[index][field] = value;
    setCovDetails(newDetails);
  };

  // 세부 항목 추가
  const addCovDetail = () => {
    setCovDetails([...covDetails, { name: "", amount: "" }]);
  };

  // 세부 항목 삭제
  const removeCovDetail = (index: number) => {
    const newDetails = covDetails.filter((_, i) => i !== index);
    setCovDetails(newDetails);
  };

  // 저장 로직
  const handleSaveCoverage = async () => {
    if (!covForm.company.trim() || !covForm.product.trim() || !covForm.premium) {
      alert("보험사, 상품명, 월 보험료를 모두 입력해주세요.");
      return;
    }
    setIsSaving(true);

    // ⭐️ 수정된 부분: 이름과 금액이 '모두' 있는 항목만 걸러냅니다 (|| -> && 로 변경)
    const validDetails = covDetails.filter(
      (d) => d.name.trim() !== "" && d.amount.trim() !== ""
    );

    try {
      const { error } = await supabase.from("subscription_insurance").insert([
        {
          client_id: parseInt(clientId, 10),
          policy_status: covForm.policy_status,
          insurance_company: covForm.company.trim(),
          product_name: covForm.product.trim(),
          monthly_premium: parseInt(covForm.premium, 10),
          indemnity_generation: covForm.indemnityGen || null,
          details: validDetails.length > 0 ? validDetails : null, // 빈 배열이면 null로 저장
        },
      ]);

      if (error) throw error;

      onSuccess(); 
      onClose(); 
    } catch (error: any) {
      alert(`저장 실패 원인: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 md:p-4 transition-opacity"
      onClick={onClose} // 바깥 영역 클릭 시 닫기
    >
      <div 
        className="bg-white w-full max-w-4xl flex flex-col max-h-[90vh] md:max-h-[85vh] rounded-t-2xl md:rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95"
        onClick={(e) => e.stopPropagation()} // 내부 클릭은 전파 방지
      >
        <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl md:rounded-t-xl shrink-0">
          <h3 className="font-bold text-base md:text-lg text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" /> 새 보장 내역 추가
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-6 h-6 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          
          {/* ⭐️ 1. 보험 상태 선택 (유지/해지/신규) */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">리모델링 상태 분류</p>
            <div className="flex gap-2">
              {[
                { id: "maintain", label: "유지하는 보험", color: "bg-blue-600 border-blue-600" },
                { id: "cancel", label: "해지할 보험", color: "bg-red-600 border-red-600" },
                { id: "new", label: "새로 제안할 보험", color: "bg-green-600 border-green-600" },
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => setCovForm({ ...covForm, policy_status: status.id })}
                  className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg border transition-colors ${
                    covForm.policy_status === status.id
                      ? `${status.color} text-white`
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 기본 정보 */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">기본 정보</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="보험사 (예: 삼성화재)"
                className={inputClassName}
                value={covForm.company}
                onChange={(e) => setCovForm({ ...covForm, company: e.target.value })}
              />
              <input
                type="text"
                placeholder="상품명"
                className={inputClassName}
                value={covForm.product}
                onChange={(e) => setCovForm({ ...covForm, product: e.target.value })}
              />
              <input
                type="number"
                placeholder="월 보험료 (원)"
                className={inputClassName}
                value={covForm.premium}
                onChange={(e) => setCovForm({ ...covForm, premium: e.target.value })}
              />

              <select
                className={`${inputClassName} cursor-pointer`}
                value={covForm.indemnityGen}
                onChange={(e) => setCovForm({ ...covForm, indemnityGen: e.target.value })}
              >
                <option value="">실손 세대 선택 (해당 없는 경우 비워둠)</option>
                <option value="1세대 실손">1세대 실손 (2009년 9월 이전)</option>
                <option value="2세대 실손">2세대 실손 (2009년 10월 이후)</option>
                <option value="3세대 실손">3세대 실손 (2017년 4월 이후)</option>
                <option value="4세대 실손">4세대 실손 (2021년 7월 이후)</option>
                <option value="5세대 실손">5세대 실손 (2026년 5월 이후)</option>
              </select>
            </div>
          </div>

          {/* 3. 세부 보장 항목 */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">세부 보장 항목 (선택)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {covDetails.map((detail, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="항목명"
                    className={`${inputClassName} flex-1 min-w-0`}
                    value={detail.name}
                    onChange={(e) => updateCovDetail(index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="가입 금액"
                    className={`${inputClassName} flex-1 min-w-0`}
                    value={detail.amount}
                    onChange={(e) => updateCovDetail(index, "amount", e.target.value)}
                  />
                  <button
                    onClick={() => removeCovDetail(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    title="항목 삭제"
                  >
                    <X className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addCovDetail}
              className="w-full py-3 md:py-2.5 flex items-center justify-center gap-1 text-sm font-medium text-blue-600 border border-dashed border-blue-200 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors mt-4"
            >
              <Plus className="w-4 h-4" /> 빈 항목 한 줄 추가
            </button>
          </div>
        </div>

        <div className="p-4 md:p-5 border-t border-gray-100 bg-gray-50 md:rounded-b-xl flex justify-end gap-2 shrink-0 pb-safe">
          <button
            onClick={onClose}
            className="flex-1 md:flex-none px-4 py-3 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSaveCoverage}
            disabled={isSaving}
            className="flex-1 md:flex-none px-6 py-3 md:py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "보장 내역 완전히 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}