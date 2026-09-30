// app/dashboard/utils.ts

export const getLocalString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  export const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
  };
  
  export const calculateDDay = (targetDateStr: string | null) => {
    if (!targetDateStr) return null;
    let cleanStr = targetDateStr.replace(/\./g, '-').replace(/\s/g, '');
    if (cleanStr.endsWith('-')) cleanStr = cleanStr.slice(0, -1);
    const target = parseLocalDate(cleanStr);
    if (isNaN(target.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  export const calculateSangryungDDay = (birthDateStr: string | null) => {
    if (!birthDateStr) return null;
    let cleanStr = birthDateStr.replace(/\./g, '-').replace(/\s/g, '');
    if (cleanStr.endsWith('-')) cleanStr = cleanStr.slice(0, -1);
    const birth = parseLocalDate(cleanStr);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let sangryung = new Date(today.getFullYear(), birth.getMonth() + 6, birth.getDate());
    if (sangryung.getTime() < today.getTime()) {
      sangryung = new Date(today.getFullYear() + 1, birth.getMonth() + 6, birth.getDate());
    }
    return Math.ceil((sangryung.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  export const formatMoney = (val: number) => {
    if (val === 0) return "0원";
    if (val >= 100000000) return `${(val / 100000000).toFixed(2).replace(/\.00$/, '')}억원`;
    return `${val.toLocaleString()}원`;
  };
  
  export const formatAmtShort = (val: number) => {
    if (val === 0) return "0";
    if (val >= 10000) return `${Math.round(val / 10000)}만`;
    return val.toLocaleString();
  };
  
  export const getMonthString = (offsetMonths: number = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() - offsetMonths);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };
  
  export const getRetouchTheme = (days: number) => {
    if (days >= 180) return { bg: "bg-rose-100", text: "text-rose-700", label: "180일+" };
    if (days >= 90) return { bg: "bg-orange-100", text: "text-orange-700", label: "90일+" };
    if (days >= 60) return { bg: "bg-amber-100", text: "text-amber-700", label: "60일+" };
    return { bg: "bg-blue-100", text: "text-blue-700", label: "30일+" };
  };
  
  export const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-slate-50 text-slate-500 border-slate-200";
    if (status.includes("미진행")) return "bg-slate-50 text-slate-400 border-slate-200 font-medium";
    if (status.includes("거절")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (status.includes("보류")) return "bg-gray-100 text-gray-500 border-gray-200";
    if (status.includes("계약") || status.includes("증권") || status.includes("청약 완료")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status.includes("픽스") || status.includes("TA")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (status.includes("진행") || status.includes("작성") || status.includes("비교")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };