"use client";

import { useState } from "react";
import { Stethoscope, AlertTriangle, CheckCircle2, Save, UploadCloud, FileText, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Checklist = {
  q3Month_hospital: boolean;
  q1Year_same_disease: boolean;
  q5Year_surgery_suspect: boolean;
  q5Year_hospitalization: boolean;
  q5Year_7days_visit: boolean;
  q5Year_30days_medication: boolean;
};

type Props = {
  clientId: string;
  initialHistory?: any;
};

export default function ClientsMedicalHistoryCard({ clientId, initialHistory }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  
  const [checklist, setChecklist] = useState<Checklist>({
    q3Month_hospital: initialHistory?.checklist?.q3Month_hospital ?? false,
    q1Year_same_disease: initialHistory?.checklist?.q1Year_same_disease ?? false,
    q5Year_surgery_suspect: initialHistory?.checklist?.q5Year_surgery_suspect ?? false,
    q5Year_hospitalization: initialHistory?.checklist?.q5Year_hospitalization ?? false,
    q5Year_7days_visit: initialHistory?.checklist?.q5Year_7days_visit ?? false,
    q5Year_30days_medication: initialHistory?.checklist?.q5Year_30days_medication ?? false,
  });

  const [medicalMemo, setMedicalMemo] = useState(initialHistory?.memo || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      setIsAnalyzed(false);
      setProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setIsAnalyzed(false);
    setProgress(0);
  };

  const saveToSupabase = async (targetChecklist: Checklist, targetMemo: string) => {
    if (!clientId) return;
    setIsSaving(true);
    setIsSaveSuccess(false);

    try {
      const payload = { checklist: targetChecklist, memo: targetMemo };
      const { error } = await supabase.from("clients").update({ medical_history: payload }).eq("id", parseInt(clientId, 10));

      if (error) throw error;
      
      setIsSaveSuccess(true);
      setTimeout(() => setIsSaveSuccess(false), 2000);
      
    } catch (error: any) {
      alert(`저장 실패 원인: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzePDFs = async () => {
    if (files.length === 0) return alert("분석할 PDF 파일을 업로드해주세요.");
    
    setIsAnalyzing(true);
    setProgress(0);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      // ⭐️ 수정 1: 시·분·초 오차를 제거한 로컬 자정(00:00:00) 기준 정확한 날짜 계산
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const parseLocalDate = (dateStr: string) => {
        const [y, m, d] = dateStr.replace(/[-./]/g, "-").split("-").map(Number);
        return new Date(y, m - 1, d, 0, 0, 0, 0);
      };

      const getDiffDays = (dateStr: string) => {
        const treatDate = parseLocalDate(dateStr);
        return Math.floor((today.getTime() - treatDate.getTime()) / (1000 * 60 * 60 * 24));
      };

      // 달력 기준 정확히 3개월 전 날짜 및 90일 기준 동시 충족 (31일이 낀 달의 91~92일 경계 누락 방지)
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate(), 0, 0, 0, 0);
      const isWithin3Months = (dateStr: string) => {
        const diff = getDiffDays(dateStr);
        if (diff < 0) return false;
        const treatDate = parseLocalDate(dateStr);
        return treatDate >= threeMonthsAgo || diff <= 90;
      };

      const basicData: any[] = [];
      const detailData: any[] = [];
      const rxData: any[] = [];

      // ⭐️ 수정 2: 다른 행의 날짜(\d{4}-\d{2}-\d{2})를 침범하지 않도록 방어하고 '처방조제' 및 4열 금액까지 완벽히 대응하는 정규식
      const basicRx = /(?:(?:\b\d+\s*\|?\s*)?(\d{4}-\d{2}-\d{2})(?:\s*\|?\s*\d+(?=\s|\|))?)\s*\|?\s*((?:(?!\d{4}-\d{2}-\d{2})[^|])+?)(?:\s+|\|)+(외래|입원|처방\s*조제|보건기관|약국|해당없음)(?:\s+|\|)+([A-Za-z0-9\$\.]+|-)\s*\|?\s*((?:(?!\d{4}-\d{2}-\d{2})[^|])+?)(?:\s+|\|)+([\d,]+)(?:\s+|\|)+([\d,]+)(?:\s+|\|)+([\d,]+)(?:(?:\s+|\|)+([\d,]+(?=\s+(?:\d+\s*\|?\s*)?\d{4}-\d{2}-\d{2}\b|\s*$|\s*\|)))?/g;

      const detailRx = /(?:(?:\b\d+\s*\|?\s*)?(\d{4}-\d{2}-\d{2})(?:\s*\|?\s*\d+(?=\s|\|))?)\s*\|?\s*([가-힣a-zA-Z0-9\s\(\)\-\.,]+?(?:과의원|과\s*의원|과병원|과\s*병원|치과의원|치과병원|한의원|한방병원|대학교병원|대학병원|의원|약국|병원|센터|보건소|의료원|치과|과(?!\s*(?:의원|병원))))\s*\|?\s*((?:(?!\d{4}-\d{2}-\d{2})[\s\S])+?)(?:\s+|\|)+(\d+(?:\.\d+)?)(?:\s+|\|)+(\d+)(?:\s+|\|)+(\d+)/g;

      let totalPages = 0;
      let processedPages = 0;
      const loadedPdfs = [];

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        totalPages += pdf.numPages;
        loadedPdfs.push({ file, pdf });
      }

      for (const { file, pdf } of loadedPdfs) {
        let fileText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fileText += textContent.items.map((item: any) => item.str).join(" ") + " ";
          processedPages++;
          setProgress(Math.round((processedPages / totalPages) * 60)); 
        }

        const combinedText = fileText.replace(/\n/g, " ");
        let match;

        // [1] 기본.PDF 파싱
        if (file.name.includes("기본") || file.name.includes("요약")) {
          let basicLoopCount = 0;
          basicRx.lastIndex = 0;
          while ((match = basicRx.exec(combinedText)) !== null) {
            const date = match[1];
            const middleText = (match[2] || "").trim();
            const inOut = (match[3] || "").replace(/\s+/g, "");
            let kcd = (match[4] || "").trim();
            if (kcd === "-") kcd = "코드없음";
            const disease = (match[5] || "").trim();
            
            const numDays = match[6] || "0"; 
            const numCost = match[7] || "0";
            
            // 기관명 뒤에 공백이 없어도('온누리 약국', '서울 정형외과의원' 등) 잘리지 않도록 보완
            const extractMatch = middleText.match(/^(.*?(?:과의원|과\s*의원|과병원|과\s*병원|치과의원|치과병원|한의원|한방병원|대학교병원|대학병원|의원|약국|병원|센터|보건소|의료원|치과|대학))(?:\s+.*)?$/);
            const hospital = extractMatch ? extractMatch[1].trim() : middleText;
            
            const days = parseInt(numDays.replace(/,/g, ''), 10) || 0;
            const cost = parseInt(numCost.replace(/,/g, ''), 10) || 0;
            
            basicData.push({ date, hospital, type: inOut, kcd, disease, days, cost });

            if (++basicLoopCount % 50 === 0) await new Promise(resolve => setTimeout(resolve, 10));
          }
        } 
        // [2] 처방.PDF 파싱
        else if (file.name.includes("처방") || file.name.includes("약품")) {
          let detailLoopCount = 0;
          detailRx.lastIndex = 0;
          while ((match = detailRx.exec(combinedText)) !== null) {
            const date = match[1];
            const hospital = (match[2] || "").trim();
            const middleText = match[3] || "";
            const days = parseInt(match[6], 10) || 0;

            let cleanMiddle = middleText.replace(/(외래|입원|처방\s*조제)/g, '').trim();
            cleanMiddle = cleanMiddle.replace(/^(?:의원|약국|병원)\s*\|?\s*/g, '').trim();
            let drugName = cleanMiddle;

            if (cleanMiddle.includes('|')) {
              const parts = cleanMiddle.split('|').map(s => s.trim()).filter(s => s !== '');
              drugName = parts[0] || "";
            } else {
              const extractMatch = cleanMiddle.match(/^(.*?\))(?=\s*[a-zA-Z])/);
              if (extractMatch) {
                drugName = extractMatch[1].trim();
              } else {
                const engMatch = cleanMiddle.search(/\s[a-z]{3,}/);
                if (engMatch > 0) {
                  drugName = cleanMiddle.substring(0, engMatch).trim();
                } else {
                  drugName = cleanMiddle.split(/\s{2,}/)[0];
                }
              }
            }
            rxData.push({ date, hospital, drugName, days });
            if (++detailLoopCount % 50 === 0) await new Promise(resolve => setTimeout(resolve, 10));
          }
        } 
        // [3] 세부.PDF 파싱
        else if (file.name.includes("세부")) {
          let detailLoopCount = 0;
          detailRx.lastIndex = 0;
          while ((match = detailRx.exec(combinedText)) !== null) {
            const date = match[1];
            const hospital = (match[2] || "").trim();
            const middleText = match[3] || "";
            detailData.push({ date, hospital, treatDetails: middleText.replace(/\s/g, ''), rawMiddle: middleText });
            if (++detailLoopCount % 50 === 0) await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      }

      setProgress(80);

      // ⭐️ 공통 헬퍼 1: 세부.PDF(detailData)에서 '처치명' 추출 (5년 내 수술 의심과 동일한 정제 규칙)
      const extractDetailCodeName = (rawMiddle: string): string => {
        let codeName = "";
        if (rawMiddle.includes('|')) {
          const parts = rawMiddle.split('|').map((s: string) => s.trim()).filter(Boolean);
          codeName = parts.length > 1 ? parts.slice(1).join(' / ') : parts[0];
        } else {
          codeName = rawMiddle.replace(/^.*?(?:\(양방\)|\(한방\)|조제료등|회송료 등|회송료등|료등)\s*/, '').trim();
        }
        return codeName || "확인필요";
      };

      // 특정 일자 + 병원에 해당하는 '처치명' 목록 조회 ('처치' 항목 최우선, 없을 시 주요 검사/치료 항목 추출)
      const getTreatNamesForVisit = (date: string, hospital: string): string => {
        if (!hospital || hospital.includes("약국")) return "";
        const cleanHospPrefix = hospital.replace(/\s+/g, "").substring(0, 2);
        const sameVisitDetails = detailData.filter(
          d => d.date === date && d.hospital.replace(/\s+/g, "").substring(0, 2) === cleanHospPrefix
        );
        if (sameVisitDetails.length === 0) return "";

        // 1순위: '처치'(처치및수술료)가 포함된 항목 추출
        const procDetails = sameVisitDetails.filter(d => d.treatDetails.includes("처치"));
        if (procDetails.length > 0) {
          const names = Array.from(new Set(procDetails.map(d => extractDetailCodeName(d.rawMiddle))));
          return names.join(" / ");
        }

        // 2순위: '처치' 항목이 없는 입원/외래의 경우 기본 진찰료·입원료·조제료를 제외한 주요 치료/검사명 추출
        const otherDetails = sameVisitDetails.filter(
          d => !/(진찰료|입원료|투약및조제|의약품관리|식대)/.test(d.treatDetails)
        );
        if (otherDetails.length > 0) {
          const names = Array.from(new Set(otherDetails.map(d => extractDetailCodeName(d.rawMiddle)))).slice(0, 5);
          return names.join(" / ");
        }
        return "";
      };

      // ⭐️ 공통 헬퍼 2: 특정 일자의 처방.PDF(rxData) 최대 투약일수 계산 (6번 항목과 동일 방식)
      const getMaxRxDaysForDate = (date: string): number => {
        const sameDateRx = rxData.filter(rx => rx.date === date);
        if (sameDateRx.length === 0) return 0;
        return Math.max(...sameDateRx.map(rx => rx.days || 0));
      };

      let results = { q3M: false, q1Y: false, q5YSurg: false, q5YHosp: false, q5Y7D: false, q5Y30D: false };
      
      const todayStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
      let memoLines: string[] = [`■ 심평원 자동 분석 기반 주요 병력 (분석일: ${todayStr})`];

      // ① 3개월 내 다녀온 병원 및 약국 이력 (날짜 보정 + 처치명 추가 + 약 처방 투약일수 추가)
      const rule1_basic = basicData.filter(r => isWithin3Months(r.date));
      const rule1_rx = rxData.filter(r => isWithin3Months(r.date));

      if (rule1_basic.length > 0 || rule1_rx.length > 0) {
        results.q3M = true;
        memoLines.push("\n[3개월 내 다녀온 병원 및 약국 이력]");
        const r1_printed = new Set<string>();
        const coveredRxDates = new Set<string>();

        rule1_basic.forEach(r => {
          const isPharmacy = r.hospital.includes("약국") || r.type === "처방조제";
          if (isPharmacy) {
            const hasHospitalSameDay = rule1_basic.some(
              b => b.date === r.date && !b.hospital.includes("약국") && b.type !== "처방조제"
            );
            // 같은 날 병원 진료 내역이 있으면 병원 줄에 (N일 투약)이 통합 표시되므로 중복 약국 줄은 생략
            if (hasHospitalSameDay) return;
          }

          const treatName = getTreatNamesForVisit(r.date, r.hospital);
          const maxRxDays = getMaxRxDaysForDate(r.date);
          if (maxRxDays > 0) coveredRxDates.add(r.date);

          let lineText = `- ${r.date} · ${r.hospital} · ${r.kcd} · ${r.disease}`;
          if (treatName) lineText += ` · 처치명: ${treatName}`;
          if (maxRxDays > 0) lineText += ` (${maxRxDays}일 투약)`;

          if (!r1_printed.has(lineText)) {
            memoLines.push(lineText);
            r1_printed.add(lineText);
          }
        });

        // 만약 기본.PDF에는 없고 처방.PDF(rxData)에만 존재하는 3개월 내 처방 이력이 있다면 6번과 동일하게 매칭하여 출력
        const uncoveredRxDates = Array.from(new Set(rule1_rx.map(r => r.date))).filter(d => !coveredRxDates.has(d));
        uncoveredRxDates.forEach(date => {
          const rowsOnDate = rule1_rx.filter(r => r.date === date);
          const maxDays = Math.max(...rowsOnDate.map(r => r.days || 0));
          const repRx = rowsOnDate[0];

          let matchedHospital = basicData.find(
            b => b.date === date && (repRx.hospital.includes(b.hospital) || b.hospital.includes(repRx.hospital)) && b.kcd !== "코드없음" && !b.hospital.includes("약국")
          );
          if (!matchedHospital) {
            matchedHospital = basicData.find(b => b.date === date && b.kcd !== "코드없음" && !b.hospital.includes("약국"));
          }
          if (!matchedHospital) {
            matchedHospital = basicData.find(b => b.date === date && b.kcd !== "코드없음");
          }

          const displayHospital = matchedHospital ? matchedHospital.hospital : repRx.hospital;
          const kcd = matchedHospital ? matchedHospital.kcd : "코드없음";
          const disease = matchedHospital ? matchedHospital.disease : "처방조제";
          const treatName = getTreatNamesForVisit(date, displayHospital);

          let lineText = `- ${date} · ${displayHospital} · ${kcd} · ${disease}`;
          if (treatName) lineText += ` · 처치명: ${treatName}`;
          if (maxDays > 0) lineText += ` (${maxDays}일 투약)`;

          if (!r1_printed.has(lineText)) {
            memoLines.push(lineText);
            r1_printed.add(lineText);
          }
        });
      }

      // ② 1년 내 같은 질병(코드) 병원 이력 (약국 제외)
      const rule2_rows = basicData.filter(r => getDiffDays(r.date) <= 365 && r.kcd !== "코드없음" && !r.hospital.includes("약국"));
      const r2_groups: Record<string, any[]> = {};
      rule2_rows.forEach(r => { if (!r2_groups[r.kcd]) r2_groups[r.kcd] = []; r2_groups[r.kcd].push(r); });
      let r2_found = false;
      for (const [kcd, rows] of Object.entries(r2_groups)) {
        if (rows.length >= 2) {
          results.q1Y = true;
          if (!r2_found) { memoLines.push("\n[1년 내 같은 질병(코드) 병원 이력]"); r2_found = true; }
          rows.forEach(r => memoLines.push(`- ${r.date} · ${r.hospital} · ${r.kcd} · ${r.disease}`));
        }
      }

      // ③ 5년 내 수술 의심 (세부PDF 4열 '처치' -> 기본PDF 교차검증 -> 9열 5만원 이상)
      const rule3_map = new Map();
      detailData.filter(d => getDiffDays(d.date) <= 1825 && d.treatDetails.includes("처치")).forEach(d => {
        const codeName = extractDetailCodeName(d.rawMiddle);

        const matched = basicData.filter(b => 
          b.date === d.date && 
          (b.hospital.replace(/\s+/g, "").substring(0, 2) === d.hospital.replace(/\s+/g, "").substring(0, 2)) && 
          b.cost >= 50000
        );
        
        matched.forEach(b => {
          const key = `${b.date}_${b.hospital}_${b.kcd}`;
          if (!rule3_map.has(key)) {
            rule3_map.set(key, { ...b, detailCodeName: codeName });
          } else {
            const existing = rule3_map.get(key);
            if (!existing.detailCodeName.includes(codeName)) {
              existing.detailCodeName += ` / ${codeName}`;
            }
          }
        });
      });
      
      const uniqueRule3 = Array.from(rule3_map.values());
      if (uniqueRule3.length > 0) {
        results.q5YSurg = true;
        memoLines.push("\n[5년 내 수술 의심]");
        uniqueRule3.forEach((r: any) => memoLines.push(`- ${r.date} · ${r.hospital} · ${r.kcd} · ${r.disease} · 처치명: ${r.detailCodeName}`));
      }

      // ④ ⭐️ 5년 내 입원 이력 ('처치명' 추출 추가)
      const rule4 = basicData.filter(r => getDiffDays(r.date) <= 1825 && r.type === "입원");
      if (rule4.length > 0) {
        results.q5YHosp = true;
        memoLines.push("\n[5년 내 입원 이력]");
        rule4.forEach(r => {
          const treatName = getTreatNamesForVisit(r.date, r.hospital);
          let lineText = `- ${r.date} · ${r.hospital} · ${r.kcd} · ${r.disease} · ${r.days}일`;
          if (treatName) lineText += ` · 처치명: ${treatName}`;
          memoLines.push(lineText);
        });
      }

      // ⑤ 5년 내 같은 코드로 7번 이상 병원 이력 (약국 제외)
      const rule5_rows = basicData.filter(r => getDiffDays(r.date) <= 1825 && r.kcd !== "코드없음" && !r.hospital.includes("약국"));
      const r5_groups: Record<string, any[]> = {};
      rule5_rows.forEach(r => { if (!r5_groups[r.kcd]) r5_groups[r.kcd] = []; r5_groups[r.kcd].push(r); });
      let r5_found = false;
      for (const [kcd, rows] of Object.entries(r5_groups)) {
        if (rows.length >= 7) {
          results.q5Y7D = true;
          if (!r5_found) { memoLines.push("\n[5년 내 같은 코드로 7번 이상 병원 이력]"); r5_found = true; }
          rows.forEach(r => memoLines.push(`- ${r.date} · ${r.hospital} · ${r.kcd} · ${r.disease}`));
        }
      }

      // ⑥ 5년 내 같은 질병코드(KCD)로 30일 이상 투약
      const rule6_rows = rxData.filter(r => getDiffDays(r.date) <= 1825);
      const r6_groups: Record<string, any[]> = {};
      
      rule6_rows.forEach(r => {
        let matchedHospital = basicData.find(b => b.date === r.date && (r.hospital.includes(b.hospital) || b.hospital.includes(r.hospital)) && b.kcd !== "코드없음" && !b.hospital.includes("약국"));
        if (!matchedHospital) {
          matchedHospital = basicData.find(b => b.date === r.date && b.kcd !== "코드없음" && !b.hospital.includes("약국"));
        }
        if (!matchedHospital) {
          matchedHospital = basicData.find(b => b.date === r.date && b.kcd !== "코드없음");
        }
        
        const kcd = matchedHospital ? matchedHospital.kcd : "코드없음";
        const disease = matchedHospital ? matchedHospital.disease : "질병코드없음";
        const displayHospital = matchedHospital ? matchedHospital.hospital : r.hospital;

        if (kcd !== "코드없음") {
          if (!r6_groups[kcd]) r6_groups[kcd] = [];
          r6_groups[kcd].push({ ...r, displayHospital, kcd, disease });
        }
      });

      let r6_found = false;
      const r6_printed = new Set<string>(); 
      
      for (const [kcd, rows] of Object.entries(r6_groups)) {
        const dateGroups: Record<string, number> = {};
        rows.forEach(r => {
          if (!dateGroups[r.date] || dateGroups[r.date] < r.days) {
            dateGroups[r.date] = r.days;
          }
        });
        
        const totalDays = Object.values(dateGroups).reduce((sum, days) => sum + days, 0);
        
        if (totalDays >= 30) {
          results.q5Y30D = true;
          if (!r6_found) { memoLines.push("\n[5년 내 같은 질병(코드)으로 30일 이상 투약]"); r6_found = true; }
          
          for (const [date, maxDays] of Object.entries(dateGroups)) {
            const repRow = rows.find(r => r.date === date);
            const lineText = `- ${date} · ${repRow.displayHospital} · ${repRow.kcd} · ${repRow.disease} (${maxDays}일 투약)`;
            if (!r6_printed.has(lineText)) {
              memoLines.push(lineText);
              r6_printed.add(lineText);
            }
          }
        }
      }

      const newChecklist = {
        q3Month_hospital: results.q3M,
        q1Year_same_disease: results.q1Y,
        q5Year_surgery_suspect: results.q5YSurg,
        q5Year_hospitalization: results.q5YHosp,
        q5Year_7days_visit: results.q5Y7D,
        q5Year_30days_medication: results.q5Y30D,
      };

      const newMemo = memoLines.length > 1 ? memoLines.join("\n") : `■ 심평원 자동 분석 기반 주요 병력 (분석일: ${todayStr})\n\n분석 결과 특이사항(알릴의무 위반 소지)이 발견되지 않았습니다.`;

      setChecklist(newChecklist);
      setMedicalMemo(newMemo);

      setProgress(100);
      await new Promise(res => setTimeout(res, 300));
      setIsAnalyzed(true);

      await saveToSupabase(newChecklist, newMemo);

    } catch (err: any) {
      alert(`PDF 분석 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSave = () => saveToSupabase(checklist, medicalMemo);

  return (
    <div className="w-full flex h-full flex-col md:rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm min-h-0">
      
      {/* 상단 헤더 영역 */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <Stethoscope className="h-4 w-4" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">병력 및 알릴 의무</h2>
        </div>
        
        <button 
          onClick={handleManualSave} 
          disabled={isSaving || isSaveSuccess || isAnalyzing}
          className={`flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-md transition-colors shadow-sm disabled:opacity-100 ${
            isSaveSuccess ? "bg-green-600 cursor-not-allowed" : isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-700 cursor-pointer"
          }`}
        >
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : isSaveSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          {isSaving ? "저장 중..." : isSaveSuccess ? "저장 완료" : "저장"}
        </button>
      </div>

      {/* 내부 스크롤 영역 */}
      <div className="flex-1 flex flex-col overflow-y-auto pr-1 gap-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-slate-700">심평원 진료내역 자동 분석<br/><span className="text-blue-600"> (요약ㆍ기본ㆍ세부ㆍ처방)</span></p>
            
            {files.length > 0 && !isAnalyzed && (
              isAnalyzing ? (
                <div className="relative overflow-hidden bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs min-w-[120px] justify-center shadow-inner">
                  <div className="absolute left-0 top-0 bottom-0 bg-blue-300 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                  <span className="relative z-10 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> {progress}% 진행 중
                  </span>
                </div>
              ) : (
                <button onClick={handleAnalyzePDFs} className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition shadow-sm">
                  데이터 추출 및 분석
                </button>
              )
            )}
            {isAnalyzed && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 분석 완료</span>}
          </div>

          <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-4 pb-4">
              <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-xs text-slate-500"><span className="font-semibold text-blue-600">클릭하여 파일 첨부</span> (심평원 PDF 다중 선택 가능)</p>
            </div>
            <input type="file" multiple accept=".pdf" className="hidden" onChange={handleFileChange} disabled={isAnalyzing} />
          </label>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 truncate">
                    <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  {!isAnalyzing && <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 p-1"><X className="w-3 h-3" /></button>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 shrink-0">
          {[
            { id: "q3Month_hospital", label: "3개월 내 다녀온 병원 및 약국 이력" },
            { id: "q1Year_same_disease", label: "1년 내 같은 질병(코드) 병원 이력" },
            { id: "q5Year_surgery_suspect", label: "5년 내 수술 의심 (처치/수술 & 5만원↑)" },
            { id: "q5Year_hospitalization", label: "5년 내 입원 이력" },
            { id: "q5Year_7days_visit", label: "5년 내 같은 코드로 7번 이상 병원 이력" },
            { id: "q5Year_30days_medication", label: "5년 내 같은 약품으로 30일 이상 투약" },
          ].map((item) => {
            const isChecked = checklist[item.id as keyof Checklist];
            return (
              <label key={item.id} className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                <span className={`text-xs font-medium flex items-center gap-2 ${isChecked ? 'text-red-700' : 'text-gray-700'}`}>
                  {isChecked ? <CheckCircle2 className="w-3.5 h-3.5 text-red-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500/70" />}
                  {item.label}
                </span>
                <input type="checkbox" checked={isChecked} onChange={(e) => setChecklist({...checklist, [item.id]: e.target.checked})} className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500" />
              </label>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-h-[160px]">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 shrink-0">병력 상세 메모</p>
          <textarea
            className={`w-full min-h-[500px] flex-1 rounded-lg border p-3 text-xs text-gray-800 leading-relaxed resize-none focus:outline-none transition-colors ${isAnalyzed && medicalMemo.includes("알릴 의무 대상") ? 'border-red-300 bg-red-50/20 focus:ring-1 focus:ring-red-500' : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
            placeholder="상세 병력 사항이나 고지 의무 특이사항을 기록하세요..."
            value={medicalMemo}
            onChange={(e) => setMedicalMemo(e.target.value)}
          />
        </div>

      </div>
    </div>
  );
}