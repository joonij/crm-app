"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { 
  SlideIntro, SlideCh1, SlideCh2, SlideCh3, 
  SlideCh4, SlideCh5, SlideCh6, SlideCh7, SlideClosing 
} from "./components/SilbiSlides"; // 경로를 폴더 구조에 맞게 수정해주세요

export default function SilbiTrainingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 컴포넌트로 분리한 슬라이드 배열 매핑
  const slides = [
    { id: "intro", title: "", content: <SlideIntro /> },
    { id: "ch1", title: "Chapter 1. 실손의료보험 탄생 배경과 역사", content: <SlideCh1 /> },
    { id: "ch2", title: "Chapter 2. 실손의료보험 세대별 변천사", content: <SlideCh2 /> },
    { id: "ch3", title: "Chapter 3. 실비의 딜레마와 시스템의 붕괴", content: <SlideCh3 /> },
    { id: "ch4", title: "Chapter 4. 보상의 사각지대와 도수치료의 최후", content: <SlideCh4 /> },
    { id: "ch5", title: "Chapter 5. 거대 리스크의 등장과 정액보장의 당위성", content: <SlideCh5 /> },
    { id: "ch6", title: "Chapter 6. 실손보장 축소와 정액보장 포트폴리오 리빌딩 전략", content: <SlideCh6 /> },
    { id: "ch7", title: "Chapter 7. 해외사례 / 노후·간편 실손 기본", content: <SlideCh7 /> },
    { id: "ch8", title: "", content: <SlideClosing /> }
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
        <div 
          className="absolute top-0 left-0 h-2 bg-blue-600 transition-all duration-500 ease-out z-10" 
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} 
        />

        {slides[currentSlide].title && (
          <div className="px-14 pt-12 pb-5 border-b border-gray-100 shrink-0">
            <h2 className="text-4xl font-black text-gray-900">{slides[currentSlide].title}</h2>
          </div>
        )}

        <div className="flex-1 px-14 py-8 bg-white overflow-hidden">
          {slides[currentSlide].content}
        </div>

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