"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Scale, Coins, Activity, Trash2, Check, X, ArrowLeft, Umbrella, TrendingDown, ShieldCheck, Printer, AlertCircle, Stethoscope, CheckCircle2, Info, FileText, AlertTriangle, Save, Loader2, Settings2, Star, RotateCcw, ShieldAlert, Share2, Target, Phone, MessageCircle, ArrowRight, UserPlus, ChevronDown, ChevronUp, Search, LineChart, Gem, Plus } from "lucide-react";
import { COVERAGE_OPTIONS, ALLOWED_COVERAGES, calculateCoverageScores, getStandardCoverageInfo, applyCoverageToMap } from "@/lib/coverageMapper";
import SettingsModal from '../components/SettingsModal';
import { decryptRegNumber } from "@/app/actions/crypto";

// ⭐️ 4대 핵심 보장 카테고리 및 세부 목표 설정
export const CHART_CONFIG = [
  {
    title: "진단비",
    items: [
      { label: "일반암진단비", keywords: ["일반암"], defaultTarget: 5000 },
      { label: "유사암진단비", keywords: ["유사암"], defaultTarget: 1000 },
      { label: "순환계질환진단비", keywords: ["순환계질환진단", "특정순환계"], defaultTarget: 2000 },
      { label: "뇌혈관질환진단비", keywords: ["뇌혈관질환진단", "뇌혈관"], defaultTarget: 2000 },
      { label: "허혈성심장질환진단비", keywords: ["허혈성심장질환진단", "허혈성"], defaultTarget: 2000 },
    ]
  },
  {
    title: "치료비",
    items: [
      { label: "암주요치료비", keywords: ["암주요치료", "암치료"], defaultTarget: 5000 },
      { label: "순환계질환통합치료비", keywords: ["순환계질환통합치료", "순환계통합치료"], defaultTarget: 3000 },
      { label: "질병수술비", keywords: ["질병수술비", "질병수술"], defaultTarget: 100 },
      { label: "질병5종수술비", keywords: ["질병5종", "1~5종", "1-5종", "종수술"], defaultTarget: 1000 },
      { label: "질병입원비", keywords: ["질병입원비", "질병입원일당", "질병입원급여"], defaultTarget: 5 }, 
    ]
  },
  {
    title: "상해",
    items: [
      { label: "상해 후유장해3%↑", keywords: ["상해 후유장해3%", "상해후유장해3%", "재해 후유장해3%", "재해후유장해3%"], defaultTarget: 10000 },
      { label: "통합상해진단비(경증)", keywords: ["상해진단비(경증)", "통합상해진단비(경증)"], defaultTarget: 5 },
      { label: "통합상해진단비(중등증)", keywords: ["상해진단비(중등증)", "통합상해진단비(중등증)"], defaultTarget: 50 },
      { label: "상해수술비", keywords: ["상해수술비", "상해수술"], defaultTarget: 100 },
      { label: "상해입원비", keywords: ["상해입원비", "상해입원일당", "상해입원급여"], defaultTarget: 5 },
    ]
  },
  {
    title: "노후준비",
    items: [
      { label: "장기요양 1~5등급 재가급여", keywords: ["재가급여", "장기요양재가"], defaultTarget: 50 },
      { label: "장기요양 1~2등급 시설급여", keywords: ["시설급여", "장기요양시설"], defaultTarget: 100 },
      { label: "장기요양 1~5등급 진단비", keywords: ["장기요양진단", "장기요양진단비"], defaultTarget: 1000 },
      { label: "연금보험", keywords: ["연금"], defaultTarget: 100 },
      { label: "질병사망", keywords: ["질병사망", "질병사망보험금"], defaultTarget: 10000 }, 
      { label: "상해사망", keywords: ["상해사망", "상해사망보험금", "재해사망", "재해사망보험금"], defaultTarget: 10000 }, 
    ]
  }
];

// ⭐️ 5각형 폴리곤 차트 컴포넌트
const PolygonRadarChart = ({ categories, beforeData, afterData }: { categories: string[], beforeData: number[], afterData: number[] }) => {
  const size = 320; 
  const center = size / 2;
  const radius = 80; 
  const sides = categories.length;
  const angleStep = (Math.PI * 2) / sides;

  const getPoints = (data: number[]) => {
    return data.map((val, i) => {
      const r = (val / 100) * radius;
      const theta = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(theta);
      const y = center + r * Math.sin(theta);
      return `${x},${y}`;
    }).join(" ");
  };

  const levels = [20, 40, 60, 80, 100];

  return (
    <div className="relative w-full aspect-square max-w-[340px] print:max-w-[220px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-sm overflow-visible">
        
        {/* 거미줄(Grid) 배경 */}
        {levels.map(level => (
          <polygon key={level} points={getPoints(Array(sides).fill(level))} fill="none" stroke="currentColor" className="text-slate-200" strokeWidth="1" />
        ))}

        {/* 대각선 (Axes) */}
        {Array(sides).fill(0).map((_, i) => {
           const theta = i * angleStep - Math.PI / 2;
           const x = center + radius * Math.cos(theta);
           const y = center + radius * Math.sin(theta);
           return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="currentColor" className="text-slate-200" strokeWidth="1" />
        })}

        {/* 1. 리모델링 전 (기존 보장) */}
        <polygon points={getPoints(beforeData)} fill="transparent" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" className="print:stroke-slate-800" />
        {beforeData.map((val, i) => {
           const r = (val / 100) * radius;
           const theta = i * angleStep - Math.PI / 2;
           const x = center + r * Math.cos(theta);
           const y = center + r * Math.sin(theta);
           return <circle key={`before-${i}`} cx={x} cy={y} r="3" fill="#d8dadc" stroke="#44546b" strokeWidth="1.5" className="print:stroke-slate-800" />
        })}

        {/* 2. 최적화 제안 후 */}
        <polygon points={getPoints(afterData)} fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6" strokeWidth="2.5" />
        {afterData.map((val, i) => {
           const r = (val / 100) * radius;
           const theta = i * angleStep - Math.PI / 2;
           const x = center + r * Math.cos(theta);
           const y = center + r * Math.sin(theta);
           return <circle key={`after-${i}`} cx={x} cy={y} r="3.5" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="1.5" />
        })}

        {/* 라벨 텍스트 */}
        {categories.map((label, i) => {
           const labelRadius = radius + 32; 
           const theta = i * angleStep - Math.PI / 2;
           let x = center + labelRadius * Math.cos(theta);
           let y = center + labelRadius * Math.sin(theta);
           
           let anchor: "middle" | "start" | "end" = "middle";
           if (x > center + 10) anchor = "start";
           else if (x < center - 10) anchor = "end";

           if (anchor === "start") x += 4;
           if (anchor === "end") x -= 4;
           if (y < center - 10) y -= 4;
           if (y > center + 10) y += 8;

           let lines = [label];
           if (label.includes("장기요양 1~5등급 재가급여")) lines = ["장기요양 1~5등급", "재가급여"];
           else if (label.includes("장기요양 1~2등급 시설급여")) lines = ["장기요양 1~2등급", "시설급여"];
           else if (label.includes("장기요양 1~5등급 진단비")) lines = ["장기요양 1~5등급", "진단비"];
           else if (label.includes("통합상해진단비(경증)")) lines = ["통합상해진단비", "(경증)"];
           else if (label.includes("통합상해진단비(중등증)")) lines = ["통합상해진단비", "(중등증)"];
           else if (label.includes("상해 후유장해3%↑")) lines = ["상해 후유장해", "3%↑"];
           else if (label.includes("순환계질환통합치료비")) lines = ["순환계질환", "통합치료비"];
           else if (label.includes("허혈성심장질환진단비")) lines = ["허혈성심장질환", "진단비"];
           
           return (
             <text 
               key={label} x={x} y={y} 
               fill="currentColor" 
               className="text-slate-800 text-[14px] sm:text-[14px] font-black" 
               textAnchor={anchor} 
               dominantBaseline="middle"
             >
               {lines.length === 1 ? label : (
                   <>
                     <tspan x={x} dy="-0.6em">{lines[0]}</tspan>
                     <tspan x={x} dy="1.4em">{lines[1]}</tspan>
                   </>
               )}
             </text>
           )
        })}
      </svg>
    </div>
  );
};

const formatMoney = (amount: number) => {
  if (amount === 0) return "0원";
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000);
    const man = amount % 10000;
    return `${eok.toLocaleString()}억 ${man > 0 ? man.toLocaleString() + "만" : ""}원`;
  }
  return `${amount.toLocaleString()}만원`;
};

const formatPremium = (amount: number) => `${amount.toLocaleString()}원`;

const formatDetailAmount = (val: string | number) => {
  if (!val) return "0";
  const raw = String(val).replace(/,/g, "");
  return raw.replace(/\d+/g, (match) => Number(match).toLocaleString());
};

const extractNumber = (str: string | undefined | null) => {
  if (!str) return 0;
  let raw = String(str).replace(/\s+/g, ""); 
  let total = 0;

  if (raw.includes("억")) {
    const parts = raw.split("억");
    const eok = parseInt(parts[0].replace(/[^0-9]/g, ""), 10) || 0;
    total += eok * 10000;
    
    let remainder = parts[1];
    if (remainder && remainder.includes("천")) {
        const chun = parseInt(remainder.split("천")[0].replace(/[^0-9]/g, ""), 10) || 0;
        total += chun * 1000;
    } else if (remainder) {
        total += parseInt(remainder.replace(/[^0-9]/g, ""), 10) || 0;
    }
  } else if (raw.includes("천") && parseInt(raw.replace(/[^0-9]/g, ""), 10) < 100) {
    const chun = parseInt(raw.split("천")[0].replace(/[^0-9]/g, ""), 10) || 0;
    total += chun * 1000;
  } else {
    total = parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;
  }
  return total;
};

const extractMonthsFromPeriod = (
  periodStr: string | null | undefined,
  subDate: string | null | undefined,
  matDate: string | null | undefined
): number => {
  if (!periodStr) return 0;
  const raw = periodStr.replace(/\s+/g, "");
  if (raw.includes("일시")) return 1; 
    
  if (raw.includes("전기")) {
    if (subDate && matDate) {
      const subYear = new Date(subDate).getFullYear();
      const matYear = new Date(matDate).getFullYear();
      if (!isNaN(subYear) && !isNaN(matYear) && matYear > subYear) {
        return (matYear - subYear) * 12;
      }
    }
    return 12 * 20;
  }

  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  if (!isNaN(num) && num > 0) {
    return num * 12;
  }
  return 0;
};

const compareEnglishKorean = (a: string, b: string) => {
  const aIsEng = /^[A-Za-z]/.test(a);
  const bIsEng = /^[A-Za-z]/.test(b);
  if (aIsEng && !bIsEng) return -1; 
  if (!aIsEng && bIsEng) return 1;  
  return a.localeCompare(b, "ko-KR"); 
};

const HIDDEN_IN_SUMMARY = [
  "급성심근경색 진단비", "뇌출혈 진단비", "뇌졸중 진단비",
  "심근병증 진단비", "뇌산정특례대상 진단비", "심장산정특례대상 진단비"
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

const CATEGORY_ORDER = [
  "사망 보장", "후유장해 보장", "암 보장 (진단/치료/수술)", 
  "뇌 질환", "심장 질환", "순환계 질환", 
  "일반 수술비", "종수술비", "입원 및 응급실", "상해·골절·화상 및 기타",
  "운전자 비용", "장기요양 및 간병", "실손의료비"
];

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
      { id: "C15", name: "식도 악성 신생물", keywords: ["일반암 진단비", "고액암 진단비", "통합암 진단비"]},
      { id: "C16~C22", name: "소화기관 악성 신생물 (위암, 대장암 등)", keywords: ["일반암 진단비", "통합암 진단비"]},
      { id: "C23~C25", name: "담낭, 담도, 췌장 악성 신생물", keywords: ["일반암 진단비", "고액암 진단비", "통합암 진단비"]},
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

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [insuranceSearchTerm, setInsuranceSearchTerm] = useState("");
  const [selectedGaps, setSelectedGaps] = useState<string[]>([]);
  const [radarTargets, setRadarTargets] = useState<Record<string, number>>({});
  const [radarRates, setRadarRates] = useState<Record<string, { before?: number, after?: number }>>({});
  const [pensionOverrides, setPensionOverrides] = useState<Record<string, number>>({}); // 🚀 연금 설정 상태 추가
  const [analysisData, setAnalysisData] = useState({
    premium: { before: 0, after: 0 },
    totalPremium: { before: 0, after: 0 }, 
    coverages: [] as { name: string; before: number; after: number; rawNames?: string[] }[],
    rawPolicies: [] as any[],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState<any>({ checklist: {}, memo: "" });
  
  const [briefingText, setBriefingText] = useState("유지 중이신 전체 보험 증권을 종합적으로 분석한 결과, 보장 범위가 겹치는 잉여 특약과 향후 의료기술에 따른 불필요한 담보들이 확인되었습니다.");
  
  const [selectedTop3, setSelectedTop3] = useState<string[]>([]);
  const [isSavingConsulting, setIsSavingConsulting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 세부 설정 모달용 상태 관리
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [kcdOverrides, setKcdOverrides] = useState<Record<string, { before?: number; after?: number; highlight?: boolean }>>({});
  const [coverageOverrides, setCoverageOverrides] = useState<Record<string, { before?: number; after?: number }>>({});
  const [includeSanjeong, setIncludeSanjeong] = useState({ brain: false, heart: false, circAll: false, circExcl: false });
  const [visibleCoverages, setVisibleCoverages] = useState<string[]>([]);
  const [customCoverages, setCustomCoverages] = useState<{id: string, name: string, before: number, after: number, category: string}[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const { data: clientData } = await supabase.from("clients").select("*").eq("id", clientId).single();
    if (clientData) {
      if (clientData.registration_number && clientData.registration_number.includes(':')) {
        try {
          const decrypted = await decryptRegNumber(clientData.registration_number);
          clientData.registration_number = decrypted;
        } catch (e) {
          console.error("주민번호 복호화 실패:", e);
        }
      }
      setClient(clientData);
      setMedicalHistory(clientData.medical_history || { checklist: {}, memo: "" });
      
      if (clientData.consulting_details) {
        if (clientData.consulting_details.briefing) setBriefingText(clientData.consulting_details.briefing);
        if (clientData.consulting_details.kcdOverrides) setKcdOverrides(clientData.consulting_details.kcdOverrides);
        if (clientData.consulting_details.selectedTop3) setSelectedTop3(clientData.consulting_details.selectedTop3);
        if (clientData.consulting_details.coverageOverrides) setCoverageOverrides(clientData.consulting_details.coverageOverrides);
        if (clientData.consulting_details.includeSanjeong) {
          setIncludeSanjeong({
            brain: !!clientData.consulting_details.includeSanjeong.brain,
            heart: !!clientData.consulting_details.includeSanjeong.heart,
            circAll: !!clientData.consulting_details.includeSanjeong.circAll,
            circExcl: !!clientData.consulting_details.includeSanjeong.circExcl
          });
        }
        if (clientData.consulting_details.radarTargets) setRadarTargets(clientData.consulting_details.radarTargets);
        if (clientData.consulting_details.radarRates) setRadarRates(clientData.consulting_details.radarRates);
        if (clientData.consulting_details.pensionOverrides) setPensionOverrides(clientData.consulting_details.pensionOverrides); // 🚀 DB 연금 설정 로드
      }
    }

    if (clientData.agent_id) {
      const { data: agentData } = await supabase.from("agents").select("*, agencies(*)").eq("id", clientData.agent_id).single();
      if (agentData) setAgentInfo(agentData);
    }

    const { data: insData } = await supabase.from("subscription_insurance").select("*").eq("client_id", clientId);

    if (insData) {
      let premiumBefore = 0;
      let premiumAfter = 0;
      let totalPremiumBefore = 0; 
      let totalPremiumAfter = 0;  
      const coverageMap: Record<string, { displayName: string; before: number; after: number; rawNames: string[] }> = {};

      const scores = {
        cancer: { before: 0, after: 0 },
        similarCancer: { before: 0, after: 0 }, 
        brain: { before: 0, after: 0 },
        heart: { before: 0, after: 0 },
        circulatory: { before: 0, after: 0 },   
        death: { before: 0, after: 0 },         
        pension: { before: 0, after: 0 },       
        surgery: { before: 0, after: 0 }, hasJongSurgery: false,
        homeCare: { before: 0, after: 0 },
        hospitalization: { before: 0, after: 0 },
        injury: { before: 0, after: 0 }, hasDriver: false, hasDental: false
      };

      insData.forEach((ins) => {
        const status = ins.policy_status || "maintain";
        const isBefore = status === "maintain" || status === "cancel";
        const isAfter = status === "maintain" || status === "new";

        const premiumBeforeValue = isBefore ? (ins.remodeled_amount || ins.monthly_premium || 0) : 0;
        const premiumAfterValue = isAfter ? (ins.monthly_premium || 0) : 0;

        premiumBefore += premiumBeforeValue;
        premiumAfter += premiumAfterValue;

        const monthsToPay = extractMonthsFromPeriod(ins.payment_period, ins.subscription_date, ins.maturity_date);

        if (isBefore) totalPremiumBefore += premiumBeforeValue * monthsToPay;
        if (isAfter) totalPremiumAfter += premiumAfterValue * monthsToPay;

        if (isAfter) {
          const prodName = ins.product_name || "";
          if (prodName.includes("운전자")) scores.hasDriver = true;
          if (prodName.includes("치아") || prodName.includes("덴탈") || prodName.includes("치과")) scores.hasDental = true;
        }

        if (ins.details && Array.isArray(ins.details)) {
          ins.details.forEach((detail: any) => {
            const rawName = detail.name?.trim();
            if (!rawName) return;
            const normalizedName = rawName.replace(/\s+/g, "");

            const beforeVal = extractNumber(detail.original_amount || detail.amount);
            const afterVal = detail.is_deleted ? 0 : extractNumber(detail.amount);
            const name = detail.name || "";

            calculateCoverageScores(name, beforeVal, afterVal, isBefore, isAfter, scores);

            let forceKeep = false;
            let forceDisplayName = "";

            if (!normalizedName.includes("치료") && !normalizedName.includes("수술")) {
              if (normalizedName.includes("산정") || normalizedName.includes("특례")) {
                if (normalizedName.includes("뇌")) {
                  forceKeep = true;
                  forceDisplayName = "뇌산정특례대상 진단비";
                } else if (normalizedName.includes("심장") || normalizedName.includes("허혈") || normalizedName.includes("심혈관")) {
                  forceKeep = true;
                  forceDisplayName = "심장산정특례대상 진단비";
                }
              } else if (normalizedName.includes("특정순환계")) {
                forceKeep = true;
                forceDisplayName = normalizedName.includes("제외") ? "특정순환계질환 진단비(뇌혈관질환 및 허혈성심장질환 제외)" : "특정순환계질환 진단비";
              }
            }

            if (normalizedName.includes("비급여") && normalizedName.includes("암") && normalizedName.includes("치료")) {
              forceKeep = true;
              forceDisplayName = "암주요 치료비";
            }

            if (forceKeep) {
              const forceKey = forceDisplayName.replace(/\s+/g, "");
              applyCoverageToMap(forceKey, forceDisplayName, normalizedName, beforeVal, afterVal, isBefore, isAfter, coverageMap);
              return; 
            }
            
            const standardInfo = getStandardCoverageInfo(normalizedName);
            if (!standardInfo) return; 

            applyCoverageToMap(
              standardInfo.standardKey, 
              standardInfo.standardDisplayName, 
              normalizedName, 
              beforeVal, 
              afterVal, 
              isBefore, 
              isAfter, 
              coverageMap
            );
          });
        }
      });

      const extendedOptions = [...COVERAGE_OPTIONS];
      const requiredExtras = [
        "특정순환계질환 진단비",
        "특정순환계질환 진단비(뇌혈관질환 및 허혈성심장질환 제외)",
        "뇌산정특례대상 진단비",
        "심장산정특례대상 진단비"
      ];
      requiredExtras.forEach(ext => {
        if (!extendedOptions.includes(ext)) extendedOptions.push(ext);
      });

      const fullCoveragesArray = extendedOptions.map((name) => {
        const key = name.replace(/\s+/g, "");
        const existingData = coverageMap[key];
        return {
          name: name,
          before: existingData ? existingData.before : 0,
          after: existingData ? existingData.after : 0,
          rawNames: existingData ? existingData.rawNames : []
        };
      });

      setAnalysisData({
        premium: { before: premiumBefore, after: premiumAfter },
        totalPremium: { before: totalPremiumBefore, after: totalPremiumAfter },
        coverages: fullCoveragesArray,
        rawPolicies: insData || [],
        scores: scores as any
      } as any);

      let savedVisible = clientData.consulting_details?.visibleCoverages;
      
      if (!savedVisible || savedVisible.length === 0) {
        savedVisible = fullCoveragesArray
          .filter(c => (c.before > 0 || c.after > 0) && c.name !== "일반사망 진단비" && !HIDDEN_IN_SUMMARY.includes(c.name))
          .map(c => c.name);
      }
      setVisibleCoverages(savedVisible);
      setCustomCoverages(clientData.consulting_details?.customCoverages || []);

    }
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    if (clientId) void fetchData();
  }, [clientId, fetchData]);

  const handleSaveConsulting = async () => {
    setIsSavingConsulting(true);
    try {
      const payload = {
        briefing: briefingText,
        kcdOverrides: kcdOverrides,
        selectedTop3: selectedTop3,
        visibleCoverages: visibleCoverages,
        customCoverages: customCoverages,
        coverageOverrides: coverageOverrides,
        includeSanjeong: includeSanjeong,
        radarTargets: radarTargets,
        radarRates: radarRates,
        pensionOverrides: pensionOverrides // 🚀 연금 설정 저장
      };

      const { error } = await supabase.from("clients").update({ consulting_details: payload }).eq("id", clientId);
      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000); 
    } catch (error: any) {
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSavingConsulting(false);
    }
  };

  const handlePrint = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;

    const clientName = client?.name || "고객";
    const printTitle = `${dateStr}_${clientName}_보장분석 및 비교 분석표`;

    const originalTitle = document.title;
    document.title = printTitle;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  };

  const calculateCodeCoverage = useCallback((
    keywords: string[], 
    type: 'before' | 'after', 
    kcdId: string, 
    sanjeongOpts: { brain: boolean, heart: boolean, circAll?: boolean, circExcl?: boolean },
    currentOverrides?: Record<string, { before?: number; after?: number }>,
    currentCustoms?: any[]
  ) => {
    const HEART_SANJEONG_NAMES = ['만성류마티스심장질환', '협심증', '급성심근경색증', '기타허혈성심장질환', '폐성심장질환', '심장막염및심내막염', '비류마티스성판장애및폐동맥판장애', '상세불명판막의심내막염', '달리분류된질환에서의심내막염및심장판막장애', '심근염', '심근병증진단비', '방실및좌각차단,전도장애', '심장정지', '부정맥', '기타부정맥', '심부전', '심장병의불명확한기록및합병증', '대동맥동맥류및박리'];
    const BRAIN_SANJEONG_NAMES = ['지주막하출혈,뇌내출혈등(뇌출혈)', '뇌경색증', '출혈/경색으로명시되지않은뇌졸중진단비', '대뇌동맥폐쇄및협착'];
    
    const CIRC_ALL_NAMES = ['급성류마티스열', '만성류마티스심장질환', '협심증', '급성심근경색증', '기타허혈성심장질환', '폐성심장질환', '심장막염및심내막염', '비류마티스성판장애및폐동맥판장애', '상세불명판막의심내막염', '달리분류된질환에서의심내막염및심장판막장애', '심근염', '심근병증진단비', '부정맥', '기타부정맥', '심부전', '지주막하출혈,뇌내출혈등(뇌출혈)', '뇌경색증', '출혈/경색으로명시되지않은뇌졸중진단비', '대뇌동맥폐쇄및협착', '기타뇌혈관질환', '대동맥동맥류및박리', '기타동맥류및박리', '동맥색전증및혈전증', '동맥및세동맥의기타장애', '문맥혈전증', '식도정맥류'];
    const CIRC_EXCL_NAMES = ['급성류마티스열', '만성류마티스심장질환', '폐성심장질환', '심장막염및심내막염', '비류마티스성판장애및폐동맥판장애', '상세불명판막의심내막염', '달리분류된질환에서의심내막염및심장판막장애', '심근염', '심근병증진단비', '부정맥', '기타부정맥', '심부전', '대동맥동맥류및박리', '기타동맥류및박리', '동맥색전증및혈전증', '동맥및세동맥의기타장애', '문맥혈전증', '식도정맥류'];

    const targetOverrides = currentOverrides || coverageOverrides;
    const targetCustoms = currentCustoms || customCoverages;
    const baseCoverages = analysisData.coverages.map(c => ({
      name: c.name,
      before: targetOverrides[c.name]?.before !== undefined ? targetOverrides[c.name].before : c.before,
      after: targetOverrides[c.name]?.after !== undefined ? targetOverrides[c.name].after : c.after,
      rawNames: c.rawNames || []
    }));
    const allCoverages = [...baseCoverages, ...targetCustoms];

    const currentItemName = CIRCULATORY_CODES[0]?.items.find(i => i.id === kcdId)?.name || CANCER_CODES[0]?.items.find(i => i.id === kcdId)?.name || "";
    const cleanCurrentName = currentItemName.replace(/\s+/g, '');

    return allCoverages.reduce((acc, curr) => {
      const amt = curr[type] || 0;
      if (amt === 0) return acc;

      const cleanName = curr.name.replace(/\s+/g, '');
      const rawStr = (curr.rawNames || []).join("").replace(/\s+/g, '');

      if (cleanName.includes("치료비") || rawStr.includes("치료비")) return acc; 

      const isSanjeong = cleanName.includes("산정") || rawStr.includes("산정") || cleanName.includes("특례") || rawStr.includes("특례");
      const isCirc = cleanName.includes("순환계") || rawStr.includes("순환계");
      const isExcluded = cleanName.includes("제외") || rawStr.includes("제외");

      if (isSanjeong) {
        const isHeartSanjeong = cleanName.includes("심장") || cleanName.includes("허혈성") || cleanName.includes("심혈관") || rawStr.includes("심장") || rawStr.includes("허혈성") || rawStr.includes("심혈관");
        const isBrainSanjeong = cleanName.includes("뇌") || rawStr.includes("뇌");

        if (isHeartSanjeong && sanjeongOpts.heart && HEART_SANJEONG_NAMES.includes(cleanCurrentName)) return acc + amt;
        if (isBrainSanjeong && sanjeongOpts.brain && BRAIN_SANJEONG_NAMES.includes(cleanCurrentName)) return acc + amt;
        
        if (!isHeartSanjeong && !isBrainSanjeong && isCirc) {
          if (sanjeongOpts.heart && HEART_SANJEONG_NAMES.includes(cleanCurrentName)) return acc + amt;
          if (sanjeongOpts.brain && BRAIN_SANJEONG_NAMES.includes(cleanCurrentName)) return acc + amt;
        }
        return acc; 
      }

      if (isCirc) {
        if (isExcluded) {
          if (sanjeongOpts.circExcl && CIRC_EXCL_NAMES.includes(cleanCurrentName)) return acc + amt;
        } else {
          if (sanjeongOpts.circAll && CIRC_ALL_NAMES.includes(cleanCurrentName)) return acc + amt;
        }
        return acc; 
      }

      const isNormalKeywordMatch = keywords.some(kw => cleanName.includes(kw.replace(/\s+/g, '')));
      if (isNormalKeywordMatch) {
        
        if (
            cleanName.includes("수술") || 
            cleanName.includes("치료") || 
            cleanName.includes("입원") || 
            cleanName.includes("일당")
        ) {
            return acc; 
        }

        const BRAIN_KCD_CODES = ["I60~I62", "I63", "I64", "I65~I66", "I67~I69"];
        const ISCHEMIC_HEART_CODES = ["I20", "I21~I23", "I24~I25"];
        
        const isBrainExcludedKwd = cleanName.includes("뇌혈관제외") || cleanName.includes("뇌혈관질환제외") || rawStr.includes("뇌혈관제외");
        const isHeartExcludedKwd = cleanName.includes("허혈성제외") || cleanName.includes("허혈성심장질환제외") || rawStr.includes("허혈성제외");

        if (BRAIN_KCD_CODES.includes(kcdId) && isBrainExcludedKwd) return acc;
        if (ISCHEMIC_HEART_CODES.includes(kcdId) && isHeartExcludedKwd) return acc;

        return acc + amt;
      }

      return acc;
    }, 0);
  }, [analysisData.coverages, coverageOverrides, customCoverages]);

  const applySettingsOverrides = async (newSettings: any) => {
    try {
      const payload = {
        briefing: briefingText,
        selectedTop3: selectedTop3,
        kcdOverrides: newSettings.kcdOverrides,
        visibleCoverages: newSettings.visibleCoverages,
        customCoverages: newSettings.customCoverages,
        coverageOverrides: newSettings.coverageOverrides,
        includeSanjeong: newSettings.includeSanjeong,
        radarTargets: newSettings.radarTargets,
        radarRates: newSettings.radarRates,
        pensionOverrides: newSettings.pensionOverrides // 🚀 모달 데이터 DB에 저장
      };

      const { error } = await supabase.from("clients").update({ consulting_details: payload }).eq("id", clientId);
      if (error) throw error;

      setKcdOverrides(newSettings.kcdOverrides);
      setVisibleCoverages(newSettings.visibleCoverages);
      setCustomCoverages(newSettings.customCoverages);
      setCoverageOverrides(newSettings.coverageOverrides);
      setIncludeSanjeong(newSettings.includeSanjeong);
      setRadarTargets(newSettings.radarTargets);
      setRadarRates(newSettings.radarRates); 
      setPensionOverrides(newSettings.pensionOverrides); // 🚀 화면에 즉시 적용
      
      setIsSettingsModalOpen(false);
    } catch (error: any) {
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const openSettingsModal = () => setIsSettingsModalOpen(true);

  if (isLoading || !client) {
    return <div className="flex h-screen items-center justify-center text-gray-500 bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  const scores = (analysisData as any).scores || {
    cancer: { before: 0, after: 0 }, similarCancer: { before: 0, after: 0 }, 
    brain: { before: 0, after: 0 }, heart: { before: 0, after: 0 }, circulatory: { before: 0, after: 0 },   
    death: { before: 0, after: 0 }, pension: { before: 0, after: 0 },        
    surgery: { before: 0, after: 0 }, hasJongSurgery: false, homeCare: { before: 0, after: 0 },
    hospitalization: { before: 0, after: 0 }, injury: { before: 0, after: 0 }, hasDriver: false, hasDental: false
  };

  const premiumDiff = analysisData.premium.after - analysisData.premium.before;
  const totalPremiumDiff = analysisData.totalPremium.after - analysisData.totalPremium.before;
  const afterPremium = analysisData.premium.after;

  const calculateTotalDefenseCost = () => {
    return analysisData.coverages
    .filter(c => 
      c.name.includes("일반암 진단비") || 
      c.name.includes("유사암 진단비") || 
      c.name.includes("통합암 진단비") || 
      c.name.includes("순환계질환통합") || 
      c.name.includes("뇌혈관질환 진단비") || 
      c.name.includes("뇌졸중 진단비") || 
      c.name.includes("뇌산정") || 
      c.name.includes("급성심근경색 진단비") || 
      c.name.includes("허혈성심장질환 진단비") || 
      c.name.includes("심장산정") || 
      c.name.includes("부정맥") || 
      c.name.includes("심혈관질환 진단비") || 
      c.name.includes("암주요") || 
      c.name.includes("암통합")
    )
    .reduce((acc, curr) => acc + curr.after, 0);
  };

  const agentCorp = Array.isArray(agentInfo?.agencies) ? agentInfo.agencies[0]?.corporation_name : agentInfo?.agencies?.corporation_name;

  const baseGapItems = [
    { condition: scores.cancer.before < 5000, title: "암 보장 공백 발견", desc: `현재 암 보장금액이 안정권보다 부족한 상태입니다.`, action: "일반암 진단비 증액 권장" },
    { condition: scores.similarCancer.before < 1000, title: "유사암 보장 공백", desc: `현재 유사암 보장금액이 권장 기준보다 부족합니다.`, action: "유사암 진단비 보완 권장" }, 
    { condition: scores.brain.before < 2000, title: "뇌혈관 보장 공백 발견", desc: `현재 뇌혈관 보장금액이 권장 기준보다 부족한 상태입니다.`, action: "뇌혈관 진단/수술비 보완 요망" },
    { condition: scores.heart.before < 2000, title: "심장 보장 공백 발견", desc: `현재 허혈성/심장 보장금액이 권장 기준보다 부족합니다.`, action: "심혈관 특정진단비 보완 권장" },
    { condition: scores.circulatory.before < 2000, title: "순환계질환 보장 공백", desc: `현재 순환계질환 보장금액이 부족합니다. (뇌/심장 광범위 커버 필요)`, action: "순환계질환 진단비 보완 요망" }, 
    { condition: scores.death.before < 3000, title: "사망보장 자산 부족", desc: `현재 사망 보장 자산이 가족을 위한 최소 대비가 부족합니다.`, action: "정기/종신 사망보험금 확보" }, 
    { condition: scores.pension.before === 0, title: "노후 연금 자산 부재", desc: "은퇴 후를 대비할 수 있는 연금 관련 보장 자산이 전혀 없습니다.", action: "노후 대비 연금저축/보험 가 가입" }, 
    { condition: scores.surgery.before === 0 || !scores.hasJongSurgery, title: "질병/종수술비 보장 부재", desc: scores.surgery.before === 0 ? "포트폴리오에 수술비 특약이 전혀 확인되지 않습니다." : "질병 강도에 비례해 지급되는 '종수술비'가 빠져있습니다.", action: "질병 및 1-5종 수술비 장착" },
    { condition: scores.homeCare.before === 0, title: "치매 리스크 노출", desc: "장기요양등급 판정 시 매월 생활비를 받는 재가급여 자산이 비어있습니다.", action: "장기요양 재가급여 특약 추가" },
    { condition: scores.injury.before === 0, title: "통합상해진단비 공백", desc: "일상생활 중 발생하는 골절, 화상 등 각종 외상성 상해 진단비 자산이 없습니다.", action: "통합상해진단비 보완 권장" },
    { condition: scores.hospitalization.before === 0, title: "일당 입원비 보장 부재", desc: "첫날부터 보장받는 입원일당 특약이 없어 장기 입원 시 자부담 리스크가 있습니다.", action: "간병인/입원일당 확보 고려" },
    { condition: !scores.hasDriver, title: "운전자 핵심 비용 부재", desc: "민사/형사상 책임을 방어하는 교통사고처리지원금, 변호사선임비 등의 방어막이 없습니다.", action: "형사합의금 지원 플랜 마련" },
    { condition: !scores.hasDental, title: "치아 보장 자산 부재", desc: "큰 비용이 드는 임플란트, 크라운에 대한 전문 치과 치료비 보장이 없습니다.", action: "치과 전문 덴탈 케어 안내" }
  ];

  const displayGaps = (() => {
    const filteredAutoGaps = baseGapItems.filter(item => {
      if (!client?.consulting_details?.selectedGaps) return item.condition;
      return client.consulting_details.selectedGaps.includes(item.title);
    });

    const customGapsFromDB = client?.consulting_details?.customGaps || [];
    const filteredCustomGaps = customGapsFromDB.filter((custom: any) => {
      if (!client?.consulting_details?.selectedGaps) return true;
      return client.consulting_details.selectedGaps.includes(custom.title);
    }).map((custom: any) => ({ ...custom, isCustom: true }));

    return [...filteredAutoGaps, ...filteredCustomGaps].slice(0, 4);
  })();

  const displayTableItems = [
    ...analysisData.coverages
      .filter(item => visibleCoverages.includes(item.name))
      .map(item => ({
        name: item.name,
        before: coverageOverrides[item.name]?.before !== undefined ? coverageOverrides[item.name].before : item.before,
        after: coverageOverrides[item.name]?.after !== undefined ? coverageOverrides[item.name].after : item.after,
        isCustom: false,
        category: getCategory(item.name)
      })),
    ...customCoverages.map(c => ({ 
      name: c.name, 
      before: c.before, 
      after: c.after, 
      isCustom: true,
      category: c.category || getCategory(c.name)
    }))
  ].sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.category);
    const catB = CATEGORY_ORDER.indexOf(b.category);
    if (catA !== catB) return catA - catB;
    if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
    const idxA = COVERAGE_OPTIONS.indexOf(a.name);
    const idxB = COVERAGE_OPTIONS.indexOf(b.name);
    return idxA - idxB;
  });

const getChartValue = (keywords: string[], type: 'before' | 'after', label: string = "") => {
  let total = 0;
  
  if (label === "연금보험") {
      const pensionPremium = analysisData.rawPolicies
          .filter(p => {
              const status = p.policy_status || "maintain";
              const isValidStatus = type === 'before' ? (status === "maintain" || status === "cancel") : (status === "maintain" || status === "new");
              const isPension = p.product_name?.replace(/\s/g, '').includes("연금") || p.details?.some((d: any) => d.name?.replace(/\s/g, '').includes("연금"));
              return isValidStatus && isPension;
          })
          .reduce((sum, p) => {
              const amt = type === 'before' ? (p.remodeled_amount || p.monthly_premium || 0) : (p.monthly_premium || 0);
              const cleanAmt = parseInt(String(amt).replace(/[^0-9]/g, ''), 10) || 0;
              return sum + cleanAmt;
          }, 0);
      return Math.floor(pensionPremium / 10000);
  }

  if (label === "뇌혈관질환진단비") {
      const kcdId = "I67~I69"; 
      const kcdKeywords = ["특정순환계", "뇌혈관", "순환계질환통합", "순환계통합", "순환계질환", "순환계"];
      const override = kcdOverrides[kcdId] || {};
      if (override[type] !== undefined) return override[type] as number;
      return calculateCodeCoverage(kcdKeywords, type, kcdId, includeSanjeong);
  }

  if (label === "허혈성심장질환진단비") {
      const kcdId = "I24~I25"; 
      const kcdKeywords = ["특정순환계", "허혈성심장", "심혈관질환", "순환계질환통합", "순환계통합", "순환계질환", "순환계"];
      const override = kcdOverrides[kcdId] || {};
      if (override[type] !== undefined) return override[type] as number;
      return calculateCodeCoverage(kcdKeywords, type, kcdId, includeSanjeong);
  }

  if (label === "순환계질환진단비") {
      const targetIds = ["I26~I28", "I30~I33", "I34~I37", "I38", "I39", "I40~I41", "I42~I43", "I44~I45", "I46", "I47~I48, ", "I49", "I50"];
      const kcdKeywords = ["특정순환계", "순환계질환통합", "순환계통합", "순환계질환", "순환계"];
      let sum = 0;
      targetIds.forEach(id => {
          const override = kcdOverrides[id] || {};
          if (override[type] !== undefined) {
              sum += override[type] as number;
          } else {
              sum += calculateCodeCoverage(kcdKeywords, type, id, includeSanjeong);
          }
      });
      return Math.floor(sum / targetIds.length);
  }

  const isMatch = (cleanName: string) => {
      if (cleanName.includes("의료비") || cleanName.includes("실비") || cleanName.includes("실손")) return false;
      if (label.includes("진단") && (cleanName.includes("수술") || cleanName.includes("치료") || cleanName.includes("산정") || cleanName.includes("특례") || cleanName.includes("입원") || cleanName.includes("일당"))) return false;
      return keywords.some(kw => cleanName.includes(kw.replace(/\s/g, '')));
  };

  customCoverages.forEach(c => {
      const cleanName = c.name.replace(/\s/g, '');
      if (isMatch(cleanName)) total += c[type] || 0;
  });
  
  analysisData.coverages.forEach(c => {
      const cleanName = c.name.replace(/\s/g, '');
      const overridden = coverageOverrides[c.name] || {};
      const val = overridden[type] !== undefined ? overridden[type] : c[type];
      if (isMatch(cleanName)) total += val || 0;
  });
  
  return total;
};

const chartDataGrouped = CHART_CONFIG.map(cat => {
  let catBeforeSum = 0;
  let catAfterSum = 0;
  
  cat.items.forEach(item => {
     let bVal = getChartValue(item.keywords, 'before', item.label);
     let aVal = getChartValue(item.keywords, 'after', item.label);
     const target = radarTargets[item.label] !== undefined ? radarTargets[item.label] : item.defaultTarget;
     
     const manualBeforeRate = radarRates[item.label]?.before;
     const manualAfterRate = radarRates[item.label]?.after;

     const finalBeforeScore = manualBeforeRate !== undefined ? manualBeforeRate : Math.min(100, (bVal / target) * 100);
     const finalAfterScore = manualAfterRate !== undefined ? manualAfterRate : Math.min(100, (aVal / target) * 100);

     catBeforeSum += finalBeforeScore;
     catAfterSum += finalAfterScore;
  });
  
  const divisor = cat.items.length > 3 ? 2.5 : cat.items.length;
  
  return {
     label: cat.title,
     before: Math.max(15, Math.min(100, catBeforeSum / divisor)),
     after: Math.max(15, Math.min(100, catAfterSum / divisor)),
     itemsData: cat.items.map(item => {
       const bVal = getChartValue(item.keywords, 'before', item.label);
       const aVal = getChartValue(item.keywords, 'after', item.label);
       const target = radarTargets[item.label] !== undefined ? radarTargets[item.label] : item.defaultTarget;
       
       const manualBeforeRate = radarRates[item.label]?.before;
       const manualAfterRate = radarRates[item.label]?.after;

       return {
         label: item.label,
         before: manualBeforeRate !== undefined ? Math.max(15, Math.min(100, manualBeforeRate)) : Math.max(15, Math.min(100, (bVal / target) * 100)),
         after: manualAfterRate !== undefined ? Math.max(15, Math.min(100, manualAfterRate)) : Math.max(15, Math.min(100, (aVal / target) * 100)),
       }
     })
  };
});

  chartDataGrouped.forEach(d => { if (d.after < d.before) d.after = d.before; });
  const beforePoints = chartDataGrouped.map(d => d.before);
  const afterPoints = chartDataGrouped.map(d => d.after);

return (
  <>
    <style dangerouslySetInnerHTML={{__html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body, main, div {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          header, nav, aside, [role="navigation"], .fixed, .sticky, [class*="sidebar"], [class*="header"] {
            display: none !important;
          }
          @page { margin: 0.8cm; }
          .cover-page {
            height: calc(100vh - 1.6cm) !important;
            min-height: 270mm !important;
            margin-bottom: 0 !important;
            border-radius: 20px !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          section, table, tbody, tr, .print-card, .print-bundle {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          h2, h3, h4 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          textarea, input {
            border: none !important;
            background: transparent !important;
            resize: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}} />
      <div className="w-full max-w-5xl mx-auto md:p-4 md:p-8 space-y-6 print:p-1 print:m-0 print:max-w-none print:bg-white">
        
        {/* 헤더 바 */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-3 pr-4 pl-4 md:py-4 -mt-4 flex items-center justify-between border-b-2 border-gray-900 gap-2 md:gap-4 print:hidden w-full">
          
          <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
            <button onClick={() => router.back()} className="cursor-pointer p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition shrink-0">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[13px] sm:text-base md:text-2xl font-bold text-gray-900 flex items-center gap-1.5 md:gap-2 truncate">
                <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-blue-600 shrink-0" />
                <span className="truncate">비교 분석표</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            <button 
              onClick={openSettingsModal}
              className="cursor-pointer flex items-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-md md:rounded-lg text-[11px] md:text-sm font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all shadow-sm shrink-0"
            >
              <Settings2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" /> 세부설정
            </button>

            <button 
              onClick={handleSaveConsulting}
              disabled={isSavingConsulting || saveSuccess}
              className={`cursor-pointer flex items-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-5 md:py-2.5 rounded-md md:rounded-lg text-[11px] md:text-sm font-bold transition-all shrink-0 ${
                saveSuccess ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-white border border-slate-300 text-slate-700"
              }`}
            >
              {isSavingConsulting ? <Loader2 className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" /> : <Save className="w-3 h-3 md:w-3.5 md:h-3.5" />}
              {isSavingConsulting ? "저장중..." : saveSuccess ? "저장완료" : "내용저장"}
            </button>
            
            <button onClick={handlePrint} className="cursor-pointer hidden sm:flex items-center gap-1.5 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-md">
              <Printer className="w-4 h-4" /> 출력
            </button>
          </div>
        </div>

        {/* 메인 커버 페이지 */}
        <section className="relative flex flex-col justify-between bg-white border border-slate-400 w-full md:rounded-3xl p-4 md:p-16 print:p-16 mb-8 cover-page print:break-after-page overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-overlay filter blur-[120px] opacity-40 translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-20 -translate-x-1/4 translate-y-1/4"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold tracking-widest text-slate-800">{agentCorp || "소속 정보 없음"}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mt-1">{new Date().toLocaleDateString('ko-KR')}</p>
            </div>
          </div>

          <div className="relative z-10 my-24 print:my-auto">
            <p className="text-blue-400 font-semibold tracking-widest mb-6 border-l-4 border-blue-500 pl-4">COMPREHENSIVE INSURANCE ANALYSIS</p>
            <h1 className="text-5xl md:text-6xl print:text-6xl lg:text-7xl font-black leading-tight mb-8 text-slate-900">
              보장 분석 및<br />비교 분석표
            </h1>
          </div>

          <div className="relative z-10 flex justify-between items-end border-t border-slate-700/50 pt-10">
            <div>
              <p className="text-sm text-slate-600 mb-2 uppercase tracking-wider">Prepared for</p>
              <p className="text-2xl md:text-4xl print:text-4xl font-bold text-slate-900">{client.name} <span className="text-2xl font-normal text-slate-600">고객님</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Financial Consultant</p>
              <p className="text-2xl font-bold text-slate-900">
                {agentInfo?.name || "담당자"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white md:rounded-2xl p-4 md:p-8 border border-gray-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0 print:border-slate-300">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
              <ShieldCheck className="w-6 h-6 text-blue-600" /> 보장 리포트
            </h2>
          </div>
          
          {(() => {
            return (
              <div className="flex flex-col gap-8 print:border-slate-300 print-bundle">
                
                {/* 상단: 미흡 보장 진단 */}
                <div className="flex flex-col">
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                      {displayGaps.length > 0 ? <AlertCircle className="w-5 h-5 text-red-500"/> : <ShieldCheck className="w-5 h-5 text-emerald-600"/>} 
                      기존 보장 공백 진단 결과
                    </h4>
                  </div>

                  {displayGaps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4">
                      {displayGaps.map((item, index) => {
                        return (
                          <div key={index} className="bg-red-50/40 border border-red-100 p-4 rounded-2xl shadow-sm print:border-red-200 flex flex-col">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shrink-0">
                                <ShieldAlert className="w-5 h-5" />
                              </div>
                              <div className="flex-1 mt-0.5">
                                <h5 className="font-black text-slate-800 text-sm mb-1.5 flex items-center gap-1">
                                  {item.isCustom && <span className="text-orange-500">★</span>}
                                  {item.title}
                                </h5>
                                <p className="text-[12px] text-slate-600 leading-relaxed break-keep">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-sm flex items-center gap-4 print:border print:border-emerald-300 print:bg-none print:text-slate-800">
                      <div className="p-3 bg-white/20 rounded-full shrink-0 print:bg-emerald-100">
                        <CheckCircle2 className="w-8 h-8 text-yellow-300 print:text-emerald-600" />
                      </div>
                      <div>
                        <h5 className="text-base font-black mb-1">완벽한 철벽 방어막 확보!</h5>
                        <p className="text-xs font-medium text-emerald-50 leading-relaxed print:text-slate-600">
                          분석 결과 주요 보장에 어떠한 공백도 발견되지 않았습니다.<br/>
                          매우 이상적이고 든든한 최고 수준의 포트폴리오입니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 하단: 4개의 5각형 밸런스 차트 */}
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600"/> 보장 밸런스
                  </h4>
                </div>
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-y-12 print:gap-y-0 gap-x-4 w-full">
                    {CHART_CONFIG.map((config, idx) => {
                        const bData = config.items.map(item => {
                            const manualBefore = radarRates[item.label]?.before;
                            if (manualBefore !== undefined) return Math.max(15, Math.min(100, manualBefore));
                            
                            const val = getChartValue(item.keywords, 'before', item.label);
                            const target = radarTargets[item.label] !== undefined ? radarTargets[item.label] : item.defaultTarget;
                            return Math.max(15, Math.min(100, (val / target) * 100));
                        });

                        const aData = config.items.map(item => {
                            const manualAfter = radarRates[item.label]?.after;
                            if (manualAfter !== undefined) return Math.max(15, Math.min(100, manualAfter));
                            
                            const val = getChartValue(item.keywords, 'after', item.label);
                            const target = radarTargets[item.label] !== undefined ? radarTargets[item.label] : item.defaultTarget;
                            return Math.max(15, Math.min(100, (val / target) * 100));
                        });

                        aData.forEach((d, i) => { if (d < bData[i]) aData[i] = bData[i]; });

                        return (
                            <div key={idx} className="flex flex-col items-center">
                                <h5 className="font-black text-blue-700 print:text-blue-800 text-[13px] mb-3 bg-blue-50 print:bg-blue-100 px-3 py-1.5 rounded-md shadow-sm border border-blue-200 print:border-blue-300">
                                  {config.title} 밸런스
                                </h5>
                                <PolygonRadarChart categories={config.items.map(i => i.label)} beforeData={bData} afterData={aData} />
                            </div>
                        )
                    })}
                  </div>
                  
                  {/* 차트 범례 */}
                  <div className="flex justify-center gap-6 pt-6 border-t border-slate-200 w-full">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-0 border-t-2 border-dashed border-slate-400"></span>
                      <span className="text-xs text-slate-600 font-bold">기존 보장</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 bg-blue-500/40 border-[1.5px] border-blue-500 rounded-[3px]"></span>
                      <span className="text-xs text-slate-800 font-black">권장 보장</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}


          <section className="bg-white relative overflow-hidden">
            <div className="flex items-center justify-between print:border-slate-300">
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <Coins className="w-5 h-5 text-violet-500" />
                노후 연금 진단
              </h2>
              <span className="text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 print:border-slate-300">
                통계청 최신 연령별 데이터 반영
              </span>
            </div>

            {(() => {
              // 1. 고객 나이 연산 로직
              const currentYear = new Date().getFullYear();
              let age = 0;

              const birthStr = client?.birth_date || "";
              const regNum = client?.registration_number || "";

              if (birthStr) {
                  const cleanBirth = birthStr.replace(/[^0-9]/g, '');
                  if (cleanBirth.length >= 4) {
                      const birthYear = parseInt(cleanBirth.substring(0, 4), 10);
                      age = currentYear - birthYear;
                  }
              } else if (regNum && regNum.replace(/[^0-9]/g, '').length >= 6) {
                  const cleanReg = regNum.replace(/[^0-9]/g, '');
                  const yearPrefix = parseInt(cleanReg.substring(0, 2), 10);
                  
                  if (cleanReg.length >= 7) {
                      const gender = cleanReg.substring(6, 7);
                      const birthYear = (['3','4','7','8'].includes(gender) ? 2000 : 1900) + yearPrefix;
                      age = currentYear - birthYear;
                  } else {
                      const birthYear = yearPrefix > 30 ? 1900 + yearPrefix : 2000 + yearPrefix;
                      age = currentYear - birthYear;
                  }
              }

              let nationalAvg = 0; 
              let corporateAvg = 0; 
              let ageGroupStr = "";

              if (age < 30) {
                  nationalAvg = 84; corporateAvg = 70; ageGroupStr = "20대";
              } else if (age >= 30 && age <= 34) {
                  nationalAvg = 78; corporateAvg = 65; ageGroupStr = "30~34세";
              } else if (age >= 35 && age <= 39) {
                  nationalAvg = 72; corporateAvg = 60; ageGroupStr = "35~39세";
              } else if (age >= 40 && age <= 44) {
                  nationalAvg = 58; corporateAvg = 55; ageGroupStr = "40~44세";
              } else if (age >= 45 && age <= 49) {
                  nationalAvg = 52; corporateAvg = 50; ageGroupStr = "45~49세";
              } else if (age >= 50 && age <= 54) {
                  nationalAvg = 48; corporateAvg = 45; ageGroupStr = "50~54세";
              } else if (age >= 55 && age <= 59) {
                  nationalAvg = 28; corporateAvg = 40; ageGroupStr = "55~59세";
              } else if (age >= 60 && age <= 64) {
                  nationalAvg = 24; corporateAvg = 35; ageGroupStr = "60~64세";
              } else {
                  nationalAvg = 50; corporateAvg = 30; ageGroupStr = "65세 이상";
              }

              // 3. 목표 및 합산 데이터 산정 (수동 설정값 반영)
              const targetPension = pensionOverrides?.target ?? 198; 
              const calcPersonal = getChartValue(["연금"], 'before', "연금보험");

              const nationalFinal = pensionOverrides?.national ?? nationalAvg;
              const corporateFinal = pensionOverrides?.corporate ?? corporateAvg;
              const personalFinal = pensionOverrides?.personal ?? calcPersonal;

              const totalPrepared = nationalFinal + corporateFinal + personalFinal;
              const shortfall = Math.max(0, targetPension - totalPrepared);

              // ⭐️ 해결 1: 피라미드의 '진짜 전체 높이'를 260px로 영구 고정합니다.
              const CHART_HEIGHT = 200; 
              const MIN_H = 120; // 0원일 때 형태를 유지하기 위한 최소 가중치
              
              const maxChartValue = Math.max(targetPension, totalPrepared);
              const rawPx = (val: number) => (val / maxChartValue) * CHART_HEIGHT; 

              // 1차 계산: 최소 높이 보장 (이 과정에서 거품 높이가 발생함)
              const preNat = nationalFinal > 0 ? Math.max(MIN_H, rawPx(nationalFinal)) : MIN_H;
              const preCorp = corporateFinal > 0 ? Math.max(MIN_H, rawPx(corporateFinal)) : MIN_H;
              const prePers = personalFinal > 0 ? Math.max(MIN_H, rawPx(personalFinal)) : MIN_H;
              const preShort = shortfall > 0 ? Math.max(MIN_H, rawPx(shortfall)) : 0; 

              // ⭐️ 해결 2: 발생한 거품을 쫙 빼서 우리가 원하는 고정 높이(260px)로 정확히 압축 배분!
              const preTotal = preNat + preCorp + prePers + preShort;
              const scale = CHART_HEIGHT / preTotal; // 압축 비율 계산

              const hNat = preNat * scale;
              const hCorp = preCorp * scale;
              const hPers = prePers * scale;
              const hShort = preShort * scale;

              // 이렇게 하면 totalH는 무슨 일이 있어도 언제나 260px로 완벽하게 고정됩니다.
              const totalH = hNat + hCorp + hPers + hShort; 
              const W = 260; // 피라미드 밑변 넓이도 동일하게 고정
              const CX = W / 2;

              // 각 층별 Y 좌표 (0이 꼭대기, totalH가 바닥)
              const yShortTop = 0;
              const yShortBottom = hShort;
              const yPersTop = yShortBottom;
              const yPersBottom = yPersTop + hPers;
              const yCorpTop = yPersBottom;
              const yCorpBottom = yCorpTop + hCorp;
              const yNatTop = yCorpBottom;
              const yNatBottom = yNatTop + hNat;

              // 피라미드 빗변 각도를 구하는 함수
              const getDX = (y: number) => (y / totalH) * CX;

              // SVG 사다리꼴 꼭짓점 그리기 함수
              const makePoly = (yTop: number, yBottom: number) => {
                  const dxTop = getDX(yTop);
                  const dxBottom = getDX(yBottom);
                  return `${CX - dxTop},${yTop} ${CX + dxTop},${yTop} ${CX + dxBottom},${yBottom} ${CX - dxBottom},${yBottom}`;
              };

              // 목표선(빨간 줄)의 정확한 위치 계산
              let targetLineTop = 0;
              if (shortfall > 0) {
                  targetLineTop = 0; 
              } else {
                  targetLineTop = totalH * (1 - (targetPension / totalPrepared));
              }

              return (
                <figure className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-4 items-stretch print-bundle mt-4 m-0 p-0" style={{ display: 'grid' }}>
                  
                  {/* 왼쪽: 3층 연금 피라미드 차트 */}
                  <figure className="bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-center items-center relative print:bg-white print:border-slate-300 m-0" style={{ minHeight: '240px', display: 'flex' }}>
                    
                    {/* 전체 높이가 260px로 영구 고정되어 펄럭이거나 축소되지 않습니다 */}
                    <figure className="w-full max-w-[260px] mx-auto relative z-10 m-0 mt-4" style={{ height: `${totalH}px`, display: 'block' }}>
                      
                      <section className="absolute w-full border-t-[2.5px] border-dashed border-red-500 left-0 z-30" style={{ top: `${targetLineTop}px`, display: 'block' }}>
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-red-600 font-black text-[12px] md:text-[13px] bg-white px-3 py-1 rounded shadow-sm border border-red-200 whitespace-nowrap print:border-red-300 print:shadow-none print:bg-white">
                          적정 노후 생활비 (월 {targetPension}만)
                        </span>
                      </section>

                      {/* 인쇄 버그 없는 순수 SVG 피라미드 렌더링 */}
                      <svg viewBox={`0 0 ${W} ${totalH}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full drop-shadow-sm z-0" style={{ display: 'block' }}>
                        
                        <polygon points={`${CX},0 0,${totalH} ${W},${totalH}`} fill="#f1f5f9" />

                        {hShort > 0 && <polygon points={makePoly(yShortTop, yShortBottom)} fill="#fee2e2" />}
                        <polygon points={makePoly(yPersTop, yPersBottom)} fill={personalFinal > 0 ? "#a855f7" : "#f1f5f9"} />
                        <polygon points={makePoly(yCorpTop, yCorpBottom)} fill={corporateFinal > 0 ? "#3b82f6" : "#f1f5f9"} />
                        <polygon points={makePoly(yNatTop, yNatBottom)} fill={nationalFinal > 0 ? "#10b981" : "#f1f5f9"} />

                        {/* 0원일 때 점선 */}
                        {personalFinal === 0 && hPers > 0 && <line x1={CX - getDX(yPersTop)} y1={yPersTop} x2={CX + getDX(yPersTop)} y2={yPersTop} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,4" />}
                        {corporateFinal === 0 && hCorp > 0 && <line x1={CX - getDX(yCorpTop)} y1={yCorpTop} x2={CX + getDX(yCorpTop)} y2={yCorpTop} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,4" />}
                        {nationalFinal === 0 && hNat > 0 && <line x1={CX - getDX(yNatTop)} y1={yNatTop} x2={CX + getDX(yNatTop)} y2={yNatTop} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,4" />}

                        {/* 금액이 있을 때 실선 */}
                        {personalFinal > 0 && <line x1={CX - getDX(yPersBottom)} y1={yPersBottom} x2={CX + getDX(yPersBottom)} y2={yPersBottom} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />}
                        {corporateFinal > 0 && <line x1={CX - getDX(yCorpBottom)} y1={yCorpBottom} x2={CX + getDX(yCorpBottom)} y2={yCorpBottom} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />}
                      </svg>

                      {/* 텍스트 레이어 */}
                      <article className="absolute inset-0 w-full h-full flex flex-col z-20 pointer-events-none" style={{ display: 'flex' }}>
                          
                          {hShort > 0 && (
                            <section style={{ height: `${hShort}px`, display: 'flex' }} className="w-full flex-col items-center justify-center shrink-0" />
                          )}

                          <section style={{ height: `${hPers}px`, display: 'flex' }} className="w-full flex-col items-center justify-center shrink-0">
                            <span className={`font-semibold text-[10px] print:text-[10px] ${personalFinal > 0 ? 'text-white/90 print:text-white [text-shadow:_0_1px_2px_theme(colors.purple.700)]' : 'text-slate-300 print:text-slate-300'}`}>여유생활자금</span>
                            <span className={`font-black text-xs md:text-sm print:text-[13px] tracking-wide mt-0.5 ${personalFinal > 0 ? 'text-white print:text-white [text-shadow:_0_1px_2px_theme(colors.purple.700)]' : 'text-slate-300 print:text-slate-300'}`}>개인연금 {personalFinal}만</span>
                          </section>

                          <section style={{ height: `${hCorp}px`, display: 'flex' }} className="w-full flex-col items-center justify-center shrink-0">
                            <span className={`font-semibold text-[10px] print:text-[10px] ${corporateFinal > 0 ? 'text-white/90 print:text-white' : 'text-slate-300 print:text-slate-300'}`}>표준생활자금 ({ageGroupStr} 중위)</span>
                            <span className={`font-black text-xs md:text-sm print:text-[13px] tracking-wide mt-0.5 ${corporateFinal > 0 ? 'text-white print:text-white' : 'text-slate-300 print:text-slate-300'}`}>예상 퇴직연금 {corporateFinal}만</span>
                          </section>

                          <section style={{ height: `${hNat}px`, display: 'flex' }} className="w-full flex-col items-center justify-center shrink-0">
                            <span className={`font-semibold text-[10px] print:text-[10px] ${nationalFinal > 0 ? 'text-white/90 print:text-white' : 'text-slate-300 print:text-slate-300'}`}>기초생활자금 ({ageGroupStr} 평균)</span>
                            <span className={`font-black text-xs md:text-sm print:text-[13px] tracking-wide mt-0.5 ${nationalFinal > 0 ? 'text-white print:text-white' : 'text-slate-300 print:text-slate-300'}`}>예상 국민연금 {nationalFinal}만</span>
                          </section>
                      </article>

                      {/* 개인연금 0원 뱃지 */}
                      {personalFinal === 0 && (
                        <div className="absolute top-[40%] -right-4 md:-right-12 translate-x-4 print:hidden z-40">
                           <div className="bg-slate-700/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                              <span className="text-red-400 font-black">!</span> 개인연금 (0원)
                           </div>
                        </div>
                      )}

                    </figure>
                  </figure>

                  {/* 오른쪽: 브리핑 코멘트 */}
                  <figure className="flex flex-col gap-4 h-full m-0" style={{ display: 'flex' }}>
                    <section className="bg-slate-50 rounded-xl p-5 print:p-4 border border-slate-200 flex-1 flex flex-col justify-center print:bg-white print:border-slate-300" style={{ display: 'flex' }}>
                      <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                        통계청 기준 노후 소득 예상 (<strong className="text-blue-600">{age}세</strong>)
                      </p>
                      <div className="flex items-end gap-2 mt-1">
                        <span className="text-3xl md:text-4xl print:text-3xl font-black text-slate-800">{totalPrepared}<span className="text-lg print:text-base">만원</span></span>
                        <span className="text-sm font-bold text-slate-400 mb-1">/ 월 확보</span>
                      </div>
                    </section>

                    {shortfall > 0 ? (
                      <section className="p-5 print:p-4 rounded-xl bg-red-50 border border-red-200 print:bg-white print:border-red-300 flex-1 flex flex-col justify-center" style={{ display: 'flex' }}>
                        <p className="text-[13px] print:text-[13px] text-red-700/90 font-bold leading-relaxed break-keep">
                          고객님의 연령대({ageGroupStr}) 기준, 예상되는 평균 국민연금과 퇴직연금을 합쳐도 적정 생활비 대비 <strong className="text-red-600">매월 {shortfall}만 원의 적자</strong>가 확정적으로 발생합니다.
                        </p>
                      </section>
                    ) : (
                      <section className="p-5 print:p-4 rounded-xl bg-emerald-50 border border-emerald-200 print:bg-white print:border-emerald-300 flex-1 flex flex-col justify-center" style={{ display: 'flex' }}>
                        <p className="text-[13px] print:text-[13px] text-emerald-700/90 font-bold leading-relaxed break-keep">
                          통계청 연령별 데이터({ageGroupStr})를 기준으로 분석한 결과, 고객님이 추가 준비하신 <strong>개인연금</strong> 덕분에 현금흐름이 완성되었습니다.
                        </p>
                      </section>
                    )}
                  </figure>
                </figure>
              );

            })()}
          </section>

          <div className="flex flex-col gap-4 shrink-0 print-bundle">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 text-lg">
              <Scale className="w-5 h-5 text-blue-600" />
              기존 유지안 및 권장 제안 비교
            </h3>
            <div className="flex flex-col md:flex-row gap-4 print:flex print:flex-col print:flex-row">
              <div className="flex-1 bg-slate-50 border border-slate-200 p-6 rounded-2xl print:border-slate-300 flex flex-col justify-between print:flex-1 print:justify-between">
                <p className="text-sm font-black text-slate-500 mb-6 flex items-center">
                  기존 유지안
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">월 납입 보험료</p>
                    <p className="text-2xl font-black text-slate-700">{formatPremium(analysisData.premium.before)}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-blue-50/50 border border-blue-200 p-6 rounded-2xl print:bg-blue-50 print:border-blue-300 flex flex-col justify-between  print:flex-1 print:justify-between">
                <p className="text-sm font-bold text-blue-600 mb-6 flex items-center">
                    최적화 제안
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-blue-400 mb-1">월 납입 보험료</p>
                    <p className="text-2xl font-black text-gray-900">{formatPremium(afterPremium)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {(() => {
              const upgradedCoverages = analysisData.coverages.filter(item => item.after > item.before && !HIDDEN_IN_SUMMARY.includes(item.name));
              
              return (
                <div className="flex flex-col gap-8 print-bundle">
                  <div className={`flex flex-col justify-center ${upgradedCoverages.length === 0 ? 'print:hidden' : ''}`}>
                    <div className="mb-4">
                      <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600"/> 핵심 보장 TOP 3
                      </h4>
                        <div className="grid grid-cols-3 gap-2 mt-3 w-full print:hidden">
                          {[0, 1, 2].map((slotIndex) => {
                            return (
                              <select
                                key={slotIndex}
                                value={selectedTop3[slotIndex] || ""}
                                onChange={(e) => {
                                  const newSelected = [...selectedTop3];
                                  newSelected[slotIndex] = e.target.value;
                                  setSelectedTop3(newSelected);
                                }}
                                className="w-full truncate cursor-pointer text-[11px] font-bold border border-emerald-200 rounded-lg px-2 py-1.5 bg-emerald-50 text-emerald-700 outline-none focus:border-emerald-500 shadow-sm"
                              >
                                <option value="">{slotIndex + 1}위 (자동 추천)</option>
                                {upgradedCoverages.map(c => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                            );
                          })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4">
                      {upgradedCoverages.length > 0 ? (
                        (() => {
                          const autoTop3 = [...upgradedCoverages].sort((a, b) => (b.after - b.before) - (a.after - a.before));
                          const displayTop3 = [];
                          const usedNames = new Set();
                          
                          for (let i = 0; i < 3; i++) {
                            const manualName = selectedTop3[i];
                            let item = null;
                            
                            if (manualName) item = upgradedCoverages.find(c => c.name === manualName);
                            if (!item) item = autoTop3.find(c => !usedNames.has(c.name)); 
                            
                            if (item) {
                              displayTop3.push(item);
                              usedNames.add(item.name);
                            }
                          }

                          return displayTop3.map((item, index) => {
                            const gap = item.after - item.before;
                            const increaseRate = item.before === 0 ? "신규 장착!" : `${Math.round((gap / item.before) * 100)}% 상승`;
                            
                            return (
                              <div key={index} className="bg-white border-2 border-emerald-100 p-4 rounded-2xl shadow-sm print:border-emerald-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl">
                                  {increaseRate}
                                </div>
                                <p className="text-sm font-black text-gray-800 mb-4 pr-12 truncate">{item.name}</p>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-xs font-medium text-gray-400">
                                    <span>기존 보장액</span>
                                    <span className="line-through">{formatMoney(item.before)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-700">제안 보장액</span>
                                    <span className="font-black text-emerald-600">{formatMoney(item.after)}</span>
                                  </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 text-right">
                                  <span className="text-[11px] font-bold text-gray-500 mr-2">보장 순증가액</span>
                                  <span className="text-base font-black text-blue-600">+{formatMoney(gap)}</span>
                                </div>
                              </div>
                            );
                          });
                        })()
                      ) : (
                        <div className="col-span-1 md:col-span-3 bg-gray-50 border border-gray-200 p-6 rounded-2xl text-center text-gray-500 font-bold text-sm">
                          보장금액이 상향된 항목이 없거나, 보장 분석 데이터가 부족합니다.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl print:bg-slate-50/80 shrink-0 mt-8 print-bundle">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="w-full">
                  <p className="text-sm font-bold text-slate-800 mb-1">Total Consulting Verdict</p>
                  <textarea
                    maxLength={308}
                    value={briefingText}
                    onChange={(e) => setBriefingText(e.target.value)}
                    className="w-full min-h-[190px] bg-transparent text-1xl text-slate-600 font-medium leading-relaxed outline-none resize-none focus:border-b focus:border-blue-300 transition-colors print:border-none print:p-0"
                    rows={briefingText ? briefingText.split('\n').length + 1 : 3}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 보장 금액 합산 페이지 */}
        <section className="bg-white md:rounded-2xl p-4 md:p-8 border border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            보장 금액 합계
            </h2>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-white">
              <tr>
                <th className="md:px-4 print:px-4 py-4 text-left font-bold text-gray-900 w-3/9">담보 항목</th>
                <th className="md:px-4 print:px-4 py-4 text-right text-gray-500 w-2/9">기존 보장액</th>
                <th className="md:px-4 print:px-4 py-4 text-right font-bold text-blue-600 bg-blue-50/20 w-2/9">권장 보장액</th>
                <th className="hidden md:table-cell print:table-cell px-4 py-4 text-right font-bold text-gray-900 w-2/9">증감 보장액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayTableItems.map((item: any, index) => {
                const gap = item.after - item.before;
                return (
                  <tr key={index} className="print:break-inside-avoid">
                    <td className="md:px-4 print:px-4 py-2 font-semibold text-gray-800 flex items-center gap-1.5">
                      {item.name}
                    </td>
                    <td className={`md:px-4 print:px-4 py-2 text-right ${item.before === 0 ? 'text-red-400' : 'text-gray-500 font-bold'}`}>
                      {item.before === 0 ? '-' : formatMoney(item.before)}
                    </td>
                    <td className={`md:px-4 print:px-4 py-2 text-right ${item.after === 0 ? 'text-gray-800' : 'text-blue-600 font-bold'}`}>
                      {item.after === 0 ? '-' : formatMoney(item.after)}
                    </td>
                    <td className="hidden md:table-cell print:table-cell px-4 py-2 text-right font-bold">
                      {gap > 0 ? (
                        <span className="text-blue-600">+{formatMoney(gap)}</span>
                      ) : gap < 0 ? (
                        <span className="text-red-300">-{formatMoney(Math.abs(gap))}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* C00 ~ D09 신생물 질환 상세 코드별 보장금액 진단 */}
        <section className="bg-white md:rounded-2xl p-4 md:p-8 border-2 border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              신생물/암 질환 상세 코드별 보장금액
            </h2>
          </div>
          <div className="">
            {CANCER_CODES.map((group, groupIdx) => (
              <div key={groupIdx}>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-white">
                    <tr>
                      <th className="md:px-4 print:px-4 py-2 text-left font-bold text-gray-900 w-3/9">보장항목</th>
                      <th className="md:px-4 print:px-4 py-2 text-right text-gray-500 w-2/9">기존 보장액</th>
                      <th className="md:px-4 print:px-4 py-2 text-right font-bold text-blue-600 bg-blue-50/20 w-2/9">권장 보장액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {group.items.map((item, itemIdx) => {
                      const override = kcdOverrides[item.id] || {};
                      const beforeAmt = override.before !== undefined ? override.before : calculateCodeCoverage(item.keywords, 'before', item.id, includeSanjeong);
                      const afterAmt = override.after !== undefined ? override.after : calculateCodeCoverage(item.keywords, 'after', item.id, includeSanjeong);
                      const isHighlight = override.highlight !== undefined ? override.highlight : item.highlight;

                      const gap = afterAmt - beforeAmt;
                      const isUpgraded = gap > 0;
                      const isZeroBefore = beforeAmt === 0;

                      return (
                        <tr key={itemIdx} className="print:break-inside-avoid">
                          <td className="md:px-4 print:px-4 py-1 font-semibold text-gray-800 flex items-center gap-1.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[13px] text-slate-800">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-medium text-slate-400 tracking-wider">
                                  {item.id}
                                </span>
                                {isHighlight && (
                                  <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                    ★ 핵심질환
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={`md:px-4 print:px-4 py-2 text-right ${isZeroBefore ? 'text-red-400' : 'text-slate-600 font-bold'}`}>
                            {isZeroBefore ? '-' : formatMoney(beforeAmt)}
                          </td>
                          <td className="hidden md:table-cell print:table-cell px-4 py-2 text-right font-bold">
                            {
                              afterAmt > 0 ? 
                                <span className="font-black text-blue-600">{formatMoney(afterAmt)}</span>
                                : 
                                <span className="text-gray-300">-</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {/* I00 ~ I99 순환계 질환 상세 코드별 보장금액 진단 */}
        <section className="bg-white md:rounded-2xl p-4 md:p-8 border-2 border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            순환계 질환 상세 코드별 보장금액
            </h2>
          </div>
          <div className="space-y-8">
            {CIRCULATORY_CODES.map((group, groupIdx) => (
              <div key={groupIdx}>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-white">
                    <tr>
                      <th className="md:px-4 print:px-4 py-4 text-left font-bold text-gray-900 w-3/9">보장항목</th>
                      <th className="md:px-4 print:px-4 py-4 text-right text-gray-500 w-2/9">기존 보장액</th>
                      <th className="md:px-4 print:px-4 py-4 text-right font-bold text-blue-600 bg-blue-50/20 w-2/9">권장 보장액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {group.items.map((item, itemIdx) => {
                      const override = kcdOverrides[item.id] || {};
                      const beforeAmt = override.before !== undefined ? override.before : calculateCodeCoverage(item.keywords, 'before', item.id, includeSanjeong);
                      const afterAmt = override.after !== undefined ? override.after : calculateCodeCoverage(item.keywords, 'after', item.id, includeSanjeong);
                      const isHighlight = override.highlight !== undefined ? override.highlight : item.highlight;
                      
                      const gap = afterAmt - beforeAmt;
                      const isUpgraded = gap > 0;
                      const isZeroBefore = beforeAmt === 0;

                      return (
                        <tr key={itemIdx} className="print:break-inside-avoid">
                          <td className="md:px-4 print:px-4 py-1 font-semibold text-gray-800 flex items-center gap-1.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[13px] text-slate-800">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-medium text-slate-400 tracking-wider">
                                  {item.id}
                                </span>
                                {isHighlight && (
                                  <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                    ★ 핵심질환
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={`md:px-4 print:px-4 py-2 text-right ${isZeroBefore ? 'text-red-400' : 'text-slate-600 font-bold'}`}>
                            {isZeroBefore ? '-' : formatMoney(beforeAmt)}
                          </td>
                          <td className="hidden md:table-cell print:table-cell px-4 py-2 text-right font-bold">
                            {
                              afterAmt > 0 ?  
                              <span className="font-black text-blue-600">{formatMoney(afterAmt)}</span>
                              : 
                              <span className="text-gray-300">-</span>
                              }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
        
        {/* 리모델링 상세 내역 */}
        <section className="bg-white md:rounded-2xl p-4 md:p-8 border-2 border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 print:grid-cols-2 print:divide-y-0 print:divide-x">
    
            {/* 왼쪽: 리모델링 전 */}
            <div className="md:p-6 print:p-2 border-0 print:pl-0 print:pt-0">
              <h3 className="font-bold text-slate-700 mb-5 flex items-center gap-2 border-b border-slate-200 pb-3 text-lg">
                기존 보험내역
              </h3>
              <div className="space-y-5">
                {analysisData.rawPolicies
                  .filter(p => p.policy_status === "maintain" || p.policy_status === "cancel")
                  .sort((a, b) => compareEnglishKorean(a.insurance_company || "", b.insurance_company || ""))
                  .map(cov => (
                  <div key={cov.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm print:break-inside-avoid">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">{cov.insurance_company}</p>
                        <p className="font-bold text-slate-900 text-base leading-tight pr-2">{cov.product_name}</p>
                      </div>
                      <div className="text-right shrink-0 w-26">
                         {cov.payment_period && <p className="text-xs text-slate-400 mb-0.5">{cov.payment_period}</p>}
                         <p className="font-black text-slate-700 text-base">{formatPremium(cov.remodeled_amount || cov.monthly_premium)}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-2 text-[11px] gap-2">
                       <div className="flex items-center gap-1.5">
                         <span className="text-slate-400 font-medium">계약자/피보험자</span>
                         <span className="text-slate-700 font-bold">{cov.contractor_name || '-'} / {cov.insured_name || client?.name || '-'}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <span className="text-slate-400 font-medium">가입일 / 만기일</span>
                         <span className="text-slate-700 font-bold">{cov.subscription_date || '-'} ~{cov.maturity_date || '-'}</span>
                       </div>
                    </div>
                    
                    {cov.details && (
                      <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
                        {cov.details.map((d: any, i: number) => {
                          const badgeText = d.renewal_type || "비갱신";

                          return (
                            <div key={i} className="flex justify-between text-xs text-slate-600">
                              <span className="truncate pr-2 flex items-center gap-1.5 leading-relaxed">
                                {badgeText === "비갱신" ? (
                                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 font-medium">
                                    {badgeText}
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 shrink-0 font-medium">
                                    {badgeText}
                                  </span>
                                )}
                                {d.name}
                              </span>
                              <span className="font-bold shrink-0 text-slate-700">
                                {formatDetailAmount(d.original_amount || d.amount)}만원
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                {analysisData.rawPolicies.filter(p => p.policy_status === "maintain" || p.policy_status === "cancel").length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6 font-bold">기존 보유 보험이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 오른쪽: 리모델링 후 */}
            <div className="pt-6 md:p-6 print:p-2 border-0 print:pr-0 print:pt-0">
              <h3 className="font-bold text-blue-700 mb-5 flex items-center gap-2 border-b border-blue-200 pb-3 text-lg">
                권장 보험내역
              </h3>
              <div className="space-y-5">
                {analysisData.rawPolicies
                  .filter(p => p.policy_status === "maintain" || p.policy_status === "new" || p.policy_status === "cancel")
                  .sort((a, b) => {
                    const aIsNew = a.policy_status === 'new';
                    const bIsNew = b.policy_status === 'new';
                    if (aIsNew && !bIsNew) return 1;  
                    if (!aIsNew && bIsNew) return -1;
                    return compareEnglishKorean(a.insurance_company || "", b.insurance_company || ""); 
                  })
                  .map(cov => {
                    const isCanceled = cov.policy_status === 'cancel';
                    const isNew = cov.policy_status === 'new';
                    const beforePremium = cov.remodeled_amount || cov.monthly_premium;
                    const afterPremium = cov.monthly_premium;
                    const isPremiumReduced = afterPremium < beforePremium;

                    const isMaintained = cov.policy_status === 'maintain';
                    const isModified = isMaintained && (
                      isPremiumReduced || 
                      (cov.details && cov.details.some((d: any) => d.is_deleted || (d.original_amount !== undefined && extractNumber(d.amount) !== extractNumber(d.original_amount))))
                    );
                    const isUnchanged = isMaintained && !isModified;
                    
                    const needsBlur = isUnchanged || isCanceled;

                    return (
                      <div key={cov.id} className={`relative bg-white rounded-xl border p-5 shadow-sm print:break-inside-avoid overflow-hidden ${
                        isNew ? 'border-emerald-300 bg-emerald-50/20' : 
                        isCanceled ? 'border-red-300 bg-red-50/10' : 
                        isUnchanged ? 'border-slate-200' : 
                        'border-blue-300 bg-blue-50/10'
                      }`}>
                        
                        {needsBlur && (
                          <div className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[3px] print:backdrop-blur-none ${isCanceled ? 'bg-red-50/40 print:bg-red-50/80' : 'bg-white/50 print:bg-slate-50/80'}`}>
                            {isUnchanged && (
                              <span className="bg-slate-700/90 text-white text-[12px] px-4 py-2 rounded-xl font-black tracking-widest shadow-lg flex items-center gap-2">
                                유지권장
                              </span>
                            )}
                            {isCanceled && (
                              <span className="bg-red-600/90 text-white text-[12px] px-4 py-2 rounded-xl font-black tracking-widest shadow-lg flex items-center gap-2">
                                해지권장
                              </span>
                            )}
                          </div>
                        )}

                        <div className={needsBlur ? 'opacity-40 select-none pointer-events-none' : ''}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                {isNew && <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider">신규</span>}
                                {isCanceled && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider">해지</span>}
                                {isModified && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider">부분 변경</span>}
                                
                                <p className="text-xs font-bold text-slate-500">{cov.insurance_company}</p>
                              </div>
                              <p className={`font-bold text-base leading-tight pr-2 ${isCanceled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{cov.product_name}</p>
                            </div>
                            <div className="text-right shrink-0 w-26">
                              {cov.payment_period && <p className="text-xs text-slate-400 mb-0.5">{cov.payment_period}</p>}
                              {isCanceled ? (
                                <p className="font-black text-red-500/60 text-base line-through">{formatPremium(beforePremium)}</p>
                              ) : (
                                <p className={`font-black text-base ${isPremiumReduced ? 'text-red-600' : (isNew ? 'text-emerald-700' : '')}`}>
                                  {formatPremium(afterPremium)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={`rounded-lg p-2.5 mb-2 text-[11px] gap-2 ${isCanceled ? 'bg-red-50/50 border border-red-100' : 'bg-slate-50 border border-slate-100'}`}>
                            <div className="flex items-center gap-1.5">
                              <span className={`${isCanceled ? 'text-red-400' : 'text-slate-400'} font-medium`}>계약자/피보험자</span>
                              <span className={`${isCanceled ? 'text-red-700' : 'text-slate-700'} font-bold`}>{cov.contractor_name || '-'} / {cov.insured_name || client?.name || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`${isCanceled ? 'text-red-400' : 'text-slate-400'} font-medium`}>가입일 / 만기일</span>
                              <span className={`${isCanceled ? 'text-red-700' : 'text-slate-700'} font-bold`}>{cov.subscription_date || '-'} ~ {cov.maturity_date || '-'}</span>
                            </div>
                          </div>
                          
                          {cov.details && (
                            <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
                              {cov.details.map((d: any, i: number) => {
                                const isEffectivelyDeleted = isCanceled || d.is_deleted;
                                const beforeDetailAmt = extractNumber(d.original_amount || d.amount);
                                const afterDetailAmt = extractNumber(d.amount);
                                const isDetailReduced = d.original_amount !== undefined && afterDetailAmt < beforeDetailAmt;
                                const badgeText = d.renewal_type || "비갱신";

                                return (
                                  <div key={i} className={`flex justify-between text-xs ${isEffectivelyDeleted ? 'text-red-400/60 line-through' : 'text-slate-700'}`}>
                                    <span className="truncate pr-2 flex items-center gap-1.5 leading-relaxed">
                                      {badgeText === "비갱신" ? (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 font-medium ${isEffectivelyDeleted ? 'bg-red-50 text-red-400 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                          {badgeText}
                                        </span>
                                      ) : (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 font-medium ${isEffectivelyDeleted ? 'bg-red-50 text-red-400 border-red-100' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                          {badgeText}
                                        </span>
                                      )}
                                      {d.name}
                                    </span>
                                    <span className={`font-bold shrink-0 ${isEffectivelyDeleted ? '' : (isDetailReduced ? 'text-red-600' : (d.original_amount !== undefined && afterDetailAmt !== beforeDetailAmt ? 'text-blue-600' : 'text-slate-800'))}`}>
                                      {isCanceled ? '해지됨' : (d.is_deleted ? '삭제됨' : `${formatDetailAmount(d.amount)}만원`)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {analysisData.rawPolicies.filter(p => p.policy_status === "maintain" || p.policy_status === "new" || p.policy_status === "cancel").length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6 font-bold">제안/유지 중인 보험이 없습니다.</p>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* 건강 분석 페이지 */}
        <section className="bg-white md:rounded-2xl p-4 md:p-8 border border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                고객 건강 및 알릴의무 분석
              </h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full print:border print:border-slate-300">
                심평원 데이터 기반
              </span>
            </div>

            {Object.values(medicalHistory.checklist || {}).some(val => val === true) ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 print:bg-red-50/50">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-black text-red-800">알릴 의무 해당 항목이 발견되었습니다. (상세 심사 필요)</p>
                  <p className="text-xs font-semibold text-red-600/80 mt-0.5">아래 붉은색으로 표기된 항목에 대해 보험사 고지가 필요합니다.</p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-6 flex items-center gap-3 print:bg-emerald-50/50">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-black text-emerald-800">특이 고지사항 없음 (건강체/우량체 가입 유리)</p>
                  <p className="text-xs font-semibold text-emerald-600/80 mt-0.5">고지 대상에 해당되는 이력이 발견되지 않았습니다.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {[
                { id: "q3Month_hospital", label: "3개월 내 병원 이력" },
                { id: "q1Year_same_disease", label: "1년 내 추가검사/재검사" },
                { id: "q5Year_surgery_suspect", label: "5년 내 수술 및 처치" },
                { id: "q5Year_hospitalization", label: "5년 내 입원 이력" },
                { id: "q5Year_7days_visit", label: "5년 내 7일 이상 통원" },
                { id: "q5Year_30days_medication", label: "5년 내 30일 이상 투약" },
              ].map((item) => {
                const isWarning = medicalHistory.checklist?.[item.id];
                return (
                  <div key={item.id} className={`flex items-center gap-2.5 p-3 rounded-xl border ${isWarning ? 'bg-red-50/50 border-red-200 print:bg-red-50' : 'bg-slate-50/50 border-slate-100 print:bg-white'} transition-colors`}>
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={`text-xs font-bold ${isWarning ? 'text-red-700' : 'text-slate-400 line-through decoration-slate-300'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5 print:bg-blue-50/50 print:overflow-hidden overflow-hidden">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 상세 병력 및 분석 코멘트
              </p>
              <div className="print:block w-full text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                {medicalHistory.memo || "상세 병력 내용이 없습니다."}
              </div>
            </div>

            <p className="text-[10px] font-semibold text-slate-400 mt-5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" /> 
              본 리포트는 국민건강보험공단(심평원) 진료 데이터를 기반으로 작성된 참고용 자료입니다
            </p>
          </section>

      </div>

      <div className="relative z-[99999] print:hidden">
        <SettingsModal 
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={applySettingsOverrides}
          analysisData={analysisData}
          calculateCodeCoverage={calculateCodeCoverage}
          initialKcdOverrides={kcdOverrides}
          initialVisibleCoverages={visibleCoverages}
          initialCustomCoverages={customCoverages}
          initialCoverageOverrides={coverageOverrides}
          initialIncludeSanjeong={includeSanjeong}
          initialRadarTargets={radarTargets} 
          initialRadarRates={radarRates}
          initialPensionOverrides={pensionOverrides} // 🚀 모달에 연금 설정값 전달
        />
      </div>

    </>
  );
}