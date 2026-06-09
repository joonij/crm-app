"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2 } from "lucide-react";

export default function InsuranceForm({ clientId, onSuccess, onClose }: any) {
  const [formData, setFormData] = useState({
    policy_status: "maintain",
    insurance_company: "",
    product_name: "",
    monthly_premium: "",
    indemnity_generation: "",
  });

  const [coverages, setCoverages] = useState([{ category: "", amount: "" }]);

  const addCoverage = () => setCoverages([...coverages, { category: "", amount: "" }]);

  const handleInsert = async () => {
    // 1. JSONB 형태로 데이터 가공
    const formattedDetails = coverages
      .filter(c => c.category)
      .map(c => ({ category: c.category, amount: Number(c.amount) }));

    // 2. Supabase Insert
    const { error } = await supabase.from("subscription_insurance").insert({
      client_id: clientId,
      policy_status: formData.policy_status,
      insurance_company: formData.insurance_company,
      product_name: formData.product_name,
      monthly_premium: Number(formData.monthly_premium),
      indemnity_generation: formData.indemnity_generation,
      details: formattedDetails,
    });

    if (error) {
      alert(`저장 실패: ${error.message}`);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full">
      <h2 className="text-lg font-bold mb-4">보험 내역 등록</h2>
      
      {/* 상태 선택 */}
      <div className="flex gap-2 mb-4">
        {["maintain", "cancel", "new"].map((status) => (
          <button key={status} onClick={() => setFormData({...formData, policy_status: status})}
            className={`flex-1 py-2 text-sm rounded-lg ${formData.policy_status === status ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            {status === "maintain" ? "유지" : status === "cancel" ? "해지" : "신규"}
          </button>
        ))}
      </div>

      {/* 입력 필드들 */}
      <div className="space-y-3 mb-4">
        <input placeholder="보험사명" className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, insurance_company: e.target.value})} />
        <input placeholder="상품명" className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, product_name: e.target.value})} />
        <input placeholder="월 보험료" type="number" className="w-full p-2 border rounded" onChange={(e) => setFormData({...formData, monthly_premium: e.target.value})} />
      </div>

      {/* 담보 상세 */}
      <div className="space-y-2 mb-6">
        <label className="text-xs font-bold text-gray-500">보장 내역</label>
        {coverages.map((row, index) => (
          <div key={index} className="flex gap-2">
            <input placeholder="담보명" className="flex-1 p-2 border rounded text-sm" onChange={(e) => {
              const newC = [...coverages]; newC[index].category = e.target.value; setCoverages(newC);
            }} />
            <input placeholder="금액" type="number" className="w-24 p-2 border rounded text-sm" onChange={(e) => {
              const newC = [...coverages]; newC[index].amount = e.target.value; setCoverages(newC);
            }} />
          </div>
        ))}
        <button onClick={addCoverage} className="text-sm text-blue-600">+ 담보 추가</button>
      </div>

      <button onClick={handleInsert} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold">등록하기</button>
    </div>
  );
}