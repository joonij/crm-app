"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar"; // 기존 사이드바 재사용

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 1. 모바일 화면 상단 헤더 (PC에서는 숨김) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b px-5 py-4 shrink-0 shadow-sm z-30 print:hidden">
        <span className="font-bold text-gray-900 text-lg">CRM PRO</span>
        <button onClick={() => setIsOpen(true)} className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 2. 모바일 사이드바 오버레이 (클릭 시 왼쪽에서 슬라이드 등장) */}
      <div 
        className={`fixed inset-0 z-50 flex md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* 반투명 배경 (클릭 시 닫힘) */}
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
        
        {/* 사이드바 본체 */}
        <div 
          className={`relative w-64 bg-slate-900 h-full flex flex-col transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-4 right-4 text-white z-50 p-1.5 hover:bg-white/20 rounded-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* 기존 Sidebar 컴포넌트를 그대로 렌더링! */}
          <div className="flex-1 overflow-y-auto h-full pt-2">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}