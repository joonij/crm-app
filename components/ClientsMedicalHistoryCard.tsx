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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const pagePromises = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      pagePromises.push(
        pdf.getPage(i).then(async (page) => {
          const textContent = await page.getTextContent();
          return textContent.items.map((item: any) => item.str).join(" ");
        })
      );
    }
    
    const pagesText = await Promise.all(pagePromises);
    return pagesText.join(" ").replace(/\n/g, " ");
  };

  // ⭐️ 공통 DB 저장 로직: 수동 저장과 자동 저장 모두 이 함수를 사용합니다.
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

      let totalPages = 0;
      const loadedPdfs = [];
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        totalPages += pdf.numPages;
        loadedPdfs.push(pdf);
      }

      let processedPages = 0;
      const pagePromises: Promise<string>[] = [];

      for (const pdf of loadedPdfs) {
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = pdf.getPage(i).then(async (page) => {
            const textContent = await page.getTextContent();
            const text = textContent.items.map((item: any) => item.str).join(" ");
            
            processedPages++;
            setProgress(Math.round((processedPages / totalPages) * 80)); 
            return text;
          });
          pagePromises.push(p);
        }
      }

      const pagesText = await Promise.all(pagePromises);
      const combinedText = pagesText.join(" ").replace(/\n/g, " ");
      const textNoSpace = combinedText.replace(/\s/g, '');
      const today = new Date();

      const getDiffDays = (dateStr: string) => {
        const treatDate = new Date(dateStr);
        return (today.getTime() - treatDate.getTime()) / (1000 * 60 * 60 * 24);
      };

      const basicData: any[] = [];
      const detailData: any[] = [];
      const rxData: any[] = [];

      const basicRx = /(?:(\d{4}-\d{2}-\d{2})\s*\|?\s*(\d+)|(\d+)\s*\|?\s*(\d{4}-\d{2}-\d{2}))\s*\|?\s*((?:(?!(?:\s+|\|)+(?:외래|입원|해당없음)(?:\s+|\|)+[A-Za-z0-9\$\.]+)[\s\S])+?)(?:\s+|\|)+(외래|입원|해당없음)(?:\s+|\|)+([A-Za-z0-9\$\.]+)\s*\|?\s*([^|]+?)(?:\s+|\|)+([\d,]+)(?:\s+|\|)+([\d,]+)(?:\s+|\|)+([\d,]+)(?:(?:\s+|\|)+([\d,]+))?/g;
      const detailRx = /(?:(\d{4}-\d{2}-\d{2})\s*\|?\s*(\d+)|(\d+)\s*\|?\s*(\d{4}-\d{2}-\d{2}))\s*\|?\s*([가-힣a-zA-Z0-9\s]+?(?:과의원|과\s*의원|과병원|과\s*병원|의원|약국|병원|한의원|센터|보건소|의료원|과))\s*\|?\s*((?:(?!\d{4}-\d{2}-\d{2})[\s\S])+?)(?:\s+|\|)+(\d+(?:\.\d+)?)(?:\s+|\|)+(\d+)(?:\s+|\|)+(\d+)/g;

      await new Promise(resolve => setTimeout(resolve, 50));

      let match;
      
      while ((match = basicRx.exec(combinedText)) !== null) {
        let date = match[1] || match[4];
        let middleText = match[5];
        let inOut = match[6];
        let kcd = match[7];
        let disease = match[8].trim();
        let num1 = match[9];
        
        let extractMatch = middleText.match(/^(.*?(?:의원|병원|약국|센터|보건소|의료원|치과|한의원|대학))\s+(.*)$/);
        let hospital = extractMatch ? extractMatch[1].trim() : middleText.split(' ')[0];
        
        let totalCost = parseInt(num1.replace(/,/g, ''), 10) || 0;
        basicData.push({ date, hospital, inOut, kcd, disease, totalCost });
      }

      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 50));

      while ((match = detailRx.exec(combinedText)) !== null) {
        let date = match[1] || match[4];
        let hospital = match[5].trim();
        let middleText = match[6];
        let days = parseInt(match[9], 10) || 0;

        if (middleText.includes("처방조제") || middleText.includes("약품명") || textNoSpace.includes("심사평가원(처방)")) {
          let drugName = middleText.replace(/(외래|입원|처방\s*조제)/g, '').trim().split(' ')[0];
          rxData.push({ date, hospital, drugName, days });
        } else {
          detailData.push({ date, hospital, treatDetails: middleText.replace(/\s/g, '') });
        }
      }

      setProgress(95);

      let suspectedSurgeryKeys = new Set();
      detailData.forEach(row => {
        let diffDays = getDiffDays(row.date);
        if (diffDays <= 1825 && row.treatDetails.includes("처치및수술")) {
          suspectedSurgeryKeys.add(`${row.date}|${row.hospital}`);
        }
      });

      let results = { q3M: false, q1Y: false, q5YSurg: false, q5YHosp: false, q5Y7D: false, q5Y30D: false };
      let memoLines: string[] = ["■ 심평원 자동 분석 기반 주요 병력 (알릴 의무 대상)"];
      let kcd7DaysMap: any = {};
      let drug30DaysMap: any = {};

      basicData.forEach(row => {
        let diffDays = getDiffDays(row.date);
        let isPharm = row.hospital.includes("약국");
        
        if (diffDays <= 90 && !isPharm) {
          results.q3M = true;
          memoLines.push(`- [3개월 내] ${row.date} ${row.hospital} (${row.disease})`);
        }
        if (diffDays <= 365 && !isPharm && row.kcd) {
          results.q1Y = true;
        }
        if (diffDays <= 1825 && suspectedSurgeryKeys.has(`${row.date}|${row.hospital}`) && row.totalCost > 30000) {
          results.q5YSurg = true;
          memoLines.push(`- [5년 내 수술의심] ${row.date} ${row.hospital} (${row.disease}) / 진료비: ${row.totalCost.toLocaleString()}원`);
        }
        if (diffDays <= 1825 && row.inOut.includes("입원")) {
          results.q5YHosp = true;
          memoLines.push(`- [5년 내 입원] ${row.date} ${row.hospital} (${row.disease})`);
        }
        if (diffDays <= 1825 && !isPharm && row.kcd) {
          if (!kcd7DaysMap[row.kcd]) kcd7DaysMap[row.kcd] = { name: row.disease, count: 0 };
          kcd7DaysMap[row.kcd].count += 1;
        }
      });

      rxData.forEach(row => {
        let diffDays = getDiffDays(row.date);
        if (diffDays <= 1825) {
          if (!drug30DaysMap[row.drugName]) drug30DaysMap[row.drugName] = { days: 0 };
          drug30DaysMap[row.drugName].days += row.days;
        }
      });

      Object.keys(kcd7DaysMap).forEach(kcd => {
        if (kcd7DaysMap[kcd].count >= 7) {
          results.q5Y7D = true;
          memoLines.push(`- [5년 내 7일 이상] ${kcd7DaysMap[kcd].name} 총 ${kcd7DaysMap[kcd].count}회 통원`);
        }
      });

      Object.keys(drug30DaysMap).forEach(drug => {
        if (drug30DaysMap[drug].days >= 30) {
          results.q5Y30D = true;
          memoLines.push(`- [5년 내 30일 투약] ${drug} 총 ${drug30DaysMap[drug].days}일 처방`);
        }
      });

      // 새로 세팅할 상태 변수들
      const newChecklist = {
        q3Month_hospital: results.q3M,
        q1Year_same_disease: results.q1Y,
        q5Year_surgery_suspect: results.q5YSurg,
        q5Year_hospitalization: results.q5YHosp,
        q5Year_7days_visit: results.q5Y7D,
        q5Year_30days_medication: results.q5Y30D,
      };
      const newMemo = memoLines.length > 1 ? memoLines.join("\n") : "■ 분석 결과 특이사항(알릴의무 위반 소지)이 발견되지 않았습니다.";

      // 화면 즉각 반영
      setChecklist(newChecklist);
      setMedicalMemo(newMemo);
      
      setProgress(100); 
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      setIsAnalyzed(true);

      // ⭐️ 핵심: 분석이 끝남과 동시에 새로 만들어진 데이터를 직접 DB에 전송하여 자동 저장 처리!
      await saveToSupabase(newChecklist, newMemo);

    } catch (err: any) {
      alert(`PDF 분석 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 기존 수동 저장 버튼용 (메모를 수정하고 나서 직접 저장할 때 사용)
  const handleManualSave = () => saveToSupabase(checklist, medicalMemo);

  return (
    <div className="w-full flex h-full flex-col rounded-2xl border border-red-100 bg-white p-5 md:p-6 shadow-sm min-h-0">
      
      {/* 1. 상단 헤더 영역 (고정: shrink-0) */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Stethoscope className="h-4 w-4" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">병력 및 알릴 의무</h2>
        </div>
        
        <button 
          onClick={handleManualSave} 
          disabled={isSaving || isSaveSuccess || isAnalyzing}
          className={`flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-md transition-colors shadow-sm disabled:opacity-100 ${
            isSaveSuccess ? "bg-green-600 cursor-not-allowed" : isSaving ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : isSaveSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          {isSaving ? "저장 중..." : isSaveSuccess ? "저장 완료" : "저장"}
        </button>
      </div>

      {/* ⭐️ 2. 내부 스크롤 영역 (flex flex-col을 추가하여 내부 요소들이 공간을 나눠 갖게 함) */}
      <div className="flex-1 flex flex-col overflow-y-auto pr-1 gap-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {/* PDF 자동 분석 영역 (고정: shrink-0) */}
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

        {/* 체크리스트 영역 (고정: shrink-0) */}
        <div className="space-y-2 shrink-0">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">상세 고지 의무 (3·1·5)</p>
          {[
            { id: "q3Month_hospital", label: "3개월 내 다녀온 병원 이력 (약국 제외)" },
            { id: "q1Year_same_disease", label: "1년 내 같은 질병(코드) 병원 이력" },
            { id: "q5Year_surgery_suspect", label: "5년 내 수술 의심 (처치/수술 & 3만원↑)" },
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

        {/* ⭐️ 3. 메모 영역 (flex-1을 주어 하단 남는 공간을 모두 차지하게 함) */}
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