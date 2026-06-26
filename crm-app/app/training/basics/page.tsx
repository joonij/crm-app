"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

// 분리해 둔 슬라이드 컴포넌트들을 모두 불러옵니다.
import { 
  SlideIntro, SlideCh1, SlideCh2, SlideCh3, SlideCh4,
  SlideCh5, SlideCh6, SlideCh7, SlideCh8, SlideCh9,
  SlideCh10, SlideCh11, SlideCh12, SlideCh13, SlideCh14,
  SlideCh15, SlideCh16, SlideSummary
} from "./components/BasicsSlides";

export default function BasicsTrainingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 컴포넌트로 분리한 슬라이드 배열 매핑
  const slides = [
    { id: "intro", title: "", content: <SlideIntro /> },
    { id: "ch1", title: "Chapter 1. 보험사 한눈에", content: <SlideCh1 /> },
    { id: "ch2", title: "Chapter 2. 보장 흐름", content: <SlideCh2 /> },
    { id: "ch3", title: "Chapter 3. 약관 기술방식의 차이", content: <SlideCh3 /> },
    { id: "ch4", title: "Chapter 4. 실비보험", content: <SlideCh4 /> },
    { id: "ch5", title: "Chapter 5. 3대 질환 진단보험", content: <SlideCh5 /> },
    { id: "ch6", title: "Chapter 6. 4가지의 암 분류", content: <SlideCh6 /> },
    { id: "ch7", title: "Chapter 7. 생명보험사 약관 (암)", content: <SlideCh7 /> },
    { id: "ch8", title: "Chapter 8. 손해보험사 약관 (암)", content: <SlideCh8 /> },
    { id: "ch9", title: "Chapter 9. 뇌·심장질환", content: <SlideCh9 /> },
    { id: "ch10", title: "Chapter 10. 진단 vs 치료보험", content: <SlideCh10 /> },
    { id: "ch11", title: "Chapter 11. 진단보험 견적 예시", content: <SlideCh11 /> },
    { id: "ch12", title: "Chapter 12. 치료보험 견적 예시", content: <SlideCh12 /> },
    { id: "ch13", title: "Chapter 13. 수술특약 비교", content: <SlideCh13 /> },
    { id: "ch14", title: "Chapter 14. 입원일당 특약", content: <SlideCh14 /> },
    { id: "ch15", title: "Chapter 15. 사망 보장", content: <SlideCh15 /> },
    { id: "ch16", title: "Chapter 16. 손해보험사에서만 가입 가능한 필수 보험", content: <SlideCh16 /> },
    { id: "summary", title: "Summary. 오늘 꼭 기억할 것들", content: <SlideSummary /> }
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

        {/* 슬라이드 제목 */}
        {slides[currentSlide].title && (
          <div className="px-14 pt-12 pb-5 border-b border-gray-100 shrink-0">
            <h2 className="text-4xl font-black text-gray-900">{slides[currentSlide].title}</h2>
          </div>
        )}

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