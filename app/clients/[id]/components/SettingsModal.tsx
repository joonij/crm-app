"use client";

import { useState } from "react";
import { X, Settings2, Star, Search, Check, AlertCircle, Plus, Trash2, CheckCircle2 } from "lucide-react";
// import { COVERAGE_OPTIONS } from "@/lib/coverageMapper";
import { CHART_CONFIG } from "@/app/clients/[id]/analysis/page";

// ⭐️ 데이터 상수 (기존과 동일)
const CIRCULATORY_CODES = [
  {
    group: "순환계질환 [뇌, 심장, 혈관]",
    items: [
      { id: "I00~I02", name: "급성 류마티스열", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I05~I09", name: "만성 류마티스 심장질환", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I10~I15", name: "고혈압성 질환", keywords: [] },
      { id: "I20", name: "협심증", keywords: ["특정순환계", "허혈성심장", "심혈관질환", "순환계질환통합", "순환계통합", "순환계질환", "순환계"], highlight: true },
      { id: "I21~I23", name: "급성 심근경색증", keywords: ["특정순환계", "급성심근경색", "허혈성심장", "심혈관질환", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I24~I25", name: "기타 허혈성 심장질환", keywords: ["특정순환계", "허혈성심장", "심혈관질환", "순환계질환통합", "순환계통합", "순환계질환", "순환계"], highlight: true },
      { id: "I26~I28", name: "폐성 심장질환", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I30~I33", name: "심장막염 및 심내막염", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I34~I37", name: "비류마티스성 판장애 및 폐동맥판장애", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I38", name: "상세불명 판막의 심내막염", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I39", name: "달리 분류된 질환에서의 심내막염 및 심장판막장애", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I40~I41", name: "심근염", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I42~I43", name: "심근병증 진단비", keywords: ["특정순환계", "심근병증", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I44~I45", name: "방실 및 좌각차단, 전도장애", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I46", name: "심장정지", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I47~I48, ", name: "부정맥", keywords: ["특정순환계", "부정맥", "순환계질환통합", "순환계통합", "순환계질환", "순환계"], highlight: true },
      { id: "I49", name: "기타 부정맥", keywords: ["특정순환계", "기타 부정맥", "순환계질환통합", "순환계통합", "순환계질환", "순환계"], highlight: true },
      { id: "I50", name: "심부전", keywords: ["특정순환계", "심부전", "순환계질환통합", "순환계통합", "순환계질환", "순환계"], highlight: true },
      { id: "I51", name: "심장병의 불명확한 기록 및 합병증", keywords: ["순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I52", name: "달리 분류된 질환에서의 기타 심장장애", keywords: ["순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I60~I62", name: "지주막하출혈, 뇌내출혈 등 (뇌출혈)", keywords: ["특정순환계", "뇌출혈", "뇌졸중", "뇌혈관", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I63", name: "뇌경색증", keywords: ["특정순환계", "뇌졸중", "뇌혈관", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I64", name: "출혈/경색으로 명시되지 않은 뇌졸중 진단비", keywords: ["특정순환계", "뇌혈관", "순환계질환통합", "순환계통합", "순환계질환", "순환계"], highlight: true },
      { id: "I65~I66", name: "대뇌동맥 폐쇄 및 협착", keywords: ["특정순환계", "뇌졸중", "뇌혈관", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I67~I69", name: "기타 뇌혈관 질환", keywords: ["특정순환계", "뇌혈관", "순환계질환통합", "순환계통합", "순환계질환", "순환계"], highlight: true },
      { id: "I70", name: "죽상경화증", keywords: ["순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I71", name: "대동맥동맥류 및 박리", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I72", name: "기타 동맥류 및 박리", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I73", name: "기타 말초혈관질환", keywords: [] },
      { id: "I74", name: "동맥색전증 및 혈전증", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I77", name: "동맥 및 세동맥의 기타 장애", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I78~I79", name: "동맥, 세동맥 및 모세혈관 장애", keywords: [] },
      { id: "I80", name: "정맥염 및 혈전정맥염", keywords: [] },
      { id: "I81", name: "문맥혈전증", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I82~I83", name: "혈전증 및 하지정맥류", keywords: [] },
      { id: "I85", name: "식도정맥류", keywords: ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"] },
      { id: "I86~I89", name: "림프관 및 림프절 질환", keywords: [] },
      { id: "I95~I99", name: "순환계통의 기타 질환", keywords: [] },
    ]
  }
];

const CANCER_CODES = [
  {
    group: "악성 신생물 [일반암, 제자리암, 경계성종양]",
    items: [
      { id: "C00~C14", name: "입술, 구강 및 인두의 악성 신생물", keywords: ["일반암 진단비", "통합암 진단비"] },
      { id: "C15", name: "식도 악성 신생물 (위암, 대장암 등)", keywords: ["일반암 진단비", "고액암 진단비", "통합암 진단비"]},
      { id: "C16~C22", name: "소화기관 악성 신생물 (위암, 대장암 등)", keywords: ["일반암 진단비", "통합암 진단비"]},
      { id: "C23~C25", name: "담낭, 담도, 췌장 악성 신생물 (위암, 대장암 등)", keywords: ["일반암 진단비", "고액암 진단비", "통합암 진단비"]},
      { id: "C30~C39", name: "호흡기 및 흉곽내기관 악성 신생물 (폐암 등)", keywords: ["일반암 진단비", "통합암 진단비"]},
      { id: "C40~C41", name: "뼈 악성 신생물", keywords: ["일반암 진단비",  "고액암 진단비", "통합암 진단비"] },
      { id: "C43", name: "관절연골, 흑색종 등", keywords: ["일반암 진단비",  "통합암 진단비"] },
      { id: "C44", name: "기타 피부의 악성 신생물", keywords: ["유사암 진단비"], highlight: true },
      { id: "C45~C49", name: "중피성 및 연조직의 악성 신생물", keywords: ["일반암 진단비", "통합암 진단비"] },
      { id: "C50", name: "유방의 악성 신생물", keywords: ["일반암 진단비", "소액암 진단비", "유방암 진단비", "통합암 진단비"], highlight: true },
      { id: "C51~C68", name: "생식기관 및 요로 악성 신생물 (자궁, 전립선 등)", keywords: ["일반암 진단비", "소액암 진단비", "통합암 진단비"], highlight: true },
      { id: "C69", name: "눈 악성 신생물", keywords: ["일반암 진단비", "소액암 진단비", "통합암 진단비"] },
      { id: "C70~C72", name: "뇌 및 중추신경계통의 악성 신생물", keywords: ["일반암 진단비", "소액암 진단비", "고액암 진단비", "통합암 진단비"] },
      { id: "C73", name: "갑상선의 악성 신생물", keywords: ["유사암 진단비"], highlight: true },
      { id: "C81~C90", name: "림프, 조혈 조직 악성 신생물", keywords: ["일반암 진단비", "통합암 진단비"]},
      { id: "C91~C96", name: "혈액 악성 신생물(백혈병)", keywords: ["일반암 진단비", "고액암 진단비", "통합암 진단비"]},
      { id: "D00~D09", name: "제자리암 (0기암 전체)", keywords: ["유사암 진단비"], highlight: true },
      { id: "D37~D48", name: "행동양식 불명 및 미상의 신생물 (경계성 종양)", keywords: ["유사암 진단비"], highlight: true },
    ]
  }
];

const CATEGORY_ORDER = [
  "사망 보장", "후유장해 보장", "암 보장 (진단/치료/수술)", 
  "뇌 질환", "심장 질환", "순환계 질환", 
  "일반 수술비", "종수술비", "입원 및 응급실", "상해·골절·화상 및 기타",
  "운전자 비용", "장기요양 및 간병", "실손의료비"
];

const getCategory = (name: string) => {
  if (name.includes("사망")) return "사망 보장";
  if (name.includes("후유장해")) return "후유장해 보장";
  if (name.includes("암") || name.includes("항암") || name.includes("다빈치") || name.includes("로봇")) return "암 보장 (진단/치료/수술)";
  if (name.includes("뇌")) return "뇌 질환";
  if (name.includes("심장") || name.includes("심근") || name.includes("허혈") || name.includes("부정맥") || name.includes("심부전") || name.includes("판막")) return "심장 질환";
  if (name.includes("순환계") || name.includes("혈전")) return "순환계 질환";
  if (name.includes("1종") || name.includes("2종") || name.includes("3종") || name.includes("4종") || name.includes("5종")) return "종수술비";
  if (name.includes("수술")) return "일반 수술비";
  if ((name.includes("입원") && !name.includes("실손")) || name.includes("응급") || name.includes("중환자")) return "입원 및 응급실";
  if (name.includes("요양") || name.includes("인지") || name.includes("간병")) return "장기요양 및 간병";
  if (name.includes("자동차") || name.includes("교통") || name.includes("변호사") || name.includes("벌금")) return "운전자 비용";
  if (name.includes("실손")) return "실손의료비";
  return "상해·골절·화상 및 기타";
};

const formatDetailAmount = (val: string | number) => {
  if (!val) return "0";
  const raw = String(val).replace(/,/g, "");
  return raw.replace(/\d+/g, (match) => Number(match).toLocaleString());
};

export default function SettingsModal({
  isOpen, onClose, onSave, analysisData, calculateCodeCoverage,
  initialKcdOverrides, initialVisibleCoverages, initialCustomCoverages,
  initialCoverageOverrides, initialIncludeSanjeong,
  initialRadarTargets,
  initialRadarRates,
  initialPensionOverrides
}: any) {
  
  const [settingsTab, setSettingsTab] = useState<'kcd' | 'coverage' | 'radar' | 'pension'>('radar');
  const [tempKcdOverrides, setTempKcdOverrides] = useState(initialKcdOverrides || {});
  const [tempVisibleCoverages, setTempVisibleCoverages] = useState(initialVisibleCoverages || []);
  const [tempCustomCoverages, setTempCustomCoverages] = useState(initialCustomCoverages || []);
  const [tempCoverageOverrides, setTempCoverageOverrides] = useState(initialCoverageOverrides || {});
  const [tempRadarTargets, setTempRadarTargets] = useState<Record<string, number>>(initialRadarTargets || {});
  const [tempRadarRates, setTempRadarRates] = useState<Record<string, { before?: number, after?: number }>>(initialRadarRates || {});
  const [tempPensionOverrides, setTempPensionOverrides] = useState<Record<string, number>>(initialPensionOverrides || {}); 
  const [tempIncludeSanjeong, setTempIncludeSanjeong] = useState({
      brain: initialIncludeSanjeong?.brain || false,
      heart: initialIncludeSanjeong?.heart || false,
      circAll: initialIncludeSanjeong?.circAll || false,
      circExcl: initialIncludeSanjeong?.circExcl || false
  });
  const [searchCovItem, setSearchCovItem] = useState("");
  const [customInputs, setCustomInputs] = useState<Record<string, { name: string, before: string, after: string }>>({});

  // ⭐️ 상태 추가: 저장 중 및 저장 완료 상태
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTempKcdOverride = (id: string, field: 'before' | 'after' | 'highlight', value: any) => {
    setTempKcdOverrides((prev: any) => {
      const currentOverride = prev[id] || {};
      const updatedOverride = { ...currentOverride, [field]: value };
      if (value === undefined || value === "") delete updatedOverride[field];
      if (Object.keys(updatedOverride).length === 0) {
        const newObj = { ...prev };
        delete newObj[id];
        return newObj;
      }
      return { ...prev, [id]: updatedOverride };
    });
  };

  const handleTempCoverageOverride = (name: string, field: 'before' | 'after', value: any) => {
    setTempCoverageOverrides((prev: any) => {
      const currentOverride = prev[name] || {};
      const updatedOverride = { ...currentOverride, [field]: value };
      if (value === undefined || value === "") delete updatedOverride[field];
      if (Object.keys(updatedOverride).length === 0) {
        const newObj = { ...prev };
        delete newObj[name];
        return newObj;
      }
      return { ...prev, [name]: updatedOverride };
    });
  };

  const toggleVisibleCoverage = (name: string) => {
    setTempVisibleCoverages((prev: any[]) => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleCustomInputChange = (cat: string, field: 'name' | 'before' | 'after', value: string) => {
    setCustomInputs((prev: any) => ({
      ...prev,
      [cat]: { ...(prev[cat] || { name: "", before: "", after: "" }), [field]: value }
    }));
  };

  const handleAddCustomCoverage = (cat: string) => {
    const inputs = customInputs[cat];
    if(!inputs || !inputs.name.trim()) return alert("항목명을 입력해주세요.");
    const newCov = {
       id: Date.now().toString(),
       name: inputs.name.trim(),
       before: parseInt(inputs.before.replace(/[^0-9]/g, '')) || 0,
       after: parseInt(inputs.after.replace(/[^0-9]/g, '')) || 0,
       category: cat
    };
    setTempCustomCoverages([...tempCustomCoverages, newCov]);
    setCustomInputs(prev => ({ ...prev, [cat]: { name: "", before: "", after: "" } }));
  };

  const handleDeleteCustomCoverage = (id: string) => {
    setTempCustomCoverages((prev: any[]) => prev.filter(c => c.id !== id));
  };

  // ⭐️ 저장 핸들러 업데이트 (모달이 스스로 닫히지 않고 상태만 변경)
  const handleSave = async () => {
    try {
      await onSave({
        kcdOverrides: tempKcdOverrides,
        visibleCoverages: tempVisibleCoverages,
        customCoverages: tempCustomCoverages,
        coverageOverrides: tempCoverageOverrides,
        includeSanjeong: tempIncludeSanjeong,
        radarTargets: tempRadarTargets,
        radarRates: tempRadarRates,
        pensionOverrides: tempPensionOverrides 
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTempRadarTarget = (label: string, value: string) => {
    const num = value === "" ? undefined : parseInt(value);
    setTempRadarTargets((prev: any) => {
      const next = { ...prev, [label]: num };
      if (num === undefined) delete next[label];
      return next;
    });
  };

  const handleTempRadarRate = (label: string, field: 'before' | 'after', value: string) => {
    const num = value === "" ? undefined : parseInt(value);
    setTempRadarRates((prev: any) => {
      const current = prev[label] || {};
      const next = { ...current, [field]: num };
      if (next.before === undefined && next.after === undefined) {
         const newObj = { ...prev };
         delete newObj[label];
         return newObj;
      }
      return { ...prev, [label]: next };
    });
  };

  const handleTempPensionOverride = (key: string, value: string) => {
    const num = value === "" ? undefined : parseInt(value);
    setTempPensionOverrides((prev: any) => {
      const next = { ...prev, [key]: num };
      if (num === undefined) delete next[key];
      return next;
    });
  };

  return (
    <>
      <div className="lg:hidden fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="fixed inset-x-0 bottom-0 lg:inset-auto lg:top-0 lg:right-0 lg:h-full z-[100] w-full lg:w-[400px] lg:shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.3)] lg:border-l border-slate-200 bg-white flex flex-col transition-transform transform rounded-t-3xl lg:rounded-none overflow-hidden max-h-[90vh] lg:max-h-full animate-in slide-in-from-bottom lg:slide-in-from-right duration-300 ease-out">
        
        {/* 헤더 */}
        <div className="bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">분석표 세부 설정</h2>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">수동 조정 내역은 현재 고객에게만 저장됩니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex px-2 bg-white border-b border-slate-100 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSettingsTab('radar')}
            className={`cursor-pointer px-3 py-3 text-[13px] font-black transition-colors relative whitespace-nowrap ${settingsTab === 'radar' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            차트 목표액
            {settingsTab === 'radar' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md" />}
          </button>
          
          <button
            onClick={() => setSettingsTab('pension')}
            className={`cursor-pointer px-3 py-3 text-[13px] font-black transition-colors relative whitespace-nowrap ${settingsTab === 'pension' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            노후 연금
            {settingsTab === 'pension' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md" />}
          </button>

          <button
            onClick={() => setSettingsTab('coverage')}
            className={`cursor-pointer px-3 py-3 text-[13px] font-black transition-colors relative whitespace-nowrap ${settingsTab === 'coverage' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            보장표 항목
            {settingsTab === 'coverage' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md" />}
          </button>
          <button
            onClick={() => setSettingsTab('kcd')}
            className={`cursor-pointer px-3 py-3 text-[13px] font-black transition-colors relative whitespace-nowrap ${settingsTab === 'kcd' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            질환진단비(KCD)
            {settingsTab === 'kcd' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md" />}
          </button>
        </div>

        {/* 메인 컨텐츠 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/50">
          
          {/* 1. KCD 수동 조정 탭 */}
          {settingsTab === 'kcd' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <h4 className="font-bold text-slate-800 text-[13px] mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  산정특례 / 특정순환계 병합
                </h4>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" className="cursor-pointer w-4 h-4 rounded text-blue-600 border-slate-300"
                           checked={tempIncludeSanjeong.brain}
                           onChange={(e) => setTempIncludeSanjeong((p: any) => ({...p, brain: e.target.checked}))} />
                    <span className="text-xs font-bold text-slate-700">뇌혈관 산정특례 합산</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" className="cursor-pointer w-4 h-4 rounded text-blue-600 border-slate-300"
                           checked={tempIncludeSanjeong.heart}
                           onChange={(e) => setTempIncludeSanjeong((p: any) => ({...p, heart: e.target.checked}))} />
                    <span className="text-xs font-bold text-slate-700">심혈관 산정특례 합산</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" className="cursor-pointer w-4 h-4 rounded text-emerald-600 border-slate-300"
                           checked={tempIncludeSanjeong.circAll}
                           onChange={(e) => setTempIncludeSanjeong((p: any) => ({...p, circAll: e.target.checked}))} />
                    <span className="text-xs font-bold text-slate-700">특정순환계 합산</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" className="cursor-pointer w-4 h-4 rounded text-emerald-600 border-slate-300"
                           checked={tempIncludeSanjeong.circExcl}
                           onChange={(e) => setTempIncludeSanjeong((p: any) => ({...p, circExcl: e.target.checked}))} />
                    <span className="text-xs font-bold text-slate-700">특정순환계(뇌/심 제외) 합산</span>
                  </label>
                </div>
              </div>

              {[...CIRCULATORY_CODES, ...CANCER_CODES].map((group, groupIdx) => (
                <div key={groupIdx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200">
                    <h3 className="font-bold text-xs text-slate-700">{group.group}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {group.items.map((item, itemIdx) => {
                      const override = tempKcdOverrides[item.id] || {};
                      const isHighlight = override.highlight !== undefined ? override.highlight : item.highlight;
                      
                      const calcBefore = calculateCodeCoverage(item.keywords, 'before', item.id, tempIncludeSanjeong, tempCoverageOverrides, tempCustomCoverages);
                      const calcAfter = calculateCodeCoverage(item.keywords, 'after', item.id, tempIncludeSanjeong, tempCoverageOverrides, tempCustomCoverages);
                      
                      return (
                        <div key={itemIdx} className="p-3 hover:bg-slate-50/50 transition-colors flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div className="pr-2">
                              <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{item.id}</p>
                            </div>
                            <button
                              onClick={() => handleTempKcdOverride(item.id, 'highlight', !isHighlight)}
                              className={`cursor-pointer p-1 rounded transition-colors shrink-0 ${isHighlight ? 'text-amber-500' : 'text-slate-300'}`}
                            >
                              <Star className={`w-4 h-4 ${isHighlight ? 'fill-amber-500' : ''}`} />
                            </button>
                          </div>
                          
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">기존</span>
                              <input
                                type="number"
                                placeholder={calcBefore.toString()}
                                value={override.before !== undefined ? override.before : ""}
                                onChange={(e) => handleTempKcdOverride(item.id, 'before', e.target.value === "" ? undefined : parseInt(e.target.value))}
                                className={`w-full text-right pr-6 pl-8 py-1 rounded-md border text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${override.before !== undefined ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50/50 text-slate-700'}`}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">만</span>
                            </div>
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400">권장</span>
                              <input
                                type="number"
                                placeholder={calcAfter.toString()}
                                value={override.after !== undefined ? override.after : ""}
                                onChange={(e) => handleTempKcdOverride(item.id, 'after', e.target.value === "" ? undefined : parseInt(e.target.value))}
                                className={`w-full text-right pr-6 pl-8 py-1 rounded-md border text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${override.after !== undefined ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-blue-200 bg-blue-50/30 text-blue-700'}`}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 font-bold pointer-events-none">만</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. 보장표 항목 설정 탭 */}
          {settingsTab === 'coverage' && (
            <div className="space-y-4">
              <div className="sticky -top-5 z-20 bg-slate-50/50 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 -mt-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="보장 항목 검색..."
                    value={searchCovItem}
                    onChange={(e) => setSearchCovItem(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-xs font-bold outline-none shadow-sm"
                  />
                </div>
              </div>

              {CATEGORY_ORDER.map(cat => {
                const standardItems = analysisData.coverages.filter((c: any) => getCategory(c.name) === cat);
                const customItems = tempCustomCoverages.filter((c: any) => c.category === cat);
                const allItems = [...standardItems, ...customItems].filter(item => item.name.toLowerCase().includes(searchCovItem.toLowerCase()));
                
                if (allItems.length === 0 && !cat.toLowerCase().includes(searchCovItem.toLowerCase())) return null;

                return (
                  <div key={cat} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200">
                      <h3 className="font-black text-xs text-slate-700">{cat}</h3>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                      {allItems.map((item: any, idx: number) => {
                        const isCustom = !!item.id;
                        const isVisible = tempVisibleCoverages.includes(item.name) || isCustom;
                        const override = tempCoverageOverrides[item.name] || {};

                        return (
                          <div key={isCustom ? item.id : idx} className={`p-3 transition-colors flex flex-col gap-2 ${isVisible ? 'hover:bg-slate-50/50' : 'bg-slate-50 opacity-60'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2 pr-2">
                                {!isCustom && (
                                  <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={() => toggleVisibleCoverage(item.name)}
                                    className="cursor-pointer mt-0.5 w-3.5 h-3.5 rounded text-blue-600 border-slate-300 shrink-0"
                                  />
                                )}
                                <p className={`font-bold text-[12px] leading-tight ${isVisible ? 'text-slate-800' : 'text-slate-500'}`}>
                                  {isCustom && <span className="text-orange-500 mr-0.5">★</span>}
                                  {item.name}
                                </p>
                              </div>
                              {isCustom && (
                                <button onClick={() => handleDeleteCustomCoverage(item.id)} className="cursor-pointer p-1 text-slate-300 hover:text-red-500 bg-white rounded-md shrink-0">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">기존</span>
                                {isVisible && !isCustom ? (
                                  <input
                                    type="number"
                                    placeholder={item.before.toString()}
                                    value={override.before !== undefined ? override.before : ""}
                                    onChange={(e) => handleTempCoverageOverride(item.name, 'before', e.target.value === "" ? undefined : parseInt(e.target.value))}
                                    className={`w-full text-right pr-6 pl-8 py-1 rounded-md border text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${override.before !== undefined ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700'}`}
                                  />
                                ) : (
                                  <div className="w-full text-right pr-6 pl-8 py-1 rounded-md border border-transparent bg-slate-50 text-xs font-bold text-slate-500">{item.before}</div>
                                )}
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">만</span>
                              </div>

                              <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400">권장</span>
                                {isVisible && !isCustom ? (
                                  <input
                                    type="number"
                                    placeholder={item.after.toString()}
                                    value={override.after !== undefined ? override.after : ""}
                                    onChange={(e) => handleTempCoverageOverride(item.name, 'after', e.target.value === "" ? undefined : parseInt(e.target.value))}
                                    className={`w-full text-right pr-6 pl-8 py-1 rounded-md border text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${override.after !== undefined ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-blue-200 bg-blue-50/30 text-blue-700'}`}
                                  />
                                ) : (
                                  <div className="w-full text-right pr-6 pl-8 py-1 rounded-md border border-transparent bg-blue-50/30 text-xs font-bold text-blue-600">{item.after}</div>
                                )}
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 font-bold pointer-events-none">만</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-2.5 bg-blue-50/30 border-t border-slate-200 flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="새 항목명 입력..."
                        value={customInputs[cat]?.name || ""}
                        onChange={(e) => handleCustomInputChange(cat, 'name', e.target.value)}
                        className="w-full py-1.5 px-3 rounded-md border border-slate-200 text-xs font-bold outline-none focus:border-blue-400"
                      />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="기존액"
                            value={customInputs[cat]?.before || ""}
                            onChange={(e) => handleCustomInputChange(cat, 'before', e.target.value)}
                            className="w-full text-right pr-5 py-1.5 pl-2 rounded-md border border-slate-200 text-xs font-bold outline-none focus:border-blue-400"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">만</span>
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="권장액"
                            value={customInputs[cat]?.after || ""}
                            onChange={(e) => handleCustomInputChange(cat, 'after', e.target.value)}
                            className="w-full text-right pr-5 py-1.5 pl-2 rounded-md border border-slate-200 text-xs font-bold outline-none focus:border-blue-400"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">만</span>
                        </div>
                        <button
                          onClick={() => handleAddCustomCoverage(cat)}
                          className="cursor-pointer p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. 차트 목표액 설정 탭 */}
          {settingsTab === 'radar' && (
            <div className="space-y-4">
              {CHART_CONFIG.map((cat, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-black text-xs text-slate-700">{cat.title} 목표 설정</h3>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="p-3 hover:bg-slate-50/50 transition-colors flex flex-col gap-2">
                        <p className="font-bold text-slate-800 text-xs">{item.label}</p>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-slate-400">100% 목표금액</span>
                            <div className="relative">
                              <input
                                type="number"
                                placeholder={item.defaultTarget.toString()}
                                value={tempRadarTargets[item.label] !== undefined ? tempRadarTargets[item.label] : ""}
                                onChange={(e) => handleTempRadarTarget(item.label, e.target.value)}
                                className={`w-full text-right pr-5 py-1 px-2 rounded border text-xs font-bold outline-none transition-colors ${tempRadarTargets[item.label] !== undefined ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700'}`}
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-slate-400">기존 달성율(강제)</span>
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="자동계산"
                                value={tempRadarRates[item.label]?.before !== undefined ? tempRadarRates[item.label].before : ""}
                                onChange={(e) => handleTempRadarRate(item.label, 'before', e.target.value)}
                                className={`w-full text-right pr-5 py-1 px-2 rounded border text-xs font-bold outline-none transition-colors ${tempRadarRates[item.label]?.before !== undefined ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                              />
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-blue-400">권장 달성율(강제)</span>
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="자동계산"
                                value={tempRadarRates[item.label]?.after !== undefined ? tempRadarRates[item.label].after : ""}
                                onChange={(e) => handleTempRadarRate(item.label, 'after', e.target.value)}
                                className={`w-full text-right pr-5 py-1 px-2 rounded border text-xs font-bold outline-none transition-colors ${tempRadarRates[item.label]?.after !== undefined ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}
                              />
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-blue-400 font-bold">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. 노후 연금 설정 탭 */}
          {settingsTab === 'pension' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {[
                    { key: 'target', label: '적정 노후 생활비 (목표선)', placeholder: '자동 (기본 198)' },
                    { key: 'personal', label: '3층: 개인연금', placeholder: '자동 (분석된 연금보험료)' },
                    { key: 'corporate', label: '2층: 퇴직연금', placeholder: '자동 (통계청 연령 중위)' },
                    { key: 'national', label: '1층: 국민연금', placeholder: '자동 (통계청 연령 평균)' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 hover:bg-slate-50/50 transition-colors flex flex-col gap-1.5">
                      <p className="font-bold text-slate-800 text-xs">{item.label}</p>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={item.placeholder}
                          value={tempPensionOverrides[item.key] !== undefined ? tempPensionOverrides[item.key] : ""}
                          onChange={(e) => handleTempPensionOverride(item.key, e.target.value)}
                          className={`w-full text-right pr-6 py-2 px-3 rounded-lg border text-sm font-bold outline-none transition-colors ${tempPensionOverrides[item.key] !== undefined ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600 focus:bg-white focus:border-blue-400'}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">만</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ⭐️ 모달 푸터 (저장 버튼 영역 상태 피드백 적용) */}
        <div className="bg-white px-5 py-4 border-t border-slate-200 flex justify-end shrink-0 gap-2.5 pb-safe">
          <button onClick={onClose} className="cursor-pointer flex-1 lg:flex-none px-4 py-3 text-sm rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            닫기
          </button>
          <button 
            onClick={handleSave} 
            disabled={saveSuccess}
            className={`cursor-pointer flex-1 lg:flex-none px-5 py-3 text-sm rounded-xl font-bold text-white transition-colors shadow-sm flex items-center justify-center gap-2 ${
              saveSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {saveSuccess ? "적용 완료!" : "적용하기"}
          </button>
        </div>

      </div>
    </>
  );
}