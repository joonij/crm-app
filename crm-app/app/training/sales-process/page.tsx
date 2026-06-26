"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

// 분리해 둔 슬라이드 컴포넌트들을 모두 불러옵니다.
import { 
  Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9, Slide10, 
  Slide11, Slide12, Slide13, Slide14, Slide15, Slide16, Slide17, Slide18, Slide19, 
  Slide20, Slide21, Slide22 
} from "./components/SalesProcessSlides";

export default function SalesProcessTrainingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 컴포넌트로 분리한 슬라이드 배열 매핑
  const slides = [
    { id: "s1", title: "", content: <Slide1 /> },
    { id: "s2", title: "", content: <Slide2 /> },
    { id: "s3", title: "", content: <Slide3 /> },
    { id: "s4", title: "", content: <Slide4 /> },
    { id: "s5", title: "", content: <Slide5 /> },
    { id: "s6", title: "", content: <Slide6 /> },
    { id: "s7", title: "", content: <Slide7 /> },
    { id: "s8", title: "", content: <Slide8 /> },
    { id: "s9", title: "", content: <Slide9 /> },
    { id: "s10", title: "", content: <Slide10 /> },
    { id: "s11", title: "", content: <Slide11 /> },
    { id: "s12", title: "", content: <Slide12 /> },
    { id: "s13", title: "", content: <Slide13 /> },
    { id: "s14", title: "", content: <Slide14 /> },
    { id: "s15", title: "", content: <Slide15 /> },
    { id: "s16", title: "", content: <Slide16 /> },
    { id: "s17", title: "", content: <Slide17 /> },
    { id: "s18", title: "", content: <Slide18 /> },
    { id: "s19", title: "", content: <Slide19 /> },
    { id: "s20", title: "", content: <Slide20 /> },
    { id: "s21", title: "", content: <Slide21 /> },
    { id: "s22", title: "", content: <Slide22 /> }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? prev : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? prev : prev - 1));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <Link href="/training" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-bold text-lg">
          <ArrowLeft className="w-6 h-6 mr-2" />
          교육 목차로 돌아가기
        </Link>
        <div className="text-base font-black text-blue-700 bg-blue-50 px-6 py-2.5 rounded-full shadow-sm border border-blue-100">
          Slide {currentSlide + 1} / {slides.length}
        </div>
      </div>

      <div className="relative bg-white rounded-[2rem] border border-gray-200 shadow-2xl h-[780px] flex flex-col overflow-hidden">
        
        {/* 상단 진행률 바 */}
        <div 
          className="absolute top-0 left-0 h-2 bg-blue-600 transition-all duration-500 ease-out z-10" 
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} 
        />

        {/* 슬라이드 본문 */}
        <div className="flex-1 px-14 py-8 bg-white overflow-hidden">
          {slides[currentSlide].content}
        </div>

        {/* 하단 네비게이션 */}
        <div className="px-12 py-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm shrink-0">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center px-6 py-3 text-base font-black text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> 이전 슬라이드
          </button>
          
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center px-6 py-3 text-base font-black text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            다음 슬라이드 <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}