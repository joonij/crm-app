"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Trash2, Sliders } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SpecialContract = {
  id: number;
  name: string;
  amount: number;
  // 리모델링을 위해 프론트엔드에서 확장할 필드
  status?: "유지" | "감액" | "삭제";
  remodeled_amount?: number;
};

type InsuranceEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  insuranceId: number;
  insuranceName: string;
  currentPremium: number;
  onSuccess: () => void;
};

export default function InsuranceEditModal({
  isOpen,
  onClose,
  insuranceId,
  insuranceName,
  currentPremium,
  onSuccess,
}: InsuranceEditModalProps) {
  const [remodeledPremium, setRemodeledPremium] = useState<number>(currentPremium);
  const [specials, setSpecials] = useState<SpecialContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 해당 보험의 특약 리스트 불러오기
  useEffect(() => {
    if (!isOpen) return;
    
    async function fetchSpecials() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("insurance_specials")
        .select("*")
        .eq("insurance_id", insuranceId);

      if (error) {
        console.error("특약 로딩 실패:", error.message);
      } else {
        // 기존 데이터에 리모델링 기본값(유지) 주입
        const extendedData = (data ?? []).map((item) => ({
          ...item,
          status: item.status || "유지",
          remodeled_amount: item.remodeled_amount !== undefined ? item.remodeled_amount : item.amount,
        }));
        setSpecials(extendedData);
      }
      setIsLoading(false);
    }

    void fetchSpecials();
  }, [isOpen, insuranceId]);

  // 2. 특정 특약의 상태 변경 처리 (유지 / 감액 / 삭제)
  const handleSpecialsStatusChange = (id: number, status: "유지" | "감액" | "삭제", amountValue?: number) => {
    setSpecials((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        
        let finalAmount = item.amount;
        if (status === "삭제") finalAmount = 0;
        if (status === "감액" && amountValue !== undefined) finalAmount = amountValue;

        return {
          ...item,
          status,
          remodeled_amount: finalAmount,
        };
      })
    );
  };

  // 3. 저장 로직 (보험 테이블 및 특약 테이블 동시 업데이트)
  const handleSave = async () => {
    try {
      // 3-1. 보험 테이블의 '조정 후 보험료' 업데이트
      const { error: insError } = await supabase
        .from("insurances")
        .update({ remodeled_premium: remodeledPremium })
        .eq("id", insuranceId);

      if (insError) throw insError;

      // 3-2. 특약별 변경사항들을 순회하며 업데이트
      for (const special of specials) {
        const { error: spError } = await supabase
          .from("insurance_specials")
          .update({
            status: special.status,
            remodeled_amount: special.remodeled_amount,
          })
          .eq("id", special.id);

        if (spError) throw spError;
      }

      alert("보장 조정 및 리모델링 내용이 저장되었습니다.");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("리모델링 저장 에러:", err);
      alert(`저장에 실패했습니다: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              보장 조정 및 리모델링
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{insuranceName} 증권 조정</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 콘텐츠 */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 보험료 조정 안내 구역 */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              리모델링 후 보험료 설정
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">기존 보험료</label>
                <div className="w-full bg-gray-100 px-3 py-2 rounded-lg text-sm font-bold text-gray-600">
                  {currentPremium.toLocaleString()} 원
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-blue-700 block mb-1">조정 후 보험료 (수기 입력)</label>
                <input
                  type="number"
                  className="w-full bg-white border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  value={remodeledPremium}
                  onChange={(e) => setRemodeledPremium(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* 특약 리스트 조정 구역 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900">특약별 상세 조정</h4>
            
            {isLoading ? (
              <div className="text-center py-8 text-sm text-gray-400">특약 정보를 불러오는 중...</div>
            ) : specials.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">등록된 특약이 없습니다.</div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                {specials.map((special) => (
                  <div key={special.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
                    {/* 특약 정보 */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold ${special.status === "삭제" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        {special.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">기존 가입금액: {special.amount.toLocaleString()}만 원</p>
                    </div>

                    {/* 제안 컨트롤러 */}
                    <div className="flex items-center gap-3 shrink-0">
                      {special.status === "감액" && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 text-xs font-bold border border-orange-200 rounded text-orange-700 text-right outline-none focus:border-orange-500"
                            value={special.remodeled_amount || 0}
                            onChange={(e) => handleSpecialsStatusChange(special.id, "감액", Number(e.target.value))}
                          />
                          <span className="text-xs font-bold text-gray-500">만 원</span>
                        </div>
                      )}

                      {/* 상태 조절 버튼 그룹 */}
                      <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => handleSpecialsStatusChange(special.id, "유지")}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${special.status === "유지" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          유지
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpecialsStatusChange(special.id, "감액", special.remodeled_amount === special.amount ? Math.round(special.amount / 2) : special.remodeled_amount)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${special.status === "감액" ? "bg-orange-50 text-orange-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          감액
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpecialsStatusChange(special.id, "삭제")}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-0.5 ${special.status === "삭제" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-400 hover:text-red-500"}`}
                        >
                          <Trash2 className="w-3 h-3" /> 삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 푸터 버튼 */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-100 bg-white">
            취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-800 flex items-center gap-1.5 shadow-sm">
            <Save className="w-4 h-4" /> 리모델링 반영
          </button>
        </div>
      </div>
    </div>
  );
}