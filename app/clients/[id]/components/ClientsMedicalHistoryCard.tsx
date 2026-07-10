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

      const today = new Date();
      const getDiffDays = (dateStr: string) => {
        const treatDate = new Date(dateStr.replace(/[-./]/g, '-'));
        return (today.getTime() - treatDate.getTime()) / (1000 * 60 * 60 * 24);
      };

      const basicData: any[] = [];
      const detailData: any[] = [];
      const rxData: any[] = [];

      const basicRx = /(?:(\d{4}-\d{2}-\d{2})\s*\|?\s*(\d+)|(\d+)\s*\|?\s*(\d{4}-\d{2}-\d{2}))\s*\|?\s*(.*?)(?:\s+|\|)+(외래|입원|해당없음)(?:\s+|\|)+([A-Za-z0-9\$\.]+|-)\s*\|?\s*([^|]+?)(?:\s+|\|)+([\d,]+)(?:\s+|\|)+([\d,]+)(?:\s+|\|)+([\d,]+)/g;
      const detailRx = /(?:(\d{4}-\d{2}-\d{2})\s*\|?\s*(\d+)|(\d+)\s*\|?\s*(\d{4}-\d{2}-\d{2}))\s*\|?\s*([가-힣a-zA-Z0-9\s]+?(?:과의원|과\s*의원|과병원|과\s*병원|의원|약국|병원|한의원|센터|보건소|의료원|과))\s*\|?\s*((?:(?!\d{4}-\d{2}-\d{2})[\s\S])+?)(?:\s+|\|)+(\d+(?:\.\d+)?)(?:\s+|\|)+(\d+)(?:\s+|\|)+(\d+)/g;

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
          while ((match = basicRx.exec(combinedText)) !== null) {
            let date = match[1] || match[4];
            let middleText = match[5] || "";
            let inOut = match[6];
            let kcd = match[7];
            if (kcd === "-") kcd = "코드없음";
            let disease = (match[8] || "").trim();
            
            let numDays = match[9] || "0"; 
            let numCost = match[10] || "0";
            
            let extractMatch = middleText.match(/^(.*?(?:의원|병원|약국|센터|보건소|의료원|치과|한의원|대학))\s+(.*)$/);
            let hospital = extractMatch ? extractMatch[1].trim() : middleText.split(' ')[0];
            
            let days = parseInt(numDays.replace(/,/g, ''), 10) || 0;
            let cost = parseInt(numCost.replace(/,/g, ''), 10) || 0;
            
            basicData.push({ date, hospital, type: inOut, kcd, disease, days, cost });

            if (++basicLoopCount % 50 === 0) await new Promise(resolve => setTimeout(resolve, 10));
          }
        } 
        // [2] 처방.PDF 파싱
        else if (file.name.includes("처방") || file.name.includes("약품")) {
          let detailLoopCount = 0;
          while ((match = detailRx.exec(combinedText)) !== null) {
            let date = match[1] || match[4];
            let hospital = (match[5] || "").trim();
            let middleText = match[6] || "";
            let days = parseInt(match[9], 10) || 0;

            let cleanMiddle = middleText.replace(/(외래|입원|처방\s*조제)/g, '').trim();
            cleanMiddle = cleanMiddle.replace(/^(?:의원|약국|병원)\s*\|?\s*/g, '').trim();
            let drugName = cleanMiddle;

            if (cleanMiddle.includes('|')) {
              let parts = cleanMiddle.split('|').map(s => s.trim()).filter(s => s !== '');
              drugName = parts[0] || "";
            } else {
              let extractMatch = cleanMiddle.match(/^(.*?\))(?=\s*[a-zA-Z])/);
              if (extractMatch) {
                drugName = extractMatch[1].trim();
              } else {
                let engMatch = cleanMiddle.search(/\s[a-z]{3,}/);
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
          while ((match = detailRx.exec(combinedText)) !== null) {
            let date = match[1] || match[4];
            let hospital = (match[5] || "").trim();
            let middleText = match[6] || "";
            detailData.push({ date, hospital, treatDetails: middleText.replace(/\s/g, '') });
            if (++detailLoopCount % 50 === 0) await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      }

      setProgress(80);

      // ⭐️ 3. 데이터 필터링 및 구분자(·)를 적용한 메모 작성
      let results = { q3M: false, q1Y: false, q5YSurg: false, q5YHosp: false, q5Y7D: false, q5Y30D: false };
      let memoLines: string[] = ["■ 심평원 자동 분석 기반 주요 병력 (알릴 의무 대상)"];

      // ① 3개월 내 다녀온 병원 이력 (약국 포함)
      const rule1 = basicData.filter(r => getDiffDays(r.date) <= 90);
      if (rule1.length > 0) {
        results.q3M = true;
        memoLines.push("\n[3개월 내 다녀온 병원 및 약국 이력]");
        rule1.forEach(r => memoLines.push(`- ${r.date} · ${r.hospital} · ${r.kcd} · ${r.disease}`));
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
      const rule3_matched: any[] = [];
      detailData.filter(d => getDiffDays(d.date) <= 1825 && d.treatDetails.includes("처치")).forEach(d => {
        const matched = basicData.filter(b => 
          b.date === d.date && 
          (b.hospital.substring(0, 2) === d.hospital.substring(0, 2)) && 
          b.cost >= 50000
        );
        rule3_matched.push(...matched);
      });
      const uniqueRule3 = Array.from(new Set(rule3_matched));
      if (uniqueRule3.length > 0) {
        results.q5YSurg = true;
        memoLines.push("\n[5년 내 수술 의심 (처치/수술 & 진료비 5만원↑)]");
        uniqueRule3.forEach(r => memoLines.push(`- ${r.date} · ${r.hospital} · ${r.kcd} · ${r.disease}`));
      }

      // ④ 5년 내 입원 이력
      const rule4 = basicData.filter(r => getDiffDays(r.date) <= 1825 && r.type === "입원");
      if (rule4.length > 0) {
        results.q5YHosp = true;
        memoLines.push("\n[5년 내 입원 이력]");
        rule4.forEach(r => memoLines.push(`- ${r.date} · ${r.hospital} · ${r.kcd} · ${r.disease} · ${r.days}일`));
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

      // ⑥ 5년 내 같은 약품으로 30일 이상 투약
      const rule6_rows = rxData.filter(r => getDiffDays(r.date) <= 1825);
      const r6_groups: Record<string, any[]> = {};
      rule6_rows.forEach(r => { if (!r6_groups[r.drugName]) r6_groups[r.drugName] = []; r6_groups[r.drugName].push(r); });
      let r6_found = false;
      for (const [drug, rows] of Object.entries(r6_groups)) {
        const totalDays = rows.reduce((sum, curr) => sum + curr.days, 0);
        if (totalDays >= 30) {
          results.q5Y30D = true;
          if (!r6_found) { memoLines.push("\n[5년 내 같은 약품으로 30일 이상 투약]"); r6_found = true; }
          rows.forEach(r => memoLines.push(`- ${r.date} · ${r.hospital} · ${r.drugName} · ${r.days}일`));
        }
      }

      // 최종 상태 업데이트
      const newChecklist = {
        q3Month_hospital: results.q3M,
        q1Year_same_disease: results.q1Y,
        q5Year_surgery_suspect: results.q5YSurg,
        q5Year_hospitalization: results.q5YHosp,
        q5Year_7days_visit: results.q5Y7D,
        q5Year_30days_medication: results.q5Y30D,
      };

      const newMemo = memoLines.length > 1 ? memoLines.join("\n") : "■ 분석 결과 특이사항(알릴의무 위반 소지)이 발견되지 않았습니다.";

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
    <div className="w-full flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm min-h-0">
      
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
            <p className="text-xs font-bold text-slate-700">심평원 진료내역 자동 분석</p>
            
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

          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
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
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">상세 고지 의무</p>
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
            className={`w-full flex-1 rounded-lg border p-3 text-xs text-gray-800 leading-relaxed resize-none focus:outline-none transition-colors ${isAnalyzed && medicalMemo.includes("알릴 의무 대상") ? 'border-red-300 bg-red-50/20 focus:ring-1 focus:ring-red-500' : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
            placeholder="상세 병력 사항이나 고지 의무 특이사항을 기록하세요..."
            value={medicalMemo}
            onChange={(e) => setMedicalMemo(e.target.value)}
          />
        </div>

      </div>
    </div>
  );
}