"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Check, X, ArrowLeft, Umbrella, TrendingDown, ShieldCheck, Printer, AlertCircle, Stethoscope, CheckCircle2, Info, FileText, AlertTriangle, Save, Loader2, Settings2, Star, RotateCcw, ShieldAlert, Share2, Target, Phone, MessageCircle, ArrowRight, UserPlus, ChevronDown, ChevronUp, Search, LineChart, Gem, Plus } from "lucide-react";
import { COVERAGE_OPTIONS, ALLOWED_COVERAGES, calculateCoverageScores, getStandardCoverageInfo, applyCoverageToMap } from "@/lib/coverageMapper";
import SettingsModal from '../components/SettingsModal';

// ⭐️ 4대 핵심 보장 카테고리 및 세부 목표 설정
export const CHART_CONFIG = [
  {
    title: "진단비",
    items: [
      { label: "일반암진단비", keywords: ["일반암"], defaultTarget: 5000 },
      { label: "유사암진단비", keywords: ["유사암"], defaultTarget: 1000 },
      { label: "순환계질환진단비", keywords: ["순환계질환진단", "특정순환계"], defaultTarget: 5000 },
      { label: "뇌혈관질환진단비", keywords: ["뇌혈관질환진단", "뇌혈관"], defaultTarget: 3000 },
      { label: "허혈성심장질환진단비", keywords: ["허혈성심장질환진단", "허혈성"], defaultTarget: 3000 },
    ]
  },
  {
    title: "치료비",
    items: [
      { label: "암주요치료비", keywords: ["암주요치료", "암치료"], defaultTarget: 10000 },
      { label: "순환계질환통합치료비", keywords: ["순환계질환통합치료", "순환계통합치료"], defaultTarget: 5000 },
      { label: "질병수술비", keywords: ["질병수술비", "질병수술"], defaultTarget: 100 },
      { label: "질병5종수술비", keywords: ["질병5종", "1~5종", "1-5종", "종수술"], defaultTarget: 1000 },
      { label: "질병입원비", keywords: ["질병입원비", "질병입원일당", "질병입원급여"], defaultTarget: 5 }, 
    ]
  },
  {
    title: "상해",
    items: [
      { label: "상해 후유장해3%↑", keywords: ["상해 후유장해3%", "상해후유장해3%", "재해 후유장해3%", "재해후유장해3%"], defaultTarget: 10000 },
      { label: "통합상해진단비(경증)", keywords: ["상해진단비(경증)", "통합상해진단비(경증)"], defaultTarget: 100 },
      { label: "통합상해진단비(중등증)", keywords: ["상해진단비(중등증)", "통합상해진단비(중등증)"], defaultTarget: 500 },
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
// ⭐️ 5각형 폴리곤 차트 컴포넌트 (웹/프린트 모두 밝은 테마로 가독성 완벽 적용)
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
        
        {/* 거미줄(Grid) 배경 - 연한 회색으로 통일 */}
        {levels.map(level => (
          <polygon key={level} points={getPoints(Array(sides).fill(level))} fill="none" stroke="currentColor" className="text-slate-200" strokeWidth="1" />
        ))}

        {/* 대각선 (Axes) - 연한 회색으로 통일 */}
        {Array(sides).fill(0).map((_, i) => {
           const theta = i * angleStep - Math.PI / 2;
           const x = center + radius * Math.cos(theta);
           const y = center + radius * Math.sin(theta);
           return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="currentColor" className="text-slate-200" strokeWidth="1" />
        })}

        {/* 1. 리모델링 전 (기존 보장 - 진한 회색 점선) */}
        <polygon points={getPoints(beforeData)} fill="transparent" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" className="print:stroke-slate-400" />
        {beforeData.map((val, i) => {
           const r = (val / 100) * radius;
           const theta = i * angleStep - Math.PI / 2;
           const x = center + r * Math.cos(theta);
           const y = center + r * Math.sin(theta);
           return <circle key={`before-${i}`} cx={x} cy={y} r="3" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" className="print:stroke-slate-400" />
        })}

        {/* 2. 최적화 제안 후 (파란색 영역) */}
        <polygon points={getPoints(afterData)} fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6" strokeWidth="2.5" />
        {afterData.map((val, i) => {
           const r = (val / 100) * radius;
           const theta = i * angleStep - Math.PI / 2;
           const x = center + r * Math.cos(theta);
           const y = center + r * Math.sin(theta);
           return <circle key={`after-${i}`} cx={x} cy={y} r="3.5" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="1.5" />
        })}

        {/* 라벨 텍스트 - 진한 검정색(slate-800)으로 가독성 극대화 */}
        {categories.map((label, i) => {
           const labelRadius = radius + 32; 
           const theta = i * angleStep - Math.PI / 2;
           let x = center + labelRadius * Math.cos(theta);
           let y = center + labelRadius * Math.sin(theta);
           
            // ⭐️ TypeScript 에러 해결: anchor 변수가 가질 수 있는 정확한 타입을 명시합니다.
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

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [insuranceSearchTerm, setInsuranceSearchTerm] = useState("");
  const [selectedGaps, setSelectedGaps] = useState<string[]>([]);
  
  // ⭐️ 여기서만 선언됨
  const [radarTargets, setRadarTargets] = useState<Record<string, number>>({});
  
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
        // DB에서 설정한 타겟값 불러오기
        if (clientData.consulting_details.radarTargets) setRadarTargets(clientData.consulting_details.radarTargets);
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
      if (!savedVisible) {
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
        radarTargets: radarTargets // ⭐️ 모달에서 수정된 타겟값 저장
      };
      const { error } = await supabase
        .from("clients")
        .update({ consulting_details: payload })
        .eq("id", clientId);

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
          // ⭐️ 특정순환계(제외) 버튼이 켜졌을 때만 KCD에 합산!
          if (sanjeongOpts.circExcl && CIRC_EXCL_NAMES.includes(cleanCurrentName)) return acc + amt;
        } else {
          // ⭐️ 특정순환계(전체) 버튼이 켜졌을 때만 KCD에 합산!
          if (sanjeongOpts.circAll && CIRC_ALL_NAMES.includes(cleanCurrentName)) return acc + amt;
        }
        return acc; 
      }

      const isNormalKeywordMatch = keywords.some(kw => cleanName.includes(kw.replace(/\s+/g, '')));
      if (isNormalKeywordMatch) {
        
        // ⭐️ 핵심 차단 로직: KCD 진단비 영역에서 수술비, 치료비, 입원비 등이 뻥튀기 합산되는 것을 완벽 차단!
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
        radarTargets: newSettings.radarTargets
      };

      const { error } = await supabase.from("clients").update({ consulting_details: payload }).eq("id", clientId);
      if (error) throw error;

      setKcdOverrides(newSettings.kcdOverrides);
      setVisibleCoverages(newSettings.visibleCoverages);
      setCustomCoverages(newSettings.customCoverages);
      setCoverageOverrides(newSettings.coverageOverrides);
      setIncludeSanjeong(newSettings.includeSanjeong);
      setRadarTargets(newSettings.radarTargets);
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
    { condition: scores.cancer.before < 5000, title: "암 보장 공백 발견", desc: `현재 암 보장금액이 ${formatMoney(scores.cancer.before)}으로 안정권보다 부족한 상태입니다.`, action: "일반암 진단비 증액 권장" },
    { condition: scores.similarCancer.before < 1000, title: "유사암 보장 공백", desc: `현재 유사암 보장금액이 ${formatMoney(scores.similarCancer.before)}으로 권장 기준보다 부족합니다.`, action: "유사암 진단비 보완 권장" }, 
    { condition: scores.brain.before < 2000, title: "뇌혈관 보장 공백 발견", desc: `현재 뇌혈관 보장금액이 ${formatMoney(scores.brain.before)}으로 권장 기준보다 부족한 상태입니다.`, action: "뇌혈관 진단/수술비 보완 요망" },
    { condition: scores.heart.before < 2000, title: "심장 보장 공백 발견", desc: `현재 허혈성/심장 보장금액이 ${formatMoney(scores.heart.before)}으로 권장 기준보다 부족합니다.`, action: "심혈관 특정진단비 보완 권장" },
    { condition: scores.circulatory.before < 2000, title: "순환계질환 보장 공백", desc: `현재 순환계질환 보장금액이 ${formatMoney(scores.circulatory.before)}으로 부족합니다. (뇌/심장 광범위 커버 필요)`, action: "순환계질환 진단비 보완 요망" }, 
    { condition: scores.death.before < 3000, title: "사망보장 자산 부족", desc: `현재 사망 보장 자산이 ${formatMoney(scores.death.before)}으로 가족을 위한 최소 대비가 부족합니다.`, action: "정기/종신 사망보험금 확보" }, 
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

    // ⭐️ 끝에 .slice(0, 4) 를 추가하여 우선순위가 높은 순서대로 최대 4개까지만 표시합니다.
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

// ⭐️ 데이터 추출 헬퍼 함수 (label: string = "" 기본값 추가)
const getChartValue = (keywords: string[], type: 'before' | 'after', label: string = "") => {
  let total = 0;
  
  // ⭐️ 핵심: '연금보험'은 보장금액이 아닌 "실제 연금 상품의 월납 보험료(만원 단위)"를 기준으로 합산합니다!
  if (label === "연금보험") {
      const pensionPremium = analysisData.rawPolicies
          .filter(p => {
              const status = p.policy_status || "maintain";
              const isValidStatus = type === 'before' 
                  ? (status === "maintain" || status === "cancel") 
                  : (status === "maintain" || status === "new");
              
              const isPension = p.product_name?.replace(/\s/g, '').includes("연금") || 
                                p.details?.some((d: any) => d.name?.replace(/\s/g, '').includes("연금"));
              return isValidStatus && isPension;
          })
          .reduce((sum, p) => {
              const amt = type === 'before' ? (p.remodeled_amount || p.monthly_premium || 0) : (p.monthly_premium || 0);
              const cleanAmt = parseInt(String(amt).replace(/[^0-9]/g, ''), 10) || 0;
              return sum + cleanAmt;
          }, 0);
      
      // 월 보험료를 1만원 단위로 변환하여 더함 (예: 1,000,000원 -> 100 추가)
      total += Math.floor(pensionPremium / 10000);
  }

  const isMatch = (cleanName: string) => {
      if (cleanName.includes("의료비") || cleanName.includes("실비") || cleanName.includes("실손")) {
          return false;
      }
      
      if (label.includes("진단")) {
          if (
              cleanName.includes("수술") || 
              cleanName.includes("치료") || 
              cleanName.includes("산정") || 
              cleanName.includes("특례") || 
              cleanName.includes("입원") || 
              cleanName.includes("일당")
          ) {
              return false;
          }
      }

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

// 4축 밸런스 점수 계산 (이제 getChartValue가 다 알아서 하므로 코드가 아주 깔끔해집니다!)
const chartDataGrouped = CHART_CONFIG.map(cat => {
  let catBeforeSum = 0;
  let catAfterSum = 0;
  
  cat.items.forEach(item => {
     // ⭐️ BINGO: 여기서 getChartValue가 호출될 때 연금보험료까지 자동으로 계산해 옵니다.
     const bVal = getChartValue(item.keywords, 'before', item.label);
     const aVal = getChartValue(item.keywords, 'after', item.label);
     const target = radarTargets[item.label] !== undefined ? radarTargets[item.label] : item.defaultTarget;
     
     catBeforeSum += Math.min(100, (bVal / target) * 100);
     catAfterSum += Math.min(100, (aVal / target) * 100);
  });
  
  return {
     label: cat.title,
     before: Math.max(15, catBeforeSum / cat.items.length),
     after: Math.max(15, catAfterSum / cat.items.length)
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
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6 print:p-1 print:m-0 print:max-w-none print:bg-white">
        
        {/* 헤더 바 */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 -mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-gray-900 gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
                보장 분석 및 비교 분석표
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button 
              onClick={openSettingsModal}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Settings2 className="w-4 h-4 text-blue-600" /> 세부 설정 및 조정
            </button>

            <button 
              onClick={handleSaveConsulting}
              disabled={isSavingConsulting || saveSuccess}
              className={`cursor-pointer flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-bold transition-all  ${
                saveSuccess ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-white border border-slate-300 text-slate-700"
              }`}
            >
              {isSavingConsulting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {isSavingConsulting ? "저장 중..." : saveSuccess ? "저장 완료" : "내용 저장"}
            </button>
            <button onClick={handlePrint} className="cursor-pointer flex items-center gap-1.5 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-md">
              <Printer className="w-4 h-4" /> 제안서 출력
            </button>
          </div>
        </div>

        {/* 메인 커버 페이지 */}
        <section className="relative flex flex-col justify-between bg-white border border-slate-400 w-full rounded-3xl p-10 md:p-16 mb-8 cover-page print:break-after-page overflow-hidden">
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 text-slate-900">
              보장 분석 및<br />비교 분석표
            </h1>
          </div>

          <div className="relative z-10 flex justify-between items-end border-t border-slate-700/50 pt-10">
            <div>
              <p className="text-sm text-slate-600 mb-2 uppercase tracking-wider">Prepared for</p>
              <p className="text-4xl font-bold text-slate-900">{client.name} <span className="text-2xl font-normal text-slate-600">고객님</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Financial Consultant</p>
              <p className="text-2xl font-bold text-slate-900">
                {agentInfo?.name || "담당자"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden flex flex-col gap-6">
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
                    <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      {displayGaps.length > 0 ? <AlertCircle className="w-5 h-5 text-red-500"/> : <ShieldCheck className="w-5 h-5 text-emerald-600"/>} 
                      기존 보장 공백 진단 결과
                    </h4>
                    {displayGaps.length > 0 && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600 w-fit">
                        미흡 보장 {displayGaps.length}건 발견
                      </span>
                    )}
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

                {/* ⭐️ 하단: 4개의 5각형 밸런스 차트 (카테고리별 분리) */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                  <div className="w-full mb-6">
                    <h4 className="text-base font-black text-slate-800 flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5 text-blue-600"/> 보장 밸런스
                    </h4>
                  </div>
                  
{/* 2x2 그리드로 4개의 차트 렌더링 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-y-12 print:gap-y-0 gap-x-4 w-full">
                    {CHART_CONFIG.map((config, idx) => {
                        const bData = config.items.map(item => {
                            // ⭐️ BINGO: 여기에 item.label 추가
                            const val = getChartValue(item.keywords, 'before', item.label);
                            const target = radarTargets[item.label] !== undefined ? radarTargets[item.label] : item.defaultTarget;
                            return Math.max(15, Math.min(100, (val / target) * 100));
                        });
                        const aData = config.items.map(item => {
                            // ⭐️ BINGO: 여기에도 item.label 추가
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

          <div className="flex flex-col gap-4 shrink-0 print-bundle mt-4">
            <div className="flex flex-col md:flex-row gap-4 print:flex print:flex-col print:flex-row">
              <div className="flex-1 bg-slate-50 border border-slate-200 p-6 rounded-2xl print:border-slate-300 flex flex-col justify-between print:flex-1 print:justify-between">
                 <p className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-1.5">
                   <AlertCircle className="w-4 h-4"/> 기존 유지안
                 </p>
                 <div className="space-y-4">
                   <div>
                     <p className="text-xs font-bold text-slate-400 mb-1">월 납입 보험료</p>
                     <p className="text-2xl font-black text-slate-700">{formatPremium(analysisData.premium.before)}</p>
                   </div>
                   <div className="border-t border-slate-200 pt-4 print:border-slate-300">
                     <p className="text-xs font-bold text-slate-400 mb-1">총 납입원금</p>
                     <p className={`text-xl font-black text-slate-500 ${totalPremiumDiff < 0 ? 'line-through decoration-slate-400' : ''}`}>
                       {formatMoney(Math.round(analysisData.totalPremium.before / 10000))}
                     </p>
                   </div>
                 </div>
              </div>

              <div className="flex-1 bg-blue-50/50 border border-blue-200 p-6 rounded-2xl print:bg-blue-50 print:border-blue-300 flex flex-col justify-between  print:flex-1 print:justify-between">
                 <p className="text-sm font-bold text-blue-600 mb-6 flex items-center gap-1.5">
                   <CheckCircle2 className="w-4 h-4"/> 최적화 제안
                 </p>
                 <div className="space-y-4">
                   <div>
                     <p className="text-xs font-bold text-blue-400 mb-1">월 납입 보험료</p>
                     <p className="text-2xl font-black text-gray-900">{formatPremium(afterPremium)}</p>
                   </div>
                   <div className="border-t border-blue-100 pt-4 print:border-blue-200">
                     <p className="text-xs font-bold text-blue-400 mb-1">총 납입원금</p>
                     <p className="text-xl font-black text-gray-900">
                       {formatMoney(Math.round(analysisData.totalPremium.after / 10000))}
                     </p>
                   </div>
                 </div>
              </div>
            </div>
            
            <div className={`print-card w-full p-5 md:p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-center gap-5 border print:shadow-none ${
              premiumDiff <= 0 ? 'bg-gradient-to-r from-blue-700 to-blue-600 border-blue-800' : 'bg-gradient-to-r from-slate-900 to-indigo-950 border-slate-800'
            }`}>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`p-3 rounded-full shrink-0 border ${premiumDiff <= 0 ? 'bg-white/10 border-white/20' : 'bg-indigo-500/20 border-indigo-500/30'}`}>
                  {premiumDiff <= 0 ? <TrendingDown className="w-8 h-8 text-yellow-300"/> : <ShieldCheck className="w-8 h-8 text-emerald-400 animate-pulse"/>}
                </div>
                <div>
                  <p className={`text-sm font-bold tracking-wide mb-1 ${premiumDiff <= 0 ? 'text-white/80' : 'text-indigo-300'}`}>
                    {premiumDiff <= 0 ? '💡 평생 고정 지출 절감 완료' : '🛡️ 가성비 중심 핵심 보장 자산 극대화'}
                  </p>
                  <p className="text-3xl font-black flex items-center gap-1.5 text-white">
                    {premiumDiff <= 0 ? (
                      <>
                        {formatPremium(Math.abs(premiumDiff))} 절감
                        <span className="text-xs font-medium text-white/60 ml-1">/ 월</span>
                      </>
                    ) : (
                      <>
                        3대 질환 진단 시 최대 비용
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full md:w-auto text-left md:text-right shadow-inner backdrop-blur-sm">
                {totalPremiumDiff <= 0 ? (
                  <>
                    <p className="text-[11px] font-medium mb-1 text-white/70">총 납입원금 기준 최종 세이브 자산</p>
                    <p className="text-2xl font-black text-yellow-300">{formatMoney(Math.round(Math.abs(totalPremiumDiff) / 10000))}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-black text-emerald-400">+ {formatMoney(calculateTotalDefenseCost())} 확보</p>
                  </>
                )}
              </div>
            </div>

            {(() => {
              const upgradedCoverages = analysisData.coverages.filter(item => item.after > item.before && !HIDDEN_IN_SUMMARY.includes(item.name));
              
              return (
                <div className="flex flex-col gap-8 mt-8 pt-8 border-t border-slate-200 border-dashed print:border-slate-300 print:mt-6 print:pt-6 print-bundle">
                  <div className={`flex flex-col justify-center ${upgradedCoverages.length === 0 ? 'print:hidden' : ''}`}>
                    <div className="mb-4">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600"/> 핵심 보장 TOP 3
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs font-bold text-gray-500">기존 대비 보장 금액이 <strong className="text-emerald-600">가장 많이 늘어난 3가지 핵심 담보</strong>입니다.</p>
                      </div>
                        {/* ⭐️ 변경됨: flex flex-wrap 대신 grid grid-cols-3 사용하여 강제 1줄 3칸 분할 */}
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
                                // ⭐️ 변경됨: w-full (너비 꽉 채움) 및 truncate (글자가 넘치면 ... 처리) 추가
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
                    value={briefingText}
                    onChange={(e) => setBriefingText(e.target.value)}
                    className="w-full min-h-[180px] bg-transparent text-1xl text-slate-600 font-medium leading-relaxed outline-none resize-none focus:border-b focus:border-blue-300 transition-colors print:border-none print:p-0"
                    rows={briefingText ? briefingText.split('\n').length + 1 : 3}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 보장 금액 합산 페이지 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            보장 금액 합계
            </h2>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-gray-900 w-3/9">담보 항목</th>
                <th className="px-4 py-4 text-right text-gray-500 w-2/9">기존</th>
                <th className="px-4 py-4 text-right font-bold text-blue-600 bg-blue-50/20 w-2/9">권장</th>
                <th className="px-4 py-4 text-right font-bold text-gray-900 w-2/9">증감</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayTableItems.map((item: any, index) => {
                const gap = item.after - item.before;
                return (
                  <tr key={index} className="print:break-inside-avoid">
                    <td className="px-4 py-2 font-semibold text-gray-800 flex items-center gap-1.5">
                      {item.name}
                    </td>
                    <td className={`px-4 py-2 text-right ${item.before === 0 ? 'text-red-400' : 'text-gray-500 font-bold'}`}>
                      {item.before === 0 ? '-' : formatMoney(item.before)}
                    </td>
                    <td className={`px-4 py-2 text-right ${item.after === 0 ? 'text-gray-800' : 'text-blue-600 font-bold'}`}>
                      {item.after === 0 ? '-' : formatMoney(item.after)}
                    </td>
                    <td className="px-4 py-2 text-right font-bold">
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
        <section className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:border-slate-300">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                C00 ~ D09 (신생물/암 질환) 상세 코드별 보장금액 진단
              </h2>
            </div>
          </div>

          <div className="space-y-8">
            {CANCER_CODES.map((group, groupIdx) => (
              <div key={groupIdx} className="bg-slate-50/50 rounded-2xl p-1 print:p-0 print:bg-transparent">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-center border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 text-left font-bold text-slate-600 w-[40%]">KCD 질환명 (분류코드)</th>
                        <th className="py-3 px-2 font-bold text-slate-500 w-[25%] border-l border-slate-200">기존 보장액</th>
                        <th className="py-3 px-2 font-black text-blue-600 w-[25%] bg-blue-50 border-l border-blue-100 shadow-inner">권장 보장액</th>
                        <th className="py-3 px-2 font-bold text-slate-500 w-[10%] border-l border-slate-200">★</th>
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
                          <tr key={itemIdx} className={isUpgraded ? 'bg-blue-50/10 hover:bg-blue-50/30 transition-colors' : 'hover:bg-slate-50/50'}>
                            <td className="py-2 px-4 text-left">
                              <div className="flex flex-col gap-0.5">
                                <span className={`font-bold text-[13px] ${isUpgraded ? 'text-blue-900' : 'text-slate-800'}`}>
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
                            <td className={`py-2 px-2 border-l border-slate-100 ${isZeroBefore ? 'text-red-400' : 'text-slate-600 font-bold'}`}>
                              {isZeroBefore ? <X className="w-4 h-4 mx-auto" strokeWidth={3} /> : formatMoney(beforeAmt)}
                            </td>
                            <td className={`py-2 px-2 border-l border-blue-100 bg-blue-50/30 font-black ${afterAmt > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                              {
                                afterAmt > 0 ? 
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span className="font-black text-blue-600">{formatMoney(afterAmt)}</span>
                                </div>
                                 : 
                                '-'
                              }
                            </td>
                            <td className="py-2 px-2 border-l border-slate-100 text-center text-slate-300">
                               {isHighlight ? <Star className="w-4 h-4 fill-amber-500 text-amber-500 mx-auto" /> : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* I00 ~ I99 순환계 질환 상세 코드별 보장금액 진단 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 print:border-slate-300">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                I00 ~ I99 (순환계 질환) 상세 코드별 보장금액 진단
              </h2>
            </div>
          </div>

          <div className="space-y-8">
            {CIRCULATORY_CODES.map((group, groupIdx) => (
              <div key={groupIdx} className="bg-slate-50/50 rounded-2xl p-1 print:p-0 print:bg-transparent">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-center border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 text-left font-bold text-slate-600 w-[40%]">KCD 질환명 (분류코드)</th>
                        <th className="py-3 px-2 font-bold text-slate-500 w-[25%] border-l border-slate-200">기존 보장액</th>
                        <th className="py-3 px-2 font-black text-blue-600 w-[25%] bg-blue-50 border-l border-blue-100 shadow-inner">권장 보장액</th>
                        <th className="py-3 px-2 font-bold text-slate-500 w-[10%] border-l border-slate-200">★</th>
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
                          <tr key={itemIdx} className={isUpgraded ? 'bg-blue-50/10 hover:bg-blue-50/30 transition-colors' : 'hover:bg-slate-50/50'}>
                            <td className="py-2 px-4 text-left">
                              <div className="flex flex-col gap-0.5">
                                <span className={`font-bold text-[13px] ${isUpgraded ? 'text-blue-900' : 'text-slate-800'}`}>
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
                            <td className={`py-2 px-2 border-l border-slate-100 ${isZeroBefore ? 'text-red-400' : 'text-slate-600 font-bold'}`}>
                              {isZeroBefore ? <X className="w-4 h-4 mx-auto" strokeWidth={3} /> : formatMoney(beforeAmt)}
                            </td>
                            <td className={`py-2 px-2 border-l border-blue-100 bg-blue-50/30 font-black ${afterAmt > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                              {
                                afterAmt > 0 ?  
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <span className="font-black text-blue-700">{formatMoney(afterAmt)}</span>
                                  </div>
                                : '-'
                               }
                            </td>
                            <td className="py-2 px-2 border-l border-slate-100 text-center text-slate-300">
                               {isHighlight ? <Star className="w-4 h-4 fill-amber-500 text-amber-500 mx-auto" /> : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* 리모델링 상세 내역 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 print:border-slate-300">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            보험 상세 내역
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 print:grid-cols-2 print:divide-y-0 print:divide-x">
            
            {/* 왼쪽: 리모델링 전 */}
            <div className="p-4 md:p-6 border-0 print:pl-0 print:pt-0">
              <h3 className="font-bold text-slate-700 mb-5 flex items-center gap-2 border-b border-slate-200 pb-3 text-lg">
                기존 보험내역
              </h3>
              <div className="space-y-5">
                {analysisData.rawPolicies
                  .filter(p => p.policy_status === "maintain" || p.policy_status === "cancel")
                  .sort((a, b) => compareEnglishKorean(a.insurance_company || "", b.insurance_company || ""))
                  .map(cov => (
                  <div key={cov.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm print:break-inside-avoid">
                    <div className="flex justify-between items-start mb-3">
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
                      <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-slate-200">
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
            <div className="p-4 md:p-6 border-0 print:pr-0 print:pt-0">
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

                    return (
                      <div key={cov.id} className={`bg-white rounded-xl border p-5 shadow-sm print:break-inside-avoid ${isNew ? 'border-emerald-300 bg-emerald-50/20' : isCanceled ? 'border-red-200 bg-red-50/20 opacity-80' : 'border-blue-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              {isNew && <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider">신규</span>}
                              {isCanceled && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider">해지</span>}
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
                          <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-slate-200">
                            {cov.details.map((d: any, i: number) => {
                              const isEffectivelyDeleted = isCanceled || d.is_deleted;
                              const beforeDetailAmt = extractNumber(d.original_amount || d.amount);
                              const afterDetailAmt = extractNumber(d.amount);
                              const isDetailReduced = d.original_amount && afterDetailAmt < beforeDetailAmt;
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
                                  <span className={`font-bold shrink-0 ${isEffectivelyDeleted ? '' : (isDetailReduced ? 'text-red-600' : (d.original_amount ? 'text-blue-600' : 'text-slate-800'))}`}>
                                    {isCanceled ? '해지됨' : (d.is_deleted ? '삭제됨' : `${formatDetailAmount(d.amount)}만원`)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
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
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-400 shadow-sm print:p-0 print:border-none print:break-inside-avoid print:shadow-none relative overflow-hidden">
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
        />
      </div>

    </>
  );
}